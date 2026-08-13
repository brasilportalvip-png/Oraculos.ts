import React from 'react';
import { Sparkles, ShieldCheck, Lock, Heart, CheckCircle, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050508] border-t border-white/5 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#7c3aed] flex items-center justify-center text-black font-serif font-bold">
                Ω
              </div>
              <span className="text-lg font-bold text-white tracking-tight">ORACULOS<span className="gold-accent">.TS</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Plataforma empresarial de consultas espirituais online em tempo real. Conectando você aos melhores oraculistas do Brasil com sigilo, transparência e elegância.
            </p>
          </div>

          {/* Col 2 Oracles */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif gold-accent">Oráculos Populares</h4>
            <ul className="text-xs space-y-1.5 text-gray-400">
              <li>• Tarot de Marseille & Lenormand</li>
              <li>• Baralho Cigano Tradicional</li>
              <li>• Astrologia & Mapa Astral</li>
              <li>• Jogo de Búzios & Ifá</li>
              <li>• Mesa Radiônica Quântica</li>
            </ul>
          </div>

          {/* Col 3 Compliance & Security */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif gold-accent">Segurança Garantida</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>SSL 256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 gold-accent font-semibold">
                <Lock className="w-4 h-4" />
                <span>Checkout Mercado Pago SDK</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Cálculos financeiros e tarifação efetuados exclusivamente via backend Node.js com auditoria.
              </p>
            </div>
          </div>

          {/* Col 4 Mobile App readiness */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif gold-accent">Multiplataforma PWA</h4>
            <p className="text-xs text-gray-400">
              Preparado para versão Web, PWA responsivo e aplicativo Android via Android Studio.
            </p>
            <div className="pt-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 rounded-full">
                v2.4.0 • Enterprise Release
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} ORACULOS.TS. Todos os direitos reservados. Conexão espiritual segura e criptografada.</p>
          <p className="flex items-center justify-center gap-1">
            Desenvolvido com <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> para Consultas Espirituais Online
          </p>
        </div>
      </div>
    </footer>
  );
};
