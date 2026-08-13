import React, { useState } from 'react';
import { OracleType } from '../types/oracle';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Moon, 
  Sun,
  Compass,
  Scroll,
  Hash,
  Bot,
  Layers
} from 'lucide-react';

interface HeaderProps {
  activeOracle: OracleType;
  setActiveOracle: (oracle: OracleType) => void;
  openJournal: () => void;
  savedReadingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeOracle,
  setActiveOracle,
  openJournal,
  savedReadingsCount
}) => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    const newState = sound.toggleAmbientDrone();
    setIsMuted(!newState);
  };

  const navItems: { id: OracleType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'tarot', label: 'Tarô', icon: <Layers className="w-4 h-4" /> },
    { id: 'iching', label: 'I Ching', icon: <Scroll className="w-4 h-4" /> },
    { id: 'runes', label: 'Runas', icon: <Compass className="w-4 h-4" /> },
    { id: 'astrology', label: 'Astrologia', icon: <Sun className="w-4 h-4" /> },
    { id: 'numerology', label: 'Numerologia', icon: <Hash className="w-4 h-4" /> },
    { id: 'ai-sacerdotisa', label: 'Sacerdotisa IA', icon: <Bot className="w-4 h-4" />, badge: 'Gemini' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-amber-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveOracle('tarot')}>
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-purple-700 to-indigo-900 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 gold-glow">
              <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
                  ORÁCULOS<span className="text-amber-400">.TS</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-200/70 font-sans tracking-widest uppercase">
                Portal de Divinação & Sabedoria Ancestral
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-amber-500/20 shadow-inner">
            {navItems.map((item) => {
              const isActive = activeOracle === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playSingingBowl(300 + navItems.findIndex(n => n.id === item.id) * 40);
                    setActiveOracle(item.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 relative whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600/80 to-purple-800/80 text-amber-100 shadow-md shadow-purple-900/50 border border-amber-400/40 font-semibold'
                      : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls Right */}
          <div className="flex items-center gap-2">
            
            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Ativar Música de Fundo Mística' : 'Pausar Som Místico'}
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                !isMuted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 gold-glow'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-amber-200 hover:border-amber-500/30'
              }`}
            >
              {!isMuted ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Diário Oracular Drawer Trigger */}
            <button
              onClick={() => {
                sound.playSingingBowl(528);
                openJournal();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-amber-200 border border-purple-500/30 hover:border-amber-400/50 transition-all text-xs font-medium shadow-md"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Diário</span>
              {savedReadingsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold font-mono">
                  {savedReadingsCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeOracle === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playSingingBowl(300 + navItems.findIndex(n => n.id === item.id) * 40);
                  setActiveOracle(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
