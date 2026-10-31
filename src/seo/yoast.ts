/**
 * ORACULOS.TS — SEO no padrão Yoast
 *
 * Regras aplicadas em todas as páginas:
 *  - Título SEO entre 30 e 60 caracteres, palavra-chave foco no início.
 *  - Meta description entre 120 e 156 caracteres, com a palavra-chave e chamada para ação.
 *  - Palavra-chave foco presente no título, na descrição, no H1 e na URL.
 *  - Dados estruturados: BreadcrumbList em todas as páginas internas, FAQPage nos oráculos.
 */

export const SITE = 'https://oraculos-ts.vercel.app';
export const MARCA = 'ORACULOS.TS';

export const TITULO_MAX = 60;
export const DESCRICAO_MIN = 120;
export const DESCRICAO_MAX = 156;

const CTAS = [
  'Consulte agora com sigilo total.',
  'Atendimento ao vivo por chat ou vídeo.',
  'Pague só os minutos usados.',
];

function cortarNaPalavra(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite - 1);
  const ultimoEspaco = corte.lastIndexOf(' ');
  return `${(ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte).replace(/[\s,.;:—–-]+$/, '')}…`;
}

/** Título final: acrescenta a marca só se couber em 60 caracteres. */
export function tituloSEO(titulo: string): string {
  const limpo = String(titulo || '').replace(/\s+/g, ' ').trim();
  if (limpo.toUpperCase().includes(MARCA)) return cortarNaPalavra(limpo, TITULO_MAX);
  const comMarca = `${limpo} | ${MARCA}`;
  if (comMarca.length <= TITULO_MAX) return comMarca;
  return cortarNaPalavra(limpo, TITULO_MAX);
}

/** Meta description final entre 120 e 156 caracteres. */
export function descricaoSEO(descricao: string): string {
  let texto = String(descricao || '').replace(/\s+/g, ' ').trim();
  if (texto && !/[.!?…]$/.test(texto)) texto += '.';
  for (const cta of CTAS) {
    if (texto.length >= DESCRICAO_MIN) break;
    if ((`${texto} ${cta}`).length <= DESCRICAO_MAX) texto = `${texto} ${cta}`.trim();
  }
  return cortarNaPalavra(texto, DESCRICAO_MAX);
}

export interface ItemTrilha {
  nome: string;
  caminho: string;
}

export function breadcrumbJsonLd(itens: ItemTrilha[]): Record<string, unknown> {
  const lista = [{ nome: 'Início', caminho: '/' }, ...itens];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: lista.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nome,
      item: `${SITE}${item.caminho}`,
    })),
  };
}

export function faqJsonLd(perguntas: Array<{ pergunta: string; resposta: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntas.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  };
}

// ---------------------------------------------------------------------------
// Páginas fixas
// ---------------------------------------------------------------------------

export interface SeoPagina {
  palavraChave: string;
  titulo: string;
  descricao: string;
}

export const SEO_PAGINAS: Record<string, SeoPagina> = {
  inicio: {
    palavraChave: 'consulta de tarot online',
    titulo: 'Consulta de Tarot Online ao Vivo e Oráculos',
    descricao:
      'Consulta de tarot online, baralho cigano, búzios e astrologia ao vivo com oraculistas experientes. Leitura com seus dados natal e o dia certo. Comece agora.',
  },
  oraculos: {
    palavraChave: 'oráculos online',
    titulo: 'Oráculos Online: Tarot, Cigano, Búzios e Mais',
    descricao:
      'Oráculos online para cada pergunta: Tarot, Baralho Cigano, Búzios, Ifá, Runas, Astrologia, Numerologia, I Ching, Cristais e Mesa Radiônica. Escolha o seu.',
  },
  blog: {
    palavraChave: 'blog de tarot e espiritualidade',
    titulo: 'Blog de Tarot, Astrologia e Espiritualidade',
    descricao:
      'Blog de tarot e espiritualidade com guias de Baralho Cigano, Astrologia, Búzios, limpeza energética e autoconhecimento feitos por oraculistas. Leia grátis.',
  },
  comoFunciona: {
    palavraChave: 'consulta espiritual online',
    titulo: 'Como Funciona a Consulta Espiritual Online',
    descricao:
      'Veja como funciona a consulta espiritual online: cadastre seus dados natal, escolha o oraculista, compre minutos e converse por chat ou vídeo com sigilo.',
  },
  ajuda: {
    palavraChave: 'central de ajuda e privacidade',
    titulo: 'Central de Ajuda, Privacidade e LGPD',
    descricao:
      'Central de ajuda e privacidade do ORACULOS.TS: dúvidas sobre minutos, pagamentos, reembolso, segurança da conta e direitos pela LGPD. Fale com o suporte.',
  },
  trabalheConosco: {
    palavraChave: 'trabalhe como tarólogo',
    titulo: 'Trabalhe como Tarólogo e Oraculista Online',
    descricao:
      'Trabalhe como tarólogo e oraculista online no ORACULOS.TS: atenda clientes de todo o Brasil por chat e vídeo, defina sua agenda e receba repasses semanais.',
  },
};

// ---------------------------------------------------------------------------
// Oráculos
// ---------------------------------------------------------------------------

