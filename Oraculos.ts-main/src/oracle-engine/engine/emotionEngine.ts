export type EmotionLevel =
  | 'baixa'
  | 'moderada'
  | 'alta'
  | 'muito-alta';

export interface EmotionAnalysis {
  emotion: string;
  intensity: EmotionLevel;
  score: number;
  keywords: string[];
  secondaryEmotions: string[];
  riskFlags: string[];
  normalizedText: string;
}

interface EmotionRule {
  name: string;
  terms: string[];
  weight: number;
}

const EMOTION_RULES: EmotionRule[] = [
  {
    name: 'ansiedade',
    weight: 4,
    terms: [
      'ansiedade',
      'ansioso',
      'ansiosa',
      'aflito',
      'aflita',
      'desespero',
      'desesperado',
      'desesperada',
      'nao consigo parar de pensar',
      'não consigo parar de pensar',
      'estou nervoso',
      'estou nervosa',
      'muito preocupado',
      'muito preocupada'
    ]
  },

  {
    name: 'medo',
    weight: 4,
    terms: [
      'medo',
      'receio',
      'inseguro',
      'insegura',
      'tenho medo',
      'apavorado',
      'apavorada',
      'assustado',
      'assustada'
    ]
  },

  {
    name: 'tristeza',
    weight: 4,
    terms: [
      'triste',
      'tristeza',
      'chorando',
      'chorei',
      'machucado',
      'machucada',
      'sofrendo',
      'dor emocional',
      'coração partido',
      'coracao partido'
    ]
  },

  {
    name: 'saudade',
    weight: 3,
    terms: [
      'saudade',
      'sinto falta',
      'sentindo falta',
      'não paro de lembrar',
      'nao paro de lembrar',
      'queria de volta'
    ]
  },

  {
    name: 'raiva',
    weight: 4,
    terms: [
      'raiva',
      'ódio',
      'odio',
      'irritado',
      'irritada',
      'revoltado',
      'revoltada',
      'furioso',
      'furiosa',
      'não aguento mais',
      'nao aguento mais'
    ]
  },

  {
    name: 'ciúme',
    weight: 3,
    terms: [
      'ciume',
      'ciúme',
      'ciumento',
      'ciumenta',
      'com outra pessoa',
      'com outro',
      'com outra',
      'me trocou'
    ]
  },

  {
    name: 'carência',
    weight: 3,
    terms: [
      'carencia',
      'carência',
      'carente',
      'sozinho',
      'sozinha',
      'ninguém me ama',
      'ninguem me ama',
      'preciso de alguém',
      'preciso de alguem'
    ]
  },

  {
    name: 'dependência emocional',
    weight: 5,
    terms: [
      'não vivo sem',
      'nao vivo sem',
      'dependo dele',
      'dependo dela',
      'preciso dele',
      'preciso dela',
      'não consigo seguir sem',
      'nao consigo seguir sem',
      'minha vida acabou sem'
    ]
  },

  {
    name: 'culpa',
    weight: 3,
    terms: [
      'culpa',
      'me arrependo',
      'arrependido',
      'arrependida',
      'foi minha culpa',
      'estraguei tudo'
    ]
  },

  {
    name: 'frustração',
    weight: 3,
    terms: [
      'frustrado',
      'frustrada',
      'decepcionado',
      'decepcionada',
      'decepção',
      'decepcao',
      'nada dá certo',
      'nada da certo'
    ]
  },

  {
    name: 'confusão',
    weight: 3,
    terms: [
      'confuso',
      'confusa',
      'não sei o que fazer',
      'nao sei o que fazer',
      'perdido',
      'perdida',
      'sem direção',
      'sem direcao',
      'não entendo',
      'nao entendo'
    ]
  },

  {
    name: 'esperança',
    weight: 2,
    terms: [
      'esperança',
      'esperanca',
      'acredito',
      'tenho fé',
      'tenho fe',
      'vai melhorar',
      'pode dar certo'
    ]
  },

  {
    name: 'amor',
    weight: 2,
    terms: [
      'amo',
      'amor',
      'apaixonado',
      'apaixonada',
      'gosto muito',
      'meu coração',
      'meu coracao'
    ]
  },

  {
    name: 'alívio',
    weight: 2,
    terms: [
      'alivio',
      'alívio',
      'mais tranquilo',
      'mais tranquila',
      'em paz',
      'aliviado',
      'aliviada'
    ]
  },

  {
    name: 'determinação',
    weight: 2,
    terms: [
      'determinado',
      'determinada',
      'vou conseguir',
      'não vou desistir',
      'nao vou desistir',
      'estou decidido',
      'estou decidida'
    ]
  }
];

