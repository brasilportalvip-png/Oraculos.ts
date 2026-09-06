import React from 'react';
import { ArrowLeft, Shield, FileText, Lock, RefreshCw, CheckCircle, Scale } from 'lucide-react';
import { SEOHead } from './SEOHead';

export type LegalDocType = 'termos' | 'privacidade' | 'cookies' | 'reembolso';

interface LegalPageProps {
  type: LegalDocType;
  onBack: () => void;
  onNavigateDoc: (doc: LegalDocType) => void;
}

const LEGAL_DOCS: Record<LegalDocType, {
  title: string;
  h1: string;
  subtitle: string;
  canonical: string;
  lastUpdated: string;
  sections: { title: string; content: string[] }[];
}> = {
  termos: {
    title: 'Termos de Uso e Condições Gerais — ORACULOS.TS',
    h1: 'Termos e Condições Gerais de Uso da Plataforma',
    subtitle: 'Diretrizes legais, direitos e deveres dos consulentes e especialistas credenciados na plataforma ORACULOS.TS.',
    canonical: '/termos',
    lastUpdated: '14 de Agosto de 2026',
    sections: [
      {
        title: '1. Objeto e Natureza dos Serviços',
        content: [
          'A plataforma ORACULOS.TS é um ecossistema digital que conecta consulentes a especialistas em artes oraculares e disponibiliza ferramentas virtuais de orientação intuitiva.',
          'Os atendimentos prestados têm caráter estritamente de aconselhamento intuitivo, autoconhecimento e reflexão espiritual. Nenhuma consulta substitui orientação médica, psicológica, jurídica ou financeira profissional.',
        ],
      },
      {
        title: '2. Cadastro e Capacidade Civil',
        content: [
          'O acesso aos serviços pagos é restrito a maiores de 18 anos ou pessoas plenamente emancipadas nos termos do Código Civil Brasileiro (Lei Nº 10.406/2002).',
          'O usuário é o único responsável pela veracidade e integridade dos dados cadastrais informados, respondendo civil e criminalmente por falsidade ideológica.',
        ],
      },
      {
        title: '3. Modelo de Tarifação e Pacotes de Minutos',
        content: [
          'A tarifação é calculada com base nos minutos exatos decorridos durante a sessão ativa em tempo real.',
          'A aquisição de pacotes de minutos pré-pagos é processada pelo gateway oficial Mercado Pago, garantindo segurança bancária com criptografia ponta a ponta.',
          'O saldo adquirido em minutos é debitado de forma transparente conforme o consumo efetivo na sala de consulta.',
        ],
      },
      {
        title: '4. Especialistas Credenciados e Acolhimento',
        content: [
          'A plataforma conecta consulentes a oraculistas dedicados nas tradições canônicas de Tarot, Baralho Cigano, Astrologia, Búzios e mesas radiônicas.',
          'Todas as orientações visam o acolhimento espiritual, o autoconhecimento e a clareza de caminhos, mantendo sigilo e respeito absoluto ao livre-arbítrio.',
        ],
      },
    ],
  },
  privacidade: {
    title: 'Política de Privacidade e Proteção de Dados LGPD — ORACULOS.TS',
    h1: 'Política de Privacidade e Proteção de Dados Pessoais',
    subtitle: 'Compromisso com a Lei Geral de Proteção de Dados (Lei Nº 13.709/2018 - LGPD) e sigilo absoluto das consultas.',
    canonical: '/privacidade',
    lastUpdated: '14 de Agosto de 2026',
    sections: [
      {
        title: '1. Tratamento de Dados e Bases Legais (LGPD)',
        content: [
          'A ORACULOS.TS coleta apenas os dados essenciais para execução do contrato (art. 7º, V da LGPD) e cumprimento de obrigações legais fiscais (art. 7º, II da LGPD).',
          'Os dados coletados incluem: nome completo de nascimento, data de nascimento (para confecção de mapas astrológicos e numerológicos), e-mail e registros de transações de créditos.',
        ],
      },
      {
        title: '2. Sigilo Absoluto e Confidencialidade das Consultas',
        content: [
          'O conteúdo das mensagens trocadas nas salas de consulta privadas é protegido por sigilo oracular e criptografia em trânsito e repouso.',
          'Nenhum dado sensível de consulta é vendido, compartilhado ou comercializado com terceiros sob qualquer pretexto publicitário.',
        ],
      },
      {
        title: '3. Direitos do Titular de Dados',
        content: [
          'Em conformidade com o art. 18 da LGPD, o titular possui o direito de confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos, solicitar a portabilidade em JSON e requerer a eliminação definitiva dos seus dados.',
          'A solicitação de exclusão definitiva pode ser realizada a qualquer momento através do nosso formulário de suporte ou no Portal de Privacidade da plataforma.',
        ],
      },
      {
        title: '4. Encarregado de Proteção de Dados (DPO)',
        content: [
          'Para exercer seus direitos de titular ou esclarecer qualquer dúvida sobre privacidade, contate nosso Encarregado de Proteção de Dados através do canal oficial: dpo@oraculos.ts ou pelo suporte da plataforma.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Política de Cookies e Tecnologias de Rastreamento — ORACULOS.TS',
    h1: 'Política de Cookies e Armazenamento Local',
    subtitle: 'Explicação detalhada sobre o uso de cookies necessários, de sessão e de preferências de navegação.',
    canonical: '/cookies',
    lastUpdated: '14 de Agosto de 2026',
    sections: [
      {
        title: '1. O que são Cookies?',
        content: [
          'Cookies são pequenos arquivos de texto armazenados no navegador do usuário para manter sua autenticação segura, lembrar preferências e garantir o correto funcionamento da plataforma.',
        ],
      },
      {
        title: '2. Categorias de Cookies Utilizados',
        content: [
          'Cookies Estritamente Necessários: Essenciais para a autenticação no Firebase Auth, persistência do token de sessão e integridade do carrinho de créditos.',
          'Cookies de Desempenho e PWA: Utilizados pelo Service Worker para fornecer suporte a carregamento rápido e modo offline.',
        ],
      },
      {
        title: '3. Gerenciamento de Cookies no Navegador',
        content: [
          'Você pode desativar ou remover cookies diretamente nas configurações do seu navegador (Chrome, Safari, Firefox, Edge). A desativação de cookies estritamente necessários pode inviabilizar o login.',
        ],
      },
    ],
  },
  reembolso: {
    title: 'Política de Cancelamento, Estorno e Reembolso — ORACULOS.TS',
    h1: 'Política de Cancelamento e Reembolso de Créditos',
    subtitle: 'Procedimentos claros para solicitação de estorno em conformidade com o Código de Defesa do Consumidor (Lei 8.078/90).',
    canonical: '/reembolso',
    lastUpdated: '14 de Agosto de 2026',
    sections: [
      {
        title: '1. Direito de Arrependimento (Art. 49 do CDC)',
        content: [
          'Conforme o Artigo 49 do Código de Defesa do Consumidor, o cliente tem até 7 (sete) dias corridos a partir da data de compra para solicitar o cancelamento e reembolso integral de pacotes de minutos não consumidos.',
        ],
      },
      {
        title: '2. Interrupções Técnicas e Reposição de Minutos',
        content: [
          'Caso ocorra queda de conexão imputável à infraestrutura da plataforma durante uma consulta ativa, os minutos equivalentes ao período afetado serão estornados automaticamente para a carteira do usuário mediante análise dos logs da sessão.',
        ],
      },
      {
        title: '3. Prazo e Forma de Restituição',
        content: [
          'Pagamentos via Pix aprovados no Mercado Pago são estornados na mesma chave bancária de origem em até 2 (dois) dias úteis após a aprovação da solicitação pelo suporte.',
          'Para abrir uma solicitação formal de reembolso, basta enviar uma mensagem pelo formulário de suporte informando o ID da transação ou e-mail cadastrado.',
        ],
      },
    ],
  },
};

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack, onNavigateDoc }) => {
  const doc = LEGAL_DOCS[type] || LEGAL_DOCS.termos;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-16">
      <SEOHead
        title={doc.title}
        description={doc.subtitle}
        canonicalPath={doc.canonical}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: doc.h1,
          description: doc.subtitle,
          publisher: {
            '@type': 'Organization',
            name: 'ORACULOS.TS',
            url: 'https://oraculos-ts.vercel.app',
          },
        }}
      />

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-white/10 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Plataforma
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigateDoc('termos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'termos' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Termos
          </button>
          <button
            onClick={() => onNavigateDoc('privacidade')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'privacidade' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Privacidade LGPD
          </button>
          <button
            onClick={() => onNavigateDoc('cookies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'cookies' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Cookies
          </button>
          <button
            onClick={() => onNavigateDoc('reembolso')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              type === 'reembolso' ? 'bg-[#d4af37] text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Reembolso
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-[#150F26] border border-purple-800/40 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          Documento Jurídico Oficial
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-white leading-tight">
          {doc.h1}
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
          {doc.subtitle}
        </p>
        <div className="text-[11px] font-mono text-purple-300/70 pt-1">
          Última atualização: {doc.lastUpdated}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {doc.sections.map((section, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-[#150F26]/60 border border-purple-900/40 space-y-3"
          >
            <h2 className="font-serif text-lg sm:text-xl font-light text-amber-200">
              {section.title}
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
