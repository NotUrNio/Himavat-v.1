import { useEffect, useRef } from 'react';
import { DescentCanvas } from '../DescentCanvas';
import { Picture } from '../Picture';

export function DescentSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0.2);
  const velocityRef = useRef(0);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const el = sectionRef.current;
      const nowY = window.scrollY;
      velocityRef.current = Math.min(80, Math.abs(nowY - lastScroll));
      lastScroll = nowY;

      if (el) {
        const rect = el.getBoundingClientRect();
        const span = window.innerHeight + rect.height;
        const p = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, span)));
        progressRef.current = p;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jumpToTreks = () => {
    const target = document.getElementById('treks');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="descent" ref={sectionRef} className="dark">
      <div className="bgimg" aria-hidden="true">
        <Picture
          slug="stage-waterfall"
          alt="Cascade waterfall in the Himalaya, Dharamshala sector"
          sizes="100vw"
          className="pic-cover"
        />
      </div>

      <div className="descent-canvas-layer" aria-hidden="true">
        <DescentCanvas progressRef={progressRef} velocityRef={velocityRef} />
      </div>

      <div className="mist" aria-hidden="true" />

      <div className="inner wrap">
        <p className="micro">02 — THE DESCENT · WEBGL ATMOSPHERE</p>
        <h2>
          SUMMIT →<br />
          GLACIER →<br />
          <span style={{ color: 'var(--accent)' }}>WATERFALL →</span><br />
          VALLEY →<br />
          BASE CAMP
        </h2>
        <p style={{ maxWidth: '560px', lineHeight: 1.72, color: '#F2F1ED' }}>
          Scroll faster and the OGL WebGL glacial spray and atmospheric veil intensify across the frame. The orange river along the right edge tracks your exact elevation drop from 5,319 m to camp — toggle ambient wind &amp; water sound in the bar above.
        </p>
        <p style={{ marginBottom: 0 }}>
          <button type="button" className="btn btn-solid" onClick={jumpToTreks}>
            <span>SEE ALL 18 TREKS ↓</span>
          </button>
        </p>
      </div>
    </section>
  );
}
