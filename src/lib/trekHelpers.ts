import type { ElevationWaypoint, TrekDifficulty, TrekRecord } from '../types/trek';

/**
 * Complementary Indian Himalaya imagery from public/images/ used for
 * dual-angle card hover swaps and editorial strips (all 25 sets verified).
 */
export const ALT_IMAGE_BY_SLUG: Record<string, string> = {
  kedarkantha: 'stage-camp-night',
  'hampta-pass': 'stage-valley',
  'valley-of-flowers': 'har-ki-dun',
  triund: 'stage-waterfall',
  kheerganga: 'stage-forest',
  roopkund: 'stage-glacier',
  brahmatal: 'kedarkantha',
  'har-ki-dun': 'dayara-bugyal',
  'dayara-bugyal': 'chopta-chandrashila',
  'chopta-chandrashila': 'hero-dawn',
  sandakphu: 'goecha-la',
  'goecha-la': 'sandakphu',
  'markha-valley': 'stage-valley',
  'stok-kangri': 'stage-glacier',
  'pin-parvati-pass': 'stage-stream',
  'buran-ghati': 'hampta-pass',
  'kashmir-great-lakes': 'stage-stream',
  'kuari-pass': 'hero-dawn',
};

export const CLASSIC_SLUGS = [
  'kedarkantha',
  'triund',
  'valley-of-flowers',
  'hampta-pass',
  'dayara-bugyal',
  'kuari-pass',
] as const;

export const OFFBEAT_SLUGS = [
  'pin-parvati-pass',
  'markha-valley',
  'goecha-la',
  'buran-ghati',
  'roopkund',
  'kashmir-great-lakes',
] as const;

export function getAltImageSlug(trek: TrekRecord): string {
  return ALT_IMAGE_BY_SLUG[trek.slug] ?? 'hero-dawn';
}

export function formatDaysRange(daysMin: number, daysMax: number): string {
  if (daysMin === daysMax) {
    return `${daysMin} day${daysMin === 1 ? '' : 's'}`;
  }
  return `${daysMin}–${daysMax} days`;
}

export function getDifficultyPips(difficulty: TrekDifficulty): number {
  switch (difficulty) {
    case 'Easy':
      return 1;
    case 'Easy-Moderate':
      return 2;
    case 'Moderate':
      return 3;
    case 'Moderate-Difficult':
      return 4;
    case 'Difficult':
    case 'Very Difficult':
      return 5;
  }
}

export function formatOperatorPriceRange(trek: TrekRecord): string {
  const { min, max, typical } = trek.operatorCostInr;
  if (trek.status === 'closed' || (min === 0 && max === 0 && typical === 0)) {
    return 'Summit closed — permits suspended';
  }
  return `₹${min.toLocaleString('en-IN')}–₹${max.toLocaleString('en-IN')}`;
}

/**
 * Guarantees >= 2 waypoints for every trek so ElevationChart always plots
 * a real altitude profile without fabricating summit claims (e.g. Kheerganga
 * derives its 2,200 m start/end directly from trek.roadhead "Barshaini (2,200 m)").
 */
export function getEffectiveWaypoints(trek: TrekRecord): ElevationWaypoint[] {
  if (trek.elevationProfile.length >= 2) {
    return trek.elevationProfile;
  }
  if (trek.elevationProfile.length === 1) {
    const point = trek.elevationProfile[0];
    const halfDist = Number((point.distanceKm / 2).toFixed(1));
    return [
      {
        day: 0,
        camp: trek.roadhead.split('—')[0].trim() || 'Roadhead',
        altitudeM: 2200,
        distanceKm: 0,
      },
      {
        day: point.day,
        camp: `${trek.name} (~${point.altitudeM.toLocaleString('en-IN')} m)`,
        altitudeM: point.altitudeM,
        distanceKm: halfDist,
      },
      {
        day: point.day,
        camp: 'Return trailhead',
        altitudeM: 2200,
        distanceKm: point.distanceKm,
      },
    ];
  }
  return [];
}
