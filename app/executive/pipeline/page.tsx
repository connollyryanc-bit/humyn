"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  Opportunity,
  PIPELINE_STAGES,
  PipelineAiInsight,
  PipelineStage,
  ReadinessTone,
  opportunities,
  pipelineAiInsights,
} from "./seed";
import { ScopeBreadcrumb } from "../scope-breadcrumb";
import { describeScope, scopeIsRoot, useExecutiveScope } from "../scope-context";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

const READINESS_TONES: Record<
  ReadinessTone,
  { color: string; bg: string; border: string; label: string }
> = {
  ready:   { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB", label: "Ready" },
  stretch: { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0", label: "Stretch" },
  risk:    { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0", label: "Risk" },
  gap:     { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA", label: "Capability gap" },
};

function fmtEur(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${value}`;
}

type StageFilter = "all" | "active" | "closing";

export default function PipelineReadinessPage() {
  const [stageFilter, setStageFilter] = useState<StageFilter>("active");
  const { scope } = useExecutiveScope();

  const filtered = useMemo(() => {
    let list = opportunities;
    if (stageFilter === "all") {
      // no stage filter
    } else if (stageFilter === "closing") {
      list = list.filter((o) => o.stage === "proposed" || o.stage === "negotiation");
    } else {
      list = list.filter((o) => o.stage !== "closed-won" && o.stage !== "closed-lost");
    }
    // Scope filtering
    if (scope.market) list = list.filter((o) => o.market === scope.market);
    if (scope.practice) list = list.filter((o) => o.practice === scope.practice);
    return list;
  }, [stageFilter, scope]);

  const totals = useMemo(() => {
    const totalCount = filtered.length;
    const totalValue = filtered.reduce((s, o) => s + o.valueEur, 0);
    const weightedValue = filtered.reduce(
      (s, o) => s + (o.valueEur * o.probability) / 100,
      0,
    );
    const avgReadiness =
      filtered.reduce((s, o) => s + o.readiness, 0) / Math.max(filtered.length, 1);
    const atRiskCount = filtered.filter(
      (o) => o.readinessTone === "gap" || o.readinessTone === "risk",
    ).length;
    return { totalCount, totalValue, weightedValue, avgReadiness, atRiskCount };
  }, [filtered]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/pipeline" />

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
            Executive · Module 2
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
            Pipeline Readiness
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
            Every opportunity, scored on whether we can actually deliver it. Win probability,
            required skills, FTE need, and a delivery-readiness score that says whether the team
            exists to staff the work.
            {!scopeIsRoot(scope) && (
              <>
                {" "}
                Filtered to <strong style={{ color: EXEC_INK }}>{describeScope(scope)}</strong>.
              </>
            )}
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <ScopeBreadcrumb />
        </section>

        <section style={{ marginBottom: 32 }}>
          <StageFilterPicker filter={stageFilter} setFilter={setStageFilter} />
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
              label="Opportunities"
              value={String(totals.totalCount)}
              detail={`Across ${new Set(filtered.map((o) => o.practice)).size} practices`}
              tone="neutral"
            />
            <HeroStat
              label="Weighted pipeline"
              value={fmtEur(totals.weightedValue)}
              detail={`Of ${fmtEur(totals.totalValue)} total deal value`}
              tone="positive"
            />
            <HeroStat
              label="Avg delivery readiness"
              value={`${Math.round(totals.avgReadiness)}%`}
              detail={`How much of the pipeline we can actually staff today`}
              tone={
                totals.avgReadiness >= 70
                  ? "positive"
                  : totals.avgReadiness >= 55
                    ? "warning"
                    : "critical"
              }
            />
            <HeroStat
              label="At-risk opportunities"
              value={String(totals.atRiskCount)}
              detail="Won't deliver without intervention"
              tone={
                totals.atRiskCount === 0
                  ? "positive"
                  : totals.atRiskCount <= 2
                    ? "warning"
                    : "critical"
              }
            />
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Quadrant view — probability × delivery readiness</SectionLabel>
          <QuadrantChart opportunities={filtered} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Pipeline funnel — value by stage</SectionLabel>
          <Funnel opportunities={filtered} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Marquee opportunities</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: 14,
            }}
          >
            {[...filtered]
              .sort((a, b) => (b.valueEur * b.probability) - (a.valueEur * a.probability))
              .slice(0, 4)
              .map((o) => (
                <MarqueeOpp key={o.id} opp={o} />
              ))}
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>All opportunities</SectionLabel>
          <OpportunitiesTable opportunities={filtered} />
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
            {pipelineAiInsights.map((i, idx) => (
              <InsightCard key={idx} insight={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────

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

function StageFilterPicker({
  filter,
  setFilter,
}: {
  filter: StageFilter;
  setFilter: (f: StageFilter) => void;
}) {
  const items: { key: StageFilter; label: string }[] = [
    { key: "active",  label: "Active pipeline" },
    { key: "closing", label: "Closing (proposed + negotiation)" },
    { key: "all",     label: "All including closed" },
  ];
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
      {items.map((i) => (
        <button
          key={i.key}
          onClick={() => setFilter(i.key)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: filter === i.key ? EXEC_INK : "transparent",
            color: filter === i.key ? "#F3F0EA" : EXEC_INK_SECONDARY,
            fontSize: 12.5,
            fontWeight: filter === i.key ? 500 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

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

// ─── quadrant scatter chart ───────────────────────────────────────────

function QuadrantChart({ opportunities }: { opportunities: Opportunity[] }) {
  const W = 1200;
  const H = 460;
  const padding = { top: 28, right: 36, bottom: 48, left: 64 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const maxValue = Math.max(...opportunities.map((o) => o.valueEur), 1);
  const rRange = { min: 8, max: 38 };

  const xScale = (p: number) => (p / 100) * innerW;
  const yScale = (r: number) => innerH - (r / 100) * innerH;
  const rScale = (v: number) =>
    rRange.min + Math.sqrt(v / maxValue) * (rRange.max - rRange.min);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "24px 28px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 11,
          color: EXEC_INK_SECONDARY,
          marginBottom: 12,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: EXEC_ACCENT,
              opacity: 0.85,
            }}
          />
          Bubble = total deal value
        </span>
        <span style={{ color: "#6F6B66", marginLeft: "auto" }}>
          {opportunities.length} opportunities · hover a bubble for the name
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <rect
          x={padding.left + innerW / 2}
          y={padding.top}
          width={innerW / 2}
          height={innerH / 2}
          fill="#EFF8F3"
          opacity={0.5}
        />
        <rect
          x={padding.left + innerW / 2}
          y={padding.top + innerH / 2}
          width={innerW / 2}
          height={innerH / 2}
          fill="#FDF3F2"
          opacity={0.45}
        />

        <line
          x1={padding.left + innerW / 2}
          x2={padding.left + innerW / 2}
          y1={padding.top}
          y2={padding.top + innerH}
          stroke="rgba(0,0,0,0.08)"
          strokeDasharray="3 4"
        />
        <line
          x1={padding.left}
          x2={padding.left + innerW}
          y1={padding.top + innerH / 2}
          y2={padding.top + innerH / 2}
          stroke="rgba(0,0,0,0.08)"
          strokeDasharray="3 4"
        />

        <text
          x={padding.left + innerW * 0.75}
          y={padding.top + innerH * 0.25 - 14}
          textAnchor="middle"
          style={{
            fontSize: 10,
            fill: "#3D8A61",
            letterSpacing: "0.14em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Chase hard
        </text>
        <text
          x={padding.left + innerW * 0.25}
          y={padding.top + innerH * 0.25 - 14}
          textAnchor="middle"
          style={{
            fontSize: 10,
            fill: "#6F6B66",
            letterSpacing: "0.14em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Nurture
        </text>
        <text
          x={padding.left + innerW * 0.75}
          y={padding.top + innerH * 0.75 - 14}
          textAnchor="middle"
          style={{
            fontSize: 10,
            fill: "#C4534A",
            letterSpacing: "0.14em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Win-but-can't-deliver
        </text>
        <text
          x={padding.left + innerW * 0.25}
          y={padding.top + innerH * 0.75 - 14}
          textAnchor="middle"
          style={{
            fontSize: 10,
            fill: "#9A9A9A",
            letterSpacing: "0.14em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Decline
        </text>

        {[0, 25, 50, 75, 100].map((v) => (
          <g key={`x-${v}`}>
            <text
              x={padding.left + xScale(v)}
              y={H - 18}
              textAnchor="middle"
              style={{ fontSize: 10, fill: "#9A9A9A" }}
            >
              {v}%
            </text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={`y-${v}`}>
            <text
              x={padding.left - 12}
              y={padding.top + yScale(v) + 4}
              textAnchor="end"
              style={{ fontSize: 10, fill: "#9A9A9A" }}
            >
              {v}%
            </text>
          </g>
        ))}

        <text
          x={padding.left + innerW / 2}
          y={H - 4}
          textAnchor="middle"
          style={{
            fontSize: 10,
            fill: "#6F6B66",
            letterSpacing: "0.12em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Win probability →
        </text>
        <text
          x={-padding.top - innerH / 2}
          y={16}
          textAnchor="middle"
          transform="rotate(-90)"
          style={{
            fontSize: 10,
            fill: "#6F6B66",
            letterSpacing: "0.12em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Delivery readiness →
        </text>

        {opportunities.map((o) => {
          const cx = padding.left + xScale(o.probability);
          const cy = padding.top + yScale(o.readiness);
          const r = rScale(o.valueEur);
          const tone = READINESS_TONES[o.readinessTone];
          return (
            <g key={o.id}>
              <title>
                {o.name} — {o.client} · {fmtEur(o.valueEur)} · {o.probability}% win ·{" "}
                {o.readiness}% readiness
              </title>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={tone.color}
                opacity={0.18}
                stroke={tone.color}
                strokeWidth={1.4}
              />
              <circle cx={cx} cy={cy} r={4} fill={tone.color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── funnel ───────────────────────────────────────────────────────────

function Funnel({ opportunities }: { opportunities: Opportunity[] }) {
  const activeStages = PIPELINE_STAGES.filter(
    (s) => s.key !== "closed-won" && s.key !== "closed-lost",
  );
  const stageData = activeStages.map((stage) => {
    const inStage = opportunities.filter((o) => o.stage === stage.key);
    const value = inStage.reduce((s, o) => s + o.valueEur, 0);
    const weighted = inStage.reduce((s, o) => s + (o.valueEur * o.probability) / 100, 0);
    return { ...stage, count: inStage.length, value, weighted };
  });
  const maxWeighted = Math.max(...stageData.map((d) => d.weighted), 1);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "24px 28px 22px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {stageData.map((d) => {
          const widthPct = (d.weighted / maxWeighted) * 100;
          return (
            <div
              key={d.key}
              style={{ display: "grid", gridTemplateColumns: "140px 1fr 200px", gap: 18, alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: EXEC_INK,
                }}
              >
                <span
                  aria-hidden
                  style={{ width: 8, height: 8, borderRadius: "50%", background: d.tone }}
                />
                {d.label}
              </div>
              <div
                style={{
                  position: "relative",
                  height: 28,
                  background: "#F3F0EA",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${widthPct}%`,
                    background: EXEC_ACCENT,
                    opacity: 0.85,
                    borderRadius: 6,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: EXEC_INK_SECONDARY,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: EXEC_INK, fontWeight: 600 }}>{fmtEur(d.weighted)}</span>{" "}
                <span style={{ color: "#9A9A9A" }}>
                  weighted · {d.count} opp{d.count === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── marquee opportunity card ─────────────────────────────────────────

function MarqueeOpp({ opp }: { opp: Opportunity }) {
  const tone = READINESS_TONES[opp.readinessTone];
  const weighted = Math.round((opp.valueEur * opp.probability) / 100);
  const stageMeta = PIPELINE_STAGES.find((s) => s.key === opp.stage);
  return (
    <div
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = "translateY(-2px)";
        ev.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = "translateY(0)";
        ev.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
      }}
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "20px 22px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 9px",
            borderRadius: 100,
            background: "#FAFAF8",
            border: "0.5px solid rgba(0,0,0,0.07)",
            fontSize: 10,
            color: EXEC_INK_SECONDARY,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: stageMeta?.tone }} />
          {stageMeta?.label}
        </span>
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

      <div
        className="font-display"
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: EXEC_INK,
          letterSpacing: "-0.3px",
          lineHeight: 1.25,
        }}
      >
        {opp.name}
      </div>
      <div style={{ fontSize: 11, color: "#9A9A9A" }}>
        {opp.client} · {opp.market} · {opp.practice}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 4 }}>
        <Cell label="Value" value={fmtEur(opp.valueEur)} />
        <Cell label="Probability" value={`${opp.probability}%`} />
        <Cell label="Weighted" value={fmtEur(weighted)} />
      </div>

      <div style={{ marginTop: 4 }}>
        <div
          style={{
            fontSize: 10,
            color: "#9A9A9A",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Delivery readiness · {opp.readiness}%
        </div>
        <div
          style={{
            height: 5,
            background: "#F3F0EA",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${opp.readiness}%`,
              height: "100%",
              background: tone.color,
              opacity: 0.85,
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {opp.riskFlags.length > 0 && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11.5,
            color: tone.color,
            lineHeight: 1.55,
          }}
        >
          {opp.riskFlags.map((f, i) => (
            <div key={i}>• {f}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "#9A9A9A",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: EXEC_INK,
          letterSpacing: "-0.2px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── opportunities table ──────────────────────────────────────────────

function OpportunitiesTable({ opportunities }: { opportunities: Opportunity[] }) {
  const sorted = [...opportunities].sort(
    (a, b) => b.valueEur * b.probability - a.valueEur * a.probability,
  );
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
          gridTemplateColumns: "minmax(0, 2.4fr) 110px 96px 96px 80px 110px",
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
        <div>Opportunity</div>
        <div style={{ textAlign: "right" }}>Value</div>
        <div style={{ textAlign: "right" }}>Probability</div>
        <div style={{ textAlign: "right" }}>Weighted</div>
        <div style={{ textAlign: "right" }}>FTE</div>
        <div style={{ textAlign: "right" }}>Readiness</div>
      </div>
      {sorted.map((o) => {
        const tone = READINESS_TONES[o.readinessTone];
        const stageMeta = PIPELINE_STAGES.find((s) => s.key === o.stage);
        return (
          <div
            key={o.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2.4fr) 110px 96px 96px 80px 110px",
              gap: 12,
              padding: "14px 22px",
              borderTop: "0.5px solid rgba(0,0,0,0.05)",
              alignItems: "center",
              fontSize: 13,
              color: EXEC_INK,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{o.name}</div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  fontSize: 11,
                  color: "#6F6B66",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: "#FAFAF8",
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: stageMeta?.tone,
                    }}
                  />
                  {stageMeta?.label}
                </span>
                {o.client} · {o.market} · {o.practice}
              </div>
            </div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {fmtEur(o.valueEur)}
            </div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {o.probability}%
            </div>
            <div
              style={{
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                color: EXEC_INK_SECONDARY,
              }}
            >
              {fmtEur((o.valueEur * o.probability) / 100)}
            </div>
            <div
              style={{
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                color: "#5A5754",
              }}
            >
              {o.requiredFTE}
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
                {o.readiness}% · {tone.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI insights ──────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: PipelineAiInsight }) {
  const tone =
    insight.category === "chase"
      ? READINESS_TONES.ready
      : insight.category === "capability" || insight.category === "risk"
        ? READINESS_TONES.gap
        : { color: "#5A5754", bg: "#F3F0EA", border: "rgba(0,0,0,0.08)", label: "Review" };
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
