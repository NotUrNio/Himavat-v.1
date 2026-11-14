import { useEffect, useMemo, useState } from 'react';
import {
  ALL_TREKS,
  MONTH_FULL_NAMES,
  MONTH_LIST,
  computeDiyBudget,
  formatInr,
  getTrekBySlug,
} from '../../lib/treksData';
import { formatDaysRange } from '../../lib/trekHelpers';
import type { MonthCode } from '../../types/trek';

const DEFAULT_MONTH = MONTH_LIST[new Date().getMonth()] ?? 'Nov';

export function BudgetPlannerSection({ initialSlug }: { initialSlug?: string }) {
  const [slug, setSlug] = useState<string>(() =>
    initialSlug && getTrekBySlug(initialSlug) ? initialSlug : ALL_TREKS[0].slug,
  );
  const [groupSize, setGroupSize] = useState(2);
  const [hireGuide, setHireGuide] = useState(true);
  const [rentGear, setRentGear] = useState(true);
  const [bufferPercent, setBufferPercent] = useState(12);
  const [month, setMonth] = useState<MonthCode>(DEFAULT_MONTH);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && getTrekBySlug(detail)) {
        setSlug(detail);
      }
    };
    window.addEventListener('himavat:select-planner-trek', handler);
    return () => window.removeEventListener('himavat:select-planner-trek', handler);
  }, []);

  const trek = useMemo(() => getTrekBySlug(slug) ?? ALL_TREKS[0], [slug]);

  const plan = useMemo(
    () =>
      computeDiyBudget(trek, {
        groupSize,
        month,
        hireGuide,
        rentGear,
      }),
    [trek, groupSize, month, hireGuide, rentGear],
  );

  const bufferAmount = Math.round(plan.diyTotalPerPerson * (bufferPercent / 100));
  const totalWithBuffer = plan.diyTotalPerPerson + bufferAmount;
  const opTypical = trek.operatorCostInr.typical;
  const savingsVsOp = opTypical > 0 ? opTypical - totalWithBuffer : 0;

  const items = useMemo(
    () => [
      { label: 'Transport (roadhead return / person)', val: plan.transportPerPerson, color: '#FF5A1F' },
      { label: `Homestay / camps × ${plan.days} days`, val: plan.stayPerPerson, color: '#0E1113' },
      { label: `Trail meals & rations × ${plan.days} days`, val: plan.foodPerPerson, color: '#7C8178' },
      { label: 'Forest / NP permits (est.)', val: plan.permitsPerPerson, color: '#B9BDB2' },
      {
        label:
          plan.guidesNeeded > 0
            ? `${plan.guidesNeeded} guide(s) ÷ ${plan.groupSize} hikers`
            : 'Guide (self-guided)',
        val: plan.guidePerPerson,
        color: '#FF8A5C',
      },
      {
        label: rentGear ? `Technical / camp gear × ${plan.days} days` : 'Gear rental (using own kit)',
        val: plan.gearPerPerson,
        color: '#3A3F44',
      },
    ],
    [plan, rentGear],
  );

  const summaryText = `HIMAVAT DIY Budget — ${trek.name} (${formatDaysRange(trek.daysMin, trek.daysMax)}, ${groupSize} hiker${groupSize === 1 ? '' : 's'}, ${MONTH_FULL_NAMES[month]}): ${formatInr(totalWithBuffer)}/person (incl. ${bufferPercent}% buffer) | Base ex-buffer: ${formatInr(plan.diyTotalPerPerson)} | Group total: ${formatInr(totalWithBuffer * groupSize)}`;

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    `HIMAVAT DIY Budget — ${trek.name}`,
  )}&body=${encodeURIComponent(
    `${summaryText}. Prices approximate, verified Nov 2026.`,
  )}`;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback via prompt if clipboard API blocked
      window.prompt('Copy your budget estimate:', summaryText);
    }
  };

  return (
    <div className="wrap">
      <p className="micro">05 — BUDGET PLANNER · DIY VS OPERATOR ESTIMATES</p>
      <h2>
        WHAT WILL IT<br />
        <span className="thin">COST, REALLY?</span>
      </h2>

      <p style={{ maxWidth: '760px', lineHeight: 1.7 }}>
        Itemized DIY models combine local shared transport, trail food, homestay/camp nights, estimated forest permit tariffs, optional/compulsory guide splits, optional gear rentals, and your contingency buffer. Choosing a shoulder or off-season month does not reduce base costs — it alters trail closure &amp; weather risk.
      </p>

      <div className="planner-grid" style={{ marginTop: '24px' }}>
        <div className="panel panel-filled">
          <label htmlFor="pTrek" className="micro" style={{ display: 'block' }}>
            SELECT TREK (18 ROUTES)
          </label>
          <select
            id="pTrek"
            value={trek.slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ width: '100%', padding: '11px 12px', border: '2px solid var(--ink)', marginBottom: '18px' }}
          >
            {ALL_TREKS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name} — {formatDaysRange(t.daysMin, t.daysMax)} · {t.altitudeM.toLocaleString('en-IN')} m
              </option>
            ))}
          </select>

          <label htmlFor="pGroup" style={{ display: 'block', marginBottom: '6px' }}>
            <strong>Group size — {groupSize} {groupSize === 1 ? 'hiker' : 'hikers'}</strong>
          </label>
          <input
            type="range"
            id="pGroup"
            min={1}
            max={12}
            value={groupSize}
            onChange={(e) => setGroupSize(Number(e.target.value))}
          />

          <label htmlFor="pBuffer" style={{ display: 'block', marginTop: '14px', marginBottom: '6px' }}>
            <strong>Contingency buffer — {bufferPercent}%</strong>
          </label>
          <input
            type="range"
            id="pBuffer"
            min={10}
            max={15}
            value={bufferPercent}
            onChange={(e) => setBufferPercent(Number(e.target.value))}
          />

          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              border: '1px solid var(--line-light)',
              background: 'var(--paper)',
              display: 'grid',
              gap: '10px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: plan.guideForced ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={plan.guideForced ? true : hireGuide}
                disabled={plan.guideForced}
                onChange={(e) => setHireGuide(e.target.checked)}
                style={{ width: '18px', height: '18px', minHeight: 'auto', accentColor: 'var(--accent)' }}
              />
              <span>
                <strong>Include local certified guide</strong>
                {plan.guideForced ? ' (Mandatory by permit regulation)' : ''}
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rentGear}
                onChange={(e) => setRentGear(e.target.checked)}
                style={{ width: '18px', height: '18px', minHeight: 'auto', accentColor: 'var(--accent)' }}
              />
              <span>
                <strong>Include gear rental</strong> (sleeping bag / tent / spikes)
              </span>
            </label>
          </div>

          <p className="micro" style={{ marginTop: '18px' }}>
            DEPARTURE MONTH (CHECKS SEASONAL SAFETY STATUS)
          </p>
          <div className="chips" role="group" aria-label="Departure month">
            {MONTH_LIST.map((m) => (
              <button
                key={m}
                type="button"
                className={`chipbtn${month === m ? ' sel' : ''}`}
                onClick={() => setMonth(m)}
              >
                {m}
              </button>
            ))}
          </div>

          {plan.seasonStatus === 'avoid' && (
            <p className="warn">
              {MONTH_FULL_NAMES[month]} falls outside verified safe windows (Best: {trek.bestMonths.join(', ')}). Trail may be blocked by deep snow or monsoon landslides.
            </p>
          )}
          {plan.seasonStatus === 'shoulder' && (
            <p className="warn" style={{ borderLeftColor: '#F59E0B' }}>
              {MONTH_FULL_NAMES[month]} is shoulder season — expect changeable weather or sparse teahouse services.
            </p>
          )}
        </div>

        <div className="panel panel-filled">
          <p className="micro">YOUR DIY ESTIMATE · PER PERSON (INCL. {bufferPercent}% BUFFER)</p>
          <div className="disp" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)' }}>
            {formatInr(totalWithBuffer)}
          </div>

          <p className="mono" style={{ marginTop: '8px', color: '#4E5358' }}>
            GROUP TOTAL ({groupSize} {groupSize === 1 ? 'HIKER' : 'HIKERS'}): {formatInr(totalWithBuffer * groupSize)} · BASE EX-BUFFER: {formatInr(plan.diyTotalPerPerson)}
          </p>

          <p className="mono" style={{ marginTop: '4px', color: '#4E5358' }}>
            {trek.status === 'closed' || opTypical <= 0
              ? 'SUMMIT CLOSED — NO OPERATOR TARIFF LISTED, VERIFY LOCALLY'
              : savingsVsOp >= 0
                ? `≈ ${formatInr(savingsVsOp)} LESS THAN TYPICAL OPERATOR (${formatInr(opTypical)})`
                : `≈ ${formatInr(Math.abs(savingsVsOp))} MORE THAN TYPICAL OPERATOR (${formatInr(opTypical)}) — GROUP OPERATOR MAY BE BETTER VALUE`}
          </p>

          <div className="stackbar" aria-label="Proportional cost breakdown bar">
            {items.map((item) => {
              const pct = totalWithBuffer > 0 ? (item.val / totalWithBuffer) * 100 : 0;
              return (
                <div
                  key={item.label}
                  style={{ width: `${pct.toFixed(1)}%`, background: item.color }}
                  title={`${item.label}: ${formatInr(item.val)}`}
                />
              );
            })}
            <div style={{ flex: 1, background: '#E4E1D8' }} title={`Buffer: ${formatInr(bufferAmount)}`} />
          </div>

          <div>
            {items.map((item) => (
              <p
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderBottom: '1px solid #ddd',
                  padding: '6px 0',
                  margin: 0,
                }}
              >
                <span>{item.label}</span>
                <strong>{formatInr(item.val)}</strong>
              </p>
            ))}
            <p
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '8px 0 0',
                margin: 0,
              }}
            >
              <span>Contingency buffer ({bufferPercent}%)</span>
              <strong>{formatInr(bufferAmount)}</strong>
            </p>
          </div>

          <ul style={{ lineHeight: 1.65, paddingLeft: '18px', marginTop: '14px' }}>
            {plan.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
            <button type="button" className="btn btn-solid" onClick={copySummary}>
              <span>{copied ? '✓ COPIED TO CLIPBOARD' : 'COPY ESTIMATE'}</span>
            </button>
            <a className="btn" href={mailtoHref}>
              <span>EMAIL THIS ESTIMATE →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
