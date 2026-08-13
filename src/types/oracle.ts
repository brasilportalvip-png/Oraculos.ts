export type OracleType = 'tarot' | 'iching' | 'runes' | 'astrology' | 'numerology' | 'ai-sacerdotisa';

// Tarot Types
export type ArcanaType = 'major' | 'minor';
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles' | 'none';

export interface TarotCard {
  id: string;
  number: number;
  namePt: string;
  nameEn: string;
  arcana: ArcanaType;
  suit: TarotSuit;
  element: 'Fogo' | 'Água' | 'Ar' | 'Terra';
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  advice: string;
  symbol: string; // Icon or SVG representation
}

export type TarotSpreadType = 'daily' | 'three_cards' | 'love' | 'decision';

export interface DrawnTarotCard {
  card: TarotCard;
  isReversed: boolean;
  positionLabel: string;
}

// I Ching Types
export interface Hexagram {
  number: number;
  namePt: string;
  nameZh: string;
  pinyin: string;
  binary: string; // e.g., "111111" for Ch'ien (1=yang, 0=yin)
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  meaning: string;
}

export interface CoinTossResult {
  tossIndex: number; // 0 to 5 (from bottom line to top line)
  coins: [number, number, number]; // 2 (yin, tails) or 3 (yang, heads)
  sum: number; // 6 (changing yin), 7 (yang), 8 (yin), 9 (changing yang)
  isChanging: boolean;
  isYang: boolean;
}

// Rune Types
export interface NordicRune {
  id: string;
  name: string;
  phonetic: string;
  symbol: string; // Runics character like ᚠ
  meaningPt: string;
  keywords: string[];
  element: string;
  uprightAdvice: string;
  invertedAdvice: string;
  deity: string;
}

export interface DrawnRune {
  rune: NordicRune;
  isInverted: boolean;
  positionLabel: string;
}

// Astrology & Horoscope
export interface ZodiacSign {
  id: string;
  namePt: string;
  symbol: string;
  dates: string;
  element: 'Fogo' | 'Terra' | 'Ar' | 'Água';
  rulingPlanet: string;
  dailyForecast: {
    love: string;
    work: string;
    spiritual: string;
    luckyNumber: number;
    color: string;
  };
}

export interface MoonPhaseInfo {
  phaseName: string;
  illumination: number; // 0 to 100%
  symbol: string;
  guidance: string;
  favorableFor: string[];
}

export interface NatalChartSummary {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  elementBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
}

// Numerology
export interface NumerologyResult {
  fullName: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  isMasterNumber: boolean;
  interpretation: {
    lifePath: string;
    expression: string;
    soulUrge: string;
  };
}

// Saved Reading Entry
export interface ReadingEntry {
  id: string;
  timestamp: string;
  oracleType: OracleType;
  title: string;
  summary: string;
  details: any;
  notes?: string;
}
