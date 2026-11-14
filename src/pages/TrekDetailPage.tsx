import { Link, useNavigate, useParams } from 'react-router-dom';
import { Picture } from '../components/Picture';
import { ElevationChart } from '../components/ElevationChart';
import { useCompare } from '../lib/compareContext';
import { usePageSeo } from '../lib/seo';
import {
  ALL_TREKS,
  MONTH_FULL_NAMES,
  TREK_META,
  formatInr,
  getTrekBySlug,
  isGuideCompulsory,
} from '../lib/treksData';
import {
  formatDaysRange,
  formatOperatorPriceRange,
  getEffectiveWaypoints,
} from '../lib/trekHelpers';

export default function TrekDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSelected, toggleCompare } = useCompare();

  const trek = getTrekBySlug(slug);

  usePageSeo({
    title: trek ? `${trek.name} (${trek.altitudeM} m) | HIMAVAT` : 'Route Not Found | HIMAVAT',
    description: trek
      ? `${trek.name} in ${trek.region}, ${trek.state}: ${trek.altitudeM} m, ${formatDaysRange(trek.daysMin, trek.daysMax)}, permit rules, elevation waypoints, and DIY budget.`
      : 'Himalayan route directory.',
  });

  if (!trek) {
    return (
      <main id="main" className="page-main light pad">
        <div className="wrap">
          <p className="micro">404 — TRAIL NOT INDEXED</p>
          <h2>TREK NOT FOUND</h2>
          <p style={{ margin: '16px 0 24px' }}>
            We could not match that trail slug in our 18 verified Indian Himalaya routes.
          </p>
          <Link to="/treks" className="btn btn-solid">
            <span>VIEW ALL 18 TREKS →</span>
          </Link>
        </div>
      </main>
    );
  }

  const index = ALL_TREKS.findIndex((t) => t.slug === trek.slug);
  const prevTrek = ALL_TREKS[(index - 1 + ALL_TREKS.length) % ALL_TREKS.length];
  const nextTrek = ALL_TREKS[(index + 1) % ALL_TREKS.length];

  const waypoints = getEffectiveWaypoints(trek);
  const guideMandatory = isGuideCompulsory(trek);
  const compared = isSelected(trek.slug);

  return (
    <main id="main">
      <section className="dark pad" style={{ paddingTop: '108px', paddingBottom: '48px' }}>
        <div className="wrap">
          <p className="micro">
            <Link to="/treks" style={{ textDecoration: 'underline' }}>← ALL 18 TREKS</Link> · {trek.state.toUpperCase()} · {trek.region.toUpperCase()}
          </p>

          <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5.4rem)', marginBottom: '12px' }}>
            {trek.name}
          </h1>
          <p style={{ maxWidth: '760px', fontSize: '1.12rem', color: '#B9BDB2' }}>
            {trek.tagline}
          </p>

          {trek.statusNote && (
            <div className="warn" style={{ marginTop: '18px' }}>
              {trek.statusNote}
            </div>
          )}

          <div
            style={{
              marginTop: '24px',
              border: '2px solid var(--line-strong)',
              overflow: 'hidden',
              maxHeight: '480px',
            }}
          >
            <Picture
              slug={trek.imageSlug}
              alt={`${trek.name}, ${trek.state}`}
              sizes="(max-width: 1280px) 100vw, 1240px"
              priority
              className="pic-cover"
            />
          </div>

          <div className="stat-tiles" style={{ marginTop: '20px' }}>
            <div>
              <b>{trek.altitudeM.toLocaleString('en-IN')} m</b>
              <span className="mono">{trek.altitudeFt.toLocaleString('en-IN')} FT MAX ALTITUDE</span>
            </div>
            <div>
              <b>{formatDaysRange(trek.daysMin, trek.daysMax)}</b>
              <span className="mono">DURATION</span>
            </div>
            <div>
              <b>{trek.distanceKm} km</b>
              <span className="mono">TOTAL TRAIL DISTANCE</span>
            </div>
            <div>
              <b>{trek.difficulty}</b>
              <span className="mono">GRADE · {guideMandatory ? 'GUIDE MANDATORY' : 'GUIDE OPTIONAL'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => navigate(`/planner?trek=${encodeURIComponent(trek.slug)}`)}
            >
              <span>OPEN IN DIY PLANNER →</span>
            </button>
            <button
              type="button"
              className={`btn${compared ? ' btn-solid' : ''}`}
              onClick={() => toggleCompare(trek.slug)}
            >
              <span>{compared ? '✓ SELECTED FOR COMPARE' : '+ ADD TO COMPARE'}</span>
            </button>
            <Link to="/compare" className="btn">
              <span>GO TO COMPARE MATRIX</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="light pad">
        <div className="wrap">
          <p className="micro">ELEVATION PROFILE &amp; FIELD LOGISTICS</p>
          <div className="elevation-chart-card">
            <ElevationChart
              mode="single"
              points={waypoints}
              trekName={trek.name}
              accentColor="#FF5A1F"
            />
          </div>

          <div className="planner-grid" style={{ marginTop: '24px' }}>
            <div className="panel panel-filled">
              <p className="micro">ROUTE OVERVIEW</p>
              <p style={{ lineHeight: 1.7 }}>{trek.summary}</p>
              <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                Key Highlights
              </h3>
              <ul style={{ lineHeight: 1.75, paddingLeft: '20px', marginBottom: 0 }}>
                {trek.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="panel panel-filled">
              <p className="micro">PERMITS, ACCESS &amp; SEASONS</p>
              <p style={{ margin: '0 0 10px' }}>
                <strong>Permit Authority:</strong> {trek.permits.authority}
              </p>
              <p style={{ margin: '0 0 10px' }}>{trek.permits.notes}</p>
              <p style={{ margin: '0 0 10px' }}>
                <strong>Roadhead:</strong> {trek.roadhead}
                <br />
                <strong>Nearest Rail:</strong> {trek.nearestRail}
                <br />
                <strong>Airport:</strong> {trek.nearestAirport}
              </p>
              <p style={{ margin: '0 0 10px' }}>
                <strong>Best months:</strong>{' '}
                {trek.bestMonths.map((m) => MONTH_FULL_NAMES[m]).join(', ')}
              </p>
              <p style={{ margin: '0 0 6px' }}>
                <strong>Operator tariff range:</strong> {formatOperatorPriceRange(trek)}{' '}
                {trek.operatorCostInr.yhaiApprox && `(YHAI ~${formatInr(trek.operatorCostInr.yhaiApprox)})`}
              </p>
              <p className="mono" style={{ color: '#4E5358', margin: 0 }}>
                {trek.operatorCostInr.priceLabel} · {TREK_META.lastChecked}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '32px',
            }}
          >
            <Link to={`/treks/${prevTrek.slug}`} className="btn">
              <span>← PREV: {prevTrek.name}</span>
            </Link>
            <Link to={`/treks/${nextTrek.slug}`} className="btn">
              <span>NEXT: {nextTrek.name} →</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
