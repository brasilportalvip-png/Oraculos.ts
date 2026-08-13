export type SafetySeverity =
  | 'baixo'
  | 'moderado'
  | 'alto'
  | 'crítico';

export interface SafetyFlag {
  code: string;
  category:
    | 'saúde'
    | 'financeiro'
    | 'violência'
    | 'autolesão'
    | 'terceiros'
    | 'espiritual'
    | 'previsão-absoluta'
    | 'privacidade';
  severity: SafetySeverity;
  message: string;
  matchedText?: string;
}

export interface SafetyAnalysis {
  safe: boolean;
  blocked: boolean;
  flags: SafetyFlag[];
  recommendations: string[];
  normalizedText: string;
}

export interface SafetyResponseResult {
  text: string;
  modified: boolean;
  flags: SafetyFlag[];
}

interface SafetyRule {
  code: string;
  category: SafetyFlag['category'];
  severity: SafetySeverity;
  message: string;
  patterns: RegExp[];
  blocked?: boolean;
  recommendation?: string;
}

const SAFETY_RULES: SafetyRule[] = [
  {
    code: 'SELF_HARM_IMMEDIATE',
    category: 'autolesão',
    severity: 'crítico',
    message:
      'A mensagem pode indicar risco imediato de autolesão.',
    blocked: true,
    recommendation:
      'Interromper a leitura oracular e orientar busca imediata de ajuda humana e serviço de emergência.',
    patterns: [
      /\bquero me matar\b/i,
      /\bquero morrer\b/i,
      /\bvou me matar\b/i,
      /\bpretendo me matar\b/i,
      /\bnão quero mais viver\b/i,
      /\bnao quero mais viver\b/i,
      /\bseria melhor morrer\b/i,
      /\bseria melhor eu morrer\b/i
    ]
  },

  {
    code: 'SELF_HARM_IDEATION',
    category: 'autolesão',
    severity: 'alto',
    message:
      'A mensagem pode indicar sofrimento intenso ou ideação de autolesão.',
    recommendation:
      'Não conduzir a resposta apenas como consulta espiritual; priorizar acolhimento e apoio humano.',
    patterns: [
      /\bminha vida não vale nada\b/i,
      /\bminha vida nao vale nada\b/i,
      /\bnão aguento mais viver\b/i,
      /\bnao aguento mais viver\b/i,
      /\bqueria desaparecer\b/i,
      /\bsumir para sempre\b/i
    ]
  },

  {
    code: 'VIOLENCE_THREAT',
    category: 'violência',
    severity: 'crítico',
    message:
      'A mensagem pode indicar intenção de causar dano a outra pessoa.',
    blocked: true,
    recommendation:
      'Não oferecer orientação que facilite violência, perseguição ou vingança.',
    patterns: [
      /\bquero matar\b/i,
      /\bvou matar\b/i,
      /\bquero machucar\b/i,
      /\bquero ferir\b/i,
      /\bquero me vingar\b/i,
      /\bcomo destruir essa pessoa\b/i
    ]
  },

  {
    code: 'MEDICAL_DIAGNOSIS_REQUEST',
    category: 'saúde',
    severity: 'alto',
    message:
      'A pergunta solicita diagnóstico ou confirmação médica por meio do oráculo.',
    recommendation:
      'Tratar apenas de forma simbólica e orientar avaliação profissional.',
    patterns: [
      /\btenho câncer\b/i,
      /\btenho cancer\b/i,
      /\bestou com câncer\b/i,
      /\bestou com cancer\b/i,
      /\bqual doença eu tenho\b/i,
      /\bqual doenca eu tenho\b/i,
      /\bestou grávida\b/i,
      /\bestou gravida\b/i,
      /\btenho alguma doença\b/i,
      /\btenho alguma doenca\b/i,
      /\bvou morrer de\b/i
    ]
  },

  {
    code: 'MEDICAL_TREATMENT_ABANDONMENT',
    category: 'saúde',
    severity: 'crítico',
    message:
      'A mensagem envolve possível abandono de tratamento ou medicamento.',
    recommendation:
      'Não recomendar interrupção de tratamento e orientar contato com profissional de saúde.',
    patterns: [
      /\bdevo parar o remédio\b/i,
      /\bdevo parar o remedio\b/i,
      /\bposso abandonar o tratamento\b/i,
      /\bdevo cancelar a cirurgia\b/i,
      /\bdevo parar a terapia\b/i
    ]
  },

  {
    code: 'FINANCIAL_GUARANTEE',
    category: 'financeiro',
    severity: 'alto',
    message:
      'A pergunta busca garantia de lucro, investimento ou ganho financeiro.',
    recommendation:
      'Não garantir retorno financeiro nem substituir análise profissional.',
    patterns: [
      /\bqual investimento vai dar lucro\b/i,
      /\bonde investir para ganhar\b/i,
      /\bvou ficar rico\b/i,
      /\bganho garantido\b/i,
      /\blucro garantido\b/i,
      /\bdevo apostar\b/i,
      /\bqual número vai ganhar\b/i,
      /\bqual numero vai ganhar\b/i
    ]
  },

  {
    code: 'THIRD_PARTY_CERTAINTY',
    category: 'terceiros',
    severity: 'moderado',
    message:
      'A pergunta busca confirmação absoluta de pensamentos, sentimentos ou ações de outra pessoa.',
    recommendation:
      'Usar linguagem de possibilidade e evitar afirmar estados internos como fatos.',
    patterns: [
      /\bo que ele está pensando\b/i,
      /\bo que ele esta pensando\b/i,
      /\bo que ela está pensando\b/i,
      /\bo que ela esta pensando\b/i,
      /\bele me trai\b/i,
      /\bela me trai\b/i,
      /\bele está com outra\b/i,
      /\bele esta com outra\b/i,
      /\bela está com outro\b/i,
      /\bela esta com outro\b/i
    ]
  },

  {
    code: 'SPIRITUAL_ATTACK_CERTAINTY',
    category: 'espiritual',
    severity: 'alto',
    message:
      'A pergunta busca confirmação de ataque, demanda, maldição ou perseguição espiritual.',
    recommendation:
      'Não confirmar influência espiritual como fato; tratar como interpretação simbólica.',
    patterns: [
      /\bfizeram demanda para mim\b/i,
      /\bfizeram trabalho contra mim\b/i,
      /\bestou amaldiçoado\b/i,
      /\bestou amaldicoado\b/i,
      /\btem encosto em mim\b/i,
      /\btem espírito me perseguindo\b/i,
      /\btem espirito me perseguindo\b/i,
      /\bestão fazendo macumba para mim\b/i,
      /\bestao fazendo macumba para mim\b/i
    ]
  },

  {
    code: 'ABSOLUTE_FUTURE',
    category: 'previsão-absoluta',
    severity: 'moderado',
    message:
      'A pergunta solicita previsão absoluta de acontecimento futuro.',
    recommendation:
      'Apresentar tendências, possibilidades e fatores condicionais.',
    patterns: [
      /\bcom certeza vai\b/i,
      /\bquando exatamente\b/i,
      /\bqual dia vai acontecer\b/i,
      /\bgarante que\b/i,
      /\bvai acontecer mesmo\b/i,
      /\btenho certeza que\b/i
    ]
  },

  {
    code: 'PRIVATE_DATA_REQUEST',
    category: 'privacidade',
    severity: 'alto',
    message:
      'A mensagem pode solicitar dados privados ou confidenciais de terceiros.',
    recommendation:
      'Não inventar, revelar ou inferir dados pessoais privados.',
    patterns: [
      /\bqual a senha dele\b/i,
      /\bqual a senha dela\b/i,
      /\bonde ele está agora\b/i,
      /\bonde ele esta agora\b/i,
      /\bonde ela está agora\b/i,
      /\bonde ela esta agora\b/i,
      /\bqual o endereço dele\b/i,
      /\bqual o endereco dele\b/i,
      /\bqual o endereço dela\b/i,
      /\bqual o endereco dela\b/i
    ]
  }
];

