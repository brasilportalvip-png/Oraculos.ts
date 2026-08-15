import React, { useEffect, useMemo } from 'react';
import { SITE_ORIGIN } from '../routing/routes';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article' | 'profile' | string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function absoluteUrl(value: string): string {
  try {
    return new URL(value, SITE_ORIGIN).toString();
  } catch {
    return `${SITE_ORIGIN}/`;
  }
}

function canonicalUrlFromPath(path: string): string {
  const url = new URL(path || '/', SITE_ORIGIN);
  url.search = '';
  url.hash = '';
  return url.toString();
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = `${SITE_ORIGIN}/brand/logo-oraculos.png`,
  ogImageAlt = 'ORACULOS.TS — consultas oraculares online',
  noIndex = false,
  jsonLd,
}) => {
  const fullCanonicalUrl = useMemo(() => canonicalUrlFromPath(canonicalPath), [canonicalPath]);
  const fullImageUrl = useMemo(() => absoluteUrl(ogImage), [ogImage]);
  const fullTitle = title.toUpperCase().includes('ORACULOS.TS') ? title : `${title} | ORACULOS.TS`;
  const robots = noIndex
    ? 'noindex, nofollow, noarchive, nosnippet'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  useEffect(() => {
    document.title = fullTitle;
    document.documentElement.lang = 'pt-BR';

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', robots);
    setMeta('meta[name="googlebot"]', 'name', 'googlebot', robots);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullCanonicalUrl;

    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'pt_BR');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'ORACULOS.TS');
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMeta('meta[property="og:image"]', 'property', 'og:image', fullImageUrl);
    setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', fullImageUrl);
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', ogImageAlt);

    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', fullImageUrl);
    setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', ogImageAlt);

    const previousJsonLd = document.head.querySelector<HTMLScriptElement>('#dynamic-jsonld');
    if (jsonLd) {
      const script = previousJsonLd ?? document.createElement('script');
      script.id = 'dynamic-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
      if (!previousJsonLd) document.head.appendChild(script);
    } else {
      previousJsonLd?.remove();
    }

    return () => {
      document.head.querySelector<HTMLScriptElement>('#dynamic-jsonld')?.remove();
    };
  }, [description, fullCanonicalUrl, fullImageUrl, fullTitle, jsonLd, ogImageAlt, ogType, robots]);

  return null;
};
