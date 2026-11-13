import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { ALL_TREKS, MONTH_LIST, MONTH_FULL_NAMES, getMonthSeasonStatus } from '../lib/treksData';
import { usePageSeo } from '../lib/seo';
import type { MonthCode } from '../types/trek';

export default function SeasonsPage() {
  const [focusMonth, setFocusMonth] = useState<MonthCode>('May');

  usePageSeo({
    title: 'Month-by-Month Indian Himalaya Trek Calendar | HIMAVAT',
    description:
      'Discover the best Himalayan treks in India for every month from January snow ridges to August Valley of Flowers blooms and autumn passes.',
  });

  const primeTreks = ALL_TREKS.filter((t) => getMonthSeasonStatus(t, focusMonth) === 'best');
  const shoulderTreks = ALL_TREKS.filter((t) => getMonthSeasonStatus(t, focusMonth) === 'shoulder');

  return (
    <div className="page-shell">
      <div className="container" style={{ display: 'grid', gap: '2.25rem' }}>
        <header>
          <span className="eyebrow-coord">
            <CalendarDays size={14} aria-hidden="true" />
            12-MONTH CLIMATE &amp; SNOWLINE WINDOWS
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginTop: '0.5rem' }}>
            Seasons Guide: Best Months Across 18 Trails
          </h1>
          <p style={{ maxWidth: '66ch', color: 'var(--ink-secondary)' }}>
            India&rsquo;s monsoon hits the Outer Garhwal, Himachal, and Sikkim ranges hard from July–August while Ladakh and Kashmir Great Lakes shine dry above the rain shadow. Pick any month to plan safe departures.
          </p>
        </header>

        {/* Interactive Month Spotlight */}
        <section className="surface-panel">
          <div className="pill-row" role="tablist" aria-label="Select Month" style={{ marginBottom: '1.5rem' }}>
            {MONTH_LIST.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={focusMonth === m}
                className={`choice-pill${focusMonth === m ? ' active' : ''}`}
                onClick={() => setFocusMonth(m)}
              >
                {m}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
            {MONTH_FULL_NAMES[focusMonth]} Trail Outlook
          </h2>
          <p style={{ margin: '0 0 1.25rem', color: 'var(--ink-secondary)', fontSize: '0.92rem' }}>
            <strong>{primeTreks.length} prime trails</strong> and <strong>{shoulderTreks.length} shoulder trails</strong> recommended for {MONTH_FULL_NAMES[focusMonth]}.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {primeTreks.map((t) => (
              <Link
                key={t.id}
                to={`/treks/${t.slug}`}
                style={{
                  textDecoration: 'none',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(113,168,126,0.1)',
                  border: '1px solid rgba(113,168,126,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9dd4a9', textTransform: 'uppercase' }}>Prime Window</span>
                  {t.status !== 'open' && <span className={`status-badge status-${t.status}`}>{t.status}</span>}
                </div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--ink-primary)' }}>{t.name}</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                  {t.state} · {t.altitudeM.toLocaleString('en-IN')} m · {t.daysMax} days
                </span>
              </Link>
            ))}

            {shoulderTreks.map((t) => (
              <Link
                key={t.id}
                to={`/treks/${t.slug}`}
                style={{
                  textDecoration: 'none',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(227,155,79,0.08)',
                  border: '1px solid rgba(227,155,79,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f3b874', textTransform: 'uppercase' }}>Shoulder</span>
                  {t.status !== 'open' && <span className={`status-badge status-${t.status}`}>{t.status}</span>}
                </div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--ink-primary)' }}>{t.name}</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                  {t.state} · {t.altitudeM.toLocaleString('en-IN')} m · {t.daysMax} days
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Full Matrix Table */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.45rem' }}>Complete Annual Availability Grid</h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>
              <span>● Prime</span>
              <span>◐ Shoulder</span>
              <span style={{ color: 'var(--ink-muted)' }}>— Avoid / Monsoon / Closed</span>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '185px' }}>Trek Route</th>
                  {MONTH_LIST.map((m) => (
                    <th key={m} style={{ textAlign: 'center', minWidth: '42px' }}>{m}</th>
                  ))}
                  <th>Logistics</th>
                </tr>
              </thead>
              <tbody>
                {ALL_TREKS.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/treks/${t.slug}`} style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>{t.name}</Link>
                      <div style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>{t.state} · {t.altitudeM}m</div>
                    </td>
                    {MONTH_LIST.map((m) => {
                      const s = getMonthSeasonStatus(t, m);
                      return (
                        <td
                          key={m}
                          title={`${t.name} in ${m}: ${s.toUpperCase()}`}
                          style={{
                            textAlign: 'center',
                            fontWeight: 800,
                            color: s === 'best' ? '#8dd99f' : s === 'shoulder' ? '#f3b874' : '#4f5d6b',
                            background: s === 'best' ? 'rgba(113,168,126,0.12)' : 'transparent',
                          }}
                        >
                          {s === 'best' ? '●' : s === 'shoulder' ? '◐' : '—'}
                        </td>
                      );
                    })}
                    <td>
                      <Link to={`/planner?trek=${t.slug}`} style={{ fontSize: '0.8rem', color: 'var(--accent-glacier)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        Plan <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
