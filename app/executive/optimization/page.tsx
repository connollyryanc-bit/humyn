"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  Action,
  ActionTier,
  OptimizationAiInsight,
  kindLabel,
  optimizationActions,
  optimizationAiInsights,
  tierMeta,
} from "./seed";
import { ScopeBreadcrumb } from "../scope-breadcrumb";
import { describeScope, scopeIsRoot, useExecutiveScope } from "../scope-context";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

function fmtEur(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${value}`;
}

type TierFilter = "all" | ActionTier;

export default function OptimizationPage() {
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [showAi, setShowAi] = useState(true);
  // showAi reserved for future toggle; suppress unused warning
  void showAi;
  void setShowAi;
  const { scope } = useExecutiveScope();

  const actions = useMemo(() => {
    let list = tierFilter === "all" ? optimizationActions : optimizationActions.filter((a) => a.tier === tierFilter);
    if (scope.practice) {
      list = list.filter((a) =>
        a.affects.some((aff) => aff.toLowerCase().includes((scope.practice ?? "").toLowerCase())),
      );
    }
    if (scope.market) {
      list = list.filter((a) =>
        a.affects.some((aff) => aff.toLowerCase().includes((scope.market ?? "").toLowerCase())),
      );
    }
    return [...list].sort((a, b) => {
      // Sort by tier first (internal → partner → hire), then by impact/cost efficiency
      const tierOrder: Record<ActionTier, number> = { internal: 0, partner: 1, hire: 2 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
      const aEff = a.costEur === 0 ? Infinity : a.impactEur / a.costEur;
      const bEff = b.costEur === 0 ? Infinity : b.impactEur / b.costEur;
      return bEff - aEff;
    });
  }, [tierFilter, scope]);

  const totals = useMemo(() => {
    const totalImpact = actions.reduce((s, a) => s + a.impactEur, 0);
    const totalCost = actions.reduce((s, a) => s + a.costEur, 0);
    const totalActions = actions.length;
    const internalShare = actions.filter((a) => a.tier === "internal").length;
    return { totalImpact, totalCost, totalActions, internalShare };
  }, [actions]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/optimization" />

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
            Executive · Module 4
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
            Workforce Optimization Engine
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
            AI evaluates redeployment, upskilling, reskilling, partners and freelancers
            <em style={{ fontStyle: "italic", color: EXEC_INK }}> before</em> recommending any
            hiring or workforce reduction. Every recommendation carries impact, cost, risk,
            time-to-value and a confidence score.
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
          <TierBanner />
        </section>

        <section style={{ marginBottom: 32 }}>
          <TierFilterPicker filter={tierFilter} setFilter={setTierFilter} />
        </section>

        <section style={{ marginBottom: 44 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <HeroStat label="Actions identified" value={String(totals.totalActions)} detail={`${totals.internalShare} internal · ${totals.totalActions - totals.internalShare} external`} tone="neutral" />
            <HeroStat label="Total impact" value={fmtEur(totals.totalImpact)} detail="Combined revenue / cost-avoidance if all actions taken" tone="positive" />
            <HeroStat label="Total cost" value={fmtEur(totals.totalCost)} detail={`${Math.round((totals.totalImpact / Math.max(totals.totalCost, 1)) * 10) / 10}× impact-to-cost ratio`} tone="positive" />
            <HeroStat label="Internal-first savings" value="€820k" detail="vs hire-first counterfactual YTD" tone="positive" />
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>Recommended actions</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {actions.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
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
            {optimizationAiInsights.map((i, idx) => (
              <InsightCard key={idx} insight={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function TierBanner() {
  const tiers: ActionTier[] = ["internal", "partner", "hire"];
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "20px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 0,
        alignItems: "stretch",
      }}
    >
      {tiers.map((t, i) => {
        const meta = tierMeta[t];
        return (
          <div
            key={t}
            style={{
              padding: "8px 18px",
              borderRight: i < tiers.length - 1 ? "0.5px solid rgba(0,0,0,0.07)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: meta.color,
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
              <div style={{ fontSize: 13, fontWeight: 600, color: EXEC_INK }}>{meta.label}</div>
            </div>
            <div style={{ fontSize: 11.5, color: EXEC_INK_SECONDARY, lineHeight: 1.5, paddingLeft: 34 }}>
              {meta.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TierFilterPicker({ filter, setFilter }: { filter: TierFilter; setFilter: (f: TierFilter) => void }) {
  const items: { key: TierFilter; label: string }[] = [
    { key: "all",      label: "All tiers" },
    { key: "internal", label: "Internal moves" },
    { key: "partner",  label: "Partners" },
    { key: "hire",     label: "Hire / reduce" },
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
          }}
        >
          {i.label}
        </button>
      ))}
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
      <div style={{ fontSize: 10, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 38, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.8px", lineHeight: 1.0 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#5A5754", lineHeight: 1.5, marginTop: "auto" }}>{detail}</div>
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const meta = tierMeta[action.tier];
  const efficiency = action.costEur === 0 ? "∞" : `${(action.impactEur / action.costEur).toFixed(1)}×`;
  const riskTone =
    action.risk === "low"
      ? { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB" }
      : action.risk === "medium"
        ? { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0" }
        : { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA" };
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "22px 24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: meta.color, opacity: 0.85 }} />

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 100,
            background: meta.color + "15",
            color: meta.color,
            border: `0.5px solid ${meta.color}33`,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
          {meta.label} · {kindLabel[action.kind]}
        </span>
        <span style={{ fontSize: 11, color: "#9A9A9A", marginLeft: "auto" }}>
          Confidence {action.confidence}%
        </span>
      </div>

      <div>
        <div className="font-display" style={{ fontSize: 19, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.3px", lineHeight: 1.3, marginBottom: 6 }}>
          {action.title}
        </div>
        <p style={{ fontSize: 13.5, color: EXEC_INK_SECONDARY, lineHeight: 1.6, margin: 0 }}>{action.body}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
        <Cell label="Impact" value={fmtEur(action.impactEur)} tone="positive" />
        <Cell label="Cost" value={action.costEur === 0 ? "—" : fmtEur(action.costEur)} />
        <Cell label="Efficiency" value={efficiency} tone="positive" />
        <Cell label="Time to value" value={`${action.timeToValueDays}d`} />
        <Cell label="Risk">
          <span
            style={{
              display: "inline-block",
              padding: "2px 9px",
              borderRadius: 100,
              background: riskTone.bg,
              border: `0.5px solid ${riskTone.border}`,
              color: riskTone.color,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {action.risk}
          </span>
        </Cell>
      </div>

      <div
        style={{
          paddingTop: 12,
          borderTop: "0.5px solid rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          fontSize: 11,
          color: "#6F6B66",
        }}
      >
        <div>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Affects: </span>
          {action.affects.join(", ")}
        </div>
        <div>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Signals: </span>
          {action.linkedSignals.join(" + ")}
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, tone, children }: { label: string; value?: string; tone?: "positive"; children?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </div>
      {value ? (
        <div className="font-display" style={{ fontSize: 17, fontWeight: 600, color: tone === "positive" ? "#3D8A61" : EXEC_INK, letterSpacing: "-0.2px" }}>
          {value}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: OptimizationAiInsight }) {
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
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: EXEC_ACCENT, opacity: 0.85 }} />
      <span style={{ fontSize: 10, color: EXEC_ACCENT, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>{insight.category}</span>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.25px", lineHeight: 1.3 }}>
        {insight.title}
      </div>
      <p style={{ fontSize: 13, color: EXEC_INK_SECONDARY, lineHeight: 1.6, margin: 0 }}>{insight.body}</p>
    </div>
  );
}
