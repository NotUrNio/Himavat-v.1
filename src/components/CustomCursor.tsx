import { useEffect, useRef } from 'react';
import { useQuality } from '../lib/qualityContext';

const LABELS = ['Explore', 'Inspect', 'Summit', 'Compare', 'Plan'];

export function CustomCursor() {
  const { tier, isTouch, reducedMotion } = useQuality();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const enabled = !isTouch && !reducedMotion && tier !== 'low';

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('has-custom-cursor');
      return;
    }

    document.body.classList.add('has-custom-cursor');
    let mouseX = -120;
    let mouseY = -120;
    let ringX = -120;
    let ringY = -120;
    let activeTarget: HTMLElement | null = null;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], [data-magnetic]');
      activeTarget = el ?? null;

      const label = el?.dataset.cursor || '';
      if (ringRef.current && labelRef.current) {
        if (label) {
          ringRef.current.classList.add('label-active');
          labelRef.current.textContent = LABELS.includes(label) ? label : label.slice(0, 10);
        } else {
          ringRef.current.classList.remove('label-active');
          labelRef.current.textContent = '';
        }
      }

      // Subtle magnetic shift on [data-magnetic] buttons
      if (el?.hasAttribute('data-magnetic')) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-10, Math.min(10, (e.clientX - cx) * 0.16));
        const dy = Math.max(-8, Math.min(8, (e.clientY - cy) * 0.16));
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    };

    const onLeave = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-magnetic]');
      if (target) {
        target.style.transform = '';
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        dotRef.current.style.opacity = activeTarget?.dataset.cursor ? '0' : '1';
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onLeave);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true">
        <span ref={labelRef} />
      </div>
    </>
  );
}
