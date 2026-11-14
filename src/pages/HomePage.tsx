import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageSeo } from '../lib/seo';
import { useQuality } from '../lib/qualityContext';
import { HeroStageSection } from '../components/sections/HeroStageSection';
import { ManifestoSection } from '../components/sections/ManifestoSection';
import { DescentSection } from '../components/sections/DescentSection';
import { SplitSection } from '../components/sections/SplitSection';
import { TrekCatalogSection, type CatalogPreset } from '../components/sections/TrekCatalogSection';
import { HallOfFameSection } from '../components/sections/HallOfFameSection';
import { BudgetPlannerSection } from '../components/sections/BudgetPlannerSection';
import { CompareSection } from '../components/sections/CompareSection';
import { SeasonsSection } from '../components/sections/SeasonsSection';
import { SafetySection } from '../components/sections/SafetySection';
import { AboutSection } from '../components/sections/AboutSection';
import { CreditsSection } from '../components/sections/CreditsSection';
import { ContactSection } from '../components/sections/ContactSection';

export default function HomePage() {
  const { isTouch, reducedMotion } = useQuality();
  const location = useLocation();
  const [preset, setPreset] = useState<CatalogPreset>('all');

  usePageSeo({
    title: 'HIMAVAT — The Descent | 18 Verified Indian Himalaya Treks',
    description:
      'Summit to base camp across 18 verified Indian Himalaya treks: interactive spotlight hero, WebGL cascade descent, itemized DIY budget planner, normalized elevation comparator, and WMS 2024 safety checklist.',
  });

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) {
      window.setTimeout(() => {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }, 60);
    }
  }, [location.hash, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || isTouch) return;
    let disposed = false;
    let rafId = 0;
    let lenisInstance: {
      raf: (t: number) => void;
      stop: () => void;
      start: () => void;
      destroy: () => void;
    } | null = null;
    let observer: MutationObserver | null = null;

    (async () => {
      try {
        const [{ default: Lenis }] = await Promise.all([import('lenis')]);
        if (disposed) return;

        const lenis = new Lenis({
          duration: 1.08,
          smoothWheel: true,
        });
        lenisInstance = lenis;

        const syncLockState = () => {
          if (
            document.body.classList.contains('locked') ||
            document.body.classList.contains('sheet-open') ||
            document.body.classList.contains('menu-open')
          ) {
            lenis.stop();
          } else {
            lenis.start();
          }
        };

        syncLockState();
        observer = new MutationObserver(syncLockState);
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['class'],
        });

        const frame = (time: number) => {
          if (disposed) return;
          lenis.raf(time);
          rafId = window.requestAnimationFrame(frame);
        };
        rafId = window.requestAnimationFrame(frame);
      } catch {
        // Fallback silently to native scroll
      }
    })();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      lenisInstance?.destroy();
    };
  }, [reducedMotion, isTouch]);

  return (
    <main id="main">
      <HeroStageSection />
      <ManifestoSection />
      <DescentSection />
      <SplitSection onSelectPreset={setPreset} />

      <section id="treks" className="light pad">
        <TrekCatalogSection preset={preset} onPresetChange={setPreset} />
      </section>

      <HallOfFameSection />

      <section id="planner" className="light pad">
        <BudgetPlannerSection />
      </section>

      <section id="compare" className="dark pad">
        <CompareSection />
      </section>

      <section id="seasons" className="light pad">
        <SeasonsSection />
      </section>

      <section id="safety" className="dark pad">
        <SafetySection />
      </section>

      <section id="about" className="light pad">
        <AboutSection />
      </section>

      <section id="credits" className="dark pad">
        <CreditsSection />
      </section>

      <section id="contact" className="light pad">
        <ContactSection />
      </section>
    </main>
  );
}
