// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEOHead } from '../src/components/SEOHead';
import { Footer } from '../src/components/Footer';
import { hasRouteAccess } from '../src/components/RouteAccessGuard';
import {
  canonicalOracleSlug,
  canonicalPathForRoute,
  oracleTypeFromSlug,
  parseRouteLocation,
  resolveNavigationTarget,
} from '../src/routing/routes';

afterEach(() => {
  cleanup();
  document.head.querySelector('#dynamic-jsonld')?.remove();
});

describe('roteamento público canônico', () => {
  it('mapeia os 10 tipos internos para slugs públicos canônicos', () => {
    expect(canonicalOracleSlug('tarot')).toBe('tarot');
    expect(canonicalOracleSlug('cigano')).toBe('baralho-cigano');
    expect(canonicalOracleSlug('iching')).toBe('i-ching');
    expect(canonicalOracleSlug('mesaradionica')).toBe('mesa-radionica');
    expect(oracleTypeFromSlug('baralho-cigano')).toBe('cigano');
    expect(oracleTypeFromSlug('i-ching')).toBe('iching');
    expect(oracleTypeFromSlug('mesa-radionica')).toBe('mesaradionica');
  });

  it('normaliza aliases sem criar conteúdo duplicado', () => {
    expect(parseRouteLocation('/oraculos/cigano')).toEqual({
      view: 'oracleDetail',
      param: 'baralho-cigano',
    });
    expect(parseRouteLocation('/oraculos/iching')).toEqual({
      view: 'oracleDetail',
      param: 'i-ching',
    });
    expect(parseRouteLocation('/lgpd')).toEqual({ view: 'legal', param: 'privacidade' });
    expect(parseRouteLocation('/artigos/portal-do-tarot-2026')).toEqual({
      view: 'articleDetail',
      param: 'portal-do-tarot-2026',
    });
  });

  it('rejeita identificadores vazios, caminhos aninhados e oráculos inexistentes', () => {
    expect(parseRouteLocation('/oraculos/oraculo-falso')).toEqual({ view: 'notFound' });
    expect(parseRouteLocation('/especialistas/')).toEqual({ view: 'oracles' });
    expect(parseRouteLocation('/especialistas/c1/detalhes')).toEqual({ view: 'notFound' });
    expect(parseRouteLocation('/blog/post/subpagina')).toEqual({ view: 'notFound' });
  });

  it('gera href real e canônico para navegação e recarga direta', () => {
    expect(resolveNavigationTarget('oracles')).toEqual({
      path: '/oraculos',
      route: { view: 'oracles' },
    });
    expect(resolveNavigationTarget('oraculos/cigano')).toEqual({
      path: '/oraculos/baralho-cigano',
      route: { view: 'oracleDetail', param: 'baralho-cigano' },
    });
    expect(resolveNavigationTarget('artigos/portal-do-tarot-2026').path).toBe(
      '/blog/portal-do-tarot-2026'
    );
    expect(canonicalPathForRoute({ view: 'helpAndPrivacy' })).toBe('/ajuda-e-privacidade');
  });
});

describe('proteção dos painéis privados', () => {
  it('bloqueia visitante e separa cliente, consultor e administração por papel', () => {
    expect(hasRouteAccess(false, 'user', ['user', 'client'])).toBe(false);
    expect(hasRouteAccess(true, 'user', ['user', 'client'])).toBe(true);
    expect(hasRouteAccess(true, 'consultant', ['employee', 'consultant'])).toBe(true);
    expect(hasRouteAccess(true, 'user', ['admin', 'superadmin'])).toBe(false);
    expect(hasRouteAccess(true, 'superadmin', ['admin', 'superadmin'])).toBe(true);
  });
});

describe('links públicos rastreáveis', () => {
  it('renderiza href canônico e mantém navegação SPA no clique comum', () => {
    const onNavigate = vi.fn();
    render(<Footer onNavigate={onNavigate} />);

    const ciganoLink = screen.getByRole('link', { name: 'Baralho Cigano (Lenormand)' });
    expect(ciganoLink.getAttribute('href')).toBe('/oraculos/baralho-cigano');

    fireEvent.click(ciganoLink);
    expect(onNavigate).toHaveBeenCalledWith('oraculos/baralho-cigano');
  });
});

describe('SEOHead de produção', () => {
  it('mantém canonical, Open Graph e Twitter sincronizados', async () => {
    render(
      <SEOHead
        title="Tarot Online"
        description="Descrição específica da rota."
        canonicalPath="/oraculos/tarot?utm_source=teste#secao"
        ogImage="/brand/logo-oraculos.png"
        ogImageAlt="Logo oficial"
      />
    );

    await waitFor(() => {
      expect(document.title).toBe('Tarot Online | ORACULOS.TS');
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://oraculos-ts.vercel.app/oraculos/tarot'
      );
      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
        'https://oraculos-ts.vercel.app/oraculos/tarot'
      );
      expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
        'https://oraculos-ts.vercel.app/brand/logo-oraculos.png'
      );
    });
  });

  it('marca painéis e 404 como noindex', async () => {
    render(
      <SEOHead
        title="Administração"
        description="Área privada."
        canonicalPath="/admin"
        noIndex
      />
    );

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex');
      expect(document.querySelector('meta[name="googlebot"]')?.getAttribute('content')).toContain('noindex');
    });
  });

  it('serializa JSON-LD sem permitir fechamento de script injetado', async () => {
    render(
      <SEOHead
        title="Artigo"
        description="Conteúdo público."
        canonicalPath="/blog/artigo"
        jsonLd={{ '@context': 'https://schema.org', name: '</script><script>alert(1)</script>' }}
      />
    );

    await waitFor(() => {
      const jsonLd = document.querySelector('#dynamic-jsonld')?.textContent ?? '';
      expect(jsonLd).toContain('\\u003c/script>');
      expect(jsonLd).not.toContain('</script>');
    });
  });
});
