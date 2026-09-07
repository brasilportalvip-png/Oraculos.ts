import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Regressão do layout móvel', () => {
  it('mantém o cabeçalho da consulta dentro de telas estreitas', () => {
    const room = readFileSync('src/components/ConsultationRoom.tsx', 'utf8');

    expect(room).toContain('flex min-w-0 flex-1 items-center');
    expect(room).toContain('hidden md:flex items-center');
    expect(room).toContain('truncate font-bold');
    expect(room).toContain('grid grid-cols-3');
    expect(room).toContain('min-w-0 flex-1 bg-[#0B0813]');
  });

  it('não altera globalmente o tamanho de inputs ou o modal de login', () => {
    const css = readFileSync('src/index.css', 'utf8');
    const register = readFileSync('src/components/RegisterModal.tsx', 'utf8');

    expect(css).not.toContain('-webkit-text-size-adjust');
    expect(css).not.toMatch(/@media \(max-width: 639px\)[\s\S]*font-size: 16px/);
    expect(register).toContain('max-w-lg');
    expect(register).toContain('p-6');
  });

  it('limita o suporte flutuante à largura visível', () => {
    const support = readFileSync('src/components/FloatingSupport.tsx', 'utf8');

    expect(support).toContain('max-w-[calc(100vw-1.5rem)]');
    expect(support).toContain('w-80 max-w-full');
  });
});
