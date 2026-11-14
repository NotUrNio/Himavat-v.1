import { useId, useMemo, useState } from 'react';
import type { ElevationWaypoint, TrekRecord } from '../types/trek';

interface SingleProps {
  mode?: 'single';
  points: ElevationWaypoint[];
  trekName: string;
  accentColor?: string;
}

interface CompareSeries {
  trek: TrekRecord;
  color: string;
}

interface CompareProps {
  mode: 'compare';
  series: CompareSeries[];
}

type ElevationChartProps = SingleProps | CompareProps;

export function ElevationChart(props: ElevationChartProps) {
  const uid = useId().replace(/:/g, '');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 680;
  const height = 250;
  const padL = 54;
  const padR = 24;
  const padT = 26;
  const padB = 38;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const singleData = useMemo(() => {
    if (props.mode === 'compare') return null;
    const pts = props.points;
    if (!pts.length) return null;

    const minAlt = Math.max(0, Math.floor((Math.min(...pts.map((p) => p.altitudeM)) - 150) / 250) * 250);
    const maxAlt = Math.ceil((Math.max(...pts.map((p) => p.altitudeM)) + 150) / 250) * 250;
    const altSpan = Math.max(500, maxAlt - minAlt);

    const coords = pts.map((p, idx) => {
      const x = padL + (pts.length === 1 ? plotW / 2 : (idx / (pts.length - 1)) * plotW);
      const y = padT + (1 - (p.altitudeM - minAlt) / altSpan) * plotH;
      return { ...p, x, y, idx };
    });

    const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const areaD = `${lineD} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

    const ticks = [0, 0.5, 1].map((t) => ({
      alt: Math.round(minAlt + altSpan * t),
      y: padT + (1 - t) * plotH,
    }));

    return { coords, lineD, areaD, ticks };
  }, [props, plotW, plotH, padL, padT]);

  const compareData = useMemo(() => {
    if (props.mode !== 'compare') return null;
    const allPts = props.series.flatMap((s) => s.trek.elevationProfile.map((p) => p.altitudeM));
    if (!allPts.length) return null;

    const minAlt = Math.max(0, Math.floor((Math.min(...allPts) - 150) / 250) * 250);
    const maxAlt = Math.ceil((Math.max(...allPts) + 150) / 250) * 250;
    const altSpan = Math.max(750, maxAlt - minAlt);

    const paths = props.series.map(({ trek, color }) => {
      const pts = trek.elevationProfile;
      const coords = pts.map((p, idx) => {
        const x = padL + (pts.length === 1 ? plotW / 2 : (idx / (pts.length - 1)) * plotW);
        const y = padT + (1 - (p.altitudeM - minAlt) / altSpan) * plotH;
        return { ...p, x, y };
      });
      const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
      return { trek, color, coords, lineD };
    });

    const ticks = [0, 0.33, 0.66, 1].map((t) => ({
      alt: Math.round(minAlt + altSpan * t),
      y: padT + (1 - t) * plotH,
    }));

    return { paths, ticks };
  }, [props, plotW, plotH, padL, padT]);

  if (props.mode === 'compare' && compareData) {
    return (
      <figure style={{ margin: 0 }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Normalized elevation profile comparison across selected treks"
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {compareData.ticks.map((t) => (
            <g key={t.alt}>
              <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="rgba(215,229,239,0.12)" strokeDasharray="3 4" />
              <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#8a99a8">
                {t.alt.toLocaleString('en-IN')}m
              </text>
            </g>
          ))}

          {compareData.paths.map((item) => (
            <g key={item.trek.slug}>
              <path
                d={item.lineD}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {item.coords.map((c, idx) => (
                <circle key={`${item.trek.slug}-${idx}`} cx={c.x} cy={c.y} r="3.8" fill={item.color} stroke="#0b1117" strokeWidth="1.5">
                  <title>{`${item.trek.name} — Day ${c.day}: ${c.camp} (${c.altitudeM} m)`}</title>
                </circle>
              ))}
            </g>
          ))}

          <text x={padL} y={height - 10} fontSize="11" fill="#8a99a8">Trail Start (0%)</text>
          <text x={padL + plotW / 2} y={height - 10} textAnchor="middle" fontSize="11" fill="#8a99a8">Mid-Trek Progress (50%)</text>
          <text x={width - padR} y={height - 10} textAnchor="end" fontSize="11" fill="#8a99a8">Route Finish (100%)</text>
        </svg>
        <figcaption style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginTop: '0.75rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {compareData.paths.map((p) => (
            <span key={p.trek.slug} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 99, background: p.color, display: 'inline-block' }} />
              {p.trek.name} (Max {p.trek.altitudeM.toLocaleString('en-IN')} m)
            </span>
          ))}
        </figcaption>
      </figure>
    );
  }

  if (!singleData) return null;
  const accent = props.mode === 'compare' ? '#59b3c4' : (props.accentColor || '#59b3c4');
  const hovered = hoverIdx !== null ? singleData.coords[hoverIdx] : null;

  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Daily elevation profile for ${props.mode !== 'compare' ? props.trekName : 'Trek'}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.38" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {singleData.ticks.map((t) => (
          <g key={t.alt}>
            <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="rgba(215,229,239,0.12)" strokeDasharray="3 4" />
            <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#8a99a8">
              {t.alt.toLocaleString('en-IN')}m
            </text>
          </g>
        ))}

        <path d={singleData.areaD} fill={`url(#grad-${uid})`} />
        <path
          d={singleData.lineD}
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {singleData.coords.map((c) => {
          const isHot = hoverIdx === c.idx;
          return (
            <g
              key={c.day}
              onMouseEnter={() => setHoverIdx(c.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              onFocus={() => setHoverIdx(c.idx)}
              onClick={() => setHoverIdx((prev) => (prev === c.idx ? null : c.idx))}
              tabIndex={0}
              style={{ cursor: 'pointer', outline: 'none' }}
              aria-label={`Day ${c.day}: ${c.camp}, ${c.altitudeM} meters`}
            >
              <circle cx={c.x} cy={c.y} r="14" fill="transparent" />
              <circle
                cx={c.x}
                cy={c.y}
                r={isHot ? 6.5 : 4.5}
                fill={isHot ? '#df7b42' : accent}
                stroke="#0b1117"
                strokeWidth="2"
              />
              <text x={c.x} y={height - 12} textAnchor="middle" fontSize="11" fill={isHot ? '#f2f5f7' : '#8a99a8'}>
                D{c.day}
              </text>
            </g>
          );
        })}

        {hovered && (
          <g transform={`translate(${Math.min(width - 185, Math.max(padL, hovered.x - 80))}, ${Math.max(8, hovered.y - 48)})`}>
            <rect width="176" height="36" rx="6" fill="#0d151d" stroke="rgba(215,229,239,0.28)" />
            <text x="10" y="16" fontSize="11" fontWeight="700" fill="#f2f5f7">
              {`Day ${hovered.day}: ${hovered.altitudeM.toLocaleString('en-IN')} m`}
            </text>
            <text x="10" y="30" fontSize="10" fill="#b9c5cf">
              {hovered.camp.length > 26 ? `${hovered.camp.slice(0, 24)}…` : hovered.camp}
            </text>
          </g>
        )}
      </svg>
    </figure>
  );
}
