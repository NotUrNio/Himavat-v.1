import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  ALL_TREKS,
  MONTH_LIST,
  MONTH_FULL_NAMES,
  TREK_META,
  computeDiyBudget,
  formatInr,
  getTrekBySlug,
} from '../lib/treksData';
import { usePageSeo } from '../lib/seo';
import type { MonthCode } from '../types/trek';

export default function PlannerPage() {
  const [params] = useSearchParams();
  const initialSlug = getTrekBySlug(params.get('trek') ?? undefined)?.slug || 'kedarkantha';

  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug);
  const [groupSize, setGroupSize] = useState<number>(2);
  const [month, setMonth] = useState<MonthCode>('Dec');
  const [hireGuide, setHireGuide] = useState<boolean>(true);
  const [rentGear, setRentGear] = useState<boolean>(true);

  usePageSeo({
    title: 'Budget DIY Trek Planner | HIMAVAT Field Atlas',
    description:
      'Pick any Indian Himalayan trek, group size, and month to build an itemized DIY itinerary and compare against typical commercial package prices.',
  });

  const trek = useMemo(
    () => getTrekBySlug(selectedSlug) ?? ALL_TREKS[0],
    [selectedSlug],
  );

  const plan = useMemo(
    () => computeDiyBudget(trek, { groupSize, month, hireGuide, rentGear }),
    [trek, groupSize, month, hireGuide, rentGear],
  );

  const costRows = [
    { label: 'Public Bus / Railhead Shared Transit (Round Trip)', val: plan.transportPerPerson, color: '#59b3c4' },
    { label: `Homestay / Dhaba / Trail Shelter (${plan.days} days)`, val: plan.stayPerPerson, color: '#71a87e' },
    { label: `Local Trail Food & Hot Tea (${plan.days} days)`, val: plan.foodPerPerson, color: '#e39b4f' },
    { label: `Permits & Checkpost Fee (${trek.permits.authority.split('(')[0].trim()})`, val: plan.permitsPerPerson, color: '#df7b42' },
    {
      label: plan.guideForced
        ? `Local Statutory Guide (${plan.guidesNeeded} guide split across ${plan.groupSize})`
        : plan.guidePerPerson > 0
          ? `Optional Local Guide (${plan.guidesNeeded} guide split across ${plan.groupSize})`
          : 'Independent Self-Navigated (No guide hired)',
      val: plan.guidePerPerson,
      color: '#9bb3c7',
    },
    { label: rentGear ? `Local Footwear / Crampon / Pole Rental (${plan.days} days)` : 'Personal Gear Owned (₹0 rental)', val: plan.gearPerPerson, color: '#c48d68' },
  ];

  const maxBar = Math.max(plan.diyTotalPerPerson, trek.operatorCostInr.typical, trek.operatorCostInr.max, 1);

  return (
    <div className="page-shell">
      <div className="container">
        <span className="eyebrow-coord">
          <Calculator size={14} aria-hidden="true" />
          INDEPENDENT COST ENGINE · {TREK_META.lastChecked}
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginTop: '0.5rem' }}>
          Budget Trek Planner (DIY vs Package)
        </h1>
        <p style={{ maxWidth: '64ch', color: 'var(--ink-secondary)', marginBottom: '2rem' }}>
          Choose a trail, your group headcount, and departure month to see what an honest local-bus &amp; homestay trek actually costs—{TREK_META.priceDisclaimer}
        </p>

        {/* Controls Card */}
        <section className="filter-bar" aria-label="DIY Trip Parameters">
          <div className="field-group">
            <label htmlFor="p-trek" className="field-label">Select Trek</label>
            <select
              id="p-trek"
              className="field-control"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
            >
              {ALL_TREKS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name} ({t.state} · {t.daysMax}d)
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="p-group" className="field-label">Group Size ({groupSize} {groupSize === 1 ? 'Hiker' : 'Hikers'})</label>
            <input
              id="p-group"
              type="range"
              min={1}
              max={10}
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#df7b42', marginTop: '0.55rem' }}
            />
          </div>

          <div className="field-group">
            <label htmlFor="p-month" className="field-label">Month of Departure</label>
            <select
              id="p-month"
              className="field-control"
              value={month}
              onChange={(e) => setMonth(e.target.value as MonthCode)}
            >
              {MONTH_LIST.map((m) => (
                <option key={m} value={m}>{MONTH_FULL_NAMES[m]}</option>
              ))}
            </select>
          </div>

          <div className="field-group" style={{ justifyContent: 'center' }}>
            <span className="field-label">Guide &amp; Gear</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                className="choice-pill"
                aria-pressed={plan.guideForced || hireGuide}
                disabled={plan.guideForced}
                onClick={() => setHireGuide((v) => !v)}
                title={plan.guideForced ? 'Guide is statutorily mandatory on this route' : 'Toggle hiring a local guide'}
              >
                {plan.guideForced ? 'Guide Mandatory' : hireGuide ? 'Local Guide Included' : 'Self-Guided'}
              </button>
              <button
                type="button"
                className="choice-pill"
                aria-pressed={rentGear}
                onClick={() => setRentGear((v) => !v)}
              >
                {rentGear ? 'Gear Rented Locally' : 'Own Gear'}
              </button>
            </div>
          </div>
        </section>

        {/* Closure & Season Advisories */}
        <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '2rem' }}>
          {trek.status !== 'open' && (
            <div className={`advisory-banner${trek.status === 'closed' ? ' advisory-banner--closed' : ''}`}>
              <strong>Status Alert ({trek.name}):</strong> {trek.statusNote}
            </div>
          )}

          {plan.seasonStatus === 'avoid' ? (
            <div className="advisory-banner advisory-banner--closed">
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> Seasonal Warning for {MONTH_FULL_NAMES[month]}:
              </strong>{' '}
              {trek.name} is outside its safe operating window in {month} (monsoon landslides, flash flood risk, or deep winter road closures). Safer picks: {trek.bestMonths.join(', ')}.
            </div>
          ) : plan.seasonStatus === 'shoulder' ? (
            <div className="advisory-banner">
              <strong>Shoulder Month ({MONTH_FULL_NAMES[month]}):</strong> Passable with cold-weather contingency buffers or post-monsoon mud. Peak stability occurs in {trek.bestMonths.join(', ')}.
            </div>
          ) : (
            <div style={{ padding: '0.9rem 1.15rem', borderRadius: 'var(--radius-sm)', background: 'rgba(113,168,126,0.14)', borderLeft: '4px solid var(--accent-forest)', color: '#c4ecd0', fontSize: '0.92rem' }}>
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Prime Window Confirmed:
              </strong>{' '}
              {MONTH_FULL_NAMES[month]} sits inside {trek.name}&rsquo;s ideal operating months ({trek.bestMonths.join(', ')}).
            </div>
          )}
        </div>

        {/* Summary Split: Itemized Breakdown vs Package Bar Chart */}
        <div className="editorial-split" style={{ alignItems: 'start', marginBottom: '2.25rem' }}>
          <section className="surface-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span className="field-label">Per-Person DIY Estimate</span>
                <div className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent-forest)', lineHeight: 1.05 }}>
                  {formatInr(plan.diyTotalPerPerson)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="field-label">Combined ({groupSize} Hikers)</span>
                <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {formatInr(plan.groupTotal)}
                </div>
              </div>
            </div>

            <div className="table-scroll">
              <table className="data-table" style={{ minWidth: '420px' }}>
                <thead>
                  <tr>
                    <th>Cost Line Item</th>
                    <th style={{ textAlign: 'right' }}>Per Person</th>
                  </tr>
                </thead>
                <tbody>
                  {costRows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 700 }}>{formatInr(row.val)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(113,168,126,0.08)' }}>
                    <td><strong>Total Approximate DIY Estimate</strong></td>
                    <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 900, color: 'var(--accent-forest)' }}>
                      {formatInr(plan.diyTotalPerPerson)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              All prices approximate, checked Nov 13, 2026. Add rail/flight fare from your home city to {trek.nearestRail}.
            </p>
          </section>

          <section className="surface-panel">
            <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>DIY vs Commercial Operator Benchmark</h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
              Comparing your configured DIY plan against sampled group departures ({trek.operatorCostInr.operatorsSampled.join(', ')}).
            </p>

            <div style={{ display: 'grid', gap: '1.1rem' }}>
              {[
                { label: `Your DIY Plan (${groupSize} pax)`, val: plan.diyTotalPerPerson, col: 'var(--accent-forest)' },
                ...(trek.operatorCostInr.yhaiApprox
                  ? [{ label: 'YHAI National Program (Subsidized)', val: trek.operatorCostInr.yhaiApprox, col: 'var(--accent-glacier)' }]
                  : []),
                { label: 'Commercial Operator Median', val: trek.operatorCostInr.typical, col: 'var(--accent-dawn)' },
                { label: 'Commercial High-Tier Ceiling', val: trek.operatorCostInr.max, col: '#8a99a8' },
              ].map((bar) => (
                <div key={bar.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                    <span>{bar.label}</span>
                    <strong className="tabular-nums">{formatInr(bar.val)}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.round((bar.val / maxBar) * 100))}%`,
                        height: '100%',
                        background: bar.col,
                        borderRadius: 99,
                        transition: 'width 0.35s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(223,123,66,0.1)', border: '1px solid rgba(223,123,66,0.3)' }}>
              <strong>Bottom Line:</strong>{' '}
              {plan.savingsVsTypical > 0
                ? `DIY saves approx. ${formatInr(plan.savingsVsTypical)} per trekker (${plan.savingsPct}%) vs typical commercial operator tariffs.`
                : 'Solo winter gear rentals + single-person guide bring solo DIY close to subsidized group prices—pair up with 2–3 hikers at the roadhead to cut guide cost in half.'}
            </div>

            <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.6rem' }}>Roadhead Money-Saving Tactics</h3>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'grid', gap: '0.45rem', fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
              {plan.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Day-by-Day DIY Field Itinerary */}
        <section className="surface-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem' }}>Cheapest DIY Day-by-Day Schedule: {trek.name}</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
                Roadhead: {trek.roadhead} · Rail: {trek.nearestRail}
              </p>
            </div>
            <Link to={`/treks/${trek.slug}`} className="btn btn-secondary">
              Full Trail Dossier <ArrowRight size={15} />
            </Link>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Camp / Transit Sector</th>
                  <th>Altitude (m)</th>
                  <th>Approx Daily Stay + Food Budget</th>
                </tr>
              </thead>
              <tbody>
                {trek.elevationProfile.map((w) => (
                  <tr key={w.day}>
                    <td><strong>Day {w.day}</strong></td>
                    <td>{w.camp}</td>
                    <td className="tabular-nums">{w.altitudeM.toLocaleString('en-IN')} m</td>
                    <td className="tabular-nums">{formatInr(trek.diyBudget.stayPerDay + trek.diyBudget.foodPerDay)} / day</td>
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
