/** Regenera os sitemaps em public/ a partir da fonte única (npm run seo:sitemaps). */
import fs from 'fs';
import path from 'path';
import { gerarPaginasPublicas, gerarSitemaps } from '../src/seo/paginasPublicas';

const paginas = gerarPaginasPublicas();
for (const [arquivo, conteudo] of Object.entries(gerarSitemaps(paginas))) {
  fs.writeFileSync(path.resolve('public', arquivo), conteudo);
}
console.log(`${paginas.length} páginas no sitemap.`);
