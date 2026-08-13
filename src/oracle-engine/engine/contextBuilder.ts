import type {
  ConversationHistoryItem,
  OracleCalculationResult,
  OracleConsultant,
  OracleDefinition,
  OracleExecutionInput,
  PromptContext
} from '../oracle.types.js';

import {
  analyzeIntent,
  type IntentAnalysis
} from './intentEngine.js';

import {
  analyzeEmotion,
  type EmotionAnalysis
} from './emotionEngine.js';

export interface ContextBuilderInput {
  user: OracleExecutionInput['user'];

  question: string;

  consultant: OracleConsultant;

  oracle: OracleDefinition;

  history?: ConversationHistoryItem[];

  calculation?: OracleCalculationResult;

  intent?: Partial<IntentAnalysis>;

  emotion?: Partial<EmotionAnalysis>;
}

export class ContextBuilder {
  public build(
    input: ContextBuilderInput
  ): PromptContext {
    this.validate(input);

    const question = String(
      input.question || ''
    ).trim();

    const detectedIntent =
      analyzeIntent(question);

    const detectedEmotion =
      analyzeEmotion(question);

    const calculation =
      input.calculation || {
        data: {},
        summary: ''
      };

    return {
      user: {
        ...input.user,

        fullName: String(
          input.user.fullName || ''
        ).trim(),

        birthDate: String(
          input.user.birthDate || ''
        ).trim(),

        birthTime:
          input.user.birthTime
            ? String(
                input.user.birthTime
              ).trim()
            : undefined,

        city:
          input.user.city
            ? String(
                input.user.city
              ).trim()
            : undefined,

        secondPerson:
          input.user.secondPerson
            ? {
                fullName:
                  input.user.secondPerson
                    .fullName
                    ? String(
                        input.user
                          .secondPerson
                          .fullName
                      ).trim()
                    : undefined,

                birthDate:
                  input.user.secondPerson
                    .birthDate
                    ? String(
                        input.user
                          .secondPerson
                          .birthDate
                      ).trim()
                    : undefined,

                birthTime:
                  input.user.secondPerson
                    .birthTime
                    ? String(
                        input.user
                          .secondPerson
                          .birthTime
                      ).trim()
                    : undefined,

                relationship:
                  input.user.secondPerson
                    .relationship
                    ? String(
                        input.user
                          .secondPerson
                          .relationship
                      ).trim()
                    : undefined
              }
            : undefined
      },

      question: {
        text: question,
        createdAt:
          new Date().toISOString()
      },

      consultant: {
        ...input.consultant,

        id: String(
          input.consultant.id || ''
        ).trim(),

        name: String(
          input.consultant.name || ''
        ).trim(),

        personality: String(
          input.consultant
            .personality || ''
        ).trim(),

        tone: String(
          input.consultant.tone || ''
        ).trim(),

        writingStyle: String(
          input.consultant
            .writingStyle || ''
        ).trim(),

        vocabulary:
          Array.from(
            new Set(
              (
                input.consultant
                  .vocabulary || []
              )
                .map((item) =>
                  String(
                    item || ''
                  ).trim()
                )
                .filter(Boolean)
            )
          )
      },

      oracle: {
        ...input.oracle,

        id: String(
          input.oracle.id || ''
        ).trim(),

        name: String(
          input.oracle.name || ''
        ).trim(),

        description: String(
          input.oracle.description || ''
        ).trim(),

        methodology: String(
          input.oracle.methodology || ''
        ).trim(),

        specialties:
          Array.from(
            new Set(
              (
                input.oracle
                  .specialties || []
              )
                .map((item) =>
                  String(
                    item || ''
                  ).trim()
                )
                .filter(Boolean)
            )
          )
      },

      emotion: {
        emotion:
          input.emotion?.emotion ||
          detectedEmotion.emotion,

        intensity:
          input.emotion?.intensity ||
          detectedEmotion.intensity,

        keywords:
          input.emotion?.keywords ||
          detectedEmotion.keywords
      },

      intent: {
        category:
          input.intent?.category ||
          detectedIntent.category,

        subcategory:
          input.intent?.subcategory ??
          detectedIntent.subcategory,

        needsSecondPerson:
          input.intent
            ?.needsSecondPerson ??
          detectedIntent
            .needsSecondPerson,

        confidence:
          input.intent?.confidence ??
          detectedIntent.confidence
      },

      conversation: {
        history:
          this.normalizeHistory(
            input.history || []
          )
      },

      calculation
    };
  }

  private normalizeHistory(
    history: ConversationHistoryItem[]
  ): ConversationHistoryItem[] {
    return history
      .filter(
        (item) =>
          item &&
          typeof item.text ===
            'string' &&
          item.text.trim()
      )
      .slice(-30)
      .map((item) => ({
        role:
          item.role === 'assistant' ||
          item.role === 'system'
            ? item.role
            : 'user',

        text:
          String(
            item.text || ''
          ).trim(),

        createdAt:
          item.createdAt
      }));
  }

  private validate(
    input: ContextBuilderInput
  ): void {
    if (!input) {
      throw new Error(
        'Os dados da consulta são obrigatórios.'
      );
    }

    if (!input.user) {
      throw new Error(
        'Os dados do consulente são obrigatórios.'
      );
    }

    if (!input.user.fullName) {
      throw new Error(
        'O nome completo do consulente é obrigatório.'
      );
    }

    if (!input.user.birthDate) {
      throw new Error(
        'A data de nascimento do consulente é obrigatória.'
      );
    }

    if (
      !String(
        input.question || ''
      ).trim()
    ) {
      throw new Error(
        'A pergunta da consulta é obrigatória.'
      );
    }

    if (!input.consultant?.id) {
      throw new Error(
        'O consultor é obrigatório.'
      );
    }

    if (!input.oracle?.id) {
      throw new Error(
        'O oráculo é obrigatório.'
      );
    }
  }
}

export const contextBuilder =
  new ContextBuilder();

export function buildPromptContext(
  input: ContextBuilderInput
): PromptContext {
  return contextBuilder.build(input);
}

export default ContextBuilder;