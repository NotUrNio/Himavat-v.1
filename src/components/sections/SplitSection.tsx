import { useState } from 'react';
import { Picture } from '../Picture';
import { ScrambleNumber } from '../ScrambleNumber';
import type { CatalogPreset } from './TrekCatalogSection';

export function SplitSection({
  onSelectPreset,
}: {
  onSelectPreset: (preset: CatalogPreset) => void;
}) {
  const [activeSide, setActiveSide] = useState<'on' | 'off'>('on');

  const chooseSide = (side: 'on' | 'off') => {
    setActiveSide(side);
    onSelectPreset(side === 'on' ? 'classic' : 'offbeat');
    const target = document.getElementById('treks');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="dark" aria-label="Classic trails versus offbeat high passes">
      <div className="split" id="split">
        <div
          className={`split-side${activeSide === 'on' ? ' active' : ''}`}
          role="button"
          tabIndex={0}
          data-cursor="CLASSIC"
          aria-label="Filter catalog to Classic on-trail routes"
          onMouseEnter={() => setActiveSide('on')}
          onFocus={() => setActiveSide('on')}
          onClick={() => chooseSide('on')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              chooseSide('on');
            }
          }}
        >
          <Picture
            slug="triund"
            alt="Triund ridge in mist, Dharamshala"
            sizes="(max-width: 760px) 100vw, 55vw"
          />
          <div className="inner">
            <p className="micro">ON TRAIL — CLASSIC</p>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.8vw, 4rem)' }}>
              WELL-WORN<br />PATHS
            </h2>
            <p style={{ margin: '10px 0 6px' }}>
              Kedarkantha · Triund · Valley of Flowers · Hampta Pass · Kuari Pass
            </p>
            <p className="mono" style={{ margin: 0 }}>
              CEILING <ScrambleNumber value={4270} /> M · FILTER CLASSICS →
            </p>
          </div>
        </div>

        <div
          className={`split-side${activeSide === 'off' ? ' active' : ''}`}
          role="button"
          tabIndex={0}
          data-cursor="OFFBEAT"
          aria-label="Filter catalog to Offbeat high-altitude passes"
          onMouseEnter={() => setActiveSide('off')}
          onFocus={() => setActiveSide('off')}
          onClick={() => chooseSide('off')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              chooseSide('off');
            }
          }}
        >
          <Picture
            slug="pin-parvati-pass"
            alt="Pin Parvati high glacier pass crossing"
            sizes="(max-width: 760px) 100vw, 55vw"
          />
          <div className="inner">
            <p className="micro">OFF TRAIL — HIGH PASSES</p>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.8vw, 4rem)' }}>
              WHERE THE<br />MAP THINS
            </h2>
            <p style={{ margin: '10px 0 6px' }}>
              Pin Parvati · Markha Valley · Goecha La · Buran Ghati · Roopkund
            </p>
            <p className="mono" style={{ margin: 0 }}>
              CEILING <ScrambleNumber value={5319} /> M · FILTER OFFBEAT →
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
