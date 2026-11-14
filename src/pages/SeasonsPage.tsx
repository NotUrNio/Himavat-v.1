import { usePageSeo } from '../lib/seo';
import { SeasonsSection } from '../components/sections/SeasonsSection';

export default function SeasonsPage() {
  usePageSeo({
    title: '12-Month Himalayan Trekking Seasons Calendar | HIMAVAT',
    description:
      'Monthly Indian Himalaya calendar showing prime open routes and shoulder-season advisories across 18 verified treks.',
  });

  return (
    <main id="main" className="page-main light pad">
      <SeasonsSection />
    </main>
  );
}
