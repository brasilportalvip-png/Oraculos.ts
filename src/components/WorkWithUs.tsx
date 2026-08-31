import React, { useState } from 'react';
import { BriefcaseBusiness, CheckCircle2 } from 'lucide-react';

const ORACLES = ['tarot', 'cigano', 'astrologia', 'numerologia', 'buzios', 'ifa', 'runas', 'iching', 'cristais', 'mesaradionica'];

export const WorkWithUs: React.FC = () => {
  const [form, setForm] = useState({
    fullName: '', professionalName: '', email: '', phone: '', city: '', state: '',
    bio: '', experienceYears: '1', profilePhoto: '', modality: 'chat', oracles: [] as string[],
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/work-with-us/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experienceYears: Number(form.experienceYears),
          specialties: form.oracles,
          languages: ['Português'],
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.success) throw new Error(body.error?.message || 'Não foi possível enviar a candidatura.');
      setSuccess(true);
      setMessage('Candidatura enviada. A administração analisará seus dados antes da publicação no marketplace.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao enviar candidatura.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="max-w-2xl mx-auto py-20 text-center space-y-5">
        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400" />
        <h1 className="text-3xl font-black text-amber-200">Cadastro recebido</h1>
        <p className="text-slate-300">{message}</p>
      </section>
    );
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-[#150F26] border border-purple-800/60 text-white focus:border-amber-400 outline-none';
  return (
    <section className="max-w-3xl mx-auto py-10 space-y-8">
      <header className="text-center space-y-3">
        <BriefcaseBusiness className="w-12 h-12 mx-auto text-amber-400" />
        <h1 className="text-3xl font-black text-amber-200">Trabalhe Conosco</h1>
        <p className="text-slate-300">Cadastre-se como profissional. Seu perfil somente será publicado após aprovação administrativa.</p>
      </header>
      <form onSubmit={submit} className="p-6 md:p-8 rounded-3xl bg-[#0f0b1b] border border-purple-900/60 grid md:grid-cols-2 gap-4">
        <input required className={inputClass} placeholder="Nome completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input required className={inputClass} placeholder="Nome profissional" value={form.professionalName} onChange={(e) => setForm({ ...form, professionalName: e.target.value })} />
        <input required type="email" className={inputClass} placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required className={inputClass} placeholder="Telefone/WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required className={inputClass} placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input required className={inputClass} placeholder="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <input required type="number" min="0" max="80" className={inputClass} placeholder="Anos de experiência" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
        <select className={inputClass} value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}>
          <option value="chat">Chat Seguro</option>
        </select>
        <input className={`${inputClass} md:col-span-2`} placeholder="URL da foto profissional (opcional)" value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} />
        <textarea required minLength={40} rows={5} className={`${inputClass} md:col-span-2`} placeholder="Conte sua experiência, formação e forma de atendimento" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <fieldset className="md:col-span-2 space-y-3">
          <legend className="text-sm font-bold text-amber-200">Oráculos atendidos</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ORACLES.map((oracle) => (
              <label key={oracle} className="flex gap-2 items-center text-sm text-slate-300 capitalize">
                <input type="checkbox" checked={form.oracles.includes(oracle)} onChange={() => setForm({ ...form, oracles: form.oracles.includes(oracle) ? form.oracles.filter((item) => item !== oracle) : [...form.oracles, oracle] })} />
                {oracle}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="md:col-span-2 flex gap-3 text-sm text-slate-300">
          <input required type="checkbox" checked={form.termsAccepted} onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })} />
          Confirmo que os dados são verdadeiros e aceito a análise administrativa e as regras da plataforma.
        </label>
        {message && <p role="alert" className="md:col-span-2 text-sm text-rose-300">{message}</p>}
        <button disabled={loading || form.oracles.length === 0} className="md:col-span-2 py-3 rounded-xl bg-amber-400 text-black font-black disabled:opacity-50">
          {loading ? 'Enviando...' : 'Enviar candidatura'}
        </button>
      </form>
    </section>
  );
};
