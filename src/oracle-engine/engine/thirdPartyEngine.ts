/**
 * ORACULOS.TS — Detector de outras pessoas na pergunta
 *
 * Reconhece quando a pergunta envolve outra pessoa e QUAL é o vínculo:
 * amor, sociedade/parceria de negócio, quem decide uma vaga de emprego,
 * filho(a) e família, alguém que o consulente vai contratar, amizade,
 * clientes/fornecedores etc. Extrai nome, data de nascimento e empresa.
 *
 * Exemplos atendidos:
 *  - "estou montando uma parceria com Flavio Roberto Ortiz costa nascido 02/02/1983 dará certo?"
 *  - "espero resposta do gerente Gilmar Rodrigo Oliveira nascido 05/04/1985 empresa tustao"
 *  - "Meu filho Antônio José Santos nascido 02/07/1999 vai conseguir se alinhar na vida?"
 *  - "Minha empregada Janice Rubens carvalho nascida 12/01/2005 dará certo trabalhar aqui?"
 */

import { interpretarDataNascimento, type DataCivil } from '../temporal/temporalContext.js';

export type CategoriaVinculo =
  | 'amor'
  | 'sociedade'
  | 'emprego'
  | 'contratacao'
  | 'familia'
  | 'amizade'
  | 'negocio'
  | 'outro';

export interface PessoaMencionada {
  papel: string;
  categoria: CategoriaVinculo;
  nome: string | null;
  dataNascimentoTexto: string | null;
  dataNascimento: DataCivil | null;
  empresa: string | null;
  dadosFaltantes: Array<'nome completo' | 'data de nascimento'>;
}

export interface AnaliseTerceiros {
  envolveOutraPessoa: boolean;
  categoriaPrincipal: CategoriaVinculo | null;
  pessoas: PessoaMencionada[];
  empresa: string | null;
}

interface DefinicaoPapel {
  termos: string[];
  papel: string;
  categoria: CategoriaVinculo;
}

const PAPEIS: DefinicaoPapel[] = [
  // Sociedade / parceria
  { termos: ['parceria com', 'sociedade com', 'socio', 'socia', 'parceiro de negocio', 'parceira de negocio', 'parceiro comercial', 'investidor', 'investidora'], papel: 'sócio(a) / parceiro(a) de negócio', categoria: 'sociedade' },
  // Quem decide emprego
  { termos: ['gerente', 'chefe', 'patrao', 'patroa', 'recrutador', 'recrutadora', 'entrevistador', 'entrevistadora', 'diretor', 'diretora', 'supervisor', 'supervisora', 'coordenador', 'coordenadora', 'dono da empresa', 'dona da empresa', 'responsavel pela vaga', 'rh'], papel: 'pessoa que decide a vaga / superior', categoria: 'emprego' },
  // Contratação (o consulente contrata)
  { termos: ['empregada', 'empregado', 'diarista', 'funcionario', 'funcionaria', 'baba', 'cuidador', 'cuidadora', 'motorista', 'caseiro', 'caseira', 'colaborador', 'colaboradora', 'estagiario', 'estagiaria', 'pedreiro', 'prestador', 'prestadora', 'faxineira', 'cozinheira', 'secretaria', 'vendedor', 'vendedora'], papel: 'pessoa contratada / a contratar', categoria: 'contratacao' },
  // Família
  { termos: ['filho', 'filha', 'pai', 'mae', 'irmao', 'irma', 'neto', 'neta', 'sobrinho', 'sobrinha', 'tio', 'tia', 'avo', 'primo', 'prima', 'sogro', 'sogra', 'cunhado', 'cunhada', 'genro', 'nora', 'enteado', 'enteada', 'padrasto', 'madrasta'], papel: 'familiar', categoria: 'familia' },
  // Amor
  { termos: ['ex-namorado', 'ex-namorada', 'ex namorado', 'ex namorada', 'ex-marido', 'ex marido', 'ex-esposa', 'ex esposa', 'namorado', 'namorada', 'marido', 'esposa', 'esposo', 'noivo', 'noiva', 'companheiro', 'companheira', 'ficante', 'crush', 'amante', 'paquera', 'pessoa amada', 'meu amor', 'meu ex', 'minha ex', 'parceiro', 'parceira'], papel: 'vínculo amoroso', categoria: 'amor' },
  // Amizade
  { termos: ['amigo', 'amiga', 'colega', 'vizinho', 'vizinha', 'comadre', 'compadre'], papel: 'amizade / convivência', categoria: 'amizade' },
  // Negócios
  { termos: ['cliente', 'fornecedor', 'fornecedora', 'inquilino', 'inquilina', 'locatario', 'locataria', 'proprietario', 'proprietaria', 'comprador', 'compradora', 'advogado', 'advogada', 'contador', 'contadora'], papel: 'relação comercial', categoria: 'negocio' },
];

