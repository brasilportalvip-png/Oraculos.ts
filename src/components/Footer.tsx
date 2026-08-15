import React from 'react';
import { FileText, HelpCircle, Lock, Scale, ShieldCheck } from 'lucide-react';
import { resolveNavigationTarget } from '../routing/routes';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (targetKey: string, e?: React.MouseEvent) => {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
      return;
    }
    if (e) {
      e.preventDefault();
    }
    if (onNavigate) {
      onNavigate(targetKey);
    } else {
      const { path } = resolveNavigationTarget(targetKey);
      window.location.pathname = path;
    }
  };

  const renderFooterLink = (targetKey: string, label: string, Icon?: React.ElementType) => {
    const { path } = resolveNavigationTarget(targetKey);
    return (
      <a
        href={path}
        onClick={(e) => handleNav(targetKey, e)}
        className="inline-flex items-center gap-1.5 hover:text-amber-300 transition cursor-pointer text-gray-400"
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />}
        <span>{label}</span>
      </a>
    );
  };

  return (
    <footer className="bg-[#050508] border-t border-white/5 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 Brand & Ethics */}
          <div className="space-y-4">
            <a
              href="/"
              onClick={(e) => handleNav('showcase', e)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src="/brand/logo-oraculos.png"
                alt="ORACULOS.TS Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://portalvipbrasil.com.br/wp-content/uploads/2026/07/logo-oraculos.png';
                }}
                className="w-10 h-10 rounded-xl object-contain border border-[#d4af37]/30 shadow-md bg-[#0a0a12]/80 p-0.5"
              />
              <span className="text-lg font-bold text-white tracking-tight">
                ORACULOS<span className="gold-accent">.TS</span>
              </span>
            </a>
            <p className="text-xs text-gray-400 leading-relaxed">
              Plataforma tecnológica de consultas oraculares e orientação pessoal online em tempo real. Conectando consulentes a especialistas e atendentes virtuais com rigor ético, transparência e segurança.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-[11px] font-mono text-amber-300 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
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
              <li>{renderFooterLink('oraculos/tarot', 'Tarot (78 Arcanos)')}</li>
              <li>{renderFooterLink('oraculos/baralho-cigano', 'Baralho Cigano (Lenormand)')}</li>
              <li>{renderFooterLink('oraculos/astrologia', 'Astrologia & Trânsitos Planetários')}</li>
              <li>{renderFooterLink('oraculos/numerologia', 'Numerologia Pessoal & Destino')}</li>
              <li>{renderFooterLink('oraculos/buzios', 'Jogo de Búzios, Ifá & Runas')}</li>
              <li>{renderFooterLink('oraculos/i-ching', 'I Ching, Cristais & Mesa Radiônica')}</li>
            </ul>
          </div>

          {/* Col 3 Compliance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif gold-accent">
              Políticas & Transparência
            </h4>
            <ul className="text-xs space-y-2 text-gray-400">
              <li>{renderFooterLink('termos', 'Termos de Uso', FileText)}</li>
              <li>{renderFooterLink('privacidade', 'Política de Privacidade (LGPD)', Scale)}</li>
              <li>{renderFooterLink('cookies', 'Política de Cookies', ShieldCheck)}</li>
              <li>{renderFooterLink('reembolso', 'Política de Cancelamento & Reembolso', Lock)}</li>
              <li>{renderFooterLink('ajuda', 'Central de Ajuda & DPO', HelpCircle)}</li>
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
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Pix Instantâneo & Cartão</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <Lock className="w-4 h-4" aria-hidden="true" />
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
