import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { gerarPaginasPublicas, montarHtmlDaPagina, gerarSitemaps } from '../src/seo/paginasPublicas';
import { parseMarkdown, markdownParaHtml, linkSeguro } from '../src/utils/markdown';
import { getDailyBlogPosts } from '../src/data/blogData';
import { BLOG_PILLAR_POSTS } from '../src/data/blogPillarPosts';

const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');

describe('V10 — Páginas prontas para Google e Bing', () => {
  const paginas = gerarPaginasPublicas();

  it('gera todas as páginas públicas (início, listas, 10 oráculos, especialistas, blog, institucionais, legais)', () => {
    const caminhos = paginas.map((p) => p.caminho);
    for (const c of ['/', '/oraculos', '/especialistas', '/oraculos/tarot', '/oraculos/mesa-radionica', '/especialistas/c1', '/especialistas/ai_c1', '/blog', '/blog/tarot-sim-ou-nao', '/termos', '/privacidade', '/reembolso', '/como-funciona']) {
      expect(caminhos, c).toContain(c);
    }
    expect(new Set(caminhos).size).toBe(caminhos.length);
  });

  it('cada página tem título 30–60, descrição 120–156, um H1, canonical próprio e JSON-LD válido', () => {
    for (const p of paginas) {
      const html = montarHtmlDaPagina(template, p);
      const titulo = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
      const descricao = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
      const decod = (t: string) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      expect(decod(titulo).length, `${p.caminho} título`).toBeGreaterThanOrEqual(30);
      expect(decod(titulo).length, `${p.caminho} título`).toBeLessThanOrEqual(60);
      expect(decod(descricao).length, `${p.caminho} descrição`).toBeGreaterThanOrEqual(120);
      expect(decod(descricao).length, `${p.caminho} descrição`).toBeLessThanOrEqual(156);
      expect((html.match(/<h1/g) || []).length, `${p.caminho} h1`).toBe(1);
      expect((html.match(/rel="canonical"/g) || []).length, `${p.caminho} canonical`).toBe(1);
      expect(html, p.caminho).toContain(`<link rel="canonical" href="https://oraculos-ts.vercel.app${p.caminho}" />`);
      for (const bloco of html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || []) {
        JSON.parse(bloco.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''));
      }
      expect(html).not.toMatch(/simb[oó]lic/i);
    }
  });

  it('a página de um oráculo tem texto real para o robô (não é HTML vazio)', () => {
    const tarot = paginas.find((p) => p.caminho === '/oraculos/tarot')!;
    const texto = tarot.corpoHtml.replace(/<[^>]+>/g, ' ');
    expect(texto.length).toBeGreaterThan(1500);
    expect(texto.toLowerCase()).toContain('tarot online');
  });

  it('sitemaps saem da mesma fonte e trazem as páginas novas', () => {
    const s = gerarSitemaps(paginas);
    expect(s['sitemap.xml']).toContain('sitemap-blog.xml');
    expect(s['sitemap-blog.xml']).toContain('https://oraculos-ts.vercel.app/blog/significado-das-cartas-do-baralho-cigano');
    expect(s['sitemap-static.xml']).toContain('<loc>https://oraculos-ts.vercel.app/termos</loc>');
    expect(s['sitemap.txt'].trim().split('\n').length).toBe(paginas.length);
  });
});

describe('V10 — Blog', () => {
  it('artigos usam datas reais (não "hoje" falso)', () => {
    const posts = getDailyBlogPosts();
    const portal = posts.find((p) => p.slug === 'portal-do-tarot-2026')!;
    expect(portal.publishedAt).toBe('2026-09-05T08:00:00.000Z');
    expect(portal.date).not.toMatch(/Hoje|Ontem/);
  });

  it('6 artigos-pilar com palavra-chave no título, na descrição e no começo do texto', () => {
    expect(BLOG_PILLAR_POSTS).toHaveLength(6);
    for (const p of BLOG_PILLAR_POSTS) {
      const chave = p.focusKeyword!.toLowerCase();
      expect(p.title.toLowerCase(), p.slug).toContain(chave);
      expect(p.seoDescription!.toLowerCase(), p.slug).toContain(chave);
      expect(p.content.toLowerCase().slice(0, 400), p.slug).toContain(chave);
      expect(p.seoDescription!.length, p.slug).toBeLessThanOrEqual(156);
      expect(p.seoDescription!.length, p.slug).toBeGreaterThanOrEqual(120);
      expect(p.content, p.slug).toMatch(/\]\(\/oraculos\//);
    }
  });

  it('markdown vira HTML de verdade e bloqueia links perigosos', () => {
    const html = markdownParaHtml('# Título\n\nTexto **forte** e [link](/oraculos/tarot).\n\n- um\n- dois\n\n> citação');
    expect(html).toContain('<h2>Título</h2>');
    expect(html).toContain('<strong>forte</strong>');
    expect(html).toContain('<a href="/oraculos/tarot">link</a>');
    expect(html).toContain('<ul><li>um</li><li>dois</li></ul>');
    expect(html).toContain('<blockquote>');
    expect(linkSeguro('javascript:alert(1)')).toBeNull();
    expect(markdownParaHtml('[x](javascript:alert(1))')).not.toContain('javascript');
    expect(markdownParaHtml('<script>alert(1)</script>')).toContain('&lt;script&gt;');
    expect(parseMarkdown('| a | b |\n|---|---|\n| 1 | 2 |')[0].tipo).toBe('tabela');
  });
});
