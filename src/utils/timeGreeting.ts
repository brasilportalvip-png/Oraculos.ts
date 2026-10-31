/**
 * Saudação conforme o horário local do consulente (bom dia / boa tarde / boa noite).
 */
export type SaudacaoHorario = 'Bom dia' | 'Boa tarde' | 'Boa noite';

export function saudacaoPorHorario(agora: Date = new Date()): SaudacaoHorario {
  const hora = agora.getHours();
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function primeiroNome(nome: string | undefined | null): string {
  return String(nome || '').trim().split(/\s+/)[0] || '';
}

/** Remove a saudação genérica do início ("Olá!", "Saudações!", "Bem-vindo(a)!") para não duplicar. */
export function removerSaudacaoGenerica(texto: string): string {
  return String(texto || '')
    .replace(/^\s*(ol[aá]|oi|sauda[cç][oõ]es|boas-vindas|bem-vindo\(a\)|bem-vinda|bem-vindo)(?=[\s,!.?])[^!.?]*[!.?]\s*/i, '')
    .trim();
}

export function montarBoasVindas(params: {
  nomeConsulente?: string | null;
  saudacaoAtendente?: string | null;
  oraculo?: string | null;
  agora?: Date;
}): string {
  const saudacao = saudacaoPorHorario(params.agora);
  const nome = primeiroNome(params.nomeConsulente);
  const abertura = nome ? `${saudacao}, ${nome}!` : `${saudacao}!`;
  const fala = removerSaudacaoGenerica(params.saudacaoAtendente || '');
  if (fala) return `${abertura} ${fala}`;
  return `${abertura} Que alegria ter você aqui. O ${String(params.oraculo || 'oráculo')} já está aberto na mesa — me conta o que o seu coração quer saber.`;
}
