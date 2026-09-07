import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, consultationSessionsDb, usersDb } from '../server';

describe('Recuperação de consulta ativa', () => {
  it('devolve a consulta ativa do usuário autenticado', async () => {
    usersDb['usr-client-1'] = { ...(usersDb['usr-client-1'] || {}), id: 'usr-client-1', balance: 100 } as any;
    consultationSessionsDb['usr-client-1:recover-active'] = {
      id: 'recover-active',
      userId: 'usr-client-1',
      consultantId: 'c1',
      consultantName: 'Especialista',
      pricePerMinute: 2.5,
      startedAt: new Date().toISOString(),
      oracleType: 'tarot',
      mode: 'chat',
      status: 'active',
    };

    const response = await request(app)
      .get('/api/finance/active-consultation')
      .set('x-user-id', 'usr-client-1');

    expect(response.status).toBe(200);
    expect(response.body.data.activeSession.id).toBe('recover-active');
    delete consultationSessionsDb['usr-client-1:recover-active'];
  });

  it('não devolve consulta encerrada como ativa', async () => {
    consultationSessionsDb['usr-client-1:recover-completed'] = {
      id: 'recover-completed',
      userId: 'usr-client-1',
      consultantId: 'c1',
      consultantName: 'Especialista',
      pricePerMinute: 2.5,
      startedAt: new Date().toISOString(),
      status: 'completed',
    };

    const response = await request(app)
      .get('/api/finance/active-consultation')
      .set('x-user-id', 'usr-client-1');

    expect(response.status).toBe(200);
    expect(response.body.data.activeSession).toBeNull();
    delete consultationSessionsDb['usr-client-1:recover-completed'];
  });

  it('libera o usuário imediatamente depois do encerramento', async () => {
    usersDb['usr-client-1'] = { ...(usersDb['usr-client-1'] || {}), id: 'usr-client-1', balance: 100 } as any;
    consultationSessionsDb['usr-client-1:finish-and-release'] = {
      id: 'finish-and-release',
      userId: 'usr-client-1',
      consultantId: 'c1',
      consultantName: 'Especialista',
      pricePerMinute: 2.5,
      startedAt: new Date().toISOString(),
      oracleType: 'tarot',
      mode: 'chat',
      status: 'active',
    };

    const finish = await request(app)
      .post('/api/finance/debit-consultation')
      .set('x-user-id', 'usr-client-1')
      .send({ consultationId: 'finish-and-release', consultantId: 'c1' });
    expect(finish.status).toBe(200);

    const lookup = await request(app)
      .get('/api/finance/active-consultation')
      .set('x-user-id', 'usr-client-1');
    expect(lookup.status).toBe(200);
    expect(lookup.body.data.activeSession).toBeNull();
    delete consultationSessionsDb['usr-client-1:finish-and-release'];
  });
});
