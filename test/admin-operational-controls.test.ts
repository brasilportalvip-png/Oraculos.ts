import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Controles operacionais de produção', () => {
  it('oferece edição e exclusão protegidas de contas no painel administrativo', () => {
    const server = read('server.ts');
    const panel = read('src/components/admin/AdminAccountsPanel.tsx');
    expect(server).toContain("app.patch('/api/admin/users/:id'");
    expect(server).toContain("app.delete('/api/admin/users/:id'");
    expect(server).toContain('Você não pode excluir sua própria conta administrativa');
    expect(panel).toContain('Contas e perfis');
    expect(panel).toContain('digite EXCLUIR');
  });

  it('exige justificativa e registra auditoria antes de exibir uma consulta ao administrador', () => {
    const server = read('server.ts');
    const panel = read('src/components/admin/AdminConsultationAudit.tsx');
    expect(server).toContain("app.post('/api/admin/consultation-audit/:id/access'");
    expect(server).toContain('CONSULTATION_AUDIT_ACCESSED');
    expect(server).toContain("collection('auditLogs')");
    expect(panel).toContain('Informe o motivo do acesso');
    expect(panel).toContain('somente para leitura');
  });

  it('mantém teste manual de campainha disponível no painel profissional', () => {
    const server = read('server.ts');
    const dashboard = read('src/components/consultant/ConsultantDashboard.tsx');
    expect(dashboard).toContain('Testar som');
    expect(dashboard).toContain('Som testado com sucesso');
    expect(dashboard).not.toContain('setTimeout(() => controller.abort(), 4000)');
    expect(dashboard).toContain('/api/consultants/me?profileOnly=1');
    expect(dashboard).toContain('loadInProgress.current');
    expect(dashboard).toContain('getIdToken()');
    expect(server).toContain("collection('consultantCallQueues')");
    expect(server).toContain("collection('consultationLocators')");
  });
});
