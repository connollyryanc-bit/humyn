"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EnergyKey, Person, energy } from "../page";
import { PersonWithCapacity } from "../lib/capacity-data";
import { EnergyRing } from "../components/energy";
import {
  fetchEnrichedPeople,
  fetchInsightsBoard,
} from "../lib/api-client";

const MARKETS = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"] as const;
type Market = typeof MARKETS[number];
const ENERGIES: EnergyKey[] = ["driver", "energizer", "supporter", "analyst"];

function HumynWordmark({ size = 22 }: { size?: number }) {
  return (
    <span
      className="font-display"
      style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.5px", color: "#161311" }}
    >
      hum<span style={{ color: "#FF5040" }}>y</span>n
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#9A9A9A",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 500,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone: { color: string; bg: string; border: string };
}) {
  return (
    <div
      style={{
        background: tone.bg,
        border: `0.5px solid ${tone.border}`,
        borderRadius: 12,
        padding: "1.1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#9A9A9A",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: tone.color,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.45 }}>{detail}</div>
      )}
    </div>
  );
}

function MiniBars({ scores }: { scores: Record<EnergyKey, number> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {ENERGIES.map((c) => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#5A5A5A", width: 60, fontWeight: 500 }}>
            {energy[c].label}
          </span>
          <div style={{ flex: 1, height: 4, background: "#EDEDEA", borderRadius: 2 }}>
            <div
              style={{
                width: `${Math.min(scores[c], 100)}%`,
                height: "100%",
                background: energy[c].color,
                borderRadius: 2,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              color: energy[c].text,
              width: 28,
              textAlign: "right",
              fontWeight: 600,
            }}
          >
            {scores[c]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function MarketSummaryCard({
  name,
  people,
}: {
  name: Market;
  people: PersonWithCapacity[];
}) {
  if (people.length === 0) {
    return (
      <Card>
        <div
          className="font-display"
          style={{ fontSize: 18, fontWeight: 600, color: "#161311", letterSpacing: "-0.3px" }}
        >
          {name}
        </div>
        <div style={{ fontSize: 12, color: "#9A9A9A", marginTop: 8 }}>
          No consultants on record.
        </div>
      </Card>
    );
  }

  const sum = { driver: 0, energizer: 0, supporter: 0, analyst: 0 };
  people.forEach((p) => {
    sum.driver += p.scores.driver;
    sum.energizer += p.scores.energizer;
    sum.supporter += p.scores.supporter;
    sum.analyst += p.scores.analyst;
  });
  const n = people.length;
  const avgEnergies: Record<EnergyKey, number> = {
    driver: Math.round(sum.driver / n),
    energizer: Math.round(sum.energizer / n),
    supporter: Math.round(sum.supporter / n),
    analyst: Math.round(sum.analyst / n),
  };
  const dominant = ENERGIES.reduce(
    (best, k) => (avgEnergies[k] > avgEnergies[best] ? k : best),
    "driver" as EnergyKey,
  );
  const avgUtil = Math.round(people.reduce((s, p) => s + p.utilisation, 0) / n);
  const dailyRate = people.reduce((s, p) => s + (p.dayRate || 1500), 0);
  const e = energy[dominant];
  const utilColor =
    avgUtil >= 80 ? "#1A5C38" : avgUtil >= 70 ? "#8B5A00" : "#9B2A1A";

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            className="font-display"
            style={{ fontSize: 18, fontWeight: 600, color: "#161311", letterSpacing: "-0.3px" }}
          >
            {name}
          </div>
          <div style={{ fontSize: 11, color: "#5A5A5A", marginTop: 2 }}>
            {n} consultant{n === 1 ? "" : "s"}
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 100,
            background: e.bg,
            color: e.text,
            border: `0.5px solid ${e.border}`,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
          {e.label}
        </span>
      </div>

      <MiniBars scores={avgEnergies} />

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Avg utilisation
          </div>
          <div
            className="font-display"
            style={{ fontSize: 17, fontWeight: 700, color: utilColor, marginTop: 2 }}
          >
            {avgUtil}%
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Billable capacity
          </div>
          <div
            className="font-display"
            style={{ fontSize: 17, fontWeight: 700, color: "#161311", marginTop: 2 }}
          >
            €{(dailyRate / 1000).toFixed(1)}k/day
          </div>
        </div>
      </div>
    </Card>
  );
}

function anonymiseName(name: string, location: string): string {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return `${initials} · ${location}`;
}

export default function BoardPage() {
  const [enriched, setEnriched] = useState<PersonWithCapacity[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [showNames, setShowNames] = useState(false);
  const [aiNarrative, setAiNarrative] = useState<string>("");
  const [aiSource, setAiSource] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetchEnrichedPeople()
      .then((list) => {
        if (cancelled) return;
        setEnriched(list);
        setLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load.");
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchInsightsBoard()
      .then((res) => {
        if (cancelled) return;
        setAiNarrative(res.narrative);
        setAiSource(res.source ?? "claude");
      })
      .catch(() => {
        // silent fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    if (enriched.length === 0) {
      return null;
    }
    const flightRisks = enriched.filter(
      (p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium",
    );
    const burnouts = enriched.filter((p) => p.capacity.burnoutRisk);
    const revenueAtRisk = flightRisks.reduce(
      (s, p) => s + p.capacity.lostRevenue3Months,
      0,
    );
    const attritionExposure = enriched.reduce(
      (s, p) =>
        s +
        p.capacity.replacementCost +
        p.capacity.lostRevenue3Months +
        p.capacity.onboardingCost,
      0,
    );
    const avgUtil = Math.round(
      enriched.reduce((s, p) => s + p.utilisation, 0) / enriched.length,
    );
    const avgLoyalty = Math.round(
      enriched.reduce((s, p) => s + p.capacity.loyaltyScore, 0) / enriched.length,
    );
    const dailyBillable = enriched.reduce((s, p) => s + (p.dayRate || 1500), 0);
    const burnoutCost = burnouts.reduce(
      (s, p) =>
        s +
        p.capacity.replacementCost +
        p.capacity.lostRevenue3Months +
        p.capacity.onboardingCost,
      0,
    );

    const sum = { driver: 0, energizer: 0, supporter: 0, analyst: 0 };
    enriched.forEach((p) => {
      sum.driver += p.scores.driver;
      sum.energizer += p.scores.energizer;
      sum.supporter += p.scores.supporter;
      sum.analyst += p.scores.analyst;
    });
    const n = enriched.length;
    const orgEnergies: Record<EnergyKey, number> = {
      driver: Math.round(sum.driver / n),
      energizer: Math.round(sum.energizer / n),
      supporter: Math.round(sum.supporter / n),
      analyst: Math.round(sum.analyst / n),
    };
    const orgDominant: EnergyKey = ENERGIES.reduce(
      (best, k) => (orgEnergies[k] > orgEnergies[best] ? k : best),
      "driver" as EnergyKey,
    );

    const topExposure = [...enriched]
      .sort((a, b) => {
        const ac = a.capacity.replacementCost + a.capacity.lostRevenue3Months + a.capacity.onboardingCost;
        const bc = b.capacity.replacementCost + b.capacity.lostRevenue3Months + b.capacity.onboardingCost;
        return bc - ac;
      })
      .slice(0, 5);

    return {
      flightRisks,
      burnouts,
      revenueAtRisk,
      attritionExposure,
      avgUtil,
      avgLoyalty,
      dailyBillable,
      burnoutCost,
      orgEnergies,
      orgDominant,
      topExposure,
    };
  }, [enriched]);

  const generatedAt = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const utilTone =
    metrics && metrics.avgUtil >= 80
      ? { color: "#1A5C38", bg: "#EEF7F2", border: "#9ED4B8" }
      : metrics && metrics.avgUtil >= 70
        ? { color: "#8B5A00", bg: "#FFFBF2", border: "#FAD98A" }
        : { color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" };

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
      <header
        className="board-no-print"
        style={{
          height: 52,
          background: "#FFFFFF",
          borderBottom: "0.5px solid rgba(0,0,0,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <Link href="/">
            <HumynWordmark />
          </Link>
          <nav style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            <Link
              href="/"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              People
            </Link>
            <Link
              href="/teams"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Teams
            </Link>
            <Link
              href="/available"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Available
            </Link>
            <Link
              href="/capacity"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Capacity
            </Link>
            <Link
              href="/insights"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Insights
            </Link>
            <Link
              href="/board"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#FFFFFF",
                background: "#161311",
              }}
            >
              Board
            </Link>
            <Link
              href="/settings/rate-card"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Rates
            </Link>
          </nav>
          <div style={{ flex: 1 }} />
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#5A5A5A",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showNames}
              onChange={(e) => setShowNames(e.target.checked)}
            />
            Show names
          </label>
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Print / export PDF
          </button>
        </div>
      </header>

      <style>{`
        @media print {
          .board-no-print { display: none !important; }
          body { background: #FFFFFF !important; }
          main { padding: 0 !important; }
        }
      `}</style>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Compass · Executive board read · {generatedAt}
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.5px",
              margin: "6px 0 4px",
            }}
          >
            Board dashboard
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
            A 90-second read of where Valtech Nordic stands this week — strategic posture,
            financial exposure, capacity, and the Pulse Map of the workforce. Names are masked by
            default; toggle &ldquo;Show names&rdquo; for the operating team review.
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              background: "#FDF0EE",
              border: "0.5px solid #FCCDC6",
              borderRadius: 10,
              fontSize: 13,
              color: "#9B2A1A",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {!loaded || !metrics ? (
          <Card>Loading board…</Card>
        ) : (
          <>
            <div
              style={{
                background: "#161311",
                borderRadius: 12,
                padding: "1.5rem 1.75rem",
                color: "#FFFFFF",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                <span>Executive read</span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: aiSource === "claude" ? "#F5A623" : "rgba(255,255,255,0.12)",
                    color: aiSource === "claude" ? "#161311" : "rgba(255,255,255,0.7)",
                    fontSize: 9,
                    letterSpacing: "0.07em",
                  }}
                >
                  {aiSource === "claude" ? "AI · Claude" : aiSource ? "Fallback" : "Loading…"}
                </span>
              </div>
              <p
                className="font-display"
                style={{
                  fontSize: 22,
                  lineHeight: 1.5,
                  margin: 0,
                  fontWeight: 400,
                  letterSpacing: "-0.2px",
                  color: "#FFFFFF",
                }}
              >
                {aiNarrative || "Generating the board read…"}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <HeroMetric
                label="Headcount"
                value={String(enriched.length)}
                detail={`Across ${MARKETS.filter((m) => enriched.some((p) => p.location === m)).length} Nordic markets`}
                tone={{ color: "#161311", bg: "#FFFFFF", border: "rgba(0,0,0,0.07)" }}
              />
              <HeroMetric
                label="Avg utilisation"
                value={`${metrics.avgUtil}%`}
                detail={`${80 - metrics.avgUtil >= 0 ? `${80 - metrics.avgUtil}pp below 80% target` : `${metrics.avgUtil - 80}pp above 80% target`}`}
                tone={utilTone}
              />
              <HeroMetric
                label="Billable capacity"
                value={`€${(metrics.dailyBillable / 1000).toFixed(1)}k/day`}
                detail={`Combined day rate across the workforce`}
                tone={{ color: "#161311", bg: "#FFFFFF", border: "rgba(0,0,0,0.07)" }}
              />
              <HeroMetric
                label="Revenue at risk"
                value={`€${(metrics.revenueAtRisk / 1000).toFixed(0)}k`}
                detail={`3-month exposure from ${metrics.flightRisks.length} flight risk${metrics.flightRisks.length === 1 ? "" : "s"}`}
                tone={{ color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" }}
              />
              <HeroMetric
                label="Attrition exposure"
                value={`€${(metrics.attritionExposure / 1000000).toFixed(2)}M`}
                detail="Total cost if every consultant left"
                tone={{ color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" }}
              />
              <HeroMetric
                label="Avg loyalty"
                value={`${metrics.avgLoyalty}/100`}
                detail={
                  metrics.avgLoyalty >= 75
                    ? "Healthy"
                    : metrics.avgLoyalty >= 60
                      ? "Watch"
                      : "Concerning"
                }
                tone={
                  metrics.avgLoyalty >= 75
                    ? { color: "#1A5C38", bg: "#EEF7F2", border: "#9ED4B8" }
                    : metrics.avgLoyalty >= 60
                      ? { color: "#8B5A00", bg: "#FFFBF2", border: "#FAD98A" }
                      : { color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" }
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Card>
                <SectionLabel>Pan-Nordic Pulse Map</SectionLabel>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 240px) minmax(0, 1fr)",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <EnergyRing
                      scores={metrics.orgEnergies}
                      position="Whole org"
                      primary={metrics.orgDominant}
                      size={220}
                    />
                  </div>
                  <div>
                    <MiniBars scores={metrics.orgEnergies} />
                    <div
                      style={{
                        marginTop: 14,
                        fontSize: 12,
                        color: "#5A5A5A",
                        lineHeight: 1.6,
                      }}
                    >
                      The organisation leans{" "}
                      <span style={{ color: energy[metrics.orgDominant].text, fontWeight: 700 }}>
                        {energy[metrics.orgDominant].label}
                      </span>{" "}
                      ({metrics.orgEnergies[metrics.orgDominant]}%) across {enriched.length}{" "}
                      consultants. The Pulse posture below shows the energy mix Valtech Nordic
                      brings to client engagements.
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionLabel>Burnout watch</SectionLabel>
                {metrics.burnouts.length === 0 ? (
                  <div
                    style={{
                      padding: 16,
                      background: "#EEF7F2",
                      border: "0.5px solid #9ED4B8",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#1A5C38",
                      lineHeight: 1.55,
                    }}
                  >
                    No burnout flags this week. The organisation is operating within sustainable
                    utilisation thresholds.
                  </div>
                ) : (
                  <>
                    <div
                      className="font-display"
                      style={{
                        fontSize: 30,
                        fontWeight: 700,
                        color: "#8B5A00",
                        letterSpacing: "-0.5px",
                        marginBottom: 4,
                      }}
                    >
                      {metrics.burnouts.length} flagged
                    </div>
                    <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.6, marginBottom: 12 }}>
                      Consultants sustaining above 86% utilisation. The replacement cost if any
                      stepped back is{" "}
                      <strong style={{ color: "#161311" }}>
                        €{(metrics.burnoutCost / 1000).toFixed(0)}k
                      </strong>{" "}
                      across the flagged group — almost always cheaper to give them a recovery
                      week than to handle a surprise resignation.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {metrics.burnouts.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            padding: "8px 12px",
                            background: "#FFFBF2",
                            border: "0.5px solid #FAD98A",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "#8B5A00",
                          }}
                        >
                          {showNames ? p.name : anonymiseName(p.name, p.location)} ·{" "}
                          {p.utilisation}% util
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>

            <Card style={{ marginBottom: 12 }}>
              <SectionLabel>Top retention exposure · 5 highest-cost departures</SectionLabel>
              <div style={{ fontSize: 12, color: "#5A5A5A", marginBottom: 14, lineHeight: 1.55, maxWidth: 640 }}>
                The five consultants whose departure would cost the most when summing recruitment,
                three-month lost revenue and onboarding. Where the cost concentration is, the
                retention focus should be.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {metrics.topExposure.map((p) => {
                  const cost =
                    p.capacity.replacementCost +
                    p.capacity.lostRevenue3Months +
                    p.capacity.onboardingCost;
                  const riskTone =
                    p.capacity.riskLevel === "high"
                      ? { bg: "#FDF0EE", text: "#9B2A1A", border: "#FCCDC6" }
                      : p.capacity.riskLevel === "medium"
                        ? { bg: "#FFFBF2", text: "#8B5A00", border: "#FAD98A" }
                        : p.capacity.riskLevel === "watch"
                          ? { bg: "#F7F6F3", text: "#5A5A5A", border: "rgba(0,0,0,0.07)" }
                          : { bg: "#EEF7F2", text: "#1A5C38", border: "#9ED4B8" };
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: "#FAFAF8",
                        border: "0.5px solid rgba(0,0,0,0.07)",
                        borderRadius: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#161311",
                          fontWeight: 600,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {showNames
                          ? `${p.name} · ${p.role} · ${p.location}`
                          : `${anonymiseName(p.name, p.location)} · ${p.role}`}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 100,
                          background: riskTone.bg,
                          color: riskTone.text,
                          border: `0.5px solid ${riskTone.border}`,
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.capacity.riskLevel} risk · loyalty {p.capacity.loyaltyScore}
                      </span>
                      <span
                        className="font-display"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#9B2A1A",
                          width: 90,
                          textAlign: "right",
                        }}
                      >
                        €{(cost / 1000).toFixed(0)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <SectionLabel>Market posture · Stockholm · Oslo · Copenhagen · Helsinki</SectionLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 12,
                }}
              >
                {MARKETS.map((m) => (
                  <MarketSummaryCard
                    key={m}
                    name={m}
                    people={enriched.filter((p) => p.location === m)}
                  />
                ))}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
