/**
 * ASTROWORLD — Astrological Constants & Classical Matrices
 * Brihat Parashara Hora Shastra (BPHS) canonical definitions.
 */

import { PlanetName, ZodiacSign } from './types.ts';

export const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export const SANSKRIT_SIGNS: Record<ZodiacSign, string> = {
  Aries: 'Mesha (मेष)',
  Taurus: 'Vrishabha (वृषभ)',
  Gemini: 'Mithuna (मिथुन)',
  Cancer: 'Karka (कर्क)',
  Leo: 'Simha (सिंह)',
  Virgo: 'Kanya (कन्या)',
  Libra: 'Tula (तुला)',
  Scorpio: 'Vrishchika (वृश्चिक)',
  Sagittarius: 'Dhanu (धनु)',
  Capricorn: 'Makara (मकर)',
  Aquarius: 'Kumbha (कुम्भ)',
  Pisces: 'Meena (मीन)',
};

export const SIGN_LORDS: Record<ZodiacSign, PlanetName> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

export const SIGN_ELEMENTS: Record<ZodiacSign, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

export const SIGN_MODALITIES: Record<ZodiacSign, 'Movable' | 'Fixed' | 'Dual'> = {
  Aries: 'Movable',
  Taurus: 'Fixed',
  Gemini: 'Dual',
  Cancer: 'Movable',
  Leo: 'Fixed',
  Virgo: 'Dual',
  Libra: 'Movable',
  Scorpio: 'Fixed',
  Sagittarius: 'Dual',
  Capricorn: 'Movable',
  Aquarius: 'Fixed',
  Pisces: 'Dual',
};

export interface NakshatraDefinition {
  number: number;
  name: string;
  sanskritName: string;
  startDegree: number; // 0..360
  endDegree: number;
  ruler: PlanetName;
  deity: string;
}

