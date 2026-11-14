import { useState } from 'react';
import { usePageSeo } from '../lib/seo';
import { TrekCatalogSection, type CatalogPreset } from '../components/sections/TrekCatalogSection';

export default function TreksPage() {
  const [preset, setPreset] = useState<CatalogPreset>('all');

  usePageSeo({
    title: 'All 18 Indian Himalaya Treks | HIMAVAT',
    description:
      'Filter 18 verified Indian Himalaya treks across Uttarakhand, Himachal Pradesh, Sikkim, Ladakh, Kashmir, and West Bengal by difficulty, state, month, duration, and tariff.',
  });

  return (
    <main id="main" className="page-main light pad">
      <TrekCatalogSection preset={preset} onPresetChange={setPreset} />
    </main>
  );
}
