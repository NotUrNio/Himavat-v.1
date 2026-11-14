import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuality } from '../lib/qualityContext';
import { TREK_META } from '../lib/treksData';

function heightAt(x: number, y: number, angle: number): number {
  return (
    Math.sin(x * 0.55 + angle) * 18 +
    Math.cos(y * 0.45 - angle) * 14 +
    Math.max(0, 26 - Math.hypot(x - 6, y - 4) * 4)
  );
}

export function Footer() {
  const { tier, gpuSummary, fps } = useQuality();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(0.6);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0D1114';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 13; x++) {
        const px = 210 + x * 62 - y * 34;
        const py = 148 + y * 20 - heightAt(x, y, angle);
        const px2 = 210 + (x + 1) * 62 - y * 34;
        const py2 = 148 + y * 20 - heightAt(x + 1, y, angle);
        const px3 = 210 + x * 62 - (y + 1) * 34;
        const py3 = 148 + (y + 1) * 20 - heightAt(x, y + 1, angle);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px2, py2);
        ctx.lineTo(px3, py3);
        ctx.closePath();

        const shade = Math.max(18, Math.round(60 - heightAt(x, y, angle)));
        ctx.fillStyle = `rgb(${shade + 18},${shade + 22},${shade + 22})`;
        ctx.fill();
        ctx.strokeStyle = '#23282C';
        ctx.stroke();
      }
    }

    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const gx = i * 0.9;
      const gy = i * 0.75;
      const px = 210 + gx * 62 - gy * 34;
      const py = 148 + gy * 20 - heightAt(gx, gy, angle) - 4;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#FF5A1F';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FF5A1F';
    ctx.font = '700 12px ui-monospace, Menlo, monospace';
    ctx.fillText(
      '▲ PROCEDURAL SUMMIT — NOT A REAL PEAK',
      210 + 6 * 62 - 4 * 34,
      148 + 4 * 20 - heightAt(6, 4, angle) - 22,
    );
  }, [angle]);

  const jumpOrNavigate = (sectionId: string, route: string) => {
    if (location.pathname === '/') {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.location.hash = '';
    if (route === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="wrap">
        <p className="micro">11 — THE LAST RIDGE · DRAG OR ARROW-KEY TO ORBIT TERRAIN</p>

        <canvas
          ref={canvasRef}
          id="terrain"
          width={1200}
          height={340}
          tabIndex={0}
          aria-label="Draggable procedural Himalayan isometric wireframe terrain — drag horizontally or use left and right arrows to rotate"
          onPointerDown={(e) => {
            draggingRef.current = true;
            lastXRef.current = e.clientX;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            const dx = e.clientX - lastXRef.current;
            lastXRef.current = e.clientX;
            setAngle((prev) => prev + dx * 0.008);
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
          onPointerCancel={() => {
            draggingRef.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              setAngle((prev) => prev + 0.14);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setAngle((prev) => prev - 0.14);
            }
          }}
        />

        <p className="mono" style={{ color: '#9BA097', margin: '10px 0 26px' }}>
          DRAG TO ORBIT · PROCEDURAL TERRAIN INSPIRED BY THE INDIAN HIMALAYA — NOT A SURVEYED DEM, NOT A REAL PEAK · ORANGE LINE = GENERIC ASCENT ROUTE
        </p>

        <h2 style={{ fontSize: 'clamp(3rem, 9.5vw, 8.6rem)' }}>
          GO DOWN.<br />
          <span style={{ color: 'var(--accent)' }}>COME BACK.</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
            marginTop: '34px',
          }}
        >
          <div>
            <p className="micro">EXPLORE</p>
            <p style={{ lineHeight: 1.9, margin: 0 }}>
              <Link to="/treks" onClick={() => jumpOrNavigate('treks', '/treks')}>All 18 Treks</Link>
              <br />
              <Link to="/planner" onClick={() => jumpOrNavigate('planner', '/planner')}>DIY Budget Planner</Link>
              <br />
              <Link to="/compare" onClick={() => jumpOrNavigate('compare', '/compare')}>Compare Matrix &amp; Chart</Link>
              <br />
              <Link to="/seasons" onClick={() => jumpOrNavigate('seasons', '/seasons')}>12-Month Seasons</Link>
            </p>
          </div>

          <div>
            <p className="micro">FIELD GUIDE</p>
            <p style={{ lineHeight: 1.9, margin: 0 }}>
              <Link to="/safety" onClick={() => jumpOrNavigate('safety', '/safety')}>WMS 2024 Safety &amp; Packing</Link>
              <br />
              <Link to="/about" onClick={() => jumpOrNavigate('about', '/about')}>About &amp; Methodology</Link>
              <br />
              <Link to="/credits" onClick={() => jumpOrNavigate('credits', '/credits')}>Photo &amp; Audio Credits</Link>
              <br />
              <Link to="/contact" onClick={() => jumpOrNavigate('contact', '/contact')}>Corrections &amp; Contact</Link>
            </p>
          </div>

          <div>
            <p className="micro">VERIFICATION</p>
            <p style={{ color: '#B9BDB2', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
              {TREK_META.priceDisclaimer} Verify local permits &amp; closures before paying.
            </p>
          </div>
        </div>

        <p className="mono" style={{ color: '#8E938B', marginTop: '28px' }}>
          © 2026 HIMAVAT — THE DESCENT · FREE &amp; AD-FREE · QUALITY TIER {tier.toUpperCase()} ({gpuSummary} · {fps} FPS)
        </p>
      </div>
    </footer>
  );
}
