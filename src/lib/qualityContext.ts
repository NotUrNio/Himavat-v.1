import { createContext, useContext } from 'react';

export type QualityTier = 'high' | 'medium' | 'low';

export interface QualityContextValue {
  tier: QualityTier;
  detectedTier: QualityTier;
  overrideTier: QualityTier | 'auto';
  setOverrideTier: (t: QualityTier | 'auto') => void;
  isTouch: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  fps: number;
  gpuSummary: string;
  webglAllowed: boolean;
  canServe4kHero: boolean;
}

export const QualityContext = createContext<QualityContextValue | null>(null);

export function useQuality(): QualityContextValue {
  const ctx = useContext(QualityContext);
  if (!ctx) {
    throw new Error('useQuality must be used within QualityProvider');
  }
  return ctx;
}
