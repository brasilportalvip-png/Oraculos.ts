import type {
  ConversationHistoryItem,
  OracleConsultant,
  OracleUser
} from '../oracle.types.js';

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ConsultationValidationInput {
  user?: Partial<OracleUser>;
  question?: string;
  consultant?: Partial<OracleConsultant>;
  oracleId?: string;
  history?: ConversationHistoryItem[];
}

const VALID_ORACLES = new Set([
  'tarot',
  'baralho-cigano',
  'astrologia',
  'numerologia',
  'buzios',
  'ifa',
  'runas',
  'i-ching',
  'cristais',
  'mesa-radionica'
]);

function normalizarTexto(valor: unknown): string {
  return String(valor || '').trim();
}

function normalizarId(valor: unknown): string {
  return normalizarTexto(valor)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-');
}

function validarDataNascimento(
  valor: string
): boolean {
  const data = normalizarTexto(valor);

  if (!data) {
    return false;
  }

  const formatoBrasileiro =
    /^(\d{2})\/(\d{2})\/(\d{4})$/;

  const formatoIso =
    /^(\d{4})-(\d{2})-(\d{2})$/;

  let dia: number;
  let mes: number;
  let ano: number;

  const brasileiro =
    data.match(formatoBrasileiro);

  const iso =
    data.match(formatoIso);

  if (brasileiro) {
    dia = Number(brasileiro[1]);
    mes = Number(brasileiro[2]);
    ano = Number(brasileiro[3]);
  } else if (iso) {
    ano = Number(iso[1]);
    mes = Number(iso[2]);
    dia = Number(iso[3]);
  } else {
    return false;
  }

  const dataCriada =
    new Date(ano, mes - 1, dia);

  return (
    dataCriada.getFullYear() === ano &&
    dataCriada.getMonth() === mes - 1 &&
    dataCriada.getDate() === dia
  );
}

function validarHorario(
  valor?: string
): boolean {
  if (!valor) {
    return true;
  }

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    valor.trim()
  );
}

function validarHistorico(
  history: ConversationHistoryItem[]
): ValidationIssue[] {
  const errors: ValidationIssue[] = [];

  history.forEach((item, index) => {
    if (!item) {
      errors.push({
        field: `history[${index}]`,
        code: 'INVALID_HISTORY_ITEM',
        message:
          'O item do histórico é inválido.'
      });

      return;
    }

    if (
      !['user', 'assistant', 'system'].includes(
        item.role
      )
    ) {
      errors.push({
        field: `history[${index}].role`,
        code: 'INVALID_HISTORY_ROLE',
        message:
          'O papel da mensagem deve ser user, assistant ou system.'
      });
    }

    if (!normalizarTexto(item.text)) {
      errors.push({
        field: `history[${index}].text`,
        code: 'EMPTY_HISTORY_TEXT',
        message:
          'A mensagem do histórico não pode estar vazia.'
      });
    }
  });

  return errors;
}

export class ValidationEngine {
  public validateConsultation(
    input: ConsultationValidationInput
  ): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    if (!input) {
      return {
        valid: false,
        errors: [
          {
            field: 'input',
            code: 'MISSING_INPUT',
            message:
              'Os dados da consulta são obrigatórios.'
          }
        ],
        warnings: []
      };
    }

    const fullName =
      normalizarTexto(
        input.user?.fullName
      );

    const birthDate =
      normalizarTexto(
        input.user?.birthDate
      );

    const birthTime =
      normalizarTexto(
        input.user?.birthTime
      );

    const question =
      normalizarTexto(
        input.question
      );

    const consultantId =
      normalizarTexto(
        input.consultant?.id
      );

    const consultantName =
      normalizarTexto(
        input.consultant?.name
      );

    const oracleId =
      normalizarId(
        input.oracleId
      );

    if (!input.user) {
      errors.push({
        field: 'user',
        code: 'MISSING_USER',
        message:
          'Os dados do consulente são obrigatórios.'
      });
    }

    if (!fullName) {
      errors.push({
        field: 'user.fullName',
        code: 'MISSING_FULL_NAME',
        message:
          'O nome completo é obrigatório.'
      });
    } else if (fullName.length < 3) {
      errors.push({
        field: 'user.fullName',
        code: 'INVALID_FULL_NAME',
        message:
          'O nome completo informado é muito curto.'
      });
    }

    if (!birthDate) {
      errors.push({
        field: 'user.birthDate',
        code: 'MISSING_BIRTH_DATE',
        message:
          'A data de nascimento é obrigatória.'
      });
    } else if (
      !validarDataNascimento(
        birthDate
      )
    ) {
      errors.push({
        field: 'user.birthDate',
        code: 'INVALID_BIRTH_DATE',
        message:
          'A data de nascimento deve estar no formato DD/MM/AAAA ou AAAA-MM-DD.'
      });
    }

