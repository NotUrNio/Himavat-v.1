import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description: string;
  jsonLdId?: string;
  jsonLd?: Record<string, unknown> | null;
}

export function usePageSeo({ title, description, jsonLdId, jsonLd }: SeoOptions): void {
  useEffect(() => {
    document.title = title;

    let descTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.name = 'description';
      document.head.appendChild(descTag);
    }
    descTag.content = description;

    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;

    let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description;

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLdId && jsonLd) {
      scriptEl = document.getElementById(jsonLdId) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.id = jsonLdId;
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      if (jsonLdId) {
        document.getElementById(jsonLdId)?.remove();
      }
    };
  }, [title, description, jsonLdId, jsonLd]);
}