const RISK_PATTERNS: Array<{
  flag: string;
  patterns: RegExp[];
}> = [
  {
    flag: 'desespero-intenso',
    patterns: [
      /\bnão aguento mais\b/i,
      /\bnao aguento mais\b/i,
      /\bestou desesperad[oa]\b/i,
      /\bnão vejo saída\b/i,
      /\bnao vejo saida\b/i
    ]
  },

  {
    flag: 'dependencia-intensa',
    patterns: [
      /\bnão vivo sem\b/i,
      /\bnao vivo sem\b/i,
      /\bminha vida acabou sem\b/i,
      /\bpreciso dessa pessoa para viver\b/i
    ]
  },

  {
    flag: 'agressividade',
    patterns: [
      /\bquero me vingar\b/i,
      /\bquero vingança\b/i,
      /\bquero vinganca\b/i,
      /\bquero destruir\b/i,
      /\bquero machucar\b/i
    ]
  },

  {
    flag: 'possivel-crise',
    patterns: [
      /\bperdi o controle\b/i,
      /\bnão consigo respirar\b/i,
      /\bnao consigo respirar\b/i,
      /\bcrise de ansiedade\b/i,
      /\bataque de pânico\b/i,
      /\bataque de panico\b/i
    ]
  }
];

function normalize(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countOccurrences(
  text: string,
  term: string
): number {
  const normalizedTerm = normalize(term);

  if (!normalizedTerm) {
    return 0;
  }

  let count = 0;
  let position = 0;

  while (true) {
    const index = text.indexOf(
      normalizedTerm,
      position
    );

    if (index < 0) {
      break;
    }

    count += 1;
    position = index + normalizedTerm.length;
  }

  return count;
}

function calculateEmotionScores(
  normalizedText: string
): Array<{
  emotion: string;
  score: number;
  keywords: string[];
}> {
  return EMOTION_RULES.map((rule) => {
    const keywords: string[] = [];
    let score = 0;

    for (const term of rule.terms) {
      const normalizedTerm = normalize(term);

      const occurrences = countOccurrences(
        normalizedText,
        normalizedTerm
      );

      if (occurrences > 0) {
        keywords.push(term);

        score +=
          occurrences *
          rule.weight;
      }
    }

    return {
      emotion: rule.name,
      score,
      keywords
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

function calculateIntensity(
  score: number,
  text: string
): EmotionLevel {
  const emphasis =
    (text.match(/!/g) || []).length +
    (text.match(/\b(muito|demais|extremamente|totalmente)\b/gi) || [])
      .length;

  const adjustedScore =
    score + emphasis;

  if (adjustedScore >= 14) {
    return 'muito-alta';
  }

  if (adjustedScore >= 8) {
    return 'alta';
  }

  if (adjustedScore >= 3) {
    return 'moderada';
  }

  return 'baixa';
}

function detectRiskFlags(
  originalText: string
): string[] {
  const result: string[] = [];

  for (const rule of RISK_PATTERNS) {
    if (
      rule.patterns.some((pattern) =>
        pattern.test(originalText)
      )
    ) {
      result.push(rule.flag);
    }
  }

  return result;
}

function detectPunctuationIntensity(
  text: string
): number {
  const exclamations =
    (text.match(/!/g) || []).length;

  const repeatedQuestions =
    (text.match(/\?{2,}/g) || []).length;

  const uppercaseWords =
    text
      .split(/\s+/)
      .filter(
        (word) =>
          word.length >= 4 &&
          word === word.toUpperCase() &&
          /[A-ZÀ-Ý]/.test(word)
      ).length;

  return (
    exclamations +
    repeatedQuestions * 2 +
    uppercaseWords
  );
}

export class EmotionEngine {
  public analyze(
    text: string
  ): EmotionAnalysis {
    const originalText =
      String(text || '').trim();

    const normalizedText =
      normalize(originalText);

    if (!normalizedText) {
      return {
        emotion: 'neutra',
        intensity: 'baixa',
        score: 0,
        keywords: [],
        secondaryEmotions: [],
        riskFlags: [],
        normalizedText
      };
    }

    const results =
      calculateEmotionScores(
        normalizedText
      );

    if (!results.length) {
      return {
        emotion: 'neutra',
        intensity: 'baixa',
        score: 0,
        keywords: [],
        secondaryEmotions: [],
        riskFlags:
          detectRiskFlags(originalText),
        normalizedText
      };
    }

    const primary = results[0];

    const punctuationScore =
      detectPunctuationIntensity(
        originalText
      );

    const finalScore =
      primary.score +
      punctuationScore;

    return {
      emotion:
        primary.emotion,

      intensity:
        calculateIntensity(
          finalScore,
          originalText
        ),

      score:
        finalScore,

      keywords:
        Array.from(
          new Set(primary.keywords)
        ),

      secondaryEmotions:
        results
          .slice(1, 4)
          .map((item) =>
            item.emotion
          ),

      riskFlags:
        detectRiskFlags(
          originalText
        ),

      normalizedText
    };
  }
}

export const emotionEngine =
  new EmotionEngine();

export function analyzeEmotion(
  text: string
): EmotionAnalysis {
  return emotionEngine.analyze(text);
}

export default EmotionEngine;