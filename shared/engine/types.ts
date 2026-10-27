/**
 * ASTROWORLD — Core Domain & Astrological Data Types
 * Strict typing for canonical facts, classical rules, provenance, and interpretation.
 */

export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export type DignityType =
  | 'EXALTED'
  | 'DEBILITATED'
  | 'MOOLATRIKONA'
  | 'OWN_SIGN'
  | 'FRIEND'
  | 'NEUTRAL'
  | 'ENEMY';

export type VargaCode =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D27'
  | 'D30'
  | 'D40'
  | 'D45'
  | 'D60';

export type TimingPrecision = 'EXACT' | 'EVENT_WINDOW' | 'UNKNOWN';

export interface BirthProfile {
  name: string;
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second?: number;
  latitude: number;
  longitude: number;
  timezone: string; // e.g. "Asia/Kolkata"
  cityName?: string;
  gender?: 'male' | 'female' | 'other';
}

/**
 * Computes a stable, deterministic, non-sensitive profile fingerprint.
 * Used for session isolation, caching, and cross-chart state protection.
 */
export function computeProfileFingerprint(profile: BirthProfile): string {
  if (!profile) return 'fp_anonymous';
  const name = (profile.name || 'native').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const y = profile.year;
  const m = profile.month;
  const d = profile.day;
  const h = profile.hour;
  const min = profile.minute;
  const s = profile.second ?? 0;
  const lat = Number(profile.latitude).toFixed(4);
  const lon = Number(profile.longitude).toFixed(4);
  const tz = (profile.timezone || 'utc').trim().toLowerCase();

  const str = `${name}_${y}_${m}_${d}_${h}_${min}_${s}_${lat}_${lon}_${tz}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fp_${name.slice(0, 8)}_${(hash >>> 0).toString(16)}`;
}

/**
 * Checks if a profile name is a dummy/demo/fallback placeholder that should never
 * be prefilled into user forms or displayed as a real user's profile.
 */
export function isDemoOrDummyName(name?: string): boolean {
  if (!name) return true;
  const s = name.trim().toLowerCase();
  return (
    s === 'swami vivekananda' ||
    s === 'astroworld native' ||
    s === 'default native' ||
    s === 'canonical test native' ||
    s === 'native' ||
    s === 'unnamed native' ||
    s === 'guest'
  );
}

export interface PlanetPosition {
  name: PlanetName;
  sanskritName: string;
  tropicalLongitude: number;
  siderealLongitude: number; // [0, 360)
  sign: ZodiacSign;
  signIndex: number; // 0=Aries .. 11=Pisces
  degreeInSign: number; // 0..30
  formattedDegree: string; // e.g. "00° 02' 31\""
  houseNumber: number; // 1-12 (Whole Sign from Lagna)
  nakshatra: string;
  nakshatraNumber: number; // 1-27
  nakshatraLord: PlanetName;
  pada: number; // 1-4
  speed: number; // deg/day
  retrograde: boolean;
  combust: boolean;
  combustionLevel?: 'CAZIMI' | 'DEEP_COMBUST' | 'COMBUST' | 'NONE';
  retrogradeDignityNote?: string;
  dignity: DignityType;
  dignityScore: number; // virupas or relative score
  signLord: PlanetName;
  naturalRelationshipToLord: 'FRIEND' | 'NEUTRAL' | 'ENEMY';
}

export interface AscendantInfo {
  tropicalLongitude: number;
  siderealLongitude: number;
  sign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  formattedDegree: string;
  nakshatra: string;
  nakshatraNumber: number;
  nakshatraLord: PlanetName;
  pada: number;
}

export interface HouseInfo {
  houseNumber: number; // 1-12
  sign: ZodiacSign;
  signIndex: number;
  lord: PlanetName;
  occupants: PlanetName[];
  aspectingPlanets: PlanetName[];
  significance: string;
}

export interface VargaPlanetPlacement {
  planet: PlanetName;
  sourceSign: ZodiacSign;
  vargaSign: ZodiacSign;
  vargaSignIndex: number;
  degreeInVargaSign: number;
  houseNumber: number; // Whole sign relative to Varga Lagna
  dignity: DignityType;
}

export interface VargaChart {
  code: VargaCode;
  name: string;
  sanskritName: string;
  divisionNumber: number;
  purpose: string;
  ascendantSign: ZodiacSign;
  ascendantSignIndex: number;
  planets: VargaPlanetPlacement[];
  specialAmshaNames?: Record<string, string>; // e.g. for D60 devata
}

