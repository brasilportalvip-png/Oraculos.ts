/**
 * ORACULOS.TS — Relógio Oracular
 *
 * Dá ao site e a cada atendente a consciência do momento real da consulta:
 * dia, hora, data, mês, ano, saudação correta (bom dia / boa tarde / boa noite),
 * regente planetário e Orixá do dia, fase da Lua e dia pessoal do consulente.
 *
 * Também interpreta expressões de tempo da pergunta ("amanhã", "daqui 4 dias",
 * "sexta-feira", "dia 15", "15/11") para que a leitura considere o dia exato
 * do acontecimento: dados natal + dia da consulta + dia do acontecimento.
 */

export const FUSO_PADRAO = 'America/Sao_Paulo';

export interface DataCivil {
  ano: number;
  mes: number; // 1-12
  dia: number; // 1-31
}

export interface MomentoAtual extends DataCivil {
  hora: number;
  minuto: number;
  fusoHorario: string;
  diaSemanaIndice: number; // 0 = domingo
  diaSemana: string;
  mesNome: string;
  dataPorExtenso: string;
  horaFormatada: string;
  saudacao: 'Bom dia' | 'Boa tarde' | 'Boa noite';
  periodo: 'madrugada' | 'manhã' | 'tarde' | 'noite';
  isoLocal: string;
}

export interface EnergiaDoDia {
  data: DataCivil;
  dataPorExtenso: string;
  diaSemana: string;
  regentePlanetario: string;
  qualidadePlanetaria: string;
  orixaRegente: string;
  faseLua: string;
  iluminacaoLua: number; // 0-100
  qualidadeLua: string;
  numeroUniversal: number;
  numeroPessoal: number | null;
  qualidadeNumeroPessoal: string | null;
  dataEspecial: string | null;
}

export interface DataAlvo {
  data: DataCivil;
  diasAPartirDeHoje: number;
  expressao: string;
  descricao: string;
}

export interface ContextoTemporal {
  agora: MomentoAtual;
  energiaHoje: EnergiaDoDia;
  dataAlvo: DataAlvo | null;
  energiaDataAlvo: EnergiaDoDia | null;
}

const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const REGENTES: Array<{ planeta: string; qualidade: string; orixa: string }> = [
  { planeta: 'Sol', qualidade: 'brilho pessoal, reconhecimento, vitalidade e liderança', orixa: 'Ibeji e Nanã' },
  { planeta: 'Lua', qualidade: 'emoções, intuição, família e acolhimento', orixa: 'Exu e Omolu/Obaluaê' },
  { planeta: 'Marte', qualidade: 'coragem, iniciativa, disputa e abertura de caminhos', orixa: 'Ogum' },
  { planeta: 'Mercúrio', qualidade: 'comunicação, negociação, contratos, estudos e viagens curtas', orixa: 'Xangô e Iansã' },
  { planeta: 'Júpiter', qualidade: 'expansão, prosperidade, justiça e oportunidades', orixa: 'Oxóssi' },
  { planeta: 'Vênus', qualidade: 'amor, beleza, harmonia, acordos e prazer', orixa: 'Oxalá' },
  { planeta: 'Saturno', qualidade: 'estrutura, responsabilidade, maturidade, prazos e provas', orixa: 'Iemanjá e Oxum' },
];

const QUALIDADE_NUMERO: Record<number, string> = {
  1: 'início, iniciativa e protagonismo',
  2: 'parcerias, diplomacia e paciência',
  3: 'comunicação, alegria e criatividade',
  4: 'trabalho, organização e base sólida',
  5: 'mudança, movimento e novidades',
  6: 'família, amor, responsabilidade afetiva e harmonia',
  7: 'introspecção, estudo, fé e análise',
  8: 'poder material, conquistas, dinheiro e decisões',
  9: 'encerramentos, desapego e generosidade',
  11: 'intuição elevada, revelação e inspiração',
  22: 'grandes construções e realizações concretas',
  33: 'serviço amoroso, cura e missão',
};

