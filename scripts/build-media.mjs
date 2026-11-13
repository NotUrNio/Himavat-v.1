import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const plan = JSON.parse(await fs.readFile('/tmp/master_media_plan.json', 'utf8'));
const OUT_ROOT = path.resolve('public/images');
await fs.mkdir(OUT_ROOT, { recursive: true });

const manifest = {};

for (const item of plan.images) {
  const slugDir = path.join(OUT_ROOT, item.slug);
  await fs.mkdir(slugDir, { recursive: true });

  const widths = item.slug === 'hero-dawn' ? [480, 960, 1920, 3840] : [480, 960, 1920];
  const img = sharp(item.rawPath).rotate();
  const meta = await img.metadata();
  const origW = meta.width || item.origWidth || 3840;
  const origH = meta.height || item.origHeight || 2160;
  const ratio = origH / origW;

  // Generate 24px wide inline WebP LQIP for instant zero-CLS paint
  const lqipBuf = await img
    .clone()
    .resize(24, Math.max(12, Math.round(24 * ratio)), { fit: 'cover' })
    .webp({ quality: 45 })
    .toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`;

  const generatedWidths = [];
  for (const w of widths) {
    const pipeline = img.clone().resize(w, Math.round(w * ratio), {
      fit: 'inside',
      withoutEnlargement: false,
    });
    const avifQ = w >= 1920 ? 48 : w >= 960 ? 43 : 45;
    await pipeline.clone().avif({ quality: avifQ, effort: 5 }).toFile(path.join(slugDir, `${w}.avif`));
    await pipeline.clone().webp({ quality: w >= 1920 ? 75 : 74 }).toFile(path.join(slugDir, `${w}.webp`));
    generatedWidths.push(w);
  }

  manifest[item.slug] = {
    slug: item.slug,
    widths: generatedWidths,
    width: Math.min(1920, origW),
    height: Math.round(Math.min(1920, origW) * ratio),
    aspectRatio: +(origW / origH).toFixed(4),
    lqip,
    location: item.location,
    photographer: item.photographer,
    license: item.license,
    sourceUrl: item.sourceUrl,
  };
  console.log(`Processed ${item.slug}: widths [${generatedWidths.join(', ')}]`);
}

await fs.mkdir(path.resolve('src/data'), { recursive: true });
await fs.writeFile(
  path.resolve('src/data/imageManifest.json'),
  JSON.stringify(manifest, null, 2),
);

const credits = {
  project: 'HIMAVAT — Indian Himalaya Scrollytelling Field Guide',
  lastUpdated: '2026-11-13',
  images: plan.images.map((im) => ({
    slug: im.slug,
    category: im.kind,
    title: im.title,
    location: im.location,
    photographer: im.photographer,
    license: im.license,
    licenseUrl: im.licenseUrl,
    sourceUrl: im.sourceUrl,
    sourcePlatform: im.sourcePlatform,
    masterResolution: `${im.origWidth}x${im.origHeight}`,
  })),
  audio: plan.audio,
  fonts: [
    {
      name: 'Montserrat (700, 900 Black)',
      license: 'SIL Open Font License 1.1',
      source: 'https://fontsource.org/fonts/montserrat',
    },
    {
      name: 'Cormorant Garamond (400i, 600i)',
      license: 'SIL Open Font License 1.1',
      source: 'https://fontsource.org/fonts/cormorant-garamond',
    },
    {
      name: 'DM Sans (400, 500, 700)',
      license: 'SIL Open Font License 1.1',
      source: 'https://fontsource.org/fonts/dm-sans',
    },
  ],
  libraries: [
    { name: 'React & React Router', license: 'MIT', purpose: 'Route-split UI architecture' },
    { name: 'Vite', license: 'MIT', purpose: 'Zero-cost bundler & optimizer' },
    { name: 'GSAP + ScrollTrigger', license: 'Standard GreenSock Free License', purpose: 'Scroll choreography & parallax pinning' },
    { name: 'Lenis', license: 'MIT', purpose: 'Desktop smooth scroll normalization' },
    { name: 'OGL', license: 'MIT', purpose: 'Lightweight ~10 KB WebGL waterfall & atmosphere shader' },
    { name: 'detect-gpu', license: 'MIT (self-hosted benchmarks)', purpose: 'Adaptive GPU tier hardware classification' },
    { name: 'lottie-web (lottie_light)', license: 'MIT', purpose: 'Lazy-loaded alpine compass animation' },
    { name: 'Lucide Icons', license: 'ISC', purpose: 'Crisp lightweight vector UI iconography' },
    { name: 'Sharp / libvips (build-time)', license: 'Apache 2.0', purpose: 'AVIF & WebP multi-width responsive encoding' },
  ],
};

await fs.writeFile(path.resolve('public/credits.json'), JSON.stringify(credits, null, 2));
await fs.writeFile(path.resolve('src/data/credits.json'), JSON.stringify(credits, null, 2));
console.log('Successfully generated imageManifest.json & public/credits.json!');