export interface PanchangaFacts {
  tithi: {
    number: number; // 1-30
    name: string;
    paksha: 'Shukla' | 'Krishna';
    completedPercent: number;
  };
  vara: {
    number: number; // 0=Sun .. 6=Sat
    name: string;
    rulingPlanet: PlanetName;
  };
  nakshatra: {
    number: number;
    name: string;
    lord: PlanetName;
    pada: number;
    completedPercent: number;
  };
  yoga: {
    number: number; // 1-27
    name: string;
  };
  karana: {
    number: number; // 1-60
    name: string;
    type: 'Chara' | 'Sthira';
  };
  sunriseUtc: string;
  sunsetUtc: string;
  ayanamsa: {
    type: 'lahiri';
    valueDegrees: number;
    formatted: string;
  };
}

export interface DashaPeriod {
  level: 'MAHADASHA' | 'ANTARDASHA' | 'PRATYANTARDASHA';
  lord: PlanetName;
  subLord?: PlanetName;
  pratyantarLord?: PlanetName;
  startDateIso: string;
  endDateIso: string;
  durationYears: number;
  path: string; // e.g. "Jupiter/Saturn/Mercury"
  activeNow?: boolean;
}

export interface VimshottariDashaFacts {
  balanceAtBirth: {
    rulingLord: PlanetName;
    balanceYears: number;
    balanceMonths: number;
    balanceDays: number;
    fullDurationYears: number;
  };
  currentHierarchy: {
    mahadasha: DashaPeriod;
    antardasha: DashaPeriod;
    pratyantardasha: DashaPeriod;
  };
  mahadashas: {
    period: DashaPeriod;
    antardashas: {
      period: DashaPeriod;
      pratyantardashas: DashaPeriod[];
    }[];
  }[];
}

export interface ShadbalaFactor {
  planet: PlanetName;
  sthanaBala: number; // virupas
  digBala: number;
  kalaBala: number;
  chestaBala: number;
  naisargikaBala: number;
  drikBala: number;
  totalVirupas: number;
  totalRupas: number; // virupas / 60
  requiredVirupas: number;
  strengthRatio: number; // total / required
  rank: number;
  verdict: 'STRONG' | 'ADEQUATE' | 'WEAK';
  ishtaPhala?: number; // sqrt(UcchaBala * ChestaBala)
  kashtaPhala?: number; // 60 - ishtaPhala
  subBreakdown?: ShadbalaSubBreakdown;
}

export interface ShadbalaSubBreakdown {
  sthana?: {
    uccha: number;
    saptavargaja: number;
    ojayugma: number;
    kendradi: number;
    drekkana: number;
  };
  dig?: {
    weakPointLongitude?: number;
    distanceDegrees?: number;
  };
  kala?: {
    natonnatha: number;
    paksha: number;
    tribhaga?: number;
    varadhipati?: number;
    horadhipati?: number;
    ayana?: number;
    yuddha?: number;
  };
  chesta?: {
    chestaKendraDegrees?: number;
    isRetrograde?: boolean;
  };
  drik?: {
    shubhaDrishti?: number;
    papaDrishti?: number;
    drishtiPinda?: number;
  };
}

export interface ShadbalaCalculationOptions {
  methodology?: 'classical_full' | 'classical_partial';
  birthDateUtc?: Date;
  latitude?: number;
  longitude?: number;
  cusps?: {
    ascendant: number;
    mc?: number;
    descendant?: number;
    ic?: number;
  };
  ayanamsha?: number;
}

export interface ChalitBhava {
  houseNumber: number; // 1-12
  bhavaMadhya: number; // 0..360 sidereal degrees
  bhavaMadhyaFormatted: string;
  bhavaMadhyaSign: ZodiacSign;
  bhavaMadhyaSignIndex: number;
  aarambhSandhi: number; // Starting junction
  aarambhSandhiFormatted: string;
  viramSandhi: number; // Ending junction
  viramSandhiFormatted: string;
  occupants: PlanetName[];
  spanDegrees: number;
}

export interface ChalitPlanetPlacement {
  planet: PlanetName;
  siderealLongitude: number;
  rashiHouse: number; // Whole sign house from Lagna
  chalitHouse: number; // Actual Sripathi Bhava
  shifted: boolean; // True if chalitHouse !== rashiHouse
  shiftDirection?: 'FORWARD' | 'BACKWARD' | 'SAME';
  awasiyaBalaShashtiamsha: number; // Residential strength (0 to 60 Shashtiamshas)
  awasiyaBalaPercent: number; // 0 to 100%
  bhavaHalf: 'PURVA' | 'UTTARA';
}

