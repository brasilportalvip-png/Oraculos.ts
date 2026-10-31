/**
 * ORACULOS.TS — Identidade anti-abuso de cupons e bônus
 *
 * Impede que a mesma pessoa crie várias contas para reaproveitar cupons e
 * bônus. Além do ID da conta, o uso é contado por:
 *  - aparelho (identificador persistente enviado pelo navegador);
 *  - identidade natal (nome completo de nascimento + data de nascimento);
 *  - e-mail canônico (Gmail sem pontos e sem +apelido);
 *  - rede/IP (com tolerância maior por causa de redes compartilhadas).
 * Tudo é guardado apenas como hash — nenhum dado pessoal em texto puro.
 */
import crypto from 'crypto';

export interface CouponIdentityInput {
  ip?: string | null;
  deviceId?: string | null;
  birthFullName?: string | null;
  birthDate?: string | null;
  email?: string | null;
}

/** Quantas vezes mais a mesma rede pode usar o cupom (redes de celular/condomínio são compartilhadas). */
export const IP_TOLERANCE_MULTIPLIER = 3;

function hash(valor: string): string {
  const segredo = process.env.COUPON_IDENTITY_SALT || 'oraculos-ts-coupon-identity';
  return crypto.createHmac('sha256', segredo).update(valor).digest('hex').slice(0, 32);
}

function normalizarTexto(valor: string): string {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizarData(valor: string): string {
  const texto = String(valor || '').trim();
  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const br = texto.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (br) return `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  return '';
}

export function canonicalEmail(email: string): string {
  const [local, dominio] = String(email || '').trim().toLowerCase().split('@');
  if (!local || !dominio) return '';
  const semApelido = local.split('+')[0];
  if (dominio === 'gmail.com' || dominio === 'googlemail.com') {
    return `${semApelido.replace(/\./g, '')}@gmail.com`;
  }
  return `${semApelido}@${dominio}`;
}

function ipPublico(ip: string): string {
  const limpo = String(ip || '').replace(/^::ffff:/, '').trim();
  if (!limpo || limpo === '::1' || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(limpo)) return '';
  return limpo;
}

export function buildCouponIdentityKeys(input: CouponIdentityInput): string[] {
  const chaves: string[] = [];

  const device = String(input.deviceId || '').trim();
  if (/^[A-Za-z0-9_-]{16,128}$/.test(device)) chaves.push(`dev_${hash(`dev:${device}`)}`);

  const nome = normalizarTexto(input.birthFullName || '');
  const data = normalizarData(input.birthDate || '');
  if (nome.split(' ').length >= 2 && data) chaves.push(`natal_${hash(`natal:${nome}|${data}`)}`);

  const email = canonicalEmail(input.email || '');
  if (email) chaves.push(`mail_${hash(`mail:${email}`)}`);

  const ip = ipPublico(input.ip || '');
  if (ip) chaves.push(`ip_${hash(`ip:${ip}`)}`);

  return chaves;
}

/**
 * Retorna a primeira identidade que já atingiu o limite do cupom, ou null.
 */
export function findExceededCouponIdentity(
  identityUsesCount: Record<string, number> | undefined | null,
  keys: string[],
  maxUsesPerUser: number,
): string | null {
  const usos = identityUsesCount || {};
  const limite = Math.max(1, Number(maxUsesPerUser || 1));
  for (const chave of keys) {
    const atual = Number(usos[chave] || 0);
    const limiteChave = chave.startsWith('ip_') ? limite * IP_TOLERANCE_MULTIPLIER : limite;
    if (atual >= limiteChave) return chave;
  }
  return null;
}

export function incrementCouponIdentities(
  identityUsesCount: Record<string, number> | undefined | null,
  keys: string[],
): Record<string, number> {
  const resultado: Record<string, number> = { ...(identityUsesCount || {}) };
  for (const chave of keys) {
    if (typeof chave === 'string' && /^(dev|natal|mail|ip)_[a-f0-9]{32}$/.test(chave)) {
      resultado[chave] = Number(resultado[chave] || 0) + 1;
    }
  }
  return resultado;
}
