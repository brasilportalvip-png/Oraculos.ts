export type OracleErrorCode =
  | 'INVALID_CONTEXT'
  | 'INVALID_ORACLE'
  | 'INVALID_CONSULTANT'
  | 'VALIDATION_ERROR'
  | 'CALCULATION_ERROR'
  | 'PROMPT_ERROR'
  | 'AI_ERROR'
  | 'AI_TIMEOUT'
  | 'AI_EMPTY_RESPONSE'
  | 'NORMALIZATION_ERROR'
  | 'QUALITY_ERROR'
  | 'SAFETY_ERROR'
  | 'INSUFFICIENT_CREDITS'
  | 'UNKNOWN_ERROR';

export interface OracleErrorMetadata {
  oracleId?: string;
  consultantId?: string;
  userId?: string;
  requestId?: string;
  stage?: string;
  timestamp: string;
  originalError?: unknown;
  [key: string]: unknown;
}

export interface NormalizedOracleError {
  code: OracleErrorCode;
  message: string;
  statusCode: number;
  recoverable: boolean;
  userMessage: string;
  details?: unknown;
  metadata: OracleErrorMetadata;
}

export interface ErrorEngineInput {
  error: unknown;
  code?: OracleErrorCode;
  message?: string;
  userMessage?: string;
  statusCode?: number;
  recoverable?: boolean;
  metadata?: Partial<OracleErrorMetadata>;
}

const DEFAULT_MESSAGES: Record<
  OracleErrorCode,
  {
    internal: string;
    user: string;
    statusCode: number;
    recoverable: boolean;
  }
> = {
  INVALID_CONTEXT: {
    internal:
      'O contexto da consulta é inválido.',
    user:
      'Não foi possível preparar os dados da consulta.',
    statusCode: 400,
    recoverable: true
  },

  INVALID_ORACLE: {
    internal:
      'O oráculo informado é inválido.',
    user:
      'O oráculo selecionado não está disponível.',
    statusCode: 400,
    recoverable: true
  },

  INVALID_CONSULTANT: {
    internal:
      'O consultor informado é inválido.',
    user:
      'O consultor selecionado não está disponível.',
    statusCode: 400,
    recoverable: true
  },

  VALIDATION_ERROR: {
    internal:
      'Os dados da consulta não passaram pela validação.',
    user:
      'Confira os dados informados antes de continuar.',
    statusCode: 400,
    recoverable: true
  },

  CALCULATION_ERROR: {
    internal:
      'O motor do oráculo falhou durante o cálculo.',
    user:
      'Não foi possível concluir a leitura deste oráculo.',
    statusCode: 500,
    recoverable: true
  },

  PROMPT_ERROR: {
    internal:
      'Falha ao construir o prompt da consulta.',
    user:
      'Não foi possível preparar a interpretação.',
    statusCode: 500,
    recoverable: true
  },

  AI_ERROR: {
    internal:
      'Falha na comunicação com o modelo de IA.',
    user:
      'A resposta não pôde ser concluída neste momento.',
    statusCode: 502,
    recoverable: true
  },

  AI_TIMEOUT: {
    internal:
      'O modelo de IA ultrapassou o tempo limite.',
    user:
      'A resposta demorou mais que o esperado e foi interrompida.',
    statusCode: 504,
    recoverable: true
  },

  AI_EMPTY_RESPONSE: {
    internal:
      'O modelo de IA retornou uma resposta vazia.',
    user:
      'A resposta não foi gerada corretamente.',
    statusCode: 502,
    recoverable: true
  },

  NORMALIZATION_ERROR: {
    internal:
      'Falha durante a padronização da resposta.',
    user:
      'A resposta foi gerada, mas não pôde ser preparada corretamente.',
    statusCode: 500,
    recoverable: true
  },

  QUALITY_ERROR: {
    internal:
      'A resposta não atingiu a qualidade mínima.',
    user:
      'A resposta precisou ser interrompida porque não atingiu a qualidade esperada.',
    statusCode: 422,
    recoverable: true
  },

  SAFETY_ERROR: {
    internal:
      'A consulta foi bloqueada pelas regras de segurança.',
    user:
      'Esta pergunta não pode ser respondida como uma consulta oracular.',
    statusCode: 422,
    recoverable: false
  },

  INSUFFICIENT_CREDITS: {
    internal:
      'O usuário não possui créditos suficientes.',
    user:
      'Seu saldo não é suficiente para realizar esta consulta.',
    statusCode: 402,
    recoverable: true
  },

  UNKNOWN_ERROR: {
    internal:
      'Erro desconhecido no Oracle Engine.',
    user:
      'Ocorreu um erro inesperado durante a consulta.',
    statusCode: 500,
    recoverable: true
  }
};

function mensagemDoErro(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'string'
  ) {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error
  ) {
    return String(
      (error as { message?: unknown })
        .message || ''
    );
  }

  return '';
}

