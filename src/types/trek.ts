export type TrekDifficulty = 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Difficult' | 'Difficult' | 'Very Difficult';

export type TrekStatus = 'open' | 'restricted' | 'closed';

export type MonthCode =
  | 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun'
  | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

export interface ElevationWaypoint {
  day: number;
  camp: string;
  altitudeM: number;
  distanceKm: number;
}

export interface TrekPermits {
  required: boolean;
  authority: string;
  indianFeeInr: number;
  foreignFeeInr: number;
  notes: string;
}

export interface OperatorCostSummary {
  min: number;
  max: number;
  yhaiApprox: number | null;
  typical: number;
  operatorsSampled: string[];
  priceLabel: string;
}

export interface DiyBudgetModel {
  transportRoundTrip: number;
  stayPerDay: number;
  foodPerDay: number;
  permitTotal: number;
  guidePerDay: number;
  gearRentalPerDay: number;
  notes: string;
}

export interface TrekRecord {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  state: string;
  region: string;
  altitudeM: number;
  altitudeFt: number;
  distanceKm: number;
  daysMin: number;
  daysMax: number;
  difficulty: TrekDifficulty;
  status: TrekStatus;
  statusNote: string;
  bestMonths: MonthCode[];
  shoulderMonths: MonthCode[];
  avoidMonths: MonthCode[];
  permits: TrekPermits;
  roadhead: string;
  nearestRail: string;
  nearestAirport: string;
  highlights: string[];
  elevationProfile: ElevationWaypoint[];
  operatorCostInr: OperatorCostSummary;
  diyBudget: DiyBudgetModel;
  summary: string;
  imageSlug: string;
  sources: string[];
}

export interface ImageManifestEntry {
  slug: string;
  widths: number[];
  width: number;
  height: number;
  aspectRatio: number;
  lqip: string;
  location: string;
  photographer: string;
  license: string;
  sourceUrl: string;
}
