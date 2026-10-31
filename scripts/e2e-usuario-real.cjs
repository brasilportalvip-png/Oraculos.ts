#!/usr/bin/env node
/**
 * ORACULOS.TS — Teste de usuário real
 *
 * Sobe a versão de produção (dist/server.cjs) e abre um navegador Chromium de
 * verdade, navegando como um cliente faria — no computador (1366px) e no
 * celular (390px). Verifica em cada página:
 *  - carrega sem erro (HTTP 200) e sem erro de JavaScript na tela;
 *  - tem título SEO (30-60), meta description (120-156), H1, canonical e JSON-LD;
 *  - não tem rolagem horizontal no celular (layout responsivo);
 *  - nenhuma palavra proibida ("simbólico", "inteligência artificial") visível.
 * Fluxos: logo e oraculistas no topo, abrir Cadastrar e Entrar, abrir um oráculo e
 * um especialista, filtro de busca.
 * Gera prints e um relatório HTML em TESTE_USUARIO_REAL/relatorio.html.
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const BASE = 'http://127.0.0.1:3000';
const SAIDA = path.resolve(process.cwd(), 'TESTE_USUARIO_REAL');

const PAGINAS = [
  { nome: 'Início', url: '/' },
  { nome: 'Oráculos', url: '/oraculos' },
  { nome: 'Tarot', url: '/oraculos/tarot' },
  { nome: 'Baralho Cigano', url: '/oraculos/baralho-cigano' },
  { nome: 'Búzios', url: '/oraculos/buzios' },
  { nome: 'Astrologia', url: '/oraculos/astrologia' },
  { nome: 'Blog', url: '/blog' },
  { nome: 'Artigo do blog', url: '/blog/tarot-sim-ou-nao' },
  { nome: 'Especialista', url: '/especialistas/c1' },
  { nome: 'Como funciona', url: '/como-funciona' },
  { nome: 'Ajuda e privacidade', url: '/ajuda-e-privacidade' },
  { nome: 'Termos de uso', url: '/termos' },
  { nome: 'Política de privacidade', url: '/privacidade' },
  { nome: 'Reembolso', url: '/reembolso' },
  { nome: 'Trabalhe conosco', url: '/trabalhe-conosco' },
];

const APARELHOS = [
  { nome: 'computador', viewport: { width: 1366, height: 860 }, mobile: false },
  { nome: 'celular', viewport: { width: 390, height: 844 }, mobile: true },
];

const resultados = [];
let falhas = 0; // problemas graves: bloqueiam o envio
let avisos = 0; // melhorias recomendadas: aparecem no relatório

/** Verificações que travam o site para o cliente são graves; SEO e layout fino são avisos. */
const GRAVES = /página abre|sem tela de erro|travamento|abre o formulário|logo visível no topo|oraculistas logo abaixo|perfil abre|Google vê|artigo formatado/;

function registrar(aparelho, pagina, teste, ok, detalhe = '') {
  const grave = GRAVES.test(teste);
  resultados.push({ aparelho, pagina, teste, ok, detalhe, grave });
  if (!ok && grave) falhas += 1;
  if (!ok && !grave) avisos += 1;
  console.log(`${ok ? '  ✓' : grave ? '  ✗' : '  !'} [${aparelho}] ${pagina} — ${teste}${detalhe ? ` (${detalhe})` : ''}`);
}

