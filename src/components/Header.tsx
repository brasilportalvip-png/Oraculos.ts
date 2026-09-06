import React, { useEffect, useRef, useState } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConsultation } from '../context/ConsultationContext';
import { RegisterModal } from './RegisterModal';
import { resolveNavigationTarget } from '../routing/routes';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
    user,
    isAuthenticated,
    logout,
    switchRole,
  } = useAuth();
  const { setIsRechargeModalOpen } = useConsultation();
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const navigateTab = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  };

  const hrefFor = (target: string) => resolveNavigationTarget(target).path;

  const handleInternalLink = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateTab(target);
  };

  // Close "Mais" dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  const isMoreActive = ['howItWorks', 'helpAndPrivacy', 'workWithUs'].includes(currentTab);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#050508]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Logo Brand */}
          <a
            href={hrefFor('showcase')}
            onClick={(event) => handleInternalLink(event, 'showcase')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
            aria-label="ORACULOS.TS — página inicial"
          >
            <div className="relative">
              <img
                src="/brand/logo-oraculos.png?v=20260831b"
                alt="ORACULOS.TS Logo"
                width="48"
                height="48"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://portalvipbrasil.com.br/wp-content/uploads/2026/07/logo-oraculos.png';
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl border border-[#d4af37]/40 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform bg-[#0a0a12]/80 p-0.5"
              />
            </div>
            <div className="hidden min-[430px]:block">
              <div className="flex items-center gap-1">
                <span className="text-xl font-semibold tracking-tighter text-white">ORACULOS</span>
                <span className="text-xl font-extrabold gold-accent">.TS</span>
              </div>
              <p className="text-[10px] text-amber-300/80 font-medium tracking-widest uppercase font-serif italic">
                Sabedoria Ancestral
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 glass-card px-3 py-1.5 rounded-full border border-white/10">
            <a
              href={hrefFor('showcase')}
              onClick={(event) => handleInternalLink(event, 'showcase')}
              aria-current={currentTab === 'showcase' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'showcase'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Marketplace
            </a>

            <a
              href={hrefFor('oracles')}
              onClick={(event) => handleInternalLink(event, 'oracles')}
              aria-current={currentTab === 'oracles' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'oracles'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Especialistas
            </a>

            <a
              href={hrefFor('blog')}
              onClick={(event) => handleInternalLink(event, 'blog')}
              aria-current={currentTab === 'blog' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                currentTab === 'blog'
                  ? 'bg-[#d4af37] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Blog Místico
            </a>

            {/* "Mais" Dropdown for desktop */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  isMoreActive || isMoreMenuOpen
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-expanded={isMoreMenuOpen}
              >
                <span>Mais</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 py-2 bg-[#0e0c1a] border border-amber-500/30 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <a
                    href={hrefFor('howItWorks')}
                    onClick={(event) => handleInternalLink(event, 'howItWorks')}
                    className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${
                      currentTab === 'howItWorks' ? 'text-amber-300 bg-amber-500/10 font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    Como Funciona
                  </a>
                  <a
                    href={hrefFor('workWithUs')}
                    onClick={(event) => handleInternalLink(event, 'workWithUs')}
                    className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${
                      currentTab === 'workWithUs' ? 'text-amber-300 bg-amber-500/10 font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    Trabalhe Conosco
                  </a>
                  <a
                    href={hrefFor('helpAndPrivacy')}
                    onClick={(event) => handleInternalLink(event, 'helpAndPrivacy')}
                    className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${
                      currentTab === 'helpAndPrivacy' ? 'text-amber-300 bg-amber-500/10 font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    Ajuda & LGPD
                  </a>
                </div>
              )}
            </div>

            {/* Prominent Role Panel Badge on Desktop */}
            {(user.role === 'admin' || user.role === 'superadmin') && (
              <a
                href={hrefFor('adminDashboard')}
                onClick={(event) => handleInternalLink(event, 'adminDashboard')}
                aria-current={currentTab === 'adminDashboard' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  currentTab === 'adminDashboard'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Painel Admin
              </a>
            )}

            {(user.role === 'employee' || user.role === 'consultant') && (
              <a
                href={hrefFor('consultantDashboard')}
                onClick={(event) => handleInternalLink(event, 'consultantDashboard')}
                aria-current={currentTab === 'consultantDashboard' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  currentTab === 'consultantDashboard'
                    ? 'bg-[#d4af37] text-black shadow-lg shadow-amber-500/30'
                    : 'bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-[#d4af37] hover:text-black'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Painel Profissional
              </a>
            )}

            {isAuthenticated && (user.role === 'user' || user.role === 'client') && (
              <a
                href={hrefFor('clientDashboard')}
                onClick={(event) => handleInternalLink(event, 'clientDashboard')}
                aria-current={currentTab === 'clientDashboard' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                  currentTab === 'clientDashboard'
                    ? 'bg-[#d4af37] text-black font-bold shadow-md'
                    : 'text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Minha Carteira
              </a>
            )}
          </nav>

          {/* User Right Section */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-3 min-w-0">
            {/* Quick Mobile Panel Shortcuts */}
            {isAuthenticated && (user.role === 'admin' || user.role === 'superadmin') && (
              <a
                href={hrefFor('adminDashboard')}
                onClick={(event) => handleInternalLink(event, 'adminDashboard')}
                className="lg:hidden flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-500 text-black text-[11px] font-black tracking-tight whitespace-nowrap shadow-md"
                aria-label="Abrir painel administrativo"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </a>
            )}

            {isAuthenticated && (user.role === 'employee' || user.role === 'consultant') && (
              <a
                href={hrefFor('consultantDashboard')}
                onClick={(event) => handleInternalLink(event, 'consultantDashboard')}
                className="lg:hidden flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-400 text-black text-[11px] font-black tracking-tight whitespace-nowrap shadow-md"
                aria-label="Abrir painel profissional"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Painel</span>
              </a>
            )}

            {isAuthenticated && (user.role === 'user' || user.role === 'client') && (
              <a
                href={hrefFor('clientDashboard')}
                onClick={(event) => handleInternalLink(event, 'clientDashboard')}
                className="lg:hidden flex items-center gap-1 px-2 py-1.5 rounded-xl bg-purple-900/60 border border-amber-400/40 text-amber-300 text-[11px] font-bold whitespace-nowrap"
                aria-label="Abrir minha carteira"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.minuteBalance ?? 0}m</span>
              </a>
            )}

            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setIsRegisterOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-white/15 text-gray-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Entrar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setIsRegisterOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">Cadastrar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigateTab('showcase');
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}

            {/* Wallet Balance Widget */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center glass-card border border-white/10 rounded-full pl-3 pr-1 py-1 sm:py-1.5">
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
                  type="button"
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
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-primary-navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Organized Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav
            id="mobile-primary-navigation"
            aria-label="Navegação principal móvel"
            className="lg:hidden fixed z-50 left-0 right-0 top-16 sm:top-20 bottom-0 bg-[#07050f]/98 border-b border-purple-900/40 px-4 py-5 pb-16 space-y-5 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top duration-200 overflow-y-auto overscroll-contain"
          >
            {/* SEÇÃO 1: PAINÉIS DE ACESSO */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Painéis de Controle</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {/* Admin Panel Link */}
                <a
                  href={hrefFor('adminDashboard')}
                  onClick={(event) => handleInternalLink(event, 'adminDashboard')}
                  aria-current={currentTab === 'adminDashboard' ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    currentTab === 'adminDashboard'
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-extrabold text-sm">Painel do Administrador</div>
                      <div className="text-[10px] opacity-80">Gestão de atendentes, valores e métricas</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    Acessar
                  </span>
                </a>

                {/* Consultant Panel Link */}
                <a
                  href={hrefFor('consultantDashboard')}
                  onClick={(event) => handleInternalLink(event, 'consultantDashboard')}
                  aria-current={currentTab === 'consultantDashboard' ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    currentTab === 'consultantDashboard'
                      ? 'bg-[#d4af37] text-black border-amber-300 shadow-lg shadow-amber-500/20'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-200 hover:bg-amber-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-extrabold text-sm">Painel do Atendente</div>
                      <div className="text-[10px] opacity-80">Consultas ao vivo, ganhos e status online</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300">
                    Acessar
                  </span>
                </a>

                {/* Client Wallet Link */}
                <a
                  href={hrefFor('clientDashboard')}
                  onClick={(event) => handleInternalLink(event, 'clientDashboard')}
                  aria-current={currentTab === 'clientDashboard' ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    currentTab === 'clientDashboard'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/20'
                      : 'bg-purple-950/30 border-purple-500/30 text-purple-200 hover:bg-purple-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-extrabold text-sm">Minha Carteira & Perfil</div>
                      <div className="text-[10px] opacity-80">Saldo de minutos e histórico pessoal</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-black text-amber-300">
                    {user.minuteBalance ?? 0} min
                  </span>
                </a>
              </div>
            </div>

            {/* SEÇÃO 2: NAVEGAÇÃO PRINCIPAL */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Navegação Principal
              </div>

              <a
                href={hrefFor('showcase')}
                onClick={(event) => handleInternalLink(event, 'showcase')}
                aria-current={currentTab === 'showcase' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider text-left transition-all ${
                  currentTab === 'showcase' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                Marketplace (Início)
              </a>

              <a
                href={hrefFor('oracles')}
                onClick={(event) => handleInternalLink(event, 'oracles')}
                aria-current={currentTab === 'oracles' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider text-left transition-all ${
                  currentTab === 'oracles' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-400" />
                10 Oráculos & Especialistas
              </a>

              <a
                href={hrefFor('blog')}
                onClick={(event) => handleInternalLink(event, 'blog')}
                aria-current={currentTab === 'blog' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider text-left transition-all ${
                  currentTab === 'blog' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                Blog Místico & Artigos
              </a>
            </div>

            {/* SEÇÃO 3: INSTITUCIONAL & TRABALHO */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Institucional & Atendimento
              </div>

              <a
                href={hrefFor('workWithUs')}
                onClick={(event) => handleInternalLink(event, 'workWithUs')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider text-left transition-all ${
                  currentTab === 'workWithUs' ? 'bg-[#d4af37] text-black font-bold' : 'text-purple-200 bg-purple-500/10 hover:bg-purple-500/20'
                }`}
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                Trabalhe Conosco (Oraculistas)
              </a>

              <a
                href={hrefFor('howItWorks')}
                onClick={(event) => handleInternalLink(event, 'howItWorks')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider text-left transition-all ${
                  currentTab === 'howItWorks' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Como Funciona a Consulta
              </a>

              <a
                href={hrefFor('helpAndPrivacy')}
                onClick={(event) => handleInternalLink(event, 'helpAndPrivacy')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider text-left transition-all ${
                  currentTab === 'helpAndPrivacy' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-400" />
                Ajuda, Termos & LGPD
              </a>
            </div>

            {/* SEÇÃO 4: CONTA E TESTES DE PERFIL */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="px-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Modo de Testes & Perfis</span>
                <span className="text-amber-400 font-mono font-bold">Perfil: {user.role}</span>
              </div>

              <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => switchRole('admin')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    user.role === 'admin' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('consultant')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    user.role === 'consultant' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Atendente
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('client')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    user.role === 'client' || user.role === 'user' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cliente
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsRechargeModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Recarregar Minutos Mercado Pago
              </button>
            </div>
          </nav>
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
