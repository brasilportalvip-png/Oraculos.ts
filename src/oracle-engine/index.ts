export {
  ORACLE_PROFILES,
  executarOracleProfile,
  listarOracleProfiles,
  normalizarOracleProfileId,
  obterOracleProfile,
  profileExiste,
  buildTarotSupremo,
  buildBaralhoCiganoSupremo,
  buildAstrologiaSuprema,
  buildNumerologiaSuprema,
  buildBuziosSupremo,
  buildOduSupremo,
  buildIfaSupremo,
  buildRunasSupremas,
  buildIChingSupremo,
  buildCristaisSupremos,
  buildMesaRadionicaSuprema
} from './profiles/index.js';

export type {
  OracleProfileId,
  OracleProfileInput,
  OracleProfileDefinition
} from './profiles/index.js';

export {
  OracleEngine,
  OracleEngineDefault,
  IntentEngine,
  intentEngine,
  analyzeIntent,
  EmotionEngine,
  emotionEngine,
  analyzeEmotion,
  ContextBuilder,
  contextBuilder,
  buildPromptContext,
  ValidationEngine,
  validationEngine,
  validateConsultation,
  assertConsultation,
  SafetyEngine,
  safetyEngine,
  analyzeSafety,
  sanitizeOracleResponse,
  ResponseQualityEngine,
  responseQualityEngine,
  analyzeResponseQuality,
  assertResponseQuality,
  ErrorEngine,
  errorEngine,
  normalizeOracleError,
  createOracleError
} from './engine/index.js';

export type {
  OracleEngineDependencies,
  IntentAnalysis,
  IntentCategory,
  EmotionAnalysis,
  EmotionLevel,
  ContextBuilderInput,
  ValidationIssue,
  ValidationResult,
  ConsultationValidationInput,
  SafetySeverity,
  SafetyFlag,
  SafetyAnalysis,
  SafetyResponseResult,
  ResponseQualityIssue,
  ResponseQualityAnalysis,
  ResponseQualityOptions,
  OracleErrorCode,
  OracleErrorMetadata,
  NormalizedOracleError,
  ErrorEngineInput
} from './engine/index.js';

export {
  default as PromptBuilder
} from './prompts/PromptBuilder.js';

export {
  padronizarResposta,
  dividirRespostaNaturalmente,
  criarSequenciaDeDigitacao
} from './normalization/index.js';

export {
  CONSULTANTS,
  registrarConsultor,
  removerConsultor,
  obterConsultor,
  consultorExiste,
  consultorPodeUsarOraculo,
  listarConsultores,
  atualizarConsultor,
  criarConsultorPadrao
} from './consultants/index.js';

export type {
  ConsultantProfile,
  ConsultantRegistry,
  ConsultantTone
} from './consultants/index.js';

export {
  createDefaultEmotion,
  createDefaultIntent,
  createPromptContext
} from './oracle.types.js';

export type {
  ConversationRole,
  ConversationHistoryItem,
  OracleUser,
  OracleQuestion,
  OracleConsultant,
  OracleDefinition,
  OracleEmotion,
  OracleIntent,
  OracleConversation,
  OracleCalculationResult,
  PromptContext,
  OracleResponseMetadata,
  OracleResponse,
  OracleExecutionInput,
  OracleEngineError
} from './oracle.types.js';