async function esperarServidor(processo) {
  for (let i = 0; i < 40; i += 1) {
    if (processo && processo.exitCode !== null) throw new Error('O servidor encerrou antes do teste.');
    try {
      const r = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (r.ok || r.status === 503) return;
    } catch {
      /* aguardando */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('O servidor não respondeu em 20 segundos.');
}

// Erros de console que não são falhas do site (integrações sem chave no teste local)
const RUIDO = /firebase|firestore|auth\/|identitytoolkit|googleapis|gstatic|mercadopago|jitsi|ERR_BLOCKED|favicon|net::ERR|Failed to load resource|404|Content Security Policy|Refused to/i;

async function testarPagina(page, aparelho, pagina) {
  const errosJs = [];
  const travamentos = [];
  const onErro = (e) => travamentos.push(String(e.message || e));
  const onConsole = (m) => {
    if (m.type() === 'error' && !RUIDO.test(m.text())) errosJs.push(m.text());
  };
  page.on('pageerror', onErro);
  page.on('console', onConsole);

  if (!aparelho.mobile) {
    // O que o robô do Google/Bing recebe ANTES de executar JavaScript
    const bruto = await fetch(`${BASE}${pagina.url}`).then((r) => r.text()).catch(() => '');
    const canonicalBruto = (bruto.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
    const esperado = `https://oraculos-ts.vercel.app${pagina.url === '/' ? '/' : pagina.url}`;
    const textoBruto = (bruto.split('<div id="root">')[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    registrar(
      aparelho.nome,
      pagina.nome,
      'Google vê a página certa (HTML pronto, canonical e texto)',
      canonicalBruto === esperado && /<h1/.test(bruto) && textoBruto.length > 200,
      `canonical ${canonicalBruto || 'ausente'} · ${textoBruto.length} caracteres de texto`,
    );
  }

  const resposta = await page.goto(`${BASE}${pagina.url}`, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => ({ erro: e }));
  if (!resposta || resposta.erro) {
    registrar(aparelho.nome, pagina.nome, 'página abre', false, String(resposta?.erro?.message || 'sem resposta'));
    page.off('pageerror', onErro);
    page.off('console', onConsole);
    return;
  }
  registrar(aparelho.nome, pagina.nome, 'página abre (HTTP 200)', resposta.status() === 200, `HTTP ${resposta.status()}`);
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const meta = (sel) => document.querySelector(sel)?.getAttribute('content') || '';
    const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent || '');
    return {
      titulo: document.title,
      descricao: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent?.trim() || '').filter(Boolean),
      jsonld,
      larguraConteudo: document.documentElement.scrollWidth,
      larguraTela: window.innerWidth,
      texto: document.body.innerText || '',
      telaDeErro: /Algo deu errado|Something went wrong|Application error/i.test(document.body.innerText || ''),
    };
  });

  registrar(aparelho.nome, pagina.nome, 'sem tela de erro', !info.telaDeErro);
  if (pagina.url.startsWith('/blog/')) {
    registrar(aparelho.nome, pagina.nome, 'artigo formatado (sem ** ou # aparecendo)', !/\*\*|^#{1,4}\s/m.test(info.texto));
  }
  registrar(aparelho.nome, pagina.nome, 'sem travamento de JavaScript', travamentos.length === 0, travamentos.slice(0, 2).join(' | ').slice(0, 220));
  registrar(aparelho.nome, pagina.nome, 'console limpo', errosJs.length === 0, errosJs.slice(0, 2).join(' | ').slice(0, 220));
  registrar(aparelho.nome, pagina.nome, 'tem H1', info.h1.length >= 1, info.h1[0]?.slice(0, 70) || 'nenhum');
  registrar(
    aparelho.nome,
    pagina.nome,
    'sem rolagem horizontal',
    info.larguraConteudo <= info.larguraTela + 2,
    `${info.larguraConteudo}px de conteúdo / ${info.larguraTela}px de tela`,
  );
  registrar(
    aparelho.nome,
    pagina.nome,
    'linguagem (sem "simbólico"/"inteligência artificial")',
    !/simb[oó]lic|intelig[eê]ncia artificial/i.test(info.texto),
  );

  if (!aparelho.mobile) {
    registrar(aparelho.nome, pagina.nome, 'título SEO 30–60', info.titulo.length >= 30 && info.titulo.length <= 60, `${info.titulo.length}: ${info.titulo}`);
    registrar(
      aparelho.nome,
      pagina.nome,
      'meta description 120–156',
      info.descricao.length >= 120 && info.descricao.length <= 156,
      `${info.descricao.length} caracteres`,
    );
    registrar(aparelho.nome, pagina.nome, 'canonical', info.canonical.startsWith('https://oraculos-ts.vercel.app'), info.canonical);
    let jsonOk = info.jsonld.length > 0;
    for (const bloco of info.jsonld) {
      try {
        JSON.parse(bloco);
      } catch {
        jsonOk = false;
      }
    }
    registrar(aparelho.nome, pagina.nome, 'dados estruturados (JSON-LD) válidos', jsonOk, `${info.jsonld.length} bloco(s)`);
  }

  const arquivo = `${aparelho.nome}-${pagina.url.replace(/[^a-z0-9]+/gi, '_') || 'inicio'}.png`;
  await page.screenshot({ path: path.join(SAIDA, arquivo), fullPage: false });
  resultados[resultados.length - 1].print = arquivo;

  page.off('pageerror', onErro);
  page.off('console', onConsole);
}

async function testarFluxos(page, aparelho) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Topo: logo em destaque e, logo abaixo, os oraculistas (sem precisar rolar)
  const logo = page.locator('#hero-logo');
  registrar(aparelho.nome, 'Início', 'logo visível no topo', (await logo.count()) > 0 && (await logo.isVisible()));
  const listaNaTela = await page.evaluate(() => {
    const el = document.getElementById('advanced-search-hub');
    if (!el) return false;
    return el.getBoundingClientRect().top < window.innerHeight;
  });
  registrar(aparelho.nome, 'Início', 'oraculistas logo abaixo do logo (sem rolar)', listaNaTela);

  // Lista de oraculistas aparece
  const cartoes = await page.locator('#advanced-search-hub ~ div').count();
  registrar(aparelho.nome, 'Início', 'lista de oraculistas carregada', cartoes > 0);

  // Busca
  const busca = page.locator('#search-consultants-input');
  if ((await busca.count()) > 0) {
    await busca.fill('tarot');
    await page.waitForTimeout(600);
    const textoBusca = await page.evaluate(() => document.body.innerText);
    registrar(aparelho.nome, 'Início', 'busca por "tarot" responde', /tarot/i.test(textoBusca));
    await busca.fill('');
  }

  // Cadastro e login
  for (const rotulo of ['Entrar', 'Cadastrar']) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    let botao = page.getByRole('button', { name: new RegExp(`^\\s*${rotulo}\\s*$`, 'i') }).first();
    if (!(await botao.isVisible().catch(() => false))) {
      // no celular os botões podem ficar no menu
      const menu = page.locator('button[aria-label*="menu" i], button:has(svg.lucide-menu)').first();
      if (await menu.isVisible().catch(() => false)) await menu.click();
      botao = page.getByRole('button', { name: new RegExp(rotulo, 'i') }).first();
    }
    const visivel = await botao.isVisible().catch(() => false);
    if (!visivel) {
      registrar(aparelho.nome, 'Início', `botão "${rotulo}" acessível`, false, 'não encontrado');
      continue;
    }
    await botao.click();
    await page.waitForTimeout(800);
    const abriu = await page.locator('div.fixed.inset-0 input').first().isVisible().catch(() => false);
    registrar(aparelho.nome, 'Início', `"${rotulo}" abre o formulário`, abriu);
    await page.screenshot({ path: path.join(SAIDA, `${aparelho.nome}-modal-${rotulo.toLowerCase()}.png`) });
    resultados[resultados.length - 1].print = `${aparelho.nome}-modal-${rotulo.toLowerCase()}.png`;
    await page.keyboard.press('Escape');
  }

  // Abrir um especialista a partir da lista de oraculistas
  await page.goto(`${BASE}/oraculos/tarot`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const linkEspecialista = page.locator('a[href^="/especialistas/"]').first();
  if ((await linkEspecialista.count()) > 0) {
    const href = await linkEspecialista.getAttribute('href');
    const r = await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    registrar(aparelho.nome, 'Especialista', `perfil abre (${href})`, r?.status() === 200 && Boolean(h1), h1?.slice(0, 60) || '');
    await page.screenshot({ path: path.join(SAIDA, `${aparelho.nome}-especialista.png`) });
    resultados[resultados.length - 1].print = `${aparelho.nome}-especialista.png`;
  }

  // Página que não existe mostra 404 amigável
  await page.goto(`${BASE}/pagina-que-nao-existe-123`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const texto404 = await page.evaluate(() => document.body.innerText);
  registrar(aparelho.nome, '404', 'página inexistente mostra aviso amigável', /404|não encontrad/i.test(texto404));
}

function gerarRelatorio() {
  const linhas = resultados
    .map(
      (r) => `<tr class="${r.ok ? 'ok' : r.grave ? 'erro' : 'aviso'}"><td>${r.ok ? '✓' : r.grave ? '✗' : '!'}</td><td>${r.aparelho}</td><td>${r.pagina}</td><td>${r.teste}</td><td>${String(
        r.detalhe || '',
      )
        .replace(/</g, '&lt;')
        .slice(0, 200)}</td><td>${r.print ? `<a href="${r.print}" target="_blank">ver print</a>` : ''}</td></tr>`,
    )
    .join('\n');
  const total = resultados.length;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Teste de usuário real — ORACULOS.TS</title>
<style>body{font-family:system-ui,sans-serif;background:#0b0813;color:#eee;padding:24px}h1{color:#d4af37}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border-bottom:1px solid #2a2440;padding:6px 8px;text-align:left}tr.erro{background:#3a1220}tr.aviso{background:#3a2e10}tr.aviso td:first-child{color:#fbbf24}tr.ok td:first-child{color:#4ade80}tr.erro td:first-child{color:#f87171}a{color:#d4af37}.resumo{font-size:18px;margin:12px 0 20px}</style></head>
<body><h1>Teste de usuário real — ORACULOS.TS</h1><div class="resumo">${total - falhas - avisos} de ${total} verificações aprovadas ${
    falhas ? `— <b style="color:#f87171">${falhas} problema(s) grave(s)</b>` : '— <b style="color:#4ade80">nenhum problema grave</b>'
  }${avisos ? ` · <b style="color:#fbbf24">${avisos} aviso(s) de melhoria</b>` : ''}<br><small>${new Date().toLocaleString('pt-BR')} · computador 1366px e celular 390px · Chromium</small></div>
<table><tr><th></th><th>Aparelho</th><th>Página</th><th>Verificação</th><th>Detalhe</th><th>Print</th></tr>${linhas}</table></body></html>`;
  fs.writeFileSync(path.join(SAIDA, 'relatorio.html'), html);
}

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error('Playwright não instalado. Rode: npm install --no-save playwright && npx playwright install chromium');
    process.exit(1);
  }

  fs.rmSync(SAIDA, { recursive: true, force: true });
  fs.mkdirSync(SAIDA, { recursive: true });

  let servidor = null;
  const jaRodando = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(800) }).then(() => true).catch(() => false);
  if (!jaRodando) {
    servidor = spawn(process.execPath, [path.resolve(process.cwd(), 'dist/server.cjs')], {
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'ignore',
    });
  }

  try {
    await esperarServidor(servidor);
    const navegador = await chromium.launch();
    for (const aparelho of APARELHOS) {
      console.log(`\n=== ${aparelho.nome.toUpperCase()} (${aparelho.viewport.width}px) ===`);
      const contexto = await navegador.newContext({
        viewport: aparelho.viewport,
        isMobile: aparelho.mobile,
        hasTouch: aparelho.mobile,
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      });
      const page = await contexto.newPage();
      for (const pagina of PAGINAS) await testarPagina(page, aparelho, pagina);
      await testarFluxos(page, aparelho);
      await contexto.close();
    }
    await navegador.close();
  } finally {
    if (servidor) servidor.kill();
  }

  gerarRelatorio();
  console.log(`\nRelatório: ${path.join(SAIDA, 'relatorio.html')}`);
  console.log(`${resultados.length - falhas - avisos} de ${resultados.length} aprovadas · ${falhas} grave(s) · ${avisos} aviso(s).`);
  process.exitCode = falhas ? 1 : 0;
}

main().catch((erro) => {
  console.error('Teste de usuário real falhou:', erro.message);
  try {
    gerarRelatorio();
  } catch {
    /* sem relatório */
  }
  process.exit(1);
});