/** Palavras que encerram um nome próprio. */
const PARADAS = new Set(
  [
    'nascido', 'nascida', 'nasceu', 'nasc', 'nascimento', 'data', 'dia', 'empresa', 'dara', 'vai', 'vao', 'sera', 'seria',
    'que', 'e', 'com', 'para', 'pra', 'no', 'na', 'em', 'esta', 'tem', 'trabalhar', 'aqui', 'conseguir', 'se', 'me', 'meu', 'minha',
    'ele', 'ela', 'certo', 'vai', 'pode', 'deve', 'quer', 'gosta', 'ama', 'volta', 'voltar', 'sobre', 'mas', 'porem', 'ou', 'ja',
    'ainda', 'hoje', 'amanha', 'sim', 'nao', 'do', 'dos', 'das', 'da', 'de', 'o', 'a', 'os', 'as', 'um', 'uma', 'e', 'esta',
    'estou', 'estamos', 'sou', 'foi', 'era', 'dar', 'fazer', 'fica', 'ficar', 'chamado', 'chamada', 'nome', 'loja', 'clube',
    'vaga', 'emprego', 'entrevista', 'resposta', 'mesmo', 'tambem', 'bem', 'mal', 'muito', 'pouco', 'agora', 'depois', 'antes',
  ],
);

const CONECTORES = new Set(['de', 'da', 'do', 'dos', 'das', 'e']);

const PALAVRAS_NAO_NOME = new Set([
  'deus', 'tarot', 'buzios', 'runas', 'amor', 'oraculo', 'cartas', 'baralho', 'cigano', 'iching', 'ifa', 'orixa', 'santo', 'senhor',
  'senhora', 'dona', 'seu', 'sr', 'sra',
]);

function normalizar(texto: string): string {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const RE_DATA = /(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2})/;

interface Token {
  original: string;
  norm: string;
  inicio: number;
  fim: number;
}

function tokenizar(texto: string): Token[] {
  const tokens: Token[] = [];
  const re = /[A-Za-zÀ-ÖØ-öø-ÿ'’-]+|\d{1,4}(?:[/.-]\d{1,2}(?:[/.-]\d{2,4})?)?|[,;:!?.()]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    tokens.push({ original: m[0], norm: normalizar(m[0]), inicio: m.index, fim: m.index + m[0].length });
  }
  return tokens;
}

function iniciaComMaiuscula(palavra: string): boolean {
  const primeira = palavra.charAt(0);
  return primeira !== primeira.toLowerCase() && primeira === primeira.toUpperCase();
}

function ehPalavra(token: Token): boolean {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ'’-]+$/.test(token.original);
}

/**
 * Lê um nome próprio a partir do índice informado. A primeira palavra precisa
 * começar com letra maiúscula; as seguintes podem estar em minúsculas
 * (muita gente digita "Janice Rubens carvalho").
 */
