import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import {
  app,
  consultationSessionsDb,
  usersDb,
} from '../server';

describe('Correção definitiva do chat, menu mobile e sincronização de preço', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';

    for (const key of Object.keys(consultationSessionsDb)) {
      delete consultationSessionsDb[key];
    }

    usersDb['usr-client-1'].balance = 150;
    usersDb['usr-client-1'].status = 'active';
  });

  it('retoma uma consulta ativa em vez de bloquear a abertura do chat', async () => {
    const first = await request(app)
      .post('/api/finance/start-consultation')
      .set('x-user-id', 'usr-client-1')
      .send({
        consultationId: 'mobile_session_original',
        consultantId: 'c1',
        oracleType: 'tarot',
        mode: 'chat',
      });

    expect(first.status).toBe(200);
    expect(first.body.success).toBe(true);
    expect(first.body.data.id).toBe('mobile_session_original');

    const second = await request(app)
      .post('/api/finance/start-consultation')
      .set('x-user-id', 'usr-client-1')
      .send({
        consultationId: 'mobile_session_nova_tentativa',
        consultantId: 'c2',
        oracleType: 'astrologia',
        mode: 'chat',
      });

    expect(second.status).toBe(200);
    expect(second.body.success).toBe(true);
    expect(second.body.data.id).toBe('mobile_session_original');
    expect(second.body.data.consultantId).toBe('c1');
    expect(second.body.data.resumed).toBe(true);
  });

  it('usa a sessão confirmada pelo servidor no frontend e aguarda a autenticação', () => {
    const context = readFileSync(
      'src/context/ConsultationContext.tsx',
      'utf8',
    );

    expect(context).toContain('await auth.authStateReady();');
    expect(context).toContain('const serverConsultationId =');
    expect(context).toContain('serverData.id.trim()');
    expect(context).toMatch(/id:\s*serverConsultationId/);
  });

  it('deixa os painéis logo abaixo de Trabalhe Conosco no menu mobile', () => {
    const header = readFileSync(
      'src/components/Header.tsx',
      'utf8',
    );

    const mobileStart = header.indexOf(
      '{/* Mobile Navigation Drawer Overlay */}',
    );
    const mobile = header.slice(mobileStart);

    expect(mobileStart).toBeGreaterThan(-1);
    expect(mobile.indexOf('Trabalhe Conosco')).toBeGreaterThan(-1);
    expect(mobile.indexOf('Painel do Usuário')).toBeGreaterThan(
      mobile.indexOf('Trabalhe Conosco'),
    );
    expect(mobile.indexOf('Painel do Funcionário')).toBeGreaterThan(
      mobile.indexOf('Trabalhe Conosco'),
    );
    expect(mobile).toContain('min-h-[58px]');
    expect(header).not.toContain('aria-label="Abrir painel profissional"');
  });

  it('mantém a ponte Admin -> contexto -> Marketplace para o preço', () => {
    const adminPanel = readFileSync(
      'src/components/admin/AdminWorkforcePanel.tsx',
      'utf8',
    );
    const adminDashboard = readFileSync(
      'src/components/admin/AdminDashboard.tsx',
      'utf8',
    );
    const context = readFileSync(
      'src/context/ConsultationContext.tsx',
      'utf8',
    );
    const card = readFileSync(
      'src/components/ConsultantCard.tsx',
      'utf8',
    );

    expect(adminPanel).toContain('onPriceConfirmed?.(consultant.id, confirmedPrice);');
    expect(adminDashboard).toContain('onPriceConfirmed={updateConsultantPrice}');
    expect(context).toContain("fetch('/api/consultants/public', {");
    expect(context).toContain("cache: 'no-store'");
    expect(card).toContain('consultant.pricePerMinute.toFixed(2)');
  });

  it('força renovação do cache PWA no celular', () => {
    const serviceWorker = readFileSync('public/sw.js', 'utf8');

    expect(serviceWorker).toContain('oraculos-ts-v2.7.1');
    expect(serviceWorker).not.toContain('oraculos-ts-v2.7.0');
  });
});
