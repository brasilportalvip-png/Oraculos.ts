export type IntentCategory =
  | 'amor'
  | 'trabalho'
  | 'prosperidade'
  | 'espiritualidade'
  | 'família'
  | 'saúde'
  | 'proteção'
  | 'autoconhecimento'
  | 'decisão'
  | 'futuro'
  | 'geral';

export interface IntentAnalysis {
  category: IntentCategory;
  subcategory?: string;
  needsSecondPerson: boolean;
  confidence: number;
  keywords: string[];
  sensitiveTopics: string[];
  normalizedQuestion: string;
}

const CATEGORY_TERMS: Record<IntentCategory, string[]> = {
  amor: [
    'amor',
    'relacionamento',
    'namoro',
    'casamento',
    'paixao',
    'ficante',
    'ex',
    'reconciliacao',
    'saudade',
    'sentimento',
    'volta',
    'traicao',
    'ciume'
  ],

  trabalho: [
    'trabalho',
    'emprego',
    'carreira',
    'profissao',
    'empresa',
    'chefe',
    'colega',
    'vaga',
    'promocao',
    'demissao'
  ],

  prosperidade: [
    'dinheiro',
    'prosperidade',
    'financeiro',
    'riqueza',
    'lucro',
    'negocio',
    'venda',
    'divida',
    'investimento',
    'pagamento'
  ],

  espiritualidade: [
    'espiritual',
    'espiritualidade',
    'missao',
    'intuicao',
    'mediunidade',
    'guia',
    'entidade',
    'caminho espiritual',
    'desenvolvimento espiritual'
  ],

  família: [
    'familia',
    'filho',
    'filha',
    'mae',
    'pai',
    'irmao',
    'irma',
    'parente',
    'casa',
    'lar'
  ],

  saúde: [
    'saude',
    'doenca',
    'tratamento',
    'medico',
    'remedio',
    'cirurgia',
    'gravidez',
    'corpo',
    'dor',
    'cura'
  ],

  proteção: [
    'protecao',
    'inveja',
    'olho gordo',
    'perseguicao',
    'falsidade',
    'demanda',
    'ataque',
    'energia negativa',
    'ameaca'
  ],

  autoconhecimento: [
    'quem sou',
    'personalidade',
    'missao de vida',
    'me conhecer',
    'autoconhecimento',
    'meu potencial',
    'meu bloqueio',
    'meu destino',
    'minha sombra'
  ],

  decisão: [
    'devo',
    'escolher',
    'decidir',
    'qual caminho',
    'vale a pena',
    'continuar',
    'desistir',
    'aceitar',
    'recusar'
  ],

  futuro: [
    'futuro',
    'vai acontecer',
    'o que vem',
    'tendencia',
    'proximos meses',
    'este ano',
    'amanha',
    'quando'
  ],

  geral: []
};

const SECOND_PERSON_PATTERNS = [
  /\b(ele|ela|dele|dela)\b/i,
  /\bmeu ex\b/i,
  /\bminha ex\b/i,
  /\bmeu namorado\b/i,
  /\bminha namorada\b/i,
  /\bmeu marido\b/i,
  /\bminha esposa\b/i,
  /\bmeu ficante\b/i,
  /\bminha ficante\b/i,
  /\bessa pessoa\b/i,
  /\baquela pessoa\b/i,
  /\bfulano\b/i,
  /\bfulana\b/i,
  /\bme ama\b/i,
  /\bgosta de mim\b/i,
  /\bpensa em mim\b/i,
  /\bsente minha falta\b/i,
  /\bvai voltar\b/i,
  /\bvai me procurar\b/i,
  /\btem outra pessoa\b/i,
  /\bquer compromisso\b/i
];

const GENERAL_LOVE_PATTERNS = [
  /\bminha vida amorosa\b/i,
  /\bmeu futuro amoroso\b/i,
  /\bmeus caminhos no amor\b/i,
  /\bsorte no amor\b/i,
  /\barea amorosa\b/i,
  /\bvida sentimental\b/i
];

const SENSITIVE_TOPICS: Record<string, string[]> = {
  saúde: [
    'doenca',
    'diagnostico',
    'cura',
    'tratamento',
    'remedio',
    'cirurgia',
    'gravidez',
    'morte'
  ],

  financeiro: [
    'investimento',
    'apostar',
    'aposta',
    'emprestimo',
    'divida',
    'falencia',
    'lucro garantido'
  ],

  violência: [
    'matar',
    'violencia',
    'agressao',
    'ameaca',
    'vinganca'
  ],

  espiritual: [
    'ataque espiritual',
    'demanda',
    'obsessao',
    'possessao',
    'encosto',
    'maldição',
    'maldicao'
  ]
};

