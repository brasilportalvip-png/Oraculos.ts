/**
 * ORACULOS.TS — Páginas públicas para os buscadores
 *
 * O site é montado no navegador (React). Sem isto, Google e Bing recebiam o MESMO
 * HTML da página inicial em todos os endereços (mesmo título, mesma descrição e
 * canonical apontando para a home). Aqui geramos, para cada endereço público,
 * o título, a descrição, o canonical, os dados estruturados e o TEXTO REAL da
 * página, que vão direto no HTML entregue ao robô de busca.
 *
 * Também é a fonte única dos sitemaps (XML e TXT).
 */
import { INITIAL_CONSULTANTS } from '../data/mockData';
import { getDailyBlogPosts } from '../data/blogData';
import { ORACLE_DESCRIPTIONS } from '../data/oracleDescriptions';
import { LEGAL_DOCS, type LegalDocType } from '../data/legalDocs';
import {
  SITE,
  SEO_PAGINAS,
  SLUGS_ORACULOS,
  seoOraculo,
  tituloSEO,
  descricaoSEO,
  breadcrumbJsonLd,
  faqJsonLd,
} from './yoast';
import { escaparHtml as e, markdownParaHtml } from '../utils/markdown';

export const DATA_ATUALIZACAO_SITE = '2026-10-31';

export interface PaginaPublica {
  caminho: string;
  titulo: string;
  descricao: string;
  palavraChave?: string;
  ogType: 'website' | 'article' | 'profile';
  ogImage: string;
  jsonLd: Record<string, unknown>[];
  corpoHtml: string;
  sitemap: 'static' | 'oraculos' | 'especialistas' | 'blog';
  prioridade: number;
  frequencia: 'daily' | 'weekly' | 'monthly';
  lastmod: string;
  imagem?: { url: string; titulo: string };
}

const NOMES_ORACULOS: Record<string, string> = {
  tarot: 'Tarot',
  'baralho-cigano': 'Baralho Cigano',
  astrologia: 'Astrologia',
  numerologia: 'Numerologia',
  buzios: 'Búzios',
  ifa: 'Ifá',
  runas: 'Runas',
  'i-ching': 'I Ching',
  cristais: 'Cristais',
  'mesa-radionica': 'Mesa Radiônica',
};

const SLUG_POR_TIPO: Record<string, string> = {
  tarot: 'tarot',
  cigano: 'baralho-cigano',
  astrologia: 'astrologia',
  numerologia: 'numerologia',
  buzios: 'buzios',
  ifa: 'ifa',
  runas: 'runas',
  iching: 'i-ching',
  cristais: 'cristais',
  mesaradionica: 'mesa-radionica',
};

