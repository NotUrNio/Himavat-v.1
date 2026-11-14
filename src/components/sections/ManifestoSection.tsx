import { useEffect, useRef, useState } from 'react';
import { Picture } from '../Picture';
import { getTrekBySlug } from '../../lib/treksData';
import { useTrekModal } from '../../lib/trekModalContext';
import { useQuality } from '../../lib/qualityContext';

const MANIFESTO_TEXT =
  'We climb before dawn so the mountain can speak first. Every step down is a story — snow, river, forest, valley — carried home in tired legs and a full heart. This is the descent, and it is the whole point.';

const KEY_WORDS = new Set(['mountain', 'descent', 'snow,', 'river,', 'heart.']);

const STRIP_CARDS = [
  { imageSlug: 'chopta-chandrashila', trekSlug: 'chopta-chandrashila', title: 'TUNGNATH RIDGE, UTTARAKHAND', meta: 'SPRING / WINTER · 3,690 M' },
  { imageSlug: 'goecha-la', trekSlug: 'goecha-la', title: 'KANCHENJUNGA MASSIF, SIKKIM', meta: 'VIEWPOINT 1 · 4,600 M' },
  { imageSlug: 'hampta-pass', trekSlug: 'hampta-pass', title: 'HAMPTA CROSSOVER, HIMACHAL', meta: 'KULLU TO SPITI · 4,270 M' },
  { imageSlug: 'valley-of-flowers', trekSlug: 'valley-of-flowers', title: 'VALLEY OF FLOWERS, CHAMOLI', meta: 'MONSOON BLOOM · 3,658 M' },
  { imageSlug: 'stage-camp-night', trekSlug: 'markha-valley', title: 'NIGHT SKY, LADAKH SECTOR', meta: 'STARFIELD CAMP · 5,230 M' },
  { imageSlug: 'kashmir-great-lakes', trekSlug: 'kashmir-great-lakes', title: 'VISHANSAR RIDGE, KASHMIR', meta: 'ALPINE LAKES · 4,200 M' },
  { imageSlug: 'dayara-bugyal', trekSlug: 'dayara-bugyal', title: 'DAYARA MEADOW, UTTARKASHI', meta: 'ALL SEASONS · 3,695 M' },
] as const;

export function ManifestoSection() {
  const { reducedMotion } = useQuality();
  const { openTrekSheet } = useTrekModal();

  const stripRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const words = MANIFESTO_TEXT.split(/\s+/);

  const [litCount, setLitCount] = useState<number>(0);
  const effectiveLitCount = reducedMotion ? words.length : litCount;

  useEffect(() => {
    if (reducedMotion) return;

    const path = pathRef.current;
    const len = path ? path.getTotalLength() : 0;
    if (path && len > 0) {
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
    }

    const onScroll = () => {
      const el = textRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.84 - rect.top) / (rect.height + 240)));
        setLitCount(Math.floor(p * words.length));
      }
      if (path && len > 0) {
        const svg = path.ownerSVGElement;
        if (svg) {
          const r2 = svg.getBoundingClientRect();
          const p2 = Math.min(1, Math.max(0, (window.innerHeight * 0.9 - r2.top) / 400));
          path.style.strokeDashoffset = `${len * (1 - p2)}`;
        }
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reducedMotion, words.length]);

  return (
    <section className="light pad" id="manifesto">
      <div className="wrap">
        <p className="micro">01 — MANIFESTO</p>
        <p ref={textRef} className="bigtext" id="bigtext">
          {words.map((word, idx) => {
            const clean = word.toLowerCase();
            const isKey = KEY_WORDS.has(clean);
            const isOn = idx < effectiveLitCount;
            return (
              <span
                key={`${word}-${idx}`}
                className={`w${isKey ? ' key' : ''}${isOn ? ' on' : ''}`}
              >
                {word}{' '}
              </span>
            );
          })}
        </p>

        <svg id="trailSvg" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
          <path
            ref={pathRef}
            id="trailPath"
            d="M0 100 C150 20 250 110 400 50 C550 0 650 100 800 45 C880 20 950 60 1000 30"
          />
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ maxWidth: '720px', fontSize: '1.04rem', lineHeight: 1.7, margin: 0 }}>
            Eighteen routes exclusively across the Indian Himalaya — Uttarakhand, Himachal Pradesh, Sikkim, Ladakh, Kashmir, and West Bengal. Every tariff note clearly separates typical operator quotes from itemized DIY estimates, and every photo is tied to its real Indian Himalayan location.
          </p>
          <div className="carousel-controls">
            <button
              type="button"
              className="btn"
              aria-label="Scroll photo strip left"
              onClick={() => stripRef.current?.scrollBy({ left: -320, behavior: reducedMotion ? 'auto' : 'smooth' })}
            >
              <span>← PREV</span>
            </button>
            <button
              type="button"
              className="btn"
              aria-label="Scroll photo strip right"
              onClick={() => stripRef.current?.scrollBy({ left: 320, behavior: reducedMotion ? 'auto' : 'smooth' })}
            >
              <span>NEXT →</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={stripRef} className="strip" aria-label="Verified Indian Himalaya field gallery — click a card to open route sheet">
        {STRIP_CARDS.map((card) => {
          const trek = getTrekBySlug(card.trekSlug);
          return (
            <figure
              key={card.title}
              className="pcard"
              role="button"
              tabIndex={0}
              data-cursor="VIEW"
              onClick={() => {
                if (trek) openTrekSheet(trek);
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && trek) {
                  e.preventDefault();
                  openTrekSheet(trek);
                }
              }}
            >
              <Picture
                slug={card.imageSlug}
                alt={card.title}
                sizes="280px"
              />
              <figcaption>
                <span className="mono">{card.title}</span>
                <span className="mono" style={{ color: 'var(--accent)' }}>
                  {card.meta}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
