import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = 'https://oraculos-ts.vercel.app/brand/logo-oraculos.png',
  jsonLd,
}) => {
  const fullCanonicalUrl = `https://oraculos-ts.vercel.app${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | ORACULOS.TS`;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. Update OpenGraph Tags
    const setMetaProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaProperty('og:title', `${title} | ORACULOS.TS`);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', fullCanonicalUrl);
    setMetaProperty('og:type', ogType);
    setMetaProperty('og:image', ogImage);

    // 5. Update Twitter Tags
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', `${title} | ORACULOS.TS`);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', ogImage);

    // 6. JSON-LD Structured Data
    if (jsonLd) {
      let scriptTag = document.querySelector('#dynamic-jsonld') as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, fullCanonicalUrl, ogType, ogImage, jsonLd]);

  return null;
};
