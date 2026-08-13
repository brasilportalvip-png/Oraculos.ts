import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Bot, Send, Sparkles, RefreshCw, BookmarkPlus } from 'lucide-react';
import { ReadingEntry } from '../types/oracle';

interface OracleAiModuleProps {
  initialPrompt?: string;
  initialContext?: any;
  onSaveReading: (entry: Omit<ReadingEntry, 'id' | 'timestamp'>) => void;
}

export const OracleAiModule: React.FC<OracleAiModuleProps> = ({
  initialPrompt = '',
  initialContext = null,
  onSaveReading,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [context, setContext] = useState(initialContext);
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && !context) return;

    sound.playSingingBowl(580);
    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      const data = await res.json();
      setResponse(data.text || 'O oráculo silenciou por um instante.');
    } catch (err) {
      console.error(err);
      setResponse('Erro ao conectar com o plano estelar. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToJournal = () => {
    if (!response) return;
    onSaveReading({
      oracleType: 'ai-sacerdotisa',
      title: `Consulta com a Sacerdotisa IA`,
      summary: prompt || 'Consulta Oracular Mística',
      details: {
        prompt,
        context,
        response,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-purple-700 to-indigo-900 border border-amber-400/50 flex items-center justify-center mx-auto gold-glow">
          <Bot className="w-7 h-7 text-amber-200" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-amber-200">
          A Sacerdotisa IA & Síntese Oracular
        </h2>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Consulte a inteligência estelar alimentada pelo modelo Gemini para interpretar dúvidas, integrar tiragens e receber mantras de vida.
        </p>
      </div>

      {/* Context Badge if coming from another module */}
      {context && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Contexto Carregado: <strong>{context.tipoOraculo || 'Tiragem Oracular'}</strong></span>
          </div>
          <button
            onClick={() => setContext(null)}
            className="text-[10px] text-slate-400 hover:text-red-300 underline"
          >
            Remover Contexto
          </button>
        </div>
      )}

      {/* Query Input */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl space-y-4">
        <form onSubmit={handleSendQuery} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-amber-300 block mb-2">
              Sua Pergunta ou Reflexão ao Oráculo
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ex: Qual orientação o universo me reserva para esta semana de decisões?"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Consultando as Estrelas...' : 'Consultar Sacerdotisa'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Response Display */}
      {response && (
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/40 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-amber-200 text-lg">
                Sábia Orientação da Sacerdotisa
              </h3>
            </div>

            <button
              onClick={handleSaveToJournal}
              className="px-3.5 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-amber-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4 text-amber-300" />
              <span>Salvar no Diário</span>
            </button>
          </div>

          <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
            {response}
          </div>
        </div>
      )}

    </div>
  );
};
