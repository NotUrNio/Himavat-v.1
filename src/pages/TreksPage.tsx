import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { ALL_TREKS, MONTH_LIST, TREK_META } from '../lib/treksData';
import { TrekCard } from '../components/TrekCard';
import { useCompare } from '../lib/compareContext';
import { usePageSeo } from '../lib/seo';
import type { MonthCode, TrekDifficulty } from '../types/trek';

const DIFFICULTIES: TrekDifficulty[] = [
  'Easy',
  'Easy-Moderate',
  'Moderate',
  'Moderate-Difficult',
  'Difficult',
  'Very Difficult',
];

export default function TreksPage() {
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState<MonthCode | 'All'>('All');
  const [sortBy, setSortBy] = useState<'altitude' | 'diy' | 'operator' | 'days'>('altitude');

  const { compareSlugs, setCompareSlugs } = useCompare();

  usePageSeo({
    title: 'Explore 18 Indian Himalaya Treks | HIMAVAT Field Atlas',
    description:
      'Filter 18 Indian Himalayan trails across Uttarakhand, Himachal Pradesh, Ladakh, Sikkim, West Bengal & J&K by difficulty, days, budget, state, and month.',
  });

  const states = useMemo(
    () => ['All', ...Array.from(new Set(ALL_TREKS.map((t) => t.state)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = ALL_TREKS.filter((t) => {
      if (q) {
        const hay = `${t.name} ${t.state} ${t.region} ${t.roadhead} ${t.tagline}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (stateFilter !== 'All' && t.state !== stateFilter) return false;
      if (diffFilter !== 'All' && t.difficulty !== diffFilter) return false;

      if (durationFilter === '1-3' && t.daysMax > 3) return false;
      if (durationFilter === '4-6' && (t.daysMax < 4 || t.daysMax > 6)) return false;
      if (durationFilter === '7+' && t.daysMax < 7) return false;

      const diyEst =
        t.diyBudget.transportRoundTrip +
        (t.diyBudget.stayPerDay + t.diyBudget.foodPerDay) * t.daysMax +
        t.diyBudget.permitTotal;
      if (budgetFilter === 'under-6000' && diyEst > 6000) return false;
      if (budgetFilter === '6000-10000' && (diyEst < 6000 || diyEst > 10000)) return false;
      if (budgetFilter === '10000+' && diyEst < 10000) return false;

      if (monthFilter !== 'All' && !t.bestMonths.includes(monthFilter) && !t.shoulderMonths.includes(monthFilter)) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'altitude') return b.altitudeM - a.altitudeM;
      if (sortBy === 'operator') return a.operatorCostInr.typical - b.operatorCostInr.typical;
      if (sortBy === 'days') return a.daysMax - b.daysMax;
      const diyA = a.diyBudget.transportRoundTrip + (a.diyBudget.stayPerDay + a.diyBudget.foodPerDay) * a.daysMax + a.diyBudget.permitTotal;
      const diyB = b.diyBudget.transportRoundTrip + (b.diyBudget.stayPerDay + b.diyBudget.foodPerDay) * b.daysMax + b.diyBudget.permitTotal;
      return diyA - diyB;
    });
  }, [query, stateFilter, diffFilter, durationFilter, budgetFilter, monthFilter, sortBy]);

  const resetAll = () => {
    setQuery('');
    setStateFilter('All');
    setDiffFilter('All');
    setDurationFilter('All');
    setBudgetFilter('All');
    setMonthFilter('All');
    setSortBy('altitude');
  };

  return (
    <div className="page-shell">
      <div className="container">
        <span className="eyebrow-coord">
          <SlidersHorizontal size={14} aria-hidden="true" />
          VERIFIED TRAIL REGISTRY · 18 ROUTES · {TREK_META.lastChecked}
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', marginTop: '0.5rem' }}>
          Indian Himalaya Trek Finder
        </h1>
        <p style={{ maxWidth: '64ch', color: 'var(--ink-secondary)', marginBottom: '1.75rem' }}>
          Filter every major corridor from two-day Dhauladhar ridges to twelve-day Trans-Himalayan crossings.
          {` ${TREK_META.priceDisclaimer}`}
        </p>

        {/* Filter Bar */}
        <section className="filter-bar" aria-label="Trail Filters">
          <div className="field-group filter-search-field">
            <label htmlFor="f-search" className="field-label">Search Trail / Roadhead</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} aria-hidden="true" style={{ position: 'absolute', left: 10, top: 12, color: 'var(--ink-muted)' }} />
              <input
                id="f-search"
                type="search"
                className="field-control"
                style={{ paddingLeft: '2.1rem' }}
                placeholder="Sankri, Spiti, Kedarkantha..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="f-state" className="field-label">State / UT</label>
            <select id="f-state" className="field-control" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="f-diff" className="field-label">Difficulty</label>
            <select id="f-diff" className="field-control" value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
              <option value="All">All Grades</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="f-dur" className="field-label">Duration</label>
            <select id="f-dur" className="field-control" value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)}>
              <option value="All">Any Length</option>
              <option value="1-3">Weekend (1–3 Days)</option>
              <option value="4-6">Classic Week (4–6 Days)</option>
              <option value="7+">Expedition (7+ Days)</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="f-budget" className="field-label">DIY Budget Est.</label>
            <select id="f-budget" className="field-control" value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
              <option value="All">Any Budget</option>
              <option value="under-6000">Under ₹6,000</option>
              <option value="6000-10000">₹6,000 – ₹10,000</option>
              <option value="10000+">Above ₹10,000</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="f-month" className="field-label">Target Month</label>
            <select id="f-month" className="field-control" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value as MonthCode | 'All')}>
              <option value="All">Any Month</option>
              {MONTH_LIST.map((m) => (
                <option key={m} value={m}>{m} (Best + Shoulder)</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="f-sort" className="field-label">Sort By</label>
            <select id="f-sort" className="field-control" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="altitude">Highest Altitude</option>
              <option value="diy">Lowest DIY Cost</option>
              <option value="operator">Lowest Package Cost</option>
              <option value="days">Shortest Duration</option>
            </select>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
            Showing <strong style={{ color: 'var(--ink-primary)' }}>{filtered.length}</strong> of {ALL_TREKS.length} Indian Himalayan treks
          </p>
          <button type="button" className="choice-pill" onClick={resetAll} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RotateCcw size={13} aria-hidden="true" /> Reset Filters
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="surface-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>No trails match every active filter</h2>
            <p style={{ color: 'var(--ink-secondary)' }}>Broaden your target month or increase DIY budget ceiling to restore routes.</p>
            <button type="button" className="btn btn-primary" onClick={resetAll}>
              Show All 18 Routes
            </button>
          </div>
        ) : (
          <div className="trek-grid">
            {filtered.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
        )}
      </div>

      {/* Persistent Compare Tray */}
      {compareSlugs.length > 0 && (
        <div className="compare-dock" role="region" aria-label="Trek Comparison Selection">
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-glacier)' }}>
            Compare ({compareSlugs.length}/3):
          </span>
          <span style={{ fontSize: '0.84rem', color: 'var(--ink-primary)' }}>
            {compareSlugs.map((slug) => ALL_TREKS.find((t) => t.slug === slug)?.name || slug).join(' · ')}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button type="button" className="choice-pill" onClick={() => setCompareSlugs([])}>
              Clear
            </button>
            <Link to="/compare" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
              Compare Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
