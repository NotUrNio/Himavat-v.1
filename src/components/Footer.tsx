import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand-mark" style={{ marginBottom: '0.75rem' }}>
              <span>HIMAVAT</span>
              <span className="brand-sub">Field Atlas</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', maxWidth: '34ch', lineHeight: 1.65 }}>
              Zero-commission Indian Himalaya trekking atlas built with open-source telemetry, verified
              4K Wikimedia Commons photography, and honest DIY trail cost breakdowns.
            </p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              All operator packages &amp; DIY budgets are <strong>approximate, checked Nov 13, 2026</strong>. Verify forest gates &amp; weather before departure.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-primary)', marginBottom: '0.9rem' }}>
              Explore Trails
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem', fontSize: '0.9rem' }}>
              <li><Link to="/">The Descent Journey</Link></li>
              <li><Link to="/treks">All 18 Indian Treks</Link></li>
              <li><Link to="/seasons">Month-by-Month Calendar</Link></li>
              <li><Link to="/compare">Side-by-Side Compare</Link></li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-primary)', marginBottom: '0.9rem' }}>
              Plan &amp; Safety
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem', fontSize: '0.9rem' }}>
              <li><Link to="/planner">DIY Budget Calculator</Link></li>
              <li><Link to="/safety">AMS &amp; HAPE/HACE Protocols</Link></li>
              <li><Link to="/safety#permits">ILP / PAP / Forest Permits</Link></li>
              <li><Link to="/safety#emergency">Mountain Rescue Contacts</Link></li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-primary)', marginBottom: '0.9rem' }}>
              Transparency
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem', fontSize: '0.9rem' }}>
              <li><Link to="/credits">Photo &amp; Data Credits</Link></li>
              <li><Link to="/about">About &amp; Methodology</Link></li>
              <li><Link to="/contact">Report Trail Update</Link></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--ink-muted)',
          }}
        >
          <span>HIMAVAT — Indian Himalaya Field Guide. 100% Free &amp; Open Stack.</span>
          <span>Photos: Wikimedia Commons CC / Unsplash · Audio: Freesound CC0 · Fonts: SIL OFL 1.1</span>
        </div>
      </div>
    </footer>
  );
}
