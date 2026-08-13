export interface MesaRadionicaInput {
  fullName: string;
  birthDate: string;
  question?: string;
}

export type TemaMesaRadionica =
  | 'amor'
  | 'trabalho'
  | 'prosperidade'
  | 'espiritualidade'
  | 'família'
  | 'proteção'
  | 'saúde'
  | 'geral';

export type NivelCampo =
  | 'muito-baixo'
  | 'baixo'
  | 'moderado'
  | 'alto'
  | 'muito-alto';

export interface IndicadorRadionico {
  id: string;
  nome: string;
  categoria:
    | 'emocional'
    | 'mental'
    | 'material'
    | 'relacional'
    | 'espiritual'
    | 'proteção'
    | 'vitalidade';
  descricao: string;
  luz: string;
  sombra: string;
  conselho: string;
  alerta: string;
  palavrasChave: string[];
}

export interface CampoRadionico {
  id: string;
  nome: string;
  categoria: IndicadorRadionico['categoria'];
  nivel: NivelCampo;
  percentual: number;
  indicadorPrincipal: IndicadorRadionico;
  indicadorComplementar: IndicadorRadionico;
  leitura: string;
  prioridade: number;
}

export interface MesaRadionicaResultado {
  oracle: 'mesa-radionica';

  entrada: {
    fullName: string;
    birthDate: string;
    question: string;
  };

  tema: TemaMesaRadionica;

  metodo: {
    nome: string;
    descricao: string;
    quantidadeCampos: number;
  };

  campos: {
    emocional: CampoRadionico;
    mental: CampoRadionico;
    material: CampoRadionico;
    relacional: CampoRadionico;
    espiritual: CampoRadionico;
    protecao: CampoRadionico;
    vitalidade: CampoRadionico;
  };

  sintese: {
    campoMaisEquilibrado: string;
    campoMaisDesafiado: string;
    prioridades: string[];
    temasRepetidos: string[];
    direcaoPrincipal: string;
  };

  resumoParaOraculo: string;
}

