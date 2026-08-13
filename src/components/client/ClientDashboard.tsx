import React, { useState } from 'react';
import { Wallet, Clock, History, Star, ArrowUpRight, ArrowDownLeft, Heart, Plus, ShieldCheck, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConsultation } from '../../context/ConsultationContext';

export const ClientDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { pastSessions, transactions, consultants, setIsRechargeModalOpen } = useConsultation();

  const [activeTab, setActiveTab] = useState<'wallet' | 'history' | 'profile'>('wallet');

  // Personal Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    birthFullName: user.birthFullName || '',
    birthDate: user.birthDate || '',
    birthTime: user.birthTime || '12:00',
    doesNotKnowBirthTime: user.doesNotKnowBirthTime || false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const userTransactions = transactions.filter((t) => t.userId === user.id);
  const userPastSessions = pastSessions.filter((s) => s.clientId === user.id);
  const favoriteConsultants = consultants.filter((c) => (user.favorites || []).includes(c.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    const result = await updateProfile(profileForm);
    setSavingProfile(false);

    if (result.success) {
      setProfileMessage({ type: 'success', text: 'Dados pessoais atualizados com sucesso!' });
    } else {
      setProfileMessage({ type: 'error', text: result.message || 'Erro ao atualizar dados pessoais.' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-200">Painel do Consulente & Carteira de Minutos</h1>
          <p className="text-xs text-purple-300/80">Gerencie seus minutos, perfil cadastral e histórico financeiro</p>
        </div>

        <button
          onClick={() => setIsRechargeModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Comprar Minutos via Mercado Pago
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-purple-900/40 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'wallet' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Carteira & Extrato
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'history' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Histórico de Consultas
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'profile' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Meu Perfil Cadastral
        </button>
      </div>

      {activeTab === 'wallet' && (
        <div className="space-y-8">
          {/* Balance Cards Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-[#1F1638] to-[#150F26] border border-amber-500/30 rounded-3xl space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-purple-300/80">Saldo de Minutos</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-300 font-mono">
                {user.minuteBalance ?? 0} min
              </p>
              <p className="text-[11px] text-slate-400">Tempo acumulado para consultas por chat ou vídeo</p>
            </div>

            <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-purple-300/80">Consultas Concluídas</span>
                <History className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white font-mono">
                {userPastSessions.length}
              </p>
              <p className="text-[11px] text-slate-400">Atendimentos oraculares finalizados</p>
            </div>

            <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-purple-300/80">Status da Conta</span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-300 uppercase font-mono">
                {user.status || 'Ativa'}
              </p>
              <p className="text-[11px] text-slate-400">Usuário verificado com proteção LGPD</p>
            </div>
          </div>

          {/* Favorite Consultants */}
          {favoriteConsultants.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-amber-200 uppercase tracking-wider">Meus Consultores Favoritos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteConsultants.map((c) => (
                  <div key={c.id} className="p-4 bg-[#150F26] border border-purple-900/40 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-amber-400/40" />
                      <div>
                        <h3 className="font-bold text-xs text-white">
  {c.name}
</h3>

<p className="text-[10px] text-purple-300">
  {c.pricePerMinute.toFixed(2)} min do saldo/min de atendimento
</p>

</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extrato de Transações de Minutos */}
          <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-4">
            <h2 className="text-base font-bold text-amber-200">Extrato da Carteira de Minutos</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {userTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhuma transação de minutos registrada ainda.</p>
              ) : (
                userTransactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 bg-[#1F1638] border border-purple-900/40 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'recharge' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.type === 'recharge' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{tx.description}</p>
                        <span className="text-[10px] text-slate-400">{tx.date}</span>
                      </div>
                    </div>
                    <span className={`font-mono font-bold text-sm ${tx.type === 'recharge' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'recharge' ? '+' : '-'} {tx.amount} min
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-amber-200">Histórico de Atendimentos Oraculares</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {userPastSessions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Você ainda não realizou atendimentos.</p>
            ) : (
              userPastSessions.map((session) => (
                <div key={session.id} className="p-3.5 bg-[#1F1638] border border-purple-900/40 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={session.consultantAvatar} alt={session.consultantName} className="w-8 h-8 rounded-full object-cover border border-amber-400" />
                      <div>
                        <span className="font-bold text-white block">{session.consultantName}</span>
                        <span className="text-[10px] text-purple-300 uppercase">{session.oracleType} ({session.mode})</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-300">R$ {session.totalCost.toFixed(2)}</span>
                  </div>

                  {session.ratingGiven && (
                    <div className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{session.ratingGiven} Estrelas</span>
                      {session.reviewText && <span className="text-slate-400 font-normal italic pr-2">- "{session.reviewText}"</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-6 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-500/30 text-purple-300">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-200">Perfil Cadastral do Consulente</h2>
              <p className="text-xs text-slate-400">Edite seus dados de nascimento e identificação para tiragens precisas.</p>
            </div>
          </div>

          {profileMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              }`}
            >
              {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-purple-200 font-semibold mb-1">Nome Social / Exibição</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-[#1F1638] border border-purple-900/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-purple-200 font-semibold mb-1">Nome Completo de Solteiro(a)</label>
              <input
                type="text"
                value={profileForm.birthFullName}
                onChange={(e) => setProfileForm({ ...profileForm, birthFullName: e.target.value })}
                className="w-full bg-[#1F1638] border border-purple-900/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Usado para cálculo da matriz de Numerologia Cabalística nas consultas.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-purple-200 font-semibold mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={profileForm.birthDate}
                  onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                  className="w-full bg-[#1F1638] border border-purple-900/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-1">Horário de Nascimento</label>
                <input
                  type="time"
                  disabled={profileForm.doesNotKnowBirthTime}
                  value={profileForm.birthTime}
                  onChange={(e) => setProfileForm({ ...profileForm, birthTime: e.target.value })}
                  className={`w-full bg-[#1F1638] border border-purple-900/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 ${
                    profileForm.doesNotKnowBirthTime ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="noTimeDashboard"
                checked={profileForm.doesNotKnowBirthTime}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    doesNotKnowBirthTime: e.target.checked,
                    birthTime: e.target.checked ? '' : '12:00',
                  })
                }
                className="w-4 h-4 rounded border-purple-900 bg-[#1F1638] text-amber-500"
              />
              <label htmlFor="noTimeDashboard" className="text-slate-300">
                Não sei o horário exato do meu nascimento
              </label>
            </div>

            {/* Strict Immutability Notice for Protected Fields */}
            <div className="p-3.5 bg-purple-950/30 border border-purple-800/30 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-amber-300">Informações Protegidas do Sistema:</div>
              <p>• E-mail cadastrado: <strong className="text-white">{user.email}</strong></p>
              <p>• Papel / Permissões: <strong className="text-white uppercase">{user.role}</strong></p>
              <p>
  • Saldo de Minutos:{' '}

  <strong className="text-amber-300 font-mono">
    {user.minuteBalance ?? 0} min
  </strong>{' '}

  (Alterável apenas via compra de pacotes de minutos)
</p>


 </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              {savingProfile ? 'Salvando...' : 'Salvar Alterações de Perfil'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
