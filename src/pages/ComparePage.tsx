import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GitCompareArrows, Calculator } from 'lucide-react';
import { ALL_TREKS, formatInr } from '../lib/treksData';
import { useCompare } from '../lib/compareContext';
import { ElevationChart } from '../components/ElevationChart';
import { Picture } from '../components/Picture';
import { usePageSeo } from '../lib/seo';

const SERIES_COLORS = ['#df7b42', '#59b3c4', '#71a87e'];

export default function ComparePage() {
  const { compareSlugs, setCompareSlugs } = useCompare();

  usePageSeo({
    title: 'Compare 2–3 Himalayan Treks Side-by-Side | HIMAVAT',
    description:
      'Compare altitude profiles, days, permit tariffs, roadheads, and DIY vs commercial operator cost ranges side-by-side across India treks.',
  });

  const activeSlugs = useMemo(
    () => (compareSlugs.length >= 2 ? compareSlugs.slice(0, 3) : ['kedarkantha', 'hampta-pass', 'goecha-la']),
    [compareSlugs],
  );

  const selectedTreks = useMemo(
    () =>
      activeSlugs
        .map((slug) => ALL_TREKS.find((t) => t.slug === slug))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [activeSlugs],
  );

  const handleSlotChange = (slotIdx: number, nextSlug: string) => {
    const next = [...activeSlugs];
    next[slotIdx] = nextSlug;
    // Ensure uniqueness across columns
    const dedup = Array.from(new Set(next));
    setCompareSlugs(dedup);
  };

  return (
    <div className="page-shell">
      <div className="container">
        <span className="eyebrow-coord">
          <GitCompareArrows size={14} aria-hidden="true" />
          SIDE-BY-SIDE TELEMETRY MATRIX
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginTop: '0.5rem' }}>
          Compare Up To 3 Treks
        </h1>
        <p style={{ maxWidth: '62ch', color: 'var(--ink-secondary)', marginBottom: '1.75rem' }}>
          Align elevation curves and total true cost across India&rsquo;s flagship regions before picking your departure window. All prices approximate, checked Nov 13, 2026.
        </p>

        {/* Slot Pickers */}
        <section
          aria-label="Select treks to compare"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
        >
          {[0, 1, 2].map((slot) => (
            <div key={slot} className="surface-panel" style={{ padding: '1rem', borderTop: `3px solid ${SERIES_COLORS[slot]}` }}>
              <label htmlFor={`cmp-${slot}`} className="field-label" style={{ display: 'block', marginBottom: '0.45rem' }}>
                Column {slot + 1} {slot === 2 ? '(Optional 3rd Trail)' : ''}
              </label>
              <select
                id={`cmp-${slot}`}
                className="field-control"
                value={activeSlugs[slot] ?? ''}
                onChange={(e) => {
                  if (!e.target.value && slot === 2) {
                    setCompareSlugs(activeSlugs.slice(0, 2));
                  } else if (e.target.value) {
                    handleSlotChange(slot, e.target.value);
                  }
                }}
              >
                {slot === 2 && <option value="">— Compare Only 2 Trails —</option>}
                {ALL_TREKS.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.state})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </section>

        {/* Overlay Chart */}
        <section className="surface-panel" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '0.4rem' }}>Normalized Elevation Curves</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
            Track total altitude ceiling alongside steepness of ascent across trek days.
          </p>
          <ElevationChart
            mode="compare"
            series={selectedTreks.map((trek, i) => ({ trek, color: SERIES_COLORS[i] }))}
          />
        </section>

        {/* Side-by-Side Comparison Matrix */}
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '170px' }}>Dimension</th>
                {selectedTreks.map((t, i) => (
                  <th key={t.slug} style={{ borderTop: `3px solid ${SERIES_COLORS[i]}`, minWidth: '220px' }}>
                    <Link to={`/treks/${t.slug}`} style={{ color: 'var(--ink-primary)', fontSize: '1rem' }}>
                      {t.name}
                    </Link>
                    <div style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>{t.state}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Visual Preview</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug}>
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: 6 }}>
                      <Picture slug={t.imageSlug} alt={t.name} sizes="340px" />
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Status &amp; Access</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug}>
                    <span className={`status-badge status-${t.status}`}>{t.status}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>{t.statusNote}</div>
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Peak Altitude</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug} className="tabular-nums">
                    <strong>{t.altitudeM.toLocaleString('en-IN')} m</strong> ({t.altitudeFt.toLocaleString('en-IN')} ft)
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Duration &amp; Distance</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug} className="tabular-nums">
                    {t.daysMin}–{t.daysMax} days · {t.distanceKm} km
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Difficulty Grade</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug}>{t.difficulty}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Prime Seasons</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug}>{t.bestMonths.join(', ')}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Operator Package Range</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug} className="tabular-nums">
                    <strong>Typical {formatInr(t.operatorCostInr.typical)}</strong>
                    <div style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                      Range {formatInr(t.operatorCostInr.min)} – {formatInr(t.operatorCostInr.max)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>DIY Solo Bus+Stay Est.</strong></td>
                {selectedTreks.map((t) => {
                  const est =
                    t.diyBudget.transportRoundTrip +
                    (t.diyBudget.stayPerDay + t.diyBudget.foodPerDay) * t.daysMax +
                    t.diyBudget.permitTotal;
                  return (
                    <td key={t.slug} className="tabular-nums">
                      <strong style={{ color: 'var(--accent-forest)' }}>{formatInr(est)}</strong>
                      <div style={{ marginTop: '0.35rem' }}>
                        <Link to={`/planner?trek=${t.slug}`} style={{ fontSize: '0.78rem', color: 'var(--accent-glacier)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calculator size={12} /> Open in Planner
                        </Link>
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td><strong>Permits</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug} style={{ fontSize: '0.84rem' }}>
                    {t.permits.authority} (approx ₹{t.permits.indianFeeInr} Indian / ₹{t.permits.foreignFeeInr} Foreign)
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Nearest Rail / Roadhead</strong></td>
                {selectedTreks.map((t) => (
                  <td key={t.slug} style={{ fontSize: '0.84rem' }}>
                    {t.nearestRail} → {t.roadhead}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
