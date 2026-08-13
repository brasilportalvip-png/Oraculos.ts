import type {
  OracleResponse
} from '../oracle.types.js';

import {
  criarSequenciaDeDigitacao,
  dividirRespostaNaturalmente,
  padronizarResposta
} from '../normalization/index.js';

export interface ConversationPart {
  index: number;
  status: string;
  text: string;
  delay: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface NaturalConversationOptions {
  parts?: number;
  minimumDelay?: number;
  maximumDelay?: number;
  charactersPerSecond?: number;
  preserveMarkdown?: boolean;
  maximumLength?: number;
}

export interface NaturalConversationResult {
  fullText: string;
  parts: ConversationPart[];
  totalParts: number;
  estimatedDuration: number;
}

const DEFAULT_OPTIONS: Required<NaturalConversationOptions> = {
  parts: 3,
  minimumDelay: 700,
  maximumDelay: 4200,
  charactersPerSecond: 24,
  preserveMarkdown: false,
  maximumLength: 7000
};

export class NaturalConversationEngine {
  public prepare(
    text: string,
    options: NaturalConversationOptions = {}
  ): NaturalConversationResult {
    const config = this.normalizeOptions(options);

    const fullText = padronizarResposta(
      text,
      {
        maxLength: config.maximumLength,
        preserveMarkdown: config.preserveMarkdown
      }
    );

    if (!fullText) {
      return {
        fullText: '',
        parts: [],
        totalParts: 0,
        estimatedDuration: 0
      };
    }

    const dividedParts =
      dividirRespostaNaturalmente(
        fullText,
        config.parts
      );

    const parts = dividedParts.map(
      (part, index): ConversationPart => {
        const delay = this.calculateDelay(
          part,
          config
        );

        return {
          index,
          status: this.getTypingStatus(index),
          text: part,
          delay,
          isFirst: index === 0,
          isLast:
            index === dividedParts.length - 1
        };
      }
    );

    return {
      fullText,
      parts,
      totalParts: parts.length,
      estimatedDuration: parts.reduce(
        (total, part) =>
          total + part.delay,
        0
      )
    };
  }

  public prepareFromOracleResponse(
    response: OracleResponse,
    options: NaturalConversationOptions = {}
  ): NaturalConversationResult {
    return this.prepare(
      response.text,
      options
    );
  }

  public createTypingSequence(
    text: string,
    options: NaturalConversationOptions = {}
  ) {
    const config =
      this.normalizeOptions(options);

    return criarSequenciaDeDigitacao(
      text,
      {
        partes: config.parts,
        baseDelay: config.minimumDelay
      }
    );
  }

  public async stream(
    text: string,
    handlers: {
      onTyping?: (
        status: string,
        part: ConversationPart
      ) => void | Promise<void>;

      onPart?: (
        part: ConversationPart
      ) => void | Promise<void>;

      onComplete?: (
        result: NaturalConversationResult
      ) => void | Promise<void>;
    },
    options: NaturalConversationOptions = {}
  ): Promise<NaturalConversationResult> {
    const result =
      this.prepare(text, options);

    for (const part of result.parts) {
      if (handlers.onTyping) {
        await handlers.onTyping(
          part.status,
          part
        );
      }

      await this.wait(part.delay);

      if (handlers.onPart) {
        await handlers.onPart(part);
      }
    }

    if (handlers.onComplete) {
      await handlers.onComplete(result);
    }

    return result;
  }

  private normalizeOptions(
    options: NaturalConversationOptions
  ): Required<NaturalConversationOptions> {
    const parts = Math.max(
      1,
      Math.min(
        Number(options.parts) ||
          DEFAULT_OPTIONS.parts,
        5
      )
    );

    const minimumDelay = Math.max(
      300,
      Number(options.minimumDelay) ||
        DEFAULT_OPTIONS.minimumDelay
    );

    const maximumDelay = Math.max(
      minimumDelay,
      Number(options.maximumDelay) ||
        DEFAULT_OPTIONS.maximumDelay
    );

    const charactersPerSecond = Math.max(
      5,
      Number(options.charactersPerSecond) ||
        DEFAULT_OPTIONS.charactersPerSecond
    );

    const maximumLength = Math.max(
      500,
      Number(options.maximumLength) ||
        DEFAULT_OPTIONS.maximumLength
    );

    return {
      parts,
      minimumDelay,
      maximumDelay,
      charactersPerSecond,
      preserveMarkdown:
        options.preserveMarkdown === true,
      maximumLength
    };
  }

  private calculateDelay(
    text: string,
    options: Required<NaturalConversationOptions>
  ): number {
    const readingDelay =
      (text.length /
        options.charactersPerSecond) *
      1000;

    const naturalDelay =
      options.minimumDelay +
      readingDelay * 0.22;

    return Math.round(
      Math.min(
        options.maximumDelay,
        Math.max(
          options.minimumDelay,
          naturalDelay
        )
      )
    );
  }

  private getTypingStatus(
    index: number
  ): string {
    const statuses = [
      'Digitando.',
      'Digitando..',
      'Digitando...'
    ];

    return statuses[
      index % statuses.length
    ];
  }

  private wait(
    milliseconds: number
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}

export const naturalConversationEngine =
  new NaturalConversationEngine();

export function prepareNaturalConversation(
  text: string,
  options: NaturalConversationOptions = {}
): NaturalConversationResult {
  return naturalConversationEngine.prepare(
    text,
    options
  );
}

export default NaturalConversationEngine;