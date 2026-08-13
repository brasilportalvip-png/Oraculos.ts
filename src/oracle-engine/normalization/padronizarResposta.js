const FRASES_PROIBIDAS = [
  /como uma inteligência artificial/gi,
  /como inteligência artificial/gi,
  /como modelo de linguagem/gi,
  /sou uma inteligência artificial/gi,
  /sou inteligência artificial/gi,
  /sou uma ia/gi,
  /sou apenas uma ia/gi,
  /como chatbot/gi,
  /como assistente virtual/gi,
  /não tenho poderes sobrenaturais/gi,
  /não possuo poderes sobrenaturais/gi,
  /não posso prever o futuro/gi,
  /não consigo prever o futuro/gi,
  /não posso garantir o futuro/gi,
  /não posso acessar pensamentos/gi,
  /não tenho acesso aos pensamentos/gi,
  /segundo o algoritmo/gi,
  /o sistema calculou/gi,
  /o sistema selecionou/gi,
  /as cartas foram sorteadas/gi,
  /as cartas foram selecionadas/gi,
  /as runas foram sorteadas/gi,
  /o hexagrama foi calculado/gi,
  /com base no prompt/gi,
  /de acordo com o prompt/gi
];

const TITULOS_TECNICOS = [
  /^resultado interno.*$/gim,
  /^dados do cálculo.*$/gim,
  /^resultado dos motores.*$/gim,
  /^instruções para o consultor.*$/gim,
  /^regras obrigatórias.*$/gim,
  /^orientação para a voz.*$/gim,
  /^prompt.*$/gim
];

const ABERTURAS_ROBOTICAS = [
  /^claro[,.!:\s-]*/i,
  /^certamente[,.!:\s-]*/i,
  /^com certeza[,.!:\s-]*/i,
  /^vamos analisar[,.!:\s-]*/i,
  /^vamos explorar[,.!:\s-]*/i,
  /^a seguir[,.!:\s-]*/i,
  /^com base nas informações fornecidas[,.!:\s-]*/i,
  /^com base nos dados apresentados[,.!:\s-]*/i
];

const ENCERRAMENTOS_ROBOTICOS = [
  /\n*se quiser, posso.*$/gis,
  /\n*caso queira, posso.*$/gis,
  /\n*estou à disposição.*$/gis,
  /\n*espero ter ajudado.*$/gis,
  /\n*posso aprofundar.*$/gis,
  /\n*posso fazer outra leitura.*$/gis
];

function removerMarkdownExcessivo(texto) {
  return texto
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/^\s*[-*•]\s+/gm, '• ');
}

function removerBlocosTecnicos(texto) {
  let resposta = texto;

  for (const titulo of TITULOS_TECNICOS) {
    resposta = resposta.replace(titulo, '');
  }

  resposta = resposta
    .replace(/={5,}/g, '')
    .replace(/#{5,}/g, '')
    .replace(/-{5,}/g, '');

  return resposta;
}

function removerFrasesProibidas(texto) {
  let resposta = texto;

  for (const padrao of FRASES_PROIBIDAS) {
    resposta = resposta.replace(padrao, '');
  }

  return resposta;
}

function removerAberturasRoboticas(texto) {
  let resposta = texto.trim();

  for (const padrao of ABERTURAS_ROBOTICAS) {
    resposta = resposta.replace(padrao, '');
  }

  return resposta.trim();
}

function removerEncerramentosRoboticos(texto) {
  let resposta = texto;

  for (const padrao of ENCERRAMENTOS_ROBOTICOS) {
    resposta = resposta.replace(padrao, '');
  }

  return resposta.trim();
}

function corrigirEspacos(texto) {
  return texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/([,.;!?])([A-Za-zÀ-ÿ])/g, '$1 $2')
    .trim();
}

function removerLinhasVaziasDuplicadas(texto) {
  const linhas = texto.split('\n');
  const resultado = [];

  for (const linha of linhas) {
    const atualVazia = !linha.trim();
    const anteriorVazia =
      resultado.length > 0 &&
      !resultado[resultado.length - 1].trim();

    if (atualVazia && anteriorVazia) {
      continue;
    }

    resultado.push(linha.trimEnd());
  }

  return resultado.join('\n').trim();
}

function removerRepeticoesConsecutivas(texto) {
  const paragrafos = texto
    .split(/\n{2,}/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean);

  const resultado = [];
  let anteriorNormalizado = '';

  for (const paragrafo of paragrafos) {
    const atualNormalizado = paragrafo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (
      atualNormalizado &&
      atualNormalizado === anteriorNormalizado
    ) {
      continue;
    }

    resultado.push(paragrafo);
    anteriorNormalizado = atualNormalizado;
  }

  return resultado.join('\n\n');
}

function corrigirPontuacaoDuplicada(texto) {
  return texto
    .replace(/\.{4,}/g, '...')
    .replace(/!{2,}/g, '!')
    .replace(/\?{2,}/g, '?')
    .replace(/,\s*,+/g, ',')
    .replace(/;\s*;+/g, ';')
    .replace(/:\s*:+/g, ':')
    .replace(/\.\s*\./g, '.');
}

function capitalizarInicio(texto) {
  const indice = texto.search(/[A-Za-zÀ-ÿ]/);

  if (indice < 0) {
    return texto;
  }

  return (
    texto.slice(0, indice) +
    texto.charAt(indice).toUpperCase() +
    texto.slice(indice + 1)
  );
}

