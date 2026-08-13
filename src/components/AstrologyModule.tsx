import React, { useState } from 'react';
import { ZODIAC_SIGNS, getCurrentMoonPhase, calculateNatalChart } from '../data/horoscopeData';
import { NatalChartSummary, ReadingEntry } from '../types/oracle';
import { sound } from '../utils/audio';
import { Sun, Moon, Sparkles, User, Calendar, MapPin, Clock, BookmarkPlus, Bot } from 'lucide-react';

interface AstrologyModuleProps {
  onSaveReading: (entry: Omit<ReadingEntry, 'id' | 'timestamp'>) => void;
  onSynthesizeAi: (prompt: string, context: any) => void;
}

export const AstrologyModule: React.FC<AstrologyModuleProps> = ({
  onSaveReading,
  onSynthesizeAi,
}) => {
  const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const [activeTab, setActiveTab] = useState<'horoscope' | 'natal' | 'moon'>('horoscope');

  // Natal Chart Form State
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('1995-07-15');
  const [birthTime, setBirthTime] = useState('14:30');
  const [birthPlace, setBirthPlace] = useState('São Paulo, Brasil');
  const [chartResult, setChartResult] = useState<NatalChartSummary | null>(null);

  const moonPhase = getCurrentMoonPhase();
  const selectedSign = ZODIAC_SIGNS.find(s => s.id === selectedSignId) || ZODIAC_SIGNS[0];

  const handleCalculateChart = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSingingBowl(528);
    const result = calculateNatalChart(name, birthDate, birthTime, birthPlace);
    setChartResult(result);
  };

  const handleSaveHoroscope = () => {
    onSaveReading({
      oracleType: 'astrology',
      title: `Horóscopo Diário — ${selectedSign.namePt} (${selectedSign.symbol})`,
      summary: `Amor: ${selectedSign.dailyForecast.love} | Trabalho: ${selectedSign.dailyForecast.work}`,
      details: {
        sign: selectedSign,
        moonPhase,
      },
    });
  };

  const handleSaveNatalChart = () => {
    if (!chartResult) return;
    onSaveReading({
      oracleType: 'astrology',
      title: `Mapa Astral de ${chartResult.name}`,
      summary: `Sol em ${chartResult.sunSign}, Lua em ${chartResult.moonSign}, Ascendente em ${chartResult.ascendantSign}`,
      details: {
        chartResult,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header & Sub-Navigation Tabs */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-400" />
            Astrologia & Trânsitos Celestes
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Consulte horóscopos diários, a fase da Lua em tempo real e calculadoras de Mapa Astral.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('horoscope')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'horoscope'
                ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/40'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Horóscopo Diário
          </button>
          <button
            onClick={() => setActiveTab('natal')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'natal'
                ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/40'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Mapa Astral
          </button>
          <button
            onClick={() => setActiveTab('moon')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'moon'
                ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/40'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Fase da Lua
          </button>
        </div>
      </div>

      {/* TAB 1: HORÓSCOPO DIÁRIO */}
      {activeTab === 'horoscope' && (
        <div className="space-y-8">
          
          {/* Zodiac Signs Selection Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ZODIAC_SIGNS.map((sign) => {
              const isSelected = sign.id === selectedSignId;
              return (
                <button
                  key={sign.id}
                  onClick={() => {
                    sound.playSingingBowl(350);
                    setSelectedSignId(sign.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-600/30 to-purple-900/40 border-amber-400 text-amber-100 shadow-lg gold-glow scale-105'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-200 hover:border-amber-500/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{sign.symbol}</div>
                  <div className="font-serif font-bold text-xs">{sign.namePt}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">{sign.dates}</div>
                </button>
              );
            })}
          </div>

          {/* Forecast Detail Card */}
          <div className="glass-panel p-8 rounded-2xl border border-amber-500/30 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-900/40 border border-amber-400/50 flex items-center justify-center text-3xl text-amber-300">
                  {selectedSign.symbol}
                </div>
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                    {selectedSign.dates} • Elemento {selectedSign.element}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-amber-100">
                    Previsão para {selectedSign.namePt}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-900 text-amber-300 border border-slate-800">
                  Planeta Regente: {selectedSign.rulingPlanet}
                </span>
              </div>
            </div>

            {/* Forecast Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-serif font-bold text-pink-300 text-sm flex items-center gap-2">
                  💖 Amor & Afetos
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSign.dailyForecast.love}
                </p>
              </div>

              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2">
                  💼 Trabalho & Finanças
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSign.dailyForecast.work}
                </p>
              </div>

              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-serif font-bold text-purple-300 text-sm flex items-center gap-2">
                  ✨ Espiritualidade & Mantra
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSign.dailyForecast.spiritual}
                </p>
              </div>
            </div>

            {/* Daily Vibes */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400 font-mono">Número da Sorte: <strong className="text-amber-300">{selectedSign.dailyForecast.luckyNumber}</strong></span>
                <span className="text-slate-400 font-mono">Cor de Poder: <strong className="text-amber-300">{selectedSign.dailyForecast.color}</strong></span>
              </div>

              <button
                onClick={handleSaveHoroscope}
                className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-amber-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookmarkPlus className="w-4 h-4 text-amber-300" />
                <span>Salvar Horóscopo no Diário</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: MAPA ASTRAL SIMPLIFICADO */}
      {activeTab === 'natal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <h3 className="font-serif font-bold text-amber-200 text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Dados do Consulente
            </h3>

            <form onSubmit={handleCalculateChart} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-amber-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-amber-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Horário (Aproximado)</label>
                  <input
                    type="time"
                    required
                    value={birthTime}
                    onChange={e => setBirthTime(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-amber-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Cidade / País de Nascimento</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={e => setBirthPlace(e.target.value)}
                  placeholder="Ex: Rio de Janeiro, Brasil"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-amber-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md cursor-pointer"
              >
                Calcular Triad Astral (Sol, Lua & Ascendente)
              </button>
            </form>
          </div>

          {/* Result Display */}
          <div className="lg:col-span-7">
            {chartResult ? (
              <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                    Mapa Astral de {chartResult.name}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-amber-100 mt-1">
                    Tríade de Poder Pessoal
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 text-center">
                    <span className="text-2xl block mb-1">☀️</span>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Signo Solar</span>
                    <strong className="text-amber-200 font-serif text-lg">{chartResult.sunSign}</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">Sua essência e vitalidade</span>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 text-center">
                    <span className="text-2xl block mb-1">🌙</span>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Signo Lunar</span>
                    <strong className="text-amber-200 font-serif text-lg">{chartResult.moonSign}</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">Sua alma e emoções</span>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 text-center">
                    <span className="text-2xl block mb-1">🌅</span>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Ascendente</span>
                    <strong className="text-amber-200 font-serif text-lg">{chartResult.ascendantSign}</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">Sua máscara e projeção</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveNatalChart}
                    className="px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-amber-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <BookmarkPlus className="w-4 h-4 text-amber-300" />
                    <span>Salvar Mapa Astral no Diário</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-amber-500/30 space-y-4">
                <Sun className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-serif font-bold text-amber-200">
                  Preencha os Dados Astrais
                </h3>
                <p className="text-xs text-slate-400">
                  Insira sua data, horário e local de nascimento ao lado para calcular sua tríade astrológica.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: FASE DA LUA EM TEMPO REAL */}
      {activeTab === 'moon' && (
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center gap-8">
          
          <div className="w-40 h-40 rounded-full bg-slate-950 border-2 border-amber-400/50 flex items-center justify-center text-7xl shadow-2xl gold-glow flex-shrink-0">
            {moonPhase.symbol}
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Fase Lunar de Hoje • ~{moonPhase.illumination}% Iluminação
              </span>
              <h3 className="text-3xl font-serif font-bold text-amber-100">
                {moonPhase.phaseName}
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {moonPhase.guidance}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-mono">Propício para:</span>
              {moonPhase.favorableFor.map((fav, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  ✨ {fav}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
