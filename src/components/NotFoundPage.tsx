import React from 'react';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { SEOHead } from './SEOHead';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="py-16 text-center max-w-xl mx-auto space-y-6">
      <SEOHead
        title="Página Não Encontrada (Erro 404)"
        description="A página solicitada não foi encontrada ou foi movida no portal ORACULOS.TS."
        canonicalPath="/404"
      />

      <div className="w-20 h-20 mx-auto rounded-full bg-purple-900/30 border border-purple-500/40 flex items-center justify-center text-amber-400">
        <Sparkles className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="text-amber-400 font-mono text-sm font-bold uppercase tracking-widest">
          Erro 404 — Mistério Cósmico
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
          Caminho Não Encontrado
        </h1>
        <p className="text-sm text-gray-400 font-light leading-relaxed">
          O oráculo vasculhou os registros ancestrais, mas esta coordenada não existe no mapa sagrado da plataforma.
        </p>
      </div>

      <div className="pt-4 flex justify-center gap-3">
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <Home className="w-4 h-4" />
          Retornar à Página Inicial
        </button>
      </div>
    </div>
  );
};
