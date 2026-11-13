import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QualityContext, type QualityContextValue, type QualityTier } from './qualityContext';

function detectInitialEnvironment(): {
  baseTier: QualityTier;
  isTouch: boolean;
  reducedMotion: boolean;
  saveData: boolean;
} {
  if (typeof window === 'undefined') {
    return { baseTier: 'medium', isTouch: false, reducedMotion: false, saveData: false };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches ||
    (navigator.maxTouchPoints ?? 0) > 0;

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const saveData = Boolean(conn?.saveData) || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const width = window.innerWidth || 1280;

  if (reducedMotion || saveData || cores <= 2 || memory <= 2) {
    return { baseTier: 'low', isTouch, reducedMotion, saveData };
  }

  if (isTouch || width < 768 || cores <= 4 || memory <= 4) {
    return { baseTier: 'medium', isTouch, reducedMotion, saveData };
  }

  return { baseTier: 'high', isTouch, reducedMotion, saveData };
}

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => detectInitialEnvironment(), []);
  const [detectedTier, setDetectedTier] = useState<QualityTier>(initial.baseTier);
  const [overrideTier, setOverrideTier] = useState<QualityTier | 'auto'>(() => {
    try {
      const saved = localStorage.getItem('himavat_quality_override');
      if (saved === 'high' || saved === 'medium' || saved === 'low' || saved === 'auto') {
        return saved;
      }
    } catch {
      // Ignore storage access restrictions
    }
    return 'auto';
  });
  const [fps, setFps] = useState<number>(60);
  const [gpuSummary, setGpuSummary] = useState<string>('Checking GPU tier...');
  const lowFpsStreaks = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem('himavat_quality_override', overrideTier);
    } catch {
      // ignore
    }
  }, [overrideTier]);

  useEffect(() => {
    let active = true;
    const base = import.meta.env.BASE_URL || '/';
    const benchmarksURL = `${base.replace(/\/$/, '')}/gpu-benchmarks`;

    const runGpuCheck = async () => {
      try {
        const { getGPUTier } = await import('detect-gpu');
        const res = await getGPUTier({ benchmarksURL });
        if (!active) return;
        const label = res.gpu ? `${res.gpu} (Tier ${res.tier})` : `Software / Tier ${res.tier}`;
        setGpuSummary(label);

        if (initial.reducedMotion || initial.saveData) {
          setDetectedTier('low');
          return;
        }
        setDetectedTier((prev) => {
          if (res.tier <= 1) return 'low';
          if (res.tier === 2 && prev === 'high') return 'medium';
          return prev;
        });
      } catch {
        if (active) setGpuSummary('Conservative fallback');
      }
    };

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    let timerId = 0;
    if (ric) {
      timerId = ric(() => void runGpuCheck(), { timeout: 1200 });
    } else {
      timerId = window.setTimeout(() => void runGpuCheck(), 250);
    }

    return () => {
      active = false;
      if (ric && (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(timerId);
      } else {
        clearTimeout(timerId);
      }
    };
  }, [initial.reducedMotion, initial.saveData]);

  const activeTier: QualityTier = overrideTier === 'auto' ? detectedTier : overrideTier;

  useEffect(() => {
    if (overrideTier !== 'auto' || activeTier === 'low' || initial.reducedMotion) return;

    let rafId = 0;
    let frames = 0;
    let windowStart = performance.now();

    const sample = (now: number) => {
      if (document.visibilityState !== 'hidden') {
        frames += 1;
        const elapsed = now - windowStart;
        if (elapsed >= 1800) {
          const measuredFps = Math.round((frames * 1000) / elapsed);
          setFps(measuredFps);
          frames = 0;
          windowStart = now;

          if (measuredFps < 45) {
            lowFpsStreaks.current += 1;
            if (lowFpsStreaks.current >= 2) {
              lowFpsStreaks.current = 0;
              setDetectedTier((prev) => (prev === 'high' ? 'medium' : 'low'));
            }
          } else {
            lowFpsStreaks.current = 0;
          }
        }
      } else {
        frames = 0;
        windowStart = now;
      }
      rafId = requestAnimationFrame(sample);
    };

    rafId = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(rafId);
  }, [activeTier, overrideTier, initial.reducedMotion]);

  const value = useMemo<QualityContextValue>(() => {
    const canServe4kHero =
      typeof window !== 'undefined' &&
      activeTier === 'high' &&
      !initial.saveData &&
      window.innerWidth >= 1440;

    return {
      tier: activeTier,
      detectedTier,
      overrideTier,
      setOverrideTier,
      isTouch: initial.isTouch,
      reducedMotion: initial.reducedMotion,
      saveData: initial.saveData,
      fps,
      gpuSummary,
      webglAllowed: activeTier !== 'low' && !initial.reducedMotion && !initial.saveData,
      canServe4kHero,
    };
  }, [activeTier, detectedTier, overrideTier, initial, fps, gpuSummary]);

  return <QualityContext.Provider value={value}>{children}</QualityContext.Provider>;
}
