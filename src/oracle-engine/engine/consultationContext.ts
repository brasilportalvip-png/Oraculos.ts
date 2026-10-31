/**
 * ORACULOS.TS — Montagem completa do contexto de uma consulta
 *
 * Fórmula da leitura:
 *   dados natal do consulente
 * + dia e hora em que o jogo está sendo aberto
 * + dia do acontecimento citado na pergunta (amanhã, daqui 4 dias, sexta...)
 * + dados natal das outras pessoas envolvidas (sócio, gerente, filho, amor...)
 * + o jogo real do oráculo (embaralhado a cada consulta)
 */

import { executarOracleProfile } from '../profiles/index.js';
import {
  construirContextoTemporal,
  formatarContextoTemporalParaPrompt,
  gerarChaveTiragem,
  interpretarDataNascimento,
  type ContextoTemporal,
  type DataCivil,
} from '../temporal/temporalContext.js';
import { analisarTerceiros, formatarTerceirosParaPrompt, type AnaliseTerceiros } from './thirdPartyEngine.js';

export interface DadosNatais {
  nomeCompleto: string;
  dataNascimento: string;
  horaNascimento?: string | null;
  cidade?: string | null;
}

export interface ContextoConsulta {
  chaveTiragem: string;
  temporal: ContextoTemporal;
  terceiros: AnaliseTerceiros;
  resumoOraculoConsulente: string;
  blocoPrompt: string;
  regrasDeLeitura: string;
}

const SIGNOS: Array<{ nome: string; elemento: string; inicio: [number, number] }> = [
  { nome: 'Capricórnio', elemento: 'Terra', inicio: [12, 22] },
  { nome: 'Aquário', elemento: 'Ar', inicio: [1, 20] },
  { nome: 'Peixes', elemento: 'Água', inicio: [2, 19] },
  { nome: 'Áries', elemento: 'Fogo', inicio: [3, 21] },
  { nome: 'Touro', elemento: 'Terra', inicio: [4, 20] },
  { nome: 'Gêmeos', elemento: 'Ar', inicio: [5, 21] },
  { nome: 'Câncer', elemento: 'Água', inicio: [6, 21] },
  { nome: 'Leão', elemento: 'Fogo', inicio: [7, 23] },
  { nome: 'Virgem', elemento: 'Terra', inicio: [8, 23] },
  { nome: 'Libra', elemento: 'Ar', inicio: [9, 23] },
  { nome: 'Escorpião', elemento: 'Água', inicio: [10, 23] },
  { nome: 'Sagitário', elemento: 'Fogo', inicio: [11, 22] },
];

export function signoSolar(data: DataCivil): { nome: string; elemento: string } {
  const valor = data.mes * 100 + data.dia;
  let atual = SIGNOS[0];
  for (const s of SIGNOS.slice(1)) {
    if (valor >= s.inicio[0] * 100 + s.inicio[1]) atual = s;
  }
  if (valor >= 1222) atual = SIGNOS[0];
  return { nome: atual.nome, elemento: atual.elemento };
}

export function caminhoDeVida(data: DataCivil): number {
  let v = `${data.dia}${data.mes}${data.ano}`.split('').reduce((s, c) => s + Number(c), 0);
  while (v > 9 && v !== 11 && v !== 22 && v !== 33) {
    v = String(v)
      .split('')
      .reduce((s, c) => s + Number(c), 0);
  }
  return v;
}

const AFINIDADE_ELEMENTOS: Record<string, string> = {
  'Fogo-Fogo': 'muita energia em comum, risco de disputa de comando',
  'Fogo-Ar': 'o Ar alimenta o Fogo: ideias e ação se completam',
  'Fogo-Terra': 'impulso de um e cautela do outro: funciona com acordos claros',
  'Fogo-Água': 'intensidade emocional, exige paciência dos dois lados',
  'Terra-Terra': 'solidez e confiança, risco de rigidez',
  'Terra-Água': 'a Água nutre a Terra: parceria fértil e segura',
  'Terra-Ar': 'prática de um e ideias do outro: precisa de alinhamento',
  'Água-Água': 'sintonia emocional profunda, cuidado com a dependência',
  'Água-Ar': 'razão e emoção em lados opostos: diálogo é essencial',
  'Ar-Ar': 'comunicação fácil, falta de pé no chão às vezes',
};

function afinidade(a: string, b: string): string {
  return AFINIDADE_ELEMENTOS[`${a}-${b}`] || AFINIDADE_ELEMENTOS[`${b}-${a}`] || 'combinação neutra';
}

