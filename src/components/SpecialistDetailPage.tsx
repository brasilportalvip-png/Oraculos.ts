import React from 'react';
import { ArrowLeft, Star, ShieldCheck, Clock, MessageSquare, Video, Calendar, Sparkles } from 'lucide-react';
import { Consultant, OracleType } from '../types';
import { SEOHead } from './SEOHead';
import { NotFoundPage } from './NotFoundPage';

interface SpecialistDetailPageProps {
  consultantId: string;
  consultants: Consultant[];
  onBack: () => void;
  onStartConsultation: (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => void;
}

export const SpecialistDetailPage: React.FC<SpecialistDetailPageProps> = ({
  consultantId,
  consultants,
  onBack,
  onStartConsultation,
}) => {
  const consultant = consultants.find(
    (c) => c.id === consultantId || c.name.toLowerCase().replace(/\s+/g, '-') === consultantId.toLowerCase()
  );

  if (!consultant) {
    return <NotFoundPage onGoHome={onBack} />;
  }

  const isVirtual = consultant.isVirtual;
  const canonicalUrl = `/especialistas/${consultant.id}`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <SEOHead
        title={`${consultant.name} — ${consultant.title}`}
        description={`${consultant.name}: ${consultant.bio.slice(0, 150)}... Atendimento online por chat e vídeo.`}
        canonicalPath={canonicalUrl}
        ogImage={consultant.avatar}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: consultant.name,
          jobTitle: consultant.title,
          description: consultant.bio,
          image: consultant.avatar,
          url: `https://oraculos-ts.vercel.app${canonicalUrl}`,
        }}
      />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-white/10 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos Especialistas
      </button>

      {/* Specialist Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#150F26] border border-purple-800/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <img
              src={consultant.avatar}
              alt={consultant.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl"
            />
            <span
              className={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                consultant.status === 'online'
                  ? 'bg-emerald-500 text-black'
                  : consultant.status === 'busy'
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {consultant.status}
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-white">
                {consultant.name}
              </h1>
              {isVirtual && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Atendente Virtual IA
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#d4af37] font-medium">
              {consultant.title}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                {consultant.rating.toFixed(1)}
                <span className="text-gray-400 font-normal">({consultant.totalReviews} avaliações)</span>
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">{consultant.totalConsultations} consultas</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">{consultant.experienceYears} anos de vivência</span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-black/40 p-4 rounded-2xl border border-white/5 w-full sm:w-auto">
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Valor por minuto</div>
            <div className="text-2xl font-black text-white font-mono">
              R$ {consultant.pricePerMinute.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Bio & Specialties */}
        <div className="space-y-4 pt-4 border-t border-purple-900/40">
          <h2 className="font-serif text-lg font-light text-amber-200">Apresentação & Filosofia de Atendimento</h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            {consultant.bio}
          </p>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Especialidades Oraculares</span>
            <div className="flex flex-wrap gap-2">
              {consultant.specialties.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-purple-950/60 border border-purple-700/50 rounded-full text-xs text-purple-200"
                >
                  ✓ {spec.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => onStartConsultation(consultant, (consultant.specialties[0] as OracleType) || 'tarot', 'chat')}
            className="flex-1 py-3 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Iniciar Consulta por Chat Seguro
          </button>
          <button
            onClick={() => onStartConsultation(consultant, (consultant.specialties[0] as OracleType) || 'tarot', 'video')}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 border border-white/10 transition-colors"
          >
            <Video className="w-4 h-4 text-purple-400" />
            Iniciar Atendimento por Vídeo
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      {consultant.reviews && consultant.reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-light text-white">Avaliações Verificadas de Consulentes</h3>
          <div className="space-y-3">
            {consultant.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-[#150F26]/60 border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rev.clientName}</span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}</span>
                    <span className="text-gray-500 ml-2 text-[10px]">{rev.date}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 font-light leading-relaxed">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
