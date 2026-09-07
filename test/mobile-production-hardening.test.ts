import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Blindagem mobile para produção', () => {
  it('adapta a viewport ao teclado virtual e respeita as áreas seguras', () => {
    const html = readFileSync('index.html', 'utf8');
    const css = readFileSync('src/index.css', 'utf8');

    expect(html).toContain('interactive-widget=resizes-content');
    expect(css).toContain('-webkit-text-size-adjust: 100%');
    expect(css).toContain('font-size: 16px');
    expect(css).toContain('overflow-x: clip');
  });

  it('mantém a sala de consulta utilizável em telas estreitas', () => {
    const room = readFileSync('src/components/ConsultationRoom.tsx', 'utf8');

    expect(room).toContain('hidden sm:flex items-center');
    expect(room).toContain('grid grid-cols-3');
    expect(room).toContain('flex-1 min-w-0');
    expect(room).toContain('max-h-[calc(100dvh-1.5rem)]');
    expect(room).toContain('break-words');
  });

  it('limita suporte e modais à largura e altura visíveis', () => {
    const support = readFileSync('src/components/FloatingSupport.tsx', 'utf8');
    const register = readFileSync('src/components/RegisterModal.tsx', 'utf8');
    const recharge = readFileSync('src/components/MercadoPagoRechargeModal.tsx', 'utf8');

    expect(support).toContain('max-w-[calc(100vw-1.5rem)]');
    expect(support).toContain('env(safe-area-inset-bottom)');
    expect(register).toContain('max-h-[calc(100dvh-1.5rem)]');
    expect(recharge).toContain('max-h-[calc(100dvh-1.5rem)]');
  });
});
