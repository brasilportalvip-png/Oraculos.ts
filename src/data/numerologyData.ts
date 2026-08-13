import { NumerologyResult } from '../types/oracle';

// Letter to Number mapping (Pythagorean System)
const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô', 'ã', 'õ']);

function reduceToSingleDigitOrMaster(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    if (num === 11 || num === 22 || num === 33) return num;
  }
  return num;
}

export function calculateNumerology(fullName: string, birthDate: string): NumerologyResult {
  const cleanName = (fullName || 'Consulente Sagrado')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  // 1. Expression Number (All letters in name)
  let sumExpression = 0;
  for (const char of cleanName) {
    if (PYTHAGOREAN_MAP[char]) {
      sumExpression += PYTHAGOREAN_MAP[char];
    }
  }
  const expressionNumber = reduceToSingleDigitOrMaster(sumExpression);

  // 2. Soul Urge Number (Vowels)
  let sumSoul = 0;
  let sumPersonality = 0;
  for (const char of cleanName) {
    const val = PYTHAGOREAN_MAP[char] || 0;
    if (VOWELS.has(char)) {
      sumSoul += val;
    } else {
      sumPersonality += val;
    }
  }
  const soulUrgeNumber = reduceToSingleDigitOrMaster(sumSoul);
  const personalityNumber = reduceToSingleDigitOrMaster(sumPersonality);

  // 3. Life Path Number (Birth Date digits)
  const digitsOnly = (birthDate || '2000-01-01').replace(/[^0-9]/g, '');
  let sumLifePath = digitsOnly
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const lifePathNumber = reduceToSingleDigitOrMaster(sumLifePath);

  const isMaster = lifePathNumber === 11 || lifePathNumber === 22 || lifePathNumber === 33 ||
                   expressionNumber === 11 || expressionNumber === 22 || expressionNumber === 33;

  return {
    fullName: fullName || 'Consulente',
    birthDate: birthDate || '2000-01-01',
    lifePathNumber,
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    isMasterNumber: isMaster,
    interpretation: getNumerologyInterpretation(lifePathNumber, expressionNumber, soulUrgeNumber)
  };
}

function getNumerologyInterpretation(lifePath: number, expr: number, soul: number) {
  const lifePathTexts: Record<number, string> = {
    1: 'Caminho de Vida 1 — O Líder Inovador. Sua jornada exige coragem, independência, originalidade e capacidade de abrir novos caminhos autônomos.',
    2: 'Caminho de Vida 2 — O Pacificador Diplomata. Sua missão envolve cooperação, sensibilidade, diplomacia e a arte de unir opostos.',
    3: 'Caminho de Vida 3 — O Comunicador Criativo. Você veio para expressar alegria, inspiração artística, otimismo e entusiasmo.',
    4: 'Caminho de Vida 4 — O Construtor Meticuloso. Sua jornada foca em edificar estruturas sólidas, disciplina, trabalho honesto e segurança.',
    5: 'Caminho de Vida 5 — O Agente da Liberdade. Sua essência busca aventura, versatilidade, viagens, transformação e quebra de dogmas.',
    6: 'Caminho de Vida 6 — O Cuidador Amoroso. Sua missão é servir à família, cultivar o amor incondicional, a beleza e a responsabilidade comunitária.',
    7: 'Caminho de Vida 7 — O Buscador da Verdade. Sua vocação é a sabedoria interior, a pesquisa, a filosofia, a espiritualidade e o mistério.',
    8: 'Caminho de Vida 8 — O Mestre da Abundância. Seu caminho envolve conquista material, justiça, autoridade ética, empreendedorismo e poder de manifestação.',
    9: 'Caminho de Vida 9 — O Humanitário Universal. Você veio para praticar a compaixão global, a sabedoria espiritual e o amor incondicional sem fronteiras.',
    11: 'Caminho de Vida 11 (Mestre) — O Mensageiro Iluminado. Vibração elevada de intuição psíquica, visão espiritual e inspiração para a humanidade.',
    22: 'Caminho de Vida 22 (Mestre) — O Grande Arquiteto. Capacidade extraordinária de transformar sonhos grandiosos em realidade física tangível.',
    33: 'Caminho de Vida 33 (Mestre) — O Mestre do Amor Universal. O mais elevado grau de cura espiritual, sacrifício altruísta e compaixão radiante.'
  };

  return {
    lifePath: lifePathTexts[lifePath] || 'Vibração numerológica única e multifacetada.',
    expression: `Seu Número de Expressão (${expr}) revela a forma natural como seus talentos e potencialidades se revelam no mundo externo.`,
    soulUrge: `Seu Desejo da Alma (${soul}) indica o que verdadeiramente nutre o seu coração e os anseios mais íntimos do seu espírito.`
  };
}
