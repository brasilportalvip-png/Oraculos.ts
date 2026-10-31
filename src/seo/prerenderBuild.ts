/**
 * Executado no build (scripts/build.cjs): grava uma página HTML pronta para cada
 * endereço público em dist/public/<caminho>/index.html e gera os sitemaps.
 */
import fs from 'fs';
import path from 'path';
import { gerarPaginasPublicas, montarHtmlDaPagina, gerarSitemaps } from './paginasPublicas';

export function preRenderizar(pastaPublica: string, pastaFonteSitemaps?: string): { paginas: number; sitemaps: string[] } {
  const template = fs.readFileSync(path.join(pastaPublica, 'index.html'), 'utf8');
  const paginas = gerarPaginasPublicas();

  for (const pagina of paginas) {
    const html = montarHtmlDaPagina(template, pagina);
    const destino =
      pagina.caminho === '/'
        ? path.join(pastaPublica, 'index.html')
        : path.join(pastaPublica, ...pagina.caminho.split('/').filter(Boolean), 'index.html');
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, html);
  }

  const sitemaps = gerarSitemaps(paginas);
  for (const [arquivo, conteudo] of Object.entries(sitemaps)) {
    fs.writeFileSync(path.join(pastaPublica, arquivo), conteudo);
    if (pastaFonteSitemaps) fs.writeFileSync(path.join(pastaFonteSitemaps, arquivo), conteudo);
  }

  return { paginas: paginas.length, sitemaps: Object.keys(sitemaps) };
}