function lerNome(tokens: Token[], inicio: number): { nome: string; fimIndice: number } | null {
  let i = inicio;
  // pula artigos/marcadores: "o", "a", "chamado", "de nome", ",", "da empresa"
  const LOCAIS = ['empresa', 'firma', 'loja', 'companhia', 'clube', 'escola', 'igreja'];
  for (;;) {
    if (i < tokens.length && ['o', 'a', 'chamado', 'chamada', 'nome', 'de', ',', ':', 'seu', 'sr', 'sra', 'dona', 'senhor', 'senhora'].includes(tokens[i].norm)) {
      i++;
      continue;
    }
    if (i + 1 < tokens.length && ['da', 'do', 'de', 'na', 'no'].includes(tokens[i].norm) && LOCAIS.includes(tokens[i + 1].norm)) {
      i += 2;
      continue;
    }
    break;
  }
  if (i >= tokens.length) return null;
  const primeiro = tokens[i];
  if (!ehPalavra(primeiro) || !iniciaComMaiuscula(primeiro.original)) return null;
  if (PARADAS.has(primeiro.norm) || PALAVRAS_NAO_NOME.has(primeiro.norm) || primeiro.norm.length < 2) return null;

  const partes: string[] = [primeiro.original];
  let j = i + 1;
  while (j < tokens.length && partes.length < 7) {
    const t = tokens[j];
    if (!ehPalavra(t)) break;
    if (CONECTORES.has(t.norm)) {
      const proximo = tokens[j + 1];
      // "e" separa pessoas diferentes ("Ana e Pedro"); de/da/do/dos/das fazem parte do nome
      if (
        t.norm !== 'e' &&
        proximo &&
        ehPalavra(proximo) &&
        !PARADAS.has(proximo.norm) &&
        !CONECTORES.has(proximo.norm) &&
        !ehPapel(proximo.norm)
      ) {
        partes.push(t.original, proximo.original);
        j += 2;
        continue;
      }
      break;
    }
    if (PARADAS.has(t.norm) || PALAVRAS_NAO_NOME.has(t.norm)) break;
    if (ehPapel(t.norm)) break;
    if (t.norm.length < 2) break;
    partes.push(t.original);
    j++;
  }

  return { nome: partes.join(' '), fimIndice: j };
}

const TODOS_TERMOS_SIMPLES = new Set(PAPEIS.flatMap((p) => p.termos.filter((t) => !t.includes(' '))));

function ehPapel(norm: string): boolean {
  return TODOS_TERMOS_SIMPLES.has(norm);
}

function lerDataProxima(texto: string, aPartirDe: number): { texto: string; data: DataCivil | null } | null {
  const janela = texto.slice(aPartirDe, aPartirDe + 60);
  const m = janela.match(RE_DATA);
  if (!m) return null;
  // Evita "pegar" datas de outra pessoa mais adiante
  const antes = normalizar(janela.slice(0, m.index || 0));
  if (/\b(meu|minha)\s+(filho|filha|socio|socia|gerente|chefe|empregada|namorado|namorada|marido|esposa)\b/.test(antes)) {
    return null;
  }
  return { texto: m[1], data: interpretarDataNascimento(m[1]) };
}

function extrairEmpresa(texto: string, nomesPessoas: string[] = []): string | null {
  const re = /\bempresa\s+(?:chamada\s+|de nome\s+)?([A-Za-zÀ-ÖØ-öø-ÿ0-9&'’.-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ0-9&'’.-]+){0,3})/gi;
  const pessoas = nomesPessoas.map((n) => normalizar(n).split(/\s+/)[0]);
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const candidato = lerNomeEmpresa(m[1]);
    if (candidato && !pessoas.includes(normalizar(candidato).split(/\s+/)[0])) return candidato;
  }
  return null;
}

function lerNomeEmpresa(trecho: string): string | null {
  const palavras = trecho.split(/\s+/);
  const resultado: string[] = [];
  for (const p of palavras) {
    const n = normalizar(p).replace(/[.]+$/, '');
    if (PARADAS.has(n) && resultado.length > 0) break;
    if (PARADAS.has(n)) return null;
    resultado.push(p.replace(/[.,;:!?]+$/, ''));
  }
  const nome = resultado.join(' ').trim();
  return nome.length >= 2 ? nome : null;
}

function detectarCategoriaPorContexto(textoNorm: string): CategoriaVinculo {
  if (/(parceria|sociedade|negocio|socio|investimento|abrir empresa)/.test(textoNorm)) return 'sociedade';
  if (/(emprego|vaga|entrevista|contrata(cao|r)?\b|curriculo|processo seletivo)/.test(textoNorm)) return 'emprego';
  if (/(amor|namor|casamento|relacionamento|gosta de mim|volta|paixao|ficar junto)/.test(textoNorm)) return 'amor';
  if (/(filho|filha|familia|mae|pai|irmao|irma)/.test(textoNorm)) return 'familia';
  return 'outro';
}

