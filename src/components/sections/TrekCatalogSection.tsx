import { useMemo, useState } from 'react';
import { TrekCard } from '../TrekCard';
import { ALL_TREKS, MONTH_LIST, TREK_META } from '../../lib/treksData';
import type { MonthCode, TrekRecord } from '../../types/trek';

export type CatalogPreset = 'all' | 'classic' | 'offbeat';

interface TrekCatalogSectionProps {
  preset?: CatalogPreset;
  onPresetChange?: (next: CatalogPreset) => void;
}

const STATES = Array.from(new Set(ALL_TREKS.map((t) => t.state))).sort();
const DIFFICULTIES = [
  'Easy',
  'Easy-Moderate',
  'Moderate',
  'Moderate-Difficult',
  'Difficult',
] as const;

type DurationFilter = '' | 'short' | 'mid' | 'long';
type BudgetFilter = '' | 'low' | 'mid' | 'high';
type SortMode = 'featured' | 'altitude-desc' | 'price-asc' | 'days-asc';

function matchesPreset(trek: TrekRecord, preset: CatalogPreset): boolean {
  if (preset === 'all') return true;
  const isClassic =
    trek.difficulty === 'Easy' ||
    trek.difficulty === 'Easy-Moderate' ||
    trek.slug === 'hampta-pass' ||
    trek.slug === 'kuari-pass';
  return preset === 'classic' ? isClassic : !isClassic;
}

export function TrekCatalogSection({ preset = 'all', onPresetChange }: TrekCatalogSectionProps) {
  const [difficulty, setDifficulty] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [month, setMonth] = useState<MonthCode | ''>('');
  const [duration, setDuration] = useState<DurationFilter>('');
  const [budget, setBudget] = useState<BudgetFilter>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('featured');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = ALL_TREKS.filter((t) => {
      if (!matchesPreset(t, preset)) return false;
      if (difficulty && t.difficulty !== difficulty) return false;
      if (stateFilter && t.state !== stateFilter) return false;
      if (month && !t.bestMonths.includes(month)) return false;
      if (statusFilter && t.status !== statusFilter) return false;

      if (duration === 'short' && t.daysMax > 5) return false;
      if (duration === 'mid' && (t.daysMax < 6 || t.daysMin > 8)) return false;
      if (duration === 'long' && t.daysMax < 9) return false;

      if (budget) {
        const typ = t.operatorCostInr.typical;
        if (t.status === 'closed' || typ <= 0) return false;
        if (budget === 'low' && typ >= 10000) return false;
        if (budget === 'mid' && (typ < 10000 || typ > 20000)) return false;
        if (budget === 'high' && typ <= 20000) return false;
      }

      if (q) {
        const hay = `${t.name} ${t.region} ${t.state} ${t.tagline} ${t.highlights.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'featured') return list;
    return [...list].sort((a, b) => {
      if (sortBy === 'altitude-desc') return b.altitudeM - a.altitudeM;
      if (sortBy === 'days-asc') return a.daysMin - b.daysMin;
      // Put closed / 0-tariff treks at the bottom for ascending price sort
      const pa = a.status === 'closed' || a.operatorCostInr.typical <= 0 ? Number.MAX_SAFE_INTEGER : a.operatorCostInr.typical;
      const pb = b.status === 'closed' || b.operatorCostInr.typical <= 0 ? Number.MAX_SAFE_INTEGER : b.operatorCostInr.typical;
      return pa - pb;
    });
  }, [preset, difficulty, stateFilter, month, duration, budget, statusFilter, sortBy, search]);

  const resetAll = () => {
    setDifficulty('');
    setStateFilter('');
    setMonth('');
    setDuration('');
    setBudget('');
    setStatusFilter('');
    setSortBy('featured');
    setSearch('');
    onPresetChange?.('all');
  };

  return (
    <div className="wrap">
      <p className="micro">03 — ALL TREKS</p>
      <h2>
        EIGHTEEN<br />
        <span className="thin">WAYS DOWN</span>
      </h2>

      {onPresetChange && (
        <div className="chips" role="group" aria-label="Trail category focus" style={{ marginTop: '18px' }}>
          {(['all', 'classic', 'offbeat'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`chipbtn${preset === item ? ' sel' : ''}`}
              onClick={() => onPresetChange(item)}
            >
              {item === 'all' ? 'All 18 Routes' : item === 'classic' ? 'On Trail — Classics' : 'Off Trail — Offbeat & Passes'}
            </button>
          ))}
        </div>
      )}

      <div className="filters" role="group" aria-label="Filter treks">
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Filter by difficulty">
          <option value="">Difficulty: All</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} aria-label="Filter by state">
          <option value="">State: All</option>
          {STATES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value as MonthCode | '')} aria-label="Filter by best month">
          <option value="">Month: All</option>
          {MONTH_LIST.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={duration} onChange={(e) => setDuration(e.target.value as DurationFilter)} aria-label="Filter by duration">
          <option value="">Duration: All</option>
          <option value="short">Up to 5 days</option>
          <option value="mid">6–8 days</option>
          <option value="long">9+ days</option>
        </select>

        <select value={budget} onChange={(e) => setBudget(e.target.value as BudgetFilter)} aria-label="Filter by budget">
          <option value="">Budget: All</option>
          <option value="low">Under ₹10,000</option>
          <option value="mid">₹10,000–₹20,000</option>
          <option value="high">Over ₹20,000</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">Status: All</option>
          <option value="open">Open</option>
          <option value="restricted">Restricted / Warning</option>
          <option value="closed">Summit Closed</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortMode)} aria-label="Sort treks">
          <option value="featured">Sort: Curated Order</option>
          <option value="altitude-desc">Highest Altitude First</option>
          <option value="price-asc">Lowest Typical Tariff</option>
          <option value="days-asc">Shortest Duration</option>
        </select>

        <input
          type="search"
          placeholder="Search trek, pass, or region…"
          aria-label="Search treks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="button" className="btn" onClick={resetAll}>
          <span>RESET</span>
        </button>
      </div>

      <p className="mono" style={{ marginBottom: '16px' }}>
        SHOWING {filtered.length} OF {ALL_TREKS.length} VERIFIED TREKS · TARIFFS APPROXIMATE, CHECKED {TREK_META.lastChecked}
      </p>

      {filtered.length === 0 ? (
        <div className="panel panel-filled">
          <p style={{ margin: '0 0 12px' }}>No Himalayan routes match those combined filters.</p>
          <button type="button" className="btn btn-solid" onClick={resetAll}>
            <span>RESET FILTERS</span>
          </button>
        </div>
      ) : (
        <div className="trek-grid">
          {filtered.map((trek) => (
            <TrekCard key={trek.slug} trek={trek} />
          ))}
        </div>
      )}
    </div>
  );
}