    if (
      birthTime &&
      !validarHorario(birthTime)
    ) {
      errors.push({
        field: 'user.birthTime',
        code: 'INVALID_BIRTH_TIME',
        message:
          'O horário de nascimento deve estar no formato HH:MM.'
      });
    }

    if (!question) {
      errors.push({
        field: 'question',
        code: 'MISSING_QUESTION',
        message:
          'A pergunta é obrigatória.'
      });
    } else {
      if (question.length < 5) {
        errors.push({
          field: 'question',
          code: 'QUESTION_TOO_SHORT',
          message:
            'A pergunta é muito curta.'
        });
      }

      if (question.length > 4000) {
        errors.push({
          field: 'question',
          code: 'QUESTION_TOO_LONG',
          message:
            'A pergunta ultrapassa o limite permitido.'
        });
      }

      if (question.length > 1500) {
        warnings.push({
          field: 'question',
          code: 'LONG_QUESTION',
          message:
            'A pergunta está muito longa e pode reduzir a objetividade da consulta.'
        });
      }
    }

    if (!input.consultant) {
      errors.push({
        field: 'consultant',
        code: 'MISSING_CONSULTANT',
        message:
          'O consultor é obrigatório.'
      });
    }

    if (!consultantId) {
      errors.push({
        field: 'consultant.id',
        code: 'MISSING_CONSULTANT_ID',
        message:
          'O identificador do consultor é obrigatório.'
      });
    }

    if (!consultantName) {
      errors.push({
        field: 'consultant.name',
        code: 'MISSING_CONSULTANT_NAME',
        message:
          'O nome do consultor é obrigatório.'
      });
    }

    if (!oracleId) {
      errors.push({
        field: 'oracleId',
        code: 'MISSING_ORACLE',
        message:
          'O oráculo é obrigatório.'
      });
    } else if (
      !VALID_ORACLES.has(oracleId)
    ) {
      errors.push({
        field: 'oracleId',
        code: 'INVALID_ORACLE',
        message:
          `Oráculo não suportado: ${oracleId}.`
      });
    }

    if (
      input.history &&
      !Array.isArray(input.history)
    ) {
      errors.push({
        field: 'history',
        code: 'INVALID_HISTORY',
        message:
          'O histórico deve ser uma lista.'
      });
    }

    if (
      Array.isArray(input.history)
    ) {
      errors.push(
        ...validarHistorico(
          input.history
        )
      );

      if (
        input.history.length > 100
      ) {
        warnings.push({
          field: 'history',
          code: 'LONG_HISTORY',
          message:
            'O histórico possui muitas mensagens e será reduzido pelo motor de contexto.'
        });
      }
    }

    const secondPerson =
      input.user?.secondPerson;

    if (secondPerson) {
      const secondName =
        normalizarTexto(
          secondPerson.fullName
        );

      const secondBirthDate =
        normalizarTexto(
          secondPerson.birthDate
        );

      if (
        secondName &&
        secondName.length < 2
      ) {
        warnings.push({
          field:
            'user.secondPerson.fullName',
          code:
            'SHORT_SECOND_PERSON_NAME',
          message:
            'O nome da segunda pessoa parece incompleto.'
        });
      }

      if (
        secondBirthDate &&
        !validarDataNascimento(
          secondBirthDate
        )
      ) {
        errors.push({
          field:
            'user.secondPerson.birthDate',
          code:
            'INVALID_SECOND_PERSON_BIRTH_DATE',
          message:
            'A data de nascimento da segunda pessoa é inválida.'
        });
      }

      if (
        secondPerson.birthTime &&
        !validarHorario(
          secondPerson.birthTime
        )
      ) {
        errors.push({
          field:
            'user.secondPerson.birthTime',
          code:
            'INVALID_SECOND_PERSON_BIRTH_TIME',
          message:
            'O horário da segunda pessoa deve estar no formato HH:MM.'
        });
      }
    }

    return {
      valid:
        errors.length === 0,
      errors,
      warnings
    };
  }

  public assertConsultation(
    input: ConsultationValidationInput
  ): void {
    const result =
      this.validateConsultation(
        input
      );

    if (result.valid) {
      return;
    }

    const message =
      result.errors
        .map(
          (error) =>
            `${error.field}: ${error.message}`
        )
        .join(' | ');

    throw new Error(message);
  }

  public isValidOracle(
    oracleId: string
  ): boolean {
    return VALID_ORACLES.has(
      normalizarId(oracleId)
    );
  }

  public listValidOracles(): string[] {
    return Array.from(
      VALID_ORACLES
    );
  }
}

export const validationEngine =
  new ValidationEngine();

export function validateConsultation(
  input: ConsultationValidationInput
): ValidationResult {
  return validationEngine
    .validateConsultation(input);
}

export function assertConsultation(
  input: ConsultationValidationInput
): void {
  validationEngine
    .assertConsultation(input);
}

export default ValidationEngine;