export interface ChalitChart {
  bhavas: ChalitBhava[];
  planets: ChalitPlanetPlacement[];
  midheaven: {
    longitude: number;
    sign: ZodiacSign;
    degreeInSign: number;
    formattedDegree: string;
  };
}

export interface UpgrahaInfo {
  name: string;
  sanskritName: string;
  associatedPlanet: PlanetName;
  calculationType: 'SUN_DERIVED' | 'TIME_DERIVED';
  siderealLongitude: number;
  sign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  formattedDegree: string;
  houseNumber: number; // Whole sign from Lagna
  nakshatra: string;
  pada: number;
  significance: string;
}

export interface UpgrahasFacts {
  dhuma: UpgrahaInfo;
  vyatipata: UpgrahaInfo;
  parivesha: UpgrahaInfo;
  indrachapa: UpgrahaInfo;
  upaketu: UpgrahaInfo;
  mandi: UpgrahaInfo;
  gulika: UpgrahaInfo;
  kala?: UpgrahaInfo;
  mrityu?: UpgrahaInfo;
  ardhaprahara?: UpgrahaInfo;
  yamaghantaka?: UpgrahaInfo;
  allUpgrahas: UpgrahaInfo[];
}

export interface BhavaBalaItem {
  houseNumber: number;
  sign: ZodiacSign;
  lord: PlanetName;
  bhavadhipatiBala: number;
  bhavaDigBala: number;
  bhavaDrishtiBala: number;
  totalVirupas: number;
  totalRupas: number;
  rank: number;
}

export interface PlanetaryAvasthas {
  planet: PlanetName;
  baladi: 'Bala' | 'Kumara' | 'Yuva' | 'Vriddha' | 'Mrita';
  jagradadi: 'Jagrata' | 'Swapna' | 'Sushupti';
  deeptadi: 'Deepta' | 'Swastha' | 'Mudita' | 'Shanta' | 'Deena' | 'Dukhita' | 'Vikala' | 'Khala';
  functionalNature: 'Yogakaraka' | 'Benefic' | 'Malefic' | 'Neutral' | 'Maraka';
}

export interface StrengthFacts {
  shadbala: ShadbalaFactor[];
  bhavaBala: BhavaBalaItem[];
  avasthas: PlanetaryAvasthas[];
  methodology?: {
    shadbala: 'classical_full' | 'classical_partial' | 'approximate';
    notes: string[];
  };
  completeShadbala?: ShadbalaFactor[];
}

export interface YogaFact {
  id: string;
  name: string;
  category: 'MAHAPURUSHA' | 'RAJA' | 'DHANA' | 'VIPARITA' | 'CHANDRA' | 'SOLAR' | 'MISCELLANEOUS';
  present: boolean;
  formingPlanets: PlanetName[];
  housesInvolved: number[];
  bphsReference: string;
  classicalRule: string;
  effects: string;
  interpretationStatus?: 'structural' | 'qualified';
  schoolDependent?: boolean;
}

export interface DoshaFact {
  id: string;
  name: string;
  present: boolean;
  severity: 'HIGH' | 'MEDIUM' | 'MILD' | 'NONE';
  description: string;
  mitigatingFactors: string[];
  remedies: string[];
  schoolDependent?: boolean;
  interpretationStatus?: 'structural' | 'qualified';
}

export interface CharaKaraka {
  role: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  roleName: string;
  planet: PlanetName;
  degreeInSign: number;
  formattedDegree: string;
  sign: ZodiacSign;
  signification: string;
}

export interface AmatyakarakaDetails {
  planet: PlanetName;
  degreeInSign: number;
  formattedDegree: string;
  d1Sign: ZodiacSign;
  d1House: number;
  d9Sign?: ZodiacSign;
  d9House?: number;
  d10Sign?: ZodiacSign;
  d10House?: number;
}

export interface JaiminiFacts {
  charaKarakas: CharaKaraka[];
  atmakaraka: PlanetName;
  amatyakaraka?: PlanetName;
  amatyakarakaDetails?: AmatyakarakaDetails;
  karakaScheme?: 'seven_karaka' | 'eight_karaka';
  /** Backward-compatible field: D1 Rashi sign occupied by the Atmakaraka. */
  karakamsaSign: ZodiacSign;
  /** Standard Karakamsa: D9/Navamsha sign occupied by the Atmakaraka. */
  karakamsaNavamshaSign: ZodiacSign;
  /** 10th house from Karakamsa in D9 Navamsha (Jaimini Upadesha Sutras career factor) */
  tenthFromKarakamsaNavamsha?: {
    sign: ZodiacSign;
    signIndex: number;
    occupants: PlanetName[];
  };
  arudhaLagna: {
    sign: ZodiacSign;
    houseNumber: number;
  };
  upapadaLagna: {
    sign: ZodiacSign;
    houseNumber: number;
  };
  /** Arudha of the 10th house (Rajya Pada / A10) */
  rajyaPadaA10?: {
    sign: ZodiacSign;
    signIndex: number;
    houseNumber: number;
  };
}

