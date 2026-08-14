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
  requiredFields: (keyof OracleProfileInput)[];
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
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
    requiredFields: ['fullName', 'birthDate'],
    builder: (input) =>
      buildMesaRadionicaSuprema({
        fullName: input.fullName,
        birthDate: input.birthDate,
        question: input.question
      })
  }
};

export interface OracleValidationResult {
  valid: boolean;
  normalizedOracleId: OracleProfileId | null;
  missingFields: string[];
  message?: string;
}

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Nome completo (fullName)',
  birthDate: 'Data de nascimento (birthDate)',
  birthTime: 'Hora de nascimento (birthTime)',
  city: 'Cidade de nascimento (city)',
  question: 'Pergunta da consulta (question)',
};

export function validarEntradaOraculo(
  oracleType: unknown,
  input: {
    fullName?: string;
    birthFullName?: string;
    name?: string;
    birthDate?: string;
    birthTime?: string;
    city?: string;
    question?: string;
  }
): OracleValidationResult {
  if (!oracleType || typeof oracleType !== 'string' || !oracleType.trim()) {
    return {
      valid: false,
      normalizedOracleId: null,
      missingFields: [],
      message: 'O tipo do oráculo é obrigatório.'
    };
  }

  const normalizedOracleId = normalizarOracleProfileId(oracleType);
  if (!normalizedOracleId) {
    return {
      valid: false,
      normalizedOracleId: null,
      missingFields: [],
      message: `Oráculo '${oracleType}' não é suportado ou é inválido.`
    };
  }

  const profile = ORACLE_PROFILES[normalizedOracleId];
  const requiredFields = profile?.requiredFields || ['fullName', 'birthDate'];
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (field === 'fullName') {
      const fullName = String(
        input.fullName || input.birthFullName || input.name || ''
      ).trim();
      if (!fullName) missingFields.push('fullName');
    } else if (field === 'birthDate') {
      const birthDate = String(input.birthDate || '').trim();
      if (!birthDate) missingFields.push('birthDate');
    } else if (field === 'birthTime') {
      const birthTime = String(input.birthTime || '').trim();
      if (!birthTime) missingFields.push('birthTime');
    } else if (field === 'city') {
      const city = String(input.city || '').trim();
      if (!city) missingFields.push('city');
    } else if (field === 'question') {
      const question = String(input.question || '').trim();
      if (!question) missingFields.push('question');
    }
  }

  if (missingFields.length > 0) {
    const fieldDescriptions = missingFields.map((f) => FIELD_LABELS[f] || f);

    return {
      valid: false,
      normalizedOracleId,
      missingFields,
      message: `Dados obrigatórios ausentes para o oráculo '${normalizedOracleId}': ${fieldDescriptions.join(', ')}.`
    };
  }

  return {
    valid: true,
    normalizedOracleId,
    missingFields: []
  };
}

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