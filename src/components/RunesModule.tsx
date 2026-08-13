import React, { useState } from 'react';
import { NORDIC_RUNES } from '../data/runeData';
import { DrawnRune, NordicRune, ReadingEntry } from '../types/oracle';
import { sound } from '../utils/audio';
import { Compass, RefreshCw, BookmarkPlus, Bot, Sparkles, Shield } from 'lucide-react';

interface RunesModuleProps {
  onSaveReading: (entry: Omit<ReadingEntry, 'id' | 'timestamp'>) => void;
  onSynthesizeAi: (prompt: string, context: any) => void;
}

export const RunesModule: React.FC<RunesModuleProps> = ({
  onSaveReading,
  onSynthesizeAi,
}) => {
  const [spreadType, setSpreadType] = useState<'odin' | 'norns' | 'cross'>('norns');
  const [drawnRunes, setDrawnRunes] = useState<DrawnRune[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [question, setQuestion] = useState('');
  const [activeRuneIdx, setActiveRuneIdx] = useState(0);

  const spreadsConfig = {
    odin: {
      label: 'Runa de Odin (Conselho Único)',
      count: 1,
      positions: ['Visão & Orientação do Dia'],
    },
    norns: {
      label: 'As Três Nornes (Urd, Verdandi, Skuld)',
      count: 3,
      positions: ['Urd (Passado & Origem)', 'Verdandi (Presente & Desafio)', 'Skuld (Futuro & Destino)'],
    },
    cross: {
      label: 'Cruz Nórdica (5 Runas)',
      count: 5,
      positions: [
        'A Situação Atual',
        'O Obstáculo / Força Oposta',
        'O Futuro Próximo',
        'Sua Força Interior',
        'O Desfecho Sagrado',
      ],
    },
  };

  const handleDrawRunes = () => {
    sound.playRuneStone();
    setIsDrawing(true);
    setDrawnRunes([]);

    setTimeout(() => {
      const runesCopy = [...NORDIC_RUNES].sort(() => Math.random() - 0.5);
      const neededCount = spreadsConfig[spreadType].count;
      const selected = runesCopy.slice(0, neededCount);

      const drawn: DrawnRune[] = selected.map((rune, idx) => ({
        rune,
        isInverted: Math.random() < 0.2, // 20% chance of inverted
        positionLabel: spreadsConfig[spreadType].positions[idx] || `Posição ${idx + 1}`,
      }));

      setDrawnRunes(drawn);
      setIsDrawing(false);
      setActiveRuneIdx(0);
    }, 500);
  };

  const handleSaveToJournal = () => {
    if (drawnRunes.length === 0) return;
    const summary = drawnRunes
      .map(r => `${r.positionLabel}: ${r.rune.name} (${r.rune.symbol})`)
      .join(' | ');

    onSaveReading({
      oracleType: 'runes',
      title: `Tiragem de Runas — ${spreadsConfig[spreadType].label}`,
      summary,
      details: {
        spreadType,
        question,
        runes: drawnRunes,
      },
      notes: question ? `Pergunta do Consulente: "${question}"` : undefined,
    });
  };

  const handleConsultAi = () => {
    if (drawnRunes.length === 0) return;
    const contextData = {
      tipoOraculo: 'Runas Nórdicas (Futhark Superior)',
      tiragem: spreadsConfig[spreadType].label,
      runasTiradas: drawnRunes.map(r => ({
        posicao: r.positionLabel,
        runa: `${r.rune.name} (${r.rune.symbol})`,
        orientacao: r.isInverted ? 'Invertida' : 'Direta',
        significado: r.rune.meaningPt,
      })),
    };

    onSynthesizeAi(
      question || 'Forneça a sabedoria dos Deuses Nórdicos para esta tiragem de runas.',
      contextData
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              Runas Nórdicas — Futhark Superior
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Retire as pedras gravadas com símbolos sagrados para ouvir os conselhos de Odin e das Nornes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['odin', 'norns', 'cross'] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSpreadType(key);
                  setDrawnRunes([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  spreadType === key
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 shadow-md gold-glow'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-amber-200'
                }`}
              >
                {spreadsConfig[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Question & Draw Button */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Qual intenção você quer levar ao Saco de Runas de Odin? (Opcional)"
            className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />

          <button
            onClick={handleDrawRunes}
            disabled={isDrawing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
            <span>{isDrawing ? 'Retirando Pedras...' : 'Retirar Runas do Saco'}</span>
          </button>
        </div>
      </div>

      {/* Drawn Runes Display */}
      {drawnRunes.length > 0 ? (
        <div className="space-y-8">
          
          {/* Rune Stones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 justify-center">
            {drawnRunes.map((drawn, idx) => {
              const isSelected = activeRuneIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    sound.playRuneStone();
                    setActiveRuneIdx(idx);
                  }}
                  className={`glass-panel p-5 rounded-2xl border flex flex-col items-center justify-between cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 shadow-xl shadow-amber-500/10 scale-105'
                      : 'border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-3 text-center">
                    {drawn.positionLabel}
                  </span>

                  {/* Carved Rune Stone Graphic */}
                  <div className="w-24 h-28 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border-2 border-amber-500/40 shadow-inner p-3 flex flex-col items-center justify-center my-2 relative overflow-hidden group">
                    <div className={`text-5xl font-mono text-amber-200 drop-shadow-[0_0_12px_rgba(212,175,55,0.6)] transform transition-transform ${
                      drawn.isInverted ? 'rotate-180' : ''
                    }`}>
                      {drawn.rune.symbol}
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <h3 className="font-serif font-bold text-amber-100 text-sm">
                      {drawn.rune.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {drawn.rune.meaningPt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Rune Details */}
          {drawnRunes[activeRuneIdx] && (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 shadow-2xl space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-amber-400/50 flex items-center justify-center text-3xl text-amber-300 shadow-inner">
                    {drawnRunes[activeRuneIdx].rune.symbol}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                      {drawnRunes[activeRuneIdx].positionLabel}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-amber-100">
                      Runa {drawnRunes[activeRuneIdx].rune.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-950 text-amber-200 border border-purple-700/50">
                    Divindade: {drawnRunes[activeRuneIdx].rune.deity}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-950 text-amber-200 border border-indigo-700/50">
                    {drawnRunes[activeRuneIdx].rune.element}
                  </span>
                </div>
              </div>

              {/* Advice Box */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-200 space-y-3">
                <h4 className="font-serif font-bold text-amber-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Conselho Ancestral das Runas:
                </h4>
                <p>
                  {drawnRunes[activeRuneIdx].isInverted
                    ? drawnRunes[activeRuneIdx].rune.invertedAdvice
                    : drawnRunes[activeRuneIdx].rune.uprightAdvice}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveToJournal}
                  className="px-4 py-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 text-amber-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4 text-amber-300" />
                  <span>Salvar no Diário</span>
                </button>

                <button
                  onClick={handleConsultAi}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Sintetizar com Sacerdotisa IA</span>
                </button>
              </div>

            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-amber-500/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-serif text-amber-200 font-bold">
            Saco de Runas de Odin
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Selecione o estilo de tiragem acima e retire as pedras para ouvir a orientação dos Deuses e das Nornes.
          </p>
        </div>
      )}

    </div>
  );
};
