import buildTarotSupremo from './tarot.js';
import buildBaralhoCiganoSupremo from './baralho-cigano.js';
import buildAstrologiaSuprema from './astrologia.js';
import buildNumerologiaSuprema from './numerologia.js';
import buildBuziosSupremo from './buzios.js';
import buildOduSupremo from './ifa.js';
import buildRunasSupremas from './runas.js';
import buildIChingSupremo from './i-ching.js';
import buildCristaisSupremos from './cristais.js';
import buildMesaRadionicaSuprema from './mesa-radionica.js';

export type OracleProfileId =
  | 'tarot'
  | 'baralho-cigano'
  | 'astrologia'
  | 'numerologia'
  | 'buzios'
  | 'ifa'
  | 'runas'
  | 'i-ching'
  | 'cristais'
  | 'mesa-radionica';

export interface OracleProfileInput {
  fullName: string;
  birthDate: string;
  birthTime?: string;
  city?: string;
  question?: string;
}

export interface OracleProfileDefinition {
  id: OracleProfileId;
  nome: string;
  descricao: string;
  builder: (
    input: OracleProfileInput
  ) => unknown;
}

export const ORACLE_PROFILES: Record<
  OracleProfileId,
  OracleProfileDefinition
> = {
  tarot: {
    id: 'tarot',
    nome: 'Tarot',
    descricao:
      'Leitura simbólica completa com passado, presente, tendência, obstáculos, conselho e energia oculta.',
    builder: (input) =>
      buildTarotSupremo({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  },

  'baralho-cigano': {
    id: 'baralho-cigano',
    nome: 'Baralho Cigano',
    descricao:
      'Mandala dos Sete Caminhos com as 36 cartas do Lenormand.',
    builder: (input) =>
      buildBaralhoCiganoSupremo({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  },

  astrologia: {
    id: 'astrologia',
    nome: 'Astrologia',
    descricao:
      'Análise simbólica do signo solar, elementos, ciclos e forças planetárias.',
    builder: (input) =>
      buildAstrologiaSuprema({
        fullName: input.fullName,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        city: input.city,
        question: input.question
      })
  },

  numerologia: {
    id: 'numerologia',
    nome: 'Numerologia',
    descricao:
      'Mapa numerológico com caminho de vida, expressão, alma, personalidade, ciclos, desafios e potenciais.',
    builder: (input) =>
      buildNumerologiaSuprema({
        fullName: input.fullName,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        question: input.question
      })
  },

  buzios: {
    id: 'buzios',
    nome: 'Búzios',
    descricao:
      'Leitura simbólica com queda principal, complementar e alerta espiritual.',
    builder: (input) =>
      buildBuziosSupremo({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  },

  ifa: {
    id: 'ifa',
    nome: 'Ifá',
    descricao:
      'Leitura dos Odùs com força principal, influência complementar e sombra.',
    builder: (input) =>
      buildOduSupremo({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  },

  runas: {
    id: 'runas',
    nome: 'Runas',
    descricao:
      'Círculo das Sete Runas com o Futhark Antigo, posições normais e invertidas.',
    builder: (input) =>
      buildRunasSupremas({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  },

  'i-ching': {
    id: 'i-ching',
    nome: 'I Ching',
    descricao:
      'Leitura dos 64 hexagramas, seis linhas, mutações e hexagrama transformado.',
    builder: (input) =>
      buildIChingSupremo({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  },

  cristais: {
    id: 'cristais',
    nome: 'Cristais',
    descricao:
      'Mandala simbólica dos campos emocional, mental, material e espiritual.',
    builder: (input) =>
      buildCristaisSupremos({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  },

  'mesa-radionica': {
    id: 'mesa-radionica',
    nome: 'Mesa Radiônica',
    descricao:
      'Mapa simbólico dos sete campos com indicadores, prioridades e direcionamento.',
    builder: (input) =>
      buildMesaRadionicaSuprema({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  }
};

export function normalizarOracleProfileId(
  valor: string
): OracleProfileId | null {
  const id = String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[_\s]+/g, '-');

  const aliases: Record<string, OracleProfileId> = {
    tarot: 'tarot',

    'baralho-cigano': 'baralho-cigano',
    baralhocigano: 'baralho-cigano',
    cigano: 'baralho-cigano',
    lenormand: 'baralho-cigano',

    astrologia: 'astrologia',
    astrologico: 'astrologia',

    numerologia: 'numerologia',
    numerologico: 'numerologia',

    buzios: 'buzios',
    buzio: 'buzios',

    ifa: 'ifa',
    odu: 'ifa',
    odus: 'ifa',

    runas: 'runas',
    runa: 'runas',

    'i-ching': 'i-ching',
    iching: 'i-ching',
    'i ching': 'i-ching',

    cristais: 'cristais',
    cristal: 'cristais',

    'mesa-radionica': 'mesa-radionica',
    mesaradionica: 'mesa-radionica',
    mesa: 'mesa-radionica'
  };

  return aliases[id] || null;
}

export function profileExiste(
  oracleId: string
): boolean {
  const normalizado =
    normalizarOracleProfileId(oracleId);

  return Boolean(
    normalizado &&
      ORACLE_PROFILES[normalizado]
  );
}

export function obterOracleProfile(
  oracleId: string
): OracleProfileDefinition {
  const normalizado =
    normalizarOracleProfileId(oracleId);

  if (!normalizado) {
    throw new Error(
      `Oráculo inválido: ${oracleId}`
    );
  }

  const profile =
    ORACLE_PROFILES[normalizado];

  if (!profile) {
    throw new Error(
      `Perfil do oráculo não encontrado: ${normalizado}`
    );
  }

  return profile;
}

export function executarOracleProfile(
  oracleId: string,
  input: OracleProfileInput
): unknown {
  const profile =
    obterOracleProfile(oracleId);

  const entradaNormalizada: OracleProfileInput = {
    fullName: String(
      input.fullName || ''
    ).trim(),

    birthDate: String(
      input.birthDate || ''
    ).trim(),

    birthTime: String(
      input.birthTime || ''
    ).trim(),

    city: String(
      input.city || ''
    ).trim(),

    question: String(
      input.question || ''
    ).trim()
  };

  if (!entradaNormalizada.fullName) {
    throw new Error(
      'O nome completo é obrigatório.'
    );
  }

  if (!entradaNormalizada.birthDate) {
    throw new Error(
      'A data de nascimento é obrigatória.'
    );
  }

  return profile.builder(
    entradaNormalizada
  );
}

export function listarOracleProfiles(): Array<{
  id: OracleProfileId;
  nome: string;
  descricao: string;
}> {
  return Object.values(
    ORACLE_PROFILES
  ).map((profile) => ({
    id: profile.id,
    nome: profile.nome,
    descricao: profile.descricao
  }));
}

export {
  buildTarotSupremo,
  buildBaralhoCiganoSupremo,
  buildAstrologiaSuprema,
  buildNumerologiaSuprema,
  buildBuziosSupremo,
  buildOduSupremo,
  buildRunasSupremas,
  buildIChingSupremo,
  buildCristaisSupremos,
  buildMesaRadionicaSuprema
};

export const buildIfaSupremo =
  buildOduSupremo;

export default ORACLE_PROFILES;