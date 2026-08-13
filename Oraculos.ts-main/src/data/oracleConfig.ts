import { OracleType } from '../types';

export interface OracleCategoryInfo {
  type: OracleType;
  name: string;
  shortDesc: string;
  iconName: string;
  color: string;
  bgGradient: string;
}

export const ORACLE_CATEGORIES: Record<OracleType, OracleCategoryInfo> = {
  tarot: {
    type: 'tarot',
    name: 'Tarot',
    shortDesc: 'Revelações dos Arcanos Maiores e Menores para decisões e amor.',
    iconName: 'Sparkles',
    color: '#D4AF37',
    bgGradient: 'from-amber-500/20 to-purple-900/30',
  },
  cigano: {
    type: 'cigano',
    name: 'Baralho Cigano',
    shortDesc: 'Clareza prática e objetiva para cotidiano, trabalho e relacionamentos.',
    iconName: 'Flame',
    color: '#E11D48',
    bgGradient: 'from-rose-500/20 to-purple-900/30',
  },
  astrologia: {
    type: 'astrologia',
    name: 'Astrologia & Mapa Astral',
    shortDesc: 'Movimento dos astros, sinastria amorosa e mapa de nascimento.',
    iconName: 'MoonStar',
    color: '#8B5CF6',
    bgGradient: 'from-purple-500/20 to-indigo-900/30',
  },
  numerologia: {
    type: 'numerologia',
    name: 'Numerologia',
    shortDesc: 'Vibração dos números no seu nome, data de nascimento e ciclos.',
    iconName: 'Binary',
    color: '#06B6D4',
    bgGradient: 'from-cyan-500/20 to-blue-900/30',
  },
  buzios: {
    type: 'buzios',
    name: 'Jogo de Búzios',
    shortDesc: 'Orientação dos Orixás para caminhos espirituais e proteção.',
    iconName: 'Shell',
    color: '#F59E0B',
    bgGradient: 'from-amber-600/20 to-yellow-950/30',
  },
  ifa: {
    type: 'ifa',
    name: 'Jogo de Ifá & Odus',
    shortDesc: 'Sabedoria ancestral sagrada para destino, alinhamento e ebó.',
    iconName: 'SunMedium',
    color: '#D97706',
    bgGradient: 'from-yellow-500/20 to-orange-950/30',
  },
  runas: {
    type: 'runas',
    name: 'Runas Nórdicas',
    shortDesc: 'Símbolos vikings antigos para coragem, sabedoria e decisões rápidas.',
    iconName: 'Compass',
    color: '#10B981',
    bgGradient: 'from-emerald-500/20 to-teal-950/30',
  },
  iching: {
    type: 'iching',
    name: 'I Ching',
    shortDesc: 'O Livro das Mutações oriental para sabedoria estratégica e harmonia.',
    iconName: 'ScrollText',
    color: '#3B82F6',
    bgGradient: 'from-blue-500/20 to-slate-900/30',
  },
  cristais: {
    type: 'cristais',
    name: 'Cristais & Litoterapia',
    shortDesc: 'Alinhamento energético com poder mineral dos cristais sagrados.',
    iconName: 'Gem',
    color: '#EC4899',
    bgGradient: 'from-pink-500/20 to-purple-950/30',
  },
  mesaradionica: {
    type: 'mesaradionica',
    name: 'Mesa Radiônica',
    shortDesc: 'Harmonização de frequências, limpeza espiritual e destrava energética.',
    iconName: 'Activity',
    color: '#A855F7',
    bgGradient: 'from-purple-600/20 to-fuchsia-950/30',
  },
};
