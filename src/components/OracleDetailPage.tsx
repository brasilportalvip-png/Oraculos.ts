import React from 'react';
import { ArrowLeft, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';
import { Consultant, OracleType } from '../types';
import { canonicalOracleSlug, oracleTypeFromSlug } from '../routing/routes';
import { SEOHead } from './SEOHead';
import { ORACLE_DESCRIPTIONS } from '../data/oracleDescriptions';
import { seoOraculo, breadcrumbJsonLd, faqJsonLd } from '../seo/yoast';
import { ConsultantCard } from './ConsultantCard';
import { NotFoundPage } from './NotFoundPage';

interface OracleDetailPageProps {
  oracleId: string;
  consultants: Consultant[];
  onBack: () => void;
  onSelectConsultant: (consultant: Consultant) => void;
  onStartConsultation: (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => void;
}


export const OracleDetailPage: React.FC<OracleDetailPageProps> = ({
  oracleId,
  consultants,
  onBack,
  onSelectConsultant,
  onStartConsultation,
}) => {
  const canonicalSlug = canonicalOracleSlug(oracleId) || oracleId.toLowerCase().replace(/\s+/g, '-');
  const details = ORACLE_DESCRIPTIONS[canonicalSlug] || ORACLE_DESCRIPTIONS[oracleId.toLowerCase()];

  if (!details) {
    return <NotFoundPage onGoHome={onBack} />;
  }

  const oracleType = oracleTypeFromSlug(canonicalSlug) || 'tarot';
  const oracleConfig = ORACLE_CATEGORIES[oracleType] || ORACLE_CATEGORIES.tarot;

  // Authorized consultants only.
  const matchingConsultants = consultants.filter((consultant) => {
    const authorizedOracles =
      consultant.allowedOracles && consultant.allowedOracles.length > 0
        ? consultant.allowedOracles
        : consultant.specialties || [];

    return authorizedOracles.some(
      (oracle) => canonicalOracleSlug(String(oracle)) === canonicalSlug
    );
  });

  const displayConsultants = matchingConsultants;
  const seoDoOraculo = seoOraculo(String(details.canonical || '').split('/').pop() || '');

  return (
    <div className="space-y-10 pb-16">
      <SEOHead
        title={seoDoOraculo?.titulo || details.title}
        description={seoDoOraculo?.descricao || details.subtitle}
        keywords={seoDoOraculo?.palavraChave}
        canonicalPath={details.canonical}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: details.h1,
            serviceType: seoDoOraculo?.palavraChave || details.title,
            description: seoDoOraculo?.descricao || details.subtitle,
            provider: {
              '@type': 'Organization',
              name: 'ORACULOS.TS',
              url: 'https://oraculos-ts.vercel.app',
            },
            areaServed: 'BR',
            availableLanguage: 'pt-BR',
          },
          breadcrumbJsonLd([
            { nome: 'Oráculos', caminho: '/oraculos' },
            { nome: seoDoOraculo?.nome || details.h1, caminho: details.canonical },
          ]),
          ...(seoDoOraculo ? [faqJsonLd(seoDoOraculo.faq)] : []),
        ]}
      />

      {/* Navigation breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar a Todos os Oráculos
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1F1638]/80 to-[#0B0813] border border-purple-800/40 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Motor Oracular Oficial ORACULOS.TS
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
            {details.h1}
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            {details.subtitle}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {details.elements.map((el) => (
              <span
                key={el}
                className="px-3 py-1 bg-black/40 border border-purple-700/40 rounded-full text-xs text-purple-200"
              >
                ✓ {el}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Content: History & How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#150F26]/60 border border-purple-800/30 space-y-3">
          <h2 className="font-serif text-xl font-light text-amber-200">Tradição & Origem Histórica</h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            {details.history}
          </p>
          <div className="pt-2 text-xs font-mono text-amber-400/80">
            Base Espiritual: {details.symbolsCount}
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-[#150F26]/60 border border-purple-800/30 space-y-3">
          <h2 className="font-serif text-xl font-light text-amber-200">Como Funciona a Consulta ao Vivo</h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            {details.howItWorks}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-purple-300">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Tarifação por Minuto Real</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-400" aria-hidden="true" /> Chat Seguro em tempo real</span>
          </div>
        </div>
      </div>

      {/* Dedicated Specialists Section for this Oracle */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-light text-white">
              Especialistas Disponíveis em {oracleConfig.name}
            </h2>
            <p className="text-xs text-gray-400">
              Escolha seu oraculista credenciado para um atendimento acolhedor e profundo.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
            {displayConsultants.length} Disponíveis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {displayConsultants.length > 0 ? (
    displayConsultants.map((c) => (
      <ConsultantCard
        key={c.id}
        consultant={c}
        onSelect={() => onSelectConsultant(c)}
        onStartChat={() => onStartConsultation(c, oracleType, 'chat')}
        onStartVideo={() => undefined}
      />
    ))
  ) : (
    <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-purple-800/30 bg-[#150F26]/60 p-6 text-center">
      <p className="text-sm text-gray-300">
        Nenhum consultor credenciado está disponível para este oráculo no momento.
      </p>
    </div>
  )}
</div>
      </div>
    </div>
  );
};
