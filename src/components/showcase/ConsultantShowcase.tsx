import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Filter,
  SlidersHorizontal,
  Heart,
  ShieldCheck,
  Zap,
  X,
  Star,
  Award,
  DollarSign,
  Compass,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
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

type PriceRange = 'all' | 'under_35' | '35_to_45' | 'above_45';
type ThemeFocus = 'all' | 'amor' | 'carreira' | 'espiritualidade' | 'familia';
type ExperienceLevel = 'all' | '5' | '10' | '15';

const THEME_KEYWORDS: Record<Exclude<ThemeFocus, 'all'>, string[]> = {
  amor: ['amor', 'afetiv', 'casal', 'relacionamento', 'sinastria', 'coração', 'paixão'],
  carreira: ['carreira', 'trabalho', 'finanç', 'dinheiro', 'profissional', 'negócio', 'sucesso'],
  espiritualidade: ['espiritual', 'proteção', 'luz', 'energia', 'ancestral', 'guia', 'cura', 'mediún'],
  familia: ['família', 'filhos', 'lar', 'harmonia', 'convívio', 'paz'],
};

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
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'consultations' | 'experience'>('rating');

  // Advanced Filters
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('all');
  const [themeFocus, setThemeFocus] = useState<ThemeFocus>('all');

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

  const handleResetAllFilters = () => {
    setSearchTerm('');
    handleOracleChange('all');
    setStatusFilter('all');
    setPriceRange('all');
    setMinRating(0);
    setExperienceLevel('all');
    setThemeFocus('all');
    setSortBy('rating');
  };

  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (priceRange !== 'all') count++;
    if (minRating > 0) count++;
    if (experienceLevel !== 'all') count++;
    if (themeFocus !== 'all') count++;
    return count;
  }, [priceRange, minRating, experienceLevel, themeFocus]);

  const hasAnyActiveFilter = useMemo(() => {
    return (
      searchTerm.trim().length > 0 ||
      selectedOracle !== 'all' ||
      statusFilter !== 'all' ||
      activeAdvancedCount > 0
    );
  }, [searchTerm, selectedOracle, statusFilter, activeAdvancedCount]);

  const filteredConsultants = useMemo(() => {
    const normalizedFilter = selectedOracle !== 'all' ? normalizarOracleProfileId(selectedOracle) : null;
    const lowerSearch = searchTerm.toLowerCase().trim();

    return consultants
      .filter((c) => {
        // Search term filter (name, bio, title, specialties)
        const matchesSearch =
          !lowerSearch ||
          c.name.toLowerCase().includes(lowerSearch) ||
          c.bio.toLowerCase().includes(lowerSearch) ||
          c.title.toLowerCase().includes(lowerSearch) ||
          (c.specialties || []).some((s) => s.toLowerCase().includes(lowerSearch));

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

        // Price range filter
        let matchesPrice = true;
        if (priceRange === 'under_35') {
          matchesPrice = c.pricePerMinute <= 3.50;
        } else if (priceRange === '35_to_45') {
          matchesPrice = c.pricePerMinute > 3.50 && c.pricePerMinute <= 4.50;
        } else if (priceRange === 'above_45') {
          matchesPrice = c.pricePerMinute > 4.50;
        }

        // Minimum Rating filter
        const matchesRating = minRating === 0 || c.rating >= minRating;

        // Experience Level filter
        let matchesExperience = true;
        const years = c.experienceYears || 0;
        if (experienceLevel === '5') {
          matchesExperience = years >= 5;
        } else if (experienceLevel === '10') {
          matchesExperience = years >= 10;
        } else if (experienceLevel === '15') {
          matchesExperience = years >= 15;
        }

        // Theme Focus filter
        let matchesTheme = true;
        if (themeFocus !== 'all') {
          const keywords = THEME_KEYWORDS[themeFocus] || [];
          const combinedText = `${c.bio} ${c.title}`.toLowerCase();
          matchesTheme = keywords.some((kw) => combinedText.includes(kw));
        }

        return (
          matchesSearch &&
          matchesOracle &&
          matchesStatus &&
          matchesPrice &&
          matchesRating &&
          matchesExperience &&
          matchesTheme
        );
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price_asc') return a.pricePerMinute - b.pricePerMinute;
        if (sortBy === 'consultations') return b.totalConsultations - a.totalConsultations;
        if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
        return 0;
      });
  }, [
    consultants,
    searchTerm,
    selectedOracle,
    statusFilter,
    priceRange,
    minRating,
    experienceLevel,
    themeFocus,
    sortBy,
    favoriteIds,
  ]);

  return (
    <div className="space-y-8 pb-12" id="consultant-showcase-section">
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
          Consulte os melhores oraculistas do Brasil em tempo real pelo Chat Seguro. Tarot, Baralho Cigano, Astrologia e Búzios para guiar seus próximos passos.
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

      {/* Advanced Filter & Search Hub */}
      <div className="space-y-4" id="advanced-search-hub">
        {/* Search Input, Quick Filters & Sort Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search-consultants-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por oraculista, especialidade, bio ou assunto..."
              className="w-full pl-11 pr-10 py-3.5 glass-card border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-all shadow-md"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Status Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('online')}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'online'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full status-online" />
              Online Agora
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('favorites')}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'favorites'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              Favoritos ({favoriteIds.length})
            </button>
          </div>

          {/* Advanced Filter Drawer Trigger */}
          <button
            type="button"
            id="toggle-advanced-filters-btn"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              isAdvancedOpen || activeAdvancedCount > 0
                ? 'bg-amber-500/20 border border-amber-500/50 text-[#d4af37]'
                : 'glass-card border border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros Avançados</span>
            {activeAdvancedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#d4af37] text-black text-[10px] font-black leading-none">
                {activeAdvancedCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 gold-accent hidden sm:block" />
            <select
              id="sort-consultants-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-3 glass-card border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-[#d4af37] bg-[#050508] cursor-pointer"
            >
              <option value="rating">Maior Avaliação</option>
              <option value="price_asc">Menor Preço/Minuto</option>
              <option value="consultations">Mais Atendimentos</option>
              <option value="experience">Mais Experiência</option>
            </select>
          </div>
        </div>

        {/* Oracle Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => handleOracleChange('all')}
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
              type="button"
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

        {/* Advanced Filters Expandable Drawer */}
        {isAdvancedOpen && (
          <div
            id="advanced-filters-panel"
            className="p-5 rounded-2xl glass-card border border-amber-500/30 bg-[#0e0e18]/90 space-y-5 shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 gold-accent" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  Filtros Detalhados de Busca
                </h3>
              </div>
              {activeAdvancedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange('all');
                    setMinRating(0);
                    setExperienceLevel('all');
                    setThemeFocus('all');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Redefinir Filtros Detalhados
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Filter: Faixa de Preço */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-price-select"
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 gold-accent" />
                  Valor por Minuto
                </label>
                <select
                  id="filter-price-select"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as PriceRange)}
                  className="w-full px-3 py-2.5 rounded-xl glass-card border border-white/10 text-xs text-white bg-[#050508] focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">Todas as faixas</option>
                  <option value="under_35">Até R$ 3,50/min</option>
                  <option value="35_to_45">R$ 3,51 a R$ 4,50/min</option>
                  <option value="above_45">Acima de R$ 4,50/min</option>
                </select>
              </div>

              {/* Filter: Avaliação Mínima */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-rating-select"
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Avaliação Mínima
                </label>
                <select
                  id="filter-rating-select"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl glass-card border border-white/10 text-xs text-white bg-[#050508] focus:border-[#d4af37] focus:outline-none"
                >
                  <option value={0}>Qualquer avaliação</option>
                  <option value={4.5}>★ 4.5 ou superior</option>
                  <option value={4.8}>★ 4.8 ou superior</option>
                  <option value={4.9}>★ 4.9 ou superior</option>
                </select>
              </div>

              {/* Filter: Experiência Mínima */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-experience-select"
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  Tempo de Prática
                </label>
                <select
                  id="filter-experience-select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full px-3 py-2.5 rounded-xl glass-card border border-white/10 text-xs text-white bg-[#050508] focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">Qualquer experiência</option>
                  <option value="5">5+ anos de tradição</option>
                  <option value="10">10+ anos de tradição</option>
                  <option value="15">15+ anos de maestria</option>
                </select>
              </div>

              {/* Filter: Foco da Questão */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-theme-select"
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  Tema da Consulta
                </label>
                <select
                  id="filter-theme-select"
                  value={themeFocus}
                  onChange={(e) => setThemeFocus(e.target.value as ThemeFocus)}
                  className="w-full px-3 py-2.5 rounded-xl glass-card border border-white/10 text-xs text-white bg-[#050508] focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="all">Todos os temas</option>
                  <option value="amor">Amor & Relacionamentos</option>
                  <option value="carreira">Carreira & Finanças</option>
                  <option value="espiritualidade">Espiritualidade & Luz</option>
                  <option value="familia">Família & Harmonia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary Bar */}
        {hasAnyActiveFilter && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mr-1">
              Filtros ativos:
            </span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">
                <span>Busca: "{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedOracle !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span>Oráculo: {ORACLE_CATEGORIES[selectedOracle as OracleType]?.name || selectedOracle}</span>
                <button
                  type="button"
                  onClick={() => handleOracleChange('all')}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span>Status: {statusFilter === 'online' ? 'Online Agora' : 'Favoritos'}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">
                <span>
                  Preço:{' '}
                  {priceRange === 'under_35'
                    ? 'Até R$ 3,50'
                    : priceRange === '35_to_45'
                    ? 'R$ 3,51 a R$ 4,50'
                    : 'Acima de R$ 4,50'}
                </span>
                <button
                  type="button"
                  onClick={() => setPriceRange('all')}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span>Avaliação: ★ {minRating}+</span>
                <button
                  type="button"
                  onClick={() => setMinRating(0)}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {experienceLevel !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
                <span>Experiência: {experienceLevel}+ anos</span>
                <button
                  type="button"
                  onClick={() => setExperienceLevel('all')}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {themeFocus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                <span>Tema: {themeFocus}</span>
                <button
                  type="button"
                  onClick={() => setThemeFocus('all')}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium ml-1 cursor-pointer"
            >
              Limpar todos
            </button>
          </div>
        )}

        {/* Results Counter Header */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Mostrando <strong className="text-white">{filteredConsultants.length}</strong> de{' '}
              <strong className="text-white">{consultants.length}</strong> oraculistas credenciados
            </span>
          </div>

          <div className="text-[11px] text-gray-500 hidden sm:block">
            Atendimento imediato e seguro
          </div>
        </div>
      </div>

      {/* Consultants Grid */}
      {filteredConsultants.length === 0 ? (
        <div
          id="no-consultants-empty-state"
          className="p-12 text-center glass-card border border-white/10 rounded-3xl space-y-4 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-[#d4af37]">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-serif font-light text-[#d4af37]">
              Nenhum oraculista atende aos critérios selecionados
            </p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Tente suavizar os filtros de preço, avaliação ou alterar o termo de busca para encontrar outros especialistas da nossa comunidade.
            </p>
          </div>
          <button
            type="button"
            id="clear-filters-empty-btn"
            onClick={handleResetAllFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] text-black font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Todos os Filtros
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
