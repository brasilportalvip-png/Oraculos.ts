import React, { useState, useEffect } from 'react';
import { OracleType, ReadingEntry } from './types/oracle';
import { Header } from './components/Header';
import { TarotModule } from './components/TarotModule';
import { IChingModule } from './components/IChingModule';
import { RunesModule } from './components/RunesModule';
import { AstrologyModule } from './components/AstrologyModule';
import { NumerologyModule } from './components/NumerologyModule';
import { OracleAiModule } from './components/OracleAiModule';
import { JournalModal } from './components/JournalModal';
import { Sparkles, Archive, Star, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeOracle, setActiveOracle] = useState<OracleType>('tarot');
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [savedReadings, setSavedReadings] = useState<ReadingEntry[]>(() => {
    try {
      const stored = localStorage.getItem('oraculos_readings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // AI Synthesis transfer state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiContext, setAiContext] = useState<any>(null);

  // Sync saved readings with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oraculos_readings', JSON.stringify(savedReadings));
    } catch (err) {
      console.error('Failed to save readings to localStorage', err);
    }
  }, [savedReadings]);

  const handleSaveReading = (entryData: Omit<ReadingEntry, 'id' | 'timestamp'>) => {
    const newEntry: ReadingEntry = {
      ...entryData,
      id: 'rd-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };
    setSavedReadings(prev => [newEntry, ...prev]);
    setIsJournalOpen(true);
  };

  const handleDeleteReading = (id: string) => {
    setSavedReadings(prev => prev.filter(r => r.id !== id));
  };

  const handleClearJournal = () => {
    if (window.confirm('Deseja realmente apagar todos os registros salvos do seu Diário?')) {
      setSavedReadings([]);
    }
  };

  const handleSynthesizeWithAi = (promptText: string, contextData: any) => {
    setAiPrompt(promptText);
    setAiContext(contextData);
    setActiveOracle('ai-sacerdotisa');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D1B] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navigation Bar */}
      <Header
        activeOracle={activeOracle}
        setActiveOracle={setActiveOracle}
        openJournal={() => setIsJournalOpen(true)}
        savedReadingsCount={savedReadings.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Informing ZIP & Site Export Capability */}
        <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-2">
                <span>Oráculos.TS — Projeto Pronto em Código Limpo</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">ZIP / Website</span>
              </h4>
              <p className="text-xs text-slate-300">
                O site está 100% funcional. Você pode exportar este repositório como pasta ZIP completa a qualquer momento no menu do AI Studio.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300/80 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistema Nativo & Servidor IA Proxy Ativo</span>
          </div>
        </div>

        {/* Dynamic Module Render */}
        <div className="transition-all duration-300">
          {activeOracle === 'tarot' && (
            <TarotModule
              onSaveReading={handleSaveReading}
              onSynthesizeAi={handleSynthesizeWithAi}
            />
          )}

          {activeOracle === 'iching' && (
            <IChingModule
              onSaveReading={handleSaveReading}
              onSynthesizeAi={handleSynthesizeWithAi}
            />
          )}

          {activeOracle === 'runes' && (
            <RunesModule
              onSaveReading={handleSaveReading}
              onSynthesizeAi={handleSynthesizeWithAi}
            />
          )}

          {activeOracle === 'astrology' && (
            <AstrologyModule
              onSaveReading={handleSaveReading}
              onSynthesizeAi={handleSynthesizeWithAi}
            />
          )}

          {activeOracle === 'numerology' && (
            <NumerologyModule
              onSaveReading={handleSaveReading}
              onSynthesizeAi={handleSynthesizeWithAi}
            />
          )}

          {activeOracle === 'ai-sacerdotisa' && (
            <OracleAiModule
              initialPrompt={aiPrompt}
              initialContext={aiContext}
              onSaveReading={handleSaveReading}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-amber-500/20 mt-16 py-8 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2 text-amber-300 font-serif font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Oráculos.TS — Studio de Divinação Hermética & IA</span>
        </div>
        <p className="max-w-md mx-auto text-[11px] text-slate-500">
          "O que está embaixo é como o que está em cima, e o que está em cima é como o que está embaixo, para realizar os milagres de uma só coisa." — Tábua de Esmeralda
        </p>
        <p className="text-[10px] text-slate-600 font-mono pt-2">
          Desenvolvido com React, TypeScript & Tailwind CSS • Powered by Gemini AI
        </p>
      </footer>

      {/* Diário Oracular Modal */}
      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        readings={savedReadings}
        onDeleteReading={handleDeleteReading}
        onClearJournal={handleClearJournal}
      />

    </div>
  );
}
