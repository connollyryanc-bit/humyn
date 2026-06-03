"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  LeakageAiInsight,
  LeakageItem,
  leakageAiInsights,
  leakageByMarket,
  leakageItems,
  monthlyLeakage,
} from "./seed";
import { ScopeBreadcrumb } from "../scope-breadcrumb";
import { describeScope, scopeIsRoot, useExecutiveScope } from "../scope-context";
import { ChartIcons, ChartKind, ChartTypeToggle } from "../components/chart-toggle";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

function fmtEur(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${value}`;
}

export default function RevenueLeakagePage() {
  const { scope } = useExecutiveScope();
  const totals = useMemo(() => {
    const total = leakageItems.reduce((s, i) => s + i.costEur, 0);
    const recoverable = leakageItems.reduce(
      (s, i) => s + (i.costEur * i.recoverable) / 100,
      0,
    );
    const biggest = [...leakageItems].sort((a, b) => b.costEur - a.costEur)[0];
    const fastestGrowing = [...leakageItems].sort((a, b) => b.changePct - a.changePct)[0];
    return { total, recoverable, biggest, fastestGrowing };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/revenue-leakage" />

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
            Executive · Module 3
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
            Revenue Leakage
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
            Where workforce capacity isn&apos;t converting to revenue. Bench days, sub-utilisation,
            scope absorption, contractor over-spend, lost pitches, rate-card erosion — six leakage
            streams, year-to-date.
            {!scopeIsRoot(scope) && (
              <>
                {" "}
                Context: <strong style={{ color: EXEC_INK }}>{describeScope(scope)}</strong>.
              </>
            )}
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <ScopeBreadcrumb />
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
              label="Total leakage YTD"
              value={fmtEur(totals.total)}
              detail="Across six leakage streams"
              tone="critical"
            />
            <HeroStat
              label="Recoverable"
              value={fmtEur(totals.recoverable)}
              detail={`${Math.round((totals.recoverable / totals.total) * 100)}% of total leakage plausibly recoverable`}
              tone="positive"
            />
            <HeroStat
              label="Biggest leak"
              value={fmtEur(totals.biggest.costEur)}
              detail={totals.biggest.label}
              tone="warning"
            />
            <HeroStat
              label="Fastest growing"
              value={`+${totals.fastestGrowing.changePct}%`}
              detail={totals.fastestGrowing.label}
              tone="warning"
            />
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Leakage waterfall — where the money goes</SectionLabel>
          <LeakageWaterfall items={leakageItems} total={totals.total} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Monthly leakage trend</SectionLabel>
          <MonthlyTrendChart />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Leakage by market</SectionLabel>
          <MarketBreakdown />
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
            {leakageAiInsights.map((i, idx) => (
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
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 2, height: "100%", background: stripe, opacity: 0.85 }} />
      <div style={{ fontSize: 10, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: 38, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.8px", lineHeight: 1.0 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#5A5754", lineHeight: 1.5, marginTop: "auto" }}>
        {detail}
      </div>
    </div>
  );
}

function LeakageWaterfall({ items, total }: { items: LeakageItem[]; total: number }) {
  const max = Math.max(...items.map((i) => i.costEur));
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "24px 28px 22px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((item) => {
          const widthPct = (item.costEur / max) * 100;
          const recoverableWidth = (item.recoverable / 100) * widthPct;
          const trendColor =
            item.trend === "up" ? "#C4534A" : item.trend === "down" ? "#3D8A61" : "#9A9A9A";
          return (
            <div key={item.key} style={{ display: "grid", gridTemplateColumns: "180px 1fr 160px", gap: 16, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: EXEC_INK, marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: "#6F6B66", lineHeight: 1.5 }}>{item.description}</div>
              </div>
              <div style={{ position: "relative", height: 28, background: "#F3F0EA", borderRadius: 6, overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${widthPct}%`,
                    background: "repeating-linear-gradient(45deg, #C4534A 0 6px, #B5483F 6px 12px)",
                    opacity: 0.85,
                    borderRadius: 6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${recoverableWidth}%`,
                    background: "#3D8A61",
                    opacity: 0.85,
                    borderRadius: 6,
                  }}
                />
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: EXEC_INK_SECONDARY }}>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.3px" }}>
                  {fmtEur(item.costEur)}
                </span>
                <div style={{ fontSize: 11, color: trendColor, marginTop: 2 }}>
                  {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"}{" "}
                  {item.changePct > 0 ? "+" : ""}
                  {item.changePct}% · {item.recoverable}% recoverable
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 18, fontSize: 11, color: EXEC_INK_SECONDARY }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 6, borderRadius: 2, background: "repeating-linear-gradient(45deg, #C4534A 0 3px, #B5483F 3px 6px)" }} />
            Leakage
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 6, borderRadius: 2, background: "#3D8A61" }} />
            Recoverable share
          </span>
        </div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.4px" }}>
          {fmtEur(total)} total
        </div>
      </div>
    </div>
  );
}

function MonthlyTrendChart() {
  const [kind, setKind] = useState<ChartKind>("area");
  const W = 1200;
  const H = 240;
  const padding = { top: 24, right: 32, bottom: 36, left: 56 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const max = Math.max(...monthlyLeakage.map((m) => m.value));
  const xStep = innerW / (monthlyLeakage.length - 1);
  const yScale = (v: number) => innerH - (v / max) * innerH;

  const path = monthlyLeakage
    .map((m, i) => `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${padding.top + yScale(m.value)}`)
    .join(" ");
  const areaPath =
    path +
    ` L ${padding.left + (monthlyLeakage.length - 1) * xStep} ${padding.top + innerH}` +
    ` L ${padding.left} ${padding.top + innerH} Z`;

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max / ticks) * i));

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "24px 28px 22px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <ChartTypeToggle
          value={kind}
          onChange={setKind}
          options={[
            { key: "area", label: "Area", icon: ChartIcons.area },
            { key: "line", label: "Line", icon: ChartIcons.line },
            { key: "bar",  label: "Bar",  icon: ChartIcons.bar  },
          ]}
        />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {tickValues.map((v, i) => {
          const y = padding.top + yScale(v);
          return (
            <g key={i}>
              <line x1={padding.left} x2={padding.left + innerW} y1={y} y2={y} stroke="rgba(0,0,0,0.06)" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" style={{ fontSize: 10, fill: "#9A9A9A" }}>
                {fmtEur(v)}
              </text>
            </g>
          );
        })}
        {monthlyLeakage.map((m, i) => (
          <text key={i} x={padding.left + i * xStep} y={H - 12} textAnchor="middle" style={{ fontSize: 10, fill: "#9A9A9A" }}>
            {m.month}
          </text>
        ))}
        {kind === "bar" && monthlyLeakage.map((m, i) => {
          const barW = Math.min(28, xStep - 12);
          const x = padding.left + i * xStep - barW / 2;
          const h = (m.value / max) * innerH;
          return (
            <rect
              key={i}
              x={x}
              y={padding.top + innerH - h}
              width={barW}
              height={h}
              fill="#C4534A"
              opacity={0.85}
              rx={3}
            />
          );
        })}
        {kind === "area" && <path d={areaPath} fill="#C4534A" opacity={0.1} />}
        {(kind === "area" || kind === "line") && (
          <>
            <path d={path} fill="none" stroke="#C4534A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {monthlyLeakage.map((m, i) => (
              <circle
                key={i}
                cx={padding.left + i * xStep}
                cy={padding.top + yScale(m.value)}
                r={3.5}
                fill="#C4534A"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

function MarketBreakdown() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "24px 28px",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 28 }}>
        {leakageByMarket.map((m) => (
          <div key={m.market}>
            <div style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>
              {m.market}
            </div>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.6px", lineHeight: 1.0 }}>
              {fmtEur(m.ytd)}
            </div>
            <div style={{ marginTop: 10, height: 4, background: "#F3F0EA", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${m.share * 2}%`, height: "100%", background: "#C4534A", opacity: 0.85 }} />
            </div>
            <div style={{ fontSize: 11, color: "#6F6B66", marginTop: 6 }}>{m.share}% of total leakage</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: LeakageAiInsight }) {
  const tone =
    insight.category === "biggest" || insight.category === "structural"
      ? { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA" }
      : insight.category === "fastest-growing"
        ? { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0" }
        : { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB" };
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
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: tone.color, opacity: 0.85 }} />
      <span style={{ fontSize: 10, color: tone.color, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
        {insight.category}
      </span>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.25px", lineHeight: 1.3 }}>
        {insight.title}
      </div>
      <p style={{ fontSize: 13, color: EXEC_INK_SECONDARY, lineHeight: 1.6, margin: 0 }}>
        {insight.body}
      </p>
      {insight.link && (
        <Link href={insight.link.href} style={{ marginTop: "auto", paddingTop: 8, fontSize: 12, fontWeight: 500, color: EXEC_ACCENT, textDecoration: "none" }}>
          {insight.link.label} →
        </Link>
      )}
    </div>
  );
}
