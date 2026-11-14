import { ALL_TREKS, TREK_META } from '../../lib/treksData';
import { useQuality } from '../../lib/qualityContext';
import creditsData from '../../data/credits.json';

export function AboutSection() {
  const { tier, detectedTier, fps, gpuSummary } = useQuality();
  const highestTrek = ALL_TREKS.reduce(
    (max, t) => (t.altitudeM > max.altitudeM ? t : max),
    ALL_TREKS[0],
  );

  return (
    <div className="wrap">
      <p className="micro">09 — ABOUT &amp; TRANSPARENCY</p>
      <h2>
        FREE. VERIFIED.<br />
        <span className="thin">INDIAN HIMALAYA ONLY.</span>
      </h2>

      <p style={{ maxWidth: '780px', lineHeight: 1.75, fontSize: '1.02rem' }}>
        <strong>HIMAVAT — The Descent</strong> merges high-contrast editorial cartography with real Indian Himalaya trail data. Every itinerary, elevation profile, forest permit rule, and closure advisory across all <strong>18 verified treks</strong> is cross-referenced from YHAI, Indiahikes, Bikat Adventures, Trek The Himalayas, TrekBaba, Sikkim Tourism, Uttarakhand Forest Department, and Wilderness Medical Society 2024 guidelines (checked {TREK_META.lastChecked}).
      </p>

      <p style={{ maxWidth: '780px', lineHeight: 1.75 }}>
        Honest disclosure: All <strong>{creditsData.images.length} photographs</strong> are verified Indian Himalaya locations (zero Nepal, Alps, or Switzerland substitutes). The WebGL waterfall descent uses an OGL fragment shader paired with a live FPS governor powered by <strong>detect-gpu</strong> benchmarks (currently <strong>{tier.toUpperCase()}</strong> · detected {detectedTier.toUpperCase()} · {gpuSummary} · {fps} FPS). The footer terrain mesh is a procedural isometric ridge inspired by the Himalaya — <strong>not</strong> a surveyed DEM and not a specific mountain peak.
      </p>

      <div className="stat-tiles" style={{ marginTop: '26px' }}>
        <div>
          <b>{ALL_TREKS.length}</b>
          <span className="mono">VERIFIED TREKS</span>
        </div>
        <div>
          <b>{creditsData.images.length}</b>
          <span className="mono">CURATED PHOTO SETS</span>
        </div>
        <div>
          <b>{highestTrek.altitudeM.toLocaleString('en-IN')} m</b>
          <span className="mono">HIGHEST · {highestTrek.name.toUpperCase()}</span>
        </div>
        <div>
          <b>₹0</b>
          <span className="mono">FREE &amp; AD-FREE</span>
        </div>
      </div>
    </div>
  );
}
