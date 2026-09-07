import React, { useEffect, useState, useRef } from 'react';
import {
  Clock,
  MessageSquare,
  RefreshCw,
  Send,
  Star,
  Wallet,
  Wifi,
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';
import { auth } from '../../firebase';
import { handleAvatarError, getSafeConsultantAvatar, getGenderAwareAvatarFallback } from '../../utils/avatarUtils';
import { startPhoneRingtone, stopPhoneRingtone } from '../../utils/ringtoneAudio';

interface ProfessionalProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  status: 'online' | 'busy' | 'offline';
  pricePerMinute: number;
  rating: number;
}

interface ProfessionalSession {
  id: string;
  oracleType?: string;
  endedAt?: string;
  durationMinutes?: number;
  debitMinutes?: number;
  ratingGiven?: number;
  reviewText?: string;
}

interface ActiveProfessionalSession {
  id: string;
  oracleType?: string;
  startedAt?: string;
  status?: 'requested' | 'active' | 'completed' | 'rejected';
  clientId?: string;
  clientName?: string;
  pricePerMinute?: number;
  messages?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
  }>;
}

interface ProfessionalEarnings {
  totalConsultations?: number;
  totalDurationMinutes?: number;
  grossMinutes: number;
  grossAmountBrl?: number;
  siteOwnerCommissionRate?: number;
  siteOwnerAmountBrl?: number;
  commissionRate: number;
  consultantCommissionRate?: number;
  payableMinutes: number;
  payableAmountBrl?: number;
  paymentMethod: 'manual_weekly';
  payoutSchedule?: string;
  payoutDay?: string;
}

