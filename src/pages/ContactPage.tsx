import { useState } from 'react';
import { Mail, CheckCircle2, ExternalLink } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [trail, setTrail] = useState('Kedarkantha Peak');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  usePageSeo({
    title: 'Report a Trail Update or Contact | HIMAVAT',
    description:
      'Submit trailhead bus tariff changes, checkpost closure notices, or corrections to keep HIMAVAT independent field logs accurate.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: '880px', display: 'grid', gap: '2rem' }}>
        <header>
          <span className="eyebrow-coord">
            <Mail size={14} aria-hidden="true" />
            FIELD DISPATCH &amp; DATA CORRECTIONS
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', marginTop: '0.5rem' }}>
            Send a Trail Condition Update
          </h1>
          <p style={{ color: 'var(--ink-secondary)' }}>
            Spotted a shared jeep tariff change at Sankri or Lohajung, or a newly opened Forest checkpost? Log field updates below or open an issue directly on GitHub.
          </p>
        </header>

        <section className="surface-panel">
          {submitted ? (
            <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--accent-forest)', marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.5rem' }}>Field Dispatch Formatted</h2>
              <p style={{ color: 'var(--ink-secondary)', maxWidth: '48ch', margin: '0.5rem auto 1.25rem' }}>
                Thank you{name ? `, ${name}` : ''}. Because HIMAVAT runs 100% serverlessly with zero paid backend databases, you can copy or submit this update directly on GitHub Issues with zero tracking cookies.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`https://github.com/NotUrNio/himavat/issues/new?title=${encodeURIComponent(`Trail Update: ${trail}`)}&body=${encodeURIComponent(note)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Open Pre-Filled GitHub Issue <ExternalLink size={15} />
                </a>
                <button type="button" className="btn btn-secondary" onClick={() => { setSubmitted(false); setNote(''); }}>
                  Write Another Dispatch
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
              <div className="field-group">
                <label htmlFor="c-name" className="field-label">Your Name / Callsign (Optional)</label>
                <input id="c-name" type="text" className="field-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav / Mumbai Hiker" />
              </div>
              <div className="field-group">
                <label htmlFor="c-trail" className="field-label">Related Trail Corridor</label>
                <input id="c-trail" type="text" className="field-control" value={trail} onChange={(e) => setTrail(e.target.value)} required />
              </div>
              <div className="field-group">
                <label htmlFor="c-note" className="field-label">Observed Tariff, Permit or Trail Closure Update</label>
                <textarea id="c-note" rows={5} className="field-control" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shared Sumo fare Dehradun -> Sankri, gate opening time, fresh snow level..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>
                Prepare Zero-Backend Field Report
              </button>
            </form>
          )}
        </section>

        <section className="surface-panel">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Official Permit &amp; Tourism Desks</h2>
          <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'grid', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
            <li>Uttarakhand Single Window Forest Portal: <a href="https://www.ukfdonline.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)' }}>ukfdonline.com</a></li>
            <li>Sikkim RAP/PAP Official Desk: <a href="https://sikkimtourism.gov.in/pap" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)' }}>sikkimtourism.gov.in/pap</a></li>
            <li>Youth Hostels Association of India (YHAI): <a href="https://www.yhaindia.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-glacier)' }}>yhaindia.org</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
