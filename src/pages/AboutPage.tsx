import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { Picture } from '../components/Picture';
import { useQuality } from '../lib/qualityContext';

export default function AboutPage() {
  const { tier, gpuSummary, fps } = useQuality();

  usePageSeo({
    title: 'About HIMAVAT & Field Methodology | Indian Himalaya Atlas',
    description:
      'Learn how HIMAVAT pairs verified Indian Himalayan data, conservative altitude safety standards, open-source WebGL/GSAP craftsmanship, and zero-commission DIY budgets.',
  });

  return (
    <div className="page-shell">
      <div className="container" style={{ display: 'grid', gap: '2.5rem' }}>
        <header style={{ maxWidth: '72ch' }}>
          <span className="eyebrow-coord">
            <Compass size={14} aria-hidden="true" />
            OUR PHILOSOPHY &amp; ARCHITECTURE
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginTop: '0.5rem' }}>
            Built Like an Expedition Pack: Light, Free, Honest
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--ink-secondary)' }}>
            HIMAVAT takes zero booking commissions, places zero ads, and never resells affiliate trekking packages.
            Its sole mission is showing first-time and seasoned hikers how India&rsquo;s 18 greatest trails actually feel—and how little an honest bus-and-homestay trip can cost.
          </p>
        </header>

        <div className="editorial-split">
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <Picture
              slug="kuari-pass"
              alt="Nanda Devi massif seen along the Kuari Pass ridge in Uttarakhand, Indian Himalayas"
              sizes="(max-width: 900px) 100vw, 55vw"
            />
          </div>

          <div className="surface-panel">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Verification Standards</h2>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'grid', gap: '0.65rem', color: 'var(--ink-secondary)', fontSize: '0.94rem' }}>
              <li>
                <strong>Strictly Indian Himalaya Imagery:</strong> All 25 photographs carry traceable coordinates inside Uttarakhand, Himachal Pradesh, Ladakh, Sikkim, West Bengal (Singalila), and Jammu &amp; Kashmir. Zero Nepal or Alpine substitutes.
              </li>
              <li>
                <strong>Upfront Trail Bans &amp; Quotas:</strong> Where High Courts or State Forest Departments prohibit camping (Roopkund, Kheerganga) or shut trails (Stok Kangri) or restrict entries (Triund), those limits appear right next to trail elevations.
              </li>
              <li>
                <strong>Zero-Cost Web Performance:</strong> Subsetted local fonts, multi-width AVIF/WebP delivery, single-canvas OGL waterfall shaders, and real-time FPS tier downgrading ensure low-end mobile phones read every table seamlessly.
              </li>
            </ul>
          </div>
        </div>

        <section className="surface-panel">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Live Device Telemetry Diagnostic</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
            HIMAVAT inspects CPU cores, RAM, screen width, Save-Data, and self-hosted `detect-gpu` benchmarks to keep animations smooth on modest phones while unlocking full WebGL waterfall sprays on desktops.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
              <span className="field-label">Active Tier</span>
              <strong style={{ display: 'block', fontSize: '1.2rem', textTransform: 'uppercase', color: 'var(--accent-glacier)' }}>{tier}</strong>
            </div>
            <div style={{ padding: '0.8rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
              <span className="field-label">GPU Benchmark Readout</span>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>{gpuSummary}</strong>
            </div>
            <div style={{ padding: '0.8rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
              <span className="field-label">Measured Render Rate</span>
              <strong className="tabular-nums" style={{ display: 'block', fontSize: '1.2rem' }}>{fps} FPS</strong>
            </div>
          </div>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/credits" className="btn btn-primary">Inspect Full Credits &amp; Sources <ArrowRight size={15} /></Link>
            <Link to="/contact" className="btn btn-secondary">Submit Trail Update</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
