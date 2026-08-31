import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Filter, SlidersHorizontal, Heart, ShieldCheck, Zap } from 'lucide-react';
import { useConsultation } from '../../context/ConsultationContext';
import { useAuth } from '../../context/AuthContext';
import { Consultant, OracleType } from '../../types';
import { ConsultantCard } from '../ConsultantCard';
import { ORACLE_CATEGORIES } from '../../data/oracleConfig';
import { normalizarOracleProfileId } from '../../oracle-engine';

interface Props {
  selectedOracleCategory?: string | null;
  onSelectOracleCategory?: (category: string | null) => void;
  onSelectConsultant: (consultant: Consultant) => void;
  onStartConsultation: (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => void;
}

export const ConsultantShowcase: React.FC<Props> = ({
  selectedOracleCategory,
  onSelectOracleCategory,
  onSelectConsultant,
  onStartConsultation,
}) => {
  const { consultants } = useConsultation();
  const { user } = useAuth();

  const favoriteIds = Array.isArray(user?.favorites) ? user.favorites : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOracle, setSelectedOracle] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'consultations'>('rating');

  useEffect(() => {
    if (selectedOracleCategory) {
      setSelectedOracle(selectedOracleCategory);
    }
  }, [selectedOracleCategory]);

  const handleOracleChange = (newOracle: string) => {
    setSelectedOracle(newOracle);
    if (onSelectOracleCategory) {
      onSelectOracleCategory(newOracle === 'all' ? null : newOracle);
    }
  };

  const filteredConsultants = useMemo(() => {
    const normalizedFilter = selectedOracle !== 'all' ? normalizarOracleProfileId(selectedOracle) : null;

    return consultants
      .filter((c) => {
        // Search term filter
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Oracle category filter using normalization
        const consultantOracles = [
          ...(c.specialties || []),
          ...(c.allowedOracles || []),
          ...(c.authorizedOracles || []),
        ]
          .map((o) => normalizarOracleProfileId(o))
          .filter(Boolean);

        const matchesOracle = !normalizedFilter || consultantOracles.includes(normalizedFilter);

        // Status / Favorites filter
        let matchesStatus = true;
        if (statusFilter === 'online') {
          matchesStatus = c.status === 'online' || c.status === 'busy';
        } else if (statusFilter === 'favorites') {
          matchesStatus = favoriteIds.includes(c.id);
        }

        return matchesSearch && matchesOracle && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price_asc') return a.pricePerMinute - b.pricePerMinute;
        if (sortBy === 'consultations') return b.totalConsultations - a.totalConsultations;
        return 0;
      });
  }, [
    consultants,
    searchTerm,
    selectedOracle,
    statusFilter,
    sortBy,
    favoriteIds,
  ]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section - Mystical Gradient */}
      <section className="mystical-gradient flex flex-col items-center justify-center py-12 sm:py-16 px-6 sm:px-10 text-center rounded-3xl glass-card border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative mb-6 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <img
            src="/brand/logo-oraculos.png?v=20260831b"
            alt="ORACULOS.TS Logo Oficial"
            width="96"
            height="96"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://portalvipbrasil.com.br/wp-content/uploads/2026/07/logo-oraculos.png';
            }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl border border-[#d4af37]/40 shadow-2xl bg-[#06060c]/90 p-1.5"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-[#d4af37] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          Marketplace de Oraculistas Credenciados
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight mb-4 tracking-wide max-w-4xl">
          Conecte-se com a Sabedoria <span className="italic gold-accent">Ancestral</span>
        </h1>

        <p className="max-w-2xl text-sm sm:text-base text-gray-400 font-light leading-relaxed mb-6">
          Consulte os melhores oraculistas do Brasil em tempo real por Chat ou Chamada de Vídeo. Tarot, Baralho Cigano, Astrologia e Búzios para guiar seus próximos passos.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Atendimento 100% Sigiloso</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 gold-accent" />
            <span>Cobrança Transparente por Minuto</span>
          </div>
        </div>
        <a
          href="/trabalhe-conosco"
          className="mt-7 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-amber-500/20 hover:from-amber-300 transition-all"
        >
          Trabalhe Conosco — Cadastre-se
        </a>
      </section>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Search Input & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do consultor, especialidade ou palavra-chave..."
              className="w-full pl-11 pr-4 py-3 glass-card border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-all shadow-md"
            />
          </div>

          {/* Quick Status Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('online')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'online'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full status-online" />
              Online Agora
            </button>
            <button
              onClick={() => setStatusFilter('favorites')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'favorites'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              Favoritos ({favoriteIds.length})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 gold-accent hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2.5 glass-card border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-[#d4af37] bg-[#050508]"
            >
              <option value="rating">Maior Avaliação</option>
              <option value="price_asc">Menor Preço/Minuto</option>
              <option value="consultations">Mais Atendimentos</option>
            </select>
          </div>
        </div>

        {/* Oracle Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedOracle('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedOracle === 'all'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'glass-card border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            Todos os Oráculos
          </button>

          {Object.values(ORACLE_CATEGORIES).map((cat) => (
            <button
              key={cat.type}
              onClick={() => handleOracleChange(cat.type)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedOracle === cat.type
                  ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] shadow-md'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 gold-accent" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Consultants Grid */}
      {filteredConsultants.length === 0 ? (
        <div className="p-12 text-center glass-card border border-white/10 rounded-3xl space-y-3">
          <p className="text-lg font-bold text-[#d4af37]">Nenhum consultor encontrado</p>
          <p className="text-xs text-gray-400">
            Tente mudar o termo de busca ou limpar os filtros de categoria.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              handleOracleChange('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-xl uppercase tracking-wider"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredConsultants.map((consultant) => (
            <ConsultantCard
              key={consultant.id}
              consultant={consultant}
              activeOracle={selectedOracle !== 'all' ? (selectedOracle as OracleType) : undefined}
              onSelect={onSelectConsultant}
              onStartConsultation={onStartConsultation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
