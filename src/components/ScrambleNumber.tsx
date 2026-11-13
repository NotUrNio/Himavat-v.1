import { useEffect, useRef, useState } from 'react';
import { useQuality } from '../lib/qualityContext';

const CHARS = '0123456789';

interface ScrambleNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  formatIndian?: boolean;
  className?: string;
}

function formatNum(n: number, indian: boolean): string {
  return indian ? n.toLocaleString('en-IN') : String(n);
}

export function ScrambleNumber({
  value,
  prefix = '',
  suffix = '',
  formatIndian = true,
  className = '',
}: ScrambleNumberProps) {
  const { reducedMotion, tier } = useQuality();
  const finalText = `${prefix}${formatNum(value, formatIndian)}${suffix}`;
  const isDisabled = reducedMotion || tier === 'low';
  const [display, setDisplay] = useState<string>(finalText);
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (isDisabled) return;

    const el = ref.current;
    if (!el) return;

    const targetDigits = formatNum(value, formatIndian);

    const runScramble = () => {
      if (animatedRef.current) return;
      animatedRef.current = true;

      const totalSteps = 14;
      let step = 0;

      const timer = window.setInterval(() => {
        step += 1;
        const lockedChars = Math.floor((step / totalSteps) * targetDigits.length);
        let next = '';
        for (let i = 0; i < targetDigits.length; i++) {
          const ch = targetDigits[i];
          if (i < lockedChars || ch === ',' || ch === '.') {
            next += ch;
          } else {
            next += CHARS[(i * 7 + step * 3) % CHARS.length];
          }
        }
        setDisplay(`${prefix}${next}${suffix}`);
        if (step >= totalSteps) {
          window.clearInterval(timer);
          setDisplay(`${prefix}${targetDigits}${suffix}`);
        }
      }, 32);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          runScramble();
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    return () => io.disconnect();
  }, [value, prefix, suffix, formatIndian, isDisabled]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {isDisabled ? finalText : display}
    </span>
  );
}
