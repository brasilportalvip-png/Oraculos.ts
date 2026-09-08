import React, { useEffect, useState } from 'react';
import { Edit3, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';
import { auth } from '../../firebase';

interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  consultantId?: string;
  professionalName?: string;
  professionalTitle?: string;
  professionalBio?: string;
}

export const AdminAccountsPanel: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: '', status: 'active', professionalName: '', title: '', bio: '' });

  const request = async (url: string, options: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) throw new Error('Sessão administrativa expirada.');
    return fetch(url, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await request('/api/admin/users');
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível carregar as contas.');
      setUsers(body.data?.users || []);
      setMessage('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao carregar contas.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({ name: user.name || '', status: user.status || 'active', professionalName: user.professionalName || '', title: user.professionalTitle || '', bio: user.professionalBio || '' });
  };

  const save = async () => {
    if (!editing) return;
    try {
      const response = await request(`/api/admin/users/${encodeURIComponent(editing.id)}`, { method: 'PATCH', body: JSON.stringify(form) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível salvar.');
      setMessage('Conta e perfil atualizados com sucesso.'); setEditing(null); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao salvar conta.'); }
  };

  const remove = async (user: AdminUser) => {
    const confirmation = window.prompt(`Para excluir definitivamente ${user.name || user.email}, digite EXCLUIR:`);
    if (confirmation !== 'EXCLUIR') return;
    try {
      const response = await request(`/api/admin/users/${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error?.message || 'Não foi possível excluir.');
      setMessage('Conta excluída com sucesso.'); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao excluir conta.'); }
  };

  const filtered = users.filter((user) => [user.name, user.email, user.role, user.id].some((value) => String(value || '').toLowerCase().includes(search.toLowerCase())));

  return <div className="space-y-5">
    <header className="flex flex-col sm:flex-row gap-3 justify-between">
      <div><h2 className="text-xl font-black text-amber-200">Contas e perfis</h2><p className="text-xs text-slate-400">Edite, bloqueie ou exclua contas com confirmação e registro de auditoria.</p></div>
      <button onClick={() => void load()} className="p-2 rounded-xl bg-purple-500/20 text-purple-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
    </header>
    <label className="flex items-center gap-2 p-3 rounded-xl bg-[#150F26] border border-purple-900/50"><Search className="w-4 h-4 text-purple-300" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, e-mail, função ou código" className="flex-1 bg-transparent outline-none text-white" /></label>
    {message && <p className="p-3 rounded-xl bg-amber-500/10 text-amber-200 text-sm">{message}</p>}
    <div className="overflow-x-auto rounded-2xl border border-purple-900/50">
      <table className="w-full min-w-[760px] text-sm"><thead className="bg-purple-950/40 text-purple-200"><tr><th className="p-3 text-left">Conta</th><th className="p-3 text-left">Função</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Ações</th></tr></thead>
      <tbody className="divide-y divide-purple-900/30">{filtered.map((user) => <tr key={user.id} className="bg-[#100b1b]"><td className="p-3"><strong className="text-white block">{user.name || 'Sem nome'}</strong><span className="text-xs text-slate-400">{user.email}<br />{user.id}</span></td><td className="p-3 text-purple-200">{user.role || 'user'}</td><td className="p-3"><span className={user.status === 'blocked' ? 'text-rose-300' : 'text-emerald-300'}>{user.status || 'active'}</span></td><td className="p-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(user)} className="p-2 bg-amber-400 text-black rounded-lg" title="Editar"><Edit3 className="w-4 h-4" /></button><button onClick={() => void remove(user)} className="p-2 bg-rose-600 text-white rounded-lg" title="Excluir"><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>
    </div>
    {editing && <div className="fixed inset-0 z-50 bg-black/80 p-4 flex items-center justify-center"><div className="max-w-xl w-full max-h-[90vh] overflow-y-auto bg-[#150F26] border border-amber-400/40 rounded-2xl p-6 space-y-4"><div className="flex justify-between"><h3 className="font-black text-amber-200">Editar conta</h3><button onClick={() => setEditing(null)}><X /></button></div><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da conta" className="w-full p-3 rounded-xl bg-black/30 text-white" /><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full p-3 rounded-xl bg-black/30 text-white"><option value="active">Ativa</option><option value="blocked">Bloqueada</option></select>{editing.consultantId && <><input value={form.professionalName} onChange={(e) => setForm({ ...form, professionalName: e.target.value })} placeholder="Novo nome profissional (opcional)" className="w-full p-3 rounded-xl bg-black/30 text-white" /><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Novo título/apresentação curta" className="w-full p-3 rounded-xl bg-black/30 text-white" /><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Nova apresentação completa (mínimo 20 caracteres)" rows={5} className="w-full p-3 rounded-xl bg-black/30 text-white" /></>}<button onClick={() => void save()} className="w-full py-3 rounded-xl bg-amber-400 text-black font-black flex justify-center gap-2"><Save className="w-5 h-5" /> Salvar alterações</button></div></div>}
  </div>;
};
