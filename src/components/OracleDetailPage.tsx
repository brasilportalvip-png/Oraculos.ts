import React from 'react';
import { ArrowLeft, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { ORACLE_CATEGORIES } from '../data/oracleConfig';
import { Consultant, OracleType } from '../types';
import { canonicalOracleSlug, oracleTypeFromSlug } from '../routing/routes';
import { SEOHead } from './SEOHead';
import { ConsultantCard } from './ConsultantCard';
import { NotFoundPage } from './NotFoundPage';

interface OracleDetailPageProps {
  oracleId: string;
  consultants: Consultant[];
  onBack: () => void;
  onSelectConsultant: (consultant: Consultant) => void;
  onStartConsultation: (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => void;
}

const ORACLE_DESCRIPTIONS: Record<string, {
  title: string;
  h1: string;
  subtitle: string;
  history: string;
  howItWorks: string;
  symbolsCount: string;
  elements: string[];
  canonical: string;
}> = {
  tarot: {
    title: 'Consulta de Tarot Online ao Vivo — 78 Arcanos',
    h1: 'Tarot Sagrado: Revelação de Caminhos e Arcanos Maiores',
    subtitle: 'Orientação espiritual profunda com os 22 Arcanos Maiores e 56 Arcanos Menores para amor, finanças e destino.',
    history: 'Com origens que remontam aos mistérios do Renascimento e ao hermetismo egípcio, o Tarot é a mais consagrada linguagem arquetípica da alma humana.',
    howItWorks: 'Durante a sessão, o consulente formula suas perguntas e lâminas sagradas são tiradas com interpretação contextualizada em tempo real.',
    symbolsCount: '78 Lâminas Sagradas',
    elements: ['Amor & Relacionamentos', 'Carreira & Negócios', 'Evolução Espiritual', 'Tomada de Decisão'],
    canonical: '/oraculos/tarot',
  },
  'baralho-cigano': {
    title: 'Consulta de Baralho Cigano Online — Mandala Lenormand',
    h1: 'Baralho Cigano Lenormand: Clareza Prática e Objetiva',
    subtitle: 'As 36 lâminas tradicionais da tradição cigana para respostas rápidas, amorosas e financeiras.',
    history: 'Criado pela célebre vidente Madame Lenormand e enriquecido pela sabedoria do povo cigano, este oráculo destaca-se pela precisão cotidiana.',
    howItWorks: 'A tiragem utiliza mandalas e combinações diretas de cartas para revelar eventos imediatos, sentimentos ocultos e soluções práticas.',
    symbolsCount: '36 Cartas Lenormand',
    elements: ['Caminhos Abertos', 'Alianças e Fidelidade', 'Notícias Rápidas', 'Proteção e Prosperidade'],
    canonical: '/oraculos/baralho-cigano',
  },
  cigano: {
    title: 'Consulta de Baralho Cigano Online — Mandala Lenormand',
    h1: 'Baralho Cigano Lenormand: Clareza Prática e Objetiva',
    subtitle: 'As 36 lâminas tradicionais da tradição cigana para respostas rápidas, amorosas e financeiras.',
    history: 'Criado pela célebre vidente Madame Lenormand e enriquecido pela sabedoria do povo cigano, este oráculo destaca-se pela precisão cotidiana.',
    howItWorks: 'A tiragem utiliza mandalas e combinações diretas de cartas para revelar eventos imediatos, sentimentos ocultos e soluções práticas.',
    symbolsCount: '36 Cartas Lenormand',
    elements: ['Caminhos Abertos', 'Alianças e Fidelidade', 'Notícias Rápidas', 'Proteção e Prosperidade'],
    canonical: '/oraculos/baralho-cigano',
  },
  astrologia: {
    title: 'Mapa Astral e Astrologia Online — Trânsitos e Sinastria',
    h1: 'Astrologia Hermética: Mapa Astral, Trânsitos e Casas Cósmicas',
    subtitle: 'Compreenda a posição dos astros no momento do seu nascimento e os trânsitos planetários vigentes.',
    history: 'A mais antiga ciência dos céus, transmitida desde a Babilônia e o Egito Antigo, decodifica a sincronicidade entre o cosmos e a psique humana.',
    howItWorks: 'A análise cruza data, hora exata e cidade natal para desvendar vocações, compatibilidades afetivas e ciclos de oportunidade.',
    symbolsCount: '12 Signos, 10 Astros, 12 Casas',
    elements: ['Signo Solar & Ascendente', 'Lua Emocional', 'Revolução Solar', 'Sinastria Amorosa'],
    canonical: '/oraculos/astrologia',
  },
  numerologia: {
    title: 'Mapa Numerológico Pitagórico e Cabalístico Online',
    h1: 'Numerologia Sagrada: Decodifique a Vibração do Seu Nome e Data',
    subtitle: 'Caminho de vida, número de expressão, alma, desafios e ciclos de poder pessoal.',
    history: 'Fundamentada por Pitágoras e pela tradição cabalística dos números sagrados, cada letra e dígito carrega uma frequência universal.',
    howItWorks: 'A soma reduzida do nome completo de certidão e data de nascimento gera a matriz numerológica completa da sua encarnação.',
    symbolsCount: 'Números 1 a 9, Mestres 11, 22, 33',
    elements: ['Missão de Alma', 'Ano Pessoal', 'Compatibilidade Numerológica', 'Dias Favoráveis'],
    canonical: '/oraculos/numerologia',
  },
  buzios: {
    title: 'Jogo de Búzios Sagrados Online — Tradição Orixás e Odús',
    h1: 'Jogo de Búzios dos Orixás: Os 16 Búzios da Tradição Ancestral',
    subtitle: 'Comunicação sagrada através dos 16 búzios africanos e conselhos dos Orixás para saúde e caminhos.',
    history: 'Prática sacerdotal milenar dos povos iorubás, o Merindilogun (16 búzios) conecta o orum (mundo espiritual) ao aiye (mundo material).',
    howItWorks: 'A caída dos búzios sobre o tabuleiro sagrado indica os Odús regentes, oferendas propiciatórias e orientações diretas das divindades.',
    symbolsCount: '16 Búzios Sagrados (Odús)',
    elements: ['Proteção Espiritual', 'Alinhamento com Orixás', 'Abertura de Caminhos', 'Saúde e Vitalidade'],
    canonical: '/oraculos/buzios',
  },
  ifa: {
    title: 'Consulta de Ifá e Odús Tradicionais Online — Sabedoria Maior',
    h1: 'Sabedoria de Ifá: Os 16 Odús Maiores e a Filosofia Tradicional',
    subtitle: 'A mais alta sabedoria oracular ancestral para equilíbrio do destino individual (Orí).',
    history: 'Reconhecido pela UNESCO como Patrimônio Cultural Imaterial da Humanidade, o sistema de Ifá preserva milhares de versos sagrados (Itans).',
    howItWorks: 'Através da leitura dos Odús, são identificados os caminhos de luz (Ire) e os bloqueios (Ibi), orientando condutas éticas e espirituais.',
    symbolsCount: '16 Odús Maiores (256 Odu Keke)',
    elements: ['Culto ao Orí', 'Destino Sagrado', 'Harmonia Cósmica', 'Prosperidade Ancestral'],
    canonical: '/oraculos/ifa',
  },
  runas: {
    title: 'Consulta de Runas Nórdicas Online — Futhark Antigo',
    h1: 'Runas Nórdicas do Elder Futhark: A Força dos Deuses Vikings',
    subtitle: 'Os 24 símbolos sagrados esculpidos em pedra para força, coragem e superação de adversidades.',
    history: 'Segundo a mitologia nórdica, as Runas foram reveladas a Odin após seu sacrifício na árvore Yggdrasil como chaves para os segredos do universo.',
    howItWorks: 'O lançamento das pedras rúnicas revela as forças elementares em jogo e o conselho guerreiro para agir no momento oportuno.',
    symbolsCount: '24 Runas Sagradas',
    elements: ['Vitória e Coragem', 'Proteção Espiritual', 'Prosperidade Rúnica', 'Cura e Resiliência'],
    canonical: '/oraculos/runas',
  },
  iching: {
    title: 'I Ching Online — O Livro das Mutações e 64 Hexagramas',
    h1: 'I Ching Sagrado: O Livro das Mutações e a Sabedoria Taoísta',
    subtitle: 'Consulte a dinâmica cósmica do Yin e Yang com os 64 Hexagramas da sabedoria milenar chinesa.',
    history: 'Com mais de 3.000 anos, o I Ching é uma das mais profundas obras filosóficas e oraculares da humanidade, reverenciado por Confúcio e Carl Jung.',
    howItWorks: 'O sorteio das linhas mutáveis revela a situação presente e a sua tendência natural de transformação, indicando a melhor postura ética.',
    symbolsCount: '64 Hexagramas e 384 Linhas',
    elements: ['Equilíbrio Yin & Yang', 'Tempo Certo de Agir', 'Decisões Estratégicas', 'Paz Interior'],
    canonical: '/oraculos/i-ching',
  },
  'i-ching': {
    title: 'I Ching Online — O Livro das Mutações e 64 Hexagramas',
    h1: 'I Ching Sagrado: O Livro das Mutações e a Sabedoria Taoísta',
    subtitle: 'Consulte a dinâmica cósmica do Yin e Yang com os 64 Hexagramas da sabedoria milenar chinesa.',
    history: 'Com mais de 3.000 anos, o I Ching é uma das mais profundas obras filosóficas e oraculares da humanidade, reverenciado por Confúcio e Carl Jung.',
    howItWorks: 'O sorteio das linhas mutáveis revela a situação presente e a sua tendência natural de transformação, indicando a melhor postura ética.',
    symbolsCount: '64 Hexagramas e 384 Linhas',
    elements: ['Equilíbrio Yin & Yang', 'Tempo Certo de Agir', 'Decisões Estratégicas', 'Paz Interior'],
    canonical: '/oraculos/i-ching',
  },
  cristais: {
    title: 'Litomancia e Cristais Sagrados Online — Frequências Minerais',
    h1: 'Oráculo dos Cristais: Geometria Sagrada e Vibração Mineral',
    subtitle: 'Alinhamento dos 7 chakras, transmutação energética e leitura intuitiva com gemas preciosas.',
    history: 'Utilizados desde a Atlântida, Lemúria e civilizações egípcias, os cristais são condensadores perfeitos de luz e frequência pura.',
    howItWorks: 'A seleção das pedras atua no campo bioenergético do consulente, identificando bloqueios sutis e emitindo frequências de reequilíbrio.',
    symbolsCount: '32 Gemas Sagradas',
    elements: ['Alinhamento de Chakras', 'Transmutação Energética', 'Proteção Áurica', 'Clareza Mental'],
    canonical: '/oraculos/cristais',
  },
  mesaradionica: {
    title: 'Mesa Radiônica e Radiestesia Quântica Online',
    h1: 'Mesa Radiônica Quântica: Alinhamento Energético e Frequências',
    subtitle: 'Harmonização de campos sutis, dissolução de bloqueios e emissão de frequências radiônicas.',
    history: 'Integrando princípios de radiestesia clássica, geometria sagrada e física quântica, a Mesa Radiônica é uma poderosa ferramenta de transmutação.',
    howItWorks: 'Com o auxílio do pêndulo e gráficos de emissão, o operador mede e neutraliza desequilíbrios na saúde, relacionamentos e negócios.',
    symbolsCount: 'Geometrias e Frequências Quânticas',
    elements: ['Corte de Bloqueios', 'Harmonização de Ambientes', 'Destravamento Financeiro', 'Alinhamento Espiritual'],
    canonical: '/oraculos/mesa-radionica',
  },
  'mesa-radionica': {
    title: 'Mesa Radiônica e Radiestesia Quântica Online',
    h1: 'Mesa Radiônica Quântica: Alinhamento Energético e Frequências',
    subtitle: 'Harmonização de campos sutis, dissolução de bloqueios e emissão de frequências radiônicas.',
    history: 'Integrando princípios de radiestesia clássica, geometria sagrada e física quântica, a Mesa Radiônica é uma poderosa ferramenta de transmutação.',
    howItWorks: 'Com o auxílio do pêndulo e gráficos de emissão, o operador mede e neutraliza desequilíbrios na saúde, relacionamentos e negócios.',
    symbolsCount: 'Geometrias e Frequências Quânticas',
    elements: ['Corte de Bloqueios', 'Harmonização de Ambientes', 'Destravamento Financeiro', 'Alinhamento Espiritual'],
    canonical: '/oraculos/mesa-radionica',
  },
};

export const OracleDetailPage: React.FC<OracleDetailPageProps> = ({
  oracleId,
  consultants,
  onBack,
  onSelectConsultant,
  onStartConsultation,
}) => {
  const canonicalSlug = canonicalOracleSlug(oracleId) || oracleId.toLowerCase().replace(/\s+/g, '-');
  const details = ORACLE_DESCRIPTIONS[canonicalSlug] || ORACLE_DESCRIPTIONS[oracleId.toLowerCase()];

  if (!details) {
    return <NotFoundPage onGoHome={onBack} />;
  }

  const oracleType = oracleTypeFromSlug(canonicalSlug) || 'tarot';
  const oracleConfig = ORACLE_CATEGORIES[oracleType] || ORACLE_CATEGORIES.tarot;

  // Authorized consultants only.
  const matchingConsultants = consultants.filter((consultant) => {
    const authorizedOracles =
      consultant.allowedOracles && consultant.allowedOracles.length > 0
        ? consultant.allowedOracles
        : consultant.specialties || [];

    return authorizedOracles.some(
      (oracle) => canonicalOracleSlug(String(oracle)) === canonicalSlug
    );
  });

  const displayConsultants = matchingConsultants;

  return (
    <div className="space-y-10 pb-16">
      <SEOHead
        title={details.title}
        description={details.subtitle}
        canonicalPath={details.canonical}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: details.h1,
          description: details.subtitle,
          provider: {
            '@type': 'Organization',
            name: 'ORACULOS.TS',
            url: 'https://oraculos-ts.vercel.app',
          },
          areaServed: 'BR',
        }}
      />

      {/* Navigation breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar a Todos os Oráculos
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1F1638]/80 to-[#0B0813] border border-purple-800/40 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Motor Oracular Oficial ORACULOS.TS
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
            {details.h1}
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            {details.subtitle}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {details.elements.map((el) => (
              <span
                key={el}
                className="px-3 py-1 bg-black/40 border border-purple-700/40 rounded-full text-xs text-purple-200"
              >
                ✓ {el}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Content: History & How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#150F26]/60 border border-purple-800/30 space-y-3">
          <h2 className="font-serif text-xl font-light text-amber-200">Tradição & Origem Histórica</h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            {details.history}
          </p>
          <div className="pt-2 text-xs font-mono text-amber-400/80">
            Base Simbólica: {details.symbolsCount}
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-[#150F26]/60 border border-purple-800/30 space-y-3">
          <h2 className="font-serif text-xl font-light text-amber-200">Como Funciona a Consulta ao Vivo</h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            {details.howItWorks}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-purple-300">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Tarifação por Minuto Real</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-400" aria-hidden="true" /> Chat Seguro em tempo real</span>
          </div>
        </div>
      </div>

      {/* Dedicated Specialists Section for this Oracle */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-light text-white">
              Especialistas e Atendentes Disponíveis em {oracleConfig.name}
            </h2>
            <p className="text-xs text-gray-400">
              Escolha seu consultor credenciado ou atendente virtual com sabedoria canônica.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
            {displayConsultants.length} Disponíveis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {displayConsultants.length > 0 ? (
    displayConsultants.map((c) => (
      <ConsultantCard
        key={c.id}
        consultant={c}
        onSelect={() => onSelectConsultant(c)}
        onStartChat={() => onStartConsultation(c, oracleType, 'chat')}
        onStartVideo={() => undefined}
      />
    ))
  ) : (
    <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-purple-800/30 bg-[#150F26]/60 p-6 text-center">
      <p className="text-sm text-gray-300">
        Nenhum consultor credenciado está disponível para este oráculo no momento.
      </p>
    </div>
  )}
</div>
      </div>
    </div>
  );
};
