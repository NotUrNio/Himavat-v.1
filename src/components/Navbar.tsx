import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Volume2, VolumeX, X, SlidersHorizontal } from 'lucide-react';
import { ambientAudio } from '../lib/audio';
import { useQuality, type QualityTier } from '../lib/qualityContext';

const NAV_ITEMS = [
  { to: '/', label: 'The Descent' },
  { to: '/treks', label: 'Treks' },
  { to: '/planner', label: 'DIY Planner' },
  { to: '/compare', label: 'Compare' },
  { to: '/safety', label: 'Safety & Permits' },
  { to: '/seasons', label: 'Seasons' },
];

export function Navbar({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const { pathname } = useLocation();
  const { tier, overrideTier, setOverrideTier } = useQuality();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleToggleAudio = async () => {
    const active = await ambientAudio.toggle();
    setAudioOn(active);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    setQualityMenuOpen(false);
    setDrawerOpen(false);
    if (onNavigate && to !== pathname) {
      e.preventDefault();
      onNavigate(to);
    }
  };

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <Link
          to="/"
          className="brand-mark"
          onClick={(e) => handleLinkClick(e, '/')}
        >
          <span>HIMAVAT</span>
          <span className="brand-sub">Field Atlas</span>
        </Link>

        <nav className="nav-links" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link"
              aria-current={pathname === item.to ? 'page' : undefined}
              onClick={(e) => handleLinkClick(e, item.to)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-toggle"
            aria-pressed={audioOn}
            onClick={handleToggleAudio}
            aria-label={audioOn ? 'Mute ambient alpine soundscape' : 'Play ambient alpine wind and water (CC0)'}
            title={audioOn ? 'Ambient sound ON (CC0 wind & stream)' : 'Ambient sound OFF (Click for CC0 soundscape)'}
          >
            {audioOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="hide-xs">{audioOn ? 'Sound On' : 'Audio'}</span>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="icon-toggle"
              onClick={() => setQualityMenuOpen((v) => !v)}
              aria-expanded={qualityMenuOpen}
              aria-label={`Graphics quality tier: ${tier}`}
              title="Adaptive performance tier (Auto adjusts below 45 FPS)"
            >
              <SlidersHorizontal size={14} />
              <span style={{ textTransform: 'uppercase' }}>{tier}</span>
            </button>

            {qualityMenuOpen && (
              <div
                role="menu"
                aria-label="Select rendering quality tier"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: '#0e1720',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem',
                  minWidth: '150px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  zIndex: 700,
                }}
              >
                {(['auto', 'high', 'medium', 'low'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="menuitemradio"
                    aria-checked={overrideTier === opt}
                    onClick={() => {
                      setOverrideTier(opt as QualityTier | 'auto');
                      setQualityMenuOpen(false);
                    }}
                    style={{
                      textAlign: 'left',
                      background: overrideTier === opt ? 'rgba(89,179,196,0.2)' : 'transparent',
                      border: 'none',
                      borderRadius: 4,
                      padding: '0.42rem 0.6rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      color: overrideTier === opt ? '#f2f5f7' : '#b9c5cf',
                      textTransform: 'capitalize',
                    }}
                  >
                    {opt === 'auto' ? `Auto (${tier})` : `${opt} tier`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="mobile-drawer" role="dialog" aria-label="Mobile Navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname === item.to ? 'page' : undefined}
              onClick={(e) => handleLinkClick(e, item.to)}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.95rem', color: 'var(--ink-secondary)' }}>
            <Link to="/about" onClick={(e) => handleLinkClick(e, '/about')}>About</Link>
            <Link to="/credits" onClick={(e) => handleLinkClick(e, '/credits')}>Credits</Link>
            <Link to="/contact" onClick={(e) => handleLinkClick(e, '/contact')}>Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
}