export interface AshtakavargaFacts {
  bav: Record<PlanetName, number[]>; // 12 signs bindus for each planet
  sav: number[]; // 12 signs total bindus (sum = 337)
  sarvashtakavargaTotal: number; // 337
  strongSigns: ZodiacSign[]; // SAV > 28
  averageSigns: ZodiacSign[]; // SAV = 28
  weakSigns: ZodiacSign[]; // SAV < 28
}

export interface TransitPlanet {
  planet: PlanetName;
  siderealLongitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  formattedDegree: string;
  retrograde: boolean;
  natalLagnaHouse: number; // 1-12
  chandraLagnaHouse: number; // 1-12
  ashtakavargaBindus: number; // bindus in this sign in SAV
  aspectsToNatal: {
    natalPlanet: PlanetName;
    type: 'PARASHARI' | 'WESTERN_OPTIONAL';
    aspectDescription: string;
    orbDegrees?: number;
  }[];
}

export interface TransitFacts {
  queryDateIso: string;
  planets: TransitPlanet[];
  solarIngress?: {
    timestampUtc: string;
    targetSign: ZodiacSign;
  };
  sadeSati: {
    active: boolean;
    phase: 'RISING' | 'PEAK' | 'SETTING' | 'NONE';
    saturnSign: ZodiacSign;
    moonSign: ZodiacSign;
    description: string;
  };
}

export interface EvidenceRecord {
  evidenceId: string;
  category: 'ASTRONOMY' | 'DIGNITY' | 'VARGA' | 'DASHA' | 'YOGA' | 'TRANSIT' | 'ASHTAKAVARGA';
  sourceSystem: string;
  ruleReference: string;
  factPath: string;
  factValue: string;
  description: string;
}

export interface TimingSignal {
  id: string;
  title: string;
  domain: 'CAREER' | 'RELATIONSHIPS' | 'HEALTH' | 'FINANCE' | 'SPIRITUALITY' | 'GENERAL';
  precision: TimingPrecision;
  exactTimestampUtc?: string;
  windowStartIso?: string;
  windowEndIso?: string;
  confluenceBasis: 'DIRECT' | 'SUPPORTED' | 'CONVERGENT' | 'CONTEXTUAL' | 'UNRESOLVED';
  activeFactors: string[];
  evidenceIds: string[];
  summary: string;
}

export interface AIInterpretationContext {
  schemaVersion: '1.0';
  /** Astronomical provider snapshot used for the natal calculation when available. */
  ephemeris?: import('./ephemeris.ts').SiderealEphemerisSnapshot;
  generatedAtIso: string;
  birthProfile: BirthProfile;
  ascendant: AscendantInfo;
  planets: PlanetPosition[];
  houses: HouseInfo[];
  chalit?: ChalitChart;
  upgrahas?: UpgrahasFacts;
  pastCalibration?: import('./pastCalibration.ts').PastCalibrationResult;
  vargas: Record<VargaCode, VargaChart>;
  panchanga: PanchangaFacts;
  dasha: VimshottariDashaFacts;
  strength: StrengthFacts;
  yogas: YogaFact[];
  doshas: DoshaFact[];
  jaimini: JaiminiFacts;
  ashtakavarga: AshtakavargaFacts;
  transits: TransitFacts;
  timingSignals: TimingSignal[];
  evidencePool: EvidenceRecord[];
}

export interface NarrativeClaim {
  claimId: string;
  domain: string;
  text: string;
  evidenceIds: string[];
  ruleIds: string[];
  confidenceBasis: 'DIRECT' | 'SUPPORTED' | 'CONVERGENT' | 'UNRESOLVED';
  timingPrecision: TimingPrecision;
  timingWindow?: string;
}

export interface NarrativeContradiction {
  domain: string;
  statement: string;
  positiveFactors: string[];
  challengingFactors: string[];
  unresolved: boolean;
}

export interface NarrativeResponse {
  summary: string;
  executiveSynthesis: string;
  domains: {
    domainName: string;
    narrative: string;
    claims: NarrativeClaim[];
    contradictions?: NarrativeContradiction[];
  }[];
  activeDashaImpact: string;
  gocharaTransitSynthesis: string;
  remediesAndGuidance: string[];
  limitations: string[];
  contextHashSha256?: string;
}
