import React from 'react';
import { Star, MessageSquare, Video, Heart, Shield, Clock } from 'lucide-react';
import { Consultant, OracleType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useConsultation } from '../context/ConsultationContext';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';
import { handleAvatarError, getSafeConsultantAvatar, getGenderAwareAvatarFallback } from '../utils/avatarUtils';

interface Props {
  consultant: Consultant;
  activeOracle?: OracleType;
  onSelect: (consultant: Consultant) => void;
  onStartConsultation: (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => void;
}

export const ConsultantCard: React.FC<Props> = ({
  consultant,
  activeOracle,
  onSelect,
  onStartConsultation,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const fav = isFavorite(consultant.id);

  const specialties = Array.isArray(consultant.specialties)
  ? consultant.specialties
  : [];

const allowedOracles = Array.isArray(consultant.allowedOracles)
  ? consultant.allowedOracles
  : [];

const chosenOracle: OracleType =
  activeOracle &&
  (specialties.includes(activeOracle) ||
    allowedOracles.includes(activeOracle))
    ? activeOracle
    : (specialties[0] as OracleType) ||
      (allowedOracles[0] as OracleType) ||
      'tarot';
  const getStatusBadge = () => {
    switch (consultant.status) {
      case 'online':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
            <span className="h-2 w-2 rounded-full status-online"></span> Online
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-amber-300">
            <span className="h-2 w-2 rounded-full status-busy"></span> Em Chamada
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="h-2 w-2 rounded-full bg-gray-500"></span> Offline
          </span>
        );
    }
  };

  return (
    <div className="glass-card flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 border-b-4 border-b-transparent hover:border-b-[#d4af37] hover:bg-white/[0.05] group">
      <div className="space-y-4">
        {/* Relative Avatar Container */}
        <div className="relative mb-2">
          <div
            onClick={() => onSelect(consultant)}
            className="h-44 w-full rounded-xl overflow-hidden cursor-pointer relative bg-gray-900 border border-white/10"
          >
            <img
              src={getSafeConsultantAvatar(consultant.avatar, consultant.name)}
              alt={consultant.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => handleAvatarError(e, getGenderAwareAvatarFallback(consultant.name))}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-3 left-3">
            {getStatusBadge()}
          </div>

          <button
            onClick={() => toggleFavorite(consultant.id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-gray-400 hover:text-rose-400 transition-colors"
          >
            <Heart className={`w-4 h-4 ${fav ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Name & Title */}
        <div>
          <h3
            onClick={() => onSelect(consultant)}
            className="text-xl font-semibold text-white hover:text-[#d4af37] transition-colors cursor-pointer"
          >
            {consultant.name}
          </h3>
          <p className="text-sm italic gold-accent font-serif mt-0.5">
            {consultant.title}
          </p>
        </div>

        {/* Rating & Consultations */}
        <div className="flex items-center justify-between text-sm py-1 border-y border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-[#d4af37] font-bold text-base">★★★★★</span>
            <span className="text-xs text-gray-400">({consultant.totalReviews})</span>
          </div>
          <span className="text-xs text-gray-400">
            <strong className="text-white font-mono">{consultant.totalConsultations}</strong> atendimentos
          </span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {specialties.map((spec) => {
            const cat = ORACLE_CATEGORIES[spec];
            return (
              <span
                key={spec}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium tracking-wide uppercase text-gray-300"
              >
                {cat?.name || spec}
              </span>
            );
          })}
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {consultant.bio}
        </p>
      </div>

      {/* Pricing & Call CTA Buttons */}
      <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 gold-accent" />
            {consultant.avgResponseTime}
          </span>
          <div className="text-right">
  <span className="text-sm font-semibold text-white font-mono">
    {consultant.pricePerMinute.toFixed(2)} min{' '}

    <span className="text-[10px] text-gray-500 font-sans">
      do saldo/min de atendimento
    </span>
  </span>
</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartConsultation(consultant, chosenOracle, 'chat');
            }}
            disabled={consultant.status === 'offline'}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>

          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/20 hover:border-[#d4af37] py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 gold-accent" />
            Vídeo em breve
          </button>
        </div>
      </div>
    </div>
  );
};
