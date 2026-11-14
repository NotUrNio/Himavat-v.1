import { usePageSeo } from '../lib/seo';
import { SafetySection } from '../components/sections/SafetySection';

export default function SafetyPage() {
  usePageSeo({
    title: 'WMS 2024 Safety, Permits & Interactive Packing Checklist | HIMAVAT',
    description:
      'Wilderness Medical Society 2024 AMS rules, India mountain emergency numbers, persistent packing checklist, 6-week conditioning plan, and trail closure alerts.',
  });

  return (
    <main id="main" className="page-main dark pad">
      <SafetySection />
    </main>
  );
}
