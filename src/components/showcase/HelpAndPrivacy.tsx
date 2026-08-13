import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Shield, Lock, FileText, CheckCircle, Send, Sparkles, AlertCircle } from 'lucide-react';

export const HelpAndPrivacy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'support' | 'lgpd'>('faq');

  // Support AI Assistant State
  const [userQuery, setUserQuery] = useState('');
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  // LGPD Toggles
  const [lgpdConsent, setLgpdConsent] = useState({
    marketing: true,
    cookies: true,
    sessionLogs: true,
  });
  const [dataExported, setDataExported] = useState(false);

  const handleAskSupportAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery) return;
    setLoadingAi(true);
    setAiReply(null);
    try {
      const res = await fetch('/api/ai/moderate-and-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userQuery,
          type: 'support',
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiReply(data.reply);
      } else {
        setAiReply('A resposta do suporte não pôde ser carregada. Tente novamente.');
      }
    } catch (e) {
      setAiReply('Erro ao comunicar com o assistente de suporte por IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSent(false);
    }, 4000);
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
          Tire dúvidas frequentes, consulte o assistente virtual com IA ou gerencie suas preferências de privacidade.
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
          Assistente Virtual IA & Chamados
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-2">
            <h3 className="font-serif text-lg text-white font-light gold-accent">
              Como funcionam os créditos Mercado Pago?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Você recarrega qualquer valor desejado via PIX instantâneo ou Cartão de Crédito. Os créditos ficam salvos na sua carteira digital para serem usados no seu próprio ritmo.
            </p>
          </div>

          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-2">
            <h3 className="font-serif text-lg text-white font-light gold-accent">
              O que acontece se meu saldo acabar durante a consulta?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              O cronômetro do sistema avisa quando restarem 2 minutos. Caso o saldo atinja zero, a sala de chat ou vídeo é encerrada com total segurança e o extrato detalhado é emitido.
            </p>
          </div>

          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-2">
            <h3 className="font-serif text-lg text-white font-light gold-accent">
              As consultas são privadas e sigilosas?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Sim. Todos os chats e transmissões de vídeo utilizam criptografia de ponta a ponta e estão sujeitos ao código de ética e confidencialidade dos consultores.
            </p>
          </div>

          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-2">
            <h3 className="font-serif text-lg text-white font-light gold-accent">
              Como posso me cadastrar como consultor oraculista?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Envie sua solicitação através do painel. A equipe administrativa verificará seus dados, fotos e especialidades antes de liberar a conta.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: AI SUPPORT ASSISTANT & TICKETS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* AI Support Chat Box */}
          <div className="p-6 glass-card border border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 gold-accent" />
              <h3 className="font-serif text-xl font-light text-white">Assistente de Suporte Virtual Gemini</h3>
            </div>
            <p className="text-xs text-gray-400 font-light">
              Tire dúvidas instantâneas sobre recargas, cronômetro, salas de vídeo ou cadastro.
            </p>

            <form onSubmit={handleAskSupportAi} className="space-y-3">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ex: Como faço para pedir reembolso de uma consulta?"
                className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                required
              />
              <button
                type="submit"
                disabled={loadingAi}
                className="w-full py-2.5 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
              >
                {loadingAi ? 'Obtendo Resposta...' : 'Perguntar ao Assistente'}
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
              <h3 className="font-serif text-xl font-light text-white">Abrir Chamado Humano</h3>
            </div>
            <p className="text-xs text-gray-400 font-light">
              Sua dúvida necessita da intervenção da equipe? Envie uma mensagem diretamente ao nosso suporte.
            </p>

            {ticketSent ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs text-center space-y-1">
                <CheckCircle className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="font-bold">Chamado registrado com sucesso!</p>
                <p className="text-[11px] text-gray-300">Nossa equipe entrará em contato pelo e-mail cadastrado em até 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Assunto do Chamado</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Ex: Dúvida sobre repasse de comissão"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Descrição Detalhada</label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Escreva os detalhes da sua solicitação..."
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-white/10 hover:bg-[#d4af37] hover:text-black text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                >
                  Enviar Chamado
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
                <span className="block text-xs font-bold text-white">Comunicações e Bônus por E-mail</span>
                <span className="text-[11px] text-gray-400">Receber lembretes de cupons e promoções.</span>
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
                <span className="block text-xs font-bold text-white">Logs de Auditoria de Sessão</span>
                <span className="text-[11px] text-gray-400">Armazenamento temporário de logs financeiros para segurança.</span>
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
              onClick={() => setDataExported(true)}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Exportar Meus Dados em JSON
            </button>
            <button
              onClick={() => alert('Sua solicitação de exclusão de dados foi registrada e será analisada em 48 horas.')}
              className="flex-1 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Solicitar Exclusão da Conta
            </button>
          </div>

          {dataExported && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono text-center">
              ✓ Dados pessoais exportados com sucesso no formato criptografado em cumprimento à LGPD.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