const DATAS_ESPECIAIS: Record<string, string> = {
  '1-1': 'Ano Novo — portal de recomeços',
  '20-1': 'Dia de São Sebastião / Oxóssi',
  '2-2': 'Dia de Iemanjá',
  '19-3': 'Dia de São José',
  '23-4': 'Dia de São Jorge / Ogum',
  '13-5': 'Dia dos Pretos-Velhos',
  '12-6': 'Dia dos Namorados',
  '13-6': 'Dia de Santo Antônio',
  '24-6': 'Dia de São João / Xangô',
  '29-6': 'Dia de São Pedro',
  '26-7': 'Dia de Sant\'Ana / Nanã',
  '16-8': 'Dia de São Roque / Omolu',
  '27-9': 'Dia de Cosme e Damião / Ibeji',
  '12-10': 'Dia de Nossa Senhora Aparecida e Dia das Crianças',
  '31-10': 'Noite das Bruxas — véu entre os mundos mais fino',
  '2-11': 'Dia de Finados — honra aos ancestrais',
  '4-12': 'Dia de Santa Bárbara / Iansã',
  '8-12': 'Dia de Nossa Senhora da Conceição / Oxum',
  '24-12': 'Véspera de Natal',
  '25-12': 'Natal',
  '31-12': 'Véspera de Ano Novo',
};

// ---------------------------------------------------------------------------
// Utilidades de data civil (sem depender do fuso do servidor)
// ---------------------------------------------------------------------------

export function fusoValido(fuso: unknown): string {
  if (typeof fuso !== 'string' || !fuso.trim() || fuso.length > 64) {
    return FUSO_PADRAO;
  }
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: fuso.trim() });
    return fuso.trim();
  } catch {
    return FUSO_PADRAO;
  }
}

function paraUTC(data: DataCivil): number {
  return Date.UTC(data.ano, data.mes - 1, data.dia);
}

function deUTC(ms: number): DataCivil {
  const d = new Date(ms);
  return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() };
}

export function somarDias(data: DataCivil, dias: number): DataCivil {
  return deUTC(paraUTC(data) + dias * 86400000);
}

function somarMeses(data: DataCivil, meses: number): DataCivil {
  const total = data.ano * 12 + (data.mes - 1) + meses;
  const ano = Math.floor(total / 12);
  const mes = (total % 12) + 1;
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return { ano, mes, dia: Math.min(data.dia, ultimoDia) };
}

export function diferencaDias(de: DataCivil, ate: DataCivil): number {
  return Math.round((paraUTC(ate) - paraUTC(de)) / 86400000);
}

function diaSemanaDe(data: DataCivil): number {
  return new Date(paraUTC(data)).getUTCDay();
}

function dataValida(data: DataCivil): boolean {
  if (!data.ano || !data.mes || !data.dia) return false;
  if (data.mes < 1 || data.mes > 12 || data.dia < 1 || data.dia > 31) return false;
  const d = new Date(paraUTC(data));
  return d.getUTCMonth() + 1 === data.mes && d.getUTCDate() === data.dia;
}

export function dataPorExtenso(data: DataCivil): string {
  return `${DIAS_SEMANA[diaSemanaDe(data)]}, ${data.dia} de ${MESES[data.mes - 1]} de ${data.ano}`;
}

function reduzir(n: number): number {
  let v = Math.abs(Math.trunc(n));
  while (v > 9 && v !== 11 && v !== 22 && v !== 33) {
    v = String(v)
      .split('')
      .reduce((s, c) => s + Number(c), 0);
  }
  return v;
}

function somaDigitos(n: number | string): number {
  return String(n)
    .replace(/\D/g, '')
    .split('')
    .reduce((s, c) => s + Number(c), 0);
}

