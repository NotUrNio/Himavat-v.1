import { useEffect, useState } from 'react';
import { useQuality } from '../lib/qualityContext';

const SESSION_SEEN_KEY = 'himavat_loader_seen_v2';

export function CurtainLoader() {
  const { reducedMotion } = useQuality();
  const [done, setDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return sessionStorage.getItem(SESSION_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [altitude, setAltitude] = useState(0);

  const isDismissed = done || reducedMotion;

  useEffect(() => {
    if (isDismissed) return;

    let current = 0;
    const iv = window.setInterval(() => {
      current += Math.ceil((4000 - current) * 0.16) + 28;
      if (current >= 4000) {
        current = 4000;
        window.clearInterval(iv);
        window.setTimeout(() => {
          setDone(true);
          try {
            sessionStorage.setItem(SESSION_SEEN_KEY, '1');
          } catch {
            // Ignore storage restrictions
          }
        }, 140);
      }
      setAltitude(current);
    }, 28);

    const failsafe = window.setTimeout(() => {
      window.clearInterval(iv);
      setAltitude(4000);
      setDone(true);
      try {
        sessionStorage.setItem(SESSION_SEEN_KEY, '1');
      } catch {
        // Ignore storage restrictions
      }
    }, 1250);

    return () => {
      window.clearInterval(iv);
      window.clearTimeout(failsafe);
    };
  }, [isDismissed]);

  const dismiss = () => {
    setDone(true);
    try {
      sessionStorage.setItem(SESSION_SEEN_KEY, '1');
    } catch {
      // Ignore storage restrictions
    }
  };

  return (
    <div
      id="loader"
      className={`loader-curtain${isDismissed ? ' done' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={isDismissed}
      aria-label="Loading HIMAVAT Himalayan guide"
      onClick={dismiss}
    >
      <p className="micro">HIMAVAT — THE DESCENT</p>
      <svg viewBox="0 0 420 90" aria-hidden="true">
        <path d="M0 80 L60 20 L110 65 L170 10 L230 70 L290 25 L350 60 L420 15" />
      </svg>
      <div className="loader-alt" id="loaderAlt">
        {altitude.toLocaleString('en-IN')} m
      </div>
      <p className="micro" style={{ color: '#F2F1ED' }}>
        18 INDIAN HIMALAYA TREKS · TAP TO SKIP
      </p>
    </div>
  );
}
