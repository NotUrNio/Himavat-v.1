import { usePageSeo } from '../lib/seo';
import { AboutSection } from '../components/sections/AboutSection';

export default function AboutPage() {
  usePageSeo({
    title: 'About & Verification Methodology | HIMAVAT',
    description:
      'How HIMAVAT verifies Indian Himalaya trek tariffs, permit rules, responsive imagery, and adaptive WebGL GPU tiers.',
  });

  return (
    <main id="main" className="page-main light pad">
      <AboutSection />
    </main>
  );
}
