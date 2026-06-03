"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  Skill,
  SkillsAiInsight,
  skills,
  skillsAiInsights,
} from "./seed";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

type HorizonKey = "6m" | "12m" | "24m";

const HORIZONS: { key: HorizonKey; label: string; field: keyof Pick<Skill, "demand6m" | "demand12m" | "demand24m"> }[] = [
  { key: "6m",  label: "6 months",  field: "demand6m" },
  { key: "12m", label: "12 months", field: "demand12m" },
  { key: "24m", label: "24 months", field: "demand24m" },
];

export default function SkillsIntelligencePage() {
  const [horizon, setHorizon] = useState<HorizonKey>("12m");
  const horizonMeta = HORIZONS.find((h) => h.key === horizon)!;

  const enriched = useMemo(() => {
    return skills.map((s) => {
      const demand = s[horizonMeta.field];
      const gap = demand - s.currentSupply;
      const ratio = s.currentSupply === 0 ? Infinity : demand / s.currentSupply;
      return { ...s, demand, gap, ratio };
    });
  }, [horizonMeta]);

  const totals = useMemo(() => {
    const totalSupply = enriched.reduce((s, e) => s + e.currentSupply, 0);
    const totalDemand = enriched.reduce((s, e) => s + e.demand, 0);
    const criticalGaps = enriched.filter((e) => e.gap >= 5 && e.criticalityScore >= 75).length;
    const decliningSkills = enriched.filter((e) => e.trend === "declining").length;
    return { totalSupply, totalDemand, criticalGaps, decliningSkills };
  }, [enriched]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/skills" />

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
          <div style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
            Executive · Module 5
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
            Skills Intelligence
          </h1>
          <p style={{ fontSize: 15, color: EXEC_INK_SECONDARY, maxWidth: 760, lineHeight: 1.7, margin: 0 }}>
            Current capability inventory against forecast demand at 6, 12 and 24 months.
            Where the gaps are widening, which skills are declining, and which adjacencies make
            upskilling cheaper than hiring.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <HorizonPicker horizon={horizon} setHorizon={setHorizon} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <HeroStat label="Total supply" value={String(totals.totalSupply)} detail="FTEs across all capabilities" tone="neutral" />
            <HeroStat label={`Total demand ${horizonMeta.label}`} value={String(totals.totalDemand)} detail="Forecast FTE need across the inventory" tone="warning" />
            <HeroStat label="Critical gaps" value={String(totals.criticalGaps)} detail="Skills with ≥5 FTE gap + high criticality" tone="critical" />
            <HeroStat label="Declining skills" value={String(totals.decliningSkills)} detail="Demand decreasing — upskilling sources" tone="positive" />
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Capability heat map · supply vs demand</SectionLabel>
          <SkillsTable enriched={enriched} horizonLabel={horizonMeta.label} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Critical gaps · top 6</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {[...enriched]
              .filter((e) => e.gap > 0)
              .sort((a, b) => b.criticalityScore * b.gap - a.criticalityScore * a.gap)
              .slice(0, 6)
              .map((e) => (
                <CriticalGapCard key={e.name} skill={e} horizonLabel={horizonMeta.label} />
              ))}
          </div>
        </section>

        <section>
          <SectionLabel>AI insights</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
            {skillsAiInsights.map((i, idx) => (
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

function HorizonPicker({ horizon, setHorizon }: { horizon: HorizonKey; setHorizon: (h: HorizonKey) => void }) {
  return (
    <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 12 }}>
      {HORIZONS.map((h) => (
        <button
          key={h.key}
          onClick={() => setHorizon(h.key)}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "none",
            background: horizon === h.key ? EXEC_INK : "transparent",
            color: horizon === h.key ? "#F3F0EA" : EXEC_INK_SECONDARY,
            fontSize: 12.5,
            fontWeight: horizon === h.key ? 500 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {h.label}
        </button>
      ))}
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

function SkillsTable({ enriched, horizonLabel }: { enriched: ReturnType<typeof getEnriched>; horizonLabel: string }) {
  const categories = Array.from(new Set(enriched.map((e) => e.category)));
  return (
    <div style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 14, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) 100px 100px 110px 1fr 110px",
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
        <div>Skill</div>
        <div style={{ textAlign: "right" }}>Supply</div>
        <div style={{ textAlign: "right" }}>Demand {horizonLabel.split(" ")[0]}</div>
        <div style={{ textAlign: "right" }}>Gap</div>
        <div>Supply vs demand</div>
        <div style={{ textAlign: "right" }}>Trend</div>
      </div>
      {categories.map((category) => (
        <div key={category}>
          <div style={{ padding: "12px 22px 6px", fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, background: "#FCFCFA", borderTop: "0.5px solid rgba(0,0,0,0.05)" }}>
            {category}
          </div>
          {enriched
            .filter((e) => e.category === category)
            .map((e) => (
              <SkillRow key={e.name} skill={e} />
            ))}
        </div>
      ))}
    </div>
  );
}

function SkillRow({ skill }: { skill: ReturnType<typeof getEnriched>[number] }) {
  const supplyPct = Math.min(100, (skill.currentSupply / Math.max(skill.demand, 1)) * 100);
  const isGap = skill.gap > 0;
  const isShortage = skill.gap > 0 && skill.criticalityScore >= 60;
  const gapColor = isShortage ? "#C4534A" : isGap ? "#B87A2E" : "#3D8A61";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) 100px 100px 110px 1fr 110px",
        gap: 12,
        padding: "14px 22px",
        borderTop: "0.5px solid rgba(0,0,0,0.04)",
        alignItems: "center",
        fontSize: 13,
        color: EXEC_INK,
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{skill.name}</div>
        {skill.certifiedCount > 0 && (
          <div style={{ fontSize: 11, color: "#6F6B66", marginTop: 2 }}>
            {skill.certifiedCount} certified
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{skill.currentSupply}</div>
      <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{skill.demand}</div>
      <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: gapColor, fontWeight: 600 }}>
        {skill.gap > 0 ? `−${skill.gap}` : skill.gap === 0 ? "0" : `+${Math.abs(skill.gap)}`}
      </div>
      <div style={{ height: 8, background: "#F3F0EA", borderRadius: 4, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${supplyPct}%`, background: EXEC_ACCENT, opacity: 0.85, borderRadius: 4 }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 11 }}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 9px",
            borderRadius: 100,
            background: skill.trend === "rising" ? "#FEF8EE" : skill.trend === "declining" ? "#F3F0EA" : "#FAFAF8",
            border: `0.5px solid ${skill.trend === "rising" ? "#F2DCB0" : skill.trend === "declining" ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.07)"}`,
            color: skill.trend === "rising" ? "#B87A2E" : skill.trend === "declining" ? "#6F6B66" : "#5A5754",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {skill.trend === "rising" ? "↑ Rising" : skill.trend === "declining" ? "↓ Declining" : "→ Stable"}
        </span>
      </div>
    </div>
  );
}

function CriticalGapCard({ skill, horizonLabel }: { skill: ReturnType<typeof getEnriched>[number]; horizonLabel: string }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "#C4534A", opacity: 0.85 }} />
      <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
        {skill.category} · {horizonLabel}
      </div>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.2px", lineHeight: 1.25 }}>
        {skill.name}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Cell label="Supply" value={String(skill.currentSupply)} />
        <Cell label="Demand" value={String(skill.demand)} />
        <Cell label="Gap" value={`−${skill.gap}`} tone="critical" />
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: EXEC_INK_SECONDARY }}>
        Criticality {skill.criticalityScore} · Upskill feasibility {skill.upskillFeasibility}%
      </div>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "critical" }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 3 }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: 16, fontWeight: 600, color: tone === "critical" ? "#C4534A" : EXEC_INK, letterSpacing: "-0.2px" }}>
        {value}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: SkillsAiInsight }) {
  const tone =
    insight.category === "critical-gap"
      ? { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA" }
      : insight.category === "upskill"
        ? { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB" }
        : { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0" };
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

// Type helper for enriched skill rows
type EnrichedSkill = Skill & { demand: number; gap: number; ratio: number };
function getEnriched(): EnrichedSkill[] {
  return [];
}