function garantirPontuacaoFinal(texto) {
  const resposta = texto.trim();

  if (!resposta) {
    return '';
  }

  if (/[.!?…)"']$/.test(resposta)) {
    return resposta;
  }

  return `${resposta}.`;
}

function limitarTamanho(texto, limite) {
  if (!Number.isFinite(limite) || limite <= 0) {
    return texto;
  }

  if (texto.length <= limite) {
    return texto;
  }

  const cortado = texto.slice(0, limite);
  const ultimoParagrafo = cortado.lastIndexOf('\n\n');
  const ultimoPonto = cortado.lastIndexOf('.');
  const ultimoInterrogacao = cortado.lastIndexOf('?');
  const ultimoExclamacao = cortado.lastIndexOf('!');

  const melhorCorte = Math.max(
    ultimoParagrafo,
    ultimoPonto,
    ultimoInterrogacao,
    ultimoExclamacao
  );

  if (melhorCorte > limite * 0.7) {
    return cortado.slice(0, melhorCorte + 1).trim();
  }

  const ultimoEspaco = cortado.lastIndexOf(' ');

  return `${cortado.slice(0, ultimoEspaco).trim()}…`;
}

function removerLinhasInternasIndesejadas(texto) {
  return texto
    .split('\n')
    .filter((linha) => {
      const normalizada = linha
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

      if (!normalizada) {
        return true;
      }

      return ![
        'instrucoes para o consultor',
        'instrucoes finais',
        'regras de interpretacao',
        'resultado interno do oraculo',
        'fim do prompt'
      ].includes(normalizada);
    })
    .join('\n');
}

/**
 * Padroniza a resposta final antes de enviá-la ao usuário.
 *
 * @param {unknown} texto
 * @param {{
 *   maxLength?: number;
 *   preserveMarkdown?: boolean;
 * }} [options]
 * @returns {string}
 */
export default function padronizarResposta(
  texto,
  options = {}
) {
  if (
    texto === null ||
    texto === undefined
  ) {
    return '';
  }

  let resposta = String(texto).trim();

  if (!resposta) {
    return '';
  }

  const maxLength =
    Number(options.maxLength) || 7000;

  const preserveMarkdown =
    options.preserveMarkdown === true;

  resposta = removerFrasesProibidas(resposta);
  resposta = removerBlocosTecnicos(resposta);
  resposta = removerLinhasInternasIndesejadas(resposta);

  if (!preserveMarkdown) {
    resposta = removerMarkdownExcessivo(resposta);
  }

  resposta = removerAberturasRoboticas(resposta);
  resposta = removerEncerramentosRoboticos(resposta);
  resposta = corrigirEspacos(resposta);
  resposta = corrigirPontuacaoDuplicada(resposta);
  resposta = removerLinhasVaziasDuplicadas(resposta);
  resposta = removerRepeticoesConsecutivas(resposta);
  resposta = limitarTamanho(resposta, maxLength);
  resposta = capitalizarInicio(resposta);
  resposta = garantirPontuacaoFinal(resposta);

  return resposta.trim();
}

export function dividirRespostaNaturalmente(
  texto,
  quantidadePartes = 3
) {
  const resposta = padronizarResposta(texto);

  if (!resposta) {
    return [];
  }

  const partesDesejadas = Math.max(
    1,
    Math.min(
      Number(quantidadePartes) || 3,
      5
    )
  );

  const paragrafos = resposta
    .split(/\n{2,}/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean);

  if (
    paragrafos.length <= partesDesejadas
  ) {
    return paragrafos;
  }

  const tamanhoTotal = paragrafos.reduce(
    (total, paragrafo) =>
      total + paragrafo.length,
    0
  );

  const alvo =
    tamanhoTotal / partesDesejadas;

  const resultado = [];
  let atual = [];
  let tamanhoAtual = 0;

  for (const paragrafo of paragrafos) {
    atual.push(paragrafo);
    tamanhoAtual += paragrafo.length;

    const partesRestantes =
      partesDesejadas -
      resultado.length -
      1;

    const paragrafosRestantes =
      paragrafos.length -
      resultado.reduce(
        (total, parte) =>
          total +
          parte.split(/\n{2,}/).length,
        0
      ) -
      atual.length;

    if (
      resultado.length <
        partesDesejadas - 1 &&
      tamanhoAtual >= alvo &&
      paragrafosRestantes >=
        partesRestantes
    ) {
      resultado.push(
        atual.join('\n\n')
      );

      atual = [];
      tamanhoAtual = 0;
    }
  }

  if (atual.length) {
    resultado.push(
      atual.join('\n\n')
    );
  }

  return resultado.filter(Boolean);
}

export function criarSequenciaDeDigitacao(
  texto,
  options = {}
) {
  const partes = dividirRespostaNaturalmente(
    texto,
    options.partes || 3
  );

  const baseDelay = Math.max(
    300,
    Number(options.baseDelay) || 900
  );

  return partes.map((parte, indice) => ({
    indice,
    digitando:
      indice % 3 === 0
        ? 'Digitando.'
        : indice % 3 === 1
          ? 'Digitando..'
          : 'Digitando...',
    delay:
      baseDelay +
      Math.min(
        2400,
        Math.floor(parte.length * 7)
      ),
    texto: parte,
    ultimaParte:
      indice === partes.length - 1
  }));
}