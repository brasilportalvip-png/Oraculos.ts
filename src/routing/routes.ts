import type { OracleType } from '../types.js';

export const SITE_ORIGIN = 'https://oraculos-ts.vercel.app';

export type PublicView =
  | 'showcase'
  | 'oracles'
  | 'oracleDetail'
  | 'specialistDetail'
  | 'blog'
  | 'articleDetail'
  | 'legal'
  | 'howItWorks'
  | 'helpAndPrivacy'
  | 'clientDashboard'
  | 'consultantDashboard'
  | 'adminDashboard'
  | 'notFound';

export interface ParsedRoute {
  view: PublicView;
  param?: string;
}

export interface NavigationTarget {
  path: string;
  route: ParsedRoute;
}

export const ORACLE_SLUG_BY_TYPE: Record<OracleType, string> = {
  tarot: 'tarot',
  cigano: 'baralho-cigano',
  astrologia: 'astrologia',
  numerologia: 'numerologia',
  buzios: 'buzios',
  ifa: 'ifa',
  runas: 'runas',
  iching: 'i-ching',
  cristais: 'cristais',
  mesaradionica: 'mesa-radionica',
};

const ORACLE_TYPE_BY_SLUG: Record<string, OracleType> = {
  tarot: 'tarot',
  'baralho-cigano': 'cigano',
  cigano: 'cigano',
  astrologia: 'astrologia',
  numerologia: 'numerologia',
  buzios: 'buzios',
  ifa: 'ifa',
  runas: 'runas',
  'i-ching': 'iching',
  iching: 'iching',
  cristais: 'cristais',
  'mesa-radionica': 'mesaradionica',
  mesaradionica: 'mesaradionica',
};

const STATIC_NAVIGATION: Record<string, NavigationTarget> = {
  showcase: { path: '/', route: { view: 'showcase' } },
  oracles: { path: '/oraculos', route: { view: 'oracles' } },
  especialistas: { path: '/especialistas', route: { view: 'oracles' } },
  blog: { path: '/blog', route: { view: 'blog' } },
  howItWorks: { path: '/como-funciona', route: { view: 'howItWorks' } },
  helpAndPrivacy: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
  ajuda: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
  suporte: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
  clientDashboard: { path: '/painel', route: { view: 'clientDashboard' } },
  consultantDashboard: { path: '/painel/consultor', route: { view: 'consultantDashboard' } },
  adminDashboard: { path: '/admin', route: { view: 'adminDashboard' } },
};

const LEGAL_DOCUMENTS = new Set(['termos', 'privacidade', 'cookies', 'reembolso']);

function normalizeSegment(value: string): string {
  try {
    return decodeURIComponent(value).trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  } catch {
    return '';
  }
}

export function oracleTypeFromSlug(value: string): OracleType | null {
  return ORACLE_TYPE_BY_SLUG[normalizeSegment(value)] ?? null;
}

export function canonicalOracleSlug(value: string): string | null {
  const oracleType = oracleTypeFromSlug(value);
  return oracleType ? ORACLE_SLUG_BY_TYPE[oracleType] : null;
}

export function canonicalPathForRoute(route: ParsedRoute): string {
  switch (route.view) {
    case 'showcase':
      return '/';
    case 'oracles':
      return '/oraculos';
    case 'oracleDetail':
      return route.param ? `/oraculos/${route.param}` : '/oraculos';
    case 'specialistDetail':
      return route.param ? `/especialistas/${route.param}` : '/especialistas';
    case 'blog':
      return '/blog';
    case 'articleDetail':
      return route.param ? `/blog/${route.param}` : '/blog';
    case 'legal':
      return route.param ? `/${route.param}` : '/termos';
    case 'howItWorks':
      return '/como-funciona';
    case 'helpAndPrivacy':
      return '/ajuda-e-privacidade';
    case 'clientDashboard':
      return '/painel';
    case 'consultantDashboard':
      return '/painel/consultor';
    case 'adminDashboard':
      return '/admin';
    case 'notFound':
      return '/404';
  }
}

