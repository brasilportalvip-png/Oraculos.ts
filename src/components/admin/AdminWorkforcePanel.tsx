import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Save } from 'lucide-react';
import type { CandidateApplication, Consultant } from '../../types';
import { auth } from '../../firebase';

export const AdminWorkforcePanel: React.FC<{ consultants: Consultant[] }> = ({ consultants }) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const authorizedFetch = async (url: string, options: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) throw new Error('Sessão administrativa expirada.');
    return fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await authorizedFetch('/api/admin/workforce-applications');
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Falha ao carregar candidaturas.');
      setApplications(body.data?.applications || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const decide = async (application: CandidateApplication, status: 'approved' | 'rejected') => {
    const pricePerMinute = Number(prices[application.id] || 3.5);
    const response = await authorizedFetch(`/api/admin/workforce-applications/${application.id}`, {
      method: 'PATCH', body: JSON.stringify({ status, pricePerMinute }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(body.error?.message || 'Não foi possível registrar a decisão.');
    setMessage(status === 'approved' ? 'Profissional aprovado e publicado no marketplace.' : 'Candidatura recusada.');
    await load();
  };

  const savePrice = async (consultant: Consultant) => {
    const pricePerMinute = Number(prices[consultant.id] || consultant.pricePerMinute);
    const response = await authorizedFetch(`/api/admin/consultants/${consultant.id}/pricing`, {
      method: 'PATCH', body: JSON.stringify({ pricePerMinute, active: true }),
    });
    const body = await response.json().catch(() => ({}));
    setMessage(response.ok ? `Valor de ${consultant.name} atualizado.` : body.error?.message || 'Falha ao atualizar valor.');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-black text-amber-200">Profissionais e candidaturas</h2><p className="text-xs text-slate-400">Aprovação, publicação no marketplace e controle administrativo do minuto.</p></div>
        <button onClick={() => void load()} className="p-2 rounded-lg bg-purple-500/20 text-purple-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      {message && <p role="status" className="p-3 rounded-xl bg-amber-500/10 text-amber-200 text-sm">{message}</p>}
      <section className="space-y-3">
        <h3 className="font-bold text-white">Candidaturas pendentes</h3>
        {applications.filter((item) => item.status === 'submitted').length === 0 && <p className="text-sm text-slate-400">Nenhuma candidatura pendente.</p>}
        {applications.filter((item) => item.status === 'submitted').map((application) => (
          <article key={application.id} className="p-5 rounded-2xl bg-[#150F26] border border-purple-900/50 space-y-3">
            <div><h4 className="font-bold text-amber-200">{application.professionalName}</h4><p className="text-xs text-slate-400">{application.fullName} • {application.email} • {application.city}/{application.state}</p></div>
            <p className="text-sm text-slate-300">{application.bio}</p>
            <p className="text-xs text-purple-200">Oráculos: {application.oracles.join(', ')} • Experiência: {application.experienceYears} anos</p>
            <div className="flex flex-wrap gap-2 items-center">
              <input type="number" min="0.01" step="0.10" className="w-36 px-3 py-2 bg-black/30 rounded-lg text-white" value={prices[application.id] || '3.50'} onChange={(e) => setPrices({ ...prices, [application.id]: e.target.value })} aria-label="Valor por minuto" />
              <button onClick={() => void decide(application, 'approved')} className="px-3 py-2 rounded-lg bg-emerald-500 text-black font-bold flex gap-1"><CheckCircle2 className="w-4 h-4" /> Aprovar</button>
              <button onClick={() => void decide(application, 'rejected')} className="px-3 py-2 rounded-lg bg-rose-600 text-white font-bold flex gap-1"><XCircle className="w-4 h-4" /> Recusar</button>
            </div>
          </article>
        ))}
      </section>
      <section className="space-y-3">
        <h3 className="font-bold text-white">Controle do valor por minuto</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {consultants.map((consultant) => (
            <div key={consultant.id} className="p-4 rounded-xl bg-[#150F26] border border-purple-900/40 flex items-center gap-3">
              <img src={consultant.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
              <div className="min-w-0 flex-1"><p className="font-bold text-sm text-white truncate">{consultant.name}</p><p className="text-[11px] text-slate-400">Atual: {consultant.pricePerMinute.toFixed(2)} min/min</p></div>
              <input type="number" min="0.01" step="0.10" className="w-24 px-2 py-2 bg-black/30 rounded-lg text-white" value={prices[consultant.id] ?? consultant.pricePerMinute} onChange={(e) => setPrices({ ...prices, [consultant.id]: e.target.value })} />
              <button onClick={() => void savePrice(consultant)} aria-label={`Salvar valor de ${consultant.name}`} className="p-2 rounded-lg bg-amber-400 text-black"><Save className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
