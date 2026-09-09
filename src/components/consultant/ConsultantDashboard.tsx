import React, { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Check, Clock, MessageSquare, RefreshCw, Send, Star, Volume2, Wallet, Wifi, X } from 'lucide-react';
import { auth } from '../../firebase';
import { handleAvatarError, getSafeConsultantAvatar, getGenderAwareAvatarFallback } from '../../utils/avatarUtils';
import { VideoMeeting } from '../VideoMeeting';

interface ProfessionalProfile { id: string; name: string; avatar: string; title: string; status: 'online' | 'busy' | 'offline'; pricePerMinute: number; videoPricePerMinute?: number; videoEnabled?: boolean; rating: number; }
interface ProfessionalSession { id: string; oracleType?: string; endedAt?: string; durationMinutes?: number; debitMinutes?: number; ratingGiven?: number; reviewText?: string; }
interface ActiveProfessionalSession { id: string; mode?: 'chat' | 'video'; oracleType?: string; startedAt?: string; autoEndsAt?: string; messages?: Array<{ id: string; senderId: string; senderName: string; text: string; timestamp: string }>; }
interface PendingProfessionalSession { id: string; userId: string; mode?: 'chat' | 'video'; consultantName?: string; oracleType?: string; requestedAt?: string; expiresAt?: string; pricePerMinute?: number; }
interface ProfessionalEarnings { grossMinutes: number; commissionRate: number; payableMinutes: number; paymentMethod: 'manual_weekly'; }