/** Aceita "1983-02-02", "02/02/1983", "02-02-1983", "02.02.1983". */
export function interpretarDataNascimento(valor: unknown): DataCivil | null {
  const texto = String(valor || '').trim();
  if (!texto) return null;

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const data = { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
    return dataValida(data) ? data : null;
  }

  m = texto.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (m) {
    let ano = Number(m[3]);
    if (ano < 100) ano += ano > 30 ? 1900 : 2000;
    const data = { ano, mes: Number(m[2]), dia: Number(m[1]) };
    return dataValida(data) ? data : null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Momento atual
// ---------------------------------------------------------------------------

export function obterMomentoAtual(agora: Date = new Date(), fuso: string = FUSO_PADRAO): MomentoAtual {
  const fusoHorario = fusoValido(fuso);
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: fusoHorario,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(agora);

  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value || 0);
  const ano = valor('year');
  const mes = valor('month');
  const dia = valor('day');
  const hora = valor('hour') % 24;
  const minuto = valor('minute');

  const diaSemanaIndice = diaSemanaDe({ ano, mes, dia });

  let saudacao: MomentoAtual['saudacao'];
  let periodo: MomentoAtual['periodo'];
  if (hora >= 5 && hora < 12) {
    saudacao = 'Bom dia';
    periodo = 'manhã';
  } else if (hora >= 12 && hora < 18) {
    saudacao = 'Boa tarde';
    periodo = 'tarde';
  } else {
    saudacao = 'Boa noite';
    periodo = hora < 5 ? 'madrugada' : 'noite';
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    ano,
    mes,
    dia,
    hora,
    minuto,
    fusoHorario,
    diaSemanaIndice,
    diaSemana: DIAS_SEMANA[diaSemanaIndice],
    mesNome: MESES[mes - 1],
    dataPorExtenso: dataPorExtenso({ ano, mes, dia }),
    horaFormatada: `${pad(hora)}:${pad(minuto)}`,
    saudacao,
    periodo,
    isoLocal: `${ano}-${pad(mes)}-${pad(dia)}T${pad(hora)}:${pad(minuto)}`,
  };
}

// ---------------------------------------------------------------------------
// Energia de um dia (planeta, Orixá, Lua, numerologia)
// ---------------------------------------------------------------------------

const MES_SINODICO = 29.530588853;
const LUA_NOVA_REFERENCIA = Date.UTC(2000, 0, 6, 18, 14);

export function calcularFaseLua(data: DataCivil): { fase: string; iluminacao: number; qualidade: string } {
  const meioDia = Date.UTC(data.ano, data.mes - 1, data.dia, 15); // ~12h no Brasil
  const dias = (meioDia - LUA_NOVA_REFERENCIA) / 86400000;
  const idade = ((dias % MES_SINODICO) + MES_SINODICO) % MES_SINODICO;
  const iluminacao = Math.round(((1 - Math.cos((2 * Math.PI * idade) / MES_SINODICO)) / 2) * 100);

  if (idade < 1.85 || idade >= 27.68) {
    return { fase: 'Lua Nova', iluminacao, qualidade: 'plantar intenções, começar em silêncio, preparar o terreno' };
  }
  if (idade < 7.38) {
    return { fase: 'Lua Crescente (início)', iluminacao, qualidade: 'dar os primeiros passos, mostrar-se, pedir e abrir portas' };
  }
  if (idade < 9.23) {
    return { fase: 'Quarto Crescente', iluminacao, qualidade: 'agir com coragem, superar resistências e decidir' };
  }
  if (idade < 13.84) {
    return { fase: 'Lua Crescente (gibosa)', iluminacao, qualidade: 'aperfeiçoar, insistir e fazer crescer o que já começou' };
  }
  if (idade < 15.69) {
    return { fase: 'Lua Cheia', iluminacao, qualidade: 'revelações, emoções à flor da pele, resultados e colheitas' };
  }
  if (idade < 22.15) {
    return { fase: 'Lua Minguante (disseminadora)', iluminacao, qualidade: 'compartilhar, agradecer e ajustar rotas' };
  }
  if (idade < 24.0) {
    return { fase: 'Quarto Minguante', iluminacao, qualidade: 'cortar o que pesa, encerrar ciclos e limpar' };
  }
  return { fase: 'Lua Minguante (balsâmica)', iluminacao, qualidade: 'descanso, recolhimento, desapego e preparo para o novo' };
}

export function calcularEnergiaDoDia(data: DataCivil, nascimento?: DataCivil | null): EnergiaDoDia {
  const indice = diaSemanaDe(data);
  const regente = REGENTES[indice];
  const lua = calcularFaseLua(data);
  const numeroUniversal = reduzir(somaDigitos(`${data.dia}${data.mes}${data.ano}`));

  let numeroPessoal: number | null = null;
  if (nascimento) {
    const anoPessoal = reduzir(somaDigitos(nascimento.dia) + somaDigitos(nascimento.mes) + somaDigitos(data.ano));
    const mesPessoal = reduzir(anoPessoal + somaDigitos(data.mes));
    numeroPessoal = reduzir(mesPessoal + somaDigitos(data.dia));
  }

  return {
    data,
    dataPorExtenso: dataPorExtenso(data),
    diaSemana: DIAS_SEMANA[indice],
    regentePlanetario: regente.planeta,
    qualidadePlanetaria: regente.qualidade,
    orixaRegente: regente.orixa,
    faseLua: lua.fase,
    iluminacaoLua: lua.iluminacao,
    qualidadeLua: lua.qualidade,
    numeroUniversal,
    numeroPessoal,
    qualidadeNumeroPessoal: numeroPessoal ? QUALIDADE_NUMERO[numeroPessoal] || null : null,
    dataEspecial: DATAS_ESPECIAIS[`${data.dia}-${data.mes}`] || null,
  };
}

// ---------------------------------------------------------------------------
// Interpretação de datas citadas na pergunta
// ---------------------------------------------------------------------------

function normalizarTexto(texto: string): string {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const NUMEROS_ESCRITOS: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7,
  oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14,
  quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30,
};

function lerNumero(token: string): number | null {
  if (/^\d{1,3}$/.test(token)) return Number(token);
  return NUMEROS_ESCRITOS[token] ?? null;
}

const MESES_NORMALIZADOS = MESES.map((m) => normalizarTexto(m));

const DIAS_SEMANA_REGEX: Array<[RegExp, number]> = [
  [/\bdomingo\b/, 0],
  [/\bsegunda(?:[\s-]*feira)\b/, 1],
  [/\bterca(?:[\s-]*feira)?\b/, 2],
  [/\bquarta(?:[\s-]*feira)\b/, 3],
  [/\bquinta(?:[\s-]*feira)\b/, 4],
  [/\bsexta(?:[\s-]*feira)?\b/, 5],
  [/\bsabado\b/, 6],
];

/** Remove trechos que falam de nascimento para não confundir com a data do acontecimento. */
function removerDatasDeNascimento(texto: string): string {
  return texto.replace(
    /(nascid[oa]s?|nasceu|nascimento|nasc\.?|data de nasc\w*)\s*(em|no dia|dia|:|-)?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\s+de\s+[a-z]+(\s+de\s+\d{4})?)/g,
    ' ',
  );
}

