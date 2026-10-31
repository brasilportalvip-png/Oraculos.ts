import { describe, it, expect } from 'vitest';
import {
  tituloSEO,
  descricaoSEO,
  SEO_PAGINAS,
  seoOraculo,
  SLUGS_ORACULOS,
  breadcrumbJsonLd,
  faqJsonLd,
} from '../src/seo/yoast';
import { formatarConhecimentoDoSite } from '../src/data/siteKnowledge';

describe('V8 — SEO no padrão Yoast', () => {
  it('títulos ficam entre 30 e 60 caracteres e a marca só entra se couber', () => {
    expect(tituloSEO('Tarot Online')).toBe('Tarot Online | ORACULOS.TS');
    const longo = tituloSEO('Política de Cancelamento, Estorno e Reembolso de Créditos e Minutos Comprados');
    expect(longo.length).toBeLessThanOrEqual(60);
  });

  it('descrições ficam entre 120 e 156 caracteres', () => {
    expect(descricaoSEO('Área privada.').length).toBeGreaterThanOrEqual(40);
    const curta = descricaoSEO('Consulte os melhores oraculistas do Brasil ao vivo pelo chat seguro.');
    expect(curta.length).toBeGreaterThanOrEqual(120);
    expect(curta.length).toBeLessThanOrEqual(156);
    expect(descricaoSEO('x '.repeat(200)).length).toBeLessThanOrEqual(156);
  });

  it('todas as páginas fixas seguem as regras e trazem a palavra-chave', () => {
    for (const [nome, p] of Object.entries(SEO_PAGINAS)) {
      const titulo = tituloSEO(p.titulo);
      expect(titulo.length, nome).toBeGreaterThanOrEqual(30);
      expect(titulo.length, nome).toBeLessThanOrEqual(60);
      expect(p.descricao.length, nome).toBeGreaterThanOrEqual(120);
      expect(p.descricao.length, nome).toBeLessThanOrEqual(156);
      expect(p.descricao.toLowerCase(), nome).toContain(p.palavraChave.toLowerCase());
    }
  });

  it('os 10 oráculos têm palavra-chave no título e na descrição, e FAQ', () => {
    expect(SLUGS_ORACULOS).toHaveLength(10);
    for (const slug of SLUGS_ORACULOS) {
      const o = seoOraculo(slug)!;
      expect(o.titulo.length, slug).toBeLessThanOrEqual(60);
      expect(o.descricao.length, slug).toBeGreaterThanOrEqual(120);
      expect(o.descricao.length, slug).toBeLessThanOrEqual(156);
      expect(o.titulo.toLowerCase(), slug).toContain(o.palavraChave.split(' ')[0].toLowerCase());
      expect(o.descricao.toLowerCase(), slug).toContain(o.palavraChave.toLowerCase());
      expect(o.faq.length).toBe(3);
    }
  });

  it('gera breadcrumb e FAQ estruturados válidos', () => {
    const b: any = breadcrumbJsonLd([{ nome: 'Oráculos', caminho: '/oraculos' }]);
    expect(b.itemListElement[0].name).toBe('Início');
    expect(b.itemListElement[1].item).toBe('https://oraculos-ts.vercel.app/oraculos');
    const f: any = faqJsonLd(seoOraculo('tarot')!.faq);
    expect(f['@type']).toBe('FAQPage');
    expect(JSON.parse(JSON.stringify(f)).mainEntity).toHaveLength(3);
  });
});

describe('V8 — Atendentes conhecem o site', () => {
  it('conhecimento traz pacotes reais, consumo do atendente e caminhos do site', () => {
    const texto = formatarConhecimentoDoSite(
      [
        { title: 'Pacote Bronze R$ 10', priceBrl: 10, minutes: 10, bonusMinutes: 1, active: true },
        { title: 'Inativo', priceBrl: 99, minutes: 99, active: false },
      ],
      { name: 'Aura Celeste', pricePerMinute: 3.5, authorizedOracles: ['tarot'] },
    );
    expect(texto).toContain('Pacote Bronze R$ 10: R$ 10,00 = 10 min + 1 min de bônus');
    expect(texto).not.toContain('Inativo');
    expect(texto).toContain('3,50 min do saldo');
    expect(texto).toContain('/ajuda-e-privacidade');
    expect(texto).toContain('7 dias');
    expect(texto).toContain('Mercado Pago');
    expect(texto).not.toMatch(/simb[oó]lic|intelig[eê]ncia artificial/i);
  });
});