function normalizarChave(nome: string): string {
  return String(nome || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function resumoDoProfile(resultado: unknown): string {
  const r = resultado as { resumoParaOraculo?: string; resumoParaMariaPadilha?: string } | null;
  return String(r?.resumoParaOraculo || r?.resumoParaMariaPadilha || '').trim();
}

/** Remove a parte de instruções do resumo (para a 2ª pessoa só interessa o jogo). */
function somenteOJogo(resumo: string, limite = 2200): string {
  const corte = resumo.search(/INSTRU[CÇ][OÕ]ES|REGRAS OBRIGAT|ORIENTA[CÇ][AÃ]O PARA A VOZ/i);
  const base = (corte > 0 ? resumo.slice(0, corte) : resumo)
    .split('\n')
    .filter((l) => l.trim() && !/^[═=─-]{3,}$/.test(l.trim()))
    .join('\n');
  return base.length > limite ? `${base.slice(0, limite)}…` : base;
}

export const REGRAS_DE_LEITURA = `PADRÃO DE EXCELÊNCIA DA LEITURA (obrigatório)
1. O jogo é real. Fale do que saiu na mesa como fato ("saiu o Sol", "caiu Oxum na frente", "a runa Fehu veio de pé"). A magia nunca é quebrada.
2. NUNCA comece falando de passado, presente ou futuro e NUNCA organize a resposta em blocos "Passado / Presente / Futuro". A interpretação do jogo já é a resposta: abra respondendo diretamente o que foi perguntado.
3. PROIBIDO usar as palavras "simbólico", "simbólica", "simbolicamente", "simbolismo" ou qualquer variação. PROIBIDO mencionar inteligência artificial, IA, robô, sistema, algoritmo, modelo, cálculo ou sorteio.
4. Use os dados natal do consulente (nome completo de nascimento e data de nascimento — e hora, se informada) como raio-x da personalidade, caminhos e karma. Cruze com a energia do dia em que o jogo foi aberto e, se houver, com o dia do acontecimento.
5. Quando a pergunta envolver outra pessoa, respeite o tipo de vínculo (sociedade, emprego, família, contratação, amor, amizade) e leia os dados natal dela também.
6. Use a saudação correta do horário apenas no início da conversa ou quando o consulente cumprimentar; não repita saudação em toda mensagem.
7. Seja humano, caloroso e com o seu jeito único; nada de relatório, nada de lista técnica. No máximo um ou dois tópicos curtos, se ajudar.
8. Preserve o livre-arbítrio e não faça diagnósticos médicos nem promessas absolutas — mas responda com clareza o que o jogo indica.`;

export function montarContextoConsulta(params: {
  oracleId: string;
  pergunta: string;
  consulente: DadosNatais;
  fusoHorario?: string;
  agora?: Date;
  aleatorio?: number;
}): ContextoConsulta {
  const temporal = construirContextoTemporal({
    pergunta: params.pergunta,
    dataNascimento: params.consulente.dataNascimento,
    fusoHorario: params.fusoHorario,
    agora: params.agora,
  });

  const aleatorio = params.aleatorio ?? Math.floor(Math.random() * 1_000_000_000);
  const chaveTiragem = gerarChaveTiragem(temporal.agora, aleatorio);
  const terceiros = analisarTerceiros(params.pergunta);

  // Jogo do consulente
  let resumoOraculoConsulente = '';
  if (params.consulente.nomeCompleto && params.consulente.dataNascimento) {
    try {
      const dataAlvoChave = temporal.dataAlvo
        ? `${temporal.dataAlvo.data.ano}${temporal.dataAlvo.data.mes}${temporal.dataAlvo.data.dia}`
        : '';
      resumoOraculoConsulente = resumoDoProfile(
        executarOracleProfile(params.oracleId, {
          fullName: params.consulente.nomeCompleto,
          birthDate: params.consulente.dataNascimento,
          birthTime: params.consulente.horaNascimento || undefined,
          city: params.consulente.cidade || undefined,
          question: params.pergunta,
          drawKey: `${chaveTiragem}${dataAlvoChave}`,
        }),
      );
    } catch (erro) {
      console.error('[ORACULOS.TS] Falha ao abrir o jogo do consulente:', erro);
    }
  }

  // Jogo + mapa natal de cada outra pessoa
  const nascimentoConsulente = interpretarDataNascimento(params.consulente.dataNascimento);
  const perfisTerceiros: Record<string, string> = {};
  for (const pessoa of terceiros.pessoas) {
    if (!pessoa.nome || !pessoa.dataNascimento || !pessoa.dataNascimentoTexto) continue;
    const linhas: string[] = [];
    const signoOutro = signoSolar(pessoa.dataNascimento);
    linhas.push(
      `   • Signo solar: ${signoOutro.nome} (${signoOutro.elemento}) — caminho de vida ${caminhoDeVida(pessoa.dataNascimento)}`,
    );
    if (nascimentoConsulente) {
      const signoConsulente = signoSolar(nascimentoConsulente);
      linhas.push(
        `   • Consulente: ${signoConsulente.nome} (${signoConsulente.elemento}) — caminho de vida ${caminhoDeVida(nascimentoConsulente)}`,
        `   • Combinação dos elementos: ${afinidade(signoConsulente.elemento, signoOutro.elemento)}`,
      );
    }
    try {
      const jogo = somenteOJogo(
        resumoDoProfile(
          executarOracleProfile(params.oracleId, {
            fullName: pessoa.nome,
            birthDate: `${pessoa.dataNascimento.ano}-${String(pessoa.dataNascimento.mes).padStart(2, '0')}-${String(pessoa.dataNascimento.dia).padStart(2, '0')}`,
            question: params.pergunta,
            drawKey: `${chaveTiragem}7`,
          }),
        ),
      );
      if (jogo) linhas.push(jogo.split('\n').map((l) => `     ${l}`).join('\n'));
    } catch (erro) {
      console.error('[ORACULOS.TS] Falha ao abrir o jogo da outra pessoa:', erro);
    }
    perfisTerceiros[normalizarChave(pessoa.nome)] = linhas.join('\n');
  }

  const blocos = [formatarContextoTemporalParaPrompt(temporal)];
  const blocoTerceiros = formatarTerceirosParaPrompt(terceiros, perfisTerceiros);
  if (blocoTerceiros) blocos.push(blocoTerceiros);

  return {
    chaveTiragem,
    temporal,
    terceiros,
    resumoOraculoConsulente,
    blocoPrompt: blocos.join('\n\n'),
    regrasDeLeitura: REGRAS_DE_LEITURA,
  };
}
