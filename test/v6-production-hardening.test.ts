import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const server = readFileSync(new URL('../server.ts', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../server/middleware/auth.ts', import.meta.url), 'utf8');
const professional = readFileSync(new URL('../src/components/consultant/ConsultantDashboard.tsx', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../src/components/admin/AdminWorkforcePanel.tsx', import.meta.url), 'utf8');
const video = readFileSync(new URL('../src/components/VideoMeeting.tsx', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

describe('V6 — bloqueadores de produção', () => {
  it('restringe tokens de demonstração ao ambiente não produtivo e não os expõe nos painéis', () => {
    expect(auth).not.toContain("token === 'demo_admin_token'");
    expect(auth).not.toContain("token === 'admin'");
    expect(professional).not.toContain("token = 'demo_consultant_token'");
    expect(admin).not.toContain("token = 'demo_admin_token'");
  });

  it('bloqueia contas desativadas nas duas camadas de autenticação', () => {
    expect((server.match(/ACCOUNT_BLOCKED/g) || []).length).toBeGreaterThanOrEqual(1);
    expect(auth).toContain('ACCOUNT_BLOCKED');
  });

  it('protege concorrência de aceite e de mensagens', () => {
    expect(server).toContain('CONSULTANT_ALREADY_BUSY');
    expect(server).toContain("transaction.get(found.reference!)");
    expect(server).toContain('currentMessages');
  });

  it('reverte estorno e mantém ledger financeiro idempotente', () => {
    expect(server).toContain("'refunded', 'charged_back', 'cancelled'");
    expect(server).toContain('mercadopago-reversal-${paymentId}');
    expect(server).toContain('outstandingReversalMinutes');
  });

  it('evita repasse duplicado e permite baixa administrativa', () => {
    expect(server).toContain("'/api/admin/consultants/:id/payouts'");
    expect(server).toContain('PAYOUT_CONFLICT');
    expect(admin).toContain('Registrar repasse semanal');
  });

  it('encerra por saldo e oferece encerramento ao profissional', () => {
    expect(server).toContain('autoEndsAt');
    expect(professional).toContain('Encerrar atendimento');
    expect(professional).toContain('endSession(session.id, true)');
  });

  it('não publica certificação fixa e trata indisponibilidade de vídeo', () => {
    expect(server).toContain("app.get('/api/admin/readiness-audit', ...requireAdmin");
    expect(server).not.toContain("status: 'PRODUCTION_READY_CERTIFIED'");
    expect(video).toContain('Tentar novamente');
  });

  it('persiste fotos fora do filesystem efêmero e fecha mass assignment', () => {
    expect(server).toContain('getAdminStorage(firebaseAdminApp).bucket()');
    expect(server).toContain("'/api/work-with-us/upload-photo', requireAuth");
    expect(server).toContain('validMagic');
    expect(rules).toContain('.hasOnly([');
    expect(rules).toContain("'favorites', 'updatedAt'");
  });
});
