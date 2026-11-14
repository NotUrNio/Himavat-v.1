import { usePageSeo } from '../lib/seo';
import { CreditsSection } from '../components/sections/CreditsSection';

export default function CreditsPage() {
  usePageSeo({
    title: 'Photo, Audio & Dataset Credits | HIMAVAT',
    description:
      'Complete photographer attributions, open CC BY-SA/CC0 licenses, ambient audio sources, and Indian Himalaya data references.',
  });

  return (
    <main id="main" className="page-main dark pad">
      <CreditsSection />
    </main>
  );
}
