import React, { useState } from 'react';
import { TAROT_DECK } from '../data/tarotData';
import { TarotCard, TarotSpreadType, DrawnTarotCard, ReadingEntry } from '../types/oracle';
import { sound } from '../utils/audio';
import { Sparkles, RefreshCw, BookmarkPlus, Bot, Eye, Layers, Compass } from 'lucide-react';

interface TarotModuleProps {
  onSaveReading: (entry: Omit<ReadingEntry, 'id' | 'timestamp'>) => void;
  onSynthesizeAi: (prompt: string, context: any) => void;
}

export const TarotModule: React.FC<TarotModuleProps> = ({
  onSaveReading,
  onSynthesizeAi,
}) => {
  const [spread, setSpread] = useState<TarotSpreadType>('three_cards');
  const [drawnCards, setDrawnCards] = useState<DrawnTarotCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [question, setQuestion] = useState('');
  const [activeTabCard, setActiveTabCard] = useState<number>(0);

  const spreadsInfo: Record<TarotSpreadType, { label: string; count: number; positions: string[] }> = {
    daily: {
      label: 'Carta do Dia',
      count: 1,
      positions: ['Energia & Orientação Principal'],
    },
    three_cards: {
      label: 'Três Cartas (Tríade)',
      count: 3,
      positions: ['Passado & Raízes', 'Presente & Desafios', 'Futuro & Tendência'],
    },
    love: {
      label: 'Amor & Relacionamentos',
      count: 3,
      positions: ['Sua Energia no Amor', 'A Energia do Outro / Situação', 'O Conselho da União'],
    },
    decision: {
      label: 'Decisão / Duas Vias',
      count: 2,
      positions: ['Caminho A (Primeira Opção)', 'Caminho B (Segunda Opção)'],
    },
  };

  const handleShuffleAndDraw = () => {
    sound.playCardFlip();
    setIsShuffling(true);
    setFlippedIndices([]);
    setDrawnCards([]);

    setTimeout(() => {
      const deckCopy = [...TAROT_DECK].sort(() => Math.random() - 0.5);
      const neededCount = spreadsInfo[spread].count;
      const selected = deckCopy.slice(0, neededCount);

      const drawn: DrawnTarotCard[] = selected.map((card, idx) => ({
        card,
        isReversed: Math.random() < 0.25, // 25% chance of reversed
        positionLabel: spreadsInfo[spread].positions[idx] || `Posição ${idx + 1}`,
      }));

      setDrawnCards(drawn);
      setIsShuffling(false);
      setActiveTabCard(0);
    }, 600);
  };

  const handleFlipCard = (index: number) => {
    if (!flippedIndices.includes(index)) {
      sound.playCardFlip();
      setFlippedIndices(prev => [...prev, index]);
    }
    setActiveTabCard(index);
  };

  const handleSaveToJournal = () => {
    if (drawnCards.length === 0) return;
    const summaryText = drawnCards
      .map(d => `${d.positionLabel}: ${d.card.namePt} (${d.isReversed ? 'Invertida' : 'Direta'})`)
      .join(' | ');

    onSaveReading({
      oracleType: 'tarot',
      title: `Tiragem de Tarô — ${spreadsInfo[spread].label}`,
      summary: summaryText,
      details: {
        spread,
        question,
        cards: drawnCards,
      },
      notes: question ? `Pergunta do Consulente: "${question}"` : undefined,
    });
  };

  const handleConsultAi = () => {
    if (drawnCards.length === 0) return;
    const contextData = {
      tipoOraculo: 'Tarô',
      tiragem: spreadsInfo[spread].label,
      cartasTiradas: drawnCards.map(d => ({
        posicao: d.positionLabel,
        carta: d.card.namePt,
        orientacao: d.isReversed ? 'Invertida' : 'Direta',
        palavrasChave: d.card.keywords,
      })),
    };

    onSynthesizeAi(
      question || 'Qual é a síntese profunda e orientação das cartas selecionadas?',
      contextData
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Controls Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-400" />
              Tarô Divinatório Sagrado
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Consulte os 78 Arcanos para iluminar escolhas, relacionamentos e caminhos de vida.
            </p>
          </div>

          {/* Spread Picker Buttons */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(spreadsInfo) as TarotSpreadType[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSpread(key);
                  setDrawnCards([]);
                  setFlippedIndices([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  spread === key
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 shadow-md gold-glow'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-amber-200 hover:border-amber-500/30'
                }`}
              >
                {spreadsInfo[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Question Input */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Qual dúvida ou intenção você traz ao oráculo? (Opcional)"
            className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors"
          />

          <button
            onClick={handleShuffleAndDraw}
            disabled={isShuffling}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'Embaralhando...' : 'Embaralhar & Tirar Cartas'}</span>
          </button>
        </div>
      </div>

      {/* Cards Area */}
      {drawnCards.length > 0 ? (
        <div className="space-y-8">
          
          {/* Card Spread Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {drawnCards.map((drawn, idx) => {
              const isFlipped = flippedIndices.includes(idx);
              const isSelected = activeTabCard === idx;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => handleFlipCard(idx)}
                >
                  {/* Position Label */}
                  <span className="text-xs font-mono text-amber-300/80 uppercase tracking-wider mb-2 font-semibold">
                    {drawn.positionLabel}
                  </span>

                  {/* 3D Card Container */}
                  <div className={`w-48 h-80 perspective-1000 transition-transform duration-300 ${isSelected ? 'scale-105' : 'hover:scale-102'}`}>
                    <div
                      className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* CARD BACK */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-slate-950 via-purple-950 to-indigo-950 border-2 border-amber-500/40 shadow-2xl p-4 flex flex-col items-center justify-between backface-hidden">
                        <div className="w-full h-full rounded-xl border border-amber-400/20 flex flex-col items-center justify-center p-3 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-950/80 to-slate-950">
                          <Sparkles className="w-10 h-10 text-amber-400/40 animate-pulse" />
                          <span className="text-[10px] font-mono text-amber-300/60 uppercase tracking-widest mt-4">
                            Clique para Revelar
                          </span>
                        </div>
                      </div>

                      {/* CARD FRONT */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-400/60 shadow-2xl p-4 flex flex-col items-center justify-between backface-hidden rotate-y-180">
                        <div className="w-full text-right font-mono text-[10px] text-amber-400/70">
                          #{drawn.card.number}
                        </div>

                        {/* Card Graphic/Symbol */}
                        <div className={`my-auto text-center transform transition-transform ${drawn.isReversed ? 'rotate-180' : ''}`}>
                          <div className="text-5xl mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                            {drawn.card.symbol}
                          </div>
                          <h3 className="font-serif font-bold text-amber-200 text-sm leading-tight">
                            {drawn.card.namePt}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1.5 inline-block font-mono ${
                            drawn.isReversed
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {drawn.isReversed ? 'Invertida' : 'Posição Direta'}
                          </span>
                        </div>

                        {/* Keywords */}
                        <div className="w-full text-center">
                          <span className="text-[10px] text-amber-300/80 font-mono block truncate">
                            {drawn.card.element} • {drawn.card.keywords[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Interpretation Panel for Active Card */}
          {flippedIndices.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 shadow-2xl animate-fadeIn space-y-6">
              
              {/* Card Selector Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3 overflow-x-auto">
                {drawnCards.map((drawn, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playSingingBowl(400);
                      setActiveTabCard(idx);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTabCard === idx
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 font-bold'
                        : 'text-slate-400 hover:text-amber-200 bg-slate-900/40'
                    }`}
                  >
                    <span>{drawn.positionLabel}:</span>
                    <span className="text-amber-300 font-serif">{drawn.card.namePt}</span>
                  </button>
                ))}
              </div>

              {/* Active Card Interpretation */}
              {drawnCards[activeTabCard] && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                        {drawnCards[activeTabCard].positionLabel}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
                        <span>{drawnCards[activeTabCard].card.symbol}</span>
                        <span>{drawnCards[activeTabCard].card.namePt}</span>
                        <span className="text-xs font-mono font-normal text-slate-400">
                          ({drawnCards[activeTabCard].card.nameEn})
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-950 text-amber-200 border border-indigo-700/50">
                        Elemento: {drawnCards[activeTabCard].card.element}
                      </span>
                    </div>
                  </div>

                  {/* Keywords Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {drawnCards[activeTabCard].card.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 text-amber-200/90 border border-slate-700/80"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Meaning Text */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-200 space-y-2">
                    <p className="font-semibold text-amber-300">
                      Meaning ({drawnCards[activeTabCard].isReversed ? 'Carta Invertida' : 'Carta Direta'}):
                    </p>
                    <p>
                      {drawnCards[activeTabCard].isReversed
                        ? drawnCards[activeTabCard].card.reversedMeaning
                        : drawnCards[activeTabCard].card.uprightMeaning}
                    </p>
                    <div className="pt-2 border-t border-slate-800 text-xs text-amber-200/80 italic">
                      ✨ Conselhos do Oráculo: {drawnCards[activeTabCard].card.advice}
                    </div>
                  </div>
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
          )}

        </div>
      ) : (
        /* Empty State Placeholder */
        <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-amber-500/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-serif text-amber-200 font-bold">
            O Baralho Sagrado Está Pronto
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Escolha um tipo de tiragem acima, formule sua pergunta em mente e clique no botão para embaralhar e tirar as cartas.
          </p>
        </div>
      )}

    </div>
  );
};
