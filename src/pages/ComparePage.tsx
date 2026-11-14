import { usePageSeo } from '../lib/seo';
import { CompareSection } from '../components/sections/CompareSection';

export default function ComparePage() {
  usePageSeo({
    title: 'Compare Indian Himalaya Treks | HIMAVAT',
    description:
      'Compare altitude, normalized elevation curves, permit rules, operator tariffs, and best windows across up to three Himalayan treks.',
  });

  return (
    <main id="main" className="page-main dark pad">
      <CompareSection />
    </main>
  );
}
