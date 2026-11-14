import { Link } from 'react-router-dom';
import { Picture } from './Picture';
import { useCompare } from '../lib/compareContext';
import { useTrekModal } from '../lib/trekModalContext';
import {
  formatDaysRange,
  formatOperatorPriceRange,
  getAltImageSlug,
  getDifficultyPips,
} from '../lib/trekHelpers';
import type { TrekRecord } from '../types/trek';

interface TrekCardProps {
  trek: TrekRecord;
  showCompare?: boolean;
}

export function TrekCard({ trek, showCompare = true }: TrekCardProps) {
  const { isSelected, toggleCompare } = useCompare();
  const { openTrekSheet } = useTrekModal();

  const compared = isSelected(trek.slug);
  const altSlug = getAltImageSlug(trek);
  const pipCount = getDifficultyPips(trek.difficulty);

  return (
    <article className="tcard" data-cursor="EXPLORE">
      <div className="imgwrap">
        <Picture
          slug={trek.imageSlug}
          alt={`${trek.name}, ${trek.state}`}
          sizes="(max-width: 720px) 100vw, 33vw"
          className="main"
        />
        <Picture
          slug={altSlug}
          alt=""
          sizes="(max-width: 720px) 100vw, 33vw"
          className="alt"
        />
        {trek.status !== 'open' && (
          <span className="status-tag warn-tag">
            {trek.status === 'closed' ? 'SUMMIT CLOSED' : 'RESTRICTED'}
          </span>
        )}
      </div>

      <div className="body">
        <p className="micro" style={{ marginBottom: 0 }}>
          {trek.state.toUpperCase()} · {trek.region.toUpperCase()}
        </p>

        <h3>
          <Link to={`/treks/${trek.slug}`}>{trek.name}</Link>
        </h3>

        <p className="mono" style={{ color: '#4E5358', margin: 0 }}>
          {trek.altitudeM.toLocaleString('en-IN')} M · {formatDaysRange(trek.daysMin, trek.daysMax).toUpperCase()} · {trek.distanceKm} KM
        </p>

        <div className="pips" aria-label={`Difficulty: ${trek.difficulty}`}>
          {[0, 1, 2, 3, 4].map((idx) => (
            <span key={idx} className={`pip${idx < pipCount ? ' on' : ''}`} />
          ))}
          <span className="mono" style={{ marginLeft: '6px', color: '#4E5358' }}>
            {trek.difficulty}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.92rem' }}>
          {trek.tagline}. <strong>Best:</strong> {trek.bestMonths.join(', ')}
        </p>

        <p className="price" style={{ margin: '2px 0 0' }}>
          {formatOperatorPriceRange(trek)}
        </p>

        {trek.statusNote && <p className="warn">{trek.statusNote}</p>}

        <div className="card-actions">
          <button
            type="button"
            className="btn"
            onClick={() => openTrekSheet(trek)}
          >
            <span>EXPLORE →</span>
          </button>

          {showCompare && (
            <button
              type="button"
              className={`btn${compared ? ' btn-solid' : ''}`}
              aria-pressed={compared}
              onClick={() => toggleCompare(trek.slug)}
            >
              <span>{compared ? '✓ COMPARE' : '+ COMPARE'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