const ABSOLUTE_RESPONSE_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string;
}> = [
  {
    pattern: /\bcom certeza absoluta\b/gi,
    replacement: 'com forte indicação simbólica'
  },
  {
    pattern: /\bcertamente acontecerá\b/gi,
    replacement: 'há possibilidade de acontecer'
  },
  {
    pattern: /\bvai acontecer\b/gi,
    replacement: 'pode acontecer'
  },
  {
    pattern: /\bele vai voltar\b/gi,
    replacement:
      'existe uma possibilidade de reaproximação'
  },
  {
    pattern: /\bela vai voltar\b/gi,
    replacement:
      'existe uma possibilidade de reaproximação'
  },
  {
    pattern: /\bele te ama\b/gi,
    replacement:
      'a leitura sugere envolvimento emocional'
  },
  {
    pattern: /\bela te ama\b/gi,
    replacement:
      'a leitura sugere envolvimento emocional'
  },
  {
    pattern: /\bele está te traindo\b/gi,
    replacement:
      'a leitura aponta insegurança ou falta de clareza na relação'
  },
  {
    pattern: /\bela está te traindo\b/gi,
    replacement:
      'a leitura aponta insegurança ou falta de clareza na relação'
  },
  {
    pattern: /\bvocê está doente\b/gi,
    replacement:
      'a leitura sugere atenção ao bem-estar'
  },
  {
    pattern: /\bvocê será curado\b/gi,
    replacement:
      'a leitura simboliza esperança e necessidade de cuidados adequados'
  },
  {
    pattern: /\bvocê ficará rico\b/gi,
    replacement:
      'há sinais simbólicos de oportunidade e crescimento material'
  },
  {
    pattern: /\bfizeram trabalho contra você\b/gi,
    replacement:
      'você pode estar percebendo desgaste, insegurança ou conflito ao redor'
  },
  {
    pattern: /\bhá uma entidade te perseguindo\b/gi,
    replacement:
      'há uma sensação simbólica de medo, pressão ou vulnerabilidade'
  }
];

