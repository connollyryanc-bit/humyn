"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  HealthLevel,
  TeamHealthAiInsight,
  TeamHealthSnapshot,
  teamHealthAiInsights,
  teamHealthSnapshots,
} from "./seed";
import { ScopeBreadcrumb } from "../scope-breadcrumb";
import { describeScope, scopeIsRoot, useExecutiveScope } from "../scope-context";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

const HEALTH_TONES: Record<HealthLevel, { color: string; bg: string; border: string; label: string }> = {
  low:      { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB", label: "Low" },
  medium:   { color: "#5A5754", bg: "#F3F0EA", border: "rgba(0,0,0,0.08)", label: "Medium" },
  elevated: { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0", label: "Elevated" },
  critical: { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA", label: "Critical" },
};

const HEALTH_DIMENSIONS: { key: keyof TeamHealthSnapshot; label: string }[] = [
  { key: "burnoutRisk",           label: "Burnout risk" },
  { key: "leadershipBalance",     label: "Leadership balance" },
  { key: "communicationFriction", label: "Communication friction" },
  { key: "changeReadiness",       label: "Change readiness" },
];

export default function TeamHealthPage() {
  const { scope } = useExecutiveScope();
  const filteredTeams = useMemo(() => {
    let list = teamHealthSnapshots;
    if (scope.region !== "Europe") list = list.filter((t) => t.region === scope.region);
    if (scope.market) list = list.filter((t) => t.market === scope.market);
    return list;
  }, [scope.region, scope.market]);

  const totals = useMemo(() => {
    const elevatedOrCritical = filteredTeams.filter(
      (t) => t.composite === "elevated" || t.composite === "critical",
    ).length;
    const burnoutFlags = filteredTeams.filter(
      (t) => t.burnoutRisk === "elevated" || t.burnoutRisk === "critical",
    ).length;
    const avgUtilisation = filteredTeams.length
      ? filteredTeams.reduce((s, t) => s + t.utilisation, 0) / filteredTeams.length
      : 0;
    const teamsAt95Plus = filteredTeams.filter((t) => t.weeksAbove95 >= 4).length;
    return { elevatedOrCritical, burnoutFlags, avgUtilisation, teamsAt95Plus };
  }, [filteredTeams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/team-health" />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" }}>
        <Link
          href="/executive"
          style={{ fontSize: 12, color: EXEC_INK_SECONDARY, textDecoration: "none", display: "inline-block", marginBottom: 18 }}
        >
          ← Executive home
        </Link>

        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
            Executive · Module 7
          </div>
          <h1 className="font-display" style={{ fontSize: 48, fontWeight: 600, color: EXEC_INK, letterSpacing: "-1px", margin: "12px 0 14px", lineHeight: 1.05, maxWidth: 880 }}>
            Team Health Overlay
          </h1>
          <p style={{ fontSize: 15, color: EXEC_INK_SECONDARY, maxWidth: 760, lineHeight: 1.7, margin: 0 }}>
            Humyn intelligence applied to delivery risk. Burnout, leadership balance, communication
            friction, change readiness — surfaced as supporting context for operational signals,
            never as the primary lens.
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

        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              padding: "12px 20px",
              background: "#FAFAF8",
              border: "0.5px solid rgba(0,0,0,0.06)",
              borderRadius: 12,
              fontSize: 12,
              color: EXEC_INK_SECONDARY,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: EXEC_INK }}>How to read this module:</strong> the operational
            modules (Capacity, Pipeline, Revenue Leakage, Financial) are the lens executives use to
            run the firm. This view adds the human-context layer that explains <em>why</em> a
            delivery risk is elevated, or whether a team can absorb another engagement. Use it
            after the operational data, not before it.
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <HeroStat label="Teams at elevated risk" value={String(totals.elevatedOrCritical)} detail={`Out of ${filteredTeams.length} active team${filteredTeams.length === 1 ? "" : "s"}`} tone={totals.elevatedOrCritical >= 2 ? "warning" : "neutral"} />
            <HeroStat label="Burnout flags" value={String(totals.burnoutFlags)} detail="Individuals flagged above utilisation threshold" tone={totals.burnoutFlags >= 1 ? "critical" : "neutral"} />
            <HeroStat label="Avg utilisation" value={`${Math.round(totals.avgUtilisation)}%`} detail="Across active engagements" tone={totals.avgUtilisation >= 85 ? "warning" : "neutral"} />
            <HeroStat label="Teams >95% for 4+ weeks" value={String(totals.teamsAt95Plus)} detail="Persistent overrun threshold" tone={totals.teamsAt95Plus >= 1 ? "warning" : "positive"} />
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Team health matrix</SectionLabel>
          <TeamMatrix snapshots={filteredTeams} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Team narratives</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredTeams.map((t) => (
              <TeamCard key={t.team} snapshot={t} />
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>AI insights</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
            {teamHealthAiInsights.map((i, idx) => (
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

function TeamMatrix({ snapshots }: { snapshots: TeamHealthSnapshot[] }) {
  return (
    <div style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 14, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `minmax(0, 2fr) repeat(${HEALTH_DIMENSIONS.length}, 1fr) 110px`,
          gap: 0,
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
        <div>Team</div>
        {HEALTH_DIMENSIONS.map((d) => (
          <div key={d.key} style={{ textAlign: "center" }}>
            {d.label}
          </div>
        ))}
        <div style={{ textAlign: "right" }}>Composite</div>
      </div>
      {snapshots.map((t) => (
        <div
          key={t.team}
          style={{
            display: "grid",
            gridTemplateColumns: `minmax(0, 2fr) repeat(${HEALTH_DIMENSIONS.length}, 1fr) 110px`,
            gap: 0,
            padding: "14px 22px",
            borderTop: "0.5px solid rgba(0,0,0,0.05)",
            alignItems: "center",
            fontSize: 13,
            color: EXEC_INK,
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{t.team}</div>
            <div style={{ fontSize: 11, color: "#6F6B66", marginTop: 2 }}>
              {t.utilisation}% util · {t.weeksAbove95 > 0 ? `${t.weeksAbove95} wk ≥95%` : "stable"}
            </div>
          </div>
          {HEALTH_DIMENSIONS.map((d) => {
            const level = t[d.key] as HealthLevel;
            const tone = HEALTH_TONES[level];
            return (
              <div key={d.key} style={{ display: "flex", justifyContent: "center" }}>
                <span
                  title={tone.label}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: tone.bg,
                    border: `0.5px solid ${tone.border}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tone.color }} />
                </span>
              </div>
            );
          })}
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 100,
                background: HEALTH_TONES[t.composite].bg,
                border: `0.5px solid ${HEALTH_TONES[t.composite].border}`,
                color: HEALTH_TONES[t.composite].color,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {HEALTH_TONES[t.composite].label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamCard({ snapshot }: { snapshot: TeamHealthSnapshot }) {
  const tone = HEALTH_TONES[snapshot.composite];
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: tone.color, opacity: 0.85 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="font-display" style={{ fontSize: 18, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.3px" }}>
          {snapshot.team}
        </div>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 100,
            background: tone.bg,
            border: `0.5px solid ${tone.border}`,
            color: tone.color,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {tone.label}
        </span>
        <span style={{ fontSize: 11, color: "#9A9A9A", marginLeft: "auto" }}>
          {snapshot.client} · {snapshot.market}
        </span>
      </div>
      <p style={{ fontSize: 13.5, color: EXEC_INK_SECONDARY, lineHeight: 1.6, margin: 0 }}>{snapshot.contextSummary}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: TeamHealthAiInsight }) {
  const tone =
    insight.category === "burnout"
      ? { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA" }
      : insight.category === "delivery-risk" || insight.category === "leadership"
        ? { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0" }
        : { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB" };
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