export function parseRouteLocation(pathname: string, hash = ''): ParsedRoute {
  const rawPath = pathname.toLowerCase().replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  const normalizedHash = normalizeSegment(hash.replace(/^#/, ''));

  if (rawPath.startsWith('/oraculos/')) {
    const oracleSlug = canonicalOracleSlug(rawPath.slice('/oraculos/'.length));
    return oracleSlug ? { view: 'oracleDetail', param: oracleSlug } : { view: 'notFound' };
  }
  if (rawPath === '/oraculos') return { view: 'oracles' };

  if (rawPath.startsWith('/especialistas/')) {
    const consultantId = normalizeSegment(rawPath.slice('/especialistas/'.length));
    return consultantId && !consultantId.includes('/')
      ? { view: 'specialistDetail', param: consultantId }
      : { view: 'notFound' };
  }
  if (rawPath === '/especialistas') return { view: 'oracles' };

  if (rawPath.startsWith('/blog/') || rawPath.startsWith('/artigos/')) {
    const prefix = rawPath.startsWith('/blog/') ? '/blog/' : '/artigos/';
    const slug = normalizeSegment(rawPath.slice(prefix.length));
    return slug && !slug.includes('/')
      ? { view: 'articleDetail', param: slug }
      : { view: 'notFound' };
  }
  if (rawPath === '/blog' || rawPath === '/artigos') return { view: 'blog' };

  if (rawPath === '/termos' || normalizedHash === 'termos') return { view: 'legal', param: 'termos' };
  if (rawPath === '/privacidade' || rawPath === '/lgpd' || normalizedHash === 'privacidade' || normalizedHash === 'lgpd') {
    return { view: 'legal', param: 'privacidade' };
  }
  if (rawPath === '/cookies' || normalizedHash === 'cookies') return { view: 'legal', param: 'cookies' };
  if (rawPath === '/reembolso' || rawPath === '/estorno' || normalizedHash === 'reembolso' || normalizedHash === 'estorno') {
    return { view: 'legal', param: 'reembolso' };
  }

  if (rawPath === '/como-funciona' || normalizedHash === 'como-funciona' || normalizedHash === 'howitworks') {
    return { view: 'howItWorks' };
  }
  if (
    rawPath === '/ajuda' ||
    rawPath === '/suporte' ||
    rawPath === '/ajuda-e-privacidade' ||
    normalizedHash === 'ajuda' ||
    normalizedHash === 'suporte'
  ) {
    return { view: 'helpAndPrivacy' };
  }
  if (rawPath === '/painel/consultor' || normalizedHash === 'consultantdashboard') return { view: 'consultantDashboard' };
  if (rawPath === '/painel' || rawPath === '/carteira' || normalizedHash === 'clientdashboard') return { view: 'clientDashboard' };
  if (rawPath === '/admin' || normalizedHash === 'admindashboard') return { view: 'adminDashboard' };
  if (rawPath === '/' && (!normalizedHash || normalizedHash === 'showcase')) return { view: 'showcase' };

  return { view: 'notFound' };
}

export function resolveNavigationTarget(tabOrPath: string): NavigationTarget {
  const value = tabOrPath.trim();

  if (value.startsWith('/')) {
    const route = parseRouteLocation(value);
    return { path: canonicalPathForRoute(route), route };
  }

  if (value.startsWith('oraculos/')) {
    const oracleSlug = canonicalOracleSlug(value.slice('oraculos/'.length));
    if (oracleSlug) return { path: `/oraculos/${oracleSlug}`, route: { view: 'oracleDetail', param: oracleSlug } };
  }

  if (value.startsWith('especialistas/')) {
    const consultantId = normalizeSegment(value.slice('especialistas/'.length));
    if (consultantId && !consultantId.includes('/')) {
      return { path: `/especialistas/${consultantId}`, route: { view: 'specialistDetail', param: consultantId } };
    }
  }

  if (value.startsWith('blog/') || value.startsWith('artigos/')) {
    const prefix = value.startsWith('blog/') ? 'blog/' : 'artigos/';
    const slug = normalizeSegment(value.slice(prefix.length));
    if (slug && !slug.includes('/')) return { path: `/blog/${slug}`, route: { view: 'articleDetail', param: slug } };
  }

  if (LEGAL_DOCUMENTS.has(value)) return { path: `/${value}`, route: { view: 'legal', param: value } };

  return STATIC_NAVIGATION[value] ?? { path: '/404', route: { view: 'notFound' } };
}
