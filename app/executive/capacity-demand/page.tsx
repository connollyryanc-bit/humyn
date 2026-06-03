"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  CapacityAiInsight,
  HORIZONS,
  HorizonKey,
  PracticeSnapshot,
  RiskLevel,
  capacityAiInsights,
  practiceSnapshots,
  timeSeries,
} from "./seed";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

const RISK_TONES: Record<RiskLevel, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA", label: "Critical" },
  warning:  { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0", label: "Warning" },
  neutral:  { color: "#5A5754", bg: "#F3F0EA", border: "rgba(0,0,0,0.08)", label: "On track" },
  positive: { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB", label: "Surplus" },
};

export default function CapacityDemandPage() {
  const [horizon, setHorizon] = useState<HorizonKey>("90d");

  const snapshots = practiceSnapshots[horizon];
  const series = timeSeries[horizon];

  const totals = useMemo(() => {
    const totalCapacity = snapshots.reduce((s, p) => s + p.capacity, 0);
    const totalConfirmed = snapshots.reduce((s, p) => s + p.confirmedDemand, 0);
    const totalPipeline = snapshots.reduce((s, p) => s + p.weightedPipeline, 0);
    const netCurrent = totalCapacity - totalConfirmed;
    const netIfPipelineLands = netCurrent - totalPipeline;
    return { totalCapacity, totalConfirmed, totalPipeline, netCurrent, netIfPipelineLands };
  }, [snapshots]);

  const horizonLabel =
    HORIZONS.find((h) => h.key === horizon)?.label ?? horizon;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/capacity-demand" />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" }}>
        <Link
          href="/executive"
          style={{
            fontSize: 12,
            color: EXEC_INK_SECONDARY,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 18,
          }}
        >
          ← Executive home
        </Link>

        <section style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              color: "#6F6B66",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontWeight: 600,
            }}
          >
            Executive · Module 1
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: EXEC_INK,
              letterSpacing: "-1px",
              margin: "12px 0 14px",
              lineHeight: 1.05,
              maxWidth: 880,
            }}
          >
            Capacity vs Demand Intelligence
          </h1>
          <p
            style={{
              fontSize: 15,
              color: EXEC_INK_SECONDARY,
              maxWidth: 760,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Workforce supply against current and forecast demand across the eight Nordic practices.
            Switch horizons to see how the picture changes over 30, 60, 90, 180 and 365 days.
          </p>
        </section>

        <section style={{ marginBottom: 36 }}>
          <HorizonPicker horizon={horizon} setHorizon={setHorizon} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <HeroStat
              label="Available capacity"
              value={`${totals.totalCapacity.toLocaleString()} d`}
              detail={`FTE-days available across the next ${horizonLabel.toLowerCase()}`}
              tone="neutral"
            />
            <HeroStat
              label="Confirmed demand"
              value={`${totals.totalConfirmed.toLocaleString()} d`}
              detail={`Active engagements + confirmed wins`}
              tone="neutral"
            />
            <HeroStat
              label={totals.netCurrent >= 0 ? "Net surplus today" : "Net shortage today"}
              value={`${totals.netCurrent > 0 ? "+" : ""}${totals.netCurrent.toLocaleString()} d`}
              detail={
                totals.netCurrent >= 0
                  ? "Capacity covers confirmed demand"
                  : "Shortage before pipeline is considered"
              }
              tone={totals.netCurrent >= 0 ? "positive" : "critical"}
            />
            <HeroStat
              label="Weighted pipeline"
              value={`${totals.totalPipeline.toLocaleString()} d`}
              detail={
                totals.netIfPipelineLands < 0
                  ? `Net ${Math.abs(totals.netIfPipelineLands).toLocaleString()}d shortage if pipeline lands`
                  : `Net ${totals.netIfPipelineLands.toLocaleString()}d surplus if pipeline lands`
              }
              tone={totals.netIfPipelineLands < 0 ? "warning" : "positive"}
            />
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Capacity vs demand · by practice</SectionLabel>
          <PracticeBarChart snapshots={snapshots} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Capacity vs demand · over time</SectionLabel>
          <TimeSeriesChart series={series} horizonLabel={horizonLabel} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Practice breakdown</SectionLabel>
          <PracticeTable snapshots={snapshots} />
        </section>

        <section>
          <SectionLabel>AI insights</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: 14,
            }}
          >
            {capacityAiInsights.map((i, idx) => (
              <InsightCard key={idx} insight={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// ─── horizon picker ───────────────────────────────────────────────────

function HorizonPicker({
  horizon,
  setHorizon,
}: {
  horizon: HorizonKey;
  setHorizon: (h: HorizonKey) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
      }}
    >
      {HORIZONS.map((h) => (
        <button
          key={h.key}
          onClick={() => setHorizon(h.key)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: horizon === h.key ? EXEC_INK : "transparent",
            color: horizon === h.key ? "#F3F0EA" : EXEC_INK_SECONDARY,
            fontSize: 12.5,
            fontWeight: horizon === h.key ? 500 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {h.label}
        </button>
      ))}
    </div>
  );
}

// ─── hero stat ─────────────────────────────────────────────────────────

function HeroStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "positive" | "warning" | "critical";
}) {
  const stripe =
    tone === "critical"
      ? "#C4534A"
      : tone === "warning"
        ? "#B87A2E"
        : tone === "positive"
          ? "#3D8A61"
          : EXEC_ACCENT;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "22px 22px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 168,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 2,
          height: "100%",
          background: stripe,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          fontSize: 10,
          color: "#6F6B66",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 38,
          fontWeight: 600,
          color: EXEC_INK,
          letterSpacing: "-0.8px",
          lineHeight: 1.0,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#5A5754", lineHeight: 1.5, marginTop: "auto" }}>
        {detail}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#6F6B66",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontWeight: 600,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

// ─── bar chart: per practice ───────────────────────────────────────────

function PracticeBarChart({ snapshots }: { snapshots: PracticeSnapshot[] }) {
  const maxValue = Math.max(
    ...snapshots.map((s) =>
      Math.max(s.capacity, s.confirmedDemand + s.weightedPipeline),
    ),
  );

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "26px 28px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 22,
          flexWrap: "wrap",
          fontSize: 11,
          color: EXEC_INK_SECONDARY,
        }}
      >
        <Legend swatch={EXEC_ACCENT} label="Capacity (available)" />
        <Legend swatch="#161311" label="Confirmed demand" />
        <Legend swatch="#161311" muted label="Weighted pipeline" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {snapshots.map((s) => {
          const capacityPct = (s.capacity / maxValue) * 100;
          const confirmedPct = (s.confirmedDemand / maxValue) * 100;
          const pipelinePct = (s.weightedPipeline / maxValue) * 100;
          const tone = RISK_TONES[s.risk];
          return (
            <div key={s.practice} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: EXEC_INK,
                    letterSpacing: "-0.1px",
                  }}
                >
                  {s.practice}
                </div>
                <div style={{ fontSize: 11, color: "#6F6B66" }}>
                  {s.capacity.toLocaleString()}d capacity ·{" "}
                  {(s.confirmedDemand + s.weightedPipeline).toLocaleString()}d demand
                  <span
                    style={{
                      marginLeft: 10,
                      padding: "2px 8px",
                      borderRadius: 100,
                      background: tone.bg,
                      border: `0.5px solid ${tone.border}`,
                      color: tone.color,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {tone.label}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    height: 14,
                    borderRadius: 4,
                    background: "#F3F0EA",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    title={`Capacity ${s.capacity.toLocaleString()}d`}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${capacityPct}%`,
                      background: EXEC_ACCENT,
                      opacity: 0.85,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <div
                  style={{
                    height: 14,
                    borderRadius: 4,
                    background: "#F3F0EA",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div
                    title={`Confirmed ${s.confirmedDemand.toLocaleString()}d`}
                    style={{
                      width: `${confirmedPct}%`,
                      background: "#161311",
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    }}
                  />
                  <div
                    title={`Weighted pipeline ${s.weightedPipeline.toLocaleString()}d`}
                    style={{
                      width: `${pipelinePct}%`,
                      background:
                        "repeating-linear-gradient(45deg, #161311 0 4px, #2A2724 4px 8px)",
                      opacity: 0.85,
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  muted,
}: {
  swatch: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        aria-hidden
        style={{
          width: 12,
          height: 6,
          borderRadius: 2,
          background: muted
            ? "repeating-linear-gradient(45deg, #161311 0 3px, #2A2724 3px 6px)"
            : swatch,
          display: "inline-block",
          opacity: muted ? 0.85 : 0.85,
        }}
      />
      {label}
    </span>
  );
}

// ─── time series ──────────────────────────────────────────────────────

function TimeSeriesChart({
  series,
  horizonLabel,
}: {
  series: { week: string; capacity: number; confirmed: number; pipeline: number }[];
  horizonLabel: string;
}) {
  const W = 1200;
  const H = 280;
  const padding = { top: 24, right: 32, bottom: 36, left: 56 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  const maxVal = Math.max(
    ...series.map((p) => Math.max(p.capacity, p.confirmed + p.pipeline)),
  );
  const yScale = (v: number) => innerH - (v / maxVal) * innerH;
  const xStep = innerW / Math.max(series.length - 1, 1);

  const capacityPath = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${padding.top + yScale(p.capacity)}`)
    .join(" ");

  const demandPath = series
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${padding.top + yScale(p.confirmed + p.pipeline)}`,
    )
    .join(" ");

  const demandAreaPath =
    demandPath +
    ` L ${padding.left + (series.length - 1) * xStep} ${padding.top + innerH}` +
    ` L ${padding.left} ${padding.top + innerH} Z`;

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => Math.round((maxVal / ticks) * i));

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "24px 28px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 14,
          flexWrap: "wrap",
          fontSize: 11,
          color: EXEC_INK_SECONDARY,
        }}
      >
        <Legend swatch={EXEC_ACCENT} label="Capacity (weekly cap)" />
        <Legend swatch="#161311" label="Demand (confirmed + weighted pipeline)" />
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#6F6B66" }}>
          Aggregated across {series.length} {horizonLabel.toLowerCase().includes("day") ? "weeks" : "periods"} · {horizonLabel}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        {tickValues.map((v, i) => {
          const y = padding.top + yScale(v);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerW}
                y1={y}
                y2={y}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                style={{ fontSize: 10, fill: "#9A9A9A" }}
              >
                {v.toLocaleString()}
              </text>
            </g>
          );
        })}

        {series.map((p, i) => (
          <text
            key={`x-${i}`}
            x={padding.left + i * xStep}
            y={H - 12}
            textAnchor="middle"
            style={{ fontSize: 10, fill: "#9A9A9A" }}
          >
            {p.week}
          </text>
        ))}

        <path d={demandAreaPath} fill={EXEC_ACCENT} opacity={0.06} />

        <path d={capacityPath} fill="none" stroke={EXEC_ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        <path d={demandPath} fill="none" stroke="#161311" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {series.map((p, i) => {
          const x = padding.left + i * xStep;
          return (
            <g key={`pts-${i}`}>
              <circle cx={x} cy={padding.top + yScale(p.capacity)} r={3.5} fill={EXEC_ACCENT} stroke="#FFFFFF" strokeWidth={1.5} />
              <circle cx={x} cy={padding.top + yScale(p.confirmed + p.pipeline)} r={3.5} fill="#161311" stroke="#FFFFFF" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── practice table ───────────────────────────────────────────────────

function PracticeTable({ snapshots }: { snapshots: PracticeSnapshot[] }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) 88px 96px 96px 96px 100px",
          gap: 12,
          padding: "12px 22px",
          background: "#FAFAF8",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          fontSize: 10,
          color: "#6F6B66",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
        }}
      >
        <div>Practice</div>
        <div style={{ textAlign: "right" }}>Headcount</div>
        <div style={{ textAlign: "right" }}>Capacity</div>
        <div style={{ textAlign: "right" }}>Confirmed</div>
        <div style={{ textAlign: "right" }}>Pipeline</div>
        <div style={{ textAlign: "right" }}>Risk</div>
      </div>
      {snapshots.map((s) => {
        const tone = RISK_TONES[s.risk];
        return (
          <div
            key={s.practice}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) 88px 96px 96px 96px 100px",
              gap: 12,
              padding: "16px 22px",
              borderTop: "0.5px solid rgba(0,0,0,0.05)",
              alignItems: "center",
              fontSize: 13,
              color: EXEC_INK,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>{s.practice}</div>
              <div style={{ fontSize: 11, color: "#6F6B66", lineHeight: 1.5 }}>
                {s.note}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#5A5754" }}>
              {s.headcount}
            </div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {s.capacity.toLocaleString()}
            </div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {s.confirmedDemand.toLocaleString()}
            </div>
            <div
              style={{
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                color: "#6F6B66",
              }}
            >
              {s.weightedPipeline.toLocaleString()}
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 9px",
                  borderRadius: 100,
                  background: tone.bg,
                  border: `0.5px solid ${tone.border}`,
                  color: tone.color,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {tone.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI insights ──────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: CapacityAiInsight }) {
  const tone =
    insight.category === "shortage" || insight.category === "risk"
      ? RISK_TONES.critical
      : insight.category === "bottleneck"
        ? RISK_TONES.warning
        : RISK_TONES.positive;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "20px 22px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3,
          height: "100%",
          background: tone.color,
          opacity: 0.85,
        }}
      />
      <span
        style={{
          fontSize: 10,
          color: tone.color,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 600,
        }}
      >
        {insight.category}
      </span>
      <div
        className="font-display"
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: EXEC_INK,
          letterSpacing: "-0.25px",
          lineHeight: 1.3,
        }}
      >
        {insight.title}
      </div>
      <p
        style={{
          fontSize: 13,
          color: EXEC_INK_SECONDARY,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {insight.body}
      </p>
      {insight.link && (
        <Link
          href={insight.link.href}
          style={{
            marginTop: "auto",
            paddingTop: 8,
            fontSize: 12,
            fontWeight: 500,
            color: EXEC_ACCENT,
            textDecoration: "none",
          }}
        >
          {insight.link.label} →
        </Link>
      )}
    </div>
  );
}
