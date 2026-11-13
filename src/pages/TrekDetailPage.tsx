import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator, ExternalLink, MapPin, ShieldAlert, Train, Plane, Navigation } from 'lucide-react';
import { Picture } from '../components/Picture';
import { ElevationChart } from '../components/ElevationChart';
import { ScrambleNumber } from '../components/ScrambleNumber';
import { getTrekBySlug, computeDiyBudget, formatInr } from '../lib/treksData';
import { usePageSeo } from '../lib/seo';

export default function TrekDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const trek = getTrekBySlug(slug);

  const sampleDiy = useMemo(() => {
    if (!trek) return null;
    return computeDiyBudget(trek, {
      groupSize: 2,
      month: trek.bestMonths[0] ?? 'Oct',
      hireGuide: true,
      rentGear: false,
    });
  }, [trek]);

  const jsonLd = useMemo(() => {
    if (!trek) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: `${trek.name} Trek Guide`,
      description: trek.summary,
      touristType: trek.difficulty,
      itinerary: {
        '@type': 'ItemList',
        itemListElement: trek.elevationProfile.map((w, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: `Day ${w.day}: ${w.camp} (${w.altitudeM} m)`,
        })),
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: trek.operatorCostInr.min,
        highPrice: trek.operatorCostInr.max,
      },
    };
  }, [trek]);

  usePageSeo({
    title: trek ? `${trek.name} (${trek.altitudeM} m) | HIMAVAT Trail Guide` : 'Trek Not Found | HIMAVAT',
    description: trek
      ? `${trek.name} in ${trek.state}: altitude ${trek.altitudeM} m, ${trek.daysMax} days, ${trek.difficulty}, permit rules, roadhead logistics, and DIY vs commercial operator comparison.`
      : 'Trail dossier could not be located.',
    jsonLdId: 'trek-detail-jsonld',
    jsonLd,
  });

  if (!trek || !sampleDiy) {
    return (
      <div className="page-shell container">
        <h1>Trail Not Found</h1>
        <p style={{ color: 'var(--ink-secondary)' }}>Return to the verified trail directory to pick another Indian Himalayan route.</p>
        <Link to="/treks" className="btn btn-primary">Back to All 18 Treks</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Hero Banner */}
      <section style={{ position: 'relative', minHeight: '58svh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <div className="stage-backdrop" style={{ inset: 0 }}>
          <Picture
            slug={trek.imageSlug}
            alt={`${trek.name} high-altitude landscape in ${trek.region}, ${trek.state}`}
            sizes="100vw"
            priority
          />
        </div>
        <div
          className="stage-scrim"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,13,18,0.35) 0%, rgba(8,13,18,0.68) 60%, #0b1117 100%)',
          }}
        />
        <div className="container stage-foreground" style={{ paddingBlock: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
          <Link to="/treks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: 'var(--accent-glacier)', marginBottom: '0.9rem' }}>
            <ArrowLeft size={15} /> All 18 Trails
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="eyebrow-coord" style={{ color: 'var(--ink-primary)' }}>
              <MapPin size={14} aria-hidden="true" /> {trek.state} · {trek.region}
            </span>
            <span className={`status-badge status-${trek.status}`}>
              {trek.status === 'open' ? 'Open' : trek.status === 'restricted' ? 'Restricted Access' : 'Closed / Suspended'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.4rem)' }}>{trek.name}</h1>
          <p className="font-italic-accent" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', color: '#e9ded2', margin: '0.55rem 0 0', maxWidth: '48ch' }}>
            {trek.tagline}
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBlock: '2.5rem 5rem', display: 'grid', gap: '2.25rem' }}>
        {trek.status !== 'open' && (
          <div className={`advisory-banner${trek.status === 'closed' ? ' advisory-banner--closed' : ''}`} role="alert">
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldAlert size={17} /> Operational &amp; Regulatory Notice:
            </strong>{' '}
            {trek.statusNote}
          </div>
        )}

        {/* Quick Specs Grid */}
        <section
          aria-label="Key Metrics"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}
        >
          <div className="surface-panel">
            <span className="field-label">Peak Elevation</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.2rem' }}>
              <ScrambleNumber value={trek.altitudeM} suffix=" m" />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{trek.altitudeFt.toLocaleString('en-IN')} ft</span>
          </div>
          <div className="surface-panel">
            <span className="field-label">Trail Distance</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.2rem' }}>
              <ScrambleNumber value={trek.distanceKm} suffix=" km" />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{trek.daysMin}–{trek.daysMax} days typical</span>
          </div>
          <div className="surface-panel">
            <span className="field-label">Difficulty</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: '0.35rem' }}>{trek.difficulty}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Best: {trek.bestMonths.join(', ')}</span>
          </div>
          <div className="surface-panel">
            <span className="field-label">Commercial Median</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.2rem' }}>
              <ScrambleNumber value={trek.operatorCostInr.typical} prefix="₹" />
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>{trek.operatorCostInr.priceLabel}</span>
          </div>
        </section>

        {/* Overview + Cost Comparison */}
        <div className="editorial-split">
          <section className="surface-panel">
            <h2 style={{ fontSize: '1.55rem', marginBottom: '0.75rem' }}>Route Character &amp; Highlights</h2>
            <p style={{ color: 'var(--ink-secondary)', marginTop: 0 }}>{trek.summary}</p>
            <ul style={{ margin: '1rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: '0.55rem', color: 'var(--ink-primary)' }}>
              {trek.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p style={{ marginTop: '1rem', fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
              <strong>Trail Advisory Note:</strong> {trek.statusNote}
            </p>
          </section>

          <section className="surface-panel" style={{ borderColor: 'rgba(113,168,126,0.38)' }}>
            <span className="eyebrow-coord" style={{ color: 'var(--accent-forest)' }}>BUDGET REALITY CHECK</span>
            <h2 style={{ fontSize: '1.55rem', margin: '0.35rem 0 0.75rem' }}>Operator vs Independent DIY</h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', marginTop: 0 }}>
              Sample 2-person group with shared guide ({trek.operatorCostInr.priceLabel}):
            </p>

            <dl style={{ display: 'grid', gap: '0.6rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                <dt style={{ color: 'var(--ink-secondary)' }}>DIY Est. (Per Person)</dt>
                <dd style={{ margin: 0, fontWeight: 800, color: 'var(--accent-forest)' }}>{formatInr(sampleDiy.diyTotalPerPerson)}</dd>
              </div>
              {trek.operatorCostInr.yhaiApprox && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                  <dt style={{ color: 'var(--ink-secondary)' }}>YHAI National Program</dt>
                  <dd style={{ margin: 0, fontWeight: 700 }}>{formatInr(trek.operatorCostInr.yhaiApprox)}</dd>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                <dt style={{ color: 'var(--ink-secondary)' }}>Operator Package Range</dt>
                <dd style={{ margin: 0, fontWeight: 700 }}>
                  {formatInr(trek.operatorCostInr.min)} – {formatInr(trek.operatorCostInr.max)}
                </dd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <dt style={{ color: 'var(--ink-secondary)' }}>Estimated DIY Savings</dt>
                <dd style={{ margin: 0, fontWeight: 800, color: 'var(--accent-dawn)' }}>
                  {sampleDiy.savingsVsTypical > 0 ? `${formatInr(sampleDiy.savingsVsTypical)} (${sampleDiy.savingsPct}%)` : 'Comparable on subsidized govt quota'}
                </dd>
              </div>
            </dl>

            <Link to={`/planner?trek=${trek.slug}`} className="btn btn-primary" style={{ width: '100%' }}>
              <Calculator size={16} /> Customize Group &amp; Month in DIY Planner
            </Link>
          </section>
        </div>

        {/* Interactive Elevation Chart + Itinerary Table */}
        <section className="surface-panel" aria-labelledby="elev-head">
          <h2 id="elev-head" style={{ fontSize: '1.55rem', marginBottom: '0.45rem' }}>Daily Elevation Profile</h2>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
            Hover or focus any camp node to verify daily sleeping altitude and stage distance.
          </p>
          <ElevationChart points={trek.elevationProfile} trekName={trek.name} />

          <div className="table-scroll" style={{ marginTop: '1.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Stage / Camp</th>
                  <th>Altitude (m)</th>
                  <th>Walk Distance</th>
                </tr>
              </thead>
              <tbody>
                {trek.elevationProfile.map((w) => (
                  <tr key={w.day}>
                    <td><strong>Day {w.day}</strong></td>
                    <td>{w.camp}</td>
                    <td className="tabular-nums">{w.altitudeM.toLocaleString('en-IN')} m</td>
                    <td className="tabular-nums">{w.distanceKm > 0 ? `${w.distanceKm} km` : 'Road Transit'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Permits, Roadhead Logistics & Seasonality */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <section className="surface-panel">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Permits &amp; Checkposts</h2>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
              <strong>Authority:</strong> {trek.permits.authority}
            </p>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem' }}>
              <strong>Approx. Tariff:</strong> Indian ₹{trek.permits.indianFeeInr.toLocaleString('en-IN')} · Foreign ₹{trek.permits.foreignFeeInr.toLocaleString('en-IN')}
            </p>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>{trek.permits.notes}</p>
          </section>

          <section className="surface-panel">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Roadhead &amp; Transit Access</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <Navigation size={16} style={{ flexShrink: 0, marginTop: 3, color: 'var(--accent-dawn)' }} />
                <span><strong>Base:</strong> {trek.roadhead}</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <Train size={16} style={{ flexShrink: 0, marginTop: 3, color: 'var(--accent-glacier)' }} />
                <span><strong>Rail:</strong> {trek.nearestRail}</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>
                <Plane size={16} style={{ flexShrink: 0, marginTop: 3, color: 'var(--accent-forest)' }} />
                <span><strong>Air:</strong> {trek.nearestAirport}</span>
              </li>
            </ul>
          </section>

          <section className="surface-panel">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Verified Public Sources</h2>
            <p style={{ margin: '0 0 0.6rem', fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
              Checked operators: {trek.operatorCostInr.operatorsSampled.join(', ')}.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.45rem', fontSize: '0.82rem' }}>
              {trek.sources.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', wordBreak: 'break-all' }}>
                    {new URL(url).hostname} <ExternalLink size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
