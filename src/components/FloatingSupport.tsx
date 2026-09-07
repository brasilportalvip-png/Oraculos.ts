import React, { useState } from 'react';
import { MessageCircle, Send, HelpCircle, X, ShieldCheck } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl = 'https://chat.whatsapp.com/JqXdWPrCVxz1NC9dXyMdso';
  const telegramUrl = 'https://t.me/+EOUhr0Xa2_00NDQ5';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Support Menu Drawer */}
      {isOpen && (
        <div className="bg-[#0f0f18] border border-[#d4af37]/30 rounded-2xl p-5 shadow-2xl w-80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200 text-gray-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-semibold text-white text-sm">Suporte & Atendimento</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar Suporte"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Precisa de ajuda com suas consultas, recarga de saldo ou dúvidas gerais? Fale diretamente com nossa equipe oficial nos canais abaixo:
          </p>

          <div className="space-y-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-300">Grupo de Suporte WhatsApp</p>
                <p className="text-[10px] text-emerald-400/80">Atendimento oficial para consulentes</p>
              </div>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-sky-300">Canal Oficial Telegram</p>
                <p className="text-[10px] text-sky-400/80">Avisos, novidades e suporte direto</p>
              </div>
            </a>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-400 text-center">
            Atendimento Rápido e Seguro • ORACULOS.TS
          </div>
        </div>
      )}

      {/* Main Trigger Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-amber-500 to-amber-600 text-black font-bold shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all group"
        aria-label="Abrir Suporte Rápido"
      >
        <HelpCircle className="w-5 h-5 text-black group-hover:rotate-12 transition-transform" />
        <span className="text-xs tracking-wider uppercase font-semibold">Suporte VIP</span>
      </button>
    </div>
  );
};
