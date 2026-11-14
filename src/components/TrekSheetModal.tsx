import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Picture } from './Picture';
import { ElevationChart } from './ElevationChart';
import { useTrekModal } from '../lib/trekModalContext';
import { useCompare } from '../lib/compareContext';
import { MONTH_FULL_NAMES, formatInr, isGuideCompulsory } from '../lib/treksData';
import {
  formatDaysRange,
  formatOperatorPriceRange,
  getEffectiveWaypoints,
} from '../lib/trekHelpers';

export function TrekSheetModal() {
  const { activeTrek, closeTrekSheet } = useTrekModal();
  const { isSelected, toggleCompare } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeTrek) {
      document.body.classList.remove('sheet-open');
      return;
    }
    document.body.classList.add('sheet-open');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTrekSheet();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('sheet-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [activeTrek, closeTrekSheet]);

  if (!activeTrek) return null;

  const waypoints = getEffectiveWaypoints(activeTrek);
  const guideMandatory = isGuideCompulsory(activeTrek);
  const compared = isSelected(activeTrek.slug);

  const handlePlanTrek = () => {
    const slug = activeTrek.slug;
    closeTrekSheet();
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('himavat:select-planner-trek', { detail: slug }));
      const el = document.getElementById('planner');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/planner?trek=${encodeURIComponent(slug)}`);
  };

  return (
    <div
      id="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${activeTrek.name} field sheet`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeTrekSheet();
      }}
    >
      <div className="sheet">
        <button
          type="button"
          className="btn"
          id="overlayClose"
          style={{
            position: 'sticky',
            top: '0px',
            float: 'right',
            zIndex: 4,
            background: 'var(--paper)',
          }}
          onClick={closeTrekSheet}
        >
          <span>CLOSE ✕</span>
        </button>

        <Picture
          slug={activeTrek.imageSlug}
          alt={`${activeTrek.name}, ${activeTrek.state}`}
          sizes="(max-width: 940px) 100vw, 900px"
          className="sheet-hero-img"
        />

        <p className="micro" style={{ marginTop: '16px' }}>
          {activeTrek.state.toUpperCase()} · {activeTrek.region.toUpperCase()}
        </p>

        <h2 style={{ fontSize: 'clamp(1.9rem, 5vw, 3.3rem)', marginBottom: '8px' }}>
          {activeTrek.name}
        </h2>
        <p style={{ margin: '0 0 14px', fontSize: '1rem' }}>{activeTrek.summary}</p>

        {activeTrek.statusNote && (
          <p className="warn" style={{ marginBottom: '14px' }}>
            {activeTrek.statusNote}
          </p>
        )}

        <div className="elevation-chart-card">
          <ElevationChart
            mode="single"
            points={waypoints}
            trekName={activeTrek.name}
            accentColor="#FF5A1F"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            margin: '16px 0',
            padding: '14px',
            border: '2px solid var(--ink)',
            background: '#fff',
          }}
        >
          <div>
            <strong>{activeTrek.altitudeM.toLocaleString('en-IN')} m</strong>
            <br />
            <span className="mono">MAX ALTITUDE ({activeTrek.altitudeFt.toLocaleString('en-IN')} ft)</span>
          </div>
          <div>
            <strong>{formatDaysRange(activeTrek.daysMin, activeTrek.daysMax)}</strong>
            <br />
            <span className="mono">DURATION</span>
          </div>
          <div>
            <strong>{activeTrek.distanceKm} km</strong>
            <br />
            <span className="mono">TOTAL TRAIL</span>
          </div>
          <div>
            <strong>{activeTrek.difficulty}</strong>
            <br />
            <span className="mono">GRADE</span>
          </div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Highlights &amp; Logistics
        </h3>
        <ul style={{ lineHeight: 1.75, paddingLeft: '20px', margin: '0 0 16px' }}>
          {activeTrek.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>

        <div className="panel panel-filled" style={{ marginBottom: '16px' }}>
          <p className="micro">PERMITS &amp; ACCESS</p>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Authority:</strong> {activeTrek.permits.authority} ·{' '}
            <strong>Guide rule:</strong> {guideMandatory ? 'Licensed guide mandatory' : 'Optional for experienced teams'}
          </p>
          <p style={{ margin: '0 0 8px' }}>{activeTrek.permits.notes}</p>
          <p className="mono" style={{ margin: 0, color: '#4E5358' }}>
            ROADHEAD: {activeTrek.roadhead} · RAIL: {activeTrek.nearestRail} · AIR: {activeTrek.nearestAirport}
          </p>
        </div>

        <p style={{ margin: '8px 0' }}>
          <strong>Best months:</strong>{' '}
          {activeTrek.bestMonths.map((m) => MONTH_FULL_NAMES[m]).join(', ')}
          {activeTrek.shoulderMonths.length > 0 && (
            <> · <strong>Shoulder:</strong> {activeTrek.shoulderMonths.join(', ')}</>
          )}
        </p>

        <p style={{ margin: '8px 0 18px' }}>
          <strong>Operator price:</strong> {formatOperatorPriceRange(activeTrek)}{' '}
          {activeTrek.operatorCostInr.yhaiApprox && (
            <span>· YHAI ~{formatInr(activeTrek.operatorCostInr.yhaiApprox)} </span>
          )}
          <span className="mono">({activeTrek.operatorCostInr.priceLabel})</span>
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-solid" onClick={handlePlanTrek}>
            <span>PLAN THIS TREK →</span>
          </button>

          <button
            type="button"
            className={`btn${compared ? ' btn-solid' : ''}`}
            onClick={() => toggleCompare(activeTrek.slug)}
          >
            <span>{compared ? '✓ IN COMPARE' : '+ COMPARE'}</span>
          </button>

          <Link
            to={`/treks/${activeTrek.slug}`}
            className="btn"
            onClick={closeTrekSheet}
          >
            <span>FULL ROUTE PAGE ↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
