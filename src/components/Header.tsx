import React, { useState } from 'react';
import {
  
  Wallet,
  Plus,
  UserCheck,
  ShieldCheck,
  LogOut,
  
  BookOpen,
  Users,
  Compass,
  HelpCircle,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConsultation } from '../context/ConsultationContext';
import { RegisterModal } from './RegisterModal';


interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
  user,
  isAuthenticated,
  logout,
} = useAuth();
  const { setIsRechargeModalOpen } = useConsultation();
  
const [isRegisterOpen, setIsRegisterOpen] =
  useState(false);

const [authMode, setAuthMode] = useState<
  'login' | 'register'
>('register');
  

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#050508]/85 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div
            onClick={() => setCurrentTab('showcase')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/brand/logo-oraculos.png"
              alt="ORACULOS.TS Logo"
              width="44"
              height="44"
              className="w-11 h-11 object-contain rounded-xl border border-[#d4af37]/30 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-semibold tracking-tighter text-white">ORACULOS</span>
                <span className="text-xl font-extrabold gold-accent">.TS</span>
              </div>
              <p className="text-[10px] text-amber-300/80 font-medium tracking-widest uppercase font-serif italic">
                Sabedoria Ancestral
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full border border-white/10">
            <button
              onClick={() => setCurrentTab('showcase')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'showcase'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Marketplace
            </button>

            <button
              onClick={() => setCurrentTab('oracles')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'oracles'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Especialistas
            </button>

            <button
              onClick={() => setCurrentTab('blog')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'blog'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Blog Místico
            </button>

            <button
              onClick={() => setCurrentTab('howItWorks')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'howItWorks'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Como Funciona
            </button>

            {/* Role Panel Access Link */}
            {isAuthenticated &&
  (user.role === 'user' ||
    user.role === 'client') && (
              <button
                onClick={() => setCurrentTab('clientDashboard')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                  currentTab === 'clientDashboard'
                    ? 'bg-[#d4af37] text-black font-bold shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Minha Carteira
              </button>
            )}

            {(user.role === 'employee' || user.role === 'consultant') && (
              <button
                onClick={() => setCurrentTab('consultantDashboard')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                  currentTab === 'consultantDashboard'
                    ? 'bg-[#d4af37] text-black font-bold shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Painel Profissional
              </button>
            )}

            {(user.role === 'admin' || user.role === 'superadmin') && (
              <button
                onClick={() => setCurrentTab('adminDashboard')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                  currentTab === 'adminDashboard'
                    ? 'bg-[#d4af37] text-black font-bold shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Painel Admin
              </button>
            )}
          </nav>

          {/* User Right Section */}
          <div className="flex items-center gap-3">
            {/* Cadastrar button */}
            




{!isAuthenticated ? (
  <div className="flex items-center gap-2">
    <button
      onClick={() => {
        setAuthMode('login');
        setIsRegisterOpen(true);
      }}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 text-gray-200 hover:text-white text-xs font-bold transition-all"
    >
      Entrar
    </button>

    <button
      onClick={() => {
        setAuthMode('register');
        setIsRegisterOpen(true);
      }}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all"
    >
      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
      Cadastrar
    </button>
  </div>
) : (
  <button
    onClick={async () => {
  await logout();
  setCurrentTab('showcase');
}}
    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-all"
  >
    <LogOut className="w-3.5 h-3.5" />
    Sair
  </button>
)}






{/* Wallet Balance Widget */}
{isAuthenticated && (
  <div className="flex items-center glass-card border border-white/10 rounded-full pl-3.5 pr-1 py-1.5">







<div className="flex items-center gap-2 pr-3">
                <Wallet className="w-4 h-4 text-[#d4af37]" />
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                    Minutos
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {user.minuteBalance ?? 0} min
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="p-2 rounded-full bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
                title="Comprar Pacote de Minutos Mercado Pago"
              >
                <Plus className="w-3.5 h-3.5" />
                            </button>
            </div>
)}






                      {isAuthenticated && (
  <div className="flex items-center gap-2 p-1 glass-card rounded-full border border-white/10">
    <img
      src={
  user.avatar ||
  '/brand/logo-oraculos.png'
}
      alt={user.name}
      className="w-8 h-8 rounded-full object-cover border border-[#d4af37]/40"
    />

    <div className="hidden sm:block text-left pr-3">
      <span className="block text-xs font-medium text-white">
        {user.name}
      </span>

      <span className="block text-[9px] gold-accent font-semibold uppercase tracking-wider">
        {user.role === 'user'
          ? 'Consulente'
          : user.role}
      </span>
    </div>
  </div>
)}





          </div>
        </div>
      </header>

      <RegisterModal
  isOpen={isRegisterOpen}
  initialMode={authMode}
  onClose={() => setIsRegisterOpen(false)}
/>
</>
  );
};
