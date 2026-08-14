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
  Menu,
  X,
  Lock,
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
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateTab = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#050508]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div
            onClick={() => navigateTab('showcase')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img
                src="/brand/logo-oraculos.png"
                alt="ORACULOS.TS Logo"
                width="48"
                height="48"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://portalvipbrasil.com.br/wp-content/uploads/2026/07/logo-oraculos.png';
                }}
                className="w-12 h-12 object-contain rounded-xl border border-[#d4af37]/40 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform bg-[#0a0a12]/80 p-0.5"
              />
            </div>
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full border border-white/10">
            <button
              onClick={() => navigateTab('showcase')}
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
              onClick={() => navigateTab('oracles')}
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
              onClick={() => navigateTab('blog')}
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
              onClick={() => navigateTab('howItWorks')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'howItWorks'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Como Funciona
            </button>

            <button
              onClick={() => navigateTab('helpAndPrivacy')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'helpAndPrivacy'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Ajuda & LGPD
            </button>

            {/* Role Panel Access Link */}
            {isAuthenticated &&
              (user.role === 'user' || user.role === 'client') && (
              <button
                onClick={() => navigateTab('clientDashboard')}
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
                onClick={() => navigateTab('consultantDashboard')}
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
                onClick={() => navigateTab('adminDashboard')}
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
          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsRegisterOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-white/15 text-gray-200 hover:text-white text-xs font-bold transition-all"
                >
                  Entrar
                </button>

                <button
                  onClick={() => {
                    setAuthMode('register');
                    setIsRegisterOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">Cadastrar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  await logout();
                  navigateTab('showcase');
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}

            {/* Wallet Balance Widget */}
            {isAuthenticated && (
              <div className="flex items-center glass-card border border-white/10 rounded-full pl-3 pr-1 py-1 sm:py-1.5">
                <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37]" />
                  <div className="text-left">
                    <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                      Minutos
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {user.minuteBalance ?? 0}m
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsRechargeModalOpen(true)}
                  className="p-1.5 sm:p-2 rounded-full bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
                  title="Comprar Pacote de Minutos Mercado Pago"
                  aria-label="Recarregar minutos"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 p-1 glass-card rounded-full border border-white/10">
                <img
                  src={user.avatar || '/brand/logo-oraculos.png'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#d4af37]/40"
                />
                <div className="hidden md:block text-left pr-3">
                  <span className="block text-xs font-medium text-white truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <span className="block text-[9px] gold-accent font-semibold uppercase tracking-wider">
                    {user.role === 'user' ? 'Consulente' : user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0714] border-b border-purple-900/40 px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
            <button
              onClick={() => navigateTab('showcase')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                currentTab === 'showcase' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              Marketplace
            </button>

            <button
              onClick={() => navigateTab('oracles')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                currentTab === 'oracles' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              Especialistas
            </button>

            <button
              onClick={() => navigateTab('blog')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                currentTab === 'blog' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Blog Místico
            </button>

            <button
              onClick={() => navigateTab('howItWorks')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                currentTab === 'howItWorks' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Como Funciona
            </button>

            <button
              onClick={() => navigateTab('helpAndPrivacy')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                currentTab === 'helpAndPrivacy' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4" />
              Ajuda & LGPD
            </button>

            {isAuthenticated && (user.role === 'user' || user.role === 'client') && (
              <button
                onClick={() => navigateTab('clientDashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                  currentTab === 'clientDashboard' ? 'bg-[#d4af37] text-black font-bold' : 'text-amber-300 bg-amber-500/10'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Minha Carteira ({user.minuteBalance ?? 0} min)
              </button>
            )}

            {isAuthenticated && (user.role === 'employee' || user.role === 'consultant') && (
              <button
                onClick={() => navigateTab('consultantDashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                  currentTab === 'consultantDashboard' ? 'bg-[#d4af37] text-black font-bold' : 'text-purple-300 bg-purple-500/10'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Painel Profissional
              </button>
            )}

            {isAuthenticated && (user.role === 'admin' || user.role === 'superadmin') && (
              <button
                onClick={() => navigateTab('adminDashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all ${
                  currentTab === 'adminDashboard' ? 'bg-[#d4af37] text-black font-bold' : 'text-emerald-300 bg-emerald-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Painel Admin
              </button>
            )}
          </div>
        )}
      </header>

      <RegisterModal
        isOpen={isRegisterOpen}
        initialMode={authMode}
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  );
};
