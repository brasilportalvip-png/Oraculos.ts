import type React from 'react';

export const DEFAULT_CONSULTANT_AVATAR = '/brand/logo-oraculos.png?v=20260831';
export const DEFAULT_FEMALE_AVATAR = '/consultants/aura-celeste.webp';
export const DEFAULT_MALE_AVATAR = '/consultants/guilherme-solis.webp';
export const DEFAULT_USER_AVATAR = '/brand/logo-oraculos.png?v=20260831';

/**
 * Retorna o avatar fallback apropriado respeitando o gênero do consultor
 * para que perfis masculinos nunca recebam fotos femininas em erros de carregamento.
 */
export function getGenderAwareAvatarFallback(name?: string, genderHint?: 'male' | 'female'): string {
  if (genderHint === 'male') return DEFAULT_MALE_AVATAR;
  if (genderHint === 'female') return DEFAULT_FEMALE_AVATAR;
  if (!name || typeof name !== 'string') return DEFAULT_CONSULTANT_AVATAR;
  const lower = name.toLowerCase();
  if (
    lower.startsWith('mestre ') ||
    lower.startsWith('guardião ') ||
    lower.startsWith('guardiao ') ||
    lower.startsWith('sábio ') ||
    lower.startsWith('sabio ') ||
    lower.startsWith('pai ') ||
    lower.startsWith('irmão ') ||
    lower.startsWith('irmao ') ||
    lower.startsWith('curador ') ||
    lower.includes('guilherme') ||
    lower.includes('gabriel') ||
    lower.includes('valerio') ||
    lower.includes('valério') ||
    lower.includes('yanis') ||
    lower.includes('kaelen') ||
    lower.includes('samuel') ||
    lower.includes('alexandre') ||
    lower.includes('zahir') ||
    lower.includes('rowan') ||
    lower.includes('dante') ||
    lower.includes('liam') ||
    lower.includes('flavio') ||
    lower.includes('flávio') ||
    lower.includes('lucas') ||
    lower.includes('marcos') ||
    lower.includes('carlos') ||
    lower.includes('rafael') ||
    lower.includes('diego') ||
    lower.includes('pedro') ||
    lower.includes('rodrigo') ||
    lower.includes('bruno') ||
    lower.includes('felipe') ||
    lower.includes('thiago') ||
    lower.includes('tiago') ||
    lower.includes('leonardo') ||
    lower.includes('victor') ||
    lower.includes('vitor') ||
    lower.includes('andré') ||
    lower.includes('andre')
  ) {
    return DEFAULT_MALE_AVATAR;
  }
  if (
    lower.startsWith('mãe ') ||
    lower.startsWith('mae ') ||
    lower.startsWith('mestra ') ||
    lower.startsWith('guardiã ') ||
    lower.startsWith('guardia ') ||
    lower.startsWith('mística ') ||
    lower.startsWith('mistica ') ||
    lower.startsWith('cigana ') ||
    lower.startsWith('sacerdotisa ') ||
    lower.startsWith('irmã ') ||
    lower.startsWith('irma ') ||
    lower.includes('aura') ||
    lower.includes('soraya') ||
    lower.includes('iara') ||
    lower.includes('livia') ||
    lower.includes('lívia') ||
    lower.includes('nadja') ||
    lower.includes('naiara') ||
    lower.includes('anya') ||
    lower.includes('helena') ||
    lower.includes('clarice') ||
    lower.includes('vânia') ||
    lower.includes('vania') ||
    lower.includes('serena') ||
    lower.includes('maria') ||
    lower.includes('ana') ||
    lower.includes('julia') ||
    lower.includes('júlia') ||
    lower.includes('clara') ||
    lower.includes('beatriz') ||
    lower.includes('camila') ||
    lower.includes('carolina') ||
    lower.includes('larissa') ||
    lower.includes('mariana') ||
    lower.includes('fernanda') ||
    lower.includes('leticia') ||
    lower.includes('letícia') ||
    lower.includes('aline') ||
    lower.includes('amanda') ||
    lower.includes('patricia') ||
    lower.includes('patrícia') ||
    lower.includes('luana') ||
    lower.includes('renata') ||
    lower.includes('bruna') ||
    lower.includes('jessica') ||
    lower.includes('vanessa')
  ) {
    return DEFAULT_FEMALE_AVATAR;
  }
  return DEFAULT_CONSULTANT_AVATAR;
}

/**
 * Retorna uma URL segura de avatar para o consultor,
 * fornecendo um fallback padrão se o valor for nulo ou vazio.
 */
export function getSafeConsultantAvatar(avatar?: string | null, nameFallback?: string): string {
  if (!avatar || typeof avatar !== 'string' || !avatar.trim()) {
    return getGenderAwareAvatarFallback(nameFallback);
  }
  return avatar.trim();
}

/**
 * Event handler para o evento onError de tags <img>,
 * garantindo substituição resiliente caso qualquer URL externa falhe.
 */
export function handleAvatarError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback?: string
): void {
  const target = event.currentTarget;
  if (!target.dataset.fallbackApplied) {
    target.dataset.fallbackApplied = 'true';
    target.src = fallback || DEFAULT_CONSULTANT_AVATAR;
  }
}
