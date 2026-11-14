import { usePageSeo } from '../lib/seo';
import { ContactSection } from '../components/sections/ContactSection';

export default function ContactPage() {
  usePageSeo({
    title: 'Corrections & Trail Reports | HIMAVAT',
    description:
      'Submit verified tariff updates, Forest Department closure notices, or attribution fixes for Indian Himalaya trails.',
  });

  return (
    <main id="main" className="page-main light pad">
      <ContactSection />
    </main>
  );
}
