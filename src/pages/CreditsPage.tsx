import { ExternalLink, Award, Music, Type, Database, Code2 } from 'lucide-react';
import creditsJson from '../data/credits.json';
import { TREK_META } from '../lib/treksData';
import { usePageSeo } from '../lib/seo';

interface CreditsDocument {
  project: string;
  lastUpdated: string;
  images: Array<{
    slug: string;
    category: string;
    title: string;
    location: string;
    photographer: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
    sourcePlatform: string;
    masterResolution: string;
  }>;
  audio: Array<{
    slug: string;
    title: string;
    description: string;
    artist: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
  }>;
  fonts: Array<{ name: string; license: string; source: string }>;
  libraries: Array<{ name: string; license: string; purpose: string }>;
}

const credits = creditsJson as CreditsDocument;

export default function CreditsPage() {
  usePageSeo({
    title: 'Photo Attributions, Licenses & Open Data Credits | HIMAVAT',
    description:
      'Complete photographer attributions, Creative Commons license links, CC0 audio credits, open-source fonts, and trail research citations powering HIMAVAT.',
  });

  return (
    <div className="page-shell">
      <div className="container" style={{ display: 'grid', gap: '2.5rem' }}>
        <header>
          <span className="eyebrow-coord">
            <Award size={14} aria-hidden="true" />
            100% VERIFIED FREE &amp; LICENSED ASSETS · UPDATED {credits.lastUpdated}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginTop: '0.5rem' }}>
            Image Credits, Audio, Fonts &amp; Data Sources
          </h1>
          <p style={{ maxWidth: '68ch', color: 'var(--ink-secondary)' }}>
            Every photograph, audio track, typeface, and software module in HIMAVAT is legally free and attributed per Creative Commons / Open Font / Open Source terms.
            All 25 photography locations were individually verified inside India&rsquo;s Himalayan states and territories.
          </p>
        </header>

        {/* 25 Verified Photographs Table */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.85rem' }}>
            Photography Attributions ({credits.images.length} Verified Indian Himalayan Frames)
          </h2>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trail / Scene</th>
                  <th>Verified Indian Location</th>
                  <th>Photographer</th>
                  <th>License &amp; Source</th>
                </tr>
              </thead>
              <tbody>
                {credits.images.map((im) => (
                  <tr key={im.slug}>
                    <td>
                      <strong style={{ display: 'block' }}>{im.slug}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>{im.masterResolution} · {im.category}</span>
                    </td>
                    <td>{im.location}</td>
                    <td>{im.photographer}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.82rem' }}>
                        <a href={im.licenseUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-forest)' }}>
                          {im.license}
                        </a>
                        <a href={im.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                          {im.sourcePlatform} <ExternalLink size={11} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Data Research Sources */}
        <section className="surface-panel">
          <h2 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Database size={19} style={{ color: 'var(--accent-dawn)' }} /> Verified Trail, Safety &amp; Pricing Research Sources
          </h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
            All content was independently researched, paraphrased, and checked across primary portals on <strong>{TREK_META.lastChecked}</strong>:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
            {TREK_META.sources.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  {src.name} <ExternalLink size={12} />
                </a>{' '}
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>(checked {src.checked})</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CC0 Audio, Self-Hosted Fonts, Open-Source Stack */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <section className="surface-panel">
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <Music size={18} style={{ color: 'var(--accent-ember)' }} /> CC0 Ambient Audio
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.6rem', fontSize: '0.86rem' }}>
              {credits.audio.map((a) => (
                <li key={a.slug}>
                  <strong>{a.slug}</strong> by {a.artist} ({a.license}) —{' '}
                  <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)' }}>Source</a>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-panel">
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <Type size={18} style={{ color: 'var(--accent-glacier)' }} /> Self-Hosted OFL Fonts
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.6rem', fontSize: '0.86rem' }}>
              {credits.fonts.map((f) => (
                <li key={f.name}>
                  <strong>{f.name}</strong> ({f.license}) —{' '}
                  <a href={f.source} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)' }}>Fontsource</a>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-panel">
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <Code2 size={18} style={{ color: 'var(--accent-forest)' }} /> Zero-Cost Stack
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.45rem', fontSize: '0.84rem' }}>
              {credits.libraries.map((lib) => (
                <li key={lib.name}>
                  <strong>{lib.name}</strong> ({lib.license}) — <span style={{ color: 'var(--ink-secondary)' }}>{lib.purpose}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