export interface SeoOraculo extends SeoPagina {
  nome: string;
  faq: Array<{ pergunta: string; resposta: string }>;
}

function faqPadrao(nome: string, chave: string): SeoOraculo['faq'] {
  return [
    {
      pergunta: `Como funciona a ${chave}?`,
      resposta: `Você informa seu nome completo de nascimento e sua data de nascimento, faz a pergunta e o oraculista abre o jogo de ${nome} ao vivo, cruzando seus dados natal com a energia do dia da consulta.`,
    },
    {
      pergunta: `Posso perguntar sobre outra pessoa no ${nome}?`,
      resposta:
        'Sim. Informe o nome completo e a data de nascimento da pessoa. A leitura diferencia amor, sociedade, emprego, família e contratação.',
    },
    {
      pergunta: `Quanto custa a ${chave}?`,
      resposta:
        'A consulta é cobrada por minuto a partir de pacotes de minutos pagos pelo Mercado Pago. Cada oraculista mostra o valor por minuto no perfil.',
    },
  ];
}

const BASE_ORACULOS: Record<string, { nome: string; palavraChave: string; titulo: string; descricao: string }> = {
  tarot: {
    nome: 'Tarot',
    palavraChave: 'tarot online',
    titulo: 'Tarot Online: Consulta ao Vivo com Tarólogas',
    descricao:
      'Tarot online ao vivo com os 78 arcanos para amor, trabalho e dinheiro. Leitura com seus dados natal e a energia do dia. Respostas claras e sigilo total.',
  },
  'baralho-cigano': {
    nome: 'Baralho Cigano',
    palavraChave: 'baralho cigano online',
    titulo: 'Baralho Cigano Online: Consulta Lenormand',
    descricao:
      'Baralho cigano online com as 36 cartas Lenormand: respostas rápidas e certeiras sobre amor, traição, emprego e dinheiro. Converse ao vivo agora mesmo.',
  },
  astrologia: {
    nome: 'Astrologia',
    palavraChave: 'mapa astral online',
    titulo: 'Mapa Astral Online e Consulta de Astrologia',
    descricao:
      'Mapa astral online com astrólogos ao vivo: signo, ascendente, trânsitos e sinastria amorosa a partir da sua data, hora e cidade de nascimento. Consulte já.',
  },
  numerologia: {
    nome: 'Numerologia',
    palavraChave: 'numerologia online',
    titulo: 'Numerologia Online: Mapa do Nome e Data',
    descricao:
      'Numerologia online pelo nome de solteiro e data de nascimento: caminho de vida, ano pessoal, dias favoráveis e compatibilidade. Descubra seus números agora.',
  },
  buzios: {
    nome: 'Búzios',
    palavraChave: 'jogo de búzios online',
    titulo: 'Jogo de Búzios Online com Mãe de Santo',
    descricao:
      'Jogo de búzios online com mães de santo experientes: o recado dos Orixás sobre caminhos, amor, proteção e prosperidade. Atendimento ao vivo e com respeito.',
  },
  ifa: {
    nome: 'Ifá',
    palavraChave: 'consulta de ifá online',
    titulo: 'Consulta de Ifá Online: Os Odùs do Destino',
    descricao:
      'Consulta de Ifá online com os Odùs sagrados: orientação sobre destino, Orí, caminhos abertos e bloqueios, com a sabedoria ancestral iorubá. Agende agora.',
  },
  runas: {
    nome: 'Runas',
    palavraChave: 'runas online',
    titulo: 'Runas Online: Consulta de Runas Nórdicas',
    descricao:
      'Runas online com o Futhark antigo: leitura direta sobre decisões, proteção, conflitos e superação, feita por runólogos ao vivo. Faça sua pergunta agora.',
  },
  'i-ching': {
    nome: 'I Ching',
    palavraChave: 'i ching online',
    titulo: 'I Ching Online: Consulta dos 64 Hexagramas',
    descricao:
      'I Ching online com os 64 hexagramas e linhas mutáveis: saiba o momento certo de agir em mudanças de vida, negócios e relações. Consulta ao vivo com mestre.',
  },
  cristais: {
    nome: 'Cristais',
    palavraChave: 'oráculo dos cristais',
    titulo: 'Oráculo dos Cristais: Leitura Energética Online',
    descricao:
      'Oráculo dos cristais online: leitura dos seus campos emocional, mental, material e espiritual, com o cristal certo para o seu momento. Consulte ao vivo.',
  },
  'mesa-radionica': {
    nome: 'Mesa Radiônica',
    palavraChave: 'mesa radiônica online',
    titulo: 'Mesa Radiônica Online: Análise Energética',
    descricao:
      'Mesa radiônica online: análise dos sete campos energéticos, bloqueios e prioridades com orientação prática para destravar sua vida. Atendimento ao vivo.',
  },
};

export function seoOraculo(slug: string): SeoOraculo | null {
  const base = BASE_ORACULOS[slug];
  if (!base) return null;
  return { ...base, faq: faqPadrao(base.nome, base.palavraChave) };
}

export const SLUGS_ORACULOS = Object.keys(BASE_ORACULOS);
