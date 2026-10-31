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

  it('abre diretamente a conversa original em modo somente leitura para o administrador', () => {
    const server = read('server.ts');
    const panel = read('src/components/admin/AdminConsultationAudit.tsx');
    expect(server).toContain("app.post('/api/admin/consultation-audit/:id/access'");
    expect(server).toContain("collection('consultationLocators')");
    expect(panel).not.toContain('Informe o motivo do acesso');
    expect(panel).toContain('somente para leitura');
  });

  it('mantém teste manual de campainha disponível no painel profissional', () => {
    const server = read('server.ts');
    const dashboard = read('src/components/consultant/ConsultantDashboard.tsx');
    expect(dashboard).toContain('Testar som');
    expect(dashboard).toContain('Som testado com sucesso');
    expect(dashboard).not.toContain('setTimeout(() => controller.abort(), 4000)');
    expect(dashboard).toContain('/api/consultants/me?liveOnly=1');
    expect(dashboard).toContain('loadInProgress.current');
    expect(dashboard).toContain('getIdToken()');
    expect(server).toContain("collection('consultantCallQueues')");
    expect(server).toContain("collection('consultationLocators')");
    expect(dashboard).toContain('audioContextRef.current');
    expect(dashboard).toContain('navigator.vibrate');
    expect(dashboard).toContain('Campainha ativa');
  });

  it('oferece vídeo opcional com preço separado e sala compartilhada', () => {
    const server = read('server.ts');
    const card = read('src/components/ConsultantCard.tsx');
    const room = read('src/components/VideoMeeting.tsx');
    expect(server).toContain('videoPricePerMinute');
    expect(server).toContain("'/api/consultants/me/video-settings'");
    expect(card).toContain("onStartConsultation(consultant, chosenOracle, 'video')");
    expect(room).toContain('domain="meet.jit.si"');
  });

  it('remove nomes repetidos da lista final do marketplace', () => {
    const context = read('src/context/ConsultationContext.tsx');
    expect(context).toContain('mergedProfiles.filter');
    expect(context).toContain('normalizeProfileName(candidate.name)');
  });
});
