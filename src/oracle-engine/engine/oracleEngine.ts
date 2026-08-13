import type {
  OracleCalculationResult,
  OracleResponse,
  PromptContext
} from '../oracle.types.js';

import {
  executarOracleProfile,
  normalizarOracleProfileId
} from '../profiles/index.js';

import PromptBuilder from '../prompts/PromptBuilder.js';

import padronizarResposta from '../normalization/padronizarResposta.js';

interface ResultadoProfile {
  oracle?: string;
  resumoParaOraculo?: string;
  resumoParaMariaPadilha?: string;
  [chave: string]: unknown;
}

export interface OracleEngineDependencies {
  callAI?: (
    prompt: string,
    context: PromptContext
  ) => Promise<string>;

  creditsByOracle?: Partial<
    Record<string, number>
  >;
}

export class OracleEngine {
  private readonly promptBuilder: PromptBuilder;

  private readonly callAI?: (
    prompt: string,
    context: PromptContext
  ) => Promise<string>;

  private readonly creditsByOracle: Partial<
    Record<string, number>
  >;

  constructor(
    dependencies: OracleEngineDependencies = {}
  ) {
    this.promptBuilder = new PromptBuilder();

    this.callAI = dependencies.callAI;

    this.creditsByOracle =
      dependencies.creditsByOracle || {};
  }

  public async execute(
    context: PromptContext
  ): Promise<OracleResponse> {
    this.validateContext(context);

    const calculation =
      await this.calculate(context);

    const promptContext: PromptContext = {
      ...context,
      calculation
    };

    const prompt =
      this.promptBuilder.build(promptContext);

    const aiResponse =
      await this.generateResponse(
        prompt,
        promptContext,
        calculation
      );

    const normalized =
      padronizarResposta(aiResponse);

    const oracleId =
      this.getOracleId(context);

    return {
      text: normalized,
      model: this.callAI
        ? 'gemini'
        : 'oracle-engine-local',

      credits:
        this.creditsByOracle[oracleId] ??
        3,

      metadata: {
        oracle: oracleId,
        consultant:
          context.consultant.id,
        calculation,
        generatedAt:
          new Date().toISOString()
      }
    };
  }

  private async calculate(
    context: PromptContext
  ): Promise<OracleCalculationResult> {
    const oracleId =
      this.getOracleId(context);

    const profileId =
      normalizarOracleProfileId(
        oracleId
      );

    if (!profileId) {
      throw new Error(
        `Oráculo não suportado: ${oracleId}`
      );
    }

    const resultado =
      executarOracleProfile(
        profileId,
        {
          fullName:
            context.user.fullName,

          birthDate:
            context.user.birthDate,

          birthTime:
            context.user.birthTime,

          city:
            this.getUserCity(context),

          question:
            context.question.text
        }
      ) as ResultadoProfile;

    const resumo =
      resultado.resumoParaOraculo ||
      resultado.resumoParaMariaPadilha ||
      '';

    return {
      data: resultado,
      summary: resumo
    };
  }

  private async generateResponse(
    prompt: string,
    context: PromptContext,
    calculation: OracleCalculationResult
  ): Promise<string> {
    if (this.callAI) {
      return this.callAI(
        prompt,
        context
      );
    }

    return this.getCalculationSummary(
      calculation
    );
  }

  private getCalculationSummary(
    calculation: OracleCalculationResult
  ): string {
    if (
      typeof calculation.summary ===
        'string' &&
      calculation.summary.trim()
    ) {
      return calculation.summary;
    }

    const data =
      calculation.data as ResultadoProfile;

    const resumo =
      data?.resumoParaOraculo ||
      data?.resumoParaMariaPadilha;

    if (
      typeof resumo === 'string' &&
      resumo.trim()
    ) {
      return resumo;
    }

    return JSON.stringify(
      calculation.data,
      null,
      2
    );
  }

  private getOracleId(
    context: PromptContext
  ): string {
    const id =
      String(
        context.oracle.id || ''
      ).trim();

    if (!id) {
      throw new Error(
        'O identificador do oráculo é obrigatório.'
      );
    }

    return id;
  }

  private getUserCity(
    context: PromptContext
  ): string | undefined {
    const user =
      context.user as typeof context.user & {
        city?: string;
      };

    return user.city;
  }

  private validateContext(
    context: PromptContext
  ): void {
    if (!context) {
      throw new Error(
        'O contexto da consulta é obrigatório.'
      );
    }

    if (!context.user?.fullName) {
      throw new Error(
        'O nome completo do consulente é obrigatório.'
      );
    }

    if (!context.user?.birthDate) {
      throw new Error(
        'A data de nascimento do consulente é obrigatória.'
      );
    }

    if (!context.question?.text) {
      throw new Error(
        'A pergunta da consulta é obrigatória.'
      );
    }

    if (!context.oracle?.id) {
      throw new Error(
        'O oráculo da consulta é obrigatório.'
      );
    }

    if (!context.consultant?.id) {
      throw new Error(
        'O consultor da consulta é obrigatório.'
      );
    }
  }
}

export default OracleEngine;