import { useMemo } from 'react';
import { ElevationChart } from '../ElevationChart';
import { useCompare } from '../../lib/compareContext';
import { useTrekModal } from '../../lib/trekModalContext';
import { ALL_TREKS, getTrekBySlug, isGuideCompulsory } from '../../lib/treksData';
import { formatDaysRange, formatOperatorPriceRange, getEffectiveWaypoints } from '../../lib/trekHelpers';
import type { TrekRecord } from '../../types/trek';

const COMPARE_COLORS = ['#FF5A1F', '#59B3C4', '#F2F1ED'] as const;

export function CompareSection() {
  const { compareSlugs, toggleCompare, setCompareSlugs } = useCompare();
  const { openTrekSheet } = useTrekModal();

  const selectedTreks = useMemo(
    () =>
      compareSlugs
        .map((slug) => getTrekBySlug(slug))
        .filter((t): t is TrekRecord => Boolean(t)),
    [compareSlugs],
  );

  const compareSeries = useMemo(
    () =>
      selectedTreks.map((t, idx) => ({
        trek: {
          ...t,
          elevationProfile: getEffectiveWaypoints(t),
        },
        color: COMPARE_COLORS[idx % COMPARE_COLORS.length],
      })),
    [selectedTreks],
  );

  const availableToAdd = useMemo(
    () => ALL_TREKS.filter((t) => !compareSlugs.includes(t.slug)),
    [compareSlugs],
  );

  return (
    <div className="wrap">
      <p className="micro">06 — COMPARE · ELEVATION &amp; LOGISTICS MATRIX</p>
      <h2>
        PICK TWO<br />
        <span className="thin">OR THREE</span>
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', margin: '18px 0' }}>
        <select
          aria-label="Add a trek to comparison"
          value=""
          onChange={(e) => {
            if (e.target.value) toggleCompare(e.target.value);
          }}
          style={{
            padding: '10px 14px',
            border: '2px solid var(--paper)',
            background: 'var(--ink-panel)',
            color: 'var(--paper)',
            borderRadius: 'var(--radius-pill)',
            minHeight: '44px',
          }}
        >
          <option value="">+ Add trek to compare ({selectedTreks.length}/3)…</option>
          {availableToAdd.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name} ({t.altitudeM.toLocaleString('en-IN')} m)
            </option>
          ))}
        </select>

        {selectedTreks.length > 0 && (
          <button
            type="button"
            className="btn"
            onClick={() => setCompareSlugs([])}
          >
            <span>CLEAR ALL</span>
          </button>
        )}
      </div>

      {compareSeries.length >= 1 && (
        <ElevationChart
          mode="compare"
          series={compareSeries}
        />
      )}

      <div style={{ overflowX: 'auto', marginTop: '18px' }}>
        <table>
          <thead>
            <tr>
              <th>Trek</th>
              <th>Max Altitude</th>
              <th>Duration</th>
              <th>Difficulty</th>
              <th>Distance</th>
              <th>Guide Rule</th>
              <th>Operator Price</th>
              <th>Best Months</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedTreks.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  No treks selected — choose from the dropdown above or click “+ COMPARE” on any trek card.
                </td>
              </tr>
            ) : (
              selectedTreks.map((t) => (
                <tr key={t.slug}>
                  <td>
                    <strong>{t.name}</strong>
                    <div className="mono" style={{ color: '#9BA097' }}>{t.state}</div>
                  </td>
                  <td>{t.altitudeM.toLocaleString('en-IN')} m</td>
                  <td>{formatDaysRange(t.daysMin, t.daysMax)}</td>
                  <td>{t.difficulty}</td>
                  <td>{t.distanceKm} km</td>
                  <td>{isGuideCompulsory(t) ? 'Mandatory guide' : 'Optional'}</td>
                  <td>{formatOperatorPriceRange(t)}</td>
                  <td>{t.bestMonths.join(', ')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '6px 12px', minHeight: '36px' }}
                        onClick={() => openTrekSheet(t)}
                      >
                        <span>VIEW</span>
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '6px 12px', minHeight: '36px' }}
                        onClick={() => toggleCompare(t.slug)}
                      >
                        <span>✕</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
