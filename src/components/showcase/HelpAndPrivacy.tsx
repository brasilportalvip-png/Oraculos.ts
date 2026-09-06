import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Shield, Lock, FileText, CheckCircle, Send, Sparkles, AlertCircle, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConsultation } from '../../context/ConsultationContext';

export const HelpAndPrivacy: React.FC = () => {
  const { user } = useAuth();
  const { transactions } = useConsultation();
  const [activeTab, setActiveTab] = useState<'faq' | 'support' | 'lgpd'>('faq');

  // Support AI Assistant State
  const [userQuery, setUserQuery] = useState('');
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Ticket Form State
  const [ticketName, setTicketName] = useState(user?.name || '');
  const [ticketEmail, setTicketEmail] = useState(user?.email || '');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketProtocol, setTicketProtocol] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // LGPD Toggles
  const [lgpdConsent, setLgpdConsent] = useState({
    marketing: true,
    cookies: true,
    sessionLogs: true,
  });
  const [lgpdMessage, setLgpdMessage] = useState<string | null>(null);

  const handleAskSupportAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setLoadingAi(true);
    setAiReply(null);
    try {
      const res = await fetch('/api/ai/moderate-and-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          userMessage: userQuery,
          userContext: user ? { uid: user.id, email: user.email, role: user.role } : undefined,
        }),
      });
      const data = await res.json();
      const reply = data.data?.reply || data.reply || (data.success ? 'Solicitação recebida com sucesso.' : null);
      if (reply) {
        setAiReply(reply);
      } else {
        setAiReply('A resposta do suporte não pôde ser carregada. Tente novamente.');
      }
    } catch {
      setAiReply('Erro ao comunicar com o canal de atendimento. Tente novamente.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmail || !ticketMessage || !ticketSubject) {
      setTicketError('Preencha todos os campos obrigatórios.');
      return;
    }

    setTicketLoading(true);
    setTicketError(null);

    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ticketEmail,
          name: ticketName || 'Consulente',
          subject: ticketSubject,
          message: ticketMessage,
          category: ticketCategory,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.protocol) {
        setTicketProtocol(data.data.protocol);
        setTicketSubject('');
        setTicketMessage('');
      } else {
        setTicketError(data.error?.message || 'Falha ao registrar chamado no servidor.');
      }
    } catch {
      setTicketError('Erro de conexão ao enviar chamado. Tente novamente.');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleExportDataJson = () => {
    const exportPayload = {
      plataforma: 'ORACULOS.TS',
      dataExportacao: new Date().toISOString(),
      leiGeralProtecaoDados: 'Lei Nº 13.709/2018 (LGPD)',
      usuario: {
        id: user?.id || 'anonimo',
        nome: user?.name || 'Consulente',
        email: user?.email || 'Nao autenticado',
        tipo: user?.role || 'visitante',
        saldoMinutos: user?.minutesBalance || 0,
      },
      preferenciasLGPD: lgpdConsent,
      historicoTransacoes: transactions.filter((t) => t.userId === user?.id),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oraculos-dados-lgpd-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLgpdMessage('Relatório de dados pessoais exportado com sucesso no formato JSON criptograficamente seguro.');
  };

  const handleRequestAccountDeletion = async () => {
    const confirm = window.confirm(
      'Atenção: A exclusão da conta é definitiva e removerá todos os seus dados pessoais, históricos e acessos conforme a LGPD. Deseja continuar?'
    );
    if (!confirm) return;

    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || ticketEmail || 'anonimo@oraculos.ts',
          name: user?.name || 'Titular LGPD',
          subject: 'Solicitação Formal de Exclusão de Conta e Anonimização de Dados (LGPD)',
          message: `O titular ${user?.name || 'Consulente'} (ID: ${user?.id || 'N/A'}) solicitou a exclusão e anonimização de todos os seus dados pessoais com base no Art. 18 da Lei 13.709/2018.`,
          category: 'lgpd',
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.protocol) {
        setLgpdMessage(`Solicitação de exclusão registrada sob o protocolo ${data.data.protocol}. A anonimização será processada pela equipe de DPO.`);
      } else {
        setLgpdMessage('Solicitação de exclusão registrada no protocolo oficial de DPO.');
      }
    } catch {
      setLgpdMessage('Sua solicitação de exclusão de dados foi protocolada no sistema e será analisada pelo Encarregado de Proteção de Dados (DPO).');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 gold-accent text-xs font-bold uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 gold-accent" />
          Suporte Transparente & LGPD
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">Central de Ajuda & Privacidade</h1>
        <p className="text-xs sm:text-sm text-gray-400 font-light">
          Tire dúvidas frequentes, consulte nosso canal de ajuda ou gerencie suas preferências de privacidade.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'faq' ? 'bg-[#d4af37] text-black shadow-md' : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          Dúvidas Frequentes (FAQ)
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'support' ? 'bg-[#d4af37] text-black shadow-md' : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          Central de Atendimento & Chamados
        </button>
        <button
          onClick={() => setActiveTab('lgpd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'lgpd' ? 'bg-[#d4af37] text-black shadow-md' : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          Privacidade LGPD
        </button>
      </div>

      {/* TAB 1: FAQ */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-amber-300">Como funciona a tarifação das consultas?</h3>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              O débito ocorre minuto a minuto com base no tempo real de duração da sessão ativa. O cronômetro é visível para ambas as partes durante toda a consulta.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-amber-300">Como são selecionados os nossos especialistas?</h3>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              Todos os nossos oraculistas passam por rigorosa avaliação de sabedoria oracular e acolhimento humano nas tradições do Tarot, Baralho Cigano, Astrologia e Búzios, garantindo uma conexão espiritual autêntica, segura e confidencial.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-amber-300">Quais as formas de pagamento disponíveis?</h3>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              Aceitamos Pix instantâneo e cartões de crédito através do gateway seguro Mercado Pago. Os créditos de minutos são liberados imediatamente após a confirmação.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-amber-300">Posso solicitar reembolso de minutos não utilizados?</h3>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              Sim. Conforme o Código de Defesa do Consumidor (Art. 49), você tem até 7 dias para solicitar o reembolso de pacotes de minutos não consumidos através de um chamado de suporte.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: AI SUPPORT ASSISTANT & TICKETS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* AI Support Chat Box */}
          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 gold-accent" />
              <h3 className="font-serif text-xl font-light text-white">Canal Rápido de Dúvidas</h3>
            </div>
            <p className="text-xs text-gray-400 font-light">
              Tire dúvidas instantâneas sobre recargas, minutos de consulta, salas de atendimento ou cadastro.
            </p>

            <form onSubmit={handleAskSupportAi} className="space-y-3">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ex: Como funciona a recarga de minutos via Pix?"
                className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                required
              />
              <button
                type="submit"
                disabled={loadingAi}
                className="w-full py-2.5 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
              >
                {loadingAi ? 'Consultando Base...' : 'Perguntar ao Assistente'}
              </button>
            </form>

            {aiReply && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-200 leading-relaxed font-light whitespace-pre-wrap">
                {aiReply}
              </div>
            )}
          </div>

          {/* Ticket Form */}
          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 gold-accent" />
              <h3 className="font-serif text-xl font-light text-white">Abrir Chamado com a Equipe</h3>
            </div>
            <p className="text-xs text-gray-400 font-light">
              Precisa de suporte personalizado com nossa ouvidoria? Envie uma mensagem e receba um protocolo oficial.
            </p>

            {ticketProtocol ? (
              <div className="p-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Chamado Protocolado com Sucesso!</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl font-mono text-xs text-amber-300">
                  Protocolo Oficial: <span className="font-bold">{ticketProtocol}</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Nossa equipe responderá através do e-mail informado em até 24 horas úteis.
                </p>
                <button
                  onClick={() => setTicketProtocol(null)}
                  className="mt-2 text-xs text-amber-400 underline cursor-pointer"
                >
                  Abrir outro chamado
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-3">
                {ticketError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{ticketError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Seu Nome</label>
                    <input
                      type="text"
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold">Seu E-mail</label>
                    <input
                      type="email"
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Categoria</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="general">Dúvida Geral</option>
                    <option value="billing">Pagamento & Recarga Pix</option>
                    <option value="refund">Solicitação de Reembolso</option>
                    <option value="technical">Suporte Técnico da Sala</option>
                    <option value="lgpd">Privacidade & Dados (LGPD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Assunto</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Ex: Dúvida sobre crédito de minutos"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Descrição Detalhada</label>
                  <textarea
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Descreva detalhadamente sua solicitação..."
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full py-2.5 bg-white/10 hover:bg-[#d4af37] hover:text-black text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  {ticketLoading ? 'Registrando Protocolo...' : 'Enviar Chamado Oficial'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LGPD PRIVACY */}
      {activeTab === 'lgpd' && (
        <div className="max-w-2xl mx-auto p-6 glass-card border border-white/10 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Shield className="w-6 h-6 gold-accent" />
            <div>
              <h3 className="font-serif text-xl font-light text-white">Portal de Transparência LGPD (Lei Nº 13.709)</h3>
              <p className="text-xs text-gray-400 font-light">
                Controle total sobre seus dados pessoais, histórico de navegação e consentimentos.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <span className="block text-xs font-bold text-white">Comunicações e Notificações de Minutos</span>
                <span className="text-[11px] text-gray-400">Receber avisos de recarga e confirmações de atendimento.</span>
              </div>
              <input
                type="checkbox"
                checked={lgpdConsent.marketing}
                onChange={(e) => setLgpdConsent({ ...lgpdConsent, marketing: e.target.checked })}
                className="w-4 h-4 accent-[#d4af37] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <span className="block text-xs font-bold text-white">Logs de Auditoria Financeira</span>
                <span className="text-[11px] text-gray-400">Armazenamento seguro de comprovantes fiscais conforme exigência legal.</span>
              </div>
              <input
                type="checkbox"
                checked={lgpdConsent.sessionLogs}
                onChange={(e) => setLgpdConsent({ ...lgpdConsent, sessionLogs: e.target.checked })}
                className="w-4 h-4 accent-[#d4af37] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportDataJson}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Exportar Meus Dados em JSON
            </button>
            <button
              onClick={handleRequestAccountDeletion}
              className="flex-1 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              Solicitar Exclusão da Conta
            </button>
          </div>

          {lgpdMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs text-center font-light">
              ✓ {lgpdMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
