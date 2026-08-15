import React, { useEffect } from 'react';
import { SITE_ORIGIN } from '../routing/routes';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

function resolveAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_ORIGIN;
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_ORIGIN}${cleanPath}`;
}

function sanitizeCanonicalUrl(pathOrUrl: string): string {
  const full = resolveAbsoluteUrl(pathOrUrl);
  try {
    const parsed = new URL(full);
    return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '') || '/'}`;
  } catch {
    return full.split('?')[0].split('#')[0];
  }
}

function setOrCreateMeta(selector: string, attrName: string, attrValue: string, content: string) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = '/brand/logo-oraculos.png',
  ogImageAlt = 'ORACULOS.TS — Portal Sagrado de Consultas Oraculares',
  noIndex = false,
  jsonLd,
}) => {
  const fullCanonicalUrl = sanitizeCanonicalUrl(canonicalPath);
  const fullImageUrl = resolveAbsoluteUrl(ogImage);
  const fullTitle = `${title} | ORACULOS.TS`;

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    // 2. Meta description
    setOrCreateMeta('meta[name="description"]', 'name', 'description', description);

    // 3. Robots / indexing
    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';
    setOrCreateMeta('meta[name="robots"]', 'name', 'robots', robotsContent);
    setOrCreateMeta('meta[name="googlebot"]', 'name', 'googlebot', robotsContent);

    // 4. Canonical link
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 5. OpenGraph
    setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setOrCreateMeta('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    setOrCreateMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', fullImageUrl);
    if (ogImageAlt) {
      setOrCreateMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', ogImageAlt);
    }

    // 6. Twitter
    setOrCreateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', fullImageUrl);
    if (ogImageAlt) {
      setOrCreateMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', ogImageAlt);
    }

    // 7. JSON-LD structured data (secure against script breakout)
    let scriptTag = document.head.querySelector('#dynamic-jsonld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      const safeJson = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
      scriptTag.textContent = safeJson;
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      const existingScript = document.head.querySelector('#dynamic-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [fullTitle, description, fullCanonicalUrl, ogType, fullImageUrl, ogImageAlt, noIndex, jsonLd]);

  return null;
};
