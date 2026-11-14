import { useMemo, useState } from 'react';
import { Picture } from '../Picture';
import { TREK_META } from '../../lib/treksData';
import creditsData from '../../data/credits.json';

export function CreditsSection() {
  const [filter, setFilter] = useState<'all' | 'stage' | 'trek' | 'audio'>('all');

  const images = useMemo(() => {
    if (filter === 'audio') return [];
    if (filter === 'all') return creditsData.images;
    return creditsData.images.filter((img) => img.category === filter);
  }, [filter]);

  const showAudio = filter === 'all' || filter === 'audio';

  return (
    <div className="wrap">
      <p className="micro">10 — CREDITS &amp; OPEN LICENSES</p>
      <h2>PHOTOS, AUDIO &amp; SOURCES</h2>

      <div className="chips" role="group" aria-label="Filter credits" style={{ marginBottom: '20px' }}>
        {(
          [
            { key: 'all', label: `All (${creditsData.images.length} Photos + ${creditsData.audio.length} Audio)` },
            { key: 'stage', label: 'Hero & Stages' },
            { key: 'trek', label: 'All 18 Treks' },
            { key: 'audio', label: 'CC0 Ambient Audio' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`chipbtn${filter === tab.key ? ' sel' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {images.map((img) => (
          <div key={img.slug} className="credit">
            <Picture
              slug={img.slug}
              alt={`${img.title} — ${img.location}`}
              sizes="120px"
            />
            <div>
              <strong>{img.location}</strong> — {img.title}
              <br />
              <span style={{ color: '#B9BDB2' }}>
                {img.photographer} · {img.license} · {img.sourcePlatform} ({img.masterResolution})
              </span>
              <br />
              <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
                SOURCE PAGE ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {showAudio && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            CC0 Ambient Field Audio
          </h3>
          {creditsData.audio.map((track) => (
            <div key={track.slug} style={{ borderTop: '1px solid #333', padding: '12px 0' }}>
              <strong>{track.title}</strong> ({track.slug})
              <br />
              <span style={{ color: '#B9BDB2' }}>
                {track.artist} · {track.license} — {track.description}
              </span>
              <br />
              <a
                href={track.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)' }}
              >
                SOURCE RECORDING ↗
              </a>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '28px', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
        Field Dataset References
      </h3>
      <ul style={{ lineHeight: 1.8, color: '#B9BDB2', paddingLeft: '20px' }}>
        {TREK_META.sources.map((src) => (
          <li key={src.url}>
            <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              {src.name} ↗
            </a>{' '}
            <span className="mono">(checked {src.checked})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
