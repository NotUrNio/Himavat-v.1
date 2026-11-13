import { createContext, useContext } from 'react';
import type React from 'react';

export interface CompareContextValue {
  compareSlugs: string[];
  toggleCompare: (slug: string) => void;
  setCompareSlugs: React.Dispatch<React.SetStateAction<string[]>>;
  isSelected: (slug: string) => boolean;
}

export const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
}
