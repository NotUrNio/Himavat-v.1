import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QualityProvider } from './lib/quality';
import { CompareProvider } from './lib/compareStore';
import { TrekModalContext } from './lib/trekModalContext';
import { getTrekBySlug } from './lib/treksData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CurtainLoader } from './components/CurtainLoader';
import { TrekSheetModal } from './components/TrekSheetModal';
import { CustomCursor } from './components/CustomCursor';
import { ClickBurstCanvas } from './components/ClickBurstCanvas';
import type { TrekRecord } from './types/trek';

const HomePage = lazy(() => import('./pages/HomePage'));
const TreksPage = lazy(() => import('./pages/TreksPage'));
const TrekDetailPage = lazy(() => import('./pages/TrekDetailPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const SeasonsPage = lazy(() => import('./pages/SeasonsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function ScrollResetOnRouteChange() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <main className="page-main dark pad">
      <div className="wrap">
        <p className="micro">LOADING HIMALAYAN ROUTE…</p>
      </div>
    </main>
  );
}

export function App() {
  const baseName = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  const [activeTrek, setActiveTrek] = useState<TrekRecord | null>(null);

  const openTrekSheet = useCallback((trek: TrekRecord) => {
    setActiveTrek(trek);
  }, []);

  const openTrekBySlug = useCallback((slug: string) => {
    const found = getTrekBySlug(slug);
    if (found) setActiveTrek(found);
  }, []);

  const closeTrekSheet = useCallback(() => {
    setActiveTrek(null);
  }, []);

  return (
    <QualityProvider>
      <CompareProvider>
        <TrekModalContext.Provider
          value={{ activeTrek, openTrekSheet, openTrekBySlug, closeTrekSheet }}
        >
          <BrowserRouter basename={baseName}>
            <a className="skip-link" href="#main">
              Skip to main content
            </a>
            <ScrollResetOnRouteChange />
            <CurtainLoader />
            <CustomCursor />
            <ClickBurstCanvas />
            <Navbar />
            <Suspense fallback={<PageFallback />}>
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
            <Footer />
            <TrekSheetModal />
          </BrowserRouter>
        </TrekModalContext.Provider>
      </CompareProvider>
    </QualityProvider>
  );
}

export default App;
