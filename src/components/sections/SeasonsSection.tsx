import { useMemo, useState } from 'react';
import { TrekCard } from '../TrekCard';
import { ALL_TREKS, MONTH_FULL_NAMES, MONTH_LIST } from '../../lib/treksData';
import type { MonthCode } from '../../types/trek';

const DEFAULT_MONTH: MonthCode = MONTH_LIST[new Date().getMonth()] ?? 'Nov';

export function SeasonsSection() {
  const [selectedMonth, setSelectedMonth] = useState<MonthCode>(DEFAULT_MONTH);

  const monthCounts = useMemo(
    () =>
      MONTH_LIST.map((m) => ({
        month: m,
        bestCount: ALL_TREKS.filter((t) => t.bestMonths.includes(m)).length,
        shoulderCount: ALL_TREKS.filter((t) => t.shoulderMonths.includes(m)).length,
      })),
    [],
  );

  const matchingTreks = useMemo(
    () => ALL_TREKS.filter((t) => t.bestMonths.includes(selectedMonth)),
    [selectedMonth],
  );

  const shoulderTreks = useMemo(
    () => ALL_TREKS.filter((t) => t.shoulderMonths.includes(selectedMonth)),
    [selectedMonth],
  );

  return (
    <div className="wrap">
      <p className="micro">07 — SEASONS · 12-MONTH WINDOW CALENDAR</p>
      <h2>WHEN TO GO</h2>
      <p style={{ maxWidth: '720px' }}>
        Built from every route&apos;s verified open season across the 18 treks. Tap a month to inspect prime trails and shoulder-window caveats.
      </p>

      <div className="seasons" role="group" aria-label="Select month">
        {monthCounts.map(({ month, bestCount, shoulderCount }) => (
          <button
            key={month}
            type="button"
            className={`month${selectedMonth === month ? ' sel' : ''}`}
            aria-pressed={selectedMonth === month}
            onClick={() => setSelectedMonth(month)}
          >
            <b>{MONTH_FULL_NAMES[month]}</b>
            <br />
            <span className="mono">{bestCount} PRIME OPEN</span>
            {shoulderCount > 0 && (
              <>
                <br />
                <span className="mono" style={{ opacity: 0.78 }}>
                  +{shoulderCount} SHOULDER
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      <p className="micro" style={{ marginTop: '22px' }}>
        {MONTH_FULL_NAMES[selectedMonth].toUpperCase()} — {matchingTreks.length} PRIME WINDOWS
        {shoulderTreks.length > 0 ? ` · ${shoulderTreks.length} SHOULDER ADVISORIES` : ''}
      </p>

      <div className="trek-grid" style={{ marginTop: '14px' }}>
        {matchingTreks.map((t) => (
          <TrekCard key={t.slug} trek={t} />
        ))}
      </div>
    </div>
  );
}