function normalizar(texto: string): string {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function encontrarTrecho(
  texto: string,
  pattern: RegExp
): string | undefined {
  const match = texto.match(pattern);

  return match?.[0];
}

export class SafetyEngine {
  public analyze(
    text: string
  ): SafetyAnalysis {
    const originalText =
      String(text || '').trim();

    const normalizedText =
      normalizar(originalText);

    if (!normalizedText) {
      return {
        safe: true,
        blocked: false,
        flags: [],
        recommendations: [],
        normalizedText
      };
    }

    const flags: SafetyFlag[] = [];
    const recommendations: string[] = [];
    let blocked = false;

    for (const rule of SAFETY_RULES) {
      for (const pattern of rule.patterns) {
        if (!pattern.test(originalText)) {
          continue;
        }

        flags.push({
          code: rule.code,
          category: rule.category,
          severity: rule.severity,
          message: rule.message,
          matchedText:
            encontrarTrecho(
              originalText,
              pattern
            )
        });

        if (
          rule.recommendation &&
          !recommendations.includes(
            rule.recommendation
          )
        ) {
          recommendations.push(
            rule.recommendation
          );
        }

        if (rule.blocked) {
          blocked = true;
        }

        break;
      }
    }

    return {
      safe:
        flags.length === 0,
      blocked,
      flags,
      recommendations,
      normalizedText
    };
  }

  public sanitizeResponse(
    text: string,
    inputAnalysis?: SafetyAnalysis
  ): SafetyResponseResult {
    let result =
      String(text || '').trim();

    let modified = false;

    for (
      const {
        pattern,
        replacement
      } of ABSOLUTE_RESPONSE_PATTERNS
    ) {
      const replaced =
        result.replace(
          pattern,
          replacement
        );

      if (replaced !== result) {
        modified = true;
        result = replaced;
      }
    }

    if (
      inputAnalysis?.flags.some(
        (flag) =>
          flag.category === 'saúde'
      )
    ) {
      const disclaimer =
        'Esta leitura é simbólica e não substitui avaliação, diagnóstico, tratamento ou acompanhamento profissional.';

      if (
        !result
          .toLowerCase()
          .includes(
            'não substitui'
          )
      ) {
        result =
          `${result}\n\n${disclaimer}`.trim();

        modified = true;
      }
    }

    if (
      inputAnalysis?.flags.some(
        (flag) =>
          flag.category ===
          'financeiro'
      )
    ) {
      const disclaimer =
        'Considere esta orientação apenas como reflexão simbólica; decisões financeiras devem ser baseadas em análise concreta e responsável.';

      if (
        !result
          .toLowerCase()
          .includes(
            'decisões financeiras'
          )
      ) {
        result =
          `${result}\n\n${disclaimer}`.trim();

        modified = true;
      }
    }

    if (
      inputAnalysis?.flags.some(
        (flag) =>
          flag.category ===
          'espiritual'
      )
    ) {
      result = result
        .replace(
          /\bataque espiritual\b/gi,
          'sensação de pressão ou vulnerabilidade'
        )
        .replace(
          /\bdemanda espiritual\b/gi,
          'conflito ou desgaste simbólico'
        )
        .replace(
          /\bmaldição\b/gi,
          'padrão de medo ou bloqueio'
        );

      modified = true;
    }

    return {
      text: result.trim(),
      modified,
      flags:
        inputAnalysis?.flags || []
    };
  }

  public assertAllowed(
    text: string
  ): void {
    const analysis =
      this.analyze(text);

    if (!analysis.blocked) {
      return;
    }

    const message =
      analysis.flags
        .filter(
          (flag) =>
            flag.severity ===
            'crítico'
        )
        .map(
          (flag) =>
            flag.message
        )
        .join(' | ');

    throw new Error(
      message ||
        'A consulta não pode ser processada com segurança.'
    );
  }

  public buildSafetyInstruction(
    analysis: SafetyAnalysis
  ): string {
    if (!analysis.flags.length) {
      return '';
    }

    const lines = analysis.flags.map(
      (flag) =>
        `- ${flag.category}: ${flag.message}`
    );

    return `
REGRAS DE SEGURANÇA ESPECÍFICAS DESTA CONSULTA

${lines.join('\n')}

A resposta deve seguir estas orientações:

${analysis.recommendations
  .map(
    (recommendation) =>
      `- ${recommendation}`
  )
  .join('\n')}

Nunca transforme interpretação simbólica em diagnóstico,
prova, certeza absoluta ou instrução perigosa.
`.trim();
  }
}

export const safetyEngine =
  new SafetyEngine();

export function analyzeSafety(
  text: string
): SafetyAnalysis {
  return safetyEngine.analyze(text);
}

export function sanitizeOracleResponse(
  text: string,
  inputAnalysis?: SafetyAnalysis
): SafetyResponseResult {
  return safetyEngine.sanitizeResponse(
    text,
    inputAnalysis
  );
}

export default SafetyEngine;