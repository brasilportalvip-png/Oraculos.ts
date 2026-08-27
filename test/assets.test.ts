import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const ICO_MAGIC = Buffer.from([0x00, 0x00, 0x01, 0x00]);

const BRAND_PATH = path.resolve(__dirname, '../public/brand/logo-oraculos.png');
const IMAGE_PATH = path.resolve(__dirname, '../public/image/logo-oraculo.ts.png');
const FAVICON_ICO_PATH = path.resolve(__dirname, '../public/favicon.ico');
const FAVICON_PNG_PATH = path.resolve(__dirname, '../public/favicon.png');
const APPLE_TOUCH_PATH = path.resolve(__dirname, '../public/apple-touch-icon.png');
const ICON_192_PATH = path.resolve(__dirname, '../public/icons/icon-192x192.png');
const ICON_512_PATH = path.resolve(__dirname, '../public/icons/icon-512x512.png');
const ICON_MASKABLE_PATH = path.resolve(__dirname, '../public/icons/icon-maskable-512x512.png');
const MANIFEST_JSON_PATH = path.resolve(__dirname, '../public/manifest.json');
const MANIFEST_WEB_PATH = path.resolve(__dirname, '../public/manifest.webmanifest');

function checkPng(filePath: string, expectedWidth?: number, expectedHeight?: number) {
  expect(fs.existsSync(filePath)).toBe(true);
  const buf = fs.readFileSync(filePath);
  expect(buf.length).toBeGreaterThan(100);

  const header = buf.slice(0, 8);
  expect(header.equals(PNG_MAGIC)).toBe(true);
  expect(header.toString('hex').toLowerCase()).not.toContain('efbfbd');

  if (expectedWidth && expectedHeight) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(expectedWidth);
    expect(height).toBe(expectedHeight);
  }
}

describe('VALIDAÇÃO DE ATIVOS BINÁRIOS OFICIAIS (LOGO, ÍCONES E PWA ORACULOS.TS)', () => {
  it('1. Deve validar que o arquivo public/brand/logo-oraculos.png é um binário PNG genuíno e não corrompido', () => {
    expect(fs.existsSync(BRAND_PATH)).toBe(true);

    const buf = fs.readFileSync(BRAND_PATH);
    expect(buf.length).toBeGreaterThan(1000);

    const header = buf.slice(0, 8);
    expect(header.equals(PNG_MAGIC)).toBe(true);
    expect(header.toString('hex')).toBe('89504e470d0a1a0a');
    expect(header.toString('hex').toLowerCase()).not.toContain('efbfbd');

    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    


expect(width).toBe(300);
expect(height).toBe(300);

const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
expect(sha256).toBe('56ed6355889ee8b008b640fc56a3cd7f2937c7aac1a772b0dd1f6c7d79afb1ac');



 });

  it('2. Deve validar que public/image/logo-oraculo.ts.png é rigorosamente idêntico byte a byte ao logo oficial', () => {
    expect(fs.existsSync(IMAGE_PATH)).toBe(true);

    const bufBrand = fs.readFileSync(BRAND_PATH);
    const bufImage = fs.readFileSync(IMAGE_PATH);

    expect(bufImage.length).toBe(bufBrand.length);
    expect(bufImage.equals(bufBrand)).toBe(true);
  });

  it('3. Deve validar ícones dedicados em PNG com dimensões corretas (192, 512, maskable, 180 apple touch, 48 favicon)', () => {
    checkPng(ICON_192_PATH, 192, 192);
    checkPng(ICON_512_PATH, 512, 512);
    checkPng(ICON_MASKABLE_PATH, 512, 512);
    checkPng(APPLE_TOUCH_PATH, 180, 180);
    checkPng(FAVICON_PNG_PATH, 48, 48);
  });

  it('4. Deve validar que public/favicon.ico é um formato ICO genuíno de Windows Icon com cabeçalho 00000100', () => {
    expect(fs.existsSync(FAVICON_ICO_PATH)).toBe(true);
    const buf = fs.readFileSync(FAVICON_ICO_PATH);
    expect(buf.length).toBeGreaterThan(500);

    const header = buf.slice(0, 4);
    expect(header.equals(ICO_MAGIC)).toBe(true);

    // Número de ícones contidos no ICO
    const iconCount = buf.readUInt16LE(4);
    expect(iconCount).toBeGreaterThanOrEqual(1);
  });

  it('5. Deve validar manifestos PWA declarando ícones válidos', () => {
    expect(fs.existsSync(MANIFEST_JSON_PATH)).toBe(true);
    expect(fs.existsSync(MANIFEST_WEB_PATH)).toBe(true);

    const mJson = JSON.parse(fs.readFileSync(MANIFEST_JSON_PATH, 'utf-8'));
    const mWeb = JSON.parse(fs.readFileSync(MANIFEST_WEB_PATH, 'utf-8'));

    expect(Array.isArray(mJson.icons)).toBe(true);
    expect(mJson.icons.length).toBeGreaterThanOrEqual(3);
    expect(mJson.icons.some((i: any) => i.src === '/icons/icon-192x192.png')).toBe(true);
    expect(mJson.icons.some((i: any) => i.src === '/icons/icon-512x512.png')).toBe(true);
    expect(mJson.icons.some((i: any) => i.purpose === 'maskable')).toBe(true);

    expect(Array.isArray(mWeb.icons)).toBe(true);
    expect(mWeb.icons.some((i: any) => i.src === '/icons/icon-192x192.png')).toBe(true);
  });
});
