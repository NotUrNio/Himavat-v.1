import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Compass, Calculator, ShieldAlert, Droplets, Trees, Flame } from 'lucide-react';
import { Picture } from '../components/Picture';
import { DescentCanvas } from '../components/DescentCanvas';
import { ScrambleNumber } from '../components/ScrambleNumber';
import { LottieCompass } from '../components/LottieCompass';
import { TrekCard } from '../components/TrekCard';
import { ALL_TREKS, MONTH_LIST, MONTH_FULL_NAMES, formatInr } from '../lib/treksData';
import { ambientAudio } from '../lib/audio';
import { useQuality } from '../lib/qualityContext';
import { usePageSeo } from '../lib/seo';
import type { MonthCode } from '../types/trek';

const FEATURED_SLUGS = [
  'kedarkantha',
  'hampta-pass',
  'valley-of-flowers',
  'goecha-la',
  'markha-valley',
  'kashmir-great-lakes',
];

export default function HomePage() {
  const { tier, reducedMotion, isTouch } = useQuality();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const riverFillRef = useRef<HTMLDivElement>(null);
  const altReadoutRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const [quickMonth, setQuickMonth] = useState<MonthCode>('May');

  usePageSeo({
    title: 'HIMAVAT — The Descent | Indian Himalaya Trekking & DIY Field Atlas',
    description:
      'Walk from snow summit at dawn through glacier melt, cascading waterfall, deodar forest, and starry base camp. Explore 18 verified Indian Himalaya treks and build a zero-commission DIY budget.',
  });

  const featuredTreks = useMemo(
    () => ALL_TREKS.filter((t) => FEATURED_SLUGS.includes(t.slug)),
    [],
  );

  const monthPicks = useMemo(
    () => ALL_TREKS.filter((t) => t.bestMonths.includes(quickMonth) && t.status !== 'closed').slice(0, 4),
    [quickMonth],
  );

  useEffect(() => {
    const updateHud = (prog: number) => {
      const clamped = Math.max(0.02, Math.min(1, prog));
      progressRef.current = clamped;
      ambientAudio.setScrollProgress(clamped);

      if (riverFillRef.current) {
        riverFillRef.current.style.transform = `scaleY(${clamped.toFixed(4)})`;
      }
      if (altReadoutRef.current) {
        const altM = Math.round(5300 - clamped * 2900);
        altReadoutRef.current.textContent = `${altM.toLocaleString('en-IN')} M`;
      }
    };

    const onNativeScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      updateHud(window.scrollY / maxScroll);
    };

    window.addEventListener('scroll', onNativeScroll, { passive: true });
    onNativeScroll();

    if (reducedMotion || tier === 'low') {
      return () => window.removeEventListener('scroll', onNativeScroll);
    }

    let cancelled = false;
    let cleanupMotion: (() => void) | null = null;

    const initMotion = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      window.removeEventListener('scroll', onNativeScroll);

      const lenis = new Lenis({
        lerp: isTouch ? 0.14 : 0.095,
        smoothWheel: !isTouch,
      });

      const onLenisScroll = (e: { progress: number; velocity: number }) => {
        ScrollTrigger.update();
        velocityRef.current = e.velocity;
        updateHud(e.progress);
      };

      lenis.on('scroll', onLenisScroll);

      const tickerFn = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-parallax-bg]').forEach((el) => {
          gsap.to(el, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('section'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });

        gsap.utils.toArray<SVGGeometryElement>('.route-path-draw').forEach((path) => {
          const len = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 900;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: path.closest('section'),
              start: 'top 72%',
              end: 'center 42%',
              scrub: 0.8,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>('.stage-reveal').forEach((panel) => {
          gsap.fromTo(
            panel,
            { opacity: 0.72, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                start: 'top 86%',
                once: true,
              },
            },
          );
        });
      }, wrapperRef);

      cleanupMotion = () => {
        ctx.revert();
        gsap.ticker.remove(tickerFn);
        lenis.destroy();
      };
    };

    const bootTimer = window.setTimeout(() => void initMotion(), 140);

    return () => {
      cancelled = true;
      clearTimeout(bootTimer);
      window.removeEventListener('scroll', onNativeScroll);
      cleanupMotion?.();
    };
  }, [tier, reducedMotion, isTouch]);

  return (
    <div ref={wrapperRef} className={`descent-wrapper tier-${tier}`}>
      {/* Single WebGL Atmosphere, Waterfall Shader & Velocity Particle Canvas */}
      <DescentCanvas progressRef={progressRef} velocityRef={velocityRef} />

      {/* Persistent Side River Progress Indicator */}
      <aside className="river-progress" aria-label="Descent altitude tracker">
        <span ref={altReadoutRef} className="river-alt-readout">
          5,300 M
        </span>
        <div className="river-track">
          <div ref={riverFillRef} className="river-fill" style={{ transform: 'scaleY(0.03)' }} />
        </div>
      </aside>

      {/* ACT I: SUMMIT AT DAWN (5,300 m) — Zero LCP blocking, immediately visible */}
      <section className="descent-stage hero-stage" aria-labelledby="hero-title">
        <div className="stage-backdrop">
          <Picture
            slug="hero-dawn"
            alt="Bethartoli Himal snow ridge catching amber Himalayan first light in Uttarakhand"
            sizes="100vw"
            priority
            hero
          />
        </div>
        <div
          className="stage-scrim"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,17,23,0.42) 0%, rgba(11,17,23,0.28) 45%, rgba(11,17,23,0.92) 98%)',
          }}
        />

        <div className="container stage-foreground">
          <span className="eyebrow-coord">
            <Compass size={14} aria-hidden="true" />
            30°24′N 79°44′E · INDIAN HIMALAYA · ZERO-COMMISSION ATLAS
          </span>

          <h1 id="hero-title" className="hero-headline" style={{ marginTop: '0.75rem' }}>
            Walk The
            <br />
            High Ridges
            <br />
            Down To Earth.
          </h1>

          <p className="hero-subline">
            From glacial granite at dawn, follow meltwater down waterfall gorges and deodar forests
            into camp—with honest trail logistics across 18 Indian Himalayan routes.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem', marginTop: '1.85rem' }}>
            <Link to="/treks" className="btn btn-primary" data-magnetic data-cursor="Explore">
              Explore 18 Treks <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/planner" className="btn btn-secondary" data-magnetic data-cursor="Plan">
              <Calculator size={17} aria-hidden="true" />
              DIY Budget Calculator
            </Link>
          </div>

          <div className="telemetry-strip">
            <div>
              <span className="telemetry-cell-label">Trails Indexed</span>
              <strong className="telemetry-cell-val">
                <ScrambleNumber value={18} formatIndian={false} /> Routes
              </strong>
            </div>
            <div>
              <span className="telemetry-cell-label">Highest Crest</span>
              <strong className="telemetry-cell-val">
                <ScrambleNumber value={6153} suffix=" m" />
              </strong>
            </div>
            <div>
              <span className="telemetry-cell-label">DIY vs Package Gap</span>
              <strong className="telemetry-cell-val">
                ~<ScrambleNumber value={45} suffix="%" formatIndian={false} /> Saved
              </strong>
            </div>
            <div>
              <span className="telemetry-cell-label">Price Audit Date</span>
              <strong className="telemetry-cell-val" style={{ fontSize: '1.15rem', lineHeight: 1.4 }}>
                Nov 13, 2026
              </strong>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-secondary)', fontSize: '0.84rem' }}>
            <ArrowDown size={15} aria-hidden="true" />
            <span>Scroll to begin The Descent (5,300 m → 2,400 m)</span>
          </div>
        </div>
      </section>

      {/* ACT II: GLACIER MELT (4,400 m) */}
      <section className="descent-stage" aria-labelledby="glacier-title">
        <div className="stage-backdrop" data-parallax-bg>
          <Picture
            slug="stage-glacier"
            alt="High altitude snowfield and glacial melt ridge in Ladakh, Indian Himalayas"
            sizes="100vw"
          />
        </div>
        <div
          className="stage-scrim"
          style={{
            background:
              'linear-gradient(110deg, rgba(8,14,20,0.88) 0%, rgba(13,23,32,0.56) 55%, rgba(13,23,32,0.82) 100%)',
          }}
        />

        <div className="container stage-foreground">
          <div className="stage-panel stage-reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <span className="eyebrow-coord">STAGE 02 · GLACIER MORAINES · 4,400 M</span>
              <LottieCompass size={50} label="Glacial ridge compass orientation" />
            </div>
            <h2 id="glacier-title" className="stage-heading">
              Where Snowpack First Gives Way to Water
            </h2>
            <p className="stage-lead">
              Above 4,000 meters across Ladakh, Spiti, and Chamoli, afternoon sun unlocks melt channels across rock moraines.
              Thin air here rewards patient pacing—and demands knowing which high peaks are actually open before booking transit.
            </p>
            <div className="advisory-banner advisory-banner--closed" style={{ marginBottom: '1.25rem' }}>
              <strong>Conservation Notice (Checked Nov 13, 2026):</strong> Stok Kangri remains closed since 2020 for ecological recovery, and Roopkund prohibits overnight High Court bugyal camping. We surface live advisories upfront on every trail.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link to="/treks/markha-valley" className="btn btn-secondary">
                Markha Valley (5,200 m) <ArrowRight size={15} />
              </Link>
              <Link to="/safety" className="btn btn-secondary">
                <ShieldAlert size={15} /> WMS 2024 AMS Protocol
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ACT III: ALPINE STREAM & CONTOUR TRANSECT (3,900 m) */}
      <section className="descent-stage" aria-labelledby="stream-title">
        <div className="stage-backdrop" data-parallax-bg>
          <Picture
            slug="stage-stream"
            alt="Braided glacial stream curving through Pahalgam valley in Jammu and Kashmir"
            sizes="100vw"
          />
        </div>
        <div
          className="stage-scrim"
          style={{
            background:
              'linear-gradient(250deg, rgba(8,14,20,0.90) 5%, rgba(8,18,23,0.62) 55%, rgba(8,14,20,0.82) 100%)',
          }}
        />

        <div className="container stage-foreground editorial-split">
          <div style={{ background: 'rgba(8,13,18,0.68)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span className="eyebrow-coord" style={{ marginBottom: '0.75rem' }}>
              HYDROLOGICAL &amp; ACCLIMATIZATION PROFILE
            </span>
            <svg viewBox="0 0 540 210" className="contour-svg" role="img" aria-label="Animated crest-to-valley ascent and safe sleeping ceiling transect">
              <line x1="28" y1="36" x2="512" y2="36" stroke="rgba(224,100,88,0.38)" strokeDasharray="4 4" />
              <text x="34" y="29" fontSize="11" fill="#f5978d">5,000 m — Pass Crest (Day-hike, sleep lower)</text>
              <line x1="28" y1="108" x2="512" y2="108" stroke="rgba(89,179,196,0.32)" strokeDasharray="3 4" />
              <text x="34" y="101" fontSize="11" fill="#8dcdd9">3,000 m — Max 500 m sleeping gain / 24h (WMS 2024)</text>
              <path
                className="route-path-draw"
                d="M 28 182 C 95 162, 130 140, 185 112 C 235 88, 285 68, 338 38 C 392 48, 435 128, 512 168"
                fill="none"
                stroke="#df7b42"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="185" cy="112" r="5" fill="#59b3c4" />
              <circle cx="338" cy="38" r="6" fill="#df7b42" />
              <circle cx="512" cy="168" r="5" fill="#71a87e" />
            </svg>
            <p style={{ margin: '0.65rem 0 0', fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
              Above 3,000 m, Wilderness Medical Society (2024) guidelines cap sleeping altitude gain at{' '}
              <strong>&le; 500 m per day</strong> with an acclimatization rest day every 3–4 days.
            </p>
          </div>

          <div className="stage-panel stage-reveal">
            <span className="eyebrow-coord">STAGE 03 · ALPINE STREAM · 3,900 M</span>
            <h2 id="stream-title" className="stage-heading">
              Follow Water to Stay Alive &amp; Grounded
            </h2>
            <p className="stage-lead">
              Every major Himalayan trail traces a living watershed—the Pushpawati through Valley of Flowers,
              Lidder through Kashmir Great Lakes, Chandra off Hampta, and Teesta below Goecha La.
              Compare routes by altitude gain profile before committing a single rupee.
            </p>
            <Link to="/compare" className="btn btn-primary" data-cursor="Compare">
              Compare Up To 3 Treks <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ACT IV: CASCADING WATERFALL (PINNED / SCROLL-SCRUBBED) (3,400 m) */}
      <section className="descent-stage descent-stage--waterfall" aria-labelledby="waterfall-title">
        <div className="stage-sticky-frame">
          <div className="stage-backdrop" data-parallax-bg>
            <Picture
              slug="stage-waterfall"
              alt="Cascading Himalayan rock cliff waterfall near McLeod Ganj, Himachal Pradesh"
              sizes="100vw"
            />
          </div>
          <div
            className="stage-scrim"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(8,18,23,0.18) 0%, rgba(8,14,19,0.88) 84%)',
            }}
          />

          <div className="container stage-foreground">
            <div className="stage-panel stage-reveal" style={{ margin: '0 auto', textAlign: 'left', maxWidth: '680px' }}>
              <span className="eyebrow-coord">
                <Droplets size={14} aria-hidden="true" />
                STAGE 04 · THE WATERFALL PLUNGE · 3,400 M
              </span>
              <h2 id="waterfall-title" className="stage-heading">
                Gravity Accelerated by Monsoon &amp; Thaw
              </h2>
              <p className="stage-lead">
                Notice the water ribbon accelerate cleanly with your scroll momentum: along the Dhauladhar and Garhwal cliffs,
                June snowmelt and July–August cloudbursts transform footpaths overnight. Knowing exact seasonal windows prevents dangerous creek crossings.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link to="/seasons" className="btn btn-primary">
                  Open 12-Month Seasons Calendar <ArrowRight size={16} />
                </Link>
                <Link to="/treks/valley-of-flowers" className="btn btn-secondary">
                  Monsoon Bloom: Valley of Flowers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT V: GORGE MIST & RIVER VALLEY (3,050 m) */}
      <section className="descent-stage" aria-labelledby="gorge-title">
        <div className="stage-backdrop" data-parallax-bg>
          <Picture
            slug="stage-valley"
            alt="Spiti and Chandra river gorge flanked by high Himalayan walls in Himachal Pradesh"
            sizes="100vw"
          />
        </div>
        <div
          className="stage-scrim"
          style={{
            background:
              'linear-gradient(90deg, rgba(8,13,18,0.88) 0%, rgba(8,13,18,0.48) 60%, rgba(8,13,18,0.84) 100%)',
          }}
        />

        <div className="container stage-foreground">
          <div className="stage-panel stage-reveal">
            <span className="eyebrow-coord">STAGE 05 · GORGE SPRAY &amp; CROSSOVER PASSES · 3,050 M</span>
            <h2 id="gorge-title" className="stage-heading">
              Where Spray Hits Sandstone &amp; Grass Walls
            </h2>
            <p className="stage-lead">
              Classic Indian crossover treks link verdant Kullu oak valleys directly into bleak Tibetan rain-shadow deserts
              across single dramatic ridges—<strong>Hampta Pass</strong>, <strong>Buran Ghati</strong>, and <strong>Pin Parvati</strong>.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link to="/treks/hampta-pass" className="btn btn-secondary">Hampta Pass</Link>
              <Link to="/treks/buran-ghati" className="btn btn-secondary">Buran Ghati</Link>
              <Link to="/treks/pin-parvati-pass" className="btn btn-secondary">Pin Parvati Pass</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ACT VI: DEODAR PINE FOREST & BUDGET REALITY (2,650 m) */}
      <section className="descent-stage" aria-labelledby="forest-title" style={{ backgroundColor: 'var(--bg-forest)' }}>
        <div className="stage-backdrop" data-parallax-bg>
          <Picture
            slug="stage-forest"
            alt="Dense deodar cedar and conifer valleys of Manali in Himachal Pradesh"
            sizes="100vw"
          />
        </div>
        <div
          className="stage-scrim"
          style={{
            background:
              'linear-gradient(245deg, rgba(10,21,16,0.92) 8%, rgba(10,21,16,0.58) 56%, rgba(8,13,18,0.84) 100%)',
          }}
        />

        <div className="container stage-foreground">
          <div className="stage-panel stage-right stage-reveal">
            <span className="eyebrow-coord" style={{ color: 'var(--accent-forest)' }}>
              <Trees size={14} aria-hidden="true" />
              STAGE 06 · TIMBERLINE SANCTUARY · 2,650 M
            </span>
            <h2 id="forest-title" className="stage-heading">
              Spend Money on Guides &amp; Tea, Not Middleman Markups
            </h2>
            <p className="stage-lead">
              Commercial operator packages bundle railhead pick-ups, porters, and group margins averaging ₹10,000–₹21,000.
              Take public HRTC/UTC buses to Sankri, Lohajung, or Barsheni, stay with village families, and cut trail expenses by 40–65%.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(11,17,23,0.72)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <span className="telemetry-cell-label">Typical DIY Base (6 days)</span>
                <strong className="tabular-nums" style={{ fontSize: '1.5rem', color: 'var(--accent-forest)' }}>
                  ~{formatInr(7700)}
                </strong>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                  Bus + homestays + dhaba meals + entry fee
                </span>
              </div>
              <div>
                <span className="telemetry-cell-label">Typical Commercial Pack</span>
                <strong className="tabular-nums" style={{ fontSize: '1.5rem', color: 'var(--ink-primary)' }}>
                  ~{formatInr(12500)}
                </strong>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                  Approximate median, checked Nov 13, 2026
                </span>
              </div>
            </div>

            <Link to="/planner" className="btn btn-primary" data-magnetic>
              Build Custom Group DIY Budget <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ACT VII: NIGHT BASE CAMP + FEATURED TREKS SHOWCASE (2,400 m) */}
      <section className="descent-stage" aria-labelledby="camp-title" style={{ backgroundColor: 'var(--bg-camp)', paddingBlock: 'clamp(5rem, 9vw, 8rem)' }}>
        <div className="stage-backdrop" data-parallax-bg>
          <Picture
            slug="stage-camp-night"
            alt="Milky Way galactic core over high Himalayan twilight lakes in Ladakh"
            sizes="100vw"
          />
        </div>
        <div
          className="stage-scrim"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,9,15,0.84) 0%, rgba(6,9,15,0.78) 45%, rgba(6,9,15,0.96) 100%)',
          }}
        />

        <div className="container stage-foreground">
          <div style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
            <span className="eyebrow-coord" style={{ color: 'var(--accent-ember)' }}>
              <Flame size={14} aria-hidden="true" />
              STAGE 07 · BASE CAMP TENTS AT NIGHT · 2,400 M
            </span>
            <h2 id="camp-title" className="stage-heading">
              Six Iconic Routes to Plan Tonight
            </h2>
            <p className="stage-lead">
              Every trek on HIMAVAT pairs verified elevation waypoints, permit rules, official state rail/road links,
              and independent DIY costing—marked &ldquo;approximate, checked Nov 13, 2026.&rdquo;
            </p>
          </div>

          <div className="trek-grid" style={{ marginBottom: '3.25rem' }}>
            {featuredTreks.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>

          {/* Interactive Month Finder Strip */}
          <div className="surface-panel" style={{ background: 'rgba(12, 19, 27, 0.88)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className="eyebrow-coord">QUICK SEASON FINDER</span>
                <h3 style={{ fontSize: '1.45rem', marginTop: '0.25rem' }}>
                  Heading Out in <span className="font-italic-accent">{MONTH_FULL_NAMES[quickMonth]}</span>?
                </h3>
              </div>
              <Link to="/treks" className="btn btn-secondary">
                Filter All 18 Treks <ArrowRight size={15} />
              </Link>
            </div>

            <div className="pill-row" role="tablist" aria-label="Select month for prime Indian Himalaya trails" style={{ marginBottom: '1.25rem' }}>
              {MONTH_LIST.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={quickMonth === m}
                  className={`choice-pill${quickMonth === m ? ' active' : ''}`}
                  onClick={() => setQuickMonth(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
              {monthPicks.map((t) => (
                <Link
                  key={t.id}
                  to={`/treks/${t.slug}`}
                  style={{
                    textDecoration: 'none',
                    padding: '0.95rem 1.05rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(242,245,247,0.04)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.28rem',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-glacier)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {t.state} · {t.daysMax} Days
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--ink-primary)' }}>{t.name}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                    {t.altitudeM.toLocaleString('en-IN')} m · {t.difficulty}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