function detectarCodigo(
  error: unknown
): OracleErrorCode {
  const message =
    mensagemDoErro(error)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  if (
    message.includes('credito') ||
    message.includes('saldo insuficiente')
  ) {
    return 'INSUFFICIENT_CREDITS';
  }

  if (
    message.includes('timeout') ||
    message.includes('tempo limite')
  ) {
    return 'AI_TIMEOUT';
  }

  if (
    message.includes('resposta vazia')
  ) {
    return 'AI_EMPTY_RESPONSE';
  }

  if (
    message.includes('oraculo invalido') ||
    message.includes('oraculo nao suportado')
  ) {
    return 'INVALID_ORACLE';
  }

  if (
    message.includes('consultor') &&
    (
      message.includes('invalido') ||
      message.includes('nao encontrado')
    )
  ) {
    return 'INVALID_CONSULTANT';
  }

  if (
    message.includes('seguranca') ||
    message.includes('bloqueada')
  ) {
    return 'SAFETY_ERROR';
  }

  if (
    message.includes('qualidade')
  ) {
    return 'QUALITY_ERROR';
  }

  if (
    message.includes('validacao') ||
    message.includes('obrigatorio') ||
    message.includes('invalido')
  ) {
    return 'VALIDATION_ERROR';
  }

  if (
    message.includes('prompt')
  ) {
    return 'PROMPT_ERROR';
  }

  if (
    message.includes('gemini') ||
    message.includes('modelo') ||
    message.includes('api')
  ) {
    return 'AI_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

function serializarErro(
  error: unknown
): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return error;
}

export class ErrorEngine {
  public normalize(
    input: ErrorEngineInput
  ): NormalizedOracleError {
    const code =
      input.code ||
      detectarCodigo(input.error);

    const defaults =
      DEFAULT_MESSAGES[code];

    const originalMessage =
      mensagemDoErro(input.error);

    return {
      code,

      message:
        input.message ||
        originalMessage ||
        defaults.internal,

      userMessage:
        input.userMessage ||
        defaults.user,

      statusCode:
        input.statusCode ||
        defaults.statusCode,

      recoverable:
        input.recoverable ??
        defaults.recoverable,

      details:
        serializarErro(input.error),

      metadata: {
        timestamp:
          new Date().toISOString(),

        originalError:
          serializarErro(
            input.error
          ),

        ...input.metadata
      }
    };
  }

  public create(
    code: OracleErrorCode,
    options: Omit<
      ErrorEngineInput,
      'error' | 'code'
    > & {
      error?: unknown;
    } = {}
  ): NormalizedOracleError {
    return this.normalize({
      ...options,
      error:
        options.error ||
        new Error(
          options.message ||
          DEFAULT_MESSAGES[code]
            .internal
        ),
      code
    });
  }

  public throw(
    code: OracleErrorCode,
    options: Omit<
      ErrorEngineInput,
      'error' | 'code'
    > & {
      error?: unknown;
    } = {}
  ): never {
    const normalized =
      this.create(
        code,
        options
      );

    const error =
      new Error(
        normalized.message
      ) as Error & {
        oracleError:
          NormalizedOracleError;
      };

    error.name =
      'OracleEngineError';

    error.oracleError =
      normalized;

    throw error;
  }

  public extract(
    error: unknown
  ): NormalizedOracleError {
    if (
      error &&
      typeof error === 'object' &&
      'oracleError' in error
    ) {
      return (
        error as {
          oracleError:
            NormalizedOracleError;
        }
      ).oracleError;
    }

    return this.normalize({
      error
    });
  }

  public isRecoverable(
    error: unknown
  ): boolean {
    return this.extract(error)
      .recoverable;
  }

  public getUserMessage(
    error: unknown
  ): string {
    return this.extract(error)
      .userMessage;
  }

  public toHttpResponse(
    error: unknown
  ): {
    statusCode: number;
    body: {
      success: false;
      error: {
        code: OracleErrorCode;
        message: string;
        recoverable: boolean;
        requestId?: string;
      };
    };
  } {
    const normalized =
      this.extract(error);

    return {
      statusCode:
        normalized.statusCode,

      body: {
        success: false,

        error: {
          code:
            normalized.code,

          message:
            normalized.userMessage,

          recoverable:
            normalized.recoverable,

          requestId:
            normalized.metadata
              .requestId
        }
      }
    };
  }

  public async executeSafely<T>(
    operation: () => Promise<T>,
    options: Omit<
      ErrorEngineInput,
      'error'
    > = {}
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.normalize({
        ...options,
        error
      });
    }
  }
}

export const errorEngine =
  new ErrorEngine();

export function normalizeOracleError(
  input: ErrorEngineInput
): NormalizedOracleError {
  return errorEngine.normalize(input);
}

export function createOracleError(
  code: OracleErrorCode,
  options: Omit<
    ErrorEngineInput,
    'error' | 'code'
  > & {
    error?: unknown;
  } = {}
): NormalizedOracleError {
  return errorEngine.create(
    code,
    options
  );
}

export default ErrorEngine;