import { useSearchParams } from 'react-router-dom';
import { usePageSeo } from '../lib/seo';
import { BudgetPlannerSection } from '../components/sections/BudgetPlannerSection';

export default function PlannerPage() {
  const [params] = useSearchParams();
  const initialSlug = params.get('trek') ?? undefined;

  usePageSeo({
    title: 'DIY Himalaya Trek Budget Planner | HIMAVAT',
    description:
      'Calculate per-person DIY vs operator costs for 18 Indian Himalaya treks with group guide splits, mandatory guide checks, and seasonal safety flags.',
  });

  return (
    <main id="main" className="page-main light pad">
      <BudgetPlannerSection key={initialSlug ?? 'default'} initialSlug={initialSlug} />
    </main>
  );
}
