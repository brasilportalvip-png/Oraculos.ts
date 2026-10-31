import React from 'react';
import { ArrowLeft, Shield, FileText, Lock, RefreshCw, CheckCircle, Scale } from 'lucide-react';
import { SEOHead } from './SEOHead';

import { LEGAL_DOCS, type LegalDocType } from '../data/legalDocs';

export type { LegalDocType };

interface LegalPageProps {
  type: LegalDocType;
  onBack: () => void;
  onNavigateDoc: (doc: LegalDocType) => void;
}


export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack, onNavigateDoc }) => {
  const doc = LEGAL_DOCS[type] || LEGAL_DOCS.termos;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-16">
      <SEOHead
        title={doc.title}
        description={doc.subtitle}
        canonicalPath={doc.canonical}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: doc.h1,
          description: doc.subtitle,
          publisher: {
            '@type': 'Organization',
            name: 'ORACULOS.TS',
            url: 'https://oraculos-ts.vercel.app',
          },
        }}
      />

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-white/10 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Plataforma
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigateDoc('termos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'termos' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Termos
          </button>
          <button
            onClick={() => onNavigateDoc('privacidade')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'privacidade' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Privacidade LGPD
          </button>
          <button
            onClick={() => onNavigateDoc('cookies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'cookies' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Cookies
          </button>
          <button
            onClick={() => onNavigateDoc('reembolso')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'reembolso' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Reembolso
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-[#150F26] border border-purple-800/40 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          Documento Jurídico Oficial
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-white leading-tight">
          {doc.h1}
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
          {doc.subtitle}
        </p>
        <div className="text-[11px] font-mono text-purple-300/70 pt-1">
          Última atualização: {doc.lastUpdated}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {doc.sections.map((section, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-[#150F26]/60 border border-purple-900/40 space-y-3"
          >
            <h2 className="font-serif text-lg sm:text-xl font-light text-amber-200">
              {section.title}
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
