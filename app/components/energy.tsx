"use client";

import { EnergyKey, energy } from "../page";

export type EnergyScores = { driver: number; energizer: number; supporter: number; analyst: number };

const ENERGIES: EnergyKey[] = ["driver", "energizer", "supporter", "analyst"];

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const a0 = toRad(startDeg);
  const a1 = toRad(endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const x0 = cx + rOuter * Math.cos(a0);
  const y0 = cy + rOuter * Math.sin(a0);
  const x1 = cx + rOuter * Math.cos(a1);
  const y1 = cy + rOuter * Math.sin(a1);
  const x2 = cx + rInner * Math.cos(a1);
  const y2 = cy + rInner * Math.sin(a1);
  const x3 = cx + rInner * Math.cos(a0);
  const y3 = cy + rInner * Math.sin(a0);
  return `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${rInner} ${rInner} 0 ${large} 0 ${x3} ${y3} Z`;
}

export function EnergyRing({
  scores,
  position,
  primary,
  size = 280,
}: {
  scores: EnergyScores;
  position: string;
  primary: EnergyKey;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 40;
  const rInner = rOuter - 22;

  const total = ENERGIES.reduce((a, k) => a + Math.max(0, scores[k]), 0) || 1;

  let cursor = 0;
  const segments = ENERGIES.map((k) => {
    const value = Math.max(0, scores[k]);
    const sweep = (value / total) * 360;
    const seg = { k, start: cursor, end: cursor + sweep, value };
    cursor += sweep;
    return seg;
  });

  const labelAngles = [0, 90, 180, 270];
  const labels: { k: EnergyKey; angle: number }[] = [
    { k: "driver", angle: 45 },
    { k: "energizer", angle: 135 },
    { k: "supporter", angle: 225 },
    { k: "analyst", angle: 315 },
  ];

  const primaryColour = energy[primary];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Energy mix ring"
      style={{ overflow: "visible" }}
    >
      <circle cx={cx} cy={cy} r={rOuter} fill="#F7F7FA" />

      {segments.map((s) =>
        s.value > 0 ? (
          <path
            key={s.k}
            d={arcPath(cx, cy, rOuter, rInner, s.start, s.end)}
            fill={energy[s.k].color}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        ) : null,
      )}

      {labelAngles.map((deg, i) => {
        const a = ((deg - 90) * Math.PI) / 180;
        const tickInner = rInner - 6;
        const tickOuter = rInner - 2;
        return (
          <line
            key={i}
            x1={cx + tickInner * Math.cos(a)}
            y1={cy + tickInner * Math.sin(a)}
            x2={cx + tickOuter * Math.cos(a)}
            y2={cy + tickOuter * Math.sin(a)}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />
        );
      })}

      <circle cx={cx} cy={cy} r={rInner - 8} fill="#FFFFFF" />

      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        style={{
          fontSize: 11,
          fill: "#6E7090",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}
      >
        Position
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        style={{
          fontSize: 16,
          fill: primaryColour.text,
          fontWeight: 700,
          letterSpacing: "-0.2px",
        }}
      >
        {position}
      </text>

      {labels.map(({ k, angle }) => {
        const a = ((angle - 90) * Math.PI) / 180;
        const lr = rOuter + 18;
        const lx = cx + lr * Math.cos(a);
        const ly = cy + lr * Math.sin(a);
        const isRight = Math.cos(a) > 0;
        const anchor: "start" | "end" = isRight ? "start" : "end";
        return (
          <g key={k}>
            <text
              x={lx}
              y={ly - 1}
              textAnchor={anchor}
              style={{
                fontSize: 10,
                fill: energy[k].text,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {energy[k].label}
            </text>
            <text
              x={lx}
              y={ly + 13}
              textAnchor={anchor}
              style={{
                fontSize: 11,
                fill: energy[k].text,
                fontWeight: 600,
              }}
            >
              {scores[k]}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const SPIDER_AXES: {
  name: string;
  fn: (s: EnergyScores) => number;
}[] = [
  { name: "Pace",        fn: (s) => s.driver * 0.7 + s.energizer * 0.3 },
  { name: "Decisiveness",fn: (s) => s.driver * 0.8 + s.analyst * 0.2 },
  { name: "Rigour",      fn: (s) => s.analyst * 0.85 + s.driver * 0.15 },
  { name: "Listening",   fn: (s) => s.supporter * 0.6 + s.analyst * 0.4 },
  { name: "Steadiness",  fn: (s) => s.supporter * 0.75 + s.analyst * 0.25 },
  { name: "Empathy",     fn: (s) => s.supporter * 0.7 + s.energizer * 0.3 },
  { name: "Sociability", fn: (s) => s.energizer * 0.8 + s.driver * 0.2 },
  { name: "Curiosity",   fn: (s) => s.energizer * 0.55 + s.analyst * 0.45 },
];

export function spiderValues(scores: EnergyScores): { name: string; value: number }[] {
  return SPIDER_AXES.map(({ name, fn }) => ({
    name,
    value: Math.max(0, Math.min(100, Math.round(fn(scores)))),
  }));
}

export function EnergySpider({
  scores,
  primary,
  size = 360,
}: {
  scores: EnergyScores;
  primary: EnergyKey;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 56;
  const values = spiderValues(scores);
  const n = values.length;

  const point = (i: number, magnitude: number) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(angle) * r * (magnitude / 100), cy + Math.sin(angle) * r * (magnitude / 100)];
  };

  const ringLevels = [25, 50, 75, 100];

  const polyPoints = values.map((v, i) => point(i, v.value).join(",")).join(" ");

  const primaryColour = energy[primary];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Engagement spider chart"
      style={{ overflow: "visible" }}
    >
      {ringLevels.map((level) => {
        const pts = Array.from({ length: n }, (_, i) => point(i, level).join(","))
          .join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={1}
          />
        );
      })}

      {Array.from({ length: n }, (_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={polyPoints}
        fill={primaryColour.color}
        fillOpacity={0.18}
        stroke={primaryColour.color}
        strokeWidth={1.5}
      />

      {values.map((v, i) => {
        const [x, y] = point(i, v.value);
        return (
          <circle
            key={v.name}
            cx={x}
            cy={y}
            r={3.5}
            fill={primaryColour.color}
            stroke="#FFFFFF"
            strokeWidth={1.5}
          />
        );
      })}

      {values.map((v, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (r + 22);
        const ly = cy + Math.sin(angle) * (r + 22);
        const anchor =
          Math.abs(Math.cos(angle)) < 0.3 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
        return (
          <g key={`label-${v.name}`}>
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              style={{
                fontSize: 11,
                fill: "#0E0F26",
                fontWeight: 600,
              }}
            >
              {v.name}
            </text>
            <text
              x={lx}
              y={ly + 13}
              textAnchor={anchor}
              dominantBaseline="middle"
              style={{
                fontSize: 10,
                fill: "#6E7090",
                fontWeight: 500,
              }}
            >
              {v.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const FOCUS_WORD: Record<EnergyKey, string> = {
  driver: "Action",
  energizer: "People",
  supporter: "Harmony",
  analyst: "Process",
};

/**
 * Four energy bars growing up from the baseline, with a line across the middle.
 * Energy above the line leads (shown solid); energy below it sits in reserve
 * (shown lighter). The line sits at BALANCE_MIDLINE.
 */
export function EnergyDynamics({
  scores,
  height = 270,
}: {
  scores: EnergyScores;
  height?: number;
}) {
  const gutter = 74;
  const barWidth = 62;
  const gap = 20;
  const width = gutter + ENERGIES.length * barWidth + (ENERGIES.length - 1) * gap;
  const padTop = 22;
  const padBottom = 40;
  const plotHeight = height - padTop - padBottom;
  const baseline = padTop + plotHeight;
  const yFor = (v: number) => padTop + plotHeight * (1 - Math.max(0, Math.min(100, v)) / 100);
  const mid = yFor(BALANCE_MIDLINE);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Energy bars with leading and reserve line"
      style={{ overflow: "visible" }}
    >
      <rect x={gutter - 8} y={mid} width={width - gutter + 16} height={baseline - mid} fill="#F7F7FA" rx={6} />

      {[25, 75].map((v) => (
        <line
          key={v}
          x1={gutter - 8}
          x2={width + 8}
          y1={yFor(v)}
          y2={yFor(v)}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={1}
        />
      ))}

      {ENERGIES.map((k, i) => {
        const value = Math.max(0, Math.min(100, scores[k]));
        const x = gutter + i * (barWidth + gap);
        const top = yFor(value);
        const lowerTop = Math.max(mid, top);
        return (
          <g key={k}>
            <rect x={x} y={top} width={barWidth} height={baseline - top} fill={energy[k].color} rx={4} ry={4} />
            {baseline > lowerTop && (
              <rect
                x={x}
                y={lowerTop}
                width={barWidth}
                height={baseline - lowerTop}
                fill="#FFFFFF"
                fillOpacity={0.55}
              />
            )}
            <text
              x={x + barWidth / 2}
              y={value < BALANCE_MIDLINE && baseline - top >= 28 ? top + 17 : top - 6}
              textAnchor="middle"
              style={{ fontSize: 11, fill: energy[k].text, fontWeight: 600 }}
            >
              {value}
            </text>
            <text
              x={x + barWidth / 2}
              y={baseline + 16}
              textAnchor="middle"
              style={{ fontSize: 11, fill: "#0E0F26", fontWeight: 600 }}
            >
              {energy[k].label}
            </text>
            <text
              x={x + barWidth / 2}
              y={baseline + 30}
              textAnchor="middle"
              style={{ fontSize: 9, fill: "#6E7090" }}
            >
              {FOCUS_WORD[k]}
            </text>
          </g>
        );
      })}

      <line x1={gutter - 8} x2={width + 8} y1={mid} y2={mid} stroke="#0E0F26" strokeWidth={1.5} />
      <text
        x={gutter - 14}
        y={mid - 8}
        textAnchor="end"
        style={{ fontSize: 10, fill: "#4B4C6B", fontWeight: 600, letterSpacing: "0.07em" }}
      >
        LEADING
      </text>
      <text
        x={gutter - 14}
        y={mid + 17}
        textAnchor="end"
        style={{ fontSize: 10, fill: "#6E7090", fontWeight: 600, letterSpacing: "0.07em" }}
      >
        RESERVE
      </text>
    </svg>
  );
}

/** Midpoint of the 0-100 scale: energies above it lead, energies below it sit in reserve. */
export const BALANCE_MIDLINE = 50;

export function balanceGroups(scores: EnergyScores): { leading: EnergyKey[]; reserve: EnergyKey[] } {
  const sorted = [...ENERGIES].sort((a, b) => scores[b] - scores[a]);
  return {
    leading: sorted.filter((k) => scores[k] >= BALANCE_MIDLINE),
    reserve: sorted.filter((k) => scores[k] < BALANCE_MIDLINE),
  };
}
