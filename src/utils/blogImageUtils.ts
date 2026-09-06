import React from 'react';

/**
 * Mapeamento canônico de imagens temáticas locais em alta definição para cada categoria oracular.
 * Garante que NENHUM post fique sem imagem, mesmo offline ou em caso de falha de rede/CDNs externas.
 */
export const BLOG_CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  tarot: '/blog/tarot-arcanos.svg',
  cigano: '/blog/baralho-cigano.svg',
  'baralho-cigano': '/blog/baralho-cigano.svg',
  lenormand: '/blog/baralho-cigano.svg',
  mesaradionica: '/blog/mesa-radionica.svg',
  'mesa-radionica': '/blog/mesa-radionica.svg',
  buzios: '/blog/jogo-buzios.svg',
  'jogo-buzios': '/blog/jogo-buzios.svg',
  ifa: '/blog/jogo-buzios.svg',
  astrologia: '/blog/astrologia-mapa.svg',
  'mapa-astral': '/blog/astrologia-mapa.svg',
  limpeza: '/blog/limpeza-espiritual.svg',
  espiritualidade: '/blog/limpeza-espiritual.svg',
  runas: '/blog/default-spiritual.svg',
  anjos: '/blog/default-spiritual.svg',
  numerologia: '/blog/astrologia-mapa.svg',
  videncia: '/blog/default-spiritual.svg',
  default: '/blog/default-spiritual.svg',
};

/**
 * Normaliza e sanitiza a categoria oracular para busca da imagem adequada.
 */
export function normalizeBlogCategory(category?: string): string {
  if (!category) return 'default';
  const clean = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (clean.includes('tarot')) return 'tarot';
  if (clean.includes('cigano') || clean.includes('lenormand')) return 'cigano';
  if (clean.includes('radionica') || clean.includes('radiestesia') || clean.includes('pendulo')) return 'mesaradionica';
  if (clean.includes('buzio') || clean.includes('ifa') || clean.includes('orixa')) return 'buzios';
  if (clean.includes('astro') || clean.includes('signo') || clean.includes('planeta')) return 'astrologia';
  if (clean.includes('limpeza') || clean.includes('banho') || clean.includes('protecao')) return 'limpeza';
  if (clean.includes('runa')) return 'runas';
  if (clean.includes('anjo') || clean.includes('cabala')) return 'anjos';
  if (clean.includes('numero')) return 'numerologia';
  return 'default';
}

/**
 * Retorna uma URL de imagem 100% segura e garantida para o artigo.
 * Se a imagem original não existir ou for vazia, retorna a arte vetorial temática correspondente.
 */
export function getSafeBlogImage(coverImage?: string | null, category?: string): string {
  if (coverImage && typeof coverImage === 'string' && coverImage.trim().length > 4) {
    return coverImage.trim();
  }
  const key = normalizeBlogCategory(category);
  return BLOG_CATEGORY_FALLBACK_IMAGES[key] || BLOG_CATEGORY_FALLBACK_IMAGES.default;
}

/**
 * Manipulador de evento de erro para tags <img>.
 * Se a imagem falhar ao carregar (Unsplash offline, link quebrado, etc.),
 * substitui imediatamente pelo SVG local de altíssima definição sem loops.
 */
export function handleBlogImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string
): void {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === 'true') {
    // Se o próprio fallback falhar (caso extremo), usa o default espiritual
    if (target.src !== BLOG_CATEGORY_FALLBACK_IMAGES.default) {
      target.src = BLOG_CATEGORY_FALLBACK_IMAGES.default;
    }
    return;
  }
  target.dataset.fallbackApplied = 'true';
  const key = normalizeBlogCategory(category);
  target.src = BLOG_CATEGORY_FALLBACK_IMAGES[key] || BLOG_CATEGORY_FALLBACK_IMAGES.default;
}
