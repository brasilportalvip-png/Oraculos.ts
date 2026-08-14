import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// 1. Mock do GoogleGenAI com captura de chamadas atômicas
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
import { ORACLE_PROFILES } from '../src/oracle-engine';

describe('BATERIA PARAMETRIZADA: 10 TESTES REAIS DA API (POST /api/ai/oracle-interpretation)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = 'test_gemini_api_key_valid_12345';
    mockGenerateContent.mockReset();
    mockGenerateContent.mockImplementation(async (params: any) => {
      const model = params.model || 'gemini-2.5-flash';
      return {
        text: `### Leitura Oracular Real\nInterpretação completa e detalhada para a jornada espiritual do consulente com base nos símbolos do oráculo.\n\n- **Forças Favoráveis**: Clareza e firmeza nas escolhas.\n- **Obstáculos**: Impaciência.\n- **Orientação**: Cultivar serenidade.`,
      };
    });
  });

  const fullUserProfile = {
    fullName: 'Ana Beatriz Souza Oliveira',
    birthFullName: 'Ana Beatriz Souza Oliveira',
    name: 'Ana Beatriz',
    birthDate: '1992-06-18',
    birthTime: '10:15',
    city: 'Curitiba',
  };

  // CASO 1: Tarot (Humano: c1 - Helena da Luz)
  it('1. [TAROT] Deve processar consulta real com consultor humano c1 (Helena da Luz) e builder de Tarot', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'tarot',
        consultantId: 'c1',
        userQuestion: 'Quais são as perspectivas para meu novo projeto profissional?',
        userProfile: fullUserProfile,
        cardOrSymbol: 'O Sol + A Estrela',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('tarot');
    expect(res.body.data.consultant).toEqual({
      id: 'c1',
      name: 'Helena da Luz',
      kind: 'human',
    });
    expect(res.body.data.interpretation).toContain('Leitura Oracular Real');

    // Confirmação do mock Gemini
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('tarot');
    expect(callArgs.config.systemInstruction).toContain('tarot');
  });

  // CASO 2: Baralho Cigano (Virtual: ai_c3 - Soraya Lenormand)
  it('2. [BARALHO-CIGANO] Deve processar consulta real com consultora virtual ai_c3 (Soraya Lenormand) e builder Lenormand', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'baralho-cigano',
        consultantId: 'ai_c3',
        userQuestion: 'Como harmonizar os relacionamentos na minha vida afetiva?',
        userProfile: fullUserProfile,
        cardOrSymbol: 'O Trevo + O Coração',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('baralho-cigano');
    expect(res.body.data.consultant).toEqual({
      id: 'ai_c3',
      name: 'Soraya Lenormand',
      kind: 'virtual',
    });
    expect(res.body.data.interpretation).toContain('Leitura Oracular Real');

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('baralho-cigano');
  });

  // CASO 3: Astrologia (Humano: c2 - Mestre Gabriel Astros)
  it('3. [ASTROLOGIA] Deve processar consulta real com consultor humano c2 (Mestre Gabriel Astros) e builder de Astrologia', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'astrologia',
        consultantId: 'c2',
        userQuestion: 'Qual o trânsito planetário mais relevante para este semestre?',
        userProfile: fullUserProfile,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('astrologia');
    expect(res.body.data.consultant).toEqual({
      id: 'c2',
      name: 'Mestre Gabriel Astros',
      kind: 'human',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('astrologia');
  });

  // CASO 4: Numerologia (Virtual: ai_c7 - Gabriel Áurea)
  it('4. [NUMEROLOGIA] Deve processar consulta real com consultor virtual ai_c7 (Gabriel Áurea) e builder de Numerologia', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'numerologia',
        consultantId: 'ai_c7',
        userQuestion: 'Qual a vibração do meu número de destino para este ano pessoal?',
        userProfile: fullUserProfile,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('numerologia');
    expect(res.body.data.consultant).toEqual({
      id: 'ai_c7',
      name: 'Gabriel Áurea',
      kind: 'virtual',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('numerologia');
  });

  // CASO 5: Búzios (Humano: c3 - Mãe Serena de Oya)
  it('5. [BUZIOS] Deve processar consulta real com consultora humana c3 (Mãe Serena de Oya) e builder de Búzios', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'buzios',
        consultantId: 'c3',
        userQuestion: 'Como fortalecer minha proteção e caminhos espirituais?',
        userProfile: fullUserProfile,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('buzios');
    expect(res.body.data.consultant).toEqual({
      id: 'c3',
      name: 'Mãe Serena de Oya',
      kind: 'human',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('buzios');
  });

  // CASO 6: Ifá (Virtual: ai_c5 - Mãe Serena de Oya)
  it('6. [IFA] Deve processar consulta real com consultora virtual ai_c5 (Mãe Serena de Oya) e builder de Odù / Ifá', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'ifa',
        consultantId: 'ai_c5',
        userQuestion: 'Qual orientação ancestral os Odùs revelam para meu momento?',
        userProfile: fullUserProfile,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('ifa');
    expect(res.body.data.consultant).toEqual({
      id: 'ai_c5',
      name: 'Mãe Serena de Oya',
      kind: 'virtual',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('ifa');
  });

  // CASO 7: Runas (Humano: c5 - Sábio Liam Nordic)
  it('7. [RUNAS] Deve processar consulta real com consultor humano c5 (Sábio Liam Nordic) e builder de Runas Nórdicas', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'runas',
        consultantId: 'c5',
        userQuestion: 'Quais conselhos o Futhark traz para a superação deste desafio?',
        userProfile: fullUserProfile,
        cardOrSymbol: 'Fehu + Ansuz',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('runas');
    expect(res.body.data.consultant).toEqual({
      id: 'c5',
      name: 'Sábio Liam Nordic',
      kind: 'human',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('runas');
  });

  // CASO 8: I Ching (Virtual: ai_c12 - Samuel Sagrado)
  it('8. [I-CHING] Deve processar consulta real com consultor virtual ai_c12 (Samuel Sagrado) e builder do Livro das Mutações', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'i-ching',
        consultantId: 'ai_c12',
        userQuestion: 'Como agir com sabedoria e estratégia diante das mudanças atuais?',
        userProfile: fullUserProfile,
        cardOrSymbol: 'Hexagrama 1 (O Criativo)',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('i-ching');
    expect(res.body.data.consultant).toEqual({
      id: 'ai_c12',
      name: 'Samuel Sagrado',
      kind: 'virtual',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('i-ching');
  });

  // CASO 9: Cristais (Humano: c4 - Aura Celeste)
  it('9. [CRISTAIS] Deve processar consulta real com consultora humana c4 (Aura Celeste) e builder de Litoterapia / Cristais', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'cristais',
        consultantId: 'c4',
        userQuestion: 'Qual cristal e alinhamento mineral é mais recomendado para meu campo vibratório?',
        userProfile: fullUserProfile,
        cardOrSymbol: 'Ametista + Quartzo Rosa',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('cristais');
    expect(res.body.data.consultant).toEqual({
      id: 'c4',
      name: 'Aura Celeste',
      kind: 'human',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('cristais');
  });

  // CASO 10: Mesa Radiônica (Virtual: ai_c1 - Aura Celeste)
  it('10. [MESA-RADIONICA] Deve processar consulta real com consultora virtual ai_c1 (Aura Celeste) e builder de Mesa Radiônica', async () => {
    const res = await request(app)
      .post('/api/ai/oracle-interpretation')
      .set('x-user-id', 'usr-client-1')
      .send({
        oracleType: 'mesa-radionica',
        consultantId: 'ai_c1',
        userQuestion: 'Quais frequências e bloqueios precisam ser transmutados na mesa quântica?',
        userProfile: fullUserProfile,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.normalizedOracleId).toBe('mesa-radionica');
    expect(res.body.data.consultant).toEqual({
      id: 'ai_c1',
      name: 'Aura Celeste',
      kind: 'virtual',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('RESULTADO INTERNO DO PERFIL ORACULAR:');
    expect(callArgs.contents).toContain('mesa-radionica');
  });
});
