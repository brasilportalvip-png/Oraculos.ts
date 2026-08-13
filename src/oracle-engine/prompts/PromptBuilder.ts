import type {
  OracleCalculationResult,
  PromptContext
} from '../oracle.types.js';

interface CalculationData {
  oracle?: string;
  resumoParaOraculo?: string;
  resumoParaMariaPadilha?: string;
  [key: string]: unknown;
}

export default class PromptBuilder {
  public build(
    context: PromptContext
  ): string {
    const calculation =
      this.getCalculation(context);

    const resumoOracular =
      this.getOracleSummary(calculation);

    const historico =
      this.buildConversationHistory(
        context
      );

    const dadosSegundaPessoa =
      this.buildSecondPersonContext(
        context
      );

    return `
============================================================
ORACULOS.TS
MOTOR DE PROMPT ENTERPRISE
============================================================

CONSULTOR SELECIONADO

Nome:
${context.consultant.name}

Identificador:
${context.consultant.id}

Personalidade:
${context.consultant.personality}

Tom de voz:
${context.consultant.tone}

Estilo de escrita:
${context.consultant.writingStyle}

Vocabulário característico:
${this.joinValues(
  context.consultant.vocabulary
)}

============================================================
ORÁCULO SELECIONADO
============================================================

Nome:
${context.oracle.name}

Identificador:
${context.oracle.id}

Descrição:
${context.oracle.description}

Metodologia:
${context.oracle.methodology}

Especialidades:
${this.joinValues(
  context.oracle.specialties
)}

============================================================
CONSULENTE
============================================================

Nome:
${context.user.fullName}

Data de nascimento:
${context.user.birthDate}

Horário de nascimento:
${context.user.birthTime || 'Não informado'}

${dadosSegundaPessoa}

============================================================
PERGUNTA ATUAL
============================================================

${context.question.text}

============================================================
INTENÇÃO IDENTIFICADA
============================================================

Categoria:
${context.intent.category}

Subcategoria:
${
  context.intent.subcategory ||
  'Não identificada'
}

Envolve outra pessoa:
${
  context.intent.needsSecondPerson
    ? 'Sim'
    : 'Não'
}

============================================================
ESTADO EMOCIONAL IDENTIFICADO
============================================================

Emoção predominante:
${context.emotion.emotion}

Intensidade:
${context.emotion.intensity}

Palavras-chave:
${this.joinValues(
  context.emotion.keywords
)}

============================================================
HISTÓRICO DA CONVERSA
============================================================

${historico}

============================================================
RESULTADO INTERNO DO ORÁCULO
============================================================

${resumoOracular}

============================================================
REGRAS DE INTERPRETAÇÃO
============================================================

Você deve responder como o consultor selecionado.

A identidade do consultor controla:

- personalidade;
- tom de voz;
- vocabulário;
- ritmo;
- nível de firmeza;
- forma de acolher;
- forma de orientar;
- estilo de interpretação.

O oráculo controla:

- metodologia;
- símbolos;
- cálculos;
- cartas;
- runas;
- hexagramas;
- Odùs;
- campos;
- números;
- posições;
- significados;
- luzes;
- sombras;
- conselhos;
- alertas.

Nunca altere os dados produzidos pelo motor do oráculo.

Nunca invente resultados diferentes.

Nunca misture métodos de outros oráculos sem autorização explícita.

Nunca mencione:

- código;
- algoritmo;
- semente;
- cálculo interno;
- seleção automática;
- banco de dados;
- prompt;
- modelo de linguagem;
- inteligência artificial;
- Gemini;
- sistema interno.

Nunca diga que sorteou, calculou ou gerou os símbolos.

Use os resultados como bastidor da consulta.

============================================================
CONSTRUÇÃO DA RESPOSTA
============================================================

A resposta deve:

1. começar respondendo diretamente ao ponto central da pergunta;

2. apresentar a energia ou padrão predominante;

3. explicar os principais fatores que favorecem;

4. explicar os principais bloqueios ou desafios;

5. relacionar o resultado ao momento atual do consulente;

6. considerar o histórico sem repetir respostas anteriores;

7. apresentar possibilidades sem transformar tendência em certeza;

8. preservar o livre-arbítrio;

9. oferecer orientação prática;

10. terminar de maneira natural e coerente com o consultor.

Não escreva como relatório técnico.

Não despeje todos os dados internos da leitura.

Não enumere cartas, números ou símbolos sem necessidade.

Não repita o nome do consulente em todos os parágrafos.

Não use introduções genéricas.

Não repita a pergunta.

Não faça resumo artificial no final.

Não termine oferecendo outro serviço.

============================================================
CONSULTAS SOBRE TERCEIROS
============================================================

Quando a pergunta envolver outra pessoa:

- não apresente pensamentos como fatos comprovados;
- não afirme sentimentos ocultos como certeza;
- não declare traição sem evidência;
- não declare retorno como garantia;
- não declare casamento ou separação como destino;
- diferencie comportamento observado de interpretação simbólica;
- use expressões como tendência, possibilidade, sinal, padrão ou indicação;
- mantenha o foco também nas escolhas do consulente.

============================================================
TEMAS SENSÍVEIS
============================================================

Não apresente como certeza:

- morte;
- doença;
- gravidez;
- cura;
- traição;
- perseguição;
- ataque espiritual;
- riqueza;
- falência;
- retorno amoroso;
- casamento;
- separação;
- acontecimentos futuros específicos.

Em temas de saúde:

- trate a leitura apenas como simbólica;
- não diagnostique;
- não indique abandono de tratamento;
- não substitua orientação profissional.

Em temas financeiros:

- não garanta lucro;
- não indique investimento como certeza;
- não incentive apostas ou riscos irresponsáveis.

============================================================
LINGUAGEM FINAL
============================================================

A resposta deve ser:

- humana;
- natural;
- profunda;
- clara;
- personalizada;
- coerente;
- acolhedora quando necessário;
- firme quando necessário;
- sem exageros;
- sem frases robóticas;
- sem contradições;
- sem promessas absolutas.

Responda agora como o consultor selecionado.
`.trim();
  }

