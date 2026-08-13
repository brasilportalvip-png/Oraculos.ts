import { Hexagram } from '../types/oracle';

export const HEXAGRAMS: Record<string, Hexagram> = {
  '111111': {
    number: 1,
    namePt: 'Ch’ien — O Criativo',
    nameZh: '乾',
    pinyin: 'Qián',
    binary: '111111',
    upperTrigram: 'Céu (Ch’ien)',
    lowerTrigram: 'Céu (Ch’ien)',
    judgment: 'O Criativo traz o supremo sucesso. A perseverança favorece a iluminação. A energia vital encontra-se em seu ponto mais alto e puro.',
    image: 'O movimento do Céu é cheio de poder. O sábio se fortalece incessantemente e age com nobreza impecável.',
    meaning: 'Momento de liderança, criação pura, poder de iniciativa e conexão com forças espirituais elevadas. Aja com integridade moral exemplar.'
  },
  '000000': {
    number: 2,
    namePt: 'K’un — O Receptivo',
    nameZh: '坤',
    pinyin: 'Kūn',
    binary: '000000',
    upperTrigram: 'Terra (K’un)',
    lowerTrigram: 'Terra (K’un)',
    judgment: 'O Receptivo gera grande progresso através do acolhimento. Favorece a perseverança da égua: paciência, devoção e capacidade de sustentação.',
    image: 'A condição da Terra é a receptividade amorosa. O sábio apoia o mundo com vastidão de caráter e flexibilidade.',
    meaning: 'Não force as coisas. Escute, nutri e permita que os acontecimentos se desenvolvam. Sabedoria está em seguir a liderança correta.'
  },
  '100010': {
    number: 3,
    namePt: 'Chun — A Dificuldade Inicial',
    nameZh: '屯',
    pinyin: 'Zhūn',
    binary: '100010',
    upperTrigram: 'Água (K’an)',
    lowerTrigram: 'Trovão (Chen)',
    judgment: 'A Dificuldade Inicial traz supremo sucesso se houver perseverança. Nada deve ser feito com precipitação. Nomeie auxiliares.',
    image: 'Nuvem e Trovão. O sábio põe em ordem o caos nascente com paciência.',
    meaning: 'Como um broto rompendo a terra dura, o início exige esforço. Mantenha a visão clara sem desanimar diante dos primeiros obstáculos.'
  },
  '010001': {
    number: 4,
    namePt: 'Mêng — A Inexperiência Juvenil',
    nameZh: '蒙',
    pinyin: 'Méng',
    binary: '010001',
    upperTrigram: 'Montanha (Kên)',
    lowerTrigram: 'Água (K’an)',
    judgment: 'Não sou eu quem busca o jovem inexperiente; é ele quem me busca. A primeira consulta traz clareza; repetições desrespeitosas trazem silêncio.',
    image: 'Sob a montanha brota uma fonte. O sábio cultiva seu caráter com postura reta.',
    meaning: 'Seja humilde para aprender. Reconheça a própria inexperiência e busque instrutores sábios sem teimosia.'
  },
  '111010': {
    number: 5,
    namePt: 'Hsü — A Espera (A Nutrição)',
    nameZh: '需',
    pinyin: 'Xū',
    binary: '111010',
    upperTrigram: 'Água (K’an)',
    lowerTrigram: 'Céu (Ch’ien)',
    judgment: 'Esperar com sinceridade traz luz e sucesso. A perseverança traz boa sorte. Atravessar a grande água favorece o destino.',
    image: 'Nuvens sobem no Céu. O sábio come, bebe e descansa em paz festiva enquanto aguarda a chuva.',
    meaning: 'Espere o momento certo sem ansiedade devoradora. Nutra suas forças enquanto as condições externas amadurecem.'
  },
  '010111': {
    number: 6,
    namePt: 'Sung — O Conflito',
    nameZh: '訟',
    pinyin: 'Sòng',
    binary: '010111',
    upperTrigram: 'Céu (Ch’ien)',
    lowerTrigram: 'Água (K’an)',
    judgment: 'O Conflito surge quando se é sincero mas obstruído. Um meio-termo traz boa sorte; levar a disputa às últimas consequências traz infortúnio.',
    image: 'O Céu e a Água se movem em direções opostas. O sábio planeja o início de qualquer questão com cuidado meticuloso.',
    meaning: 'Busque a conciliação e evite litígios obstinados. Nem todas as batalhas valem a energia gasta.'
  },
  '010000': {
    number: 7,
    namePt: 'Shih — O Exército (Disciplina)',
    nameZh: '師',
    pinyin: 'Shī',
    binary: '010000',
    upperTrigram: 'Terra (K’un)',
    lowerTrigram: 'Água (K’an)',
    judgment: 'O Exército exige perseverança e um líder maduro e respeitado. Nenhuma culpa se houver disciplina justa.',
    image: 'No centro da Terra há Água armazenada. O sábio acolhe o povo e organiza suas forças com benevolência disciplinada.',
    meaning: 'Mobilize suas forças internas com disciplina rigorosa e propósito nobre. A organização é a chave para a superação.'
  },
  '000010': {
    number: 8,
    namePt: 'Pi — A União (Solidariedade)',
    nameZh: '比',
    pinyin: 'Bǐ',
    binary: '000010',
    upperTrigram: 'Água (K’an)',
    lowerTrigram: 'Terra (K’un)',
    judgment: 'A União traz boa sorte. Consulte o oráculo mais uma vez para verificar se você tem constância. Os atrasados chegam tarde.',
    image: 'Sobre a Terra flui a Água. Os antigos reis uniam os feudos e cultivavam relacionamentos afetivos.',
    meaning: 'Busque parcerias de confiança e alinhe-se a pessoas com valores elevados. Unir forças multiplica a luz.'
  },
  '111011': {
    number: 9,
    namePt: 'Hsiao Ch’u — O Poder de Conter do Pequeno',
    nameZh: '小畜',
    pinyin: 'Xiǎo Chù',
    binary: '111011',
    upperTrigram: 'Vento (Sun)',
    lowerTrigram: 'Céu (Ch’ien)',
    judgment: 'Nuvens densas sem chuva vindas do nosso oeste. Pequenos ajustes contêm grandes avanços temporariamente.',
    image: 'O Vento sopra no alto do Céu. O sábio aperfeiçoa a forma externa e o tom do seu caráter.',
    meaning: 'Pequenos passos contínuos e diplomacia sutil rendem mais do que força bruta no momento.'
  },
  '110111': {
    number: 10,
    namePt: 'Lü — A Conduta (Pisar na Cauda do Tigre)',
    nameZh: '履',
    pinyin: 'Lǚ',
    binary: '110111',
    upperTrigram: 'Céu (Ch’ien)',
    lowerTrigram: 'Lago (Tui)',
    judgment: 'Pisar na cauda do tigre sem que ele morda. Sucesso! Cortesia, respeito e consciência dos limites garantem passagem segura.',
    image: 'O Céu acima, o Lago abaixo. O sábio distingue o alto do baixo e pacifica as mentes.',
    meaning: 'Caminhe com extrema cautela, tato refinado e respeito. Mesmo em situações arriscadas, a compostura protege.'
  },
  '111000': {
    number: 11,
    namePt: 'T’ai — A Paz (Harmonia)',
    nameZh: '泰',
    pinyin: 'Tài',
    binary: '111000',
    upperTrigram: 'Terra (K’un)',
    lowerTrigram: 'Céu (Ch’ien)',
    judgment: 'O pequeno vai, o grande vem. A Paz traz boa sorte e prosperidade fluida.',
    image: 'Céu e Terra se unem em comunhão perfeita. O sábio favorece os frutos da época.',
    meaning: 'Fase de expansão, clareza e entendimento mútuo. Aproveite o momento fértil para edificar projetos significativos.'
  },
  '000111': {
    number: 12,
    namePt: 'P’i — A Estagnação (A Obstrução)',
    nameZh: '否',
    pinyin: 'Pǐ',
    binary: '000111',
    upperTrigram: 'Céu (Ch’ien)',
    lowerTrigram: 'Terra (K’un)',
    judgment: 'O grande vai, o pequeno vem. Pessoas sem princípios prevalecem externamente. O sábio se recolhe.',
    image: 'Céu e Terra se afastam. O sábio se retira para preservar sua virtude interna e não se vende por lucros fáceis.',
    meaning: 'Não lute contra a maré de incompreensão. Guarde seus tesouros intelectuais e espirituais para quando o tempo mudar.'
  },
  '101111': {
    number: 13,
    namePt: 'T’ung Jên — A Comunhão entre os Homens',
    nameZh: '同人',
    pinyin: 'Tóng Rén',
    binary: '101111',
    upperTrigram: 'Céu (Ch’ien)',
    lowerTrigram: 'Fogo (Li)',
    judgment: 'Comunhão em campo aberto. Sucesso! Atravessar a grande água favorece quem busca o bem coletivo.',
    image: 'O Fogo sobe ao Céu. O sábio organiza as comunidades e distingue as afinidades sem sectarianismo.',
    meaning: 'Encontre propósitos comuns em grupo. A fraternidade autêntica supera divisões e constrói redes sólidas.'
  },
  '111101': {
    number: 14,
    namePt: 'Ta Yu — A Grande Possessão',
    nameZh: '大有',
    pinyin: 'Dà Yǒu',
    binary: '111101',
    upperTrigram: 'Fogo (Li)',
    lowerTrigram: 'Céu (Ch’ien)',
    judgment: 'A Grande Possessão traz supremo progresso e clareza brilhante.',
    image: 'O Fogo brilha alto no Céu. O sábio reprime o mal e promove o bem, obedecendo ao mandamento divino.',
    meaning: 'Abundância material e de recursos espirituais. Seja generoso, humilde e use a prosperidade com sabedoria.'
  },
  '000100': {
    number: 15,
    namePt: 'Ch’ien — A Humildade (Modéstia)',
    nameZh: '謙',
    pinyin: 'Qiān',
    binary: '000100',
    upperTrigram: 'Terra (K’un)',
    lowerTrigram: 'Montanha (Kên)',
    judgment: 'A Humildade cria passagem em todos os reinos. O sábio completa o que começou sem ostentação.',
    image: 'Dentro da Terra está a Montanha. O sábio reduz o excesso e complementa a escassez.',
    meaning: 'A verdadeira grandeza não precisa gritar. A modéstia atrai bênçãos, simpatia e estabilidade duradoura.'
  },
  '001000': {
    number: 16,
    namePt: 'Yü — O Entusiasmo (A Inspiração)',
    nameZh: '豫',
    pinyin: 'Yù',
    binary: '001000',
    upperTrigram: 'Trovão (Chen)',
    lowerTrigram: 'Terra (K’un)',
    judgment: 'O Entusiasmo favorece a nomeação de auxiliares e a colocação de forças em movimento.',
    image: 'O Trovão ecoa sobre a Terra. Os antigos reis compunham música sagrada para honrar a virtude universal.',
    meaning: 'Alegria e inspiração contagiam os outros. Canalize essa energia festiva para coordenar projetos com entusiasmo contagioso.'
  }
};

// Fallback generator for unmapped binary patterns
export function getHexagramFromBinary(binary: string): Hexagram {
  if (HEXAGRAMS[binary]) {
    return HEXAGRAMS[binary];
  }

  // Calculate default representation
  const yangCount = (binary.match(/1/g) || []).length;
  const num = parseInt(binary, 2) + 1;
  return {
    number: num,
    namePt: `Hexagrama ${num} — ${yangCount >= 3 ? 'Força e Crescimento' : 'Receptividade e Intuição'}`,
    nameZh: '易',
    pinyin: 'Yì',
    binary: binary,
    upperTrigram: yangCount >= 3 ? 'Céu / Fogo' : 'Terra / Água',
    lowerTrigram: binary.startsWith('1') ? 'Ação' : 'Acolhimento',
    judgment: `O fluxo energético deste Hexagrama (${binary}) destaca equilíbrio entre força e receptividade. Mantenha intenção pura.`,
    image: 'O movimento dos elementos universais ensina flexibilidade e retidão moral.',
    meaning: 'Considere os acontecimentos sob uma perspectiva ampla. O momento pede alinhamento com a verdade interior e sabedoria prática.'
  };
}