const INDICADORES: IndicadorRadionico[] = [
  {
    id: 'clareza-emocional',
    nome: 'Clareza Emocional',
    categoria: 'emocional',
    descricao:
      'Representa a capacidade de reconhecer sentimentos sem se perder neles.',
    luz:
      'autoconsciência, maturidade, expressão emocional e equilíbrio.',
    sombra:
      'confusão, reatividade, negação e dificuldade de nomear o que sente.',
    conselho:
      'observe a emoção antes de responder ou decidir.',
    alerta:
      'não transforme sensação momentânea em verdade definitiva.',
    palavrasChave: ['clareza', 'emoção', 'consciência', 'equilíbrio']
  },
  {
    id: 'dependencia-emocional',
    nome: 'Dependência Emocional',
    categoria: 'emocional',
    descricao:
      'Representa vínculos em que segurança pessoal depende excessivamente do outro.',
    luz:
      'percepção da necessidade de fortalecer autonomia e autoestima.',
    sombra:
      'carência, medo de abandono, controle e dificuldade de soltar.',
    conselho:
      'reconstrua segurança interna antes de exigir garantias externas.',
    alerta:
      'amor não deve exigir abandono de si.',
    palavrasChave: ['carência', 'apego', 'autonomia', 'limites']
  },
  {
    id: 'autoestima',
    nome: 'Autoestima',
    categoria: 'emocional',
    descricao:
      'Representa a forma como a pessoa reconhece o próprio valor.',
    luz:
      'autorespeito, confiança, dignidade e capacidade de estabelecer limites.',
    sombra:
      'autocrítica, comparação, submissão e busca constante por aprovação.',
    conselho:
      'aja de maneira coerente com o valor que deseja reconhecer em si.',
    alerta:
      'não entregue sua identidade à opinião alheia.',
    palavrasChave: ['valor', 'confiança', 'dignidade', 'limites']
  },
  {
    id: 'ansiedade-mental',
    nome: 'Ansiedade Mental',
    categoria: 'mental',
    descricao:
      'Representa excesso de antecipação, pensamentos repetitivos e dificuldade de repousar a mente.',
    luz:
      'capacidade de perceber riscos e preparar-se com antecedência.',
    sombra:
      'ruminação, medo, paralisia e criação de cenários sem evidência.',
    conselho:
      'separe fatos, hipóteses e medos antes de tomar decisões.',
    alerta:
      'pensamento repetido não se transforma automaticamente em verdade.',
    palavrasChave: ['ansiedade', 'pensamento', 'medo', 'antecipação']
  },
  {
    id: 'foco-mental',
    nome: 'Foco Mental',
    categoria: 'mental',
    descricao:
      'Representa concentração, organização das ideias e capacidade de concluir.',
    luz:
      'disciplina, clareza, planejamento e execução.',
    sombra:
      'dispersão, perfeccionismo, rigidez ou excesso de controle.',
    conselho:
      'escolha uma prioridade concreta e avance por etapas.',
    alerta:
      'planejamento sem ação também é uma forma de adiamento.',
    palavrasChave: ['foco', 'disciplina', 'planejamento', 'execução']
  },
  {
    id: 'crencas-limitantes',
    nome: 'Crenças Limitantes',
    categoria: 'mental',
    descricao:
      'Representa ideias internalizadas que restringem escolhas e possibilidades.',
    luz:
      'oportunidade de revisar narrativas antigas e ampliar consciência.',
    sombra:
      'autossabotagem, medo de tentar, repetição e baixa expectativa.',
    conselho:
      'questione qual evidência sustenta a crença que limita sua ação.',
    alerta:
      'não trate uma experiência antiga como regra para toda a vida.',
    palavrasChave: ['crença', 'limite', 'autossabotagem', 'mudança']
  },
  {
    id: 'fluxo-financeiro',
    nome: 'Fluxo Financeiro',
    categoria: 'material',
    descricao:
      'Representa circulação, organização e estabilidade dos recursos.',
    luz:
      'planejamento, equilíbrio, oportunidades e uso consciente do dinheiro.',
    sombra:
      'desorganização, desperdício, impulsividade e medo de escassez.',
    conselho:
      'acompanhe entradas, saídas e prioridades com dados reais.',
    alerta:
      'esperança financeira não substitui orçamento e estratégia.',
    palavrasChave: ['dinheiro', 'fluxo', 'organização', 'recursos']
  },
  {
    id: 'capacidade-realizacao',
    nome: 'Capacidade de Realização',
    categoria: 'material',
    descricao:
      'Representa a força de transformar intenção em ação concreta.',
    luz:
      'iniciativa, constância, produtividade e resultado.',
    sombra:
      'procrastinação, excesso de planos e dificuldade de finalizar.',
    conselho:
      'reduza a meta ao próximo passo executável.',
    alerta:
      'não espere motivação perfeita para começar.',
    palavrasChave: ['realização', 'ação', 'resultado', 'constância']
  },
  {
    id: 'seguranca-material',
    nome: 'Segurança Material',
    categoria: 'material',
    descricao:
      'Representa estabilidade, estrutura e capacidade de preservar recursos.',
    luz:
      'prudência, planejamento, disciplina e proteção patrimonial.',
    sombra:
      'apego, avareza, medo de mudança e estagnação.',
    conselho:
      'construa segurança sem bloquear toda possibilidade de crescimento.',
    alerta:
      'controle excessivo pode impedir oportunidades legítimas.',
    palavrasChave: ['segurança', 'estrutura', 'patrimônio', 'estabilidade']
  },
  {
    id: 'reciprocidade',
    nome: 'Reciprocidade',
    categoria: 'relacional',
    descricao:
      'Representa equilíbrio entre dar, receber, ouvir e ser ouvido.',
    luz:
      'parceria, respeito, cooperação e troca saudável.',
    sombra:
      'desequilíbrio, dependência, cobrança e exploração emocional.',
    conselho:
      'observe atitudes repetidas, não apenas promessas.',
    alerta:
      'afeto sem reciprocidade pode tornar-se desgaste.',
    palavrasChave: ['reciprocidade', 'troca', 'parceria', 'respeito']
  },
  {
    id: 'comunicacao-relacional',
    nome: 'Comunicação Relacional',
    categoria: 'relacional',
    descricao:
      'Representa clareza, escuta e capacidade de tratar conflitos.',
    luz:
      'diálogo, entendimento, verdade e negociação.',
    sombra:
      'silêncio punitivo, acusações, ruído e comunicação indireta.',
    conselho:
      'fale sobre fatos, sentimentos e necessidades sem atacar.',
    alerta:
      'supor a intenção do outro impede uma conversa real.',
    palavrasChave: ['comunicação', 'diálogo', 'verdade', 'escuta']
  },
  {
    id: 'limites-relacionais',
    nome: 'Limites Relacionais',
    categoria: 'relacional',
    descricao:
      'Representa capacidade de preservar identidade e segurança nos vínculos.',
    luz:
      'autorespeito, clareza, liberdade e relação equilibrada.',
    sombra:
      'controle, submissão, invasão ou afastamento defensivo.',
    conselho:
      'estabeleça limites claros e consequências coerentes.',
    alerta:
      'limite sem comunicação pode parecer punição.',
    palavrasChave: ['limites', 'autonomia', 'respeito', 'liberdade']
  },
  {
    id: 'conexao-interior',
    nome: 'Conexão Interior',
    categoria: 'espiritual',
    descricao:
      'Representa contato com valores, propósito e silêncio interior.',
    luz:
      'coerência, presença, sentido e discernimento.',
    sombra:
      'fuga da realidade, idealização e dependência de sinais externos.',
    conselho:
      'use reflexão interior para orientar atitudes concretas.',
    alerta:
      'nenhum sinal substitui responsabilidade e escolha.',
    palavrasChave: ['propósito', 'presença', 'valores', 'discernimento']
  },
  {
    id: 'intuicao-discernida',
    nome: 'Intuição Discernida',
    categoria: 'espiritual',
    descricao:
      'Representa percepção sutil acompanhada de verificação e equilíbrio.',
    luz:
      'sensibilidade, percepção, consciência e leitura cuidadosa do contexto.',
    sombra:
      'projeção, medo, fantasia e interpretação excessiva.',
    conselho:
      'trate a intuição como orientação a ser confirmada, não como prova.',
    alerta:
      'desejo e ansiedade podem imitar intuição.',
    palavrasChave: ['intuição', 'discernimento', 'percepção', 'realidade']
  },
  {
    id: 'proposito',
    nome: 'Propósito',
    categoria: 'espiritual',
    descricao:
      'Representa direção de vida, sentido e coerência com valores.',
    luz:
      'motivação, clareza, responsabilidade e contribuição.',
    sombra:
      'pressão por missão perfeita, comparação e fuga da vida prática.',
    conselho:
      'traduza propósito em ações pequenas e repetidas.',
    alerta:
      'propósito não precisa ser grandioso para ser verdadeiro.',
    palavrasChave: ['propósito', 'direção', 'sentido', 'coerência']
  },
  {
    id: 'limites-energeticos',
    nome: 'Limites Energéticos',
    categoria: 'proteção',
    descricao:
      'Representa proteção simbólica por meio de limites, rotina e discernimento.',
    luz:
      'segurança, autocuidado, organização e redução de exposição.',
    sombra:
      'medo, paranoia, isolamento e atribuição externa de todos os problemas.',
    conselho:
      'reduza exposição a ambientes e pessoas que geram desgaste real.',
    alerta:
      'nem todo desconforto indica ataque ou influência externa.',
    palavrasChave: ['proteção', 'limites', 'autocuidado', 'discernimento']
  },
  {
    id: 'vulnerabilidade',
    nome: 'Vulnerabilidade',
    categoria: 'proteção',
    descricao:
      'Representa pontos em que a pessoa se encontra mais exposta ou fragilizada.',
    luz:
      'consciência dos próprios limites e busca responsável de apoio.',
    sombra:
      'negação, exposição excessiva, medo ou dependência.',
    conselho:
      'reconheça fragilidades antes que se transformem em crises.',
    alerta:
      'pedir ajuda pode ser uma forma de proteção.',
    palavrasChave: ['vulnerabilidade', 'apoio', 'limite', 'cuidado']
  },
  {
    id: 'autoprotecao',
    nome: 'Autoproteção',
    categoria: 'proteção',
    descricao:
      'Representa ações práticas de segurança emocional, material e relacional.',
    luz:
      'prudência, limites, prevenção e responsabilidade.',
    sombra:
      'controle, rigidez, afastamento e reação defensiva constante.',
    conselho:
      'proteja-se com medidas concretas e proporcionais.',
    alerta:
      'proteção não deve transformar-se em prisão.',
    palavrasChave: ['autoproteção', 'prudência', 'prevenção', 'segurança']
  },
  {
    id: 'energia-disponivel',
    nome: 'Energia Disponível',
    categoria: 'vitalidade',
    descricao:
      'Representa disposição simbólica para agir, decidir e sustentar demandas.',
    luz:
      'vitalidade, iniciativa, presença e resistência.',
    sombra:
      'exaustão, dispersão, irritabilidade e perda de ritmo.',
    conselho:
      'priorize o essencial e respeite sinais de cansaço.',
    alerta:
      'não normalize exaustão permanente.',
    palavrasChave: ['energia', 'vitalidade', 'disposição', 'ritmo']
  },
  {
    id: 'ritmo-pessoal',
    nome: 'Ritmo Pessoal',
    categoria: 'vitalidade',
    descricao:
      'Representa equilíbrio entre esforço, descanso e recuperação.',
    luz:
      'constância, autocuidado, produtividade sustentável e recuperação.',
    sombra:
      'sobrecarga, culpa pelo descanso e alternância entre excesso e paralisação.',
    conselho:
      'organize ciclos de trabalho, pausa e recuperação.',
    alerta:
      'ritmo insustentável reduz clareza e capacidade de decisão.',
    palavrasChave: ['ritmo', 'descanso', 'constância', 'recuperação']
  },
  {
    id: 'presenca-corporal',
    nome: 'Presença Corporal',
    categoria: 'vitalidade',
    descricao:
      'Representa percepção do corpo, necessidades básicas e realidade concreta.',
    luz:
      'presença, aterramento, autocuidado e consciência dos limites.',
    sombra:
      'desconexão, negligência, excesso de estímulo e dificuldade de repousar.',
    conselho:
      'retorne ao corpo, à rotina e às necessidades básicas.',
    alerta:
      'questões persistentes de saúde exigem avaliação profissional.',
    palavrasChave: ['corpo', 'presença', 'autocuidado', 'aterramento']
  }
];