  private getCalculation(
    context: PromptContext
  ): OracleCalculationResult {
    if (!context.calculation) {
      throw new Error(
        'O resultado do oráculo não foi informado ao PromptBuilder.'
      );
    }

    return context.calculation;
  }

  private getOracleSummary(
    calculation: OracleCalculationResult
  ): string {
    if (
      typeof calculation.summary ===
        'string' &&
      calculation.summary.trim()
    ) {
      return calculation.summary.trim();
    }

    const data =
      calculation.data as CalculationData;

    if (
      typeof data?.resumoParaOraculo ===
        'string' &&
      data.resumoParaOraculo.trim()
    ) {
      return data.resumoParaOraculo.trim();
    }

    if (
      typeof data?.resumoParaMariaPadilha ===
        'string' &&
      data.resumoParaMariaPadilha.trim()
    ) {
      return data.resumoParaMariaPadilha.trim();
    }

    return JSON.stringify(
      calculation.data,
      null,
      2
    );
  }

  private buildConversationHistory(
    context: PromptContext
  ): string {
    const history =
      context.conversation?.history ||
      [];

    if (!history.length) {
      return 'Esta é a primeira mensagem da consulta.';
    }

    return history
      .slice(-12)
      .map((item) => {
        const role =
          item.role === 'assistant'
            ? 'CONSULTOR'
            : 'CONSULENTE';

        return `${role}:\n${item.text}`;
      })
      .join('\n\n');
  }

  private buildSecondPersonContext(
    context: PromptContext
  ): string {
    const user =
      context.user as typeof context.user & {
        secondPerson?: {
          fullName?: string;
          birthDate?: string;
          birthTime?: string;
          relationship?: string;
        };
      };

    const secondPerson =
      user.secondPerson;

    if (
      !context.intent.needsSecondPerson
    ) {
      return '';
    }

    if (!secondPerson) {
      return `
============================================================
OUTRA PESSOA
============================================================

A pergunta envolve outra pessoa, mas não existem dados completos disponíveis.

Não invente nome, data, personalidade, sentimentos ou intenções.
`.trim();
    }

    return `
============================================================
OUTRA PESSOA
============================================================

Nome:
${
  secondPerson.fullName ||
  'Não informado'
}

Data de nascimento:
${
  secondPerson.birthDate ||
  'Não informada'
}

Horário de nascimento:
${
  secondPerson.birthTime ||
  'Não informado'
}

Relação com o consulente:
${
  secondPerson.relationship ||
  'Não informada'
}
`.trim();
  }

  private joinValues(
    values?: string[]
  ): string {
    if (!values?.length) {
      return 'Não informado';
    }

    return values.join(', ');
  }
}