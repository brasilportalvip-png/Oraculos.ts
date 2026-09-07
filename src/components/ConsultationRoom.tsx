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
  PhoneCall,
  Sparkles,
  Send,
  Star,
  Wallet,
  AlertCircle,
  Gem,
  Info,
  RefreshCw,
  X,
  CheckCircle2,
  PhoneForwarded,
} from 'lucide-react';
import { useConsultation } from '../context/ConsultationContext';
import { useAuth } from '../context/AuthContext';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';
import { auth } from '../firebase';
import { handleAvatarError, getSafeConsultantAvatar, getGenderAwareAvatarFallback } from '../utils/avatarUtils';

export const ConsultationRoom: React.FC = () => {
  const { user } = useAuth();
  const {
    activeSession,
    sendMessage,
    drawOracleCard,
    endConsultation,
    forceExitConsultation,
    cancelConsultationRequest,
  } = useConsultation();

  const [mode, setMode] = useState<'chat' | 'video'>('chat');
  const [inputText, setInputText] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEndingConsultation, setIsEndingConsultation] = useState(false);
  const [endConsultationError, setEndConsultationError] = useState<string | null>(null);
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
          setVideoError('Permissão de câmera ou microfone não concedida. Você pode continuar pelo Chat Seguro.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setVideoError('Nenhuma câmera ou microfone detectado.');
        } else {
          setVideoError('Não foi possível inicializar o vídeo. Prossiga via Chat Seguro.');
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

  // 1. WAITING ROOM SCREEN: When session is 'requested'
  if (activeSession.status === 'requested') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0813] flex flex-col items-center justify-center p-4 min-h-[100dvh]">
        <div className="max-w-md w-full bg-[#150F26] border border-amber-400/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Pulsing ring visual */}
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none animate-pulse" />

          {/* Consultant Avatar with Ripple */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping duration-1000" />
            <span className="absolute -inset-2 rounded-full border border-amber-400/40 animate-pulse" />
            <img
              src={getSafeConsultantAvatar(activeSession.consultantAvatar, activeSession.consultantName)}
              alt={activeSession.consultantName}
              referrerPolicy="no-referrer"
              onError={(e) => handleAvatarError(e, getGenderAwareAvatarFallback(activeSession.consultantName))}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-amber-400 shadow-xl relative z-10"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Chamando Especialista
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeSession.consultantName}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200">
              Aguardando o especialista aceitar a chamada no painel dele...
            </p>
          </div>

          {/* Guarantee info box */}
          <div className="p-4 rounded-2xl bg-black/40 border border-purple-900/50 text-xs text-slate-300 space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Garantia de Cobrança Justa</span>
            </div>
            <p className="font-light text-slate-400 leading-relaxed">
              O cronômetro e o débito de minutos <strong>só começarão a contar após o especialista atender</strong>. Caso ele esteja ocupado, você pode cancelar a qualquer momento sem custo.
            </p>
          </div>

          {/* Cancel button */}
          <button
            onClick={() => void cancelConsultationRequest()}
            className="w-full py-3.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            Cancelar Chamada
          </button>
        </div>
      </div>
    );
  }

  // 2. REJECTED SCREEN: If consultant declined or is unavailable
  if (activeSession.status === 'rejected') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0813] flex flex-col items-center justify-center p-4 min-h-[100dvh]">
        <div className="max-w-md w-full bg-[#150F26] border border-rose-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
            <PhoneOff className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Especialista Ocupado</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeSession.consultantName} não pôde atender a chamada neste momento.
            </p>
            <p className="text-xs text-emerald-400 font-semibold">
              Nenhum minuto foi debitado do seu saldo.
            </p>
          </div>

          <button
            onClick={forceExitConsultation}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition-all cursor-pointer"
          >
            Voltar ao Marketplace
          </button>
        </div>
      </div>
    );
  }

  // 3. ACTIVE LIVE CONSULTATION
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
    (user?.minuteBalance || 0) - consumedWalletMinutes,
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

  const safeExitImmediately = async () => {
    setShowEndConfirm(false);
    setShowReviewModal(false);
    setIsEndingConsultation(true);
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      await endConsultation();
    } catch {
      // Ignored - fallback will ensure clean exit
    } finally {
      forceExitConsultation();
      setIsEndingConsultation(false);
    }
  };

  const submitReviewAndExit = async () => {
    if (isEndingConsultation) return;

    setIsEndingConsultation(true);
    setEndConsultationError(null);

    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      await endConsultation(rating, reviewText);
      setShowReviewModal(false);
    } catch {
      // Fallback
    } finally {
      forceExitConsultation();
      setIsEndingConsultation(false);
    }
  };

  const handleAskAiCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiInterpretation(null);

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setAiLoading(false);
      setAiInterpretation('Sua sessão expirou. Entre novamente na sua conta.');
      return;
    }

    let idToken = '';
    try {
      idToken = await firebaseUser.getIdToken();
    } catch {
      setAiLoading(false);
      setAiInterpretation('Não foi possível obter o token de sessão.');
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
        setAiInterpretation(data?.error?.message || 'Não foi possível obter resposta no momento.');
      }
    } catch (err) {
      setAiInterpretation('Não foi possível conectar com os oráculos no momento. Tente novamente em instantes.');
    } finally {
      setAiLoading(false);
    }
  };

  const getOracleButtonLabel = () => {
    switch (activeSession.oracleType) {
      case 'tarot':
        return 'Tirar Carta';
      case 'cigano':
        return 'Tirar Carta';
      case 'buzios':
        return 'Jogar Búzios';
      case 'runas':
        return 'Tirar Runa';
      case 'i-ching':
        return 'Consultar Moedas';
      default:
        return 'Tirar Símbolo';
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0B0813] text-slate-100 overflow-hidden relative">
      {/* Top Header */}
      <header className="shrink-0 h-16 sm:h-20 bg-[#150F26] border-b border-purple-900/60 px-3 sm:px-6 flex items-center justify-between gap-2 z-20">
        {/* Consultant Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={getSafeConsultantAvatar(activeSession.consultantAvatar, activeSession.consultantName)}
              alt={activeSession.consultantName}
              referrerPolicy="no-referrer"
              onError={(e) => handleAvatarError(e, getGenderAwareAvatarFallback(activeSession.consultantName))}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-400"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#150F26] rounded-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[120px] sm:max-w-xs">
                {activeSession.consultantName}
              </h2>
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {oracleInfo?.name || activeSession.oracleType}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-purple-300/80">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ao vivo
              </span>
              <span className="sm:hidden font-mono font-bold text-amber-300">
                {formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Live Timer & Balance (Tablet / Desktop) */}
        <div className="hidden sm:flex items-center gap-3 bg-[#1F1638] px-3.5 py-1.5 rounded-xl border border-purple-800/40">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formattedTime}</span>
          </div>
          <div className="h-3.5 w-[1px] bg-purple-800/60" />
          <div className="flex items-center gap-1 text-xs text-purple-200">
            <Wallet className="w-3 h-3 text-amber-400" />
            <span>Saldo: {remainingWalletMinutes.toFixed(2)} min</span>
          </div>
        </div>

        {/* Action / End Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Encerrar consulta"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden xs:inline">Encerrar</span>
          </button>
        </div>
      </header>

      {/* Main Chat/Video Area */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0B0813]">
        {/* Messages Scrollable Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 overscroll-contain">
          {activeSession.messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="space-y-2 my-2">
                  <div className="p-2.5 bg-[#150F26] border border-amber-500/30 rounded-xl text-center text-xs text-amber-300/90 shadow-sm flex items-center justify-center gap-2 max-w-lg mx-auto">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{msg.text}</span>
                  </div>

                  {msg.cardDrawn && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-950/80 to-[#1F1638] border border-amber-400/50 text-amber-200 shadow-xl space-y-2 max-w-md mx-auto"
                    >
                      <div className="flex items-center gap-3">
                        {msg.cardDrawn.imageUrl && (
                          <img
                            src={msg.cardDrawn.imageUrl}
                            alt={msg.cardDrawn.name}
                            className="w-14 h-20 object-cover rounded-lg border border-amber-400/60 shadow-md shrink-0"
                          />
                        )}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            Símbolo Revelado
                          </span>
                          <h4 className="text-base font-bold text-white">{msg.cardDrawn.name}</h4>
                          <p className="text-xs text-purple-200/90 italic">{msg.cardDrawn.meaning}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            }

            const isMe = msg.senderId === user?.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[75%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-purple-300/80">{msg.senderName}</span>
                  <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                </div>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md break-words ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-[#1D1630] border border-purple-900/60 text-slate-100 rounded-tl-none font-light'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Copilot Drawer (if open) */}
        <AnimatePresence>
          {showAiCopilot && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#150F26] border-t border-purple-900/60 p-3 overflow-hidden shrink-0 space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Copiloto Espiritual
                </span>
                <button
                  onClick={() => setShowAiCopilot(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAskAiCopilot} className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Pergunte ao copiloto sobre a tiragem..."
                  className="flex-1 bg-black/40 border border-purple-900 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shrink-0"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Pedir'}
                </button>
              </form>
              {aiInterpretation && (
                <div className="p-2.5 bg-black/50 rounded-xl text-xs text-slate-200 max-h-32 overflow-y-auto leading-relaxed">
                  {aiInterpretation}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Bar: Action Pill & Message Input (Mobile Keyboard-Safe) */}
        <div className="shrink-0 bg-[#150F26] border-t border-purple-900/60 p-2.5 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-30">
          {/* Quick Helper Tools (Oracle card, Copilot) */}
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
            <button
              onClick={drawOracleCard}
              className="px-3 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              <span>{getOracleButtonLabel()}</span>
            </button>
            <button
              onClick={() => setShowAiCopilot(!showAiCopilot)}
              className="px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-800/40 border border-purple-800/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Copiloto IA</span>
            </button>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-[#0B0813] border border-purple-900/70 rounded-xl px-3.5 py-3 text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 min-w-0"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 shrink-0 flex items-center justify-center bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-all shadow-md cursor-pointer"
              aria-label="Enviar mensagem"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal to End Session */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#150F26] border border-purple-800/60 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Encerrar atendimento?</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Tempo de consulta: <strong>{formattedTime}</strong>. Você poderá avaliar o atendimento do especialista a seguir.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleFinishConsultation}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg cursor-pointer"
              >
                Encerrar e Avaliar
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full py-2.5 rounded-xl border border-purple-800 text-slate-300 hover:bg-purple-900/40 text-xs font-semibold cursor-pointer"
              >
                Continuar Consulta
              </button>
              <button
                onClick={safeExitImmediately}
                className="text-[11px] text-slate-500 hover:text-slate-400 py-1 transition-colors"
              >
                Sair Imediatamente sem Avaliar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal on Exit */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#150F26] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 relative">
            <button
              onClick={safeExitImmediately}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg"
              title="Fechar e sair"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Finalizar Atendimento
              </span>
              <h3 className="text-lg font-bold text-white">Como foi sua experiência?</h3>
              <p className="text-xs text-slate-400 font-light">
                Sua avaliação ajuda outros consulentes na escolha do especialista.
              </p>
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
              placeholder="Deixe um comentário sobre a consulta (opcional)..."
              rows={3}
              className="w-full bg-[#0B0813] border border-purple-800/60 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-light resize-none"
            />

            {endConsultationError && (
              <div className="flex flex-col gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{endConsultationError}</span>
                </div>
                <button
                  onClick={safeExitImmediately}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs"
                >
                  Sair Mesmo Assim
                </button>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={submitReviewAndExit}
                disabled={isEndingConsultation}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                {isEndingConsultation ? 'Finalizando...' : 'Enviar Avaliação e Voltar ao Início'}
              </button>

              <button
                onClick={safeExitImmediately}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Pular Avaliação e Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
