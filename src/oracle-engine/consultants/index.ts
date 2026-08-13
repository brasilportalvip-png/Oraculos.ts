export type ConsultantTone =
  | 'acolhedor'
  | 'direto'
  | 'firme'
  | 'sereno'
  | 'místico'
  | 'analítico'
  | 'popular'
  | 'poético';

export interface ConsultantProfile {
  id: string;
  name: string;
  displayName: string;
  biography: string;
  personality: string;
  tone: string;
  writingStyle: string;
  vocabulary: string[];
  specialties: string[];
  allowedOracles: string[];
  greeting?: string;
  closingStyle?: string;
  active: boolean;
}

export interface ConsultantRegistry {
  [consultantId: string]: ConsultantProfile;
}

const CONSULTANTS: ConsultantRegistry = {};

function normalizarId(valor: string): string {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validarConsultor(
  consultant: ConsultantProfile
): void {
  if (!consultant.id) {
    throw new Error(
      'O identificador do consultor é obrigatório.'
    );
  }

  if (!consultant.name) {
    throw new Error(
      'O nome do consultor é obrigatório.'
    );
  }

  if (!consultant.personality) {
    throw new Error(
      `A personalidade do consultor ${consultant.name} é obrigatória.`
    );
  }

  if (!consultant.tone) {
    throw new Error(
      `O tom de voz do consultor ${consultant.name} é obrigatório.`
    );
  }

  if (!consultant.writingStyle) {
    throw new Error(
      `O estilo de escrita do consultor ${consultant.name} é obrigatório.`
    );
  }
}

export function registrarConsultor(
  consultant: ConsultantProfile
): ConsultantProfile {
  const id = normalizarId(
    consultant.id || consultant.name
  );

  const normalizado: ConsultantProfile = {
    ...consultant,

    id,

    name: String(
      consultant.name || ''
    ).trim(),

    displayName: String(
      consultant.displayName ||
        consultant.name ||
        ''
    ).trim(),

    biography: String(
      consultant.biography || ''
    ).trim(),

    personality: String(
      consultant.personality || ''
    ).trim(),

    tone: String(
      consultant.tone || ''
    ).trim(),

    writingStyle: String(
      consultant.writingStyle || ''
    ).trim(),

    vocabulary: Array.from(
      new Set(
        (consultant.vocabulary || [])
          .map((item) =>
            String(item || '').trim()
          )
          .filter(Boolean)
      )
    ),

    specialties: Array.from(
      new Set(
        (consultant.specialties || [])
          .map((item) =>
            String(item || '').trim()
          )
          .filter(Boolean)
      )
    ),

    allowedOracles: Array.from(
      new Set(
        (consultant.allowedOracles || [])
          .map((item) =>
            String(item || '').trim()
          )
          .filter(Boolean)
      )
    ),

    greeting: consultant.greeting
      ? String(consultant.greeting).trim()
      : undefined,

    closingStyle: consultant.closingStyle
      ? String(
          consultant.closingStyle
        ).trim()
      : undefined,

    active:
      consultant.active !== false
  };

  validarConsultor(normalizado);

  CONSULTANTS[id] = normalizado;

  return normalizado;
}

export function removerConsultor(
  consultantId: string
): boolean {
  const id = normalizarId(consultantId);

  if (!CONSULTANTS[id]) {
    return false;
  }

  delete CONSULTANTS[id];

  return true;
}

export function obterConsultor(
  consultantId: string
): ConsultantProfile {
  const id = normalizarId(consultantId);

  const consultant =
    CONSULTANTS[id];

  if (!consultant) {
    throw new Error(
      `Consultor não encontrado: ${consultantId}`
    );
  }

  if (!consultant.active) {
    throw new Error(
      `O consultor ${consultant.name} está desativado.`
    );
  }

  return consultant;
}

export function consultorExiste(
  consultantId: string
): boolean {
  const id = normalizarId(consultantId);

  return Boolean(CONSULTANTS[id]);
}

export function consultorPodeUsarOraculo(
  consultantId: string,
  oracleId: string
): boolean {
  const consultant =
    obterConsultor(consultantId);

  if (
    !consultant.allowedOracles.length
  ) {
    return true;
  }

  const oracleNormalizado =
    normalizarId(oracleId);

  return consultant.allowedOracles
    .map(normalizarId)
    .includes(oracleNormalizado);
}

export function listarConsultores(
  somenteAtivos = true
): ConsultantProfile[] {
  return Object.values(
    CONSULTANTS
  ).filter(
    (consultant) =>
      !somenteAtivos ||
      consultant.active
  );
}

export function atualizarConsultor(
  consultantId: string,
  updates: Partial<ConsultantProfile>
): ConsultantProfile {
  const atual =
    obterConsultor(consultantId);

  const atualizado: ConsultantProfile = {
    ...atual,
    ...updates,
    id: atual.id
  };

  return registrarConsultor(atualizado);
}

export function criarConsultorPadrao(
  input: Partial<ConsultantProfile> & {
    id: string;
    name: string;
  }
): ConsultantProfile {
  return registrarConsultor({
    id: input.id,

    name: input.name,

    displayName:
      input.displayName ||
      input.name,

    biography:
      input.biography || '',

    personality:
      input.personality ||
      'Consultor equilibrado, atento, humano e responsável.',

    tone:
      input.tone ||
      'acolhedor, claro e firme quando necessário',

    writingStyle:
      input.writingStyle ||
      'natural, profundo, direto e sem linguagem técnica',

    vocabulary:
      input.vocabulary || [],

    specialties:
      input.specialties || [],

    allowedOracles:
      input.allowedOracles || [],

    greeting:
      input.greeting,

    closingStyle:
      input.closingStyle,

    active:
      input.active !== false
  });
}

export {
  CONSULTANTS
};

export default CONSULTANTS;