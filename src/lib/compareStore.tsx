import React, { useEffect, useState } from 'react';
import { CompareContext } from './compareContext';

const DEFAULT_SLUGS = ['kedarkantha', 'hampta-pass', 'goecha-la'];
const STORAGE_KEY = 'himavat_compare_slugs';

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareSlugs, setCompareSlugs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 3) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SLUGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareSlugs));
    } catch {
      // ignore
    }
  }, [compareSlugs]);

  const toggleCompare = (slug: string) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), slug];
      }
      return [...prev, slug];
    });
  };

  const isSelected = (slug: string) => compareSlugs.includes(slug);

  return (
    <CompareContext.Provider value={{ compareSlugs, toggleCompare, setCompareSlugs, isSelected }}>
      {children}
    </CompareContext.Provider>
  );
}
