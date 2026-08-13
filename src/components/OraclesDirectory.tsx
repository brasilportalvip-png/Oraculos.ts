import React from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';
import { OracleType } from '../types';

interface Props {
  onSelectOracleCategory: (oracle: OracleType) => void;
}

export const OraclesDirectory: React.FC<Props> = ({ onSelectOracleCategory }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 gold-accent text-xs font-bold uppercase tracking-widest">
          <Compass className="w-4 h-4 gold-accent" />
          Arquitetura Modular de Oráculos
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">Métodos Oraculares Suportados</h1>
        <p className="text-xs sm:text-sm text-gray-400 font-light">
          Nossa plataforma foi desenvolvida para abrigar as tradições divinatórias mais respeitadas do mundo com total suporte e segurança.
        </p>
      </div>

      {/* Grid of Oracle Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(ORACLE_CATEGORIES).map((cat) => (
          <div
            key={cat.type}
            onClick={() => onSelectOracleCategory(cat.type)}
            className="group relative glass-card border border-white/10 hover:border-[#d4af37]/60 rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between overflow-hidden hover:bg-white/[0.05]"
          >
            {/* Background Gradient Accent */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${cat.bgGradient} opacity-20 blur-2xl pointer-events-none group-hover:scale-150 transition-transform`} />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 gold-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Oráculo Ativo
                </span>
              </div>

              <h3 className="font-serif text-2xl font-light text-white group-hover:text-[#d4af37] transition-colors">
                {cat.name}
              </h3>

              <p className="text-xs text-gray-400 leading-relaxed font-light">
                {cat.shortDesc}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider gold-accent group-hover:text-white">
              <span>Ver Consultores Credenciados</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
