export type ConversationRole =
  | 'user'
  | 'assistant'
  | 'system';

export interface ConversationHistoryItem {
  role: ConversationRole;
  text: string;
  createdAt?: string;
}

export interface OracleUser {
  id?: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  city?: string;
  email?: string;

  secondPerson?: {
    fullName?: string;
    birthDate?: string;
    birthTime?: string;
    relationship?: string;
  };
}

export interface OracleQuestion {
  text: string;
  createdAt?: string;
}

export interface OracleConsultant {
  id: string;
  name: string;
  personality: string;
  tone: string;
  writingStyle: string;
  vocabulary: string[];
  biography?: string;
  specialties?: string[];
}

export interface OracleDefinition {
  id: string;
  name: string;
  description: string;
  methodology: string;
  specialties: string[];
}

export interface OracleEmotion {
  emotion: string;
  intensity:
    | 'baixa'
    | 'moderada'
    | 'alta'
    | 'muito-alta'
    | string;
  keywords: string[];
}

export interface OracleIntent {
  category: string;
  subcategory?: string;
  needsSecondPerson: boolean;
  confidence?: number;
}

export interface OracleConversation {
  id?: string;
  history: ConversationHistoryItem[];
}

export interface OracleCalculationResult {
  data: unknown;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export interface PromptContext {
  user: OracleUser;
  question: OracleQuestion;
  consultant: OracleConsultant;
  oracle: OracleDefinition;
  emotion: OracleEmotion;
  intent: OracleIntent;
  conversation: OracleConversation;
  calculation: OracleCalculationResult;
}

export interface OracleResponseMetadata {
  oracle: string;
  consultant: string;
  calculation?: OracleCalculationResult;
  generatedAt?: string;
  [key: string]: unknown;
}

export interface OracleResponse {
  text: string;
  model: string;
  credits: number;
  metadata: OracleResponseMetadata;
}

export interface OracleExecutionInput {
  user: OracleUser;
  question: string;
  consultant: OracleConsultant;
  oracle: OracleDefinition;
  emotion?: Partial<OracleEmotion>;
  intent?: Partial<OracleIntent>;
  history?: ConversationHistoryItem[];
}

export interface OracleEngineError {
  code:
    | 'INVALID_CONTEXT'
    | 'INVALID_ORACLE'
    | 'CALCULATION_ERROR'
    | 'PROMPT_ERROR'
    | 'AI_ERROR'
    | 'NORMALIZATION_ERROR'
    | 'UNKNOWN_ERROR';

  message: string;
  details?: unknown;
}

export function createDefaultEmotion(): OracleEmotion {
  return {
    emotion: 'neutra',
    intensity: 'moderada',
    keywords: []
  };
}

export function createDefaultIntent(): OracleIntent {
  return {
    category: 'geral',
    subcategory: undefined,
    needsSecondPerson: false,
    confidence: 0
  };
}

export function createPromptContext(
  input: OracleExecutionInput,
  calculation: OracleCalculationResult
): PromptContext {
  return {
    user: input.user,

    question: {
      text: String(input.question || '').trim(),
      createdAt: new Date().toISOString()
    },

    consultant: input.consultant,

    oracle: input.oracle,

    emotion: {
      ...createDefaultEmotion(),
      ...input.emotion,
      keywords:
        input.emotion?.keywords || []
    },

    intent: {
      ...createDefaultIntent(),
      ...input.intent
    },

    conversation: {
      history: input.history || []
    },

    calculation
  };
}