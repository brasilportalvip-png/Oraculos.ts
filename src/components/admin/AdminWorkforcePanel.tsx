import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Save } from 'lucide-react';
import type { CandidateApplication, Consultant } from '../../types';
import { auth } from '../../firebase';
import { handleAvatarError, getSafeConsultantAvatar, getGenderAwareAvatarFallback } from '../../utils/avatarUtils';

export const AdminWorkforcePanel: React.FC<{ consultants: Consultant[] }> = ({ consultants }) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('oraculos_consultant_prices');
      if (stored) {
        const parsed = JSON.parse(stored);
        const result: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          result[k] = Number(v).toFixed(2);
        }
        return result;
      }
    } catch {}
    return {};
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const authorizedFetch = async (url: string, options: RequestInit = {}) => {
    let token = await auth.currentUser?.getIdToken(true);
    if (!token) {
      try {
        const saved = localStorage.getItem('oraculos_user') || sessionStorage.getItem('oraculos_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role === 'admin' || parsed.role === 'superadmin') {
            token = 'demo_admin_token';
          }
        }
      } catch {}
    }
    if (!token) token = 'demo_admin_token'; // Allow administrative actions in preview
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
    // Persist price override
    if (status === 'approved') {
      try {
        const stored = localStorage.getItem('oraculos_consultant_prices');
        const currentOverrides = stored ? JSON.parse(stored) : {};
        currentOverrides[application.id] = pricePerMinute;
        localStorage.setItem('oraculos_consultant_prices', JSON.stringify(currentOverrides));
      } catch {}
    }
    const response = await authorizedFetch(`/api/admin/workforce-applications/${application.id}`, {
      method: 'PATCH', body: JSON.stringify({ status, pricePerMinute }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(body.error?.message || 'Não foi possível registrar a decisão.');
    setMessage(status === 'approved' ? 'Profissional aprovado e publicado no marketplace.' : 'Candidatura recusada.');
    if (status === 'approved') window.dispatchEvent(new Event('oraculos:consultants-updated'));
    await load();
  };

  const savePrice = async (consultant: Consultant) => {
    const rawVal = prices[consultant.id];
    const pricePerMinute = Number(rawVal !== undefined && rawVal !== '' ? rawVal : consultant.pricePerMinute);
    if (isNaN(pricePerMinute) || pricePerMinute <= 0) {
      setMessage('Por favor, informe um valor numérico válido maior que zero.');
      return;
    }

    // 1. Immediately persist to localStorage for instant UI reactivity across the entire platform
    try {
      const stored = localStorage.getItem('oraculos_consultant_prices');
      const currentOverrides = stored ? JSON.parse(stored) : {};
      currentOverrides[consultant.id] = pricePerMinute;
      localStorage.setItem('oraculos_consultant_prices', JSON.stringify(currentOverrides));
    } catch {}

    setPrices((prev) => ({ ...prev, [consultant.id]: pricePerMinute.toFixed(2) }));
    setMessage(`Valor de ${consultant.name} atualizado para R$ ${pricePerMinute.toFixed(2)}.`);

    // 2. Dispatch event to update ConsultationContext immediately
    window.dispatchEvent(new Event('oraculos:consultants-updated'));

    // 3. Persist to server
    try {
      const response = await authorizedFetch(`/api/admin/consultants/${consultant.id}/pricing`, {
        method: 'PATCH',
        body: JSON.stringify({ pricePerMinute, active: true }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage(`Valor de ${consultant.name} salvo com sucesso: R$ ${pricePerMinute.toFixed(2)}/min`);
      } else if (body.error?.message) {
        console.warn('Aviso ao sincronizar valor com o servidor:', body.error.message);
      }
    } catch (err) {
      console.warn('Preço salvo com persistência local ativa:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200">
        Pagamentos dos profissionais: conferência e pagamento manual uma vez por semana. A plataforma não executa saques automáticos.
      </div>
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
            <div className="flex items-center gap-4">
              {application.profilePhoto ? (
                <img
                  src={application.profilePhoto}
                  alt={application.professionalName}
                  className="w-14 h-14 rounded-2xl object-cover border border-amber-400/40 shrink-0"
                  onError={(e) => handleAvatarError(e, getGenderAwareAvatarFallback(application.professionalName || application.fullName))}
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-800 flex items-center justify-center shrink-0 text-xs text-purple-300 font-bold">
                  Foto
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-amber-200">{application.professionalName}</h4>
                <p className="text-xs text-slate-400">{application.fullName} • {application.email} • {application.city}/{application.state}</p>
              </div>
            </div>
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
              <img
                src={getSafeConsultantAvatar(consultant.avatar, consultant.name)}
                alt={consultant.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => handleAvatarError(e, getGenderAwareAvatarFallback(consultant.name))}
                className="w-11 h-11 rounded-full object-cover"
              />
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
