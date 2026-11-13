import rawDataset from '../../data/treks.json';
import type { MonthCode, TrekRecord } from '../types/trek';

export const MONTH_LIST: MonthCode[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_FULL_NAMES: Record<MonthCode, string> = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
};

export interface DatasetSource {
  name: string;
  url: string;
  checked: string;
}

export interface DatasetMeta {
  title: string;
  lastChecked: string;
  priceDisclaimer: string;
  currency: string;
  sources: DatasetSource[];
}

const typedDataset = rawDataset as { meta: DatasetMeta; treks: TrekRecord[] };

export const TREK_META: DatasetMeta = typedDataset.meta;
export const ALL_TREKS: TrekRecord[] = typedDataset.treks;

export function getTrekBySlug(slug: string | undefined): TrekRecord | undefined {
  if (!slug) return undefined;
  return ALL_TREKS.find((t) => t.slug === slug);
}

export function getMonthSeasonStatus(
  trek: TrekRecord,
  month: MonthCode,
): 'best' | 'shoulder' | 'avoid' {
  if (trek.bestMonths.includes(month)) return 'best';
  if (trek.shoulderMonths.includes(month)) return 'shoulder';
  return 'avoid';
}

export function isGuideCompulsory(trek: TrekRecord): boolean {
  return (
    trek.slug === 'sandakphu' ||
    trek.slug === 'goecha-la' ||
    trek.slug === 'pin-parvati-pass' ||
    trek.slug === 'buran-ghati'
  );
}

export interface DiyPlanInput {
  groupSize: number;
  month: MonthCode;
  hireGuide: boolean;
  rentGear: boolean;
}

export interface DiyBreakdown {
  days: number;
  groupSize: number;
  month: MonthCode;
  seasonStatus: 'best' | 'shoulder' | 'avoid';
  guideForced: boolean;
  guidesNeeded: number;
  transportPerPerson: number;
  stayPerPerson: number;
  foodPerPerson: number;
  permitsPerPerson: number;
  guidePerPerson: number;
  gearPerPerson: number;
  diyTotalPerPerson: number;
  groupTotal: number;
  savingsVsTypical: number;
  savingsPct: number;
  tips: string[];
}

export function computeDiyBudget(trek: TrekRecord, input: DiyPlanInput): DiyBreakdown {
  const groupSize = Math.max(1, Math.min(12, Math.round(input.groupSize)));
  const days = trek.daysMax;
  const guideForced = isGuideCompulsory(trek);
  const useGuide = guideForced || input.hireGuide;
  const guidesNeeded = useGuide ? Math.ceil(groupSize / 6) : 0;

  // Group transit discount if group >= 4 sharing direct local Sumo/Bolero splits
  const transportFactor = groupSize >= 4 ? 0.92 : 1.0;
  const transportPerPerson = Math.round(trek.diyBudget.transportRoundTrip * transportFactor);
  const stayPerPerson = Math.round(days * trek.diyBudget.stayPerDay);
  const foodPerPerson = Math.round(days * trek.diyBudget.foodPerDay);
  const permitsPerPerson = Math.round(trek.diyBudget.permitTotal);
  const guidePerPerson = useGuide
    ? Math.round((guidesNeeded * trek.diyBudget.guidePerDay * days) / groupSize)
    : 0;
  const gearPerPerson = input.rentGear ? Math.round(days * trek.diyBudget.gearRentalPerDay) : 0;

  const diyTotalPerPerson =
    transportPerPerson +
    stayPerPerson +
    foodPerPerson +
    permitsPerPerson +
    guidePerPerson +
    gearPerPerson;

  const groupTotal = diyTotalPerPerson * groupSize;
  const savingsVsTypical = trek.operatorCostInr.typical - diyTotalPerPerson;
  const savingsPct =
    trek.operatorCostInr.typical > 0
      ? Math.round((savingsVsTypical / trek.operatorCostInr.typical) * 100)
      : 0;

  const seasonStatus = getMonthSeasonStatus(trek, input.month);

  const tips: string[] = [
    trek.diyBudget.notes,
    groupSize === 1
      ? 'Solo hikers cut local guide and taxi splits dramatically by posting departure dates at roadhead teahouses or joining a 3–4 person carpool from the railhead.'
      : `Splitting a local guide across ${groupSize} hikers lowers guide overhead to ₹${guidePerPerson.toLocaleString('en-IN')}/person total.`,
    trek.permits.required
      ? `Pay official fees directly at ${trek.permits.authority} booths (approx. ₹${trek.permits.indianFeeInr.toLocaleString('en-IN')} Indian) instead of agency markups.`
      : 'No advance wildlife entry fee needed for domestic walkers—carry printed Govt ID copies for roadside police checkposts.',
    'Compare commercial vs subsidized departures: YHAI national programs and local homestay-based walks run well below boutique guided packages.',
  ];

  return {
    days,
    groupSize,
    month: input.month,
    seasonStatus,
    guideForced,
    guidesNeeded,
    transportPerPerson,
    stayPerPerson,
    foodPerPerson,
    permitsPerPerson,
    guidePerPerson,
    gearPerPerson,
    diyTotalPerPerson,
    groupTotal,
    savingsVsTypical,
    savingsPct,
    tips,
  };
}

export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
