/**
 * ORACULOS.TS — Avisa Bing, Yandex, Seznam, Naver (protocolo IndexNow) sobre
 * todas as páginas do site para indexação rápida.
 * Uso (depois do deploy na Vercel):  npm run seo:indexnow
 */
const fs = require('fs');
const path = require('path');

const HOST = 'oraculos-ts.vercel.app';
const KEY = '609e74a4a3ff48431b846c82a54dd86c';

async function main() {
  const lista = fs
    .readFileSync(path.join(__dirname, '..', 'public', 'sitemap.txt'), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const resposta = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: lista,
    }),
  });

  console.log(`IndexNow: ${resposta.status} ${resposta.statusText} — ${lista.length} URLs enviadas.`);
  if (resposta.status >= 400) process.exitCode = 1;
}

main().catch((erro) => {
  console.error('IndexNow falhou:', erro.message);
  process.exitCode = 1;
});
