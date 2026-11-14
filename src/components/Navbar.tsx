import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { LottieCompass } from './LottieCompass';
import { Picture } from './Picture';
import { useQuality } from '../lib/qualityContext';
import { useCompare } from '../lib/compareContext';
import { ambientAudio } from '../lib/audio';

interface MenuEntry {
  label: string;
  sectionId: string;
  route: string;
  previewSlug: string;
}

const MENU_ENTRIES: MenuEntry[] = [
  { label: 'Treks', sectionId: 'treks', route: '/treks', previewSlug: 'kedarkantha' },
  { label: 'Hall of Fame', sectionId: 'hall', route: '/#hall', previewSlug: 'goecha-la' },
  { label: 'Planner', sectionId: 'planner', route: '/planner', previewSlug: 'markha-valley' },
  { label: 'Compare', sectionId: 'compare', route: '/compare', previewSlug: 'pin-parvati-pass' },
  { label: 'Seasons', sectionId: 'seasons', route: '/seasons', previewSlug: 'valley-of-flowers' },
  { label: 'Safety & Prep', sectionId: 'safety', route: '/safety', previewSlug: 'hampta-pass' },
  { label: 'About', sectionId: 'about', route: '/about', previewSlug: 'sandakphu' },
  { label: 'Credits', sectionId: 'credits', route: '/credits', previewSlug: 'dayara-bugyal' },
  { label: 'Contact', sectionId: 'contact', route: '/contact', previewSlug: 'kashmir-great-lakes' },
];

export function Navbar({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tier, detectedTier, overrideTier, setOverrideTier, fps } = useQuality();
  const { compareSlugs } = useCompare();

  const [menuOpen, setMenuOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [istClock, setIstClock] = useState('');
  const [scrollPct, setScrollPct] = useState(0);
  const menuRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateClock = () => {
      try {
        setIstClock(
          new Date().toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST',
        );
      } catch {
        setIstClock('IST');
      }
    };
    updateClock();
    const id = window.setInterval(updateClock, 20000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      setScrollPct(pct);
      ambientAudio.setScrollProgress(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleToggleAudio = async () => {
    if (audioLoading) return;
    setAudioLoading(true);
    try {
      const next = await ambientAudio.toggle();
      setAudioOn(next);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleMenuNavigation = (entry: MenuEntry) => {
    setMenuOpen(false);
    setPreviewSlug(null);

    if (location.pathname === '/') {
      const target = document.getElementById(entry.sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    if (onNavigate) {
      onNavigate(entry.route);
    } else {
      navigate(entry.route);
    }
  };

  const handleBrandClick = () => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cycleQualityTier = () => {
    const order: Array<'auto' | 'high' | 'medium' | 'low'> = ['auto', 'high', 'medium', 'low'];
    const next = order[(order.indexOf(overrideTier) + 1) % order.length];
    setOverrideTier(next);
  };

  const dprDisplay =
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5).toFixed(1) : '1.0';
  const tierLabel = tier.toUpperCase();
  const autoDowngraded = overrideTier === 'auto' && tier !== detectedTier;

  return (
    <>
      <div id="river" aria-hidden="true">
        <div id="riverFill" style={{ height: `${(scrollPct * 100).toFixed(2)}%` }} />
      </div>

      <button
        type="button"
        id="quality"
        className="quality-pill"
        onClick={cycleQualityTier}
        title="Adaptive GPU benchmark & live FPS governor — click to override tier"
      >
        {autoDowngraded
          ? `QUALITY: ${detectedTier.toUpperCase()} → ${tierLabel} (${fps} FPS)`
          : `QUALITY: ${tierLabel}${overrideTier === 'auto' ? ' · AUTO' : ''} · DPR ${dprDisplay} · ${fps} FPS`}
      </button>

      <header className="site" role="banner">
        <div className="brand-group">
          <Link to="/" className="brand" onClick={handleBrandClick}>
            HIMAVAT<i>.</i>
          </Link>
          <LottieCompass size={26} label="Himalaya compass" />
        </div>

        <div className="site-actions">
          <span className="mono clock-readout" id="clock">
            {istClock}
          </span>

          <button
            type="button"
            className="btn nav-audio-pill"
            aria-pressed={audioOn}
            onClick={handleToggleAudio}
            disabled={audioLoading}
            title="Toggle CC0 alpine wind and waterfall spatial mixer"
          >
            {audioOn ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}
            <span>{audioOn ? 'SOUND ON' : 'SOUND'}</span>
          </button>

          <button
            type="button"
            className="btn"
            id="menuBtn"
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen(true)}
          >
            <span>MENU{compareSlugs.length > 0 ? ` (${compareSlugs.length})` : ''}</span>
          </button>
        </div>
      </header>

      <nav
        ref={menuRef}
        id="menu"
        className={menuOpen ? 'open' : undefined}
        aria-label="Fullscreen site navigation"
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="btn"
          id="menuClose"
          style={{ position: 'absolute', top: '16px', right: '20px', color: '#fff', borderColor: '#fff' }}
          onClick={() => {
            setMenuOpen(false);
            setPreviewSlug(null);
          }}
        >
          <span>CLOSE ✕</span>
        </button>

        <div className="wrap" style={{ width: '100%' }}>
          {MENU_ENTRIES.map((entry) => (
            <button
              key={entry.label}
              type="button"
              className="big"
              onClick={() => handleMenuNavigation(entry)}
              onMouseMove={(e) => {
                setPreviewSlug(entry.previewSlug);
                setPreviewPos({ x: e.clientX + 26, y: Math.max(24, e.clientY - 72) });
              }}
              onMouseLeave={() => setPreviewSlug(null)}
            >
              {entry.label}
            </button>
          ))}

          <div className="menu-sublinks">
            <Link
              to="/treks"
              className="chip"
              onClick={() => setMenuOpen(false)}
            >
              Dedicated Catalog (/treks)
            </Link>
            <Link
              to="/planner"
              className="chip"
              onClick={() => setMenuOpen(false)}
            >
              Dedicated Planner (/planner)
            </Link>
            <Link
              to="/compare"
              className="chip"
              onClick={() => setMenuOpen(false)}
            >
              Compare ({compareSlugs.length}/3)
            </Link>
            <Link
              to="/safety"
              className="chip"
              onClick={() => setMenuOpen(false)}
            >
              WMS 2024 Safety
            </Link>
          </div>

          <p className="mono" style={{ marginTop: '20px', opacity: 0.92 }}>
            18 VERIFIED TREKS · 25 CURATED IMAGE SETS · PRICES APPROXIMATE, CHECKED 13 NOV 2026
          </p>
        </div>
      </nav>

      {menuOpen && previewSlug && (
        <div
          id="menuPreview"
          style={{ left: `${previewPos.x}px`, top: `${previewPos.y}px` }}
          aria-hidden="true"
        >
          <Picture
            slug={previewSlug}
            alt=""
            sizes="240px"
            className="pic-cover"
          />
        </div>
      )}
    </>
  );
}
