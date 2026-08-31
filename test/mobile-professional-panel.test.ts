import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Painel profissional responsivo', () => {
  it('mantém acesso direto ao painel e menu rolável em celular', () => {
    const header = readFileSync('src/components/Header.tsx', 'utf8');
    expect(header).toContain('aria-label="Abrir painel profissional"');
    expect(header).toContain('fixed z-50 left-0 right-0');
    expect(header).toContain('bottom-0');
    expect(header).toContain('overflow-y-auto overscroll-contain');
  });

  it('impede estouro horizontal no painel e mantém os três estados visíveis', () => {
    const dashboard = readFileSync('src/components/consultant/ConsultantDashboard.tsx', 'utf8');
    expect(dashboard).toContain('grid grid-cols-3');
    expect(dashboard).toContain("status === 'online' ? 'Online'");
    expect(dashboard).toContain("status === 'busy' ? 'Ocupado'");
    expect(dashboard).toContain('overflow-x-hidden');
    expect(dashboard).toContain('flex-1 min-w-0');
  });
});
