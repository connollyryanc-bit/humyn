"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  CostBucket,
  FinancialAiInsight,
  PerEmployee,
  costBySkillGroup,
  financialAiInsights,
  practices,
  quarterlyTrend,
  regions,
} from "./seed";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

function fmtEur(value: number, opts?: { precise?: boolean }): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(opts?.precise ? 2 : 1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${value}`;
}

export default function FinancialWorkforcePage() {
  const totals = useMemo(() => {
    const totalHeadcount = regions.reduce((s, r) => s + r.headcount, 0);
    const totalRevenue = regions.reduce((s, r) => s + r.revenuePerEmployee * r.headcount, 0);
    const totalProfit = regions.reduce((s, r) => s + r.grossProfitPerEmployee * r.headcount, 0);
    const blendedMargin = (totalProfit / totalRevenue) * 100;
    const revPerEmployee = totalRevenue / totalHeadcount;
    return { totalHeadcount, totalRevenue, totalProfit, blendedMargin, revPerEmployee };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/financial" />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" }}>
        <Link
          href="/executive"
          style={{ fontSize: 12, color: EXEC_INK_SECONDARY, textDecoration: "none", display: "inline-block", marginBottom: 18 }}
        >
          ← Executive home
        </Link>

        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
            Executive · Module 6
          </div>
          <h1 className="font-display" style={{ fontSize: 48, fontWeight: 600, color: EXEC_INK, letterSpacing: "-1px", margin: "12px 0 14px", lineHeight: 1.05, maxWidth: 880 }}>
            Financial Workforce
          </h1>
          <p style={{ fontSize: 15, color: EXEC_INK_SECONDARY, maxWidth: 760, lineHeight: 1.7, margin: 0 }}>
            The CFO view. Revenue per employee, gross-profit per employee, margin by region and
            practice, cost by skill group. The workforce profile behind the P&L.
          </p>
        </section>

        <section style={{ marginBottom: 44 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <HeroStat label="Headcount" value={String(totals.totalHeadcount)} detail="Across the four Nordic markets" tone="neutral" />
            <HeroStat label="Annualised revenue" value={fmtEur(totals.totalRevenue, { precise: true })} detail="Run-rate across the workforce" tone="positive" />
            <HeroStat label="Revenue per employee" value={fmtEur(totals.revPerEmployee)} detail="Annualised blended average" tone="neutral" />
            <HeroStat label="Blended gross margin" value={`${totals.blendedMargin.toFixed(1)}%`} detail="Workforce-weighted across all practices" tone="positive" />
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Revenue and margin trend</SectionLabel>
          <QuarterlyTrend />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>By region</SectionLabel>
          <ScopeTable rows={regions} label="Region" />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>By practice</SectionLabel>
          <ScopeTable rows={practices} label="Practice" />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Cost by skill group</SectionLabel>
          <CostByGroup buckets={costBySkillGroup} />
        </section>

        <section>
          <SectionLabel>AI insights</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
            {financialAiInsights.map((i, idx) => (
              <InsightCard key={idx} insight={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 600, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function HeroStat({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "neutral" | "positive" | "warning" | "critical" }) {
  const stripe = tone === "critical" ? "#C4534A" : tone === "warning" ? "#B87A2E" : tone === "positive" ? "#3D8A61" : EXEC_ACCENT;
  return (
    <div style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 168, position: "relative", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 2, height: "100%", background: stripe, opacity: 0.85 }} />
      <div style={{ fontSize: 10, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 38, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.8px", lineHeight: 1.0 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#5A5754", lineHeight: 1.5, marginTop: "auto" }}>{detail}</div>
    </div>
  );
}

function QuarterlyTrend() {
  const W = 1200;
  const H = 220;
  const padding = { top: 24, right: 32, bottom: 36, left: 56 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const revMax = Math.max(...quarterlyTrend.map((q) => q.revenue));
  const xStep = innerW / (quarterlyTrend.length - 1);
  const yScaleRev = (v: number) => innerH - (v / revMax) * innerH * 0.85;

  return (
    <div style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "24px 28px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 11, color: EXEC_INK_SECONDARY, marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 6, borderRadius: 2, background: EXEC_ACCENT, opacity: 0.85 }} />
          Revenue (€M)
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 6, borderRadius: 2, background: "#3D8A61" }} />
          Gross margin (%)
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {quarterlyTrend.map((q, i) => {
          const x = padding.left + i * xStep;
          const barW = 36;
          const barH = (q.revenue / revMax) * innerH * 0.85;
          return (
            <g key={i}>
              <rect
                x={x - barW / 2}
                y={padding.top + innerH - barH}
                width={barW}
                height={barH}
                fill={EXEC_ACCENT}
                opacity={0.85}
                rx={4}
              />
              <text
                x={x}
                y={padding.top + innerH - barH - 8}
                textAnchor="middle"
                className="font-display"
                style={{ fontSize: 12, fill: EXEC_INK, fontWeight: 600 }}
              >
                €{q.revenue}M
              </text>
              <text x={x} y={H - 12} textAnchor="middle" style={{ fontSize: 11, fill: "#9A9A9A" }}>
                {q.q}
              </text>
            </g>
          );
        })}
        <path
          d={quarterlyTrend
            .map((q, i) => `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${padding.top + yScaleRev(q.margin / 8)}`)
            .join(" ")}
          fill="none"
          stroke="#3D8A61"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {quarterlyTrend.map((q, i) => (
          <g key={`m-${i}`}>
            <circle cx={padding.left + i * xStep} cy={padding.top + yScaleRev(q.margin / 8)} r={4} fill="#3D8A61" stroke="#FFFFFF" strokeWidth={1.5} />
            <text
              x={padding.left + i * xStep}
              y={padding.top + yScaleRev(q.margin / 8) - 10}
              textAnchor="middle"
              style={{ fontSize: 10, fill: "#3D8A61", fontWeight: 600 }}
            >
              {q.margin}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ScopeTable({ rows, label }: { rows: PerEmployee[]; label: string }) {
  const maxRev = Math.max(...rows.map((r) => r.revenuePerEmployee));
  return (
    <div style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 14, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) 90px 120px 1fr 110px 110px",
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
        <div>{label}</div>
        <div style={{ textAlign: "right" }}>Headcount</div>
        <div style={{ textAlign: "right" }}>Rev / FTE</div>
        <div>Revenue distribution</div>
        <div style={{ textAlign: "right" }}>Margin</div>
        <div style={{ textAlign: "right" }}>Utilisation</div>
      </div>
      {rows.map((r) => {
        const revPct = (r.revenuePerEmployee / maxRev) * 100;
        const marginTone =
          r.marginPct >= 35 ? "#3D8A61" : r.marginPct >= 32 ? "#B87A2E" : "#C4534A";
        const utilTone =
          r.utilisationPct >= 80 ? "#3D8A61" : r.utilisationPct >= 73 ? "#B87A2E" : "#C4534A";
        return (
          <div
            key={r.scope}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.8fr) 90px 120px 1fr 110px 110px",
              gap: 12,
              padding: "14px 22px",
              borderTop: "0.5px solid rgba(0,0,0,0.04)",
              alignItems: "center",
              fontSize: 13,
              color: EXEC_INK,
            }}
          >
            <div style={{ fontWeight: 600 }}>{r.scope}</div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.headcount}</div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtEur(r.revenuePerEmployee)}</div>
            <div style={{ height: 8, background: "#F3F0EA", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${revPct}%`, height: "100%", background: EXEC_ACCENT, opacity: 0.85 }} />
            </div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: marginTone, fontWeight: 600 }}>
              {r.marginPct.toFixed(1)}%
            </div>
            <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: utilTone, fontWeight: 600 }}>
              {r.utilisationPct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CostByGroup({ buckets }: { buckets: CostBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.totalCostEur, 0);
  return (
    <div style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "24px 28px 22px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {buckets.map((b) => {
          const widthPct = (b.totalCostEur / total) * 100;
          return (
            <div key={b.group} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 1fr 180px", gap: 16, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: EXEC_INK, marginBottom: 2 }}>{b.group}</div>
                <div style={{ fontSize: 11, color: "#6F6B66" }}>{b.headcount} headcount · avg {fmtEur(b.avgFullyLoadedEur)} fully-loaded</div>
              </div>
              <div style={{ position: "relative", height: 22, background: "#F3F0EA", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${widthPct}%`, background: EXEC_ACCENT, opacity: 0.85, borderRadius: 6 }} />
              </div>
              <div className="font-display" style={{ textAlign: "right", fontSize: 18, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.3px" }}>
                {fmtEur(b.totalCostEur, { precise: true })}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: EXEC_INK_SECONDARY,
        }}
      >
        <div>Total workforce cost</div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.4px" }}>
          {fmtEur(total, { precise: true })}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: FinancialAiInsight }) {
  const tone =
    insight.category === "outperformer"
      ? { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB" }
      : insight.category === "underperformer" || insight.category === "risk"
        ? { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA" }
        : { color: EXEC_ACCENT, bg: "#F0F5FB", border: "#C4D9EF" };
  return (
    <div style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "20px 22px 18px", display: "flex", flexDirection: "column", gap: 10, position: "relative", overflow: "hidden" }}>
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: tone.color, opacity: 0.85 }} />
      <span style={{ fontSize: 10, color: tone.color, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>{insight.category}</span>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.25px", lineHeight: 1.3 }}>{insight.title}</div>
      <p style={{ fontSize: 13, color: EXEC_INK_SECONDARY, lineHeight: 1.6, margin: 0 }}>{insight.body}</p>
      {insight.link && (
        <Link href={insight.link.href} style={{ marginTop: "auto", paddingTop: 8, fontSize: 12, fontWeight: 500, color: EXEC_ACCENT, textDecoration: "none" }}>
          {insight.link.label} →
        </Link>
      )}
    </div>
  );
}
