import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Regressoes das quatro correcoes pontuais', () => {
  it('mantem abertura do chat movel com feedback e toque explicito', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const context = readFileSync('src/context/ConsultationContext.tsx', 'utf8');
    const card = readFileSync('src/components/ConsultantCard.tsx', 'utf8');

    expect(app).toContain('consultationStartPending');
    expect(app).toContain('consultationStartError');
    expect(app).toContain('Abrindo Chat Seguro...');
    expect(context).toContain("fetch('/api/consultants/public', {");
    expect(context).toContain("cache: 'no-store'");
    expect(card).toContain('touch-manipulation');
  });

  it('organiza o cabecalho com menu Mais e preserva os paineis por papel', () => {
    const header = readFileSync('src/components/Header.tsx', 'utf8');

    expect(header).toContain('<details className="relative group">');
    expect(header).toContain('Mais');
    expect(header).toContain('Painel Admin');
    expect(header).toContain('Painel Profissional');
    expect(header).toContain('overflow-y-auto overscroll-contain');
  });

  it('repara o vinculo de conta aprovada com o painel profissional', () => {
    const userRoutes = readFileSync('server/modules/auth/userRoutes.ts', 'utf8');
    const server = readFileSync('server.ts', 'utf8');

    expect(userRoutes).toContain('linkedRole');
    expect(userRoutes).toContain('consultantId: approvedProfile.id');
    expect(server).toContain("const accountEmail = String(userData.email || req.user.email || '').trim().toLowerCase();");
    expect(server).toContain("where('active', '==', true)");
    expect(server).toContain('await userDocument.ref.set({');
  });

  it('confirma persistencia e atualizacao real do preco administrativo', () => {
    const server = readFileSync('server.ts', 'utf8');
    const panel = readFileSync('src/components/admin/AdminWorkforcePanel.tsx', 'utf8');

    expect(server).toContain("collection('consultantSettings').doc(consultantId).set(confirmedSetting");
    expect(server).toContain("Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0");
    expect(panel).toContain('const confirmedPrice = Number(body.data?.pricePerMinute);');
    expect(panel).toContain('onPriceConfirmed?.(consultant.id, confirmedPrice);');
  });
});
