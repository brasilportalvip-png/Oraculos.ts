import React, { useState } from 'react';
import { CoinTossResult, ReadingEntry } from '../types/oracle';
import { getHexagramFromBinary } from '../data/ichingData';
import { sound } from '../utils/audio';
import { Scroll, RefreshCw, BookmarkPlus, Bot, Sparkles, Disc } from 'lucide-react';

interface IChingModuleProps {
  onSaveReading: (entry: Omit<ReadingEntry, 'id' | 'timestamp'>) => void;
  onSynthesizeAi: (prompt: string, context: any) => void;
}

export const IChingModule: React.FC<IChingModuleProps> = ({
  onSaveReading,
  onSynthesizeAi,
}) => {
  const [tosses, setTosses] = useState<CoinTossResult[]>([]);
  const [isTossing, setIsTossing] = useState(false);
  const [question, setQuestion] = useState('');

  // Handle single coin toss (accumulate 6 lines)
  const handleTossCoins = () => {
    if (tosses.length >= 6 || isTossing) return;

    sound.playCoinToss();
    setIsTossing(true);

    setTimeout(() => {
      // 3 coins: each coin is either 2 (tails / yin) or 3 (heads / yang)
      const c1 = Math.random() < 0.5 ? 2 : 3;
      const c2 = Math.random() < 0.5 ? 2 : 3;
      const c3 = Math.random() < 0.5 ? 2 : 3;
      const sum = c1 + c2 + c3;

      // sum 6 = changing yin (6), sum 7 = young yang (7), sum 8 = young yin (8), sum 9 = changing yang (9)
      const isYang = sum === 7 || sum === 9;
      const isChanging = sum === 6 || sum === 9;

      const newToss: CoinTossResult = {
        tossIndex: tosses.length,
        coins: [c1, c2, c3],
        sum,
        isChanging,
        isYang,
      };

      setTosses(prev => [...prev, newToss]);
      setIsTossing(false);
    }, 400);
  };

  // Toss all 6 lines at once
  const handleAutoTossAll = () => {
    sound.playCoinToss();
    setIsTossing(true);
    setTosses([]);

    setTimeout(() => {
      const generated: CoinTossResult[] = [];
      for (let i = 0; i < 6; i++) {
        const c1 = Math.random() < 0.5 ? 2 : 3;
        const c2 = Math.random() < 0.5 ? 2 : 3;
        const c3 = Math.random() < 0.5 ? 2 : 3;
        const sum = c1 + c2 + c3;
        generated.push({
          tossIndex: i,
          coins: [c1, c2, c3],
          sum,
          isChanging: sum === 6 || sum === 9,
          isYang: sum === 7 || sum === 9,
        });
      }
      setTosses(generated);
      setIsTossing(false);
    }, 600);
  };

  const handleReset = () => {
    setTosses([]);
  };

  // Calculate binary for primary hexagram (lines 1 to 6, bottom to top)
  const primaryBinary = tosses.map(t => (t.isYang ? '1' : '0')).join('');
  const primaryHexagram = tosses.length === 6 ? getHexagramFromBinary(primaryBinary) : null;

  // Calculate transformed binary if there are changing lines
  const hasChangingLines = tosses.some(t => t.isChanging);
  const transformedBinary = tosses
    .map(t => {
      if (t.sum === 6) return '1'; // changing yin turns to yang
      if (t.sum === 9) return '0'; // changing yang turns to yin
      return t.isYang ? '1' : '0';
    })
    .join('');
  const transformedHexagram =
    tosses.length === 6 && hasChangingLines ? getHexagramFromBinary(transformedBinary) : null;

  const handleSaveToJournal = () => {
    if (!primaryHexagram) return;
    onSaveReading({
      oracleType: 'iching',
      title: `I Ching — ${primaryHexagram.namePt}`,
      summary: `Hexagrama ${primaryHexagram.number}: ${primaryHexagram.namePt} (${primaryHexagram.binary})`,
      details: {
        question,
        primaryHexagram,
        transformedHexagram,
        tosses,
      },
      notes: question ? `Pergunta do Consulente: "${question}"` : undefined,
    });
  };

  const handleConsultAi = () => {
    if (!primaryHexagram) return;
    const contextData = {
      tipoOraculo: 'I Ching (O Livro das Mutações)',
      hexagramaPrincipal: {
        numero: primaryHexagram.number,
        nome: primaryHexagram.namePt,
        julgamento: primaryHexagram.judgment,
      },
      hexagramaTransformado: transformedHexagram
        ? {
            numero: transformedHexagram.number,
            nome: transformedHexagram.namePt,
          }
        : null,
      linhasMutantes: tosses
        .filter(t => t.isChanging)
        .map(t => `Linha ${t.tossIndex + 1}: valor ${t.sum}`),
    };

    onSynthesizeAi(
      question || 'Forneça uma interpretação profunda do Hexagrama gerado.',
      contextData
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Controls Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <Scroll className="w-6 h-6 text-amber-400" />
              I Ching — O Livro das Mutações
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Consulte a sabedoria chinesa milenar através do lançamento ritual das 3 moedas de bronze.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoTossAll}
              disabled={isTossing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTossing ? 'animate-spin' : ''}`} />
              <span>Gerar Hexagrama Completo</span>
            </button>

            {tosses.length > 0 && (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* Question Input */}
        <div className="mt-6">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Qual situação ou dilema você deseja consultar no I Ching? (Opcional)"
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>
      </div>

      {/* Main Interactive Coin & Line Construction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Coin Toss Controls & Line Builder */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-amber-500/20 flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-2">
                <Disc className="w-4 h-4 text-amber-400" />
                Lançamento de Moedas ({tosses.length} / 6)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Construído de Baixo para Cima
              </span>
            </div>

            {/* Manual Coin Toss Button */}
            {tosses.length < 6 && (
              <button
                onClick={handleTossCoins}
                disabled={isTossing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-950/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-amber-200 border border-amber-400/30 font-serif font-bold text-sm shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer gold-glow"
              >
                <Disc className={`w-5 h-5 text-amber-400 ${isTossing ? 'animate-spin' : ''}`} />
                <span>{isTossing ? 'Lançando Moedas...' : 'Lançar Moedas (Próxima Linha)'}</span>
              </button>
            )}

            {/* Display Generated Lines (Top to Bottom visual representation, bottom line is index 0) */}
            <div className="mt-6 space-y-3 bg-slate-950/80 p-5 rounded-xl border border-slate-800">
              {Array.from({ length: 6 }).map((_, idx) => {
                const lineIndex = 5 - idx; // Line 6 is at top, Line 1 at bottom
                const toss = tosses[lineIndex];

                return (
                  <div
                    key={lineIndex}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
                  >
                    <span className="font-mono text-slate-400 w-16">
                      Linha {lineIndex + 1}:
                    </span>

                    <div className="flex-1 px-4 flex items-center justify-center">
                      {toss ? (
                        /* Line Representation */
                        <div className="w-full max-w-[200px] flex items-center justify-center gap-2">
                          {toss.isYang ? (
                            /* Yang Solid Line ⚊ */
                            <div className="w-full h-3.5 bg-amber-400 rounded-sm shadow-sm flex items-center justify-center">
                              {toss.sum === 9 && (
                                <span className="w-2 h-2 rounded-full bg-slate-950 inline-block" title="Linha Mutante (9)" />
                              )}
                            </div>
                          ) : (
                            /* Yin Broken Line ⚋ */
                            <div className="w-full flex items-center gap-3">
                              <div className="w-1/2 h-3.5 bg-amber-300/80 rounded-sm" />
                              <div className="w-4 flex items-center justify-center">
                                {toss.sum === 6 && (
                                  <span className="text-[10px] font-bold text-red-400">✕</span>
                                )}
                              </div>
                              <div className="w-1/2 h-3.5 bg-amber-300/80 rounded-sm" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full max-w-[200px] h-3.5 border border-dashed border-slate-800 rounded-sm" />
                      )}
                    </div>

                    <span className="font-mono text-[10px] text-amber-400/80 w-16 text-right">
                      {toss ? `Soma: ${toss.sum}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            💡 Dica Hermética: No I Ching, as linhas 6 (Yin Mutante) e 9 (Yang Mutante) indicam pontos de mutação iminente em sua vida.
          </div>
        </div>

        {/* Right Column: Hexagram Display & Interpretation */}
        <div className="lg:col-span-7 space-y-6">
          {primaryHexagram ? (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 shadow-2xl space-y-6 animate-fadeIn">
              
              {/* Primary Hexagram Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                    Hexagrama Primário #{primaryHexagram.number}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-amber-100 flex items-center gap-3 mt-1">
                    <span className="text-3xl text-amber-400">{primaryHexagram.nameZh}</span>
                    <span>{primaryHexagram.namePt}</span>
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 block">Trigramas</span>
                  <span className="text-xs font-medium text-amber-200">
                    {primaryHexagram.upperTrigram} / {primaryHexagram.lowerTrigram}
                  </span>
                </div>
              </div>

              {/* Judgment Text */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-200 space-y-3">
                <h4 className="font-serif font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  O Julgamento (Decisão Sagrada):
                </h4>
                <p>{primaryHexagram.judgment}</p>
              </div>

              {/* Image Text */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-200 space-y-3">
                <h4 className="font-serif font-bold text-amber-300">A Imagem & Conselho:</h4>
                <p>{primaryHexagram.image}</p>
                <p className="text-xs text-amber-200/90 pt-2 border-t border-slate-800 italic">
                  {primaryHexagram.meaning}
                </p>
              </div>

              {/* Transformed Hexagram (If changing lines exist) */}
              {transformedHexagram && (
                <div className="p-5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                  <span className="text-xs font-mono text-purple-300 uppercase tracking-wider block">
                    ⚡ Mutação Detectada — Hexagrama Futuro/Transformado
                  </span>
                  <h4 className="font-serif font-bold text-amber-200 text-lg">
                    #{transformedHexagram.number} — {transformedHexagram.namePt} ({transformedHexagram.nameZh})
                  </h4>
                  <p className="text-xs text-slate-300">
                    {transformedHexagram.judgment}
                  </p>
                </div>
              )}

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
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-amber-500/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto">
                <Scroll className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-serif text-amber-200 font-bold">
                Lançamento das Moedas
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Clique no botão de lançamento para gerar cada uma das 6 linhas do Hexagrama e revelar o oráculo do I Ching.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
