import { useEffect, useMemo, useRef, useState } from 'react';
import { Picture } from '../Picture';
import { ScrambleNumber } from '../ScrambleNumber';
import { ALL_TREKS } from '../../lib/treksData';
import { useTrekModal } from '../../lib/trekModalContext';
import { useQuality } from '../../lib/qualityContext';
import {
  formatDaysRange,
  getAltImageSlug,
  getDifficultyPips,
} from '../../lib/trekHelpers';

export function HallOfFameSection() {
  const { openTrekSheet } = useTrekModal();
  const { reducedMotion } = useQuality();

  const trackRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [barsActive, setBarsActive] = useState(false);

  const draggingRef = useRef({ active: false, startX: 0, startScroll: 0 });

  const sortedTreks = useMemo(
    () => [...ALL_TREKS].sort((a, b) => b.altitudeM - a.altitudeM),
    [],
  );

  const marqueeText = useMemo(
    () =>
      sortedTreks
        .map((t) => ` ${t.name.toUpperCase()} · ${t.altitudeM.toLocaleString('en-IN')} M ·`)
        .join(''),
    [sortedTreks],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setBarsActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(track);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const stopDrag = () => {
      draggingRef.current.active = false;
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    return () => {
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };
  }, []);

  useEffect(() => {
    const mq = marqueeRef.current;
    if (!mq || reducedMotion) return;

    let x = 0;
    let lastScrollY = window.scrollY;
    let vel = 0;
    let rafId = 0;

    const onScroll = () => {
      const diff = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      vel = Math.max(-5, Math.min(5, diff * 0.12));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      x -= 0.65;
      vel *= 0.92;
      const halfWidth = mq.scrollWidth / 2;
      if (halfWidth > 0 && -x >= halfWidth) x = 0;
      mq.style.transform = `translateX(${x.toFixed(1)}px) skewX(${vel.toFixed(2)}deg)`;
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  const scrollTrackBy = (delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section id="hall" className="dark pad" style={{ paddingBottom: '44px' }}>
      <div className="wrap">
        <p className="micro">04 — SUMMIT HALL OF FAME</p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <h2>DRAG THE RIDGE</h2>
            <p className="mono" style={{ color: '#B9BDB2', marginBottom: 0 }}>
              DRAG OR STEP ↔ · HOVER FOR SECONDARY TERRAIN · CLICK ANY PEAK TO OPEN FIELD SHEET
            </p>
          </div>
          <div className="carousel-controls">
            <button
              type="button"
              className="btn"
              aria-label="Scroll Hall of Fame left"
              onClick={() => scrollTrackBy(-360)}
            >
              <span>← PREV</span>
            </button>
            <button
              type="button"
              className="btn"
              aria-label="Scroll Hall of Fame right"
              onClick={() => scrollTrackBy(360)}
            >
              <span>NEXT →</span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="hall-track"
        tabIndex={0}
        aria-label="Draggable Himalayan altitude showcase — drag horizontally or use prev/next buttons"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button, a')) return;
          const track = trackRef.current;
          if (!track) return;
          draggingRef.current = {
            active: true,
            startX: e.clientX,
            startScroll: track.scrollLeft,
          };
        }}
        onPointerMove={(e) => {
          const track = trackRef.current;
          if (!track || !draggingRef.current.active) return;
          track.scrollLeft = draggingRef.current.startScroll - (e.clientX - draggingRef.current.startX);
        }}
        onPointerUp={() => {
          draggingRef.current.active = false;
        }}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') scrollTrackBy(320);
          if (e.key === 'ArrowLeft') scrollTrackBy(-320);
        }}
      >
        {sortedTreks.map((trek) => {
          const pct = Math.min(100, Math.round((trek.altitudeM / 5319) * 100));
          const pips = getDifficultyPips(trek.difficulty);
          return (
            <article key={trek.slug} className="hcard" data-cursor="DRAG">
              <div className="imgwrap">
                <Picture
                  slug={trek.imageSlug}
                  alt={trek.name}
                  sizes="300px"
                  className="main"
                />
                <Picture
                  slug={getAltImageSlug(trek)}
                  alt=""
                  sizes="300px"
                  className="alt"
                />
              </div>

              <p className="micro" style={{ marginTop: '12px', marginBottom: '2px' }}>
                {trek.state.toUpperCase()}
              </p>

              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  margin: '4px 0 6px',
                  fontSize: '1.25rem',
                }}
              >
                {trek.name}
              </h3>

              <p className="mono" style={{ margin: 0 }}>
                <ScrambleNumber value={trek.altitudeM} /> M · {formatDaysRange(trek.daysMin, trek.daysMax).toUpperCase()}
              </p>

              <div className="hbar" aria-hidden="true">
                <i style={{ width: barsActive ? `${pct}%` : '0%' }} />
              </div>

              <div className="pips" style={{ marginBottom: '12px' }}>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <span key={idx} className={`pip${idx < pips ? ' on' : ''}`} />
                ))}
              </div>

              <p style={{ marginTop: 'auto', marginBottom: 0 }}>
                <button
                  type="button"
                  className="btn"
                  style={{ color: '#fff', borderColor: '#fff' }}
                  onClick={() => openTrekSheet(trek)}
                >
                  <span>OPEN TREK →</span>
                </button>
              </p>
            </article>
          );
        })}
      </div>

      <div className="marquee" aria-hidden="true">
        <div ref={marqueeRef} className="marquee-inner">
          {marqueeText}
          {marqueeText}
        </div>
      </div>
    </section>
  );
}
