import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Check, MapPin, Mountain, Calendar } from 'lucide-react';
import type { TrekRecord } from '../types/trek';
import { Picture } from './Picture';
import { formatInr } from '../lib/treksData';
import { useQuality } from '../lib/qualityContext';
import { useCompare } from '../lib/compareContext';

interface TrekCardProps {
  trek: TrekRecord;
  showCompare?: boolean;
}

export function TrekCard({ trek, showCompare = true }: TrekCardProps) {
  const { isTouch, reducedMotion, tier } = useQuality();
  const { isSelected, toggleCompare } = useCompare();
  const cardRef = useRef<HTMLElement>(null);

  const tiltEnabled = !isTouch && !reducedMotion && tier !== 'low';
  const compared = isSelected(trek.slug);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!tiltEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    cardRef.current.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = '';
  };

  const statusLabel =
    trek.status === 'open'
      ? 'Open'
      : trek.status === 'restricted'
        ? 'Restricted'
        : 'Closed';

  const statusClass =
    trek.status === 'open'
      ? 'status-open'
      : trek.status === 'restricted'
        ? 'status-restricted'
        : 'status-closed';

  const diyApprox =
    trek.diyBudget.transportRoundTrip +
    (trek.diyBudget.stayPerDay + trek.diyBudget.foodPerDay) * trek.daysMax +
    trek.diyBudget.permitTotal;

  return (
    <article
      ref={cardRef}
      className="trek-card"
      data-cursor="Explore"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={`/treks/${trek.slug}`}
        className="trek-card-media"
        aria-label={`View full trail guide for ${trek.name}`}
      >
        <Picture
          slug={trek.imageSlug}
          alt={`${trek.name} trail landscape in ${trek.state}, Indian Himalayas`}
          sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
      </Link>

      <div className="trek-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--accent-glacier)', fontWeight: 600 }}>
            <MapPin size={13} aria-hidden="true" />
            {trek.state}
          </span>
          <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
        </div>

        <h3 style={{ fontSize: '1.35rem', lineHeight: 1.12 }}>
          <Link to={`/treks/${trek.slug}`} style={{ textDecoration: 'none' }}>
            {trek.name}
          </Link>
        </h3>

        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink-secondary)', flex: '1 1 auto' }}>
          {trek.tagline}
        </p>

        <dl
          style={{
            margin: '0.25rem 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            paddingBlock: '0.65rem',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
          }}
        >
          <div>
            <dt style={{ color: 'var(--ink-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Max Alt</dt>
            <dd className="tabular-nums" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mountain size={12} aria-hidden="true" />
              {trek.altitudeM.toLocaleString('en-IN')} m
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--ink-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Duration</dt>
            <dd className="tabular-nums" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} aria-hidden="true" />
              {trek.daysMin === trek.daysMax ? `${trek.daysMin}d` : `${trek.daysMin}–${trek.daysMax}d`}
            </dd>
          </div>
          <div>
            <dt style={{ color: 'var(--ink-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Grade</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{trek.difficulty.replace('Moderate-Difficult', 'Mod-Diff')}</dd>
          </div>
        </dl>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>DIY est. </span>
            <strong className="tabular-nums" style={{ color: 'var(--accent-forest)' }}>{formatInr(diyApprox)}</strong>
          </div>
          <div style={{ color: 'var(--ink-secondary)' }}>
            <span>Package </span>
            <span className="tabular-nums">{formatInr(trek.operatorCostInr.typical)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.35rem', alignItems: 'center' }}>
          <Link
            to={`/treks/${trek.slug}`}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.58rem 0.85rem', fontSize: '0.82rem' }}
          >
            Route &amp; Permits <ArrowRight size={14} aria-hidden="true" />
          </Link>

          {showCompare && (
            <button
              type="button"
              className="choice-pill"
              aria-pressed={compared}
              onClick={() => toggleCompare(trek.slug)}
              title={compared ? 'Remove from comparison' : 'Add to side-by-side compare (up to 3)'}
              style={{ padding: '0.58rem 0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              {compared ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
              <span>{compared ? 'Added' : 'Compare'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