export const ConsultantDashboard: React.FC = () => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [sessions, setSessions] = useState<ProfessionalSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveProfessionalSession[]>([]);
  const [pendingSessions, setPendingSessions] = useState<PendingProfessionalSession[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [replyBySession, setReplyBySession] = useState<Record<string, string>>({});
  const [earnings, setEarnings] = useState<ProfessionalEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const loadInProgress = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notifiedCallsRef = useRef<Set<string>>(new Set());

  const playCallSound = async () => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) throw new Error('Este navegador não oferece suporte ao teste de som.');
    const context = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === 'suspended') await context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(660, context.currentTime + 0.22);
    gain.gain.setValueAtTime(0.7, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.9);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + 0.9);
  };

  const request = async (url: string, options: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken().catch(() => null);
    if (!token) throw new Error('Sessão profissional expirada. Entre novamente.');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort('timeout'), 15000);
    try {
      return await fetch(url, { ...options, signal: options.signal || controller.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const load = async (background = false) => {
    if (loadInProgress.current) return;
    loadInProgress.current = true;
    if (!background && !profile) setLoading(true);
    try {
      const response = await request(background ? '/api/consultants/me?liveOnly=1' : '/api/consultants/me');
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.success && body.data?.profile) {
        setProfile(body.data.profile);
        if (Array.isArray(body.data.sessions)) setSessions(body.data.sessions);
        setPendingSessions(body.data.pendingSessions || []);
        setActiveSessions(body.data.activeSessions || []);
        if (body.data.earnings) setEarnings(body.data.earnings);
        setMessage('');
      } else {
        throw new Error(body.error?.message || 'Perfil profissional carregado em modo seguro.');
      }
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : '';
      setMessage(rawMessage.toLowerCase().includes('abort') || rawMessage.toLowerCase().includes('timeout')
        ? 'O histórico demorou mais que o esperado. O painel continua disponível e tentará novamente.'
        : rawMessage || 'Não foi possível carregar o painel profissional.');
    } finally {
      setLoading(false);
      loadInProgress.current = false;
    }
  };

  useEffect(() => {
    void load().then(() => void load(true));
  }, []);
  useEffect(() => {
    const interval = window.setInterval(() => { void load(true); }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!soundEnabled || pendingSessions.length === 0) return;
    const ring = () => {
      void playCallSound().catch(() => undefined);
      if ('vibrate' in navigator) navigator.vibrate([400, 180, 400]);
    };
    for (const session of pendingSessions) {
      if (!notifiedCallsRef.current.has(session.id)) {
        notifiedCallsRef.current.add(session.id);
        if ('Notification' in window && Notification.permission === 'granted') {
          const options = { body: `${session.mode === 'video' ? 'Vídeo' : 'Chat'} aguardando sua resposta.`, icon: '/brand/logo-oraculos.png', tag: `consultation-${session.id}`, requireInteraction: true };
          if ('serviceWorker' in navigator) void navigator.serviceWorker.ready.then((registration) => registration.showNotification('Novo atendimento — ORACULOS.TS', options));
          else try { new Notification('Novo atendimento — ORACULOS.TS', options); } catch {}
        }
      }
    }
    ring();
    const interval = window.setInterval(ring, 1400);
    return () => window.clearInterval(interval);
  }, [soundEnabled, pendingSessions.length]);

  useEffect(() => () => { void audioContextRef.current?.close(); }, []);

  const enableSound = async () => {
    await playCallSound();
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    localStorage.setItem('oraculos_call_sound', 'enabled');
    setSoundEnabled(true);
    setMessage('Campainha ativa. Mantenha esta página aberta para receber chamadas.');
  };

  const testSound = async () => {
    try {
      await playCallSound();
      if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
      localStorage.setItem('oraculos_call_sound', 'enabled');
      setSoundEnabled(true);
      setMessage('Som testado com sucesso. A campainha está ativada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível reproduzir o som. Verifique o volume do aparelho.');
    }
  };

  const decideCall = async (sessionId: string, decision: 'accept' | 'reject') => {
    try {
      const response = await request(`/api/consultations/${encodeURIComponent(sessionId)}/decision`, {
        method: 'POST', body: JSON.stringify({ decision }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível responder à chamada.');
      setPendingSessions((current) => current.filter((item) => item.id !== sessionId));
      setMessage(decision === 'accept' ? 'Atendimento aceito. O chat está liberado.' : 'Atendimento recusado e minutos liberados ao cliente.');
      await load(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao responder à chamada.'); }
  };

  const sendReply = async (sessionId: string) => {
    const text = (replyBySession[sessionId] || '').trim();
    if (!text) return;
    try {
      const response = await request(`/api/consultations/${encodeURIComponent(sessionId)}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível enviar a resposta.');
      setReplyBySession((current) => ({ ...current, [sessionId]: '' }));
      await load(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao responder.'); }
  };

  const endSession = async (sessionId: string, automatic = false) => {
    if (!profile || (!automatic && !window.confirm('Encerrar este atendimento e calcular o valor utilizado?'))) return;
    try {
      const response = await request('/api/finance/debit-consultation', {
        method: 'POST', body: JSON.stringify({ consultationId: sessionId, consultantId: profile.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível encerrar o atendimento.');
      setMessage('Atendimento encerrado e cobrança calculada pelo servidor.');
      await load(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao encerrar atendimento.'); }
  };

  useEffect(() => {
    const timers = activeSessions
      .filter((session) => session.autoEndsAt)
      .map((session) => window.setTimeout(() => { void endSession(session.id, true); }, Math.max(0, Date.parse(session.autoEndsAt!) - Date.now())));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activeSessions.map((session) => `${session.id}:${session.autoEndsAt || ''}`).join('|')]);

  const updateStatus = async (status: ProfessionalProfile['status']) => {
    try {
      const response = await request('/api/consultants/me/status', { method: 'PATCH', body: JSON.stringify({ status }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível atualizar a disponibilidade.');
      setProfile((current) => current ? { ...current, status } : current); setMessage('Disponibilidade atualizada no marketplace.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao atualizar disponibilidade.'); }
  };

  const toggleVideoAvailability = async () => {
    const next = !profile?.videoEnabled;
    try {
      const response = await request('/api/consultants/me/video-settings', { method: 'PATCH', body: JSON.stringify({ videoEnabled: next }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível alterar o vídeo.');
      setProfile((current) => current ? { ...current, videoEnabled: next } : current);
      setMessage(next ? 'Chamadas por vídeo ativadas.' : 'Chamadas por vídeo desativadas.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao alterar vídeo.'); }
  };

  if (loading) return <div className="py-24 text-center text-purple-200"><RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />Carregando painel profissional...</div>;
  if (!profile) return <div className="max-w-xl mx-auto py-20 text-center p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-200">{message}</div>;

  const reviewedSessions = sessions.filter((session) => session.ratingGiven);
  const averageRating = reviewedSessions.length ? reviewedSessions.reduce((sum, session) => sum + Number(session.ratingGiven || 0), 0) / reviewedSessions.length : Number(profile.rating || 5);

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 min-w-0 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between gap-4 sm:gap-5 items-start md:items-center min-w-0">
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
            <h1 className="text-xl sm:text-2xl font-black text-amber-200 break-words">{profile.name}</h1>
            <p className="text-xs sm:text-sm text-purple-200 break-words">{profile.title}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-[#150F26] p-2 rounded-xl border border-purple-900/60 w-full md:w-auto">
          {(['online', 'busy', 'offline'] as const).map((status) => <button key={status} onClick={() => void updateStatus(status)} className={`min-w-0 px-2 sm:px-3 py-2.5 rounded-lg text-[11px] sm:text-xs font-bold ${profile.status === status ? 'bg-amber-400 text-black' : 'text-slate-300 bg-white/5'}`}>{status === 'online' ? 'Online' : status === 'busy' ? 'Ocupado' : 'Offline'}</button>)}
        </div>
      </header>
      {message && <p role="status" className="p-3 bg-amber-500/10 text-amber-200 rounded-xl text-sm">{message}</p>}
      <section className="p-4 rounded-2xl bg-[#150F26] border border-purple-900/40 flex flex-wrap items-center justify-between gap-3"><div><strong className="text-white">Atendimento por vídeo</strong><p className="text-xs text-purple-200">Valor definido pelo administrador: {Number(profile.videoPricePerMinute || profile.pricePerMinute).toFixed(2)} min/min</p></div><button onClick={() => void toggleVideoAvailability()} className={`px-4 py-2 rounded-xl font-black ${profile.videoEnabled ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-300'}`}>{profile.videoEnabled ? 'Vídeo disponível' : 'Ativar vídeo'}</button></section>
      <section className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${pendingSessions.length ? 'bg-amber-500/15 border-amber-300 animate-pulse' : 'bg-[#150F26] border-purple-900/40'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black text-amber-200 flex items-center gap-2">{pendingSessions.length ? <BellRing className="w-6 h-6" /> : <Bell className="w-5 h-5" />} Chamadas aguardando</h2>
          <div className="flex flex-wrap gap-2">
            {!soundEnabled && <button onClick={() => void enableSound()} className="px-4 py-2 rounded-xl bg-amber-400 text-black font-black">Ativar campainha</button>}
            {soundEnabled && <span className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 font-bold">Campainha ativa</span>}
            <button onClick={() => void testSound()} className="px-4 py-2 rounded-xl border border-amber-300/50 bg-white/5 text-amber-200 font-bold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Testar som</button>
          </div>
        </div>
        {pendingSessions.length === 0 ? <p className="text-sm text-slate-400">Nenhuma solicitação neste momento.</p> : pendingSessions.map((session) => (
          <article key={session.id} className="p-5 rounded-2xl bg-black/40 border border-amber-300/50 space-y-3">
            <div><p className="text-xl font-black text-white">Novo atendimento por {session.mode === 'video' ? 'vídeo' : 'chat'}</p><p className="text-sm text-purple-200 capitalize">{session.oracleType || 'Consulta'} • {Number(session.pricePerMinute || 0).toFixed(2)} min/min</p></div>
            <p className="text-xs text-amber-200">Responda rapidamente. A solicitação expira automaticamente.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => void decideCall(session.id, 'accept')} className="py-3 rounded-xl bg-emerald-500 text-black font-black flex items-center justify-center gap-2"><Check className="w-5 h-5" /> Aceitar</button>
              <button onClick={() => void decideCall(session.id, 'reject')} className="py-3 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center gap-2"><X className="w-5 h-5" /> Recusar</button>
            </div>
          </article>
        ))}
      </section>
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={<Wallet />} label="Repasse acumulado" value={`${earnings?.payableMinutes.toFixed(2) || '0.00'} min`} />
        <Metric icon={<Clock />} label="Atendimentos" value={String(sessions.length)} />
        <Metric icon={<Star />} label="Avaliação" value={averageRating.toFixed(1)} />
        <Metric icon={<Wifi />} label="Valor definido pelo admin" value={`${profile.pricePerMinute.toFixed(2)} min/min`} />
      </section>
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200">Pagamento manual semanal: o administrador confere este relatório e realiza o repasse fora da plataforma. Não existe saque automático.</div>
      <section className="p-4 sm:p-6 bg-[#150F26] border border-purple-900/40 rounded-2xl sm:rounded-3xl space-y-4 min-w-0">
        <h2 className="font-bold text-amber-200 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Atendimentos ativos</h2>
        {activeSessions.length === 0 ? <p className="text-sm text-slate-400">Nenhum cliente aguardando atendimento.</p> : activeSessions.map((session) => (
          <article key={session.id} className="p-4 bg-black/20 rounded-xl space-y-3">
            <div className="flex justify-between text-sm"><strong className="text-white capitalize">{session.oracleType || 'Consulta'}</strong><span className="text-emerald-300">Em andamento</span></div>
            {session.mode === 'video' && <VideoMeeting sessionId={session.id} displayName={profile.name} className="w-full h-[430px]" />}
            <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl bg-black/25 p-3">
              {(session.messages || []).length === 0 ? <p className="text-xs text-slate-400">Aguardando a primeira mensagem do cliente.</p> : (session.messages || []).map((item) => (
                <div key={item.id} className="text-sm"><span className="font-bold text-purple-200">{item.senderName}:</span> <span className="text-slate-200">{item.text}</span> <span className="text-[10px] text-slate-500">{item.timestamp}</span></div>
              ))}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void sendReply(session.id); }} className="flex gap-2 min-w-0">
              <input value={replyBySession[session.id] || ''} onChange={(event) => setReplyBySession((current) => ({ ...current, [session.id]: event.target.value }))} placeholder="Responder ao cliente..." className="flex-1 min-w-0 rounded-xl border border-purple-900 bg-black/30 px-3 py-2 text-sm text-white" />
              <button type="submit" className="rounded-xl bg-amber-400 px-4 text-black" aria-label="Enviar resposta"><Send className="w-4 h-4" /></button>
            </form>
            <button onClick={() => void endSession(session.id)} className="w-full rounded-xl border border-rose-400/60 bg-rose-500/10 px-4 py-3 font-bold text-rose-200">Encerrar atendimento</button>
          </article>
        ))}
      </section>
      <section className="p-4 sm:p-6 bg-[#150F26] border border-purple-900/40 rounded-2xl sm:rounded-3xl space-y-4 min-w-0">
        <div className="flex justify-between items-center"><h2 className="font-bold text-amber-200">Histórico real de atendimentos</h2><button onClick={() => void load()} className="p-2 text-purple-200"><RefreshCw className="w-4 h-4" /></button></div>
        {sessions.length === 0 ? <p className="text-sm text-slate-400">Nenhum atendimento concluído.</p> : sessions.map((session) => (
          <article key={session.id} className="p-4 bg-black/20 rounded-xl grid md:grid-cols-4 gap-2 text-sm">
            <span className="text-white capitalize">{session.oracleType || 'Consulta'}</span><span className="text-slate-300">{Number(session.durationMinutes || 0)} minutos</span><span className="text-emerald-300">{Number(session.debitMinutes || 0).toFixed(2)} min consumidos</span><span className="text-slate-400">{session.endedAt ? new Date(session.endedAt).toLocaleString('pt-BR') : '-'}</span>
            {session.reviewText && <p className="md:col-span-4 text-purple-200 italic">“{session.reviewText}” — {session.ratingGiven}/5</p>}
          </article>
        ))}
      </section>
    </div>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="p-5 bg-[#150F26] border border-purple-900/40 rounded-2xl space-y-2"><div className="w-5 h-5 text-amber-400">{icon}</div><p className="text-xs uppercase text-purple-300">{label}</p><p className="text-2xl font-black text-white">{value}</p></div>
);