function normalizar(texto: string): string {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function limparNome(nome: string): string {
  return String(nome || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '');
}

function somaTexto(texto: string): number {
  return Array.from(String(texto || '')).reduce(
    (total, caractere, indice) =>
      total + caractere.charCodeAt(0) * (indice + 1),
    0
  );
}

function detectarTema(pergunta: string): TemaMesaRadionica {
  const texto = normalizar(pergunta);

  const grupos: Array<[TemaMesaRadionica, string[]]> = [
    ['amor', ['amor', 'relacionamento', 'namoro', 'casamento', 'ex', 'volta', 'sentimento', 'paixao', 'saudade']],
    ['trabalho', ['trabalho', 'emprego', 'carreira', 'profissao', 'empresa', 'chefe', 'vaga']],
    ['prosperidade', ['dinheiro', 'prosperidade', 'financeiro', 'riqueza', 'negocio', 'lucro', 'venda']],
    ['espiritualidade', ['espiritual', 'energia', 'missao', 'meditacao', 'intuicao', 'caminho']],
    ['família', ['familia', 'filho', 'filha', 'casa', 'mae', 'pai', 'irmao']],
    ['proteção', ['protecao', 'inveja', 'perseguicao', 'falsidade', 'ameaca', 'demanda']],
    ['saúde', ['saude', 'corpo', 'tratamento', 'doenca', 'cansaco', 'bem estar']]
  ];

  for (const [tema, termos] of grupos) {
    if (termos.some((termo) => texto.includes(termo))) {
      return tema;
    }
  }

  return 'geral';
}

function gerarSemente(input: MesaRadionicaInput): number {
  const nome = limparNome(input.fullName);
  const data = String(input.birthDate || '').replace(/\D/g, '');
  const pergunta = normalizar(input.question || '');

  return (
    somaTexto(nome) * 7 +
    somaTexto(data) * 11 +
    somaTexto(pergunta) * 17 +
    nome.length * 23
  );
}

function percentualCampo(
  semente: number,
  deslocamento: number
): number {
  const bruto = Math.abs(
    semente +
    deslocamento * deslocamento * 29 +
    Math.floor(semente / (deslocamento + 3)) * 7
  );

  return 20 + (bruto % 81);
}

function classificarNivel(percentual: number): NivelCampo {
  if (percentual <= 35) return 'muito-baixo';
  if (percentual <= 50) return 'baixo';
  if (percentual <= 65) return 'moderado';
  if (percentual <= 80) return 'alto';
  return 'muito-alto';
}

function selecionarIndicador(
  categoria: IndicadorRadionico['categoria'],
  semente: number,
  deslocamento: number,
  excluir?: string
): IndicadorRadionico {
  const candidatos = INDICADORES.filter(
    (indicador) =>
      indicador.categoria === categoria &&
      indicador.id !== excluir
  );

  const indice =
    Math.abs(
      semente +
      deslocamento * 31 +
      deslocamento * deslocamento * 13
    ) % candidatos.length;

  return candidatos[indice];
}

function construirLeituraCampo(
  nome: string,
  percentual: number,
  nivel: NivelCampo,
  principal: IndicadorRadionico,
  complementar: IndicadorRadionico
): string {
  const base =
    nivel === 'muito-alto'
      ? 'O campo está muito ativado e pode representar força disponível ou excesso que precisa ser regulado.'
      : nivel === 'alto'
        ? 'O campo está ativo e possui recursos importantes, embora ainda exija direção consciente.'
        : nivel === 'moderado'
          ? 'O campo apresenta equilíbrio relativo, com espaço para ajustes.'
          : nivel === 'baixo'
            ? 'O campo mostra fragilidade, bloqueio ou baixa disponibilidade no momento.'
            : 'O campo exige prioridade, cuidado e reorganização antes de novas exigências.';

  return `${nome}: ${percentual}% (${nivel}). ${base} ` +
    `Indicador principal: ${principal.nome}. ${principal.descricao} ` +
    `Indicador complementar: ${complementar.nome}. ${complementar.conselho}`;
}

function calcularPrioridade(
  percentual: number,
  categoria: IndicadorRadionico['categoria'],
  tema: TemaMesaRadionica
): number {
  const base = 100 - percentual;

  const pesoTema =
    (tema === 'amor' && categoria === 'relacional') ||
    (tema === 'trabalho' && (categoria === 'mental' || categoria === 'material')) ||
    (tema === 'prosperidade' && categoria === 'material') ||
    (tema === 'espiritualidade' && categoria === 'espiritual') ||
    (tema === 'família' && categoria === 'relacional') ||
    (tema === 'proteção' && categoria === 'proteção') ||
    (tema === 'saúde' && categoria === 'vitalidade')
      ? 25
      : 0;

  return base + pesoTema;
}

function criarCampo(
  id: string,
  nome: string,
  categoria: IndicadorRadionico['categoria'],
  semente: number,
  deslocamento: number,
  tema: TemaMesaRadionica
): CampoRadionico {
  const percentual = percentualCampo(semente, deslocamento);
  const nivel = classificarNivel(percentual);

  const indicadorPrincipal = selecionarIndicador(
    categoria,
    semente,
    deslocamento
  );

  const indicadorComplementar = selecionarIndicador(
    categoria,
    semente,
    deslocamento + 7,
    indicadorPrincipal.id
  );

  return {
    id,
    nome,
    categoria,
    nivel,
    percentual,
    indicadorPrincipal,
    indicadorComplementar,
    leitura: construirLeituraCampo(
      nome,
      percentual,
      nivel,
      indicadorPrincipal,
      indicadorComplementar
    ),
    prioridade: calcularPrioridade(
      percentual,
      categoria,
      tema
    )
  };
}

function analisarTemas(campos: CampoRadionico[]): string[] {
  const mapa = new Map<string, number>();

  for (const campo of campos) {
    const palavras = [
      ...campo.indicadorPrincipal.palavrasChave,
      ...campo.indicadorComplementar.palavrasChave
    ];

    for (const palavra of palavras) {
      mapa.set(
        palavra,
        (mapa.get(palavra) || 0) + 1
      );
    }
  }

  return Array.from(mapa.entries())
    .filter(([, quantidade]) => quantidade >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([palavra]) => palavra);
}

function formatarCampo(campo: CampoRadionico): string {
  return `
═══════════════════════
${campo.nome.toUpperCase()}
═══════════════════════

Percentual simbólico:
${campo.percentual}%

Nível:
${campo.nivel}

Indicador principal:
${campo.indicadorPrincipal.nome}

Descrição:
${campo.indicadorPrincipal.descricao}

Luz:
${campo.indicadorPrincipal.luz}

Sombra:
${campo.indicadorPrincipal.sombra}

Indicador complementar:
${campo.indicadorComplementar.nome}

Leitura:
${campo.leitura}

Conselho:
${campo.indicadorPrincipal.conselho}

Alerta:
${campo.indicadorPrincipal.alerta}
`.trim();
}

export function buildMesaRadionicaSuprema(
  input: MesaRadionicaInput
): MesaRadionicaResultado {
  const entrada = {
    fullName: String(input.fullName || '').trim(),
    birthDate: String(input.birthDate || '').trim(),
    question: String(input.question || '').trim()
  };

  const tema = detectarTema(entrada.question);
  const semente = gerarSemente(entrada);

  const emocional = criarCampo(
    'emocional',
    'Campo Emocional',
    'emocional',
    semente,
    3,
    tema
  );

  const mental = criarCampo(
    'mental',
    'Campo Mental',
    'mental',
    semente,
    7,
    tema
  );

  const material = criarCampo(
    'material',
    'Campo Material',
    'material',
    semente,
    11,
    tema
  );

  const relacional = criarCampo(
    'relacional',
    'Campo Relacional',
    'relacional',
    semente,
    17,
    tema
  );

  const espiritual = criarCampo(
    'espiritual',
    'Campo Espiritual',
    'espiritual',
    semente,
    23,
    tema
  );

  const protecao = criarCampo(
    'protecao',
    'Campo de Proteção',
    'proteção',
    semente,
    29,
    tema
  );

  const vitalidade = criarCampo(
    'vitalidade',
    'Campo de Vitalidade',
    'vitalidade',
    semente,
    37,
    tema
  );

  const todos = [
    emocional,
    mental,
    material,
    relacional,
    espiritual,
    protecao,
    vitalidade
  ];

  const ordenadosPorPercentual = [...todos].sort(
    (a, b) => b.percentual - a.percentual
  );

  const ordenadosPorPrioridade = [...todos].sort(
    (a, b) => b.prioridade - a.prioridade
  );

  const campoMaisEquilibrado =
    ordenadosPorPercentual[0].nome;

  const campoMaisDesafiado =
    ordenadosPorPercentual[
      ordenadosPorPercentual.length - 1
    ].nome;

  const prioridades = ordenadosPorPrioridade
    .slice(0, 3)
    .map(
      (campo) =>
        `${campo.nome}: ${campo.indicadorPrincipal.nome}`
    );

  const temasRepetidos = analisarTemas(todos);

  const principalPrioridade = ordenadosPorPrioridade[0];

  const direcaoPrincipal =
    `A prioridade simbólica está em ${principalPrioridade.nome}, ` +
    `especialmente no tema ${principalPrioridade.indicadorPrincipal.nome}. ` +
    `${principalPrioridade.indicadorPrincipal.conselho}`;

  const resumoParaOraculo = `
MESA RADIÔNICA SUPREMA

Método:
Mapa dos Sete Campos

Tema detectado:
${tema}

${formatarCampo(emocional)}

${formatarCampo(mental)}

${formatarCampo(material)}

${formatarCampo(relacional)}

${formatarCampo(espiritual)}

${formatarCampo(protecao)}

${formatarCampo(vitalidade)}

═══════════════════════
SÍNTESE
═══════════════════════

Campo mais equilibrado:
${campoMaisEquilibrado}

Campo mais desafiado:
${campoMaisDesafiado}

Prioridades:
${prioridades.join('\n')}

Temas repetidos:
${
  temasRepetidos.length
    ? temasRepetidos.join(', ')
    : 'sem repetição dominante'
}

Direção principal:
${direcaoPrincipal}

═══════════════════════
INSTRUÇÕES PARA O CONSULTOR
═══════════════════════

Interprete esta mesa como um mapa simbólico de reflexão.

Os percentuais são indicadores internos do método e não representam
medições científicas, médicas, psicológicas ou energéticas comprovadas.

Não diga que mediu frequências, vibrações, chakras, campos invisíveis,
entidades, ataques ou doenças.

Não diga que realizou limpeza, cura, desbloqueio ou tratamento.

Não apresente a resposta como laudo técnico.

Cruze:

• o campo emocional;
• o campo mental;
• o campo material;
• o campo relacional;
• o campo espiritual;
• o campo de proteção;
• o campo de vitalidade.

Dê maior atenção aos três campos com maior prioridade.

Use os indicadores como linguagem simbólica para explicar padrões,
hábitos, limites, escolhas e atitudes possíveis.

Quando o tema envolver proteção, não confirme perseguição, ataque,
demanda, inveja ou influência externa como fato sem evidência concreta.

Quando o tema envolver saúde, deixe claro que a leitura não substitui
avaliação, diagnóstico, tratamento ou acompanhamento profissional.

Não recomende abandonar medicamentos, terapias ou cuidados médicos.

Não prometa cura, riqueza, retorno amoroso, proteção absoluta
ou qualquer resultado inevitável.

Não afirme pensamentos e sentimentos de terceiros como fatos.

Preserve o livre-arbítrio e a responsabilidade do consulente.

A resposta deve ser profunda, clara, humana, ética,
natural e coerente com o consultor escolhido.
`.trim();

  return {
    oracle: 'mesa-radionica',

    entrada,

    tema,

    metodo: {
      nome: 'Mapa dos Sete Campos',
      descricao:
        'Leitura simbólica dos campos emocional, mental, material, relacional, espiritual, proteção e vitalidade.',
      quantidadeCampos: 7
    },

    campos: {
      emocional,
      mental,
      material,
      relacional,
      espiritual,
      protecao,
      vitalidade
    },

    sintese: {
      campoMaisEquilibrado,
      campoMaisDesafiado,
      prioridades,
      temasRepetidos,
      direcaoPrincipal
    },

    resumoParaOraculo
  };
}

export const MESA_RADIONICA_INDICADORES = INDICADORES;

export default buildMesaRadionicaSuprema;