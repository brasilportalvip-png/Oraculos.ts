import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import {
  app,
  usersDb,
  securityConfig,
  blacklistedIPs,
  couponsDb,
  processedPaymentIds,
  userDailyAiUsage,
} from '../server';

describe('BATERIA DE TESTES DE SEGURANÇA E AUDITORIA TÉCNICA (ORACULOS.TS)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.STRICT_AUTH;

    // Reset test user balance & role
    if (usersDb['usr-client-1']) {
      usersDb['usr-client-1'].balance = 150.0;
      usersDb['usr-client-1'].role = 'user';
    }
  });

  // TEST 1: Token Ausente / Inválido (401) ou Firebase Admin Indisponível (503)
  it('1. Deve retornar HTTP 401 se token não for fornecido e HTTP 503 se Firebase Admin estiver indisponível', async () => {
    const resNoToken = await request(app)
      .get('/api/admin/users');

    expect(resNoToken.status).toBe(401);
    expect(resNoToken.body.error.code).toBe('UNAUTHORIZED');

    const resWithToken = await request(app)
      .get('/api/admin/users')
      .set('authorization', 'Bearer token_qualquer');

    expect(resWithToken.status).toBe(503);
    expect(resWithToken.body.error.code).toBe('AUTH_SERVICE_UNAVAILABLE');
  });

  // TEST 2: Usuário Comum Acessando Área Admin (RBAC)
  it('2. Deve proibir usuário comum (role=user) de acessar rota administrativa (/api/admin/users) com HTTP 403', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('x-user-id', 'usr-client-1');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
  });

  // TEST 3: Fallback Dev Bloqueado em Produção
  it('3. Deve BLOQUEAR estritamente headers de simulação (x-user-id) quando em ambiente de PRODUÇÃO', async () => {
    process.env.NODE_ENV = 'production';

    const res = await request(app)
      .get('/api/admin/users')
      .set('x-user-id', 'usr-admin-1');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // TEST 4: Rejeição de Valor Adulterado no Checkout Mercado Pago
  it('4. Deve rejeitar recargas com valores arbitrários não autorizados (ex: R$ 0,01) com HTTP 400', async () => {
    const res = await request(app)
      .post('/api/finance/create-preference')
      .set('x-user-id', 'usr-client-1')
      .send({ amount: 0.01 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PACKAGE');
  });

  // TEST 5: Webhook com Assinatura HMAC Inválida
  it('5. Deve rejeitar webhooks com assinatura x-signature HMAC inválida', async () => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = 'segredo_oficial_webhook_123';

    const res = await request(app)
      .post('/api/finance/webhook?id=999111')
      .set('x-signature', 'ts=1700000000,v1=hash_falso_hacker_321')
      .set('x-request-id', 'req-999')
      .send({ data: { id: '999111' } });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Assinatura do webhook inválida.');

    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  });

  // TEST 6: Webhook Repetido (Idempotência)
  it('6. Deve ignorar webhooks de pagamento duplicados por idempotência', async () => {
    processedPaymentIds.add('webhook_payment_777888');

    const res = await request(app)
      .post('/api/finance/webhook')
      .send({ data: { id: '777888' } });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('already_processed');
  });

  // TEST 7: Débito em Saldo Insuficiente
  it('7. Deve bloquear início de consulta e retornar HTTP 400 se o usuário não tiver saldo suficiente', async () => {
    usersDb['usr-client-1'].balance = 5.0; // Saldo de R$ 5,00

    const res = await request(app)
      .post('/api/finance/debit-consultation')
      .set('x-user-id', 'usr-client-1')
      .send({ amount: 50.0, consultantId: 'cons-1', durationMinutes: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INSUFFICIENT_FUNDS');
  });

  // TEST 8: Débito Concorrente / Atualização Atômica
  it('8. Deve processar débitos consecutivos sem gerar saldo negativo', async () => {
    usersDb['usr-client-1'].balance = 30.0;

    const res1 = await request(app)
      .post('/api/finance/debit-consultation')
      .set('x-user-id', 'usr-client-1')
      .send({ amount: 20.0, consultantId: 'cons-1' });

    expect(res1.status).toBe(200);
    expect(usersDb['usr-client-1'].balance).toBe(10.0);

    const res2 = await request(app)
      .post('/api/finance/debit-consultation')
      .set('x-user-id', 'usr-client-1')
      .send({ amount: 20.0, consultantId: 'cons-1' });

    expect(res2.status).toBe(400);
    expect(res2.body.error.code).toBe('INSUFFICIENT_FUNDS');
    expect(usersDb['usr-client-1'].balance).toBe(10.0); // Saldo preservado sem valor negativo
  });

  // TEST 9: Alteração de Papel pelo Frontend Negada
  it('9. Deve impedir que um usuário cliente altere seu próprio papel enviando requisição sem privilégio superadmin', async () => {
    const res = await request(app)
      .post('/api/admin/update-user-role')
      .set('x-user-id', 'usr-client-1')
      .send({ targetUserId: 'usr-client-1', newRole: 'admin' });

    expect(res.status).toBe(403);
    expect(usersDb['usr-client-1'].role).toBe('user');
  });

  // TEST 10: Alteração Direta de Crédito pelo Frontend Negada
  it('10. Deve impedir que usuário comum altere saldo via endpoint de ajuste administrativo', async () => {
    const res = await request(app)
      .post('/api/admin/adjust-balance')
      .set('x-user-id', 'usr-client-1')
      .send({ targetUserId: 'usr-client-1', amount: 1000, type: 'add', reason: 'Hack de saldo' });

    expect(res.status).toBe(403);
    expect(usersDb['usr-client-1'].balance).toBe(150.0);
  });

  // TEST 11: Prompt Excessivamente Grande no Gemini AI
  it('11. Deve rejeitar prompts de IA com mais de 2.000 caracteres com HTTP 400', async () => {
    const hugePrompt = 'A'.repeat(2500);

    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({ oracleType: 'tarot', userQuestion: hugePrompt });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PROMPT_TOO_LONG');
  });

  // TEST 12: Bloqueio por WAF em IP na Blacklist
  it('12. Deve bloquear com HTTP 403 requisições vindas de IPs na Lista Negra do WAF', async () => {
    blacklistedIPs.add('203.0.113.199');

    const res = await request(app)
      .get('/api/health')
      .set('x-forwarded-for', '203.0.113.199');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('WAF_IP_BLOCKED');

    blacklistedIPs.delete('203.0.113.199');
  });
});