export function analisarTerceiros(pergunta: string): AnaliseTerceiros {
  const texto = String(pergunta || '');
  const textoNorm = normalizar(texto);
  const tokens = tokenizar(texto);
  const pessoas: PessoaMencionada[] = [];
  const nomesVistos = new Set<string>();
  let empresa: string | null = null;

  const registrar = (p: Omit<PessoaMencionada, 'dadosFaltantes'>) => {
    const chave = p.nome ? normalizar(p.nome) : `${p.categoria}:${p.papel}`;
    if (nomesVistos.has(chave)) return;
    nomesVistos.add(chave);
    const faltantes: PessoaMencionada['dadosFaltantes'] = [];
    if (!p.nome || p.nome.trim().split(/\s+/).length < 2) faltantes.push('nome completo');
    if (!p.dataNascimento) faltantes.push('data de nascimento');
    pessoas.push({ ...p, dadosFaltantes: faltantes });
  };

  // 1. Pessoas introduzidas por um papel ("meu filho X", "gerente X", "parceria com X")
  for (const def of PAPEIS) {
    for (const termo of def.termos) {
      const re = new RegExp(`(^|[^a-z])${escaparRegex(termo)}(?=$|[^a-z])`, 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(textoNorm))) {
        const posTermoFim = m.index + m[0].length;

        // "ex" isolado e "mae"/"pai" de santo não contam
        if (def.categoria === 'familia' && /^(\s+de\s+santo)/.test(textoNorm.slice(posTermoFim))) continue;
        // "parceiro" em contexto de negócio é sociedade
        let categoria = def.categoria;
        let papel = def.papel;
        if ((termo === 'parceiro' || termo === 'parceira') && /(negocio|empresa|sociedade|parceria|comercial)/.test(textoNorm)) {
          categoria = 'sociedade';
          papel = 'sócio(a) / parceiro(a) de negócio';
        }
        // Evita "funcionario" quando é o próprio consulente ("sou funcionário")
        if (categoria === 'contratacao' && /\bsou\s+$/.test(textoNorm.slice(Math.max(0, m.index - 5), m.index + 1))) continue;

        const indiceToken = tokens.findIndex((t) => t.inicio >= posTermoFim);
        const nomeLido = indiceToken >= 0 ? lerNome(tokens, indiceToken) : null;
        const fimNomePos = nomeLido && tokens[nomeLido.fimIndice - 1] ? tokens[nomeLido.fimIndice - 1].fim : posTermoFim;
        const data = lerDataProxima(texto, fimNomePos);

        // Termo genérico sem nome/data e sem possessivo provavelmente não é uma pessoa específica
        const possessivo = /\b(meu|minha|meus|minhas|o|a|do|da|com|nosso|nossa)\s*$/.test(textoNorm.slice(Math.max(0, m.index - 8), m.index + 1));
        if (!nomeLido && !data && !possessivo && categoria !== 'sociedade') continue;

        registrar({
          papel,
          categoria,
          nome: nomeLido?.nome || null,
          dataNascimentoTexto: data?.texto || null,
          dataNascimento: data?.data || null,
          empresa: null,
        });
      }
    }
  }

  // 2. Nome seguido de "nascido(a) dd/mm/aaaa" sem papel explícito
  const reNascido = /\b(nascid[oa]|nasceu)\b/gi;
  let mn: RegExpExecArray | null;
  while ((mn = reNascido.exec(texto))) {
    const idxToken = tokens.findIndex((t) => t.inicio === mn!.index);
    if (idxToken <= 0) continue;
    // volta até achar o início do nome
    let k = idxToken - 1;
    while (k > 0 && ehPalavra(tokens[k - 1]) && !PARADAS.has(tokens[k - 1].norm) && !ehPapel(tokens[k - 1].norm)) k--;
    while (k < idxToken && !iniciaComMaiuscula(tokens[k].original)) k++;
    if (k >= idxToken) continue;
    const nomeLido = lerNome(tokens, k);
    if (!nomeLido) continue;
    if (nomesVistos.has(normalizar(nomeLido.nome))) continue;
    const data = lerDataProxima(texto, mn.index);
    registrar({
      papel: 'pessoa mencionada',
      categoria: detectarCategoriaPorContexto(textoNorm),
      nome: nomeLido.nome,
      dataNascimentoTexto: data?.texto || null,
      dataNascimento: data?.data || null,
      empresa: null,
    });
  }

  // 3. Pronomes "ele/ela" em perguntas de amor sem nome
  if (pessoas.length === 0 && /\b(ele|ela)\s+(gosta|me ama|vai voltar|volta|pensa|sente|esta|vai)\b/.test(textoNorm)) {
    registrar({ papel: 'pessoa amada', categoria: 'amor', nome: null, dataNascimentoTexto: null, dataNascimento: null, empresa: null });
  }

  empresa = extrairEmpresa(texto, pessoas.map((p) => p.nome || '').filter(Boolean));
  for (const p of pessoas) {
    if (p.categoria === 'emprego' || p.categoria === 'sociedade' || p.categoria === 'negocio' || p.papel === 'pessoa mencionada') {
      p.empresa = empresa;
    }
  }

  return {
    envolveOutraPessoa: pessoas.length > 0,
    categoriaPrincipal: pessoas[0]?.categoria || null,
    pessoas,
    empresa,
  };
}

