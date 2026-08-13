export interface ResponseQualityIssue {
  code:
    | 'EMPTY_RESPONSE'
    | 'VERY_SHORT'
    | 'VERY_LONG'
    | 'TECHNICAL_LANGUAGE'
    | 'REPETITION'
    | 'GENERIC_OPENING'
    | 'GENERIC_CLOSING'
    | 'ABSOLUTE_PROMISE'
    | 'CONTRADICTION'
    | 'MISSING_ORIENTATION';

  severity:
    | 'baixo'
    | 'moderado'
    | 'alto';

  message: string;
}

export interface ResponseQualityAnalysis {
  approved: boolean;
  score: number;
  issues: ResponseQualityIssue[];
  metrics: {
    characters: number;
    words: number;
    paragraphs: number;
    repeatedParagraphs: number;
    hasOrientation: boolean;
    hasTechnicalLanguage: boolean;
    hasAbsolutePromise: boolean;
  };
}

export interface ResponseQualityOptions {
  minimumCharacters?: number;
  maximumCharacters?: number;
  minimumScore?: number;
}

const TECHNICAL_PATTERNS = [
  /\balgoritmo\b/i,
  /\bprompt\b/i,
  /\bmodelo de linguagem\b/i,
  /\binteligência artificial\b/i,
  /\binteligencia artificial\b/i,
  /\bgemini\b/i,
  /\bbanco de dados\b/i,
  /\bjson\b/i,
  /\btypescript\b/i,
  /\bjavascript\b/i,
  /\bsistema calculou\b/i,
  /\bfoi selecionado automaticamente\b/i
];

const GENERIC_OPENINGS = [
  /^claro[,.!:\s-]*/i,
  /^certamente[,.!:\s-]*/i,
  /^com certeza[,.!:\s-]*/i,
  /^vamos analisar[,.!:\s-]*/i,
  /^vamos explorar[,.!:\s-]*/i,
  /^com base nas informações fornecidas[,.!:\s-]*/i,
  /^com base nos dados apresentados[,.!:\s-]*/i
];

const GENERIC_CLOSINGS = [
  /se quiser, posso.*$/i,
  /caso queira, posso.*$/i,
  /estou à disposição.*$/i,
  /espero ter ajudado.*$/i,
  /posso aprofundar.*$/i,
  /posso fazer outra leitura.*$/i
];

const ABSOLUTE_PATTERNS = [
  /\bcom certeza absoluta\b/i,
  /\bvai acontecer\b/i,
  /\bele vai voltar\b/i,
  /\bela vai voltar\b/i,
  /\bele te ama\b/i,
  /\bela te ama\b/i,
  /\bele está te traindo\b/i,
  /\bela está te traindo\b/i,
  /\bvocê ficará rico\b/i,
  /\bvocê será curado\b/i,
  /\bgarantido\b/i,
  /\bsem nenhuma dúvida\b/i,
  /\bsem sombra de dúvida\b/i
];

const ORIENTATION_PATTERNS = [
  /\bconselho\b/i,
  /\borientação\b/i,
  /\borientacao\b/i,
  /\bo melhor caminho\b/i,
  /\bprocure\b/i,
  /\bobserve\b/i,
  /\bevitar\b/i,
  /\bevitar que\b/i,
  /\bpriorize\b/i,
  /\bfortaleça\b/i,
  /\bfortaleca\b/i,
  /\bconsidere\b/i,
  /\brecomendo\b/i,
  /\bminha orientação\b/i,
  /\bminha orientacao\b/i
];

