import React, { useState } from 'react';
import { UserCheck, DollarSign, Clock, Star, ToggleLeft, ToggleRight, ArrowUpRight, CheckCircle2, ShieldCheck, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConsultation } from '../../context/ConsultationContext';

export const ConsultantDashboard: React.FC = () => {
  const { user, updateUserPix } = useAuth();
  const { consultants, updateConsultantStatus, updateConsultantPrice, pastSessions, transactions, addTransaction } = useConsultation();

  // Current consultant object
  const consultantData = consultants.find((c) => c.id === 'c1') || consultants[0];

  const [pixInput, setPixInput] = useState(user.pixKey || 'helena.luz@pix.com.br');
  const [newPrice, setNewPrice] = useState(consultantData.pricePerMinute.toString());
  const [payoutAmount, setPayoutAmount] = useState('500');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const consultantSessions = pastSessions.filter((s) => s.consultantId === consultantData.id);
  const consultantEarningsTx = transactions.filter((t) => t.userId === consultantData.id);

  const handleStatusChange = (status: 'online' | 'busy' | 'offline') => {
    updateConsultantStatus(consultantData.id, status);
  };

  const handleSavePrice = () => {
    const parsed = parseFloat(newPrice);
    if (parsed > 0) {
      updateConsultantPrice(consultantData.id, parsed);
    }
  };

  const handleRequestPayout = () => {
    const amt = parseFloat(payoutAmount);
    if (amt <= 0 || amt > (consultantData.totalEarned || 0)) return;

    addTransaction({
      id: `payout_${Date.now()}`,
      userId: consultantData.id,
      userName: consultantData.name,
      type: 'payout',
      amount: amt,
      method: 'bank_transfer',
      status: 'completed',
      date: new Date().toLocaleString('pt-BR'),
      description: `Saque de comissões via PIX (${pixInput}) enviado para conta do consultor`,
    });

    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-amber-200">Painel do Consultor</h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              Perfil Verificado
            </span>
          </div>
          <p className="text-xs text-purple-300/80">
  Gerencie seus horários, status online, consumo de minutos e saques de comissão
</p>

 </div>

        {/* Live Status Controls */}
        <div className="flex items-center gap-2 bg-[#150F26] p-1.5 rounded-2xl border border-purple-900/60">
          <button
            onClick={() => handleStatusChange('online')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              consultantData.status === 'online'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ● Online
          </button>
          <button
            onClick={() => handleStatusChange('busy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              consultantData.status === 'busy'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ● Ocupado
          </button>
          <button
            onClick={() => handleStatusChange('offline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              consultantData.status === 'offline'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ● Offline
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-6 bg-gradient-to-br from-[#1F1638] to-[#150F26] border border-amber-500/30 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs uppercase font-bold text-purple-300/80">Ganhos Acumulados</span>
          <p className="text-3xl font-black text-amber-300 font-mono">
            R$ {(consultantData.totalEarned || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">Repasse de 70% já deduzido de taxa</p>
        </div>

        <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-2 shadow-xl">
         


<span className="text-xs uppercase font-bold text-purple-300/80">
  Consumo Atual
</span>

<div className="flex items-center gap-2">
  <span className="text-2xl font-black text-white font-mono">
    {consultantData.pricePerMinute.toFixed(2)} min
  </span>

  <span className="text-xs text-purple-300">
    do saldo/min de atendimento
  </span>
</div>





        <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs uppercase font-bold text-purple-300/80">Atendimentos</span>
          <p className="text-3xl font-black text-white font-mono">
            {consultantData.totalConsultations}
          </p>
          <p className="text-[11px] text-slate-400">Total de clientes atendidos</p>
        </div>

        <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-2 shadow-xl">
          <span className="text-xs uppercase font-bold text-purple-300/80">Avaliação Média</span>
          <div className="flex items-center gap-1.5 text-3xl font-black text-amber-400 font-mono">
            <Star className="w-6 h-6 fill-amber-400" />
            <span>{consultantData.rating.toFixed(1)}</span>
          </div>
          <p className="text-[11px] text-slate-400">Baseado em {consultantData.reviews.length} avaliações</p>
        </div>
      </div>

      {/* Pricing & Payout Request Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Settings */}
        <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-4">
          


<h2 className="text-base font-bold text-amber-200">
  Ajuste do Consumo por Minuto
</h2>

<p className="text-xs text-slate-300">
  Defina quantos minutos da carteira serão consumidos por minuto de atendimento.
</p>

<div className="relative flex-1">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
    min
  </span>

  <input
    type="number"
    step="0.10"
    value={newPrice}
    onChange={(e) => setNewPrice(e.target.value)}
    className="w-full pl-11 pr-3 py-2.5 bg-[#1F1638] border border-purple-800/50 rounded-xl text-sm font-bold text-white"
  />
</div>

<button onClick={handleSavePrice}>
  Atualizar Consumo
</button>




          </div>
        </div>

        {/* Payout Request */}
        <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-amber-200">Solicitação de Saque PIX</h2>

          {payoutSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Saque efetuado com sucesso via PIX para sua chave bancária!
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-bold text-purple-300 mb-1">Chave PIX Cadastrada</label>
                <input
                  type="text"
                  value={pixInput}
                  onChange={(e) => {
                    setPixInput(e.target.value);
                    updateUserPix(e.target.value);
                  }}
                  placeholder="Seu CPF, Email ou Chave PIX"
                  className="w-full px-3 py-2 bg-[#1F1638] border border-purple-800/50 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Valor do saque em R$"
                  className="flex-1 px-3 py-2 bg-[#1F1638] border border-purple-800/50 rounded-xl text-xs text-white"
                />
                <button
                  onClick={handleRequestPayout}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Solicitar Saque
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Earnings & Reviews List */}
      <div className="p-6 bg-[#150F26] border border-purple-900/40 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-amber-200">Avaliações dos seus Clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consultantData.reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-[#1F1638] border border-purple-900/40 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{rev.clientName}</span>
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{rev.rating}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
              <span className="block text-[10px] text-slate-500">{rev.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