function normalize(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(
  text: string,
  terms: string[]
): {
  score: number;
  matches: string[];
} {
  const matches = terms.filter((term) =>
    text.includes(normalize(term))
  );

  return {
    score: matches.length,
    matches
  };
}

function detectCategory(
  question: string
): {
  category: IntentCategory;
  confidence: number;
  keywords: string[];
} {
  const scores = (
    Object.keys(CATEGORY_TERMS) as IntentCategory[]
  )
    .filter((category) => category !== 'geral')
    .map((category) => {
      const result = countMatches(
        question,
        CATEGORY_TERMS[category]
      );

      return {
        category,
        score: result.score,
        matches: result.matches
      };
    })
    .sort((a, b) => b.score - a.score);

  const first = scores[0];

  if (!first || first.score === 0) {
    return {
      category: 'geral',
      confidence: 0.35,
      keywords: []
    };
  }

  const secondScore = scores[1]?.score || 0;

  const confidence = Math.min(
    0.98,
    0.55 +
      first.score * 0.1 +
      Math.max(0, first.score - secondScore) * 0.05
  );

  return {
    category: first.category,
    confidence,
    keywords: first.matches
  };
}

function detectSubcategory(
  category: IntentCategory,
  question: string
): string | undefined {
  const rules: Partial<
    Record<
      IntentCategory,
      Array<{
        name: string;
        terms: string[];
      }>
    >
  > = {
    amor: [
      {
        name: 'reconciliação',
        terms: ['volta', 'reconciliacao', 'retorno', 'ex']
      },
      {
        name: 'sentimentos',
        terms: ['me ama', 'gosta de mim', 'sentimento', 'saudade']
      },
      {
        name: 'compromisso',
        terms: ['casamento', 'compromisso', 'namoro', 'futuro juntos']
      },
      {
        name: 'conflito',
        terms: ['briga', 'ciume', 'traicao', 'afastamento']
      }
    ],

    trabalho: [
      {
        name: 'novo emprego',
        terms: ['vaga', 'novo emprego', 'entrevista', 'contratacao']
      },
      {
        name: 'crescimento profissional',
        terms: ['promocao', 'crescer', 'carreira', 'reconhecimento']
      },
      {
        name: 'conflito profissional',
        terms: ['chefe', 'colega', 'demissao', 'conflito']
      }
    ],

    prosperidade: [
      {
        name: 'organização financeira',
        terms: ['divida', 'gasto', 'orcamento', 'pagamento']
      },
      {
        name: 'negócios',
        terms: ['negocio', 'venda', 'cliente', 'empresa']
      },
      {
        name: 'ganhos',
        terms: ['dinheiro', 'lucro', 'prosperidade', 'riqueza']
      }
    ],

    espiritualidade: [
      {
        name: 'missão espiritual',
        terms: ['missao', 'proposito', 'caminho espiritual']
      },
      {
        name: 'desenvolvimento',
        terms: ['mediunidade', 'intuicao', 'desenvolvimento']
      },
      {
        name: 'orientação espiritual',
        terms: ['guia', 'entidade', 'sinal', 'orientacao']
      }
    ],

    decisão: [
      {
        name: 'permanecer ou sair',
        terms: ['continuar', 'desistir', 'ficar', 'sair']
      },
      {
        name: 'aceitar ou recusar',
        terms: ['aceitar', 'recusar']
      },
      {
        name: 'escolha de caminho',
        terms: ['qual caminho', 'escolher', 'decidir']
      }
    ]
  };

  const categoryRules = rules[category] || [];

  const result = categoryRules
    .map((rule) => ({
      ...rule,
      score: rule.terms.filter((term) =>
        question.includes(normalize(term))
      ).length
    }))
    .sort((a, b) => b.score - a.score)[0];

  return result?.score
    ? result.name
    : undefined;
}

function detectSecondPerson(
  question: string
): boolean {
  if (
    GENERAL_LOVE_PATTERNS.some((pattern) =>
      pattern.test(question)
    )
  ) {
    return false;
  }

  return SECOND_PERSON_PATTERNS.some((pattern) =>
    pattern.test(question)
  );
}

function detectSensitiveTopics(
  question: string
): string[] {
  const result: string[] = [];

  for (const [topic, terms] of Object.entries(
    SENSITIVE_TOPICS
  )) {
    if (
      terms.some((term) =>
        question.includes(normalize(term))
      )
    ) {
      result.push(topic);
    }
  }

  return result;
}

export class IntentEngine {
  public analyze(question: string): IntentAnalysis {
    const normalizedQuestion = normalize(question);

    if (!normalizedQuestion) {
      return {
        category: 'geral',
        subcategory: undefined,
        needsSecondPerson: false,
        confidence: 0,
        keywords: [],
        sensitiveTopics: [],
        normalizedQuestion
      };
    }

    const categoryResult =
      detectCategory(normalizedQuestion);

    return {
      category: categoryResult.category,

      subcategory: detectSubcategory(
        categoryResult.category,
        normalizedQuestion
      ),

      needsSecondPerson:
        detectSecondPerson(normalizedQuestion),

      confidence:
        categoryResult.confidence,

      keywords:
        categoryResult.keywords,

      sensitiveTopics:
        detectSensitiveTopics(
          normalizedQuestion
        ),

      normalizedQuestion
    };
  }
}

export const intentEngine = new IntentEngine();

export function analyzeIntent(
  question: string
): IntentAnalysis {
  return intentEngine.analyze(question);
}

export default IntentEngine;