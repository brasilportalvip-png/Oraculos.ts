import React from 'react';
import { ShieldCheck, Lock, Heart, FileText, Scale, Eye, HelpCircle } from 'lucide-react';
import { resolveNavigationTarget } from '../routing/routes';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (!onNavigate || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(target);
  };

  const footerLink = (target: string, label: React.ReactNode, className = 'hover:text-amber-300 transition') => (
    <a
      href={resolveNavigationTarget(target).path}
      onClick={(event) => handleNav(event, target)}
      className={className}
    >
      {label}
    </a>
  );

  return (
    <footer className="bg-[#050508] border-t border-white/5 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 Brand & Ethics */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/brand/logo-oraculos.png?v=20260831"
                alt="ORACULOS.TS Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://portalvipbrasil.com.br/wp-content/uploads/2026/07/logo-oraculos.png';
                }}
                className="w-10 h-10 rounded-xl object-contain border border-[#d4af37]/30 shadow-md bg-[#0a0a12]/80 p-0.5"
              />
              <span className="text-lg font-bold text-white tracking-tight">
                ORACULOS<span className="gold-accent">.TS</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Plataforma sagrada de consultas oraculares e orientação pessoal online em tempo real. Conectando consulentes aos mais experientes especialistas em Tarot, Baralho Cigano, Astrologia e Búzios com acolhimento, sigilo e respeito.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-[11px] font-mono text-amber-300 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Conformidade LGPD & Zero-Trust
              </span>
            </div>
          </div>

          {/* Col 2 Oracles Canônicos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif gold-accent">
              Tradições Oraculares
            </h4>
            <ul className="text-xs space-y-2 text-gray-400">
              <li>{footerLink('oraculos/tarot', 'Tarot (78 Arcanos Maiores e Menores)')}</li>
              <li>{footerLink('oraculos/baralho-cigano', 'Baralho Cigano (Lenormand)')}</li>
              <li>{footerLink('oraculos/astrologia', 'Astrologia & Trânsitos Planetários')}</li>
              <li>{footerLink('oraculos/numerologia', 'Numerologia Pessoal & Destino')}</li>
              <li>{footerLink('oraculos/buzios', 'Jogo de Búzios, Ifá & Runas')}</li>
              <li>{footerLink('oraculos/i-ching', 'I Ching, Cristais & Mesa Radiônica')}</li>
              <li>{footerLink('workWithUs', 'Trabalhe Conosco', 'font-bold text-amber-300 hover:text-amber-200 transition')}</li>
            </ul>
          </div>

          {/* Col 3 Compliance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif gold-accent">
              Políticas & Transparência
            </h4>
            <ul className="text-xs space-y-2 text-gray-400">
              <li>
                {footerLink('termos', <><FileText className="w-3.5 h-3.5 text-purple-400" />Termos de Uso</>, 'flex items-center gap-1.5 hover:text-amber-300 transition')}
              </li>
              <li>
                {footerLink('privacidade', <><Scale className="w-3.5 h-3.5 text-purple-400" />Política de Privacidade (LGPD)</>, 'flex items-center gap-1.5 hover:text-amber-300 transition')}
              </li>
              <li>
                {footerLink('cookies', <><ShieldCheck className="w-3.5 h-3.5 text-purple-400" />Política de Cookies</>, 'flex items-center gap-1.5 hover:text-amber-300 transition')}
              </li>
              <li>
                {footerLink('reembolso', <><Lock className="w-3.5 h-3.5 text-purple-400" />Política de Cancelamento & Reembolso</>, 'flex items-center gap-1.5 hover:text-amber-300 transition')}
              </li>
              <li>
                {footerLink('ajuda', <><HelpCircle className="w-3.5 h-3.5 text-purple-400" />Central de Ajuda & DPO</>, 'flex items-center gap-1.5 hover:text-amber-300 transition')}
              </li>
            </ul>
          </div>

          {/* Col 4 Segurança & Pagamento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif gold-accent">
              Pagamentos Seguros
            </h4>
            <p className="text-xs text-gray-400">
              Processamento seguro e criptografado com o ecossistema Mercado Pago. Tarifação de minutos controlada estritamente pelo servidor.
            </p>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Pix Instantâneo & Cartão</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <Lock className="w-4 h-4" />
                <span>Auditoria e Ledger de Minutos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Ético e Legal Obrigatório */}
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 text-center text-[11px] text-gray-400 leading-relaxed">
          <p>
            <strong className="text-amber-200">Aviso Legal & Ético:</strong> As orientações e leituras oraculares oferecidas na plataforma ORACULOS.TS destinam-se exclusivamente ao autoconhecimento, reflexão e entretenimento espiritual. Nossos serviços não garantem resultados milagrosos, infalibilidade ou destino imutável, e não substituem sob nenhuma hipótese consultas, diagnósticos ou tratamentos médicos, psicológicos, psiquiátricos, jurídicos ou financeiros profissionais.
          </p>
        </div>

        <div className="pt-6 border-t border-white/5 text-center text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} ORACULOS.TS. Todos os direitos reservados.</p>
          <p className="flex items-center justify-center gap-1">
            Desenvolvido com integridade para Orientação Espiritual e Oracular
          </p>
        </div>
      </div>
    </footer>
  );
};
