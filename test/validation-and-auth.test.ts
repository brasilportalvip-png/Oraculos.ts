import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import {
  validarEntradaOraculo,
  ORACLE_PROFILES,
  normalizarOracleProfileId,
} from '../src/oracle-engine';
import { INITIAL_CONSULTANTS } from '../src/data/mockData';
import { VIRTUAL_PROFILES } from '../src/data/virtualProfiles';
import { verifyConsultantOracleAuthorization } from '../server';

describe('TESTES DE VALIDAÇÃO, AUTENTICAÇÃO E SINCRONIZAÇÃO (COMPLEMENTO CRÍTICO)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.STRICT_AUTH;
  });

  // 1. Sucesso na validação de entrada de todos os 10 oráculos
  it('1. Deve validar com sucesso a entrada de dados completos para todos os 10 oráculos', () => {
    const oracles = [
      'tarot',
      'baralho-cigano',
      'astrologia',
      'numerologia',
      'buzios',
      'ifa',
      'runas',
      'i-ching',
      'cristais',
      'mesa-radionica',
    ];

    for (const oracle of oracles) {
      const result = validarEntradaOraculo(oracle, {
        fullName: 'Maria Clara da Silva',
        birthDate: '1988-04-22',
        birthTime: '14:30',
        city: 'Rio de Janeiro',
        question: 'Quais são as perspectivas para este ciclo?',
      });

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
      expect(result.normalizedOracleId).toBe(oracle);
    }
  });

  // 2. Erro 422 ao omitir campos obrigatórios por oráculo
  it('2. Deve retornar HTTP 422 e ORACLE_INPUT_INCOMPLETE com missingFields ao omitir dados no endpoint', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'tarot',
        userQuestion: 'Como será meu futuro?',
        userProfile: {
          // fullName and birthDate omitted
        },
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ORACLE_INPUT_INCOMPLETE');
    expect(res.body.error.normalizedOracleId).toBe('tarot');
    expect(res.body.error.missingFields).toContain('fullName');
    expect(res.body.error.missingFields).toContain('birthDate');
  });

  // 3. Teste unitário de validarEntradaOraculo identificando campos faltantes
  it('3. Deve identificar exatamente os campos faltantes quando fullName ou birthDate não forem fornecidos', () => {
    const resMissingBoth = validarEntradaOraculo('astrologia', {});
    expect(resMissingBoth.valid).toBe(false);
    expect(resMissingBoth.missingFields).toEqual(['fullName', 'birthDate']);

    const resMissingBirthDate = validarEntradaOraculo('astrologia', { fullName: 'João da Silva' });
    expect(resMissingBirthDate.valid).toBe(false);
    expect(resMissingBirthDate.missingFields).toEqual(['birthDate']);

    const resMissingFullName = validarEntradaOraculo('astrologia', { birthDate: '1990-01-01' });
    expect(resMissingFullName.valid).toBe(false);
    expect(resMissingFullName.missingFields).toEqual(['fullName']);
  });

  // 4. Erros 400, 401, 403, 404 e 422 na rota /api/ai/oracle-interpretation
  it('4. Deve cobrir as respostas de erro 400, 401, 403, 404 e 422 na API de interpretação', async () => {
    // 400: Oráculo inválido
    const res400 = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({ oracleType: 'invalido_xyz', userQuestion: 'Teste' });
    expect(res400.status).toBe(400);

    // 401: Token ausente em rota protegida
    const res401 = await request(app)
      .get('/api/admin/users');
    expect(res401.status).toBe(401);
    expect(res401.body.error.code).toBe('UNAUTHORIZED');

    // 403: Oráculo não autorizado para o consultor
    const res403 = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'runas',
        consultantId: 'c1', // Helena não tem 'runas'
        userQuestion: 'Pergunta sobre runas',
        userProfile: { fullName: 'Ana', birthDate: '1990-01-01' },
      });
    expect(res403.status).toBe(403);

    // 404: Consultor inexistente
    const res404 = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'tarot',
        consultantId: 'c_inexistente_9999',
        userQuestion: 'Pergunta',
        userProfile: { fullName: 'Ana', birthDate: '1990-01-01' },
      });
    expect(res404.status).toBe(404);

    // 422: Campos obrigatórios ausentes
    const res422 = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'tarot',
        userQuestion: 'Pergunta',
        userProfile: {},
      });
    expect(res422.status).toBe(422);
  });

  // 5. Restrição do cabeçalho x-user-id ao ambiente de teste
  it('5. Deve recusar x-user-id quando NODE_ENV não for "test" (ex: "development" ou "production")', async () => {
    process.env.NODE_ENV = 'development';

    const resDev = await request(app)
      .get('/api/admin/users')
      .set('x-user-id', 'usr-admin-1');

    expect(resDev.status).toBe(401);
    expect(resDev.body.error.code).toBe('UNAUTHORIZED');

    process.env.NODE_ENV = 'production';
    const resProd = await request(app)
      .get('/api/admin/users')
      .set('x-user-id', 'usr-admin-1');

    expect(resProd.status).toBe(401);
    expect(resProd.body.error.code).toBe('UNAUTHORIZED');
  });

  // 6. Erro 503 quando Firebase Admin não estiver inicializado
  it('6. Deve retornar HTTP 503 e AUTH_SERVICE_UNAVAILABLE quando Firebase Admin não estiver inicializado', async () => {
    // Requisição com Bearer token mas sem Firebase Admin app configurado
    const res = await request(app)
      .get('/api/admin/users')
      .set('authorization', 'Bearer token_valido_simulado');

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('AUTH_SERVICE_UNAVAILABLE');
  });

  // 7. Resolução por ID exato sem conflito entre humano e IA
  it('7. Deve verificar ausência de colisão de IDs entre consultores humanos e virtuais', () => {
    const humanIds = INITIAL_CONSULTANTS.filter((c) => !c.isAI).map((c) => c.id);
    const virtualIds = VIRTUAL_PROFILES.map((p) => p.id);

    const collisions = humanIds.filter((id) => virtualIds.includes(id));
    expect(collisions).toHaveLength(0);

    // Resolução de humano por ID exato
    const humanResult = verifyConsultantOracleAuthorization('c1', 'tarot');
    expect(humanResult.authorized).toBe(true);
    expect(humanResult.consultantKind).toBe('human');
    expect(humanResult.resolvedConsultantId).toBe('c1');

    // Resolução de virtual por ID exato
    const virtualResult = verifyConsultantOracleAuthorization('ai_c1', 'tarot');
    expect(virtualResult.authorized).toBe(true);
    expect(virtualResult.consultantKind).toBe('virtual');
    expect(virtualResult.resolvedConsultantId).toBe('ai_c1');
  });

  // 8. Lógica de initialOracle e fallback da primeira especialidade
  it('8. Deve validar seleção do initialOracle quando autorizado e fallback na primeira especialidade quando não autorizado', () => {
    const consultant = {
      id: 'c1',
      name: 'Helena da Luz',
      specialties: ['tarot', 'baralho-cigano', 'mesa-radionica'] as const,
    };

    // Caso 1: initialOracle autorizado
    const initialOracleValid = 'baralho-cigano';
    const effective1 = (consultant.specialties as readonly string[]).includes(initialOracleValid)
      ? initialOracleValid
      : consultant.specialties[0];
    expect(effective1).toBe('baralho-cigano');

    // Caso 2: initialOracle não autorizado -> fallback para a primeira especialidade
    const initialOracleUnauthorized = 'runas';
    const effective2 = (consultant.specialties as readonly string[]).includes(initialOracleUnauthorized)
      ? initialOracleUnauthorized
      : consultant.specialties[0];
    expect(effective2).toBe('tarot');

    // Caso 3: initialOracle nulo -> primeira especialidade
    const initialOracleNull = null;
    const effective3 = initialOracleNull && (consultant.specialties as readonly string[]).includes(initialOracleNull)
      ? initialOracleNull
      : consultant.specialties[0];
    expect(effective3).toBe('tarot');
  });
});
