import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import fs from 'fs';
import path from 'path';

describe('SEO, Sitemaps XML, Robots, PWA & Android TWA Validation', () => {
  // 1. Health & Packages APIs
  it('GET /api/health deve responder 200 com status ok e identificação do sistema', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.system).toBe('ORACULOS.TS');
  });

  it('GET /api/packages deve retornar lista de pacotes de minutos oficiais sem erro 500', async () => {
    const res = await request(app).get('/api/packages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('minutes');
    expect(res.body.data[0]).toHaveProperty('priceBrl');
  });

  // 2. Robots.txt
  it('GET /robots.txt deve responder 200 com Content-Type text/plain e apontar para o sitemap principal', async () => {
    const res = await request(app).get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('Sitemap: https://oraculos-ts.vercel.app/sitemap.xml');
    expect(res.text).toContain('Disallow: /admin');
    expect(res.text).toContain('Disallow: /painel');
    expect(res.text).toContain('Disallow: /api/');
  });

  // 3. Sitemap Index XML
  it('GET /sitemap.xml deve responder 200 com Content-Type application/xml e sitemapindex válido', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('xml');
    expect(res.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(res.text).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(res.text).toContain('https://oraculos-ts.vercel.app/sitemap-static.xml');
    expect(res.text).toContain('https://oraculos-ts.vercel.app/sitemap-oraculos.xml');
    expect(res.text).toContain('https://oraculos-ts.vercel.app/sitemap-especialistas.xml');
    expect(res.text).toContain('https://oraculos-ts.vercel.app/sitemap-blog.xml');
    expect(res.text).not.toContain('/admin');
    expect(res.text).not.toContain('/painel');
    expect(res.text).not.toContain('/api/');
  });

  // 4. Sitemaps Segmentados
  it('GET /sitemap-static.xml deve conter páginas públicas essenciais', async () => {
    const res = await request(app).get('/sitemap-static.xml');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<loc>https://oraculos-ts.vercel.app/</loc>');
    expect(res.text).toContain('<loc>https://oraculos-ts.vercel.app/especialistas</loc>');
    expect(res.text).toContain('<loc>https://oraculos-ts.vercel.app/oraculos</loc>');
    expect(res.text).toContain('<loc>https://oraculos-ts.vercel.app/termos</loc>');
    expect(res.text).toContain('<loc>https://oraculos-ts.vercel.app/privacidade</loc>');
  });

  it('GET /sitemap-oraculos.xml deve conter todos os 10 oráculos canônicos', async () => {
    const res = await request(app).get('/sitemap-oraculos.xml');
    expect(res.status).toBe(200);
    const oracles = [
      'tarot',
      'baralho-cigano',
      'astrologia',
      'numerologia',
      'buzios',
      'ifa',
      'runas',
      'i-ching',
      'cristais',
      'mesa-radionica',
    ];
    for (const oracle of oracles) {
      expect(res.text).toContain(`https://oraculos-ts.vercel.app/oraculos/${oracle}`);
    }
  });

  it('GET /sitemap-especialistas.xml deve conter perfis públicos e canônicos', async () => {
    const res = await request(app).get('/sitemap-especialistas.xml');
    expect(res.status).toBe(200);
    expect(res.text).toContain('https://oraculos-ts.vercel.app/especialistas/c1');
    expect(res.text).toContain('https://oraculos-ts.vercel.app/especialistas/v-tarot');
  });

  it('GET /sitemap-blog.xml deve conter artigos publicados', async () => {
    const res = await request(app).get('/sitemap-blog.xml');
    expect(res.status).toBe(200);
    expect(res.text).toContain('https://oraculos-ts.vercel.app/blog/portal-do-tarot-2026');
  });

  // 5. Digital Asset Links
  it('GET /.well-known/assetlinks.json deve responder 200 com array de targets do app Android', async () => {
    const res = await request(app).get('/.well-known/assetlinks.json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('json');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].target.namespace).toBe('android_app');
    expect(res.body[0].target.package_name).toBe('br.com.oraculos.app');
    expect(Array.isArray(res.body[0].target.sha256_cert_fingerprints)).toBe(true);
  });

  // 6. PWA Manifest
  it('GET /manifest.webmanifest deve retornar manifesto com nome, start_url e ícones', async () => {
    const res = await request(app).get('/manifest.webmanifest');
    expect(res.status).toBe(200);
    expect(res.body.name).toContain('ORACULOS.TS');
    expect(res.body.start_url).toBe('/');
    expect(res.body.display).toBe('standalone');
    expect(Array.isArray(res.body.icons)).toBe(true);
    expect(res.body.icons.length).toBeGreaterThanOrEqual(2);
  });

  // 7. Validação de Arquivos Físicos no Build
  it('Arquivos estáticos essenciais devem existir em /public', () => {
    const files = [
      'public/robots.txt',
      'public/sitemap.xml',
      'public/sitemap-static.xml',
      'public/sitemap-oraculos.xml',
      'public/sitemap-especialistas.xml',
      'public/sitemap-blog.xml',
      'public/manifest.webmanifest',
      'public/manifest.json',
      'public/sw.js',
      'public/.well-known/assetlinks.json',
      'public/brand/logo-oraculos.png',
      'public/image/logo-oraculo.ts.png',
    ];

    for (const file of files) {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      expect(exists).toBe(true);
    }
  });
});
