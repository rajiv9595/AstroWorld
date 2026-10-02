/**
 * ASTROWORLD — Dynamic Report Data Contracts & Types
 * Complete canonical document schema for professional, print-ready Vedic astrology books.
 */

import {
  BirthProfile,
  PlanetName,
  ZodiacSign,
  PanchangaFacts,
  AIInterpretationContext,
} from '../engine/types.ts';

export type ReportProfile = 'compact' | 'standard' | 'detailed' | 'professional';
export type ChartStylePreference = 'north-diamond' | 'south-square';

export interface ReportMetadata {
  documentId: string;
  generatedAtIso: string;
  formattedGeneratedDate: string;
  reportProfile: ReportProfile;
  chartStyle: ChartStylePreference;
  engineVersion: string;
  ayanamshaModel: string;
  ephemerisSource: string;
  calculationStandards: string;
}

export interface ReportCoverData {
  title: string;
  subtitle: string;
  nativeName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  coordinatesFormatted: string;
  timezone: string;
  generatedDate: string;
  engineVersion: string;
}

export interface TocItem {
  number: string;
  title: string;
  pageNumber: string;
}

export interface TocSection {
  title: string;
  items: TocItem[];
}

export interface BirthDetailsItem {
  label: string;
  value: string;
}

export interface BirthDetailsSection {
  title: string;
  subtitle: string;
  fields: BirthDetailsItem[];
}

export interface PanchangaElement {
  name: string;
  sanskritName: string;
  value: string;
  lord: string;
}

export interface PanchangaSection {
  title: string;
  subtitle: string;
  elements: PanchangaElement[];
  interpretation: string;
}

export interface IdentityPillar {
  sign: ZodiacSign;
  formattedDegree: string;
  nakshatra: string;
  pada: number;
  lord: PlanetName;
  lordPlacementHouse: number;
  lordPlacementSign?: ZodiacSign;
}

export interface CoreIdentitySection {
  title: string;
  subtitle: string;
  lagna: IdentityPillar;
  moon: IdentityPillar;
  atmakaraka: {
    planet: PlanetName;
    karakamsaSign: ZodiacSign;
  };
  amatyakaraka: {
    planet: PlanetName;
  };
  lagnaSignificance: string;
}

export interface VectorChartHouseEntry {
  houseNumber: number;
  sign: ZodiacSign;
  signIndex: number;
  planets: string[];
}

export interface VectorChartSection {
  title: string;
  chartCode: string;
  purpose: string;
  ascendantSign: ZodiacSign;
  houses: VectorChartHouseEntry[];
}

export interface PlanetaryPositionItem {
  name: PlanetName;
  sanskritName: string;
  sign: ZodiacSign;
  formattedDegree: string;
  nakshatra: string;
  pada: number;
  houseNumber: number;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  signLord: PlanetName;
}

export interface PlanetaryPositionsSection {
  title: string;
  subtitle: string;
  planets: PlanetaryPositionItem[];
}

export interface NakshatraAnalysisItem {
  planet: PlanetName;
  nakshatra: string;
  pada: number;
  lord: PlanetName;
  sign: ZodiacSign;
  houseNumber: number;
  significance: string;
}

export interface NakshatraSection {
  title: string;
  subtitle: string;
  items: NakshatraAnalysisItem[];
}

export interface BhavaItem {
  houseNumber: number;
  title: string;
  sign: ZodiacSign;
  lord: PlanetName;
  lordPlacementHouse: number;
  occupants: PlanetName[];
  aspectsReceived: PlanetName[];
  interpretation: string;
}

export interface StrengthItem {
  planet: PlanetName;
  totalRupas: number;
  requiredRupas: number;
  ratio: number;
  strengthStatus: string;
}

export interface StrengthSection {
  title: string;
  subtitle: string;
  strengths: StrengthItem[];
  interpretation: string;
}

export interface YogaItem {
  id: string;
  name: string;
  classicalSource: string;
  planetsInvolved: PlanetName[];
  housesInvolved: number[];
  interpretation: string;
}

export interface YogaSection {
  title: string;
  subtitle: string;
  yogas: YogaItem[];
  summaryNote?: string;
}

export interface LifeAreaItem {
  id: string;
  title: string;
  primaryHouses: number[];
  karakaPlanets: PlanetName[];
  chartEvidence: string[];
  interpretation: string;
}

export interface ActiveDashaPhase {
  mahadasha: PlanetName;
  antardasha: PlanetName;
  pratyantardasha: PlanetName;
  startDate: string;
  endDate: string;
}

export interface UpcomingMahadasha {
  lord: PlanetName;
  startDate: string;
  endDate: string;
  years: number;
  keyThemes: string;
}

export interface DashaSection {
  title: string;
  subtitle: string;
  currentActivePhase: ActiveDashaPhase;
  upcomingMahadashas: UpcomingMahadasha[];
}

export interface TransitItem {
  planet: PlanetName;
  currentSign: ZodiacSign;
  houseFromLagna: number;
  houseFromMoon: number;
  interpretation: string;
}

export interface TransitSection {
  title: string;
  subtitle: string;
  transits: TransitItem[];
}

export interface AshtakavargaHouseScore {
  houseNumber: number;
  sign: ZodiacSign;
  savPoints: number;
}

export interface AshtakavargaSection {
  title: string;
  subtitle: string;
  houseScores: AshtakavargaHouseScore[];
  interpretation: string;
}

export interface TraditionalRemedyItem {
  type: string;
  targetPlanet: PlanetName;
  description: string;
  rationale: string;
  suitableTiming: string;
}

export interface RemediesSection {
  title: string;
  subtitle: string;
  remedies: TraditionalRemedyItem[];
  disclaimer: string;
}

export interface SummarySection {
  title: string;
  subtitle: string;
  coreThemes: string[];
  closingAffirmation: string;
}

export interface TechnicalAppendixSection {
  title: string;
  subtitle: string;
  ayanamsa: string;
  ephemerisSource: string;
  geographicalCoordinates: string;
  calculationEngine: string;
}

export interface ReportDocument {
  metadata: ReportMetadata;
  cover: ReportCoverData;
  toc: TocSection;
  birthDetails: BirthDetailsSection;
  panchanga: PanchangaSection;
  identity: CoreIdentitySection;
  charts: VectorChartSection[];
  planetaryPositions: PlanetaryPositionsSection;
  nakshatraAnalysis: NakshatraSection;
  houses: BhavaItem[];
  strengths: StrengthSection;
  yogas: YogaSection;
  lifeAreas: LifeAreaItem[];
  dashaHierarchy: DashaSection;
  transits: TransitSection;
  ashtakavarga: AshtakavargaSection;
  remedies: RemediesSection;
  summary: SummarySection;
  technicalAppendix: TechnicalAppendixSection;
}
