/**
 * ORACULOS.TS — Corrige vulnerabilidades de dependências de produção
 * (exigido pelo "Production dependency security gate" do CI).
 *
 * - firebase-admin: sobe para a versão 14.x mais nova (corrige a cadeia uuid/@google-cloud/storage).
 * - @grpc/grpc-js: força a versão 1.x mais nova via "overrides" (o @firebase/firestore
 *   ainda pede ~1.9.0, que é vulnerável e não recebe mais correção).
 * Depois o instalador roda "npm install" + "npm audit fix" e confere o resultado.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function versoes(pacote) {
  const saida = execSync(`npm view ${pacote} versions --json`, { encoding: 'utf8' });
  const lista = JSON.parse(saida);
  return (Array.isArray(lista) ? lista : [lista]).filter((v) => /^\d+\.\d+\.\d+$/.test(v));
}

function maisNova(lista, prefixo) {
  const filtradas = lista.filter((v) => v.startsWith(prefixo));
  const ordenar = (v) => v.split('.').map(Number);
  filtradas.sort((a, b) => {
    const [x, y] = [ordenar(a), ordenar(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });
  return filtradas[filtradas.length - 1];
}

const arquivo = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(arquivo, 'utf8'));

// Versão mais nova dentro da MESMA versão principal usada hoje (sem quebrar nada).
const OVERRIDES = {
  '@grpc/grpc-js': '1.',
  '@fastify/busboy': '3.',
  'body-parser': '1.',
  'proxy-addr': '2.',
  qs: '6.',
  'source-map-js': '1.',
  'brace-expansion': '2.',
};

const admin = maisNova(versoes('firebase-admin'), '14.');
const vite = maisNova(versoes('vite'), '6.');
if (!admin || !vite) {
  console.error('Não foi possível consultar as versões no npm.');
  process.exit(1);
}

pkg.dependencies['firebase-admin'] = admin;
pkg.dependencies.vite = `^${vite}`;
if (pkg.devDependencies && pkg.devDependencies.vite) pkg.devDependencies.vite = `^${vite}`;

pkg.overrides = { ...(pkg.overrides || {}) };
for (const [pacote, major] of Object.entries(OVERRIDES)) {
  const versao = maisNova(versoes(pacote), major);
  if (!versao) {
    console.error(`Não foi possível consultar ${pacote}.`);
    process.exit(1);
  }
  pkg.overrides[pacote] = `^${versao}`;
}

fs.writeFileSync(arquivo, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`firebase-admin -> ${admin} | vite -> ^${vite}`);
console.log('overrides:', JSON.stringify(pkg.overrides));