function absoluto(caminho: string): string {
  if (/^https?:\/\//.test(caminho)) return caminho;
  return `${SITE}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}

function navegacao(): string {
  return `<nav aria-label="Oráculos"><ul>${SLUGS_ORACULOS.map(
    (s) => `<li><a href="/oraculos/${s}">${e(NOMES_ORACULOS[s])} online</a></li>`,
  ).join('')}</ul><p><a href="/especialistas">Todos os oraculistas</a> · <a href="/blog">Blog</a> · <a href="/como-funciona">Como funciona</a> · <a href="/ajuda-e-privacidade">Ajuda</a> · <a href="/termos">Termos de uso</a> · <a href="/privacidade">Privacidade</a></p></nav>`;
}

function trilha(itens: Array<{ nome: string; caminho: string }>): string {
  const todos = [{ nome: 'Início', caminho: '/' }, ...itens];
  return `<nav aria-label="Trilha"><ol class="trilha">${todos
    .map((i) => `<li><a href="${e(i.caminho)}">${e(i.nome)}</a></li>`)
    .join('')}</ol></nav>`;
}

function cartaoOraculista(c: { id: string; name: string; title: string; bio: string }): string {
  return `<li><a href="/especialistas/${e(c.id)}"><strong>${e(c.name)}</strong></a> — ${e(c.title)}. ${e(c.bio)}</li>`;
}

function consultoresPublicos() {
  return INITIAL_CONSULTANTS.filter((c) => c && c.id && c.name && c.bio);
}

function oraculosDoConsultor(c: { specialties?: string[] }): string[] {
  return (c.specialties || []).map((t) => SLUG_POR_TIPO[t]).filter(Boolean);
}

export function gerarPaginasPublicas(): PaginaPublica[] {
  const paginas: PaginaPublica[] = [];
  const consultores = consultoresPublicos();
  const posts = getDailyBlogPosts().filter((p) => p.status !== 'draft');
  const logo = `${SITE}/brand/logo-oraculos.png`;

  // ----- Início
  paginas.push({
    caminho: '/',
    titulo: tituloSEO(SEO_PAGINAS.inicio.titulo),
    descricao: descricaoSEO(SEO_PAGINAS.inicio.descricao),
    palavraChave: SEO_PAGINAS.inicio.palavraChave,
    ogType: 'website',
    ogImage: logo,
    jsonLd: [],
    corpoHtml: `<img src="/brand/logo-oraculos.png" alt="ORACULOS.TS Logo Oficial" width="160" height="160">
<h1>Consulta de Tarot Online ao Vivo com os melhores oraculistas do Brasil — ORACULOS.TS</h1>
<p>${e(SEO_PAGINAS.inicio.descricao)}</p>
<h2>Oraculistas credenciados</h2>
<ul>${consultores.map(cartaoOraculista).join('')}</ul>
${navegacao()}`,
    sitemap: 'static',
    prioridade: 1.0,
    frequencia: 'daily',
    lastmod: DATA_ATUALIZACAO_SITE,
  });

  // ----- Listas
  paginas.push({
    caminho: '/oraculos',
    titulo: tituloSEO(SEO_PAGINAS.oraculos.titulo),
    descricao: descricaoSEO(SEO_PAGINAS.oraculos.descricao),
    palavraChave: SEO_PAGINAS.oraculos.palavraChave,
    ogType: 'website',
    ogImage: logo,
    jsonLd: [breadcrumbJsonLd([{ nome: 'Oráculos', caminho: '/oraculos' }])],
    corpoHtml: `${trilha([{ nome: 'Oráculos', caminho: '/oraculos' }])}
<h1>Oráculos online: escolha o seu</h1>
<p>${e(SEO_PAGINAS.oraculos.descricao)}</p>
<ul>${SLUGS_ORACULOS.map((s) => {
      const o = seoOraculo(s)!;
      return `<li><a href="/oraculos/${s}"><strong>${e(o.titulo)}</strong></a> — ${e(o.descricao)}</li>`;
    }).join('')}</ul>
${navegacao()}`,
    sitemap: 'static',
    prioridade: 0.9,
    frequencia: 'weekly',
    lastmod: DATA_ATUALIZACAO_SITE,
  });

  paginas.push({
    caminho: '/especialistas',
    titulo: tituloSEO('Oraculistas Online: Tarólogos, Cartomantes e Mães de Santo'),
    descricao: descricaoSEO(
      'Oraculistas online credenciados: tarólogas, cartomantes de baralho cigano, mães de santo, astrólogos e numerólogos. Veja os perfis e consulte ao vivo agora.',
    ),
    palavraChave: 'oraculistas online',
    ogType: 'website',
    ogImage: logo,
    jsonLd: [breadcrumbJsonLd([{ nome: 'Especialistas', caminho: '/especialistas' }])],
    corpoHtml: `${trilha([{ nome: 'Especialistas', caminho: '/especialistas' }])}
<h1>Oraculistas online credenciados</h1>
<ul>${consultores.map(cartaoOraculista).join('')}</ul>
${navegacao()}`,
    sitemap: 'static',
    prioridade: 0.9,
    frequencia: 'daily',
    lastmod: DATA_ATUALIZACAO_SITE,
  });

  // ----- Oráculos
  for (const slug of SLUGS_ORACULOS) {
    const seo = seoOraculo(slug)!;
    const det = ORACLE_DESCRIPTIONS[slug];
    const caminho = `/oraculos/${slug}`;
    const doOraculo = consultores.filter((c) => oraculosDoConsultor(c).includes(slug));
    paginas.push({
      caminho,
      titulo: tituloSEO(seo.titulo),
      descricao: descricaoSEO(seo.descricao),
      palavraChave: seo.palavraChave,
      ogType: 'website',
      ogImage: logo,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: det?.h1 || seo.titulo,
          serviceType: seo.palavraChave,
          description: seo.descricao,
          provider: { '@type': 'Organization', name: 'ORACULOS.TS', url: SITE },
          areaServed: 'BR',
          availableLanguage: 'pt-BR',
        },
        breadcrumbJsonLd([
          { nome: 'Oráculos', caminho: '/oraculos' },
          { nome: seo.nome, caminho },
        ]),
        faqJsonLd(seo.faq),
      ],
      corpoHtml: `${trilha([
        { nome: 'Oráculos', caminho: '/oraculos' },
        { nome: seo.nome, caminho },
      ])}
<h1>${e(det?.h1 || seo.titulo)}</h1>
<p><strong>${e(seo.palavraChave.charAt(0).toUpperCase() + seo.palavraChave.slice(1))}</strong>: ${e(seo.descricao)}</p>
${det ? `<p>${e(det.subtitle)}</p><h2>Origem e tradição</h2><p>${e(det.history)}</p><h2>Como funciona a consulta</h2><p>${e(det.howItWorks)}</p>` : ''}
${det?.elements?.length ? `<h2>Para que serve</h2><ul>${det.elements.map((x: string) => `<li>${e(x)}</li>`).join('')}</ul>` : ''}
${doOraculo.length ? `<h2>Oraculistas de ${e(seo.nome)}</h2><ul>${doOraculo.map(cartaoOraculista).join('')}</ul>` : ''}
<h2>Perguntas frequentes</h2>
${seo.faq.map((f) => `<h3>${e(f.pergunta)}</h3><p>${e(f.resposta)}</p>`).join('')}
${navegacao()}`,
      sitemap: 'oraculos',
      prioridade: 0.9,
      frequencia: 'weekly',
      lastmod: DATA_ATUALIZACAO_SITE,
    });
  }

  // ----- Especialistas
  for (const c of consultores) {
    const caminho = `/especialistas/${c.id}`;
    const oraculos = oraculosDoConsultor(c);
    paginas.push({
      caminho,
      titulo: tituloSEO(`${c.name} — ${c.title}`),
      descricao: descricaoSEO(`${c.name}, ${c.title}. ${c.bio}`),
      palavraChave: `${c.name}`,
      ogType: 'profile',
      ogImage: absoluto(c.avatar || '/brand/logo-oraculos.png'),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: c.name,
          jobTitle: c.title,
          description: c.bio,
          image: absoluto(c.avatar || '/brand/logo-oraculos.png'),
          url: absoluto(caminho),
          worksFor: { '@type': 'Organization', name: 'ORACULOS.TS', url: SITE },
          knowsAbout: oraculos.map((s) => NOMES_ORACULOS[s]),
        },
        breadcrumbJsonLd([
          { nome: 'Especialistas', caminho: '/especialistas' },
          { nome: c.name, caminho },
        ]),
      ],
      corpoHtml: `${trilha([
        { nome: 'Especialistas', caminho: '/especialistas' },
        { nome: c.name, caminho },
      ])}
<img src="${e(c.avatar || '/brand/logo-oraculos.png')}" alt="${e(c.name)}" width="144" height="144">
<h1>${e(c.name)}</h1>
<p><strong>${e(c.title)}</strong></p>
<p>${e(c.bio)}</p>
${oraculos.length ? `<h2>Oráculos que atende</h2><ul>${oraculos.map((s) => `<li><a href="/oraculos/${s}">${e(NOMES_ORACULOS[s])}</a></li>`).join('')}</ul>` : ''}
<p>Atendimento ao vivo por chat ou vídeo, com sigilo total. Você paga só os minutos usados.</p>
${navegacao()}`,
      sitemap: 'especialistas',
      prioridade: 0.8,
      frequencia: 'weekly',
      lastmod: DATA_ATUALIZACAO_SITE,
      imagem: c.avatar ? { url: absoluto(c.avatar), titulo: `${c.name} — ${c.title}` } : undefined,
    });
  }

  // ----- Blog
  paginas.push({
    caminho: '/blog',
    titulo: tituloSEO(SEO_PAGINAS.blog.titulo),
    descricao: descricaoSEO(SEO_PAGINAS.blog.descricao),
    palavraChave: SEO_PAGINAS.blog.palavraChave,
    ogType: 'website',
    ogImage: logo,
    jsonLd: [breadcrumbJsonLd([{ nome: 'Blog', caminho: '/blog' }])],
    corpoHtml: `${trilha([{ nome: 'Blog', caminho: '/blog' }])}
<h1>Blog de tarot, astrologia e espiritualidade</h1>
<ul>${posts.map((p) => `<li><a href="/blog/${e(p.slug)}"><strong>${e(p.title)}</strong></a> — ${e(p.summary)}</li>`).join('')}</ul>
${navegacao()}`,
    sitemap: 'blog',
    prioridade: 0.9,
    frequencia: 'daily',
    lastmod: (posts[0]?.updatedAt || DATA_ATUALIZACAO_SITE).slice(0, 10),
  });

  for (const p of posts) {
    const caminho = `/blog/${p.slug}`;
    const capa = absoluto(p.coverImage || '/blog/default-spiritual.svg');
    paginas.push({
      caminho,
      titulo: tituloSEO(p.seoTitle || p.title),
      descricao: descricaoSEO(p.seoDescription || p.summary),
      palavraChave: p.focusKeyword,
      ogType: 'article',
      ogImage: capa,
      jsonLd: [
        breadcrumbJsonLd([
          { nome: 'Blog', caminho: '/blog' },
          { nome: p.title, caminho },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.seoDescription || p.summary,
          image: capa,
          author: { '@type': 'Person', name: p.author },
          publisher: { '@type': 'Organization', name: 'ORACULOS.TS', url: SITE, logo: { '@type': 'ImageObject', url: logo } },
          datePublished: p.publishedAt,
          dateModified: p.updatedAt || p.publishedAt,
          mainEntityOfPage: absoluto(caminho),
          inLanguage: 'pt-BR',
          keywords: [p.focusKeyword, ...(p.relatedKeywords || [])].filter(Boolean).join(', '),
        },
      ],
      corpoHtml: `${trilha([
        { nome: 'Blog', caminho: '/blog' },
        { nome: p.title, caminho },
      ])}
<article>
<h1>${e(p.title)}</h1>
<p><em>Por ${e(p.author)}${p.reviewer ? `, revisado por ${e(p.reviewer)}` : ''} · ${e(p.date)} · ${e(p.readTime)} de leitura</em></p>
<img src="${e(p.coverImage)}" alt="${e(p.altText || p.title)}" width="800" height="400">
${markdownParaHtml(p.content)}
</article>
${navegacao()}`,
      sitemap: 'blog',
      prioridade: 0.8,
      frequencia: 'monthly',
      lastmod: (p.updatedAt || p.publishedAt || DATA_ATUALIZACAO_SITE).slice(0, 10),
      imagem: { url: capa, titulo: p.title },
    });
  }

  // ----- Institucionais
  const institucionais: Array<{ caminho: string; chave: keyof typeof SEO_PAGINAS; h1: string; texto: string; nome: string }> = [
    {
      caminho: '/como-funciona',
      chave: 'comoFunciona',
      nome: 'Como funciona',
      h1: 'Como funciona a consulta espiritual online',
      texto:
        '<ol><li>Cadastre-se com seu nome completo de solteiro(a) e sua data de nascimento (a hora é opcional): são os seus dados natal, a base de toda leitura.</li><li>Escolha o oraculista e o oráculo que combinam com você.</li><li>Compre um pacote de minutos pelo Mercado Pago (Pix ou cartão).</li><li>Converse ao vivo por chat ou vídeo, com sigilo total. Pergunte sobre você, sobre outra pessoa (sócio, chefe, filho, amor) ou sobre um dia específico (amanhã, daqui 4 dias, sexta-feira).</li></ol><p>Você paga só os minutos usados, e minutos não utilizados podem ser reembolsados em até 7 dias.</p>',
    },
    {
      caminho: '/ajuda-e-privacidade',
      chave: 'ajuda',
      nome: 'Ajuda e privacidade',
      h1: 'Central de ajuda e privacidade',
      texto:
        '<p>Tire dúvidas sobre minutos, pagamentos, reembolso e segurança da conta. Seus dados são protegidos pela LGPD e os atendimentos são sigilosos.</p><p>Leia também os <a href="/termos">Termos de uso</a>, a <a href="/privacidade">Política de privacidade</a>, a <a href="/cookies">Política de cookies</a> e a <a href="/reembolso">Política de reembolso</a>.</p>',
    },
    {
      caminho: '/trabalhe-conosco',
      chave: 'trabalheConosco',
      nome: 'Trabalhe conosco',
      h1: 'Trabalhe como tarólogo e oraculista online',
      texto:
        '<p>Atenda clientes de todo o Brasil por chat e vídeo, defina sua disponibilidade e receba repasses semanais. Cadastre seu perfil profissional e passe pela avaliação da nossa equipe.</p>',
    },
  ];
  for (const inst of institucionais) {
    const seo = SEO_PAGINAS[inst.chave];
    paginas.push({
      caminho: inst.caminho,
      titulo: tituloSEO(seo.titulo),
      descricao: descricaoSEO(seo.descricao),
      palavraChave: seo.palavraChave,
      ogType: 'website',
      ogImage: logo,
      jsonLd: [breadcrumbJsonLd([{ nome: inst.nome, caminho: inst.caminho }])],
      corpoHtml: `${trilha([{ nome: inst.nome, caminho: inst.caminho }])}<h1>${e(inst.h1)}</h1><p>${e(seo.descricao)}</p>${inst.texto}${navegacao()}`,
      sitemap: 'static',
      prioridade: 0.7,
      frequencia: 'monthly',
      lastmod: DATA_ATUALIZACAO_SITE,
    });
  }

  for (const tipo of Object.keys(LEGAL_DOCS) as LegalDocType[]) {
    const doc = LEGAL_DOCS[tipo];
    paginas.push({
      caminho: doc.canonical,
      titulo: tituloSEO(doc.title),
      descricao: descricaoSEO(doc.subtitle),
      ogType: 'website',
      ogImage: logo,
      jsonLd: [breadcrumbJsonLd([{ nome: doc.h1, caminho: doc.canonical }])],
      corpoHtml: `${trilha([{ nome: doc.h1, caminho: doc.canonical }])}<h1>${e(doc.h1)}</h1><p>${e(doc.subtitle)}</p><p><em>Última atualização: ${e(doc.lastUpdated)}</em></p>${doc.sections
        .map((s) => `<h2>${e(s.title)}</h2>${s.content.map((t) => `<p>${e(t)}</p>`).join('')}`)
        .join('')}${navegacao()}`,
      sitemap: 'static',
      prioridade: 0.4,
      frequencia: 'monthly',
      lastmod: DATA_ATUALIZACAO_SITE,
    });
  }

  return paginas;
}

// ---------------------------------------------------------------------------
// HTML final de cada página (a partir do index.html gerado pelo Vite)
// ---------------------------------------------------------------------------

function trocarMeta(html: string, seletor: RegExp, novo: string): string {
  return seletor.test(html) ? html.replace(seletor, novo) : html.replace('</head>', `    ${novo}\n  </head>`);
}

export function montarHtmlDaPagina(template: string, p: PaginaPublica): string {
  const url = absoluto(p.caminho === '/' ? '/' : p.caminho);
  let html = template;

  // Nas páginas internas, o bloco global fica só com Organização e Site
  // (WebPage/Service da home não descrevem as outras páginas).
  if (p.caminho !== '/') {
    html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (bloco, json) => {
      try {
        const dados = JSON.parse(json);
        if (Array.isArray(dados['@graph'])) {
          dados['@graph'] = dados['@graph'].filter((n: { '@type'?: string }) => n['@type'] === 'Organization' || n['@type'] === 'WebSite');
          return `<script type="application/ld+json">${JSON.stringify(dados)}</script>`;
        }
      } catch {
        /* mantém como está */
      }
      return bloco;
    });
  }

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${e(p.titulo)}</title>`);
  html = trocarMeta(html, /<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${e(p.descricao)}" />`);
  html = trocarMeta(
    html,
    /<meta\s+name="keywords"[\s\S]*?\/>/,
    p.palavraChave ? `<meta name="keywords" content="${e(p.palavraChave)}" />` : '',
  );
  html = trocarMeta(html, /<link\s+rel="canonical"[\s\S]*?\/>/, `<link rel="canonical" href="${e(url)}" />`);
  html = trocarMeta(html, /<meta\s+property="og:type"[\s\S]*?\/>/, `<meta property="og:type" content="${p.ogType}" />`);
  html = trocarMeta(html, /<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${e(url)}" />`);
  html = trocarMeta(html, /<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${e(p.titulo)}" />`);
  html = trocarMeta(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${e(p.descricao)}" />`,
  );
  html = trocarMeta(html, /<meta\s+property="og:image"[\s\S]*?\/>/, `<meta property="og:image" content="${e(p.ogImage)}" />`);
  html = trocarMeta(html, /<meta\s+name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${e(p.titulo)}" />`);
  html = trocarMeta(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${e(p.descricao)}" />`,
  );

  if (p.jsonLd.length) {
    const scripts = p.jsonLd
      .map((j) => `<script type="application/ld+json" data-prerender="jsonld">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)
      .join('\n    ');
    html = html.replace('</head>', `    ${scripts}\n  </head>`);
  }

  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><div class="prerender">${p.corpoHtml}</div></div>`,
  );

  return html;
}

// ---------------------------------------------------------------------------
// Sitemaps
// ---------------------------------------------------------------------------

export function gerarSitemaps(paginas: PaginaPublica[]): Record<string, string> {
  const grupos: Record<PaginaPublica['sitemap'], PaginaPublica[]> = { static: [], oraculos: [], especialistas: [], blog: [] };
  for (const p of paginas) grupos[p.sitemap].push(p);

  const urlset = (lista: PaginaPublica[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${lista
  .map(
    (p) => `  <url>
    <loc>${e(absoluto(p.caminho))}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.frequencia}</changefreq>
    <priority>${p.prioridade.toFixed(1)}</priority>${
      p.imagem
        ? `
    <image:image>
      <image:loc>${e(p.imagem.url)}</image:loc>
      <image:title>${e(p.imagem.titulo)}</image:title>
    </image:image>`
        : ''
    }
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  const ultima = (lista: PaginaPublica[]) => lista.map((p) => p.lastmod).sort().pop() || DATA_ATUALIZACAO_SITE;

  const indice = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE}/sitemap-static.xml</loc><lastmod>${ultima(grupos.static)}</lastmod></sitemap>
  <sitemap><loc>${SITE}/sitemap-oraculos.xml</loc><lastmod>${ultima(grupos.oraculos)}</lastmod></sitemap>
  <sitemap><loc>${SITE}/sitemap-especialistas.xml</loc><lastmod>${ultima(grupos.especialistas)}</lastmod></sitemap>
  <sitemap><loc>${SITE}/sitemap-blog.xml</loc><lastmod>${ultima(grupos.blog)}</lastmod></sitemap>
</sitemapindex>
`;

  return {
    'sitemap.xml': indice,
    'sitemap-static.xml': urlset(grupos.static),
    'sitemap-oraculos.xml': urlset(grupos.oraculos),
    'sitemap-especialistas.xml': urlset(grupos.especialistas),
    'sitemap-blog.xml': urlset(grupos.blog),
    'sitemap.txt': `${paginas.map((p) => absoluto(p.caminho)).join('\n')}\n`,
  };
}
