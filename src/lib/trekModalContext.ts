import { createContext, useContext } from 'react';
import type { TrekRecord } from '../types/trek';

export interface TrekModalContextValue {
  activeTrek: TrekRecord | null;
  openTrekSheet: (trek: TrekRecord) => void;
  openTrekBySlug: (slug: string) => void;
  closeTrekSheet: () => void;
}

export const TrekModalContext = createContext<TrekModalContextValue | null>(null);

export function useTrekModal(): TrekModalContextValue {
  const ctx = useContext(TrekModalContext);
  if (!ctx) {
    throw new Error('useTrekModal must be used inside TrekModalProvider');
  }
  return ctx;
}