const ORIENTACAO_POR_CATEGORIA: Record<CategoriaVinculo, string> = {
  amor:
    'Leitura de vínculo amoroso: sentimentos reais da pessoa, compatibilidade entre os dois mapas, o que une e o que afasta, e o caminho mais provável da relação.',
  sociedade:
    'Leitura de SOCIEDADE/PARCERIA (não é leitura amorosa): confiabilidade e honestidade da pessoa com dinheiro, alinhamento de objetivos, complementaridade de talentos, riscos do acordo, em que ponto a parceria prospera e o que precisa ficar por escrito.',
  emprego:
    'Leitura de DECISÃO DE EMPREGO (não é leitura amorosa): como a pessoa que decide enxerga o consulente, a energia da decisão, a chance concreta de resposta positiva, o tempo provável da resposta e como o consulente deve se portar para fortalecer a chance.',
  contratacao:
    'Leitura de CONTRATAÇÃO/CONVIVÊNCIA NO TRABALHO: confiabilidade, honestidade, dedicação, adaptação à casa ou à empresa do consulente, pontos de atenção e se a convivência tende a dar certo.',
  familia:
    'Leitura FAMILIAR focada na pessoa citada: o momento de vida dela, talentos, bloqueios, para onde o caminho dela aponta e como o consulente pode apoiar sem carregar o peso sozinho.',
  amizade:
    'Leitura de AMIZADE/CONVIVÊNCIA: lealdade, intenções, afinidade e se a relação acrescenta ou desgasta.',
  negocio:
    'Leitura de RELAÇÃO COMERCIAL: seriedade, cumprimento de acordos, risco financeiro e melhor forma de conduzir o negócio.',
  outro:
    'Leitura envolvendo outra pessoa: intenções, energia entre os dois e o desfecho indicado para a questão.',
};

export function formatarTerceirosParaPrompt(
  analise: AnaliseTerceiros,
  perfisTerceiros: Record<string, string> = {},
): string {
  if (!analise.envolveOutraPessoa) return '';

  const linhas: string[] = ['PESSOAS ENVOLVIDAS NA PERGUNTA (identificadas pelo site)'];
  analise.pessoas.forEach((p, i) => {
    linhas.push(
      `${i + 1}. ${p.nome || 'Nome não informado'} — vínculo: ${p.papel} [${p.categoria}]` +
        (p.dataNascimentoTexto ? ` — nascimento: ${p.dataNascimentoTexto}` : '') +
        (p.empresa ? ` — empresa/local: ${p.empresa}` : ''),
    );
    linhas.push(`   Como ler: ${ORIENTACAO_POR_CATEGORIA[p.categoria]}`);
    const chave = p.nome ? normalizar(p.nome) : '';
    if (chave && perfisTerceiros[chave]) {
      linhas.push(`   Jogo aberto para esta pessoa (dados natal dela):\n${perfisTerceiros[chave]}`);
    }
    if (p.dadosFaltantes.length > 0) {
      linhas.push(
        `   Dados que faltam: ${p.dadosFaltantes.join(' e ')}. Dê a primeira resposta que o jogo já mostra e peça com carinho ${p.dadosFaltantes.join(' e ')} desta pessoa para aprofundar.`,
      );
    }
  });

  linhas.push(
    'REGRAS PARA PERGUNTAS COM OUTRAS PESSOAS',
    '• Respeite o tipo de vínculo: sócio não é par romântico, gerente não é par romântico, filho e empregada também não. Nunca transforme em leitura amorosa o que não é amor.',
    '• Cruze os dados natal do consulente com os da outra pessoa (quando informados) e com a energia do dia.',
    '• Responda claramente à pergunta (vai dar certo? vai conseguir? é confiável?) com base no que o jogo mostra.',
  );

  return linhas.join('\n');
}
