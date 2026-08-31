import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquare, Video, Shield, Clock, Calendar, Sparkles } from 'lucide-react';
import { Consultant, OracleType } from '../types';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';
import { oracleTypeFromSlug } from '../routing/routes';

interface Props {
  consultant: Consultant | null;
  initialOracle?: OracleType | null;
  onClose: () => void;
  onStartConsultation: (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => void;
}

export const ConsultantProfileModal: React.FC<Props> = ({
  consultant,
  initialOracle,
  onClose,
  onStartConsultation,
}) => {
 

  const getAllowedOracles = (cons: Consultant | null): OracleType[] => {
    const source =
      cons?.allowedOracles && cons.allowedOracles.length > 0
        ? cons.allowedOracles
        : cons?.specialties || [];

    return source
      .map((oracle) => oracleTypeFromSlug(String(oracle)))
      .filter((oracle): oracle is OracleType => oracle !== null);
  };

  const computeInitialOracle = (
    cons: Consultant | null,
    initOracle?: OracleType | null
  ): OracleType => {
    const allowedOracles = getAllowedOracles(cons);

    if (initOracle && allowedOracles.includes(initOracle)) {
      return initOracle;
    }

    return allowedOracles[0] || 'tarot';
  };



  const [selectedOracle, setSelectedOracle] = useState<OracleType>(() =>
    computeInitialOracle(consultant, initialOracle)
  );

  useEffect(() => {
    setSelectedOracle(computeInitialOracle(consultant, initialOracle));
  }, [consultant?.id, initialOracle]);


  if (!consultant) return null;

  const allowedOracles = getAllowedOracles(consultant);
  const canStartConsultation = allowedOracles.includes(selectedOracle);

  return (




    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-[#150F26] border border-amber-500/30 rounded-3xl shadow-2xl overflow-y-auto text-slate-100 flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative h-32 bg-gradient-to-r from-purple-950 via-[#1F1638] to-indigo-950 p-6 flex items-end">
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="px-6 pb-6 space-y-6 -mt-12">
            {/* Consultant Main Info Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={consultant.avatar}
                alt={consultant.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[#150F26] shadow-xl"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-amber-200">{consultant.name}</h2>
                  <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-purple-300">{consultant.title}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{consultant.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({consultant.totalReviews} avaliações)</span>
                  </div>
                  <span>•</span>
                  <span><strong>{consultant.experienceYears} anos</strong> de experiência</span>
                </div>
              </div>
            </div>

            {/* Price & Schedule Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#1F1638] border border-purple-800/40 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                 <span className="block text-[10px] uppercase text-purple-300 font-semibold">
  Consumo da Carteira
</span>

<span className="text-lg font-bold text-amber-300 font-mono">
  {consultant.pricePerMinute.toFixed(2)} min do saldo
</span>

<span className="block text-[10px] text-slate-400">
  por minuto de atendimento
</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-purple-300 font-semibold">Horário Habitual</span>
                  <span className="text-xs font-semibold text-slate-200">{consultant.schedule}</span>
                </div>
              </div>
            </div>

            {/* Select Oracle Method */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                Escolha o Oráculo para esta Consulta
              </label>
              <div className="flex flex-wrap gap-2">
                {allowedOracles.map((spec) => {
                  const cat = ORACLE_CATEGORIES[spec];
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedOracle(spec)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedOracle === spec
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-[#1F1638] border border-purple-800/50 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {cat?.name || spec}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider">Sobre mim</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#1F1638]/60 p-4 rounded-xl border border-purple-900/40">
                {consultant.bio}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider">
                Depoimentos dos Clientes ({consultant.reviews.length})
              </h3>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {consultant.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-[#1F1638] border border-purple-900/40 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{rev.clientName}</span>
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                    <span className="block text-[10px] text-slate-500">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-purple-900/40 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
  if (!canStartConsultation) return;
  onClose();
  onStartConsultation(consultant, selectedOracle, 'chat');
}}
disabled={!canStartConsultation}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Iniciar Chat Agora
              </button>

              <button
disabled
                className="flex items-center justify-center gap-2 py-3 bg-[#1F1638] hover:bg-purple-900/50 border border-purple-700/50 text-purple-200 font-bold text-sm rounded-xl transition-all"
              >
                <Video className="w-4 h-4 text-amber-400" />
                Vídeo em breve
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
