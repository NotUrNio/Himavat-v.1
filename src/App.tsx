import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { QualityProvider } from './lib/quality';
import { useQuality } from './lib/qualityContext';
import { CompareProvider } from './lib/compareStore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { ClickBurstCanvas } from './components/ClickBurstCanvas';
import HomePage from './pages/HomePage';

// Route-split subpages keep initial JS well under 200 KB gzipped
const TreksPage = lazy(() => import('./pages/TreksPage'));
const TrekDetailPage = lazy(() => import('./pages/TrekDetailPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const SeasonsPage = lazy(() => import('./pages/SeasonsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function RouteLoadingFallback() {
  return (
    <div className="page-shell container" style={{ display: 'flex', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>Loading Himalayan trail data...</p>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reducedMotion, tier } = useQuality();
  const [wiping, setWiping] = useState(false);

  // Scroll to hash or top on navigation
  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash, reducedMotion]);

  const handleRidgeTransition = (to: string) => {
    if (reducedMotion || tier === 'low') {
      navigate(to);
      return;
    }
    setWiping(true);
    window.setTimeout(() => {
      navigate(to);
      window.setTimeout(() => setWiping(false), 200);
    }, 180);
  };

  return (
    <>
      <div className="intro-crest-line" aria-hidden="true" />
      <div className={`ridge-wipe-overlay${wiping ? ' active' : ''}`} aria-hidden="true" />
      <CustomCursor />
      <ClickBurstCanvas />
      <Navbar onNavigate={handleRidgeTransition} />

      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/treks" element={<TreksPage />} />
            <Route path="/treks/:slug" element={<TrekDetailPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/seasons" element={<SeasonsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

export function App() {
  const baseName = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

  return (
    <QualityProvider>
      <CompareProvider>
        <BrowserRouter basename={baseName}>
          <AppShell />
        </BrowserRouter>
      </CompareProvider>
    </QualityProvider>
  );
}

export default App;
