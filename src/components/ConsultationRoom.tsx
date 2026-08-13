import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Video,
  MessageSquare,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
  Send,
  Star,
  Wallet,
  ShieldAlert,
  AlertCircle,
  Gem,
} from 'lucide-react';
import { useConsultation } from '../context/ConsultationContext';
import { useAuth } from '../context/AuthContext';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';

export const ConsultationRoom: React.FC = () => {
  const { user } = useAuth();
  const { activeSession, sendMessage, drawOracleCard, endConsultation } = useConsultation();

  const [mode, setMode] = useState<'chat' | 'video'>('chat');
  const [inputText, setInputText] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskAiCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiInterpretation(null);
    try {
      const res = await fetch('/api/ai/oracle-interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        










body: JSON.stringify({
  oracleType:
    activeSession?.oracleType ||
    'tarot',

  cardOrSymbol:
    'Tiragem em Tempo Real',

  userQuestion:
    aiQuestion ||
    'Orientação espiritual para a dúvida atual',

  contextPrompt:
    'Atendimento ao vivo na sala do ORACULOS.TS',

  userProfile: {
    fullName:
      user.birthFullName ||
      user.name,

    birthFullName:
      user.birthFullName ||
      user.name,

    name:
      user.name,

    birthDate:
      user.birthDate,

    birthTime:
      user.doesNotKnowBirthTime
        ? undefined
        : user.birthTime || undefined,
  },
}),








});

const data = await res.json();

const interpretation =
  data?.data?.interpretation ||
  data?.interpretation;

if (res.ok && interpretation) {
  setAiInterpretation(interpretation);
} else {
  setAiInterpretation(
    data?.error?.message ||
      'Não foi possível obter resposta no momento.',
  );
}
} catch (err) {
  console.error(
    'Erro ao consultar o copiloto oracular:',
    err,
  );

  setAiInterpretation(
    'Erro de conexão com a Inteligência Artificial Gemini.',
  );
} finally {
  setAiLoading(false);
}
};
     







  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSession) {
      setMode(activeSession.mode);
    }
  }, [activeSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  if (!activeSession) return null;

  const oracleInfo = ORACLE_CATEGORIES[activeSession.oracleType];

  // Duration formatting (00:00)
  const minutes = Math.floor(activeSession.durationSeconds / 60);
  const seconds = activeSession.durationSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  

const consumedWalletMinutes =
  (Math.ceil(activeSession.durationSeconds / 60) || 1) *
  activeSession.pricePerMinute;

const remainingWalletMinutes = Math.max(
  0,
  user.minuteBalance - consumedWalletMinutes,
);

const estimatedConsultationMinutes = Math.floor(
  remainingWalletMinutes / activeSession.pricePerMinute,
);



  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleFinishConsultation = () => {
    setShowEndConfirm(false);
    setShowReviewModal(true);
  };

  const submitReviewAndExit = () => {
    endConsultation(rating, reviewText);
    setShowReviewModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0813] text-slate-100 overflow-hidden font-sans">
      {/* Top Header Control Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#150F26] border-b border-purple-900/50 shadow-lg">
        {/* Consultant Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={activeSession.consultantAvatar}
              alt={activeSession.consultantName}
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#150F26] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm md:text-base text-amber-200">{activeSession.consultantName}</h2>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {oracleInfo?.name || activeSession.oracleType}
              </span>
            </div>
            <p className="text-xs text-purple-300/80">Atendimento Privado em Tempo Real</p>
          </div>
        </div>

        {/* Live Timer & Balance Counter */}
        <div className="hidden sm:flex items-center gap-4 bg-[#1F1638] px-4 py-1.5 rounded-xl border border-purple-800/40">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 animate-spin-slow text-emerald-400" />
            <span>{formattedTime}</span>
          </div>
          <div className="h-4 w-[1px] bg-purple-800/60" />
          



<div className="text-xs text-slate-300">
  Consumo:{' '}
  <strong className="text-amber-300">
    {consumedWalletMinutes.toFixed(2)} min
  </strong>
</div>

<div className="h-4 w-[1px] bg-purple-800/60" />

<div className="flex items-center gap-1 text-xs text-purple-200">
  <Wallet className="w-3.5 h-3.5 text-amber-400" />

  <span>
    Saldo: {remainingWalletMinutes.toFixed(2)} min
    {' '}(~{estimatedConsultationMinutes} min de atendimento)
  </span>
</div>




        </div>

        {/* Mode Switcher & Exit Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#1F1638] rounded-xl border border-purple-900/60">
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'chat'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'video'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Vídeo
            </button>
          </div>

          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Encerrar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Video Mode Container */}
        {mode === 'video' && (
          <div className="flex-1 bg-slate-950 relative flex flex-col items-center justify-center p-4">
            {/* Consultant Video Screen */}
            <div className="relative w-full max-w-3xl aspect-video bg-[#150F26] rounded-2xl border border-purple-800/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              {isVideoOn ? (
                <div className="relative w-full h-full">
                  <img
                    src={activeSession.consultantAvatar}
                    alt="Consultant Video Stream"
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  {/* Subtle mystic aura overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Transmissão HD Criptografada
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <VideoOff className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-slate-400">Vídeo temporariamente desativado</p>
                </div>
              )}

              {/* Client Self Mirror (PIP) */}
              <div className="absolute bottom-4 right-4 w-28 sm:w-36 aspect-video bg-black/90 border border-amber-500/40 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt="Você"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white">Você</span>
              </div>

              {/* Audio Visualizer Wave */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1">
                {[40, 75, 50, 90, 60, 30, 80].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, h, 10] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                    className="w-1 bg-amber-400/80 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Video Control Floating Bar */}
            <div className="flex items-center gap-3 mt-4 p-2 bg-[#150F26]/90 border border-purple-800/40 backdrop-blur-md rounded-2xl shadow-xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-xl border transition-all ${
                  isMicOn
                    ? 'bg-purple-900/40 border-purple-600/50 text-purple-200'
                    : 'bg-rose-600/30 border-rose-500/50 text-rose-300'
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl border transition-all ${
                  isVideoOn
                    ? 'bg-purple-900/40 border-purple-600/50 text-purple-200'
                    : 'bg-rose-600/30 border-rose-500/50 text-rose-300'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={drawOracleCard}
                className="flex items-center gap-2 px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-bold text-xs transition-colors"
              >
                <Gem className="w-4 h-4 text-amber-400" />
                Tirar Carta do Oráculo
              </button>

              <button
                onClick={() => setShowEndConfirm(true)}
                className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className={`flex-1 flex flex-col bg-[#0B0813] ${mode === 'video' ? 'hidden md:flex border-l border-purple-900/40 md:w-[380px] lg:w-[420px]' : 'w-full'}`}>
          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {activeSession.messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="space-y-2">
                    <div className="p-3 bg-[#150F26] border border-amber-500/30 rounded-xl text-center text-xs text-amber-300/90 shadow-sm flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{msg.text}</span>
                    </div>

                    {/* Card Drawn Display */}
                    {msg.cardDrawn && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-purple-950/80 to-[#1F1638] border border-amber-400/50 text-amber-200 shadow-xl space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          {msg.cardDrawn.imageUrl && (
                            <img
                              src={msg.cardDrawn.imageUrl}
                              alt={msg.cardDrawn.name}
                              className="w-16 h-20 object-cover rounded-lg border border-amber-400/60 shadow-md"
                            />
                          )}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Carta Revelada</span>
                            <h4 className="text-lg font-bold text-white">{msg.cardDrawn.name}</h4>
                            <p className="text-xs text-purple-200/90 italic">{msg.cardDrawn.meaning}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              }

              const isMe = msg.senderId === user.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-purple-300/80">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-[#1F1638] border border-purple-800/50 text-slate-100 rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Quick Action Chips */}
          <div className="p-2 border-t border-purple-900/30 bg-[#150F26]/60 flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={drawOracleCard}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full font-semibold transition-colors"
            >
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              Tirar Carta do Tarot
            </button>
            <button
              onClick={() => setShowAiCopilot(!showAiCopilot)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 rounded-full font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 gold-accent" />
              Copiloto IA Gemini
            </button>
            {['Qual o recado do amor?', 'Caminhos financeiros', 'Conselho para hoje'].map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="flex-shrink-0 px-3 py-1.5 bg-[#1F1638] hover:bg-purple-900/40 border border-purple-800/40 text-purple-200 rounded-full transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#150F26] border-t border-purple-900/50 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua dúvida para o consultor..."
              className="flex-1 px-4 py-2.5 bg-[#0B0813] border border-purple-900/60 rounded-xl text-sm text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal to End Consultation */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#150F26] border border-purple-800/50 rounded-2xl p-6 space-y-4 text-center">
            <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Deseja encerrar o atendimento?</h3>
            


<p className="text-xs text-slate-300">
  Sua sessão durou{' '}
  <strong className="text-amber-300">
    {formattedTime}
  </strong>
  . O consumo de{' '}
  <strong className="text-amber-300">
    {consumedWalletMinutes.toFixed(2)} min
  </strong>{' '}
  será debitado da sua carteira.
</p>




            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 bg-[#1F1638] hover:bg-purple-900/40 border border-purple-700/50 rounded-xl text-xs font-semibold text-slate-300"
              >
                Continuar Sessão
              </button>
              <button
                onClick={handleFinishConsultation}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white shadow-md"
              >
                Sim, Encerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Session Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#150F26] border border-amber-500/30 rounded-2xl p-6 space-y-5 text-center text-slate-100"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="w-7 h-7 fill-amber-400" />
            </div>

            <h3 className="text-xl font-bold text-amber-200">Como foi seu atendimento?</h3>
            <p className="text-xs text-slate-300">
              Avalie sua experiência com <strong className="text-amber-300">{activeSession.consultantName}</strong>
            </p>

            {/* Rating Stars */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1.5 transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Escreva um depoimento para o consultor (opcional)..."
              className="w-full p-3 bg-[#0B0813] border border-purple-900/60 rounded-xl text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
            />

            <button
              onClick={submitReviewAndExit}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Enviar Avaliação e Concluir
            </button>
          </motion.div>
        </div>
      )}

      {/* AI Copilot Drawer / Modal */}
      {showAiCopilot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-card border border-[#d4af37]/40 rounded-3xl p-6 space-y-4 bg-[#050508]/95 text-gray-100 shadow-2xl">
            <button
              onClick={() => setShowAiCopilot(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 gold-accent" />
              <h3 className="font-serif text-xl font-light text-white">Copiloto Oracular Gemini IA</h3>
            </div>
            <p className="text-xs text-gray-400 font-light">
              Solicite auxílio simbólico instantâneo para tiragens de {activeSession.oracleType.toUpperCase()} ou dúvidas profundas durante o atendimento.
            </p>

            <form onSubmit={handleAskAiCopilot} className="space-y-3">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ex: O que indica O Louco junto com a Imperatriz no amor?"
                className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2.5 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? 'Consultando Sabedoria IA...' : 'Interpretar com IA'}
              </button>
            </form>

            {aiInterpretation && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-h-60 overflow-y-auto space-y-2 text-xs text-gray-200 leading-relaxed font-light whitespace-pre-wrap">
                {aiInterpretation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