export function extrairDataAlvo(pergunta: string, hoje: DataCivil): DataAlvo | null {
  const original = String(pergunta || '');
  if (!original.trim()) return null;

  const texto = removerDatasDeNascimento(normalizarTexto(original));

  const criar = (data: DataCivil, expressao: string): DataAlvo | null => {
    if (!dataValida(data)) return null;
    const dias = diferencaDias(hoje, data);
    if (dias < 0 || dias > 3660) return null;
    let descricao: string;
    if (dias === 0) descricao = 'hoje';
    else if (dias === 1) descricao = 'amanhã';
    else if (dias === 2) descricao = 'depois de amanhã';
    else descricao = `daqui a ${dias} dias`;
    return { data, diasAPartirDeHoje: dias, expressao, descricao: `${descricao} (${dataPorExtenso(data)})` };
  };

  // 1. Datas explícitas: 15/11, 15/11/2026, 2026-11-15
  let m = texto.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m) {
    const r = criar({ ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) }, m[0]);
    if (r) return r;
  }
  const reDataBarra = /\b(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?\b/g;
  let md: RegExpExecArray | null;
  while ((md = reDataBarra.exec(texto))) {
    const dia = Number(md[1]);
    const mes = Number(md[2]);
    let ano = md[3] ? Number(md[3]) : hoje.ano;
    if (ano < 100) ano += 2000;
    let data = { ano, mes, dia };
    if (!md[3] && dataValida(data) && diferencaDias(hoje, data) < 0) data = { ano: ano + 1, mes, dia };
    const r = criar(data, md[0]);
    if (r) return r;
  }

  // 2. "15 de novembro", "dia 3 de dezembro de 2026"
  const reExtenso = new RegExp(`\\b(?:dia\\s+)?(\\d{1,2})\\s+de\\s+(${MESES_NORMALIZADOS.join('|')})(?:\\s+de\\s+(\\d{4}))?\\b`);
  m = texto.match(reExtenso);
  if (m) {
    const mes = MESES_NORMALIZADOS.indexOf(m[2]) + 1;
    let data = { ano: m[3] ? Number(m[3]) : hoje.ano, mes, dia: Number(m[1]) };
    if (!m[3] && dataValida(data) && diferencaDias(hoje, data) < 0) data = { ...data, ano: data.ano + 1 };
    const r = criar(data, m[0]);
    if (r) return r;
  }

  // 3. Relativos
  if (/\bdepois\s+de\s+amanha\b/.test(texto)) return criar(somarDias(hoje, 2), 'depois de amanhã');
  if (/\bamanha\b/.test(texto)) return criar(somarDias(hoje, 1), 'amanhã');

  m = texto.match(
    /\b(?:daqui\s+(?:a\s+)?|em\s+|dentro\s+de\s+|apos\s+|depois\s+de\s+)(\d{1,3}|[a-z]+)\s+(dias?|semanas?|mes|meses|anos?)\b/,
  );
  if (m) {
    const n = lerNumero(m[1]);
    if (n !== null && n > 0) {
      const unidade = m[2];
      let data: DataCivil;
      if (unidade.startsWith('dia')) data = somarDias(hoje, n);
      else if (unidade.startsWith('semana')) data = somarDias(hoje, n * 7);
      else if (unidade.startsWith('mes')) data = somarMeses(hoje, n);
      else data = somarMeses(hoje, n * 12);
      const r = criar(data, m[0]);
      if (r) return r;
    }
  }

  if (/\b(semana\s+que\s+vem|proxima\s+semana)\b/.test(texto)) return criar(somarDias(hoje, 7), 'semana que vem');
  if (/\b(mes\s+que\s+vem|proximo\s+mes)\b/.test(texto)) return criar(somarMeses(hoje, 1), 'mês que vem');
  if (/\b(ano\s+que\s+vem|proximo\s+ano)\b/.test(texto)) return criar(somarMeses(hoje, 12), 'ano que vem');

  if (/\b(fim|final)\s+de\s+semana\b/.test(texto)) {
    const atual = diaSemanaDe(hoje);
    const ate = (6 - atual + 7) % 7;
    return criar(somarDias(hoje, ate), 'fim de semana');
  }

  // 4. Dias da semana
  for (const [re, indice] of DIAS_SEMANA_REGEX) {
    const encontrado = texto.match(re);
    if (!encontrado) continue;
    const trecho = texto.slice(Math.max(0, (encontrado.index || 0) - 20), (encontrado.index || 0) + encontrado[0].length + 12);
    const atual = diaSemanaDe(hoje);
    let ate = (indice - atual + 7) % 7;
    const proxima = /(proxim[oa]|que\s+vem)/.test(trecho);
    if (proxima && ate === 0) ate = 7;
    return criar(somarDias(hoje, ate), encontrado[0]);
  }

  // 5. "dia 15"
  m = texto.match(/\bdia\s+(\d{1,2})\b/);
  if (m) {
    const dia = Number(m[1]);
    let data = { ano: hoje.ano, mes: hoje.mes, dia };
    if (!dataValida(data) || diferencaDias(hoje, data) < 0) data = { ...somarMeses({ ...hoje, dia: 1 }, 1), dia };
    const r = criar(data, m[0]);
    if (r) return r;
  }

  // 6. "hoje", "hoje à noite", "agora"
  if (/\b(hoje|hj|esta\s+noite|essa\s+noite|agora\s+a\s+(tarde|noite))\b/.test(texto)) return criar(hoje, 'hoje');

  return null;
}

