import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  construirContextoTemporal,
  extrairDataAlvo,
  obterMomentoAtual,
  interpretarDataNascimento,
} from '../src/oracle-engine/temporal/temporalContext';
import { analisarTerceiros } from '../src/oracle-engine/engine/thirdPartyEngine';
import { blindarLinguagemOracular, contemLinguagemProibida } from '../src/oracle-engine/engine/languageGuard';
import { montarContextoConsulta, signoSolar } from '../src/oracle-engine/engine/consultationContext';
import { executarOracleProfile, normalizarDataNascimentoBR } from '../src/oracle-engine/profiles/index';
import { VOZES_ATENDENTES, obterVozAtendente } from '../src/data/attendantVoices';
import { VIRTUAL_PROFILES } from '../src/data/virtualProfiles';
import { montarBoasVindas, saudacaoPorHorario } from '../src/utils/timeGreeting';
import {
  buildCouponIdentityKeys,
  canonicalEmail,
  findExceededCouponIdentity,
  incrementCouponIdentities,
} from '../server/security/couponIdentity';

// Sábado, 31/10/2026 13:00 em Brasília (16:00 UTC)
const AGORA = new Date('2026-10-31T16:00:00Z');
const HOJE = { ano: 2026, mes: 10, dia: 31 };

describe('V7 — Relógio oracular (dia, hora, saudação)', () => {
  it('sabe a data, hora e saudação corretas no fuso de Brasília', () => {
    const m = obterMomentoAtual(AGORA);
    expect(m.ano).toBe(2026);
    expect(m.mes).toBe(10);
    expect(m.dia).toBe(31);
    expect(m.hora).toBe(13);
    expect(m.diaSemana).toBe('sábado');
    expect(m.saudacao).toBe('Boa tarde');
    expect(obterMomentoAtual(new Date('2026-10-31T11:00:00Z')).saudacao).toBe('Bom dia');
    expect(obterMomentoAtual(new Date('2026-10-31T23:30:00Z')).saudacao).toBe('Boa noite');
    expect(obterMomentoAtual(new Date('2026-11-01T05:00:00Z')).saudacao).toBe('Boa noite');
  });

  it('interpreta amanhã, daqui X dias, dia da semana e datas', () => {
    expect(extrairDataAlvo('amanhã tenho uma entrevista dará certo?', HOJE)?.data).toEqual({ ano: 2026, mes: 11, dia: 1 });
    expect(extrairDataAlvo('Daqui 4 dias terei uma entrevista no clube', HOJE)?.data).toEqual({ ano: 2026, mes: 11, dia: 4 });
    expect(extrairDataAlvo('depois de amanhã viajo', HOJE)?.diasAPartirDeHoje).toBe(2);
    expect(extrairDataAlvo('daqui a duas semanas assino', HOJE)?.diasAPartirDeHoje).toBe(14);
    expect(extrairDataAlvo('reunião na sexta-feira', HOJE)?.data).toEqual({ ano: 2026, mes: 11, dia: 6 });
    expect(extrairDataAlvo('dia 15 de novembro assino o contrato', HOJE)?.data).toEqual({ ano: 2026, mes: 11, dia: 15 });
    expect(extrairDataAlvo('no dia 20/11 tenho prova', HOJE)?.data).toEqual({ ano: 2026, mes: 11, dia: 20 });
    expect(extrairDataAlvo('vou ganhar dinheiro?', HOJE)).toBeNull();
  });

  it('não confunde data de nascimento com a data do acontecimento', () => {
    expect(extrairDataAlvo('meu sócio Pedro Lima nascido 02/02/1983 vai ser honesto?', HOJE)).toBeNull();
  });

  it('calcula energia do dia de hoje e do dia do acontecimento', () => {
    const ctx = construirContextoTemporal({ pergunta: 'daqui 4 dias tenho entrevista', dataNascimento: '1980-03-10', agora: AGORA });
    expect(ctx.energiaHoje.regentePlanetario).toBe('Saturno');
    expect(ctx.energiaDataAlvo?.regentePlanetario).toBe('Mercúrio');
    expect(ctx.energiaDataAlvo?.numeroPessoal).toBeGreaterThan(0);
  });

  it('aceita data de nascimento ISO e brasileira', () => {
    expect(interpretarDataNascimento('1983-02-02')).toEqual({ ano: 1983, mes: 2, dia: 2 });
    expect(interpretarDataNascimento('02/02/1983')).toEqual({ ano: 1983, mes: 2, dia: 2 });
    expect(interpretarDataNascimento('31/02/1983')).toBeNull();
  });

  it('saudação do front-end segue o horário e não duplica "Olá"', () => {
    expect(saudacaoPorHorario(new Date(2026, 9, 31, 9))).toBe('Bom dia');
    const texto = montarBoasVindas({
      nomeConsulente: 'Ana Souza',
      saudacaoAtendente: 'Olá, querida alma! As respostas estão prontas.',
      agora: new Date(2026, 9, 31, 20),
    });
    expect(texto.startsWith('Boa noite, Ana!')).toBe(true);
    expect(texto).not.toMatch(/Olá/);
  });
});

