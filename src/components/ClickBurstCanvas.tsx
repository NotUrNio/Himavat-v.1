import { useEffect, useRef } from 'react';
import { useQuality } from '../lib/qualityContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const PALETTE = ['#FF5A1F', '#FF8A5C', '#F2F1ED'];

export function ClickBurstCanvas() {
  const { tier, reducedMotion } = useQuality();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const runningRef = useRef(false);

  const enabled = tier !== 'low' && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let rafId = 0;
    const loop = () => {
      const list = particlesRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life -= 1;

        if (p.life <= 0) {
          list.splice(i, 1);
          continue;
        }

        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Crisp 4-point snow crystal / shard
        const s = p.size;
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x + s * 0.7, p.y);
        ctx.lineTo(p.x, p.y + s);
        ctx.lineTo(p.x - s * 0.7, p.y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (list.length > 0) {
        rafId = requestAnimationFrame(loop);
      } else {
        runningRef.current = false;
      }
    };

    const spawn = (e: PointerEvent) => {
      const count = tier === 'high' ? 9 : 5;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const speed = 1.6 + Math.random() * 2.5;
        const maxLife = 20 + Math.floor(Math.random() * 12);
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          life: maxLife,
          maxLife,
          size: 2.6 + Math.random() * 2.2,
          color: PALETTE[i % PALETTE.length],
        });
      }
      if (!runningRef.current) {
        runningRef.current = true;
        rafId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener('pointerdown', spawn, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointerdown', spawn);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
      runningRef.current = false;
    };
  }, [enabled, tier]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="click-fx-canvas" aria-hidden="true" />;
}