// ---------------------------------------------------------------------------
// Contexto completo + bloco para o prompt
// ---------------------------------------------------------------------------

export function construirContextoTemporal(params: {
  pergunta?: string;
  dataNascimento?: string | null;
  fusoHorario?: string;
  agora?: Date;
}): ContextoTemporal {
  const agora = obterMomentoAtual(params.agora || new Date(), params.fusoHorario || FUSO_PADRAO);
  const hoje: DataCivil = { ano: agora.ano, mes: agora.mes, dia: agora.dia };
  const nascimento = interpretarDataNascimento(params.dataNascimento);

  const energiaHoje = calcularEnergiaDoDia(hoje, nascimento);
  const dataAlvo = extrairDataAlvo(params.pergunta || '', hoje);
  const energiaDataAlvo = dataAlvo && dataAlvo.diasAPartirDeHoje > 0 ? calcularEnergiaDoDia(dataAlvo.data, nascimento) : null;

  return { agora, energiaHoje, dataAlvo, energiaDataAlvo };
}

function linhasEnergia(e: EnergiaDoDia): string {
  return [
    `• Regente planetário: ${e.regentePlanetario} — ${e.qualidadePlanetaria}`,
    `• Orixá regente do dia: ${e.orixaRegente}`,
    `• Lua: ${e.faseLua} (${e.iluminacaoLua}% iluminada) — ${e.qualidadeLua}`,
    `• Vibração universal do dia: ${e.numeroUniversal}`,
    e.numeroPessoal
      ? `• Dia pessoal do consulente: ${e.numeroPessoal} — ${e.qualidadeNumeroPessoal}`
      : null,
    e.dataEspecial ? `• Data especial: ${e.dataEspecial}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatarContextoTemporalParaPrompt(ctx: ContextoTemporal): string {
  const { agora, energiaHoje, dataAlvo, energiaDataAlvo } = ctx;
  const blocos: string[] = [];

  blocos.push(
    `MOMENTO REAL DA CONSULTA (relógio do site)\n` +
      `• Agora: ${agora.dataPorExtenso}, ${agora.horaFormatada} (${agora.periodo}, horário de Brasília/${agora.fusoHorario})\n` +
      `• Saudação correta para este horário: "${agora.saudacao}"\n` +
      `• Ano corrente: ${agora.ano}\n` +
      `• Amanhã será ${dataPorExtenso(somarDias(agora, 1))}\n\n` +
      `ENERGIA DO DIA EM QUE O JOGO ESTÁ SENDO ABERTO\n${linhasEnergia(energiaHoje)}`,
  );

  if (dataAlvo) {
    if (energiaDataAlvo) {
      blocos.push(
        `DIA DO ACONTECIMENTO CITADO NA PERGUNTA\n` +
          `• O consulente falou de "${dataAlvo.expressao}" = ${dataAlvo.descricao}\n` +
          linhasEnergia(energiaDataAlvo),
      );
    } else {
      blocos.push(`DIA DO ACONTECIMENTO CITADO NA PERGUNTA\n• É hoje mesmo (${agora.dataPorExtenso}).`);
    }
  }

  blocos.push(
    `COMO USAR O TEMPO NA LEITURA\n` +
      `• Combine: dados natal do consulente + energia do dia em que o jogo foi aberto${dataAlvo ? ' + energia do dia do acontecimento' : ''} + o que o oráculo mostrou.\n` +
      `• Se houver dia do acontecimento, diga com naturalidade como aquele dia (e o horário, se ele perguntar) favorece ou pede cuidado.\n` +
      `• Nunca invente outra data. Se falar de "amanhã", "sexta" etc., use exatamente as datas acima.`,
  );

  return blocos.join('\n\n');
}

/** Gera uma chave de tiragem só com dígitos (não interfere na detecção de tema). */
export function gerarChaveTiragem(agora: MomentoAtual, aleatorio: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${agora.ano}${pad(agora.mes)}${pad(agora.dia)}${pad(agora.hora)}${pad(agora.minuto)}${Math.abs(Math.trunc(aleatorio)) % 1000000000}`;
}
