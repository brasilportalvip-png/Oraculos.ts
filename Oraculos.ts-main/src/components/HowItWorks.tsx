import React from 'react';
import { Users, Wallet, MessageSquare, ShieldCheck, Zap, Sparkles, Clock } from 'lucide-react';
import { useConsultation } from '../context/ConsultationContext';

export const HowItWorks: React.FC = () => {
  const { setIsRechargeModalOpen } = useConsultation();

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 gold-accent text-xs font-bold uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 gold-accent" />
          Transparência & Tecnologia
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">Como Funciona a ORACULOS.TS</h1>
        <p className="text-xs sm:text-sm text-gray-400 font-light">
          Sua consulta de Tarot, Búzios e Astrologia sem complicações em 3 passos simples.
        </p>
      </div>

      {/* 3 Step Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 glass-card border border-white/10 rounded-2xl space-y-4 shadow-xl relative overflow-hidden group hover:border-[#d4af37]/50 transition-all">
          <div className="text-4xl font-serif gold-accent opacity-20 absolute top-4 right-6">01</div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 gold-accent w-fit">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-light text-white group-hover:text-[#d4af37] transition-colors">1. Escolha o Consultor</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            Navegue pela vitrine dinâmica de oraculistas. Confira fotos, especialidades, avaliações dos clientes, valor por minuto e status online.
          </p>
        </div>

        <div className="p-8 glass-card border border-white/10 rounded-2xl space-y-4 shadow-xl relative overflow-hidden group hover:border-[#d4af37]/50 transition-all">
          <div className="text-4xl font-serif gold-accent opacity-20 absolute top-4 right-6">02</div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 gold-accent w-fit">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-light text-white group-hover:text-[#d4af37] transition-colors">2. Adicione Créditos</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            Adicione saldo com total segurança através do Mercado Pago via PIX instantâneo ou Cartão de Crédito. Seus créditos ficam armazenados na sua carteira digital.
          </p>
        </div>

        <div className="p-8 glass-card border border-white/10 rounded-2xl space-y-4 shadow-xl relative overflow-hidden group hover:border-[#d4af37]/50 transition-all">
          <div className="text-4xl font-serif gold-accent opacity-20 absolute top-4 right-6">03</div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 gold-accent w-fit">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-light text-white group-hover:text-[#d4af37] transition-colors">3. Inicie por Chat ou Vídeo</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            Abra a sala de atendimento ao vivo. O cronômetro exibirá o tempo e o consumo de créditos minuto a minuto em tempo real com cobrança justa.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-8 sm:p-10 rounded-3xl mystical-gradient glass-card border border-white/10 text-center space-y-4">
        <h2 className="font-serif text-3xl font-light text-white">Pronto para buscar suas respostas?</h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto font-light">
          Adicione créditos agora mesmo e faça sua primeira consulta com nossos mestres oraculistas.
        </p>
        <button
          onClick={() => setIsRechargeModalOpen(true)}
          className="px-6 py-3 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl transition-transform hover:scale-105 cursor-pointer"
        >
          Adicionar Créditos Mercado Pago
        </button>
      </div>
    </div>
  );
};

function HelpCircle(props: any) {
  return <Sparkles {...props} />;
}
