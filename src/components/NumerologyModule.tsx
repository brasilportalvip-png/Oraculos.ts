import React, { useState } from 'react';
import { calculateNumerology } from '../data/numerologyData';
import { NumerologyResult, ReadingEntry } from '../types/oracle';
import { sound } from '../utils/audio';
import { Hash, BookmarkPlus, Bot, Sparkles, User, Calendar } from 'lucide-react';

interface NumerologyModuleProps {
  onSaveReading: (entry: Omit<ReadingEntry, 'id' | 'timestamp'>) => void;
  onSynthesizeAi: (prompt: string, context: any) => void;
}

export const NumerologyModule: React.FC<NumerologyModuleProps> = ({
  onSaveReading,
  onSynthesizeAi,
}) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1990-05-20');
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSingingBowl(480);
    const numRes = calculateNumerology(fullName, birthDate);
    setResult(numRes);
  };

  const handleSaveToJournal = () => {
    if (!result) return;
    onSaveReading({
      oracleType: 'numerology',
      title: `Numerologia — ${result.fullName}`,
      summary: `Caminho de Vida: ${result.lifePathNumber} | Expressão: ${result.expressionNumber} | Desejo da Alma: ${result.soulUrgeNumber}`,
      details: {
        result,
      },
    });
  };

  const handleConsultAi = () => {
    if (!result) return;
    const contextData = {
      tipoOraculo: 'Numerologia Cabalística & Pitagórica',
      consulente: result.fullName,
      caminhoDeVida: result.lifePathNumber,
      numeroExpressao: result.expressionNumber,
      desejoDaAlma: result.soulUrgeNumber,
      numeroMestre: result.isMasterNumber,
    };

    onSynthesizeAi(
      `Sintetize o mapa numerológico de ${result.fullName} com conselho prático.`,
      contextData
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl">
        <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-2">
          <Hash className="w-6 h-6 text-amber-400" />
          Numerologia Cabalística & Pitagórica
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Descubra a vibração matemática do seu nome e data de nascimento (Caminho de Vida, Expressão & Desejo da Alma).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-amber-500/20 space-y-4">
          <h3 className="font-serif font-bold text-amber-200 text-lg">
            Calculadora de Vibração Numérica
          </h3>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Nome Completo de Nascimento
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ex: Maria Silva Santos"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-amber-100 placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Data de Nascimento
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-amber-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md cursor-pointer"
            >
              Calcular Vibrações Numéricas
            </button>
          </form>
        </div>

        {/* Numerology Result Display */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-6 animate-fadeIn">
              
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                    Mapa Numerológico de {result.fullName}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-amber-100 mt-1">
                    Vibrações Pitagóricas
                  </h3>
                </div>

                {result.isMasterNumber && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    ✨ Número Mestre Presente
                  </span>
                )}
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 text-center">
                  <span className="text-3xl font-serif font-bold text-amber-300 block">
                    {result.lifePathNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mt-1">
                    Caminho de Vida
                  </span>
                  <span className="text-[10px] text-amber-200/80 block mt-1">Destino & Lições</span>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 text-center">
                  <span className="text-3xl font-serif font-bold text-amber-300 block">
                    {result.expressionNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mt-1">
                    Expressão
                  </span>
                  <span className="text-[10px] text-amber-200/80 block mt-1">Talentos no Mundo</span>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 text-center">
                  <span className="text-3xl font-serif font-bold text-amber-300 block">
                    {result.soulUrgeNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mt-1">
                    Desejo da Alma
                  </span>
                  <span className="text-[10px] text-amber-200/80 block mt-1">Anseios Íntimos</span>
                </div>
              </div>

              {/* Interpretation Breakdown */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
                <p><strong className="text-amber-300">{result.interpretation.lifePath}</strong></p>
                <p>{result.interpretation.expression}</p>
                <p>{result.interpretation.soulUrge}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveToJournal}
                  className="px-4 py-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 text-amber-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4 text-amber-300" />
                  <span>Salvar no Diário</span>
                </button>

                <button
                  onClick={handleConsultAi}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Sintetizar com Sacerdotisa IA</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-amber-500/30 space-y-4">
              <Hash className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
              <h3 className="text-lg font-serif font-bold text-amber-200">
                Aguardando Dados Numerológicos
              </h3>
              <p className="text-xs text-slate-400">
                Insira o nome completo de nascimento e a data ao lado para calcular os números sagrados.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
