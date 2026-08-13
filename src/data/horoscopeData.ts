import { ZodiacSign, MoonPhaseInfo, NatalChartSummary } from '../types/oracle';

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    namePt: 'Áries',
    symbol: '♈',
    dates: '21 Mar — 19 Abr',
    element: 'Fogo',
    rulingPlanet: 'Marte',
    dailyForecast: {
      love: 'Sua coragem em expressar o que sente abrirá portas para momentos de cumplicidade eletrizante.',
      work: 'Sua iniciativa ardente supera barreiras. Proponha soluções ousadas com liderança.',
      spiritual: 'Conecte-se com seu fogo sagrado através de caminhadas ao ar livre e afirmações de poder.',
      luckyNumber: 9,
      color: 'Vermelho Rubro'
    }
  },
  {
    id: 'touro',
    namePt: 'Touro',
    symbol: '♉',
    dates: '20 Abr — 20 Mai',
    element: 'Terra',
    rulingPlanet: 'Vênus',
    dailyForecast: {
      love: 'Paciência e carinho tangível nutrem a estabilidade dos afetos. Valorize momentos simples.',
      work: 'Sua constância pragmática garante colheitas sólidas. Mantenha os pés firmes no chão.',
      spiritual: 'Sinta a vibração da Mãe Terra. Descalçar-se na grama recarregará seus centros de energia.',
      luckyNumber: 6,
      color: 'Verde Esmeralda'
    }
  },
  {
    id: 'gemeos',
    namePt: 'Gêmeos',
    symbol: '♊',
    dates: '21 Mai — 20 Jun',
    element: 'Ar',
    rulingPlanet: 'Mercúrio',
    dailyForecast: {
      love: 'Trocas intelectuais estimulantes acendem a paixão. O diálogo sincero é sua melhor arma.',
      work: 'Múltiplas conexões e ideias inovadoras fluem rápido. Organize as entregas por prioridade.',
      spiritual: 'Medite com respirações conscientes para desacelerar o turbilhão de pensamentos.',
      luckyNumber: 5,
      color: 'Amarelo Solar'
    }
  },
  {
    id: 'cancer',
    namePt: 'Câncer',
    symbol: '♋',
    dates: '21 Jun — 22 Jul',
    element: 'Água',
    rulingPlanet: 'Lua',
    dailyForecast: {
      love: 'Sua intuição afetiva acolhe quem você ama. Cuide do seu lar emocional com carinho.',
      work: 'A sensibilidade no ambiente profissional permite mediar conflitos e unir a equipe.',
      spiritual: 'Honre suas marés emocionais internas. Banhos com ervas protetoras renovam sua aura.',
      luckyNumber: 2,
      color: 'Prata Lunar'
    }
  },
  {
    id: 'leao',
    namePt: 'Leão',
    symbol: '♌',
    dates: '23 Jul — 22 Ago',
    element: 'Fogo',
    rulingPlanet: 'Sol',
    dailyForecast: {
      love: 'Seu brilho autêntico inspira encanto. Expanda sua generosidade sem receios.',
      work: 'Sua presença radiante atrai reconhecimento. Lidere projetos com nobreza e entusiasmo.',
      spiritual: 'Sintonize-se com a luz do Sol nascente para expandir seu chácara do plexo solar.',
      luckyNumber: 1,
      color: 'Dourado Celestial'
    }
  },
  {
    id: 'virgem',
    namePt: 'Virgem',
    symbol: '♍',
    dates: '23 Ago — 22 Set',
    element: 'Terra',
    rulingPlanet: 'Mercúrio',
    dailyForecast: {
      love: 'Atos práticos de cuidado e atenção aos detalhes demonstram seu afeto genuíno.',
      work: 'Capacidade analítica afiada para otimizar rotinas e resolver problemas complexos.',
      spiritual: 'Simplifique o que está ao seu redor. A ordem externa reflete a paz interna.',
      luckyNumber: 4,
      color: 'Azul Marinho'
    }
  },
  {
    id: 'libra',
    namePt: 'Libra',
    symbol: '♎',
    dates: '23 Set — 22 Out',
    element: 'Ar',
    rulingPlanet: 'Vênus',
    dailyForecast: {
      love: 'Busca por harmonia, gentileza e beleza nos encontros. Soluções diplomáticas triunfam.',
      work: 'Excelente diplomacia para negociar e encontrar o ponto de equilíbrio em parcerias.',
      spiritual: 'Cultive a beleza em seu altar ou espaço sagrado para sintonizar a graça universal.',
      luckyNumber: 7,
      color: 'Rosa Quartz'
    }
  },
  {
    id: 'escorpiao',
    namePt: 'Escorpião',
    symbol: '♏',
    dates: '23 Out — 21 Nov',
    element: 'Água',
    rulingPlanet: 'Plutão & Marte',
    dailyForecast: {
      love: 'Intensidade e profundidade na conexão. Permita-se confiar e desarmar suas defesas.',
      work: 'Perspicácia magnética para enxergar o que está oculto sob a superfície dos negócios.',
      spiritual: 'Transformação fênix. Deixe que velhas dores se transmutem em sabedoria de vida.',
      luckyNumber: 8,
      color: 'Vinho Profundo'
    }
  },
  {
    id: 'sagitario',
    namePt: 'Sagitário',
    symbol: '♐',
    dates: '22 Nov — 21 Dez',
    element: 'Fogo',
    rulingPlanet: 'Júpiter',
    dailyForecast: {
      love: 'Aventura, bom humor e liberdade fortalecem o companheirismo.',
      work: 'Visão ampla do futuro e otimismo contagioso abrem novos horizontes de crescimento.',
      spiritual: 'Sua fé na abundância do cosmos é um ímã de bênçãos e milagres.',
      luckyNumber: 3,
      color: 'Púrpura Mística'
    }
  },
  {
    id: 'capricornio',
    namePt: 'Capricórnio',
    symbol: '♑',
    dates: '22 Dez — 19 Jan',
    element: 'Terra',
    rulingPlanet: 'Saturno',
    dailyForecast: {
      love: 'Lealdade inabalável e compromisso a longo prazo trazem segurança ao relacionamento.',
      work: 'Disciplina de mestre e foco implacável aceleram a escalada rumo aos seus objetivos.',
      spiritual: 'Honre a sabedoria do tempo e a paciência dos ancestrais.',
      luckyNumber: 10,
      color: 'Ônix Negro'
    }
  },
  {
    id: 'aquario',
    namePt: 'Aquário',
    symbol: '♒',
    dates: '20 Jan — 18 Fev',
    element: 'Ar',
    rulingPlanet: 'Urano & Saturno',
    dailyForecast: {
      love: 'Amizade sincera e respeito à individualidade são o pilar de amores autênticos.',
      work: 'Inovação fora da caixa e soluções tecnológicas ou humanitárias se destacam.',
      spiritual: 'Visualize a teia cósmica que conecta todas as almas em liberdade.',
      luckyNumber: 11,
      color: 'Azul Turquesa'
    }
  },
  {
    id: 'peixes',
    namePt: 'Peixes',
    symbol: '♓',
    dates: '19 Fev — 20 Mar',
    element: 'Água',
    rulingPlanet: 'Netuno & Júpiter',
    dailyForecast: {
      love: 'Empatia e sensibilidade poética criam pontes mágicas de ternura.',
      work: 'Inspiração artística e intuição afiada orientam escolhas certeiras.',
      spiritual: 'Navegue pelo oceano da compaixão universal através da meditação ou música.',
      luckyNumber: 12,
      color: 'Lilás Celestial'
    }
  }
];