export const NAKSHATRAS: NakshatraDefinition[] = [
  { number: 1, name: 'Ashwini', sanskritName: 'अश्विनी', startDegree: 0.0, endDegree: 13.333333, ruler: 'Ketu', deity: 'Ashwini Kumaras' },
  { number: 2, name: 'Bharani', sanskritName: 'भरणी', startDegree: 13.333333, endDegree: 26.666667, ruler: 'Venus', deity: 'Yama' },
  { number: 3, name: 'Krittika', sanskritName: 'कृत्तिका', startDegree: 26.666667, endDegree: 40.0, ruler: 'Sun', deity: 'Agni' },
  { number: 4, name: 'Rohini', sanskritName: 'रोहिणी', startDegree: 40.0, endDegree: 53.333333, ruler: 'Moon', deity: 'Brahma' },
  { number: 5, name: 'Mrigashira', sanskritName: 'मृगशिरा', startDegree: 53.333333, endDegree: 66.666667, ruler: 'Mars', deity: 'Soma' },
  { number: 6, name: 'Ardra', sanskritName: 'आर्द्रा', startDegree: 66.666667, endDegree: 80.0, ruler: 'Rahu', deity: 'Rudra' },
  { number: 7, name: 'Punarvasu', sanskritName: 'पुनर्वसु', startDegree: 80.0, endDegree: 93.333333, ruler: 'Jupiter', deity: 'Aditi' },
  { number: 8, name: 'Pushya', sanskritName: 'पुष्य', startDegree: 93.333333, endDegree: 106.666667, ruler: 'Saturn', deity: 'Brihaspati' },
  { number: 9, name: 'Ashlesha', sanskritName: 'आश्लेषा', startDegree: 106.666667, endDegree: 120.0, ruler: 'Mercury', deity: 'Sarpas' },
  { number: 10, name: 'Magha', sanskritName: 'मघा', startDegree: 120.0, endDegree: 133.333333, ruler: 'Ketu', deity: 'Pitris' },
  { number: 11, name: 'Purva Phalguni', sanskritName: 'पूर्वाफाल्गुनी', startDegree: 133.333333, endDegree: 146.666667, ruler: 'Venus', deity: 'Bhaga' },
  { number: 12, name: 'Uttara Phalguni', sanskritName: 'उत्तराफाल्गुनी', startDegree: 146.666667, endDegree: 160.0, ruler: 'Sun', deity: 'Aryaman' },
  { number: 13, name: 'Hasta', sanskritName: 'हस्त', startDegree: 160.0, endDegree: 173.333333, ruler: 'Moon', deity: 'Savitr' },
  { number: 14, name: 'Chitra', sanskritName: 'चित्रा', startDegree: 173.333333, endDegree: 186.666667, ruler: 'Mars', deity: 'Vishwakarma' },
  { number: 15, name: 'Swati', sanskritName: 'स्वाती', startDegree: 186.666667, endDegree: 200.0, ruler: 'Rahu', deity: 'Vayu' },
  { number: 16, name: 'Vishakha', sanskritName: 'विशाखा', startDegree: 200.0, endDegree: 213.333333, ruler: 'Jupiter', deity: 'Indragni' },
  { number: 17, name: 'Anuradha', sanskritName: 'अनुराधा', startDegree: 213.333333, endDegree: 226.666667, ruler: 'Saturn', deity: 'Mitra' },
  { number: 18, name: 'Jyeshtha', sanskritName: 'ज्येष्ठा', startDegree: 226.666667, endDegree: 240.0, ruler: 'Mercury', deity: 'Indra' },
  { number: 19, name: 'Mula', sanskritName: 'मूल', startDegree: 240.0, endDegree: 253.333333, ruler: 'Ketu', deity: 'Nirriti' },
  { number: 20, name: 'Purva Ashadha', sanskritName: 'पूर्वाषाढा', startDegree: 253.333333, endDegree: 266.666667, ruler: 'Venus', deity: 'Apas' },
  { number: 21, name: 'Uttara Ashadha', sanskritName: 'उत्तराषाढा', startDegree: 266.666667, endDegree: 280.0, ruler: 'Sun', deity: 'Vishvadevas' },
  { number: 22, name: 'Shravana', sanskritName: 'श्रवण', startDegree: 280.0, endDegree: 293.333333, ruler: 'Moon', deity: 'Vishnu' },
  { number: 23, name: 'Dhanishta', sanskritName: 'धनिष्ठा', startDegree: 293.333333, endDegree: 306.666667, ruler: 'Mars', deity: 'Vasus' },
  { number: 24, name: 'Shatabhisha', sanskritName: 'शतभिषा', startDegree: 306.666667, endDegree: 320.0, ruler: 'Rahu', deity: 'Varuna' },
  { number: 25, name: 'Purva Bhadrapada', sanskritName: 'पूर्वभाद्रपदा', startDegree: 320.0, endDegree: 333.333333, ruler: 'Jupiter', deity: 'Aja Ekapada' },
  { number: 26, name: 'Uttara Bhadrapada', sanskritName: 'उत्तरभाद्रपदा', startDegree: 333.333333, endDegree: 346.666667, ruler: 'Saturn', deity: 'Ahirbudhnya' },
  { number: 27, name: 'Revati', sanskritName: 'रेवती', startDegree: 346.666667, endDegree: 360.0, ruler: 'Mercury', deity: 'Pushan' },
];

export const VIMSHOTTARI_DURATIONS: Record<PlanetName, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const VIMSHOTTARI_SEQUENCE: PlanetName[] = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

export const NAISARGIKA_RELATIONSHIPS: Record<
  PlanetName,
  { friends: PlanetName[]; enemies: PlanetName[]; neutrals: PlanetName[] }
> = {
  Sun: {
    friends: ['Moon', 'Mars', 'Jupiter'],
    enemies: ['Venus', 'Saturn'],
    neutrals: ['Mercury'],
  },
  Moon: {
    friends: ['Sun', 'Mercury'],
    enemies: [],
    neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
  },
  Mars: {
    friends: ['Sun', 'Moon', 'Jupiter'],
    enemies: ['Mercury'],
    neutrals: ['Venus', 'Saturn'],
  },
  Mercury: {
    friends: ['Sun', 'Venus'],
    enemies: ['Moon'],
    neutrals: ['Mars', 'Jupiter', 'Saturn'],
  },
  Jupiter: {
    friends: ['Sun', 'Moon', 'Mars'],
    enemies: ['Mercury', 'Venus'],
    neutrals: ['Saturn'],
  },
  Venus: {
    friends: ['Mercury', 'Saturn'],
    enemies: ['Sun', 'Moon'],
    neutrals: ['Mars', 'Jupiter'],
  },
  Saturn: {
    friends: ['Mercury', 'Venus'],
    enemies: ['Sun', 'Moon', 'Mars'],
    neutrals: ['Jupiter'],
  },
  Rahu: {
    friends: ['Mercury', 'Venus', 'Saturn'],
    enemies: ['Sun', 'Moon', 'Mars'],
    neutrals: ['Jupiter'],
  },
  Ketu: {
    friends: ['Mars', 'Jupiter'],
    enemies: ['Sun', 'Moon'],
    neutrals: ['Mercury', 'Venus', 'Saturn'],
  },
};

