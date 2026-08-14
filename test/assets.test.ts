import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const BRAND_PATH = path.resolve(__dirname, '../public/brand/logo-oraculos.png');
const IMAGE_PATH = path.resolve(__dirname, '../public/image/logo-oraculo.ts.png');

describe('VALIDAÇÃO DE ATIVOS BINÁRIOS OFICIAIS (LOGO ORACULOS.TS)', () => {
  it('1. Deve validar que o arquivo public/brand/logo-oraculos.png é um binário PNG genuíno e não corrompido', () => {
    expect(fs.existsSync(BRAND_PATH)).toBe(true);

    const buf = fs.readFileSync(BRAND_PATH);
    expect(buf.length).toBeGreaterThan(1000);

    // Assinatura PNG de 8 bytes
    const header = buf.slice(0, 8);
    expect(header.equals(PNG_MAGIC)).toBe(true);
    expect(header.toString('hex')).toBe('89504e470d0a1a0a');
    expect(header.toString('hex').toLowerCase()).not.toContain('efbfbd');

    // Validação de dimensões no cabeçalho IHDR
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1254);
    expect(height).toBe(1254);

    // Hash SHA-256
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    expect(sha256).toBe('365db6baa4c710cc45e35372bceb287f4f6a4a866ec9cda912316cb7462313a8');
  });

  it('2. Deve validar que public/image/logo-oraculo.ts.png é rigorosamente idêntico byte a byte ao logo oficial', () => {
    expect(fs.existsSync(IMAGE_PATH)).toBe(true);

    const bufBrand = fs.readFileSync(BRAND_PATH);
    const bufImage = fs.readFileSync(IMAGE_PATH);

    expect(bufImage.length).toBe(bufBrand.length);
    expect(bufImage.equals(bufBrand)).toBe(true);
  });
});
