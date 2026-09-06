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
  Compass,
  Scroll,
  Info,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useConsultation } from '../context/ConsultationContext';
import { useAuth } from '../context/AuthContext';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';
import { auth } from '../firebase';

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

const [isEndingConsultation, setIsEndingConsultation] =
  useState(false);

const [endConsultationError, setEndConsultationError] =
  useState<string | null>(null);
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Video/Media Stream state
  const [videoStatus, setVideoStatus] = useState<'idle' | 'requesting' | 'connected' | 'error'>('idle');
  const [videoError, setVideoError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSession) {
      setMode(activeSession.mode);
    }
  }, [activeSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Handle Video Media Setup
  useEffect(() => {
    let isCancelled = false;

    const startMedia = async () => {
      if (mode !== 'video') {
        stopMedia();
        return;
      }

      setVideoStatus('requesting');
      setVideoError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setVideoStatus('error');
        setVideoError('Seu navegador não possui suporte à transmissão de vídeo WebRTC.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setIsVideoOn(true);
        setIsMicOn(true);
        setVideoStatus('connected');
      } catch (err: any) {
        if (isCancelled) return;
        setVideoStatus('error');
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setVideoError('Permissão de câmera ou microfone não concedida no navegador. Você pode habilitar nas permissões ou continuar pelo Chat Seguro.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setVideoError('Nenhuma câmera ou microfone foi detectado neste dispositivo.');
        } else {
          setVideoError('Não foi possível inicializar a transmissão de mídia. Prossiga via Chat Seguro.');
        }
      }
    };

    const stopMedia = () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setVideoStatus('idle');
      setVideoError(null);
    };

    startMedia();

    return () => {
      isCancelled = true;
      stopMedia();
    };
  }, [mode]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideoTrack = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  if (!activeSession) return null;

  const isVirtual =
    activeSession.consultantId.startsWith('ai_') ||
    activeSession.consultantId.startsWith('c_ai_');

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleFinishConsultation = () => {
  setShowEndConfirm(false);
  setEndConsultationError(null);
  setShowReviewModal(true);
};

  const submitReviewAndExit = async () => {
  if (isEndingConsultation) {
    return;
  }

  setIsEndingConsultation(true);
  setEndConsultationError(null);

  const result =
    await endConsultation(
      rating,
      reviewText,
    );

  if (!result.success) {
    setEndConsultationError(
      result.message ||
        'Não foi possível encerrar a consulta com segurança.',
    );

    setIsEndingConsultation(false);
    return;
  }

  if (localStreamRef.current) {
  localStreamRef.current
    .getTracks()
    .forEach((track) =>
      track.stop(),
    );

  localStreamRef.current = null;
}

setShowReviewModal(false);
setIsEndingConsultation(false);

try {
  sessionStorage.removeItem('oraculos_active_session');
  localStorage.removeItem('oraculos_active_session');
  sessionStorage.removeItem('oraculos_last_route');
} catch {}

window.location.assign('/');
};

  const handleAskAiCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiInterpretation(null);

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setAiLoading(false);
      setAiInterpretation('Sua sessão expirou ou você não está autenticado. Por favor, faça login novamente para acessar a leitura.');
      return;
    }

    let idToken = '';
    try {
      idToken = await firebaseUser.getIdToken();
    } catch {
      setAiLoading(false);
      setAiInterpretation('Não foi possível obter o token de sessão. Por favor, entre novamente na sua conta.');
      return;
    }

    try {
      const res = await fetch('/api/ai/oracle-interpretation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          oracleType: activeSession?.oracleType || 'tarot',
          cardOrSymbol: 'Tiragem em Tempo Real',
          userQuestion: aiQuestion || 'Orientação espiritual para a dúvida atual',
          contextPrompt: 'Atendimento oracular na sala ORACULOS.TS',
          consultantId: activeSession?.consultantId,
          userProfile: {
            fullName: user?.birthFullName || user?.name || '',
            birthFullName: user?.birthFullName || user?.name || '',
            name: user?.name || '',
            birthDate: user?.birthDate || '',
            birthTime: user?.doesNotKnowBirthTime ? undefined : user?.birthTime || undefined,
          },
        }),
      });

      const data = await res.json();
      const interpretation = data?.data?.interpretation || data?.interpretation;

      if (res.ok && interpretation) {
        setAiInterpretation(interpretation);
      } else {
        setAiInterpretation(
          data?.error?.message || 'Não foi possível obter resposta no momento.'
        );
      }
    } catch (err) {
      console.error('Erro ao consultar a interpretação oracular:', err);
      setAiInterpretation('Não foi possível conectar com os oráculos no momento. Tente novamente em instantes.');
    } finally {
      setAiLoading(false);
    }
  };

  // Specialized Oracle Button Text
  const getOracleButtonLabel = () => {
    switch (activeSession.oracleType) {
      case 'tarot': return 'Tirar Arcano do Tarot';
      case 'cigano': return 'Tirar Carta Cigana';
      case 'astrologia': return 'Trânsito Planetário';
      case 'numerologia': return 'Calcular Vibração';
      case 'buzios': return 'Jogar os 16 Búzios';
      case 'ifa': return 'Consultar Odù de Ifá';
      case 'runas': return 'Lançar Runas';
      case 'iching': return 'Jogar Moedas I Ching';
      case 'cristais': return 'Emanar Cristal';
      case 'mesaradionica': return 'Medir no Pêndulo';
      default: return 'Tirar Carta do Oráculo';
    }
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
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Consultor Especialista
              </span>
              <span className="hidden xs:inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {oracleInfo?.name || activeSession.oracleType}
              </span>
            </div>
            <p className="text-xs text-purple-300/80">Atendimento Privado em Tempo Real</p>
          </div>
        </div>

        {/* Live Timer & Balance Counter */}
        <div className="hidden sm:flex items-center gap-4 bg-[#1F1638] px-4 py-1.5 rounded-xl border border-purple-800/40">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formattedTime}</span>
          </div>
          <div className="h-4 w-[1px] bg-purple-800/60" />
          <div className="text-xs text-slate-300">
            Consumo: <strong className="text-amber-300">{consumedWalletMinutes.toFixed(2)} min</strong>
          </div>
          <div className="h-4 w-[1px] bg-purple-800/60" />
          <div className="flex items-center gap-1 text-xs text-purple-200">
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span>Saldo: {remainingWalletMinutes.toFixed(2)} min</span>
          </div>
        </div>

        {/* Mode Switcher & Exit Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#1F1638] rounded-xl border border-purple-900/60">
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'chat'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              disabled
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'video'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Vídeo em breve
            </button>
          </div>

          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Encerrar</span>
          </button>
        </div>
      </header>

      {/* Room Protection Banner */}
      <div className="px-4 py-1.5 bg-purple-950/50 border-b border-purple-800/40 text-center text-xs text-purple-200 flex items-center justify-center gap-2">
        <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>Atendimento confidencial e em tempo real com especialista oracular credenciado.</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Video Mode Container */}
        {mode === 'video' && (
          <div className="flex-1 bg-slate-950 relative flex flex-col items-center justify-center p-4">
            {videoStatus === 'requesting' && (
              <div className="text-center space-y-3 p-6 glass-card border border-white/10 rounded-2xl max-w-sm">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Solicitando acesso à câmera e microfone...</p>
                <p className="text-xs text-gray-400">Por favor, permita o acesso na caixa de diálogo do seu navegador.</p>
              </div>
            )}

            {videoStatus === 'error' && (
              <div className="max-w-md p-6 bg-[#150F26] border border-rose-800/40 rounded-2xl shadow-2xl space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Dispositivo de Vídeo Indisponível</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">{videoError}</p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => setMode('chat')}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition"
                  >
                    Continuar via Chat Interativo
                  </button>
                </div>
              </div>
            )}

            {videoStatus === 'connected' && (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="max-h-full max-w-full rounded-2xl object-cover border border-purple-800/50 shadow-2xl"
                />

                {/* In-Call Media Controls Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                  <button
                    onClick={toggleMic}
                    className={`p-3 rounded-xl transition-colors cursor-pointer ${
                      isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-rose-600 text-white'
                    }`}
                    title={isMicOn ? 'Mutar microfone' : 'Ativar microfone'}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleVideoTrack}
                    className={`p-3 rounded-xl transition-colors cursor-pointer ${
                      isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-rose-600 text-white'
                    }`}
                    title={isVideoOn ? 'Desativar câmera' : 'Ativar câmera'}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Container */}
        <div className={`flex-1 flex flex-col bg-[#0B0813] ${mode === 'video' ? 'hidden md:flex border-l border-purple-900/40 md:w-[380px] lg:w-[420px]' : 'w-full'}`}>
          {/* Messages Stream */}
          <div className="flex-1 min-h-0 p-4 overflow-y-scroll space-y-3.5">
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
                            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Símbolo Revelado</span>
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
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full font-semibold transition-colors cursor-pointer"
            >
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              {getOracleButtonLabel()}
            </button>
            <button
              onClick={() => setShowAiCopilot(!showAiCopilot)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Interpretação Complementar
            </button>
          </div>

          {/* AI Copilot Drawer */}
          <AnimatePresence>
            {showAiCopilot && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#150F26] border-t border-purple-800/60 p-4 space-y-3 overflow-hidden text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Copiloto de Interpretação Profunda</span>
                  </div>
                  <button
                    onClick={() => setShowAiCopilot(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAskAiCopilot} className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Faça uma pergunta específica para aprofundar a leitura..."
                    className="flex-1 bg-[#0B0813] border border-purple-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? 'Lendo...' : 'Interpretar'}
                  </button>
                </form>
                {aiInterpretation && (
                  <div className="p-3 bg-[#0B0813] rounded-xl border border-purple-900 text-slate-200 leading-relaxed font-light whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {aiInterpretation}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-[#150F26] border-t border-purple-900/50 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem ou dúvida para o oráculo..."
              className="flex-1 bg-[#0B0813] border border-purple-900/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-xl font-bold transition-all shadow-md cursor-pointer"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal to End Session */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#150F26] border border-purple-800/60 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Deseja encerrar o atendimento?</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              O tempo de consulta decorrido foi de <strong>{formattedTime}</strong>. A tarifação será finalizada e você poderá avaliar o especialista.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-purple-800 text-slate-300 hover:bg-purple-900/40 text-xs font-semibold cursor-pointer"
              >
                Continuar Consulta
              </button>
              <button
                onClick={handleFinishConsultation}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Encerrar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal on Exit */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#150F26] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
  Finalizar Atendimento
</span>
              
<h3 className="text-lg font-bold text-white">Como foi sua experiência?</h3>
              <p className="text-xs text-slate-400 font-light">Sua avaliação ajuda a manter a excelência da plataforma.</p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
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
  value={reviewText}
  onChange={(e) => setReviewText(e.target.value)}
  placeholder="Deixe um comentário sobre a clareza e acolhimento da consulta (opcional)..."
  rows={3}
  className="w-full bg-[#0B0813] border border-purple-800/60 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-light"
/>

{endConsultationError && (
  <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />

    <span>
      {endConsultationError}
    </span>
  </div>
)}

            <button
  onClick={submitReviewAndExit}
  disabled={isEndingConsultation}
  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer uppercase tracking-wider"
>
  {isEndingConsultation
    ? 'Finalizando com segurança...'
    : 'Enviar Avaliação e Voltar ao Início'}
</button>
          </div>
        </div>
      )}
    </div>
  );
};
