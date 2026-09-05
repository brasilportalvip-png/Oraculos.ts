import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Painel profissional responsivo', () => {
  it('mantém os painéis acessíveis dentro do menu mobile logo abaixo de Trabalhe Conosco', () => {
    const header = readFileSync('src/components/Header.tsx', 'utf8');
    const mobileStart = header.indexOf('{/* Mobile Navigation Drawer Overlay */}');
    const mobile = header.slice(mobileStart);

    expect(mobileStart).toBeGreaterThan(-1);
    expect(header).not.toContain('aria-label="Abrir painel profissional"');
    expect(mobile).toContain('Trabalhe Conosco');
    expect(mobile).toContain('Painel do Usuário');
    expect(mobile).toContain('Painel do Funcionário');
    expect(mobile.indexOf('Painel do Usuário')).toBeGreaterThan(mobile.indexOf('Trabalhe Conosco'));
    expect(mobile.indexOf('Painel do Funcionário')).toBeGreaterThan(mobile.indexOf('Trabalhe Conosco'));
    expect(header).toContain('fixed z-[70] left-0 right-0');
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
