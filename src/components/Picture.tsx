import type { CSSProperties } from 'react';
import manifestJson from '../data/imageManifest.json';
import { useQuality } from '../lib/qualityContext';
import type { ImageManifestEntry } from '../types/trek';

const MANIFEST = manifestJson as Record<string, ImageManifestEntry>;

interface PictureProps {
  slug: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  hero?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Picture({
  slug,
  alt,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  hero = false,
  className = '',
  style,
}: PictureProps) {
  const { canServe4kHero } = useQuality();
  const entry = MANIFEST[slug];
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  if (!entry) {
    return (
      <div
        className={className}
        style={{ background: '#121c25', aspectRatio: '16 / 10', ...style }}
        role="img"
        aria-label={alt}
      />
    );
  }

  // Strictly serve 3840 only on high-tier large displays for the Hero photo
  const allowedWidths =
    hero && canServe4kHero
      ? entry.widths
      : entry.widths.filter((w) => w <= 1920);

  const avifSrcSet = allowedWidths
    .map((w) => `${base}/images/${slug}/${w}.avif ${w}w`)
    .join(', ');
  const webpSrcSet = allowedWidths
    .map((w) => `${base}/images/${slug}/${w}.webp ${w}w`)
    .join(', ');

  const defaultSrc = `${base}/images/${slug}/${priority ? 1920 : 960}.webp`;

  return (
    <picture
      className={className}
      style={{
        backgroundImage: `url("${entry.lqip}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
    >
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={defaultSrc}
        width={entry.width}
        height={entry.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </picture>
  );
}