// Calculate Current Moon Phase based on current date
export function getCurrentMoonPhase(): MoonPhaseInfo {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simple Astronomical Moon Phase Approximation
  let c = 0, e = 0, jd = 0, b = 0;
  if (month < 3) {
    year - 1;
    month + 12;
  }
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09; // Julian Date relative to Moon Cycle
  b = jd / 29.5305882; // Moon Cycle Length
  let phaseIndex = (b - Math.floor(b)) * 8; // 0 to 7

  if (phaseIndex < 0.5 || phaseIndex >= 7.5) {
    return {
      phaseName: 'Lua Nova 🌑',
      illumination: 2,
      symbol: '🌑',
      guidance: 'Momento mágico para semear intenções, iniciar projetos, fazer feitiços de abertura e meditar em recolhimento.',
      favorableFor: ['Novos Inícios', 'Ritual de Intenções', 'Desintoxicação', 'Silêncio']
    };
  } else if (phaseIndex < 2.5) {
    return {
      phaseName: 'Lua Crescente 🌒',
      illumination: 35,
      symbol: '🌒',
      guidance: 'Energia de impulso, crescimento e superação de dúvidas iniciais. Hora de agir com determinação nos planos traçados.',
      favorableFor: ['Ação Prática', 'Expansão de Negócios', 'Estudos', 'Fortalecimento']
    };
  } else if (phaseIndex < 4.5) {
    return {
      phaseName: 'Lua Cheia 🌕',
      illumination: 98,
      symbol: '🌕',
      guidance: 'Ápice da luz lunar, intuição aguçada, celebração, relacionamentos e manifestação de desejos com plenitude.',
      favorableFor: ['Consagração', 'Magia de Amor', 'Celebração de Vitórias', 'Clarividência']
    };
  } else {
    return {
      phaseName: 'Lua Minguante 🌘',
      illumination: 25,
      symbol: '🌘',
      guidance: 'Fase de desapego, limpeza energética, encerramento de pendências e perdão. Libere o que pesa.',
      favorableFor: ['Limpeza de Aura', 'Banimento de maus hábitos', 'Organização', 'Descanso']
    };
  }
}

// Calculate Mini Natal Chart
export function calculateNatalChart(
  name: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string
): NatalChartSummary {
  const dateObj = new Date(birthDate || '2000-01-01');
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  // Determine Sun Sign
  let sunSign = 'Áries';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) sunSign = 'Áries';
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) sunSign = 'Touro';
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) sunSign = 'Gêmeos';
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) sunSign = 'Câncer';
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) sunSign = 'Leão';
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) sunSign = 'Virgem';
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) sunSign = 'Libra';
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) sunSign = 'Escorpião';
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) sunSign = 'Sagitário';
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sunSign = 'Capricórnio';
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) sunSign = 'Aquário';
  else sunSign = 'Peixes';

  // Approximate Ascendant based on hour
  const hour = parseInt((birthTime || '12:00').split(':')[0]);
  const signsList = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  const sunIndex = signsList.indexOf(sunSign);
  const ascIndex = (sunIndex + Math.floor(hour / 2)) % 12;
  const ascendantSign = signsList[ascIndex];

  // Approximate Moon Sign based on day + month
  const moonIndex = (sunIndex + (day % 5) + 2) % 12;
  const moonSign = signsList[moonIndex];

  return {
    name: name || 'Consulente',
    birthDate: birthDate || '2000-01-01',
    birthTime: birthTime || '12:00',
    birthPlace: birthPlace || 'Desconhecido',
    sunSign,
    moonSign,
    ascendantSign,
    elementBalance: {
      fire: 30,
      earth: 25,
      air: 25,
      water: 20
    }
  };
}