describe('V7 — Perguntas que envolvem outras pessoas', () => {
  it('parceria/sociedade', () => {
    const r = analisarTerceiros('estou montando uma parceria com Flavio Roberto Ortiz costa nascido 02/02/1983 dará certo?');
    expect(r.pessoas).toHaveLength(1);
    expect(r.pessoas[0].categoria).toBe('sociedade');
    expect(r.pessoas[0].nome).toBe('Flavio Roberto Ortiz costa');
    expect(r.pessoas[0].dataNascimentoTexto).toBe('02/02/1983');
  });

  it('gerente de emprego com empresa', () => {
    const r = analisarTerceiros(
      'Estou esperando a resposta de emprego que o gerente da empresa Gilmar Rodrigo Oliveira nascido 05/04/1985 empresa tustao dará certo?',
    );
    expect(r.pessoas).toHaveLength(1);
    expect(r.pessoas[0].categoria).toBe('emprego');
    expect(r.pessoas[0].nome).toBe('Gilmar Rodrigo Oliveira');
    expect(r.pessoas[0].empresa).toBe('tustao');
  });

  it('filho (família)', () => {
    const r = analisarTerceiros('Meu filho Antônio José Santos nascido 02/07/1999 vai conseguir se alinhar na vida?');
    expect(r.pessoas[0].categoria).toBe('familia');
    expect(r.pessoas[0].nome).toBe('Antônio José Santos');
  });

  it('empregada (contratação)', () => {
    const r = analisarTerceiros('Minha empregada Janice Rubens carvalho nascida 12/01/2005 dará certo trabalhar aqui?');
    expect(r.pessoas[0].categoria).toBe('contratacao');
    expect(r.pessoas[0].nome).toBe('Janice Rubens carvalho');
    expect(r.pessoas[0].dadosFaltantes).toEqual([]);
  });

  it('amor sem dados pede nome e data', () => {
    const r = analisarTerceiros('Meu namorado vai voltar?');
    expect(r.pessoas[0].categoria).toBe('amor');
    expect(r.pessoas[0].dadosFaltantes).toEqual(['nome completo', 'data de nascimento']);
  });

  it('pergunta sem outra pessoa', () => {
    expect(analisarTerceiros('Vou ganhar dinheiro esse ano?').envolveOutraPessoa).toBe(false);
  });
});

describe('V7 — Tiragem real ancorada nos dados natal', () => {
  it('30 consultas iguais produzem jogos diferentes', () => {
    const desfechos = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const r: any = executarOracleProfile('tarot', {
        fullName: 'Maria Souza Lima',
        birthDate: '1980-03-25',
        question: 'vou passar no concurso?',
        drawKey: String(1000003 * (i + 1) + i * 7919),
      });
      desfechos.add(r.tarot.tendencia.nome);
    }
    expect(desfechos.size).toBeGreaterThan(12);
  });

  it('data de nascimento do cadastro (AAAA-MM-DD) gera o signo correto', () => {
    expect(normalizarDataNascimentoBR('1980-03-25')).toBe('25/03/1980');
    const r: any = executarOracleProfile('astrologia', { fullName: 'Maria Souza', birthDate: '1980-03-25' });
    expect(r.resumoParaOraculo).toContain('Áries');
    expect(signoSolar({ ano: 1983, mes: 2, dia: 2 }).nome).toBe('Aquário');
  });

  it('contexto completo traz momento, dia do acontecimento e jogo da outra pessoa', () => {
    const c = montarContextoConsulta({
      oracleId: 'tarot',
      pergunta: 'parceria com Flavio Roberto Ortiz costa nascido 02/02/1983, assino amanhã, dará certo?',
      consulente: { nomeCompleto: 'Maria Souza Lima', dataNascimento: '1980-03-25' },
      agora: AGORA,
      aleatorio: 123456,
    });
    expect(c.blocoPrompt).toContain('Boa tarde');
    expect(c.blocoPrompt).toContain('domingo, 1 de novembro de 2026');
    expect(c.blocoPrompt).toContain('SOCIEDADE/PARCERIA');
    expect(c.blocoPrompt).toContain('Aquário');
    expect(c.resumoOraculoConsulente.length).toBeGreaterThan(100);
    expect(c.resumoOraculoConsulente).not.toMatch(/o que aconteceu no passado/i);
    expect(c.regrasDeLeitura).toMatch(/NUNCA comece falando de passado, presente ou futuro/);
  });
});

