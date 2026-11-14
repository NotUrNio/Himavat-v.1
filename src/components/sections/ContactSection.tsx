import { useState } from 'react';
import { ALL_TREKS } from '../../lib/treksData';

export function ContactSection() {
  const [topic, setTopic] = useState('Permit or Closure Update');
  const [trekName, setTrekName] = useState(ALL_TREKS[0].name);
  const [note, setNote] = useState('');

  const mailtoUrl = `mailto:corrections@himavat.guide?subject=${encodeURIComponent(
    `[HIMAVAT] ${topic} — ${trekName}`,
  )}&body=${encodeURIComponent(
    `Topic: ${topic}\nTrek: ${trekName}\n\nVerified detail / source URL:\n${note || '(Write updated fee, notice, or correction here)'}\n`,
  )}`;

  return (
    <div className="wrap">
      <p className="micro">CORRECTIONS &amp; TRAIL REPORTS</p>
      <h2>REPORT A CHANGE</h2>
      <p style={{ maxWidth: '680px', lineHeight: 1.7 }}>
        Forest checkpost tariffs, Roopkund reopening circulars, roadhead slip conditions, and operator price shifts happen every season. Send verified updates or source links below.
      </p>

      <div className="panel panel-filled" style={{ maxWidth: '680px', marginTop: '20px' }}>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label htmlFor="cTopic" className="micro" style={{ display: 'block' }}>
              UPDATE TYPE
            </label>
            <select
              id="cTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '2px solid currentColor', background: '#fff', color: '#0E1113' }}
            >
              <option>Permit or Closure Update</option>
              <option>Operator Tariff Correction</option>
              <option>Altitude / Waypoint Correction</option>
              <option>Photo or Audio Attribution Notice</option>
            </select>
          </div>

          <div>
            <label htmlFor="cTrek" className="micro" style={{ display: 'block' }}>
              ROUTE
            </label>
            <select
              id="cTrek"
              value={trekName}
              onChange={(e) => setTrekName(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '2px solid currentColor', background: '#fff', color: '#0E1113' }}
            >
              {ALL_TREKS.map((t) => (
                <option key={t.slug} value={t.name}>
                  {t.name} ({t.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cNote" className="micro" style={{ display: 'block' }}>
              DETAILS &amp; SOURCE LINK
            </label>
            <textarea
              id="cNote"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Chamoli DFO order date, updated permit tariff INR amount, or image citation note…"
              style={{ width: '100%', padding: '10px', border: '2px solid currentColor', background: '#fff', color: '#0E1113' }}
            />
          </div>

          <div>
            <a className="btn btn-solid" href={mailtoUrl}>
              <span>OPEN PRE-FILLED EMAIL →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
