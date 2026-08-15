const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const ICO_MAGIC = Buffer.from([0x00, 0x00, 0x01, 0x00]);
const UTF8_REPLACEMENT_HEX = 'efbfbd';

const BRAND_LOGO_PATH = path.resolve(__dirname, '../public/brand/logo-oraculos.png');
const IMAGE_LOGO_PATH = path.resolve(__dirname, '../public/image/logo-oraculo.ts.png');
const FAVICON_ICO_PATH = path.resolve(__dirname, '../public/favicon.ico');
const FAVICON_PNG_PATH = path.resolve(__dirname, '../public/favicon.png');
const APPLE_TOUCH_PATH = path.resolve(__dirname, '../public/apple-touch-icon.png');
const ICON_192_PATH = path.resolve(__dirname, '../public/icons/icon-192x192.png');
const ICON_512_PATH = path.resolve(__dirname, '../public/icons/icon-512x512.png');
const ICON_MASKABLE_PATH = path.resolve(__dirname, '../public/icons/icon-maskable-512x512.png');

console.log('===> VALIDANDO ATIVOS BINÁRIOS OFICIAIS (ORACULOS.TS) <===');

function validateSinglePng(filePath, expectedWidth, expectedHeight) {
  if (!fs.existsSync(filePath)) {
    console.error(`[ERRO FATAL] Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const buf = fs.readFileSync(filePath);
  if (buf.length < 24) {
    console.error(`[ERRO FATAL] Arquivo excessivamente pequeno ou corrompido: ${filePath} (${buf.length} bytes)`);
    process.exit(1);
  }

  const header = buf.subarray(0, 8);
  const headerHex = header.toString('hex').toLowerCase();

  if (!header.equals(PNG_MAGIC)) {
    console.error(`[ERRO FATAL] Assinatura PNG inválida em ${filePath}. Esperado '89504e470d0a1a0a', recebido: '${headerHex}'`);
    process.exit(1);
  }

  if (headerHex.startsWith(UTF8_REPLACEMENT_HEX)) {
    console.error(`[ERRO FATAL] Arquivo corrompido por conversão UTF-8 com Replacement Characters (efbfbd): ${filePath}`);
    process.exit(1);
  }

  // Validação IHDR
  const ihdrChunkType = buf.subarray(12, 16).toString('ascii');
  if (ihdrChunkType !== 'IHDR') {
    console.error(`[ERRO FATAL] Bloco IHDR não encontrado na posição correta em ${filePath}`);
    process.exit(1);
  }

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);

  if (width === 0 || height === 0) {
    console.error(`[ERRO FATAL] Dimensões inválidas em ${filePath}: ${width}x${height}`);
    process.exit(1);
  }

  if (expectedWidth && width !== expectedWidth) {
    console.error(`[ERRO FATAL] Largura incorreta em ${filePath}: esperado ${expectedWidth}, recebido ${width}`);
    process.exit(1);
  }

  if (expectedHeight && height !== expectedHeight) {
    console.error(`[ERRO FATAL] Altura incorreta em ${filePath}: esperado ${expectedHeight}, recebido ${height}`);
    process.exit(1);
  }

  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  console.log(`✓ ${path.relative(process.cwd(), filePath)} válido: ${width}x${height} (${buf.length} bytes) | SHA-256: ${sha256}`);

  return { buf, width, height, sha256 };
}

function validateIco(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[ERRO FATAL] Arquivo ICO não encontrado: ${filePath}`);
    process.exit(1);
  }

  const buf = fs.readFileSync(filePath);
  const header = buf.subarray(0, 4);

  if (!header.equals(ICO_MAGIC)) {
    console.error(`[ERRO FATAL] Assinatura ICO inválida em ${filePath}`);
    process.exit(1);
  }

  const count = buf.readUInt16LE(4);
  console.log(`✓ ${path.relative(process.cwd(), filePath)} válido: Formato ICO Windows (${count} sub-ícones, ${buf.length} bytes)`);
}

const brandLogo = validateSinglePng(BRAND_LOGO_PATH);
const imageLogo = validateSinglePng(IMAGE_LOGO_PATH);
validateSinglePng(ICON_192_PATH, 192, 192);
validateSinglePng(ICON_512_PATH, 512, 512);
validateSinglePng(ICON_MASKABLE_PATH, 512, 512);
validateSinglePng(APPLE_TOUCH_PATH, 180, 180);
validateSinglePng(FAVICON_PNG_PATH, 48, 48);
validateIco(FAVICON_ICO_PATH);

if (!brandLogo.buf.equals(imageLogo.buf)) {
  console.error('[ERRO FATAL] Os arquivos public/brand/logo-oraculos.png e public/image/logo-oraculo.ts.png NÃO são idênticos byte a byte.');
  process.exit(1);
}

if (brandLogo.sha256 !== imageLogo.sha256) {
  console.error('[ERRO FATAL] Divergência de hash SHA-256 entre os arquivos de logotipo.');
  process.exit(1);
}

console.log('✓ Ambos os logotipos principais são rigorosamente IDÊNTICOS byte a byte.');
console.log('===> VALIDAÇÃO DE ATIVOS CONCLUÍDA COM SUCESSO! <===');
process.exit(0);
