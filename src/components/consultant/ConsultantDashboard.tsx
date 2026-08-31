import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, Star, Wallet, Wifi } from 'lucide-react';
import { auth } from '../../firebase';

interface ProfessionalProfile { id: string; name: string; avatar: string; title: string; status: 'online' | 'busy' | 'offline'; pricePerMinute: number; rating: number; }
interface ProfessionalSession { id: string; oracleType?: string; endedAt?: string; durationMinutes?: number; debitMinutes?: number; ratingGiven?: number; reviewText?: string; }
interface ProfessionalEarnings { grossMinutes: number; commissionRate: number; payableMinutes: number; paymentMethod: 'manual_weekly'; }

export const ConsultantDashboard: React.FC = () => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [sessions, setSessions] = useState<ProfessionalSession[]>([]);
  const [earnings, setEarnings] = useState<ProfessionalEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const request = async (url: string, options: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) throw new Error('Sessão expirada. Entre novamente.');
    return fetch(url, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await request('/api/consultants/me');
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível carregar o painel profissional.');
      setProfile(body.data.profile); setSessions(body.data.sessions || []); setEarnings(body.data.earnings); setMessage('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao carregar painel.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const updateStatus = async (status: ProfessionalProfile['status']) => {
    try {
      const response = await request('/api/consultants/me/status', { method: 'PATCH', body: JSON.stringify({ status }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível atualizar a disponibilidade.');
      setProfile((current) => current ? { ...current, status } : current); setMessage('Disponibilidade atualizada no marketplace.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao atualizar disponibilidade.'); }
  };

  if (loading) return <div className="py-24 text-center text-purple-200"><RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />Carregando painel profissional...</div>;
  if (!profile) return <div className="max-w-xl mx-auto py-20 text-center p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-200">{message}</div>;

  const reviewedSessions = sessions.filter((session) => session.ratingGiven);
  const averageRating = reviewedSessions.length ? reviewedSessions.reduce((sum, session) => sum + Number(session.ratingGiven || 0), 0) / reviewedSessions.length : Number(profile.rating || 5);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between gap-5 items-start md:items-center">
        <div className="flex gap-4 items-center"><img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-2xl object-cover border border-amber-400/40" /><div><h1 className="text-2xl font-black text-amber-200">{profile.name}</h1><p className="text-sm text-purple-200">{profile.title}</p></div></div>
        <div className="flex gap-2 bg-[#150F26] p-2 rounded-xl border border-purple-900/60">
          {(['online', 'busy', 'offline'] as const).map((status) => <button key={status} onClick={() => void updateStatus(status)} className={`px-3 py-2 rounded-lg text-xs font-bold capitalize ${profile.status === status ? 'bg-amber-400 text-black' : 'text-slate-300'}`}>{status}</button>)}
        </div>
      </header>
      {message && <p role="status" className="p-3 bg-amber-500/10 text-amber-200 rounded-xl text-sm">{message}</p>}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={<Wallet />} label="Repasse acumulado" value={`${earnings?.payableMinutes.toFixed(2) || '0.00'} min`} />
        <Metric icon={<Clock />} label="Atendimentos" value={String(sessions.length)} />
        <Metric icon={<Star />} label="Avaliação" value={averageRating.toFixed(1)} />
        <Metric icon={<Wifi />} label="Valor definido pelo admin" value={`${profile.pricePerMinute.toFixed(2)} min/min`} />
      </section>
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200">Pagamento manual semanal: o administrador confere este relatório e realiza o repasse fora da plataforma. Não existe saque automático.</div>
      <section className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-4">
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
