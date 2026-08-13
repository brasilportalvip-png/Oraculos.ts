import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import {
  ORACLE_PROFILES,
  executarOracleProfile,
  normalizarOracleProfileId,
} from '../src/oracle-engine';

describe('BATERIA DE TESTES DOS 10 ORÁCULOS E AUTORIZAÇÕES DE CONSULTORES (ORACULOS.TS)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.STRICT_AUTH;
  });

  // TEST 1: Registros dos 10 Oráculos
  it('1. Deve ter exatamente os 10 oráculos registrados no ORACLE_PROFILES', () => {
    const profilesKeys = Object.keys(ORACLE_PROFILES);
    expect(profilesKeys).toHaveLength(10);
    expect(profilesKeys).toEqual(
      expect.arrayContaining([
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
      ])
    );
  });

  // TEST 2: Normalização de Aliases
  it('2. Deve normalizar corretamente os diferentes aliases e variações dos oráculos', () => {
    expect(normalizarOracleProfileId('tarot')).toBe('tarot');
    expect(normalizarOracleProfileId('baralho-cigano')).toBe('baralho-cigano');
    expect(normalizarOracleProfileId('cigano')).toBe('baralho-cigano');
    expect(normalizarOracleProfileId('lenormand')).toBe('baralho-cigano');
    expect(normalizarOracleProfileId('astrologia')).toBe('astrologia');
    expect(normalizarOracleProfileId('numerologia')).toBe('numerologia');
    expect(normalizarOracleProfileId('buzios')).toBe('buzios');
    expect(normalizarOracleProfileId('ifa')).toBe('ifa');
    expect(normalizarOracleProfileId('odu')).toBe('ifa');
    expect(normalizarOracleProfileId('runas')).toBe('runas');
    expect(normalizarOracleProfileId('i-ching')).toBe('i-ching');
    expect(normalizarOracleProfileId('iching')).toBe('i-ching');
    expect(normalizarOracleProfileId('cristais')).toBe('cristais');
    expect(normalizarOracleProfileId('mesa-radionica')).toBe('mesa-radionica');
    expect(normalizarOracleProfileId('mesaradionica')).toBe('mesa-radionica');
    expect(normalizarOracleProfileId('invalido')).toBeNull();
  });

  // TEST 3: Execução dos Builders de cada um dos 10 Oráculos
  it('3. Deve executar com sucesso os builders especializados de todos os 10 oráculos', () => {
    const inputSample = {
      fullName: 'Camila Fernandes de Souza',
      birthDate: '1994-08-12',
      birthTime: '10:15',
      city: 'São Paulo',
      question: 'Como estão meus caminhos financeiros e profissionais?',
    };

    const oraclesToTest = [
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

    for (const oracleId of oraclesToTest) {
      const result = executarOracleProfile(oracleId, inputSample) as any;
      expect(result).toBeDefined();
      expect(result.resumoParaOraculo || result.resumoParaMariaPadilha).toBeDefined();
    }
  });

  // TEST 4: API Rejeita Oráculo Inválido (400)
  it('4. Deve rejeitar requisição com oráculo inválido ou não suportado com HTTP 400', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'oraculo_inexistente_123',
        userQuestion: 'Minha pergunta',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_ORACLE');
  });

  // TEST 5: API Rejeita Consultor Inexistente (404)
  it('5. Deve retornar HTTP 404 ao solicitar interpretação com consultor inexistente', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'tarot',
        consultantId: 'c_inexistente_9999',
        userQuestion: 'Pergunta de teste',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONSULTANT_NOT_FOUND');
  });

  // TEST 6: API Rejeita Oráculo Não Autorizado para o Consultor (403)
  it('6. Deve proibir com HTTP 403 o uso de oráculo não autorizado para o consultor', async () => {
    // Helena da Luz (c1) possui especialidades 'tarot', 'cigano', 'mesaradionica' -> não autorizada para 'runas'
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'runas',
        consultantId: 'c1',
        userQuestion: 'Pergunta sobre runas',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ORACLE_UNAUTHORIZED_FOR_CONSULTANT');
  });

  // TEST 7: Chat Virtual Rejeita Atendente Inexistente (404)
  it('7. Deve retornar HTTP 404 em chat virtual se atendente não for encontrado', async () => {
    const res = await request(app)
      .post('/api/ai/virtual-attendant-chat')
      .set('x-user-id', 'usr-client-1')
      .send({
        attendantId: 'atendente_falso_999',
        userMessage: 'Olá',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ATTENDANT_NOT_FOUND');
  });

  // TEST 8: Chat Virtual Rejeita Oráculo Não Autorizado (403)
  it('8. Deve proibir com HTTP 403 oráculo não autorizado para atendente virtual', async () => {
    // Soraya Lenormand (ai_c3) está autorizada para 'cigano' -> não para 'astrologia'
    const res = await request(app)
      .post('/api/ai/virtual-attendant-chat')
      .set('x-user-id', 'usr-client-1')
      .send({
        attendantId: 'ai_c3',
        oracleType: 'astrologia',
        userMessage: 'Análise astrológica do meu signo',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ORACLE_UNAUTHORIZED_FOR_CONSULTANT');
  });
});