function normalizar(texto: string): string {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contarPalavras(texto: string): number {
  const normalizado = normalizar(texto);

  if (!normalizado) {
    return 0;
  }

  return normalizado.split(' ').length;
}

function extrairParagrafos(texto: string): string[] {
  return String(texto || '')
    .split(/\n{2,}/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean);
}

function contarParagrafosRepetidos(
  paragrafos: string[]
): number {
  const encontrados = new Set<string>();
  let repetidos = 0;

  for (const paragrafo of paragrafos) {
    const normalizado = normalizar(paragrafo);

    if (!normalizado) {
      continue;
    }

    if (encontrados.has(normalizado)) {
      repetidos += 1;
      continue;
    }

    encontrados.add(normalizado);
  }

  return repetidos;
}

function possuiPadrao(
  texto: string,
  padroes: RegExp[]
): boolean {
  return padroes.some((padrao) =>
    padrao.test(texto)
  );
}

function adicionarIssue(
  issues: ResponseQualityIssue[],
  issue: ResponseQualityIssue
): void {
  const existe = issues.some(
    (item) => item.code === issue.code
  );

  if (!existe) {
    issues.push(issue);
  }
}

function calcularPenalidade(
  severity: ResponseQualityIssue['severity']
): number {
  switch (severity) {
    case 'alto':
      return 22;

    case 'moderado':
      return 12;

    default:
      return 5;
  }
}

export class ResponseQualityEngine {
  public analyze(
    text: string,
    options: ResponseQualityOptions = {}
  ): ResponseQualityAnalysis {
    const response = String(text || '').trim();

    const minimumCharacters = Math.max(
      80,
      Number(options.minimumCharacters) || 250
    );

    const maximumCharacters = Math.max(
      minimumCharacters,
      Number(options.maximumCharacters) || 7000
    );

    const minimumScore = Math.max(
      0,
      Math.min(
        100,
        Number(options.minimumScore) || 65
      )
    );

    const issues: ResponseQualityIssue[] = [];

    const paragraphs =
      extrairParagrafos(response);

    const repeatedParagraphs =
      contarParagrafosRepetidos(paragraphs);

    const hasTechnicalLanguage =
      possuiPadrao(
        response,
        TECHNICAL_PATTERNS
      );

    const hasAbsolutePromise =
      possuiPadrao(
        response,
        ABSOLUTE_PATTERNS
      );

    const hasOrientation =
      possuiPadrao(
        response,
        ORIENTATION_PATTERNS
      );

    if (!response) {
      adicionarIssue(issues, {
        code: 'EMPTY_RESPONSE',
        severity: 'alto',
        message:
          'A resposta está vazia.'
      });
    }

    if (
      response &&
      response.length < minimumCharacters
    ) {
      adicionarIssue(issues, {
        code: 'VERY_SHORT',
        severity: 'moderado',
        message:
          'A resposta está curta demais para uma consulta completa.'
      });
    }

    if (
      response.length > maximumCharacters
    ) {
      adicionarIssue(issues, {
        code: 'VERY_LONG',
        severity: 'moderado',
        message:
          'A resposta ultrapassa o tamanho recomendado.'
      });
    }

    if (hasTechnicalLanguage) {
      adicionarIssue(issues, {
        code: 'TECHNICAL_LANGUAGE',
        severity: 'alto',
        message:
          'A resposta contém linguagem técnica ou referências ao sistema interno.'
      });
    }

    if (repeatedParagraphs > 0) {
      adicionarIssue(issues, {
        code: 'REPETITION',
        severity: 'moderado',
        message:
          'A resposta possui parágrafos repetidos.'
      });
    }

    if (
      possuiPadrao(
        response,
        GENERIC_OPENINGS
      )
    ) {
      adicionarIssue(issues, {
        code: 'GENERIC_OPENING',
        severity: 'baixo',
        message:
          'A resposta começa de forma genérica ou robótica.'
      });
    }

    if (
      possuiPadrao(
        response,
        GENERIC_CLOSINGS
      )
    ) {
      adicionarIssue(issues, {
        code: 'GENERIC_CLOSING',
        severity: 'baixo',
        message:
          'A resposta termina com uma oferta genérica.'
      });
    }

    if (hasAbsolutePromise) {
      adicionarIssue(issues, {
        code: 'ABSOLUTE_PROMISE',
        severity: 'alto',
        message:
          'A resposta contém promessa ou previsão absoluta.'
      });
    }

    if (
      response &&
      !hasOrientation
    ) {
      adicionarIssue(issues, {
        code: 'MISSING_ORIENTATION',
        severity: 'moderado',
        message:
          'A resposta não apresenta orientação prática clara.'
      });
    }

    let score = 100;

    for (const issue of issues) {
      score -= calcularPenalidade(
        issue.severity
      );
    }

    score = Math.max(
      0,
      Math.min(100, score)
    );

    return {
      approved:
        score >= minimumScore &&
        !issues.some(
          (issue) =>
            issue.severity === 'alto'
        ),

      score,

      issues,

      metrics: {
        characters:
          response.length,

        words:
          contarPalavras(response),

        paragraphs:
          paragraphs.length,

        repeatedParagraphs,

        hasOrientation,

        hasTechnicalLanguage,

        hasAbsolutePromise
      }
    };
  }

  public assertApproved(
    text: string,
    options: ResponseQualityOptions = {}
  ): void {
    const analysis =
      this.analyze(
        text,
        options
      );

    if (analysis.approved) {
      return;
    }

    const message =
      analysis.issues
        .map(
          (issue) =>
            `${issue.code}: ${issue.message}`
        )
        .join(' | ');

    throw new Error(
      message ||
        'A resposta não atingiu a qualidade mínima.'
    );
  }

  public buildCorrectionInstruction(
    analysis: ResponseQualityAnalysis
  ): string {
    if (analysis.approved) {
      return '';
    }

    const instructions: string[] = [];

    for (const issue of analysis.issues) {
      switch (issue.code) {
        case 'VERY_SHORT':
          instructions.push(
            'Aprofunde a interpretação sem repetir ideias.'
          );
          break;

        case 'VERY_LONG':
          instructions.push(
            'Reduza a resposta e preserve apenas os pontos realmente importantes.'
          );
          break;

        case 'TECHNICAL_LANGUAGE':
          instructions.push(
            'Remova qualquer menção ao sistema, algoritmo, prompt, inteligência artificial ou cálculo interno.'
          );
          break;

        case 'REPETITION':
          instructions.push(
            'Remova parágrafos e ideias repetidas.'
          );
          break;

        case 'GENERIC_OPENING':
          instructions.push(
            'Comece respondendo diretamente à pergunta.'
          );
          break;

        case 'GENERIC_CLOSING':
          instructions.push(
            'Termine com uma orientação natural, sem oferecer outra consulta.'
          );
          break;

        case 'ABSOLUTE_PROMISE':
          instructions.push(
            'Substitua certezas por tendências, possibilidades e condições.'
          );
          break;

        case 'MISSING_ORIENTATION':
          instructions.push(
            'Inclua uma orientação prática e coerente com a leitura.'
          );
          break;

        case 'EMPTY_RESPONSE':
          instructions.push(
            'Produza uma resposta completa para a consulta.'
          );
          break;
      }
    }

    return `
CORREÇÕES OBRIGATÓRIAS DA RESPOSTA

${Array.from(
  new Set(instructions)
)
  .map(
    (instruction) =>
      `- ${instruction}`
  )
  .join('\n')}

Reescreva preservando o conteúdo oracular válido e a personalidade do consultor.
`.trim();
  }
}

export const responseQualityEngine =
  new ResponseQualityEngine();

export function analyzeResponseQuality(
  text: string,
  options: ResponseQualityOptions = {}
): ResponseQualityAnalysis {
  return responseQualityEngine.analyze(
    text,
    options
  );
}

export function assertResponseQuality(
  text: string,
  options: ResponseQualityOptions = {}
): void {
  responseQualityEngine.assertApproved(
    text,
    options
  );
}

export default ResponseQualityEngine;