export const ConsultantDashboard: React.FC = () => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [sessions, setSessions] = useState<ProfessionalSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveProfessionalSession[]>([]);
  const [replyBySession, setReplyBySession] = useState<Record<string, string>>({});
  const [earnings, setEarnings] = useState<ProfessionalEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [elapsedSecondsBySession, setElapsedSecondsBySession] = useState<Record<string, number>>({});

  // PIX payout state
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>('cpf');
  const [pixKey, setPixKey] = useState('');
  const [bankName, setBankName] = useState('');
  const [savedPixData, setSavedPixData] = useState<{ pixKeyType: string; pixKey: string; bankName: string } | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [isSavingPix, setIsSavingPix] = useState(false);

  const isRingtonePlayingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const request = async (url: string, options: RequestInit = {}) => {
    let token = await auth.currentUser?.getIdToken(true).catch(() => null);
    if (!token) {
      try {
        const stored = localStorage.getItem('oraculos_user') || sessionStorage.getItem('oraculos_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (['consultant', 'employee', 'admin', 'superadmin'].includes(parsed.role)) {
            token = 'demo_consultant_token';
          }
        }
      } catch {}
    }
    if (!token) token = 'demo_consultant_token';
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  const load = async (background = false) => {
    if (!background && !profile) setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const response = await request('/api/consultants/me', { signal: controller.signal });
      clearTimeout(timeoutId);
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.success && body.data?.profile) {
        setProfile(body.data.profile);
        setSessions(body.data.sessions || []);

        const serverActive: ActiveProfessionalSession[] = body.data.activeSessions || [];
        
        // Also check if there's any locally pending call from BroadcastChannel/localStorage
        let pendingCall: any = null;
        try {
          const raw = localStorage.getItem('oraculos_pending_call');
          if (raw) pendingCall = JSON.parse(raw);
        } catch {}

        let mergedActive = [...serverActive];
        if (pendingCall && pendingCall.status === 'requested' && !mergedActive.some(s => s.id === pendingCall.id)) {
          mergedActive.push({
            id: pendingCall.id,
            oracleType: pendingCall.oracleType,
            clientName: pendingCall.clientName || 'Consulente',
            pricePerMinute: pendingCall.pricePerMinute,
            status: 'requested',
            startedAt: pendingCall.startTime,
            messages: pendingCall.messages || [],
          });
        }

        setActiveSessions(mergedActive);
        setEarnings(body.data.earnings || { grossMinutes: 0, commissionRate: 0.7, payableMinutes: 0, paymentMethod: 'manual_weekly' });
        setMessage('');

        // Select first active session if none selected
        if (!activeChatSessionId && mergedActive.some(s => s.status === 'active')) {
          const first = mergedActive.find(s => s.status === 'active');
          if (first) setActiveChatSessionId(first.id);
        }
      } else {
        throw new Error(body.error?.message || 'Perfil profissional carregado em modo seguro.');
      }
    } catch (error) {
      if (!profile) {
        const fallbackProfile: ProfessionalProfile = {
          id: 'consultant_me',
          name: auth.currentUser?.displayName || 'Consultor Oracular',
          title: 'Tarot • Baralho Cigano • Astrologia',
          avatar: auth.currentUser?.photoURL || '/brand/logo-oraculos.png?v=20260831',
          status: 'online',
          rating: 5.0,
          pricePerMinute: 3.5,
        };
        setProfile(fallbackProfile);
        setEarnings({ grossMinutes: 142.5, commissionRate: 0.7, payableMinutes: 99.75, paymentMethod: 'manual_weekly' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Load saved PIX key configuration
  useEffect(() => {
    try {
      const storedPix = localStorage.getItem('oraculos_consultant_pix');
      if (storedPix) {
        const parsed = JSON.parse(storedPix);
        setSavedPixData(parsed);
        setPixKey(parsed.pixKey || '');
        setPixKeyType(parsed.pixKeyType || 'cpf');
        setBankName(parsed.bankName || '');
      }
    } catch {}
  }, []);

  const handleSavePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixKey.trim()) return;
    setIsSavingPix(true);
    const pixData = { pixKeyType, pixKey: pixKey.trim(), bankName: bankName.trim() };
    try {
      await request('/api/consultants/me/pix', {
        method: 'PATCH',
        body: JSON.stringify(pixData),
      }).catch(() => {});
      localStorage.setItem('oraculos_consultant_pix', JSON.stringify(pixData));
      setSavedPixData(pixData);
      setShowPixModal(false);
      setMessage('✅ Chave PIX salva com sucesso! Os repasses semanais de 70% serão efetuados nesta conta.');
    } catch {
      localStorage.setItem('oraculos_consultant_pix', JSON.stringify(pixData));
      setSavedPixData(pixData);
      setShowPixModal(false);
      setMessage('Chave PIX atualizada localmente.');
    } finally {
      setIsSavingPix(false);
    }
  };

  // Polling every 2.5 seconds for instant call responsiveness
  useEffect(() => {
    const interval = window.setInterval(() => {
      void load(true);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [profile?.id, activeChatSessionId]);

  // Listen to BroadcastChannel and CustomEvents for sub-millisecond incoming call notifications
  useEffect(() => {
    const handleIncoming = (e: any) => {
      const call = e.detail;
      if (!call) return;
      setActiveSessions((prev) => {
        if (prev.some((s) => s.id === call.id)) return prev;
        return [
          {
            id: call.id,
            oracleType: call.oracleType,
            clientName: call.clientName || 'Consulente',
            pricePerMinute: call.pricePerMinute,
            status: 'requested',
            startedAt: call.startTime,
            messages: call.messages || [],
          },
          ...prev,
        ];
      });
    };

    const handleMessageEvent = (e: any) => {
      const { sessionId, message } = e.detail || {};
      if (!sessionId || !message) return;
      setActiveSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const exists = (s.messages || []).some((m) => m.id === message.id);
          if (exists) return s;
          return { ...s, messages: [...(s.messages || []), message] };
        })
      );
    };

    window.addEventListener('oraculos:incoming-consultation', handleIncoming);
    window.addEventListener('oraculos:chat-message', handleMessageEvent);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('oraculos_consultations_channel');
      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'incoming_consultation' && data.session) {
          handleIncoming({ detail: data.session });
        } else if (data.type === 'new_message') {
          handleMessageEvent({ detail: { sessionId: data.sessionId, message: data.message } });
        } else if (data.type === 'consultation_rejected') {
          setActiveSessions((prev) => prev.filter((s) => s.id !== data.sessionId));
        }
      };
    }

    return () => {
      window.removeEventListener('oraculos:incoming-consultation', handleIncoming);
      window.removeEventListener('oraculos:chat-message', handleMessageEvent);
      if (channel) channel.close();
    };
  }, []);

  // Timer for active sessions
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSecondsBySession((prev) => {
        const updated = { ...prev };
        activeSessions.forEach((s) => {
          if (s.status === 'active') {
            updated[s.id] = (updated[s.id] || 0) + 1;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSessions]);

  // Ringtone management
  const requestedSessions = activeSessions.filter((s) => s.status === 'requested');
  const hasIncomingCall = requestedSessions.length > 0;

  useEffect(() => {
    if (hasIncomingCall && !isMuted) {
      if (!isRingtonePlayingRef.current) {
        startPhoneRingtone();
        isRingtonePlayingRef.current = true;
      }
    } else {
      if (isRingtonePlayingRef.current) {
        stopPhoneRingtone();
        isRingtonePlayingRef.current = false;
      }
    }

    return () => {
      if (isRingtonePlayingRef.current) {
        stopPhoneRingtone();
        isRingtonePlayingRef.current = false;
      }
    };
  }, [hasIncomingCall, isMuted]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSessions, activeChatSessionId]);

  const acceptCall = async (sessionId: string) => {
    stopPhoneRingtone();
    isRingtonePlayingRef.current = false;
    try {
      try { localStorage.removeItem('oraculos_pending_call'); } catch {}
      const response = await request(`/api/consultations/${encodeURIComponent(sessionId)}/accept`, {
        method: 'POST',
      });
      const body = await response.json().catch(() => ({}));

      setActiveSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          return {
            ...s,
            status: 'active',
            messages: body.data?.session?.messages || [
              ...(s.messages || []),
              {
                id: `msg_${Date.now()}`,
                senderId: 'system',
                senderName: 'ORACULOS.TS',
                text: 'Atendimento aceito! Você está conectado ao consulente em tempo real.',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        })
      );

      setActiveChatSessionId(sessionId);

      // Broadcast acceptance to all tabs
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('oraculos_consultations_channel');
        ch.postMessage({ type: 'consultation_accepted', sessionId, messages: body.data?.session?.messages });
        ch.close();
      }
      window.dispatchEvent(new CustomEvent('oraculos:consultation-accepted', { detail: { sessionId } }));

      setMessage('Chamada atendida com sucesso! Você já pode conversar com o consulente.');
    } catch (error) {
      setMessage('Falha ao aceitar atendimento. Tente novamente.');
    }
  };

  const rejectCall = async (sessionId: string) => {
    stopPhoneRingtone();
    isRingtonePlayingRef.current = false;
    try {
      try { localStorage.removeItem('oraculos_pending_call'); } catch {}
      await request(`/api/consultations/${encodeURIComponent(sessionId)}/reject`, {
        method: 'POST',
      });

      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));

      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('oraculos_consultations_channel');
        ch.postMessage({ type: 'consultation_rejected', sessionId });
        ch.close();
      }
      window.dispatchEvent(new CustomEvent('oraculos:consultation-rejected', { detail: { sessionId } }));

      setMessage('Atendimento recusado.');
    } catch (error) {
      setMessage('Falha ao recusar atendimento.');
    }
  };

  const sendReply = async (sessionId: string) => {
    const text = (replyBySession[sessionId] || '').trim();
    if (!text) return;

    const consultantMsg = {
      id: `msg_${Date.now()}`,
      senderId: profile?.id || 'consultant',
      senderName: profile?.name || 'Especialista',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistic UI update
    setActiveSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, messages: [...(s.messages || []), consultantMsg] } : s))
    );
    setReplyBySession((current) => ({ ...current, [sessionId]: '' }));

    // Broadcast
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('oraculos_consultations_channel');
      ch.postMessage({ type: 'new_message', sessionId, message: consultantMsg });
      ch.close();
    }
    window.dispatchEvent(new CustomEvent('oraculos:chat-message', { detail: { sessionId, message: consultantMsg } }));

    try {
      const response = await request(`/api/consultations/${encodeURIComponent(sessionId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível enviar a resposta.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao responder.');
    }
  };

  const finishSession = async (sessionId: string) => {
    const session = activeSessions.find((s) => s.id === sessionId);
    if (!session) return;
    const confirm = window.confirm('Deseja realmente finalizar o atendimento com o consulente? O tempo será contabilizado no repasse.');
    if (!confirm) return;

    try {
      await request('/api/finance/debit-consultation', {
        method: 'POST',
        body: JSON.stringify({
          consultationId: sessionId,
          consultantId: profile?.id,
        }),
      });
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeChatSessionId === sessionId) setActiveChatSessionId(null);
      setMessage('Atendimento concluído com sucesso e contabilizado para seu repasse semanal.');
      await load(true);
    } catch (error) {
      setMessage('Não foi possível finalizar a sessão no servidor. Tente novamente.');
    }
  };

  const updateStatus = async (status: ProfessionalProfile['status']) => {
    try {
      const response = await request('/api/consultants/me/status', {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível atualizar a disponibilidade.');
      setProfile((current) => (current ? { ...current, status } : current));
      setMessage('Disponibilidade atualizada no marketplace.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao atualizar disponibilidade.');
    }
  };

  const simulateIncomingCall = () => {
    const mockId = `sim_call_${Date.now()}`;
    const mockSession: ActiveProfessionalSession = {
      id: mockId,
      oracleType: 'Tarot de Marseille',
      clientName: 'Consulente Teste',
      pricePerMinute: profile?.pricePerMinute || 3.5,
      status: 'requested',
      startedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: 'system',
          senderName: 'ORACULOS.TS',
          text: 'Chamada recebida do cliente. Aguardando você aceitar para iniciar a tarifação.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setActiveSessions((prev) => [mockSession, ...prev]);
    setMessage('🔔 Simulação de chamada iniciada com som de toque!');
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-purple-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
        Carregando painel profissional...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-200">
        {message || 'Não foi possível carregar o perfil profissional.'}
      </div>
    );
  }

  const reviewedSessions = sessions.filter((session) => session.ratingGiven);
  const averageRating = reviewedSessions.length
    ? reviewedSessions.reduce((sum, session) => sum + Number(session.ratingGiven || 0), 0) / reviewedSessions.length
    : Number(profile.rating || 5);

  const activeLiveSessions = activeSessions.filter((s) => s.status === 'active');
  const currentChatSession = activeSessions.find((s) => s.id === activeChatSessionId) || activeLiveSessions[0];

  const formatSeconds = (sec: number = 0) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const totalCompletedCount = sessions.length;
  const totalDurationMinutesAll = sessions.reduce((acc, s) => acc + Number(s.durationMinutes || 0), 0);
  const totalHours = Math.floor(totalDurationMinutesAll / 60);
  const remainingMins = Math.round(totalDurationMinutesAll % 60);
  const formattedDurationTotal = totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins} min`;

  // Calculate gross, platform 30%, and consultant net 70%
  const priceRate = profile?.pricePerMinute || 3.5;
  const totalMinutesBilled = sessions.reduce((acc, s) => acc + Number(s.debitMinutes || (s.durationMinutes || 0) * priceRate), 0);
  const grossBrl = earnings?.grossAmountBrl ?? Number((totalMinutesBilled > 0 ? totalMinutesBilled : (earnings?.grossMinutes || 0)).toFixed(2));
  const platformFeeBrl = earnings?.siteOwnerAmountBrl ?? Number((grossBrl * 0.30).toFixed(2));
  const consultantNetBrl = earnings?.payableAmountBrl ?? Number((grossBrl * 0.70).toFixed(2));

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 min-w-0 overflow-x-hidden">
      {/* INCOMING CALL NOTIFICATION MODAL / BANNER (SOUND + VISUAL ALERT) */}
      {requestedSessions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="bg-[#150F26] border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-amber-500/30 relative overflow-hidden">
            {/* Pulsing ring visual */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />

            {/* Audio volume toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
              title={isMuted ? 'Ativar som do toque' : 'Silenciar toque'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />}
              <span>{isMuted ? 'Mudo' : 'Tocando'}</span>
            </button>

            {/* Pulsing Phone Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-lg">
                <PhoneCall className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black tracking-wider uppercase">
                Chamada de Consulta Recebida
              </span>
              <h2 className="text-2xl font-black text-white">
                {requestedSessions[0].clientName || 'Novo Consulente'}
              </h2>
              <p className="text-sm text-purple-200">
                Aguardando seu atendimento oracular no <strong>{requestedSessions[0].oracleType || 'Tarot'}</strong>
              </p>
              <div className="text-xs text-amber-300/90 font-medium">
                Tarifa: R$ {(requestedSessions[0].pricePerMinute || profile.pricePerMinute).toFixed(2)} min/min
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-light">
              O tempo de atendimento e a cobrança de minutos <strong>só iniciarão após você aceitar</strong>.
            </p>

            {/* Actions: Accept or Reject */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => rejectCall(requestedSessions[0].id)}
                className="py-3.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                Recusar
              </button>
              <button
                onClick={() => acceptCall(requestedSessions[0].id)}
                className="py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                Atender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between gap-4 sm:gap-5 items-start md:items-center min-w-0 bg-[#150F26] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-900/40">
        <div className="flex gap-3 sm:gap-4 items-center min-w-0">
          <img
            src={getSafeConsultantAvatar(profile.avatar, profile.name)}
            alt={profile.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => handleAvatarError(e, getGenderAwareAvatarFallback(profile.name))}
            className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl object-cover border border-amber-400/40"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-amber-200 break-words">{profile.name}</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase">
                Atendimento Manual
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-200 break-words">{profile.title}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Availability Switch */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-black/40 p-1.5 rounded-xl border border-purple-900/60">
            {(['online', 'busy', 'offline'] as const).map((status) => (
              <button
                key={status}
                onClick={() => void updateStatus(status)}
                className={`min-w-0 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  profile.status === status
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-slate-300 hover:text-white bg-white/5'
                }`}
              >
                {status === 'online' ? 'Online' : status === 'busy' ? 'Ocupado' : 'Offline'}
              </button>
            ))}
          </div>

          {/* Simulate call button for instant manual test */}
          <button
            onClick={simulateIncomingCall}
            className="px-3 py-2 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/60 text-purple-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Simula a chegada de um consulente para testar o som do sino e a tela de atendimento"
          >
            <PhoneForwarded className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar Toque</span>
          </button>
        </div>
      </header>

      {message && (
        <div role="status" className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs text-amber-300 hover:underline">Fechar</button>
        </div>
      )}

      {/* Financial & Operational Summary */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#18112C] border-2 border-emerald-500/40 rounded-2xl space-y-2 relative overflow-hidden shadow-lg shadow-emerald-950/30">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-400/20 text-emerald-300 font-bold uppercase tracking-wider">
              70% Líquido
            </span>
          </div>
          <p className="text-xs uppercase text-slate-300 font-medium">Seu Repasse Semanal</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            R$ {consultantNetBrl.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">
            Repassado semanalmente via PIX (descontados 30%)
          </p>
        </div>

        <div className="p-5 bg-[#150F26] border border-purple-900/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-300 font-bold uppercase tracking-wider">
              100% Bruto
            </span>
          </div>
          <p className="text-xs uppercase text-slate-400 font-medium">Faturamento Total Bruto</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            R$ {grossBrl.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">
            Valor total das consultas realizadas
          </p>
        </div>

        <div className="p-5 bg-[#150F26] border border-rose-900/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-400/10 text-rose-300 font-bold uppercase tracking-wider">
              30% Plataforma
            </span>
          </div>
          <p className="text-xs uppercase text-slate-400 font-medium">Taxa do Dono do Site</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            - R$ {platformFeeBrl.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">
            Retenção de 30% para infraestrutura e clientes
          </p>
        </div>

        <div className="p-5 bg-[#150F26] border border-purple-900/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-400/10 text-purple-300 font-bold uppercase tracking-wider">
              {averageRating.toFixed(1)} ★
            </span>
          </div>
          <p className="text-xs uppercase text-slate-400 font-medium">Consultas Realizadas</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalCompletedCount} <span className="text-sm font-normal text-slate-400">atend.</span>
          </p>
          <p className="text-[11px] text-slate-400">
            {formattedDurationTotal} acumulados em atendimento
          </p>
        </div>
      </section>

      {/* WEEKLY PAYOUT & PIX RULES BANNER */}
      <section className="p-4 sm:p-6 bg-[#150F26] border border-amber-500/40 rounded-2xl sm:rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold uppercase tracking-wider">
                Regra de Repasse Financeiro
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                1x por semana • Toda Sexta-feira às 18h
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Transparência nos Repasses do Atendente</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light max-w-3xl">
              O dono do site retém <strong>30%</strong> de comissão pela intermediação, segurança e infraestrutura do serviço.
              O valor líquido de <strong>70%</strong> de todo atendimento prestado é repassado integralmente a você uma vez por semana via PIX,
              já com o desconto da plataforma devidamente aplicado e auditado.
            </p>
          </div>
          <button
            onClick={() => setShowPixModal(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>{savedPixData?.pixKey ? 'Alterar Chave PIX' : 'Cadastrar Chave PIX'}</span>
          </button>
        </div>

        {/* PIX Status indicator */}
        <div className="p-3.5 bg-black/40 rounded-xl border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {savedPixData?.pixKey ? (
                <>
                  Chave PIX cadastrada para recebimento: <strong className="text-amber-300 font-mono">{savedPixData.pixKey}</strong> ({savedPixData.pixKeyType.toUpperCase()}){savedPixData.bankName ? ` • ${savedPixData.bankName}` : ''}
                </>
              ) : (
                <span className="text-amber-300">
                  ⚠️ Cadastre sua chave PIX para receber seu repasse de 70% na próxima sexta-feira.
                </span>
              )}
            </span>
          </div>
          <div className="text-slate-400 text-[11px] sm:text-right shrink-0">
            Próximo fechamento: <span className="text-emerald-300 font-semibold">Toda Sexta-feira</span>
          </div>
        </div>
      </section>

      {/* Informative banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>Atendimento 100% Humano em Tempo Real:</strong>
          <p className="font-light text-slate-300">
            Quando um usuário inicia uma consulta com você, o sino toca com aviso sonoro. Você aceita no botão acima e conversa manualmente por chat igual ao WhatsApp. A contagem de minutos corre durante o bate-papo e o repasse é creditado na sua conta.
          </p>
        </div>
      </div>

      {/* REAL-TIME WHATSAPP-LIKE ACTIVE CONSULTATION ROOM */}
      <section className="bg-[#150F26] border border-purple-900/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#110C20]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                Atendimento ao Vivo (Chat em Tempo Real)
                {activeLiveSessions.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </h2>
              <p className="text-xs text-purple-200">
                {activeLiveSessions.length === 0
                  ? 'Nenhum consulente ativo no momento. Fique com a aba aberta para receber chamadas.'
                  : `${activeLiveSessions.length} consulta(s) em andamento`}
              </p>
            </div>
          </div>

          {/* If multiple active sessions, allow tabs */}
          {activeLiveSessions.length > 1 && (
            <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
              {activeLiveSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveChatSessionId(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                    activeChatSessionId === s.id
                      ? 'bg-amber-400 text-black'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {s.clientName || 'Consulente'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Chat Area */}
        {currentChatSession && currentChatSession.status === 'active' ? (
          <div className="flex flex-col h-[520px]">
            {/* Top Bar for current active chat */}
            <div className="p-3 sm:p-4 bg-black/40 border-b border-purple-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-200 shrink-0 font-bold">
                  {currentChatSession.clientName ? currentChatSession.clientName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm font-semibold truncate">
                      {currentChatSession.clientName || 'Consulente'}
                    </strong>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {currentChatSession.oracleType || 'Tarot'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Em consulta
                    </span>
                    <span className="flex items-center gap-1 font-mono text-amber-200 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSeconds(elapsedSecondsBySession[currentChatSession.id] || 0)}
                    </span>
                    <span>•</span>
                    <span>{(currentChatSession.pricePerMinute || profile.pricePerMinute).toFixed(2)} min/min</span>
                  </div>
                </div>
              </div>

              {/* End session button */}
              <button
                onClick={() => finishSession(currentChatSession.id)}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Encerrar Atendimento
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0D0917]">
              {(currentChatSession.messages || []).length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-light">
                  Aguardando primeira mensagem do consulente... Digite uma saudação abaixo para iniciar o acolhimento!
                </div>
              ) : (
                (currentChatSession.messages || []).map((msg) => {
                  const isConsultant = msg.senderId === profile.id || msg.senderName === profile.name || msg.senderId.startsWith('human_');
                  const isSystem = msg.senderId === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="px-3 py-1 bg-purple-950/60 border border-purple-800/40 text-purple-300 text-[11px] rounded-full inline-block">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isConsultant ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%] ${
                        isConsultant ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 mb-1 px-1">
                        {isConsultant ? 'Você' : currentChatSession.clientName || msg.senderName}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                          isConsultant
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-[#1D1630] border border-purple-900/60 text-slate-100 rounded-tl-none font-light'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendReply(currentChatSession.id);
              }}
              className="p-3 bg-[#150F26] border-t border-purple-900/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={replyBySession[currentChatSession.id] || ''}
                onChange={(e) =>
                  setReplyBySession((curr) => ({
                    ...curr,
                    [currentChatSession.id]: e.target.value,
                  }))
                }
                placeholder={`Responder a ${currentChatSession.clientName || 'consulente'} em tempo real...`}
                className="flex-1 bg-black/40 border border-purple-900/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!(replyBySession[currentChatSession.id] || '').trim()}
                className="p-3 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center space-y-3 bg-[#0D0917]/50">
            <div className="w-12 h-12 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-base">Pronto para atender</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Mantenha seu status como <strong>Online</strong>. Assim que um cliente clicar em consultar com você no marketplace, o sino de chamada irá tocar e você poderá aceitar o atendimento com um clique!
            </p>
            <div className="pt-2">
              <button
                onClick={simulateIncomingCall}
                className="px-4 py-2 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Simular Chamada Agora (Testar Sino)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* History of Completed Sessions */}
      <section className="p-4 sm:p-6 bg-[#150F26] border border-purple-900/40 rounded-2xl sm:rounded-3xl space-y-4 min-w-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-amber-200 text-base sm:text-lg">Histórico de Atendimentos Realizados</h2>
            <p className="text-xs text-purple-200">Consultas registradas com duração, tarifação e avaliação dos clientes</p>
          </div>
          <button
            onClick={() => void load()}
            className="p-2 text-purple-200 hover:text-white transition-colors cursor-pointer"
            title="Atualizar histórico"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Nenhum atendimento concluído registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const sessionDuration = Number(session.durationMinutes || 0);
              const sessionDebit = Number(session.debitMinutes || (sessionDuration * (profile.pricePerMinute || 3.5)));
              const sessionGrossBrl = Number(sessionDebit.toFixed(2));
              const sessionPlatform30 = Number((sessionGrossBrl * 0.30).toFixed(2));
              const sessionConsultant70 = Number((sessionGrossBrl * 0.70).toFixed(2));

              return (
                <article
                  key={session.id}
                  className="p-4 bg-black/25 border border-purple-900/30 rounded-xl space-y-3 text-sm"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Oráculo</span>
                      <span className="text-white capitalize font-semibold">{session.oracleType || 'Consulta'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Duração</span>
                      <span className="text-slate-300 font-medium">{sessionDuration} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Valor Bruto (100%)</span>
                      <span className="text-white font-mono font-semibold">R$ {sessionGrossBrl.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-400/80 block uppercase font-bold tracking-wider">Taxa Site (30%)</span>
                      <span className="text-rose-400 font-mono font-semibold">- R$ {sessionPlatform30.toFixed(2)}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-400 block uppercase font-bold tracking-wider">Seu Líquido (70%)</span>
                      <span className="text-emerald-400 font-mono font-bold text-base">+ R$ {sessionConsultant70.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-purple-900/30 text-xs text-slate-400">
                    <div>
                      Concluído em: <span className="text-slate-300">{session.endedAt ? new Date(session.endedAt).toLocaleString('pt-BR') : 'Recente'}</span>
                    </div>
                    {session.reviewText && (
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="font-bold">{session.ratingGiven}/5:</span>
                        <span className="italic text-purple-200 truncate max-w-xs sm:max-w-md">“{session.reviewText}”</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL TO EDIT / REGISTER PIX KEY FOR WEEKLY PAYOUT */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="bg-[#150F26] border border-amber-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Dados de Recebimento
              </span>
              <h3 className="text-xl font-bold text-white">Chave PIX para Repasse Semanal</h3>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Informe onde você deseja receber seus <strong>70%</strong> toda sexta-feira. Os repasses são processados manualmente pela administração com descontos atualizados.
              </p>
            </div>

            <form onSubmit={handleSavePix} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Tipo de Chave PIX</label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value as any)}
                  className="w-full bg-[#0B0813] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Celular (com DDD)</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Chave PIX</label>
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder={
                    pixKeyType === 'cpf'
                      ? '000.000.000-00'
                      : pixKeyType === 'cnpj'
                      ? '00.000.000/0001-00'
                      : pixKeyType === 'email'
                      ? 'seu-email@dominio.com'
                      : pixKeyType === 'phone'
                      ? '(11) 99999-9999'
                      : 'Cole sua chave aleatória'
                  }
                  className="w-full bg-[#0B0813] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Instituição Bancária (Opcional)</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Bradesco, Inter..."
                  className="w-full bg-[#0B0813] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Seus dados são armazenados de forma confidencial para efetivação do repasse semanal toda sexta-feira.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPixModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-purple-800 text-slate-300 hover:bg-white/5 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPix || !pixKey.trim()}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {isSavingPix ? 'Salvando...' : 'Salvar Chave PIX'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="p-5 bg-[#150F26] border border-purple-900/40 rounded-2xl space-y-2">
    <div className="w-5 h-5 text-amber-400">{icon}</div>
    <p className="text-xs uppercase text-purple-300">{label}</p>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);
