import { useEffect, useMemo, useRef, useState } from 'react';
import { Picture } from '../Picture';
import { useQuality } from '../../lib/qualityContext';
import { ALL_TREKS, MONTH_LIST } from '../../lib/treksData';
import { useTrekModal } from '../../lib/trekModalContext';

const CURRENT_MONTH = MONTH_LIST[new Date().getMonth()] ?? 'Nov';

export function HeroStageSection() {
  const { tier, reducedMotion } = useQuality();
  const { openTrekSheet } = useTrekModal();

  const heroRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const [locked, setLocked] = useState(false);

  const curMonth = CURRENT_MONTH;
  const bestTrek = useMemo(() => {
    const matches = ALL_TREKS.filter((t) => t.status === 'open' && t.bestMonths.includes(curMonth));
    const pool = matches.length ? matches : ALL_TREKS.filter((t) => t.status === 'open');
    return [...pool].sort((a, b) => b.altitudeM - a.altitudeM)[0] ?? ALL_TREKS[0];
  }, [curMonth]);

  useEffect(() => {
    document.body.classList.toggle('locked', locked);
    if (locked && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && locked) {
        setLocked(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [locked]);

  useEffect(() => {
    const hero = heroRef.current;
    const bg = bgRef.current;
    const rev = revealRef.current;
    if (!hero || !bg || !rev || reducedMotion) return;

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let pr = 0;
    let tr = 0;
    let rafId = 0;

    const tick = () => {
      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;
      pr += (tr - pr) * 0.1;

      const ampX = locked ? 34 : 15;
      const ampY = locked ? 22 : 10;
      bg.style.transform = `translate3d(${(tx * ampX).toFixed(2)}px, ${(ty * ampY).toFixed(2)}px, 0) scale(1.06)`;
      rev.style.clipPath = `circle(${Math.max(0, pr).toFixed(1)}px at ${px.toFixed(1)}px ${py.toFixed(1)}px)`;
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    const handlePointer = (clientX: number, clientY: number, radius: number) => {
      mx = (clientX / Math.max(1, window.innerWidth) - 0.5) * -1;
      my = (clientY / Math.max(1, window.innerHeight) - 0.5) * -1;
      const rect = hero.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      tr = radius;
    };

    const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY, locked ? 205 : 135);
    const onMouseLeave = () => {
      tr = locked ? 90 : 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY, 120);
      }
    };

    hero.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);
    hero.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      hero.removeEventListener('mousemove', onMouseMove);
      hero.removeEventListener('mouseleave', onMouseLeave);
      hero.removeEventListener('touchmove', onTouchMove);
    };
  }, [locked, reducedMotion]);

  return (
    <section id="hero" ref={heroRef} className="hero-stage" aria-label="Himalayan dawn hero stage">
      <div ref={bgRef} className="hero-bg">
        <Picture
          slug="hero-dawn"
          alt="Snow peaks at first light from Garhwal Himalaya, Uttarakhand"
          sizes="100vw"
          priority
          hero
          className="pic-cover"
        />
      </div>

      <div className="hero-scrim" aria-hidden="true" />

      <div
        ref={revealRef}
        id="heroReveal"
        style={{ clipPath: reducedMotion ? 'circle(0px at 50% 50%)' : 'circle(0px at 50% 45%)' }}
        aria-hidden="true"
      >
        <Picture
          slug="stage-camp-night"
          alt=""
          sizes="100vw"
          className="pic-cover"
        />
      </div>

      {!reducedMotion && tier !== 'low' && (
        <>
          <div className="fog" style={{ top: '56%' }} aria-hidden="true" />
          <div className="fog" style={{ top: '70%', animationDelay: '-6s' }} aria-hidden="true" />
        </>
      )}

      <div className="hero-top">
        <span className="mono">30.48° N · 79.52° E — GARHWAL &amp; LADAKH HIMALAYA</span>
        <span className="mono">MOVE CURSOR TO REVEAL NIGHT SKY · {tier.toUpperCase()} TIER</span>
      </div>

      <h1 className="hero-word">
        <span>HIMAVAT</span>
        <span className="l2">THE DESCENT</span>
      </h1>

      <div className="hero-bottom">
        <button
          type="button"
          className="chip"
          onClick={() => openTrekSheet(bestTrek)}
        >
          BEST TREK IN {curMonth.toUpperCase()}: {bestTrek.name.toUpperCase()} · {bestTrek.altitudeM.toLocaleString('en-IN')} M →
        </button>

        {locked && (
          <span className="locked-note mono">
            LOCK MODE — MOVE OR DRAG TO EXPLORE NIGHT RIDGES · ESC TO UNLOCK
          </span>
        )}

        <button
          type="button"
          className="btn btn-solid"
          aria-pressed={locked}
          onClick={() => setLocked((prev) => !prev)}
        >
          <span>{locked ? 'BACK TO SCROLL' : 'TAP TO LOCK'}</span>
        </button>
      </div>
    </section>
  );
}
