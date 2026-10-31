/**
 * ORACULOS.TS — Blindagem da linguagem oracular
 *
 * Última camada antes da resposta chegar ao consulente. Garante que:
 *  - nunca apareça "simbólico" (e variações) — o jogo é real;
 *  - nunca apareça menção a IA, robô, modelo de linguagem, algoritmo, sistema, sorteio;
 *  - a leitura não seja montada em rótulos "Passado / Presente / Futuro".
 */

const TERMOS_IA_SIGLA = /(^|[^A-Za-zÀ-ÿ])(IA|I\.A\.|AI)(?=$|[^A-Za-zÀ-ÿ])/;
const TERMOS_IA_PALAVRAS =
  /(intelig[eê]ncia artificial|chat ?bot|chatgpt|gemini|modelo de linguagem|rob[oô]s?\b|assistente virtual|atendentes? virtua(l|is)|algoritmos?\b|programa de computador|machine learning|aprendizado de m[aá]quina|\bprompt)/i;

const TERMOS_IA = {
  test: (texto: string) => TERMOS_IA_SIGLA.test(texto) || TERMOS_IA_PALAVRAS.test(texto),
};

const FRASES_TECNICAS: RegExp[] = [
  /\b(as|os) (cartas|runas|búzios|buzios|odùs|odus|hexagramas?) foram (sorteadas?|sorteados|selecionad[oa]s|calculad[oa]s|gerad[oa]s)\b[^.!?\n]*[.!?]?/gi,
  /\bo sistema (calculou|selecionou|sorteou|gerou|mostrou)\b[^.!?\n]*[.!?]?/gi,
  /\b(com base|de acordo) (no|com o) (prompt|resultado interno|perfil oracular)\b[,:]?/gi,
  /\bresultado interno( do perfil oracular)?\b[,:]?/gi,
];

const SUBSTITUICOES: Array<[RegExp, string]> = [
  [/\b(de forma|de modo|de maneira) simb[oó]lica\b/gi, 'de forma espiritual'],
  [/\b(meramente|apenas|puramente) simb[oó]lic[oa]s?\b/gi, 'espiritual'],
  [/\bsimbolicamente\b/gi, 'espiritualmente'],
  [/\bsimb[oó]lic[oa]s\b/g, 'espirituais'],
  [/\bSimb[oó]lic[oa]s\b/g, 'Espirituais'],
  [/\bsimb[oó]lic[oa]\b/g, 'espiritual'],
  [/\bSimb[oó]lic[oa]\b/g, 'Espiritual'],
  [/\bsimbolismo\b/gi, 'significado'],
  [/\bsimbolizam\b/gi, 'revelam'],
  [/\bsimboliza\b/gi, 'revela'],
];

/** Rótulos de linha como "**Passado:**", "## Presente", "Futuro -" */
const ROTULOS_TEMPO = /^\s*(?:#{1,6}\s*)?(?:\*\*|__)?\s*(?:o\s+)?(passado|presente|futuro)\s*(?:\*\*|__)?\s*[:\-–—]\s*(?:\*\*|__)?\s*/gim;
const ROTULOS_TEMPO_SOZINHOS = /^\s*(?:#{1,6}\s*)?(?:\*\*|__)?\s*(?:o\s+)?(passado|presente|futuro)\s*(?:\*\*|__)?\s*$/gim;

function dividirEmFrases(paragrafo: string): string[] {
  return paragrafo.match(/[^.!?\n]+(?:[.!?]+|$)/g) || [paragrafo];
}

function removerFrasesComIA(texto: string): string {
  return texto
    .split('\n')
    .map((linha) => {
      if (!TERMOS_IA.test(linha)) return linha;
      return dividirEmFrases(linha)
        .filter((frase) => !TERMOS_IA.test(frase))
        .join('')
        .trim();
    })
    .join('\n');
}

export function blindarLinguagemOracular(texto: string): string {
  let resultado = String(texto || '');

  resultado = removerFrasesComIA(resultado);

  for (const re of FRASES_TECNICAS) resultado = resultado.replace(re, '');
  for (const [re, troca] of SUBSTITUICOES) resultado = resultado.replace(re, troca);

  resultado = resultado.replace(ROTULOS_TEMPO_SOZINHOS, '').replace(ROTULOS_TEMPO, '');

  return resultado
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');
}

/** Usado em testes e auditorias: diz se o texto ainda tem termos proibidos. */
export function contemLinguagemProibida(texto: string): boolean {
  const t = String(texto || '');
  return /simb[oó]lic|simbolicamente/i.test(t) || TERMOS_IA.test(t);
}