export const EXALTATION_MAP: Record<PlanetName, { sign: ZodiacSign; deepDegree: number }> = {
  Sun: { sign: 'Aries', deepDegree: 10.0 },
  Moon: { sign: 'Taurus', deepDegree: 3.0 },
  Mars: { sign: 'Capricorn', deepDegree: 28.0 },
  Mercury: { sign: 'Virgo', deepDegree: 15.0 },
  Jupiter: { sign: 'Cancer', deepDegree: 5.0 },
  Venus: { sign: 'Pisces', deepDegree: 27.0 },
  Saturn: { sign: 'Libra', deepDegree: 20.0 },
  Rahu: { sign: 'Taurus', deepDegree: 20.0 },
  Ketu: { sign: 'Scorpio', deepDegree: 20.0 },
};

export const DEBILITATION_MAP: Record<PlanetName, { sign: ZodiacSign; deepDegree: number }> = {
  Sun: { sign: 'Libra', deepDegree: 10.0 },
  Moon: { sign: 'Scorpio', deepDegree: 3.0 },
  Mars: { sign: 'Cancer', deepDegree: 28.0 },
  Mercury: { sign: 'Pisces', deepDegree: 15.0 },
  Jupiter: { sign: 'Capricorn', deepDegree: 5.0 },
  Venus: { sign: 'Virgo', deepDegree: 27.0 },
  Saturn: { sign: 'Aries', deepDegree: 20.0 },
  Rahu: { sign: 'Scorpio', deepDegree: 20.0 },
  Ketu: { sign: 'Taurus', deepDegree: 20.0 },
};

export const MOOLATRIKONA_MAP: Record<
  PlanetName,
  { sign: ZodiacSign; startDegree: number; endDegree: number }
> = {
  Sun: { sign: 'Leo', startDegree: 0.0, endDegree: 20.0 },
  Moon: { sign: 'Taurus', startDegree: 3.0, endDegree: 30.0 },
  Mars: { sign: 'Aries', startDegree: 0.0, endDegree: 12.0 },
  Mercury: { sign: 'Virgo', startDegree: 15.0, endDegree: 20.0 },
  Jupiter: { sign: 'Sagittarius', startDegree: 0.0, endDegree: 10.0 },
  Venus: { sign: 'Libra', startDegree: 0.0, endDegree: 15.0 },
  Saturn: { sign: 'Aquarius', startDegree: 0.0, endDegree: 20.0 },
  Rahu: { sign: 'Virgo', startDegree: 0.0, endDegree: 30.0 },
  Ketu: { sign: 'Pisces', startDegree: 0.0, endDegree: 30.0 },
};

export const OWN_SIGNS_MAP: Record<PlanetName, ZodiacSign[]> = {
  Sun: ['Leo'],
  Moon: ['Cancer'],
  Mars: ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'],
  Jupiter: ['Sagittarius', 'Pisces'],
  Venus: ['Taurus', 'Libra'],
  Saturn: ['Capricorn', 'Aquarius'],
  Rahu: ['Aquarius'],
  Ketu: ['Scorpio'],
};

export const SANSKRIT_PLANET_NAMES: Record<PlanetName, string> = {
  Sun: 'Surya (सूर्य)',
  Moon: 'Chandra (चन्द्र)',
  Mars: 'Mangala (मंगल)',
  Mercury: 'Budha (बुध)',
  Jupiter: 'Guru / Brihaspati (गुरु)',
  Venus: 'Shukra (शुक्र)',
  Saturn: 'Shani (शनि)',
  Rahu: 'Rahu (राहु)',
  Ketu: 'Ketu (केतु)',
};
