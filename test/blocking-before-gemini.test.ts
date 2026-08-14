import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

export const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: function MockGoogleGenAI() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    },
  };
});

import { app } from '../server';

describe('TESTE DE BLOQUEIO ANTES DO GEMINI (400, 401, 403, 404, 422, 503)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = 'valid_test_key';
    mockGenerateContent.mockReset();
  });

  const validProfile = {
    fullName: 'Carlos Eduardo Santos',
    birthDate: '1987-11-23',
    birthTime: '15:00',
    city: 'Belo Horizonte',
  };

  // CASO 400: Oráculo Inválido
  it('1. Deve retornar HTTP 400 e ZERO chamadas ao Gemini para oráculo inválido', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'oraculo_fantasma_xyz',
        userQuestion: 'Pergunta de teste',
        userProfile: validProfile,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_ORACLE');
    expect(mockGenerateContent).toHaveBeenCalledTimes(0);
  });

  // CASO 401: Token / Usuário Não Fornecido
  it('2. Deve retornar HTTP 401 e ZERO chamadas ao Gemini quando não autenticado', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .send({
        oracleType: 'tarot',
        userQuestion: 'Pergunta de teste',
        userProfile: validProfile,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(mockGenerateContent).toHaveBeenCalledTimes(0);
  });

  // CASO 403: Oráculo Não Autorizado para o Consultor
  it('3. Deve retornar HTTP 403 e ZERO chamadas ao Gemini quando o consultor não for autorizado para o oráculo', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'runas',
        consultantId: 'c1', // Helena da Luz só atende Tarot, Cigano e Mesa Radiônica
        userQuestion: 'Pergunta sobre runas',
        userProfile: validProfile,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ORACLE_UNAUTHORIZED_FOR_CONSULTANT');
    expect(mockGenerateContent).toHaveBeenCalledTimes(0);
  });

  // CASO 404: Consultor Não Encontrado
  it('4. Deve retornar HTTP 404 e ZERO chamadas ao Gemini quando o consultorId não existir', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'tarot',
        consultantId: 'consultor_inexistente_99999',
        userQuestion: 'Pergunta de teste',
        userProfile: validProfile,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONSULTANT_NOT_FOUND');
    expect(mockGenerateContent).toHaveBeenCalledTimes(0);
  });

  // CASO 422: Dados Obrigatórios Ausentes no userProfile
  it('5. Deve retornar HTTP 422 e ZERO chamadas ao Gemini quando faltarem campos obrigatórios no perfil', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'astrologia',
        userQuestion: 'Qual o meu mapa?',
        userProfile: {
          // Omissão proposital de fullName e birthDate
        },
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ORACLE_INPUT_INCOMPLETE');
    expect(res.body.error.missingFields).toContain('fullName');
    expect(res.body.error.missingFields).toContain('birthDate');
    expect(mockGenerateContent).toHaveBeenCalledTimes(0);
  });

  // CASO 503: GEMINI_API_KEY Ausente / Indisponível
  it('6. Deve retornar HTTP 503 e ZERO chamadas ao Gemini quando GEMINI_API_KEY não estiver configurada', async () => {
    delete process.env.GEMINI_API_KEY;

    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'tarot',
        consultantId: 'c1',
        userQuestion: 'Pergunta sobre tarot',
        userProfile: validProfile,
      });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('GEMINI_UNAVAILABLE');
    expect(mockGenerateContent).toHaveBeenCalledTimes(0);
  });
});