describe('V7 — Linguagem: magia preservada', () => {
  it('remove "simbólico", menções a IA e rótulos de passado/presente/futuro', () => {
    const saida = blindarLinguagemOracular(
      '**Passado:** Saiu a Torre.\nPresente: O Sol brilha. Como IA, não posso garantir. Esta leitura é simbólica.\nAs cartas foram sorteadas para você.',
    );
    expect(contemLinguagemProibida(saida)).toBe(false);
    expect(saida).not.toMatch(/Passado:|Presente:/);
    expect(saida).toContain('Saiu a Torre.');
    expect(saida).not.toMatch(/sorteadas/);
  });

  it('nenhum perfil de oráculo usa a palavra simbólico', () => {
    const dir = path.resolve(process.cwd(), 'src/oracle-engine/profiles');
    for (const f of fs.readdirSync(dir)) {
      const conteudo = fs.readFileSync(path.join(dir, f), 'utf8');
      expect(conteudo, f).not.toMatch(/simb[oó]lic/i);
    }
  });
});

describe('V7 — Personalidade única de cada atendente', () => {
  it('todos os 20 atendentes virtuais têm voz própria e diferente', () => {
    for (const p of VIRTUAL_PROFILES) {
      expect(VOZES_ATENDENTES[p.id], p.id).toBeDefined();
    }
    const assinaturas = new Set(Object.values(VOZES_ATENDENTES).map((v) => `${v.tratamento}|${v.marcas.join()}`));
    expect(assinaturas.size).toBe(Object.keys(VOZES_ATENDENTES).length);
    expect(obterVozAtendente('c_ai_c5')).toBe(VOZES_ATENDENTES.ai_c5);
  });
});

describe('V7 — Segurança: cupons e bônus por pessoa', () => {
  it('mesma pessoa em outra conta é bloqueada', () => {
    const conta1 = buildCouponIdentityKeys({
      ip: '177.10.20.30',
      deviceId: 'abcdef0123456789abcdef0123456789',
      birthFullName: 'Ana Beatriz Souza',
      birthDate: '1992-06-18',
      email: 'ana.souza@gmail.com',
    });
    const usos = incrementCouponIdentities({}, conta1);

    const conta2 = buildCouponIdentityKeys({
      ip: '200.1.1.1',
      deviceId: 'ffffffffffffffffffffffffffffffff',
      birthFullName: 'ANA BEATRIZ SOUZA',
      birthDate: '18/06/1992',
      email: 'anasouza+promo@gmail.com',
    });
    expect(findExceededCouponIdentity(usos, conta2, 1)).not.toBeNull();
  });

  it('pessoa diferente na mesma rede ainda consegue usar', () => {
    const a = buildCouponIdentityKeys({ ip: '177.10.20.30', birthFullName: 'Ana Souza', birthDate: '1992-06-18' });
    const b = buildCouponIdentityKeys({ ip: '177.10.20.30', birthFullName: 'Carlos Lima', birthDate: '1985-01-01' });
    expect(findExceededCouponIdentity(incrementCouponIdentities({}, a), b, 1)).toBeNull();
  });

  it('e-mail canônico ignora pontos e +apelido do Gmail', () => {
    expect(canonicalEmail('A.N.A+teste@Gmail.com')).toBe('ana@gmail.com');
  });
});
