import { useEffect, useRef } from 'react';
import { useQuality } from '../lib/qualityContext';

// Lightweight pure vector compass animation loaded dynamically via lottie_light
const COMPASS_LOTTIE = {
  v: '5.9.0',
  fr: 30,
  ip: 0,
  op: 120,
  w: 120,
  h: 120,
  nm: 'HimavatCompass',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Needle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [18] },
            { t: 40, s: [18], e: [-14] },
            { t: 85, s: [-14], e: [6] },
            { t: 120, s: [6] },
          ],
        },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'sh',
          ks: {
            a: 0,
            k: {
              c: true,
              v: [[0, -34], [7, 0], [0, -4], [-7, 0]],
              i: [[0, 0], [0, 0], [0, 0], [0, 0]],
              o: [[0, 0], [0, 0], [0, 0], [0, 0]],
            },
          },
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.875, 0.482, 0.259, 1] },
          o: { a: 0, k: 100 },
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'SouthNeedle',
      parent: 1,
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [0, 0, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'sh',
          ks: {
            a: 0,
            k: {
              c: true,
              v: [[0, 34], [6, 0], [0, 4], [-6, 0]],
              i: [[0, 0], [0, 0], [0, 0], [0, 0]],
              o: [[0, 0], [0, 0], [0, 0], [0, 0]],
            },
          },
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.349, 0.702, 0.769, 1] },
          o: { a: 0, k: 100 },
        },
      ],
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Bezel',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'el',
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [94, 94] },
        },
        {
          ty: 'st',
          c: { a: 0, k: [0.84, 0.9, 0.94, 0.45] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 2 },
        },
      ],
    },
  ],
};

export function LottieCompass({ size = 56, label = 'True North' }: { size?: number; label?: string }) {
  const { reducedMotion, tier } = useQuality();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || tier === 'low') return;
    const el = hostRef.current;
    if (!el) return;

    let anim: { destroy: () => void; pause: () => void; play: () => void } | null = null;
    let cancelled = false;

    const io = new IntersectionObserver(
      async (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && !anim && !cancelled) {
          const mod = await import('lottie-web/build/player/lottie_light');
          if (cancelled || !hostRef.current) return;
          const lottie = mod.default;
          anim = lottie.loadAnimation({
            container: hostRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: structuredClone(COMPASS_LOTTIE),
          });
        } else if (anim) {
          if (visible) anim.play();
          else anim.pause();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      anim?.destroy();
    };
  }, [reducedMotion, tier]);

  if (reducedMotion || tier === 'low') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        aria-label={label}
        style={{ flexShrink: 0 }}
      >
        <circle cx="60" cy="60" r="47" fill="none" stroke="rgba(215,229,239,0.45)" strokeWidth="2" />
        <polygon points="60,24 67,60 60,55 53,60" fill="#df7b42" />
        <polygon points="60,96 66,60 60,65 54,60" fill="#59b3c4" />
      </svg>
    );
  }

  return (
    <div
      ref={hostRef}
      style={{ width: size, height: size, flexShrink: 0 }}
      aria-label={label}
      role="img"
    />
  );
}
