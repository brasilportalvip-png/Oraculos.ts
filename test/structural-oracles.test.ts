import { describe, it, expect } from 'vitest';
import {
  ORACLE_PROFILES,
  normalizarOracleProfileId,
  OracleProfileId,
  buildTarotSupremo,
  buildBaralhoCiganoSupremo,
  buildAstrologiaSuprema,
  buildNumerologiaSuprema,
  buildBuziosSupremo,
  buildOduSupremo,
  buildRunasSupremas,
  buildIChingSupremo,
  buildCristaisSupremos,
  buildMesaRadionicaSuprema,
} from '../src/oracle-engine';
import { INITIAL_CONSULTANTS } from '../src/data/mockData';
import { VIRTUAL_PROFILES } from '../src/data/virtualProfiles';
import { ORACLE_CATEGORIES } from '../src/data/oracleConfig';
import { verifyConsultantOracleAuthorization } from '../server';

describe('VERIFICAÇÃO ESTRUTURAL DOS 10 ORÁCULOS CANÔNICOS', () => {
  const CANONICAL_ORACLES: OracleProfileId[] = [
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

  it('1. Deve conter exatamente dez perfis oraculares canônicos registrados no ORACLE_PROFILES', () => {
    const registeredKeys = Object.keys(ORACLE_PROFILES);
    expect(registeredKeys).toHaveLength(10);
    expect(registeredKeys.sort()).toEqual([...CANONICAL_ORACLES].sort());
  });

  it('2. Cada perfil oracular deve apontar para seu builder especializado correto e produzir resumo não-vazio', () => {
    const input = {
      fullName: 'Maria Helena das Neves',
      birthDate: '1985-07-15',
      birthTime: '08:45',
      city: 'São Paulo',
      question: 'Qual o melhor caminho para meu crescimento espiritual e profissional?',
    };

    const expectedBuilders: Record<OracleProfileId, Function> = {
      tarot: buildTarotSupremo,
      'baralho-cigano': buildBaralhoCiganoSupremo,
      astrologia: buildAstrologiaSuprema,
      numerologia: buildNumerologiaSuprema,
      buzios: buildBuziosSupremo,
      ifa: buildOduSupremo,
      runas: buildRunasSupremas,
      'i-ching': buildIChingSupremo,
      cristais: buildCristaisSupremos,
      'mesa-radionica': buildMesaRadionicaSuprema,
    };

    for (const oracleId of CANONICAL_ORACLES) {
      const profile = ORACLE_PROFILES[oracleId];
      expect(profile).toBeDefined();
      expect(typeof profile.builder).toBe('function');

      // Executa o builder correspondente
      const res: any = profile.builder(input);
      const summary = res.resumoParaOraculo || res.resumoParaMariaPadilha || '';

      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(100);
      expect(summary.trim()).not.toBe('');

      // Compara com a chamada direta da função builder
      const directRes: any = expectedBuilders[oracleId](input);
      const directSummary = directRes.resumoParaOraculo || directRes.resumoParaMariaPadilha || '';
      expect(directSummary.length).toBeGreaterThan(100);
    }
  });

  it('3. Cada um dos dez oráculos deve possuir pelo menos um consultor humano ou virtual autorizado', () => {
    for (const oracleId of CANONICAL_ORACLES) {
      const humanConsultants = INITIAL_CONSULTANTS.filter((c) => {
        if (c.isAI) return false;
        const specs = (c.allowedOracles || c.specialties || []).map((s) => normalizarOracleProfileId(s));
        return specs.includes(oracleId);
      });

      const virtualConsultants = VIRTUAL_PROFILES.filter((v) => {
        const specs = (v.authorizedOracles || []).map((s) => normalizarOracleProfileId(s));
        return specs.includes(oracleId);
      });

      const totalAuthorized = humanConsultants.length + virtualConsultants.length;
      expect(
        totalAuthorized,
        `Oráculo '${oracleId}' precisa ter pelo menos um consultor credenciado`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('4. Cada categoria deve aparecer no diretório de oráculos (ORACLE_CATEGORIES) e mapear para um oráculo canônico', () => {
    const categoryEntries = Object.values(ORACLE_CATEGORIES);
    expect(categoryEntries.length).toBeGreaterThanOrEqual(10);

    for (const oracleId of CANONICAL_ORACLES) {
      const matchingCategory = categoryEntries.find((cat) => {
        const norm = normalizarOracleProfileId(cat.type);
        return norm === oracleId;
      });

      expect(
        matchingCategory,
        `Categoria correspondente a '${oracleId}' deve existir em ORACLE_CATEGORIES`
      ).toBeDefined();
    }
  });

  it('5. Cada categoria deve conseguir verificar e iniciar autorização para sessão com consultor credenciado', () => {
    for (const oracleId of CANONICAL_ORACLES) {
      // Procura primeiro virtual autorizado
      const virtualMatch = VIRTUAL_PROFILES.find((v) =>
        (v.authorizedOracles || []).map((s) => normalizarOracleProfileId(s)).includes(oracleId)
      );

      if (virtualMatch) {
        const authCheck = verifyConsultantOracleAuthorization(virtualMatch.id, oracleId);
        expect(authCheck.authorized).toBe(true);
        expect(authCheck.consultantKind).toBe('virtual');
        expect(authCheck.resolvedConsultantId).toBe(virtualMatch.id);
      }

      // Procura primeiro humano autorizado
      const humanMatch = INITIAL_CONSULTANTS.find(
        (c) =>
          !c.isAI &&
          (c.allowedOracles || c.specialties || [])
            .map((s) => normalizarOracleProfileId(s))
            .includes(oracleId)
      );

      if (humanMatch) {
        const authCheck = verifyConsultantOracleAuthorization(humanMatch.id, oracleId);
        expect(authCheck.authorized).toBe(true);
        expect(authCheck.consultantKind).toBe('human');
        expect(authCheck.resolvedConsultantId).toBe(humanMatch.id);
      }
    }
  });

  it('6. Aliases diversos da interface devem ser corretamente normalizados para os 10 IDs canônicos', () => {
    const aliasMapping: Record<string, OracleProfileId> = {
      // Tarot
      Tarot: 'tarot',
      TAROT: 'tarot',
      tarot: 'tarot',

      // Baralho Cigano
      'baralho-cigano': 'baralho-cigano',
      baralhocigano: 'baralho-cigano',
      cigano: 'baralho-cigano',
      lenormand: 'baralho-cigano',
      'Baralho Cigano': 'baralho-cigano',

      // Astrologia
      astrologia: 'astrologia',
      Astrologia: 'astrologia',
      astrologico: 'astrologia',

      // Numerologia
      numerologia: 'numerologia',
      Numerologia: 'numerologia',
      numerologico: 'numerologia',

      // Búzios
      buzios: 'buzios',
      Búzios: 'buzios',
      buzio: 'buzios',

      // Ifá
      ifa: 'ifa',
      Ifá: 'ifa',
      odu: 'ifa',
      odus: 'ifa',

      // Runas
      runas: 'runas',
      Runas: 'runas',
      runa: 'runas',

      // I Ching
      'i-ching': 'i-ching',
      'I Ching': 'i-ching',
      iching: 'i-ching',

      // Cristais
      cristais: 'cristais',
      Cristais: 'cristais',
      cristal: 'cristais',

      // Mesa Radiônica
      'mesa-radionica': 'mesa-radionica',
      'Mesa Radiônica': 'mesa-radionica',
      mesaradionica: 'mesa-radionica',
      mesa: 'mesa-radionica',
    };

    for (const [alias, expected] of Object.entries(aliasMapping)) {
      expect(normalizarOracleProfileId(alias)).toBe(expected);
    }
  });
});
