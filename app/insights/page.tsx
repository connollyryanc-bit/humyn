"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EnergyKey, Person, energy } from "../page";
import {
  PersonWithCapacity,
  averageUtilisation,
  benchThresholds,
  buildWeeklyInsight,
  formatEuros,
  riskTone,
} from "../lib/capacity-data";
import { fetchEnrichedPeople, fetchInsightsWeekly } from "../lib/api-client";
import { ENVIRONMENT_SURFACES, TopChrome } from "../components/top-chrome";

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

function Avatar({ person, size = 28 }: { person: Person; size?: number }) {
  const colour = energy[person.primary];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colour.bg,
        color: colour.text,
        border: `0.5px solid ${colour.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: Math.round(size * 0.36),
        flexShrink: 0,
      }}
    >
      {person.initials}
    </div>
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      {children}
    </div>
  );
}

function HeadlineStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
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
          fontSize: 28,
          fontWeight: 700,
          color: tone.color,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.45 }}>{detail}</div>
    </div>
  );
}

function FlagRow({
  person,
  tone,
  headline,
  detail,
}: {
  person: PersonWithCapacity;
  tone: { color: string; bg: string; border: string; text: string; label: string; icon: string };
  headline: string;
  detail: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        background: tone.bg,
        border: `0.5px solid ${tone.border}`,
        borderRadius: 10,
      }}
    >
      <Avatar person={person} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Link
            href={`/people/${person.id}`}
            style={{ fontSize: 14, fontWeight: 600, color: "#161311" }}
          >
            {person.name}
          </Link>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 100,
              background: tone.bg,
              color: tone.text,
              border: `0.5px solid ${tone.border}`,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            <span aria-hidden>{tone.icon}</span>
            {tone.label}
          </span>
        </div>
        <div style={{ fontSize: 13, color: tone.text, fontWeight: 600, marginBottom: 2 }}>
          {headline}
        </div>
        <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.5 }}>{detail}</div>
      </div>
    </div>
  );
}

function MarketBar({
  label,
  count,
  utilisation,
  total,
}: {
  label: string;
  count: number;
  utilisation: number;
  total: number;
}) {
  const tone =
    utilisation >= 80
      ? { color: "#2E8B57", bg: "#EEF7F2" }
      : utilisation >= 70
        ? { color: "#F5A623", bg: "#FFFBF2" }
        : { color: "#E8402A", bg: "#FDF0EE" };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        background: "#FAFAF8",
        borderRadius: 10,
        border: "0.5px solid rgba(0,0,0,0.07)",
      }}
    >
      <div style={{ width: 100, fontSize: 13, fontWeight: 600, color: "#161311" }}>{label}</div>
      <div style={{ flex: 1, height: 6, background: "#EDEDEA", borderRadius: 4 }}>
        <div
          style={{
            width: `${Math.min(utilisation, 100)}%`,
            height: "100%",
            background: tone.color,
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          width: 44,
          fontSize: 12,
          fontWeight: 700,
          color: tone.color,
          textAlign: "right",
        }}
      >
        {utilisation}%
      </div>
      <div style={{ width: 80, fontSize: 11, color: "#9A9A9A", textAlign: "right" }}>
        {count} of {total}
      </div>
    </div>
  );
}

function buildOutlook(enriched: PersonWithCapacity[], avgUtil: number): string {
  const benchPeople = enriched.filter((p) => p.capacity.benchDays > 0);
  const benchDays = benchPeople.reduce((s, p) => s + p.capacity.benchDays, 0);
  const exposure = enriched
    .filter((p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium")
    .reduce((s, p) => s + p.capacity.lostRevenue3Months, 0);

  const burnouts = enriched.filter((p) => p.capacity.burnoutRisk);
  const burnoutNames = burnouts.map((b) => b.name.split(" ")[0]);

  const lowest = [...enriched].sort(
    (a, b) => a.capacity.loyaltyScore - b.capacity.loyaltyScore,
  )[0];

  const gap = 80 - avgUtil;
  const utilSentence =
    gap > 0
      ? `Utilisation stands at ${avgUtil}% — ${gap} points below the 80% Valtech Nordic target. The shortfall is concentrated, not spread: ${benchPeople.length} people account for ${benchDays} bench days between them, and one tighter month of allocation closes most of the gap.`
      : `Utilisation stands at ${avgUtil}% — at or above the 80% target. The team is running tight; the watch is now on people sustaining well above 86% (currently ${burnoutNames.length ? burnoutNames.join(", ") : "none flagged"}).`;

  const exposureSentence =
    exposure > 0
      ? `Three-month revenue exposure from current flight risks is ${formatEuros(exposure)}. The highest-priority retention conversation is with ${lowest.name} (loyalty ${lowest.capacity.loyaltyScore}, ${energy[lowest.primary].label} profile, ${lowest.capacity.benchDays} days on bench).`
      : `No active flight risks this week — revenue exposure from retention is zero, the rare quarter to plan rather than react.`;

  const burnoutSentence =
    burnouts.length === 0
      ? "No burnout flags this week."
      : `Burnout flags sit on ${burnoutNames.join(" and ")} — high engagement that can mask disengagement risk. A planned step-down for either is cheaper than a surprise resignation.`;

  const forward = `Looking forward two weeks: prioritise allocation for ${benchPeople
    .slice(0, 2)
    .map((b) => b.name.split(" ")[0])
    .join(" and ") || "the bench"}, hold pricing on the at-risk client relationships listed below, and protect the recovery weeks for the burnout-flagged engagements.`;

  return `${utilSentence} ${exposureSentence} ${burnoutSentence} ${forward}`;
}

const MARKETS = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"] as const;

export default function InsightsPage() {
  const [enriched, setEnriched] = useState<PersonWithCapacity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchEnrichedPeople()
      .then((list) => {
        if (cancelled) return;
        setEnriched(list);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const avgUtil = averageUtilisation(enriched);

  const flightRisks = useMemo(
    () =>
      enriched
        .filter((p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium")
        .sort((a, b) => a.capacity.loyaltyScore - b.capacity.loyaltyScore),
    [enriched],
  );

  const watchList = useMemo(
    () => enriched.filter((p) => p.capacity.riskLevel === "watch"),
    [enriched],
  );

  const burnouts = useMemo(
    () => enriched.filter((p) => p.capacity.burnoutRisk),
    [enriched],
  );

  const opportunities = useMemo(
    () =>
      enriched
        .filter((p) => p.capacity.benchDays > 0 && p.capacity.riskLevel === "low")
        .sort((a, b) => b.capacity.benchDays - a.capacity.benchDays),
    [enriched],
  );

  const totalExposure = useMemo(
    () =>
      enriched
        .filter((p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium")
        .reduce((s, p) => s + p.capacity.lostRevenue3Months, 0),
    [enriched],
  );

  const protectedRevenue = useMemo(
    () =>
      enriched
        .filter((p) => p.capacity.keyClientAtRisk && p.capacity.riskLevel === "low")
        .reduce((s, p) => s + p.capacity.lostRevenue3Months, 0),
    [enriched],
  );

  const marketRows = useMemo(() => {
    return MARKETS.map((market) => {
      const inMarket = enriched.filter((p) => p.location === market);
      if (inMarket.length === 0) {
        return { label: market, count: 0, utilisation: 0, total: 0 };
      }
      const avg = Math.round(
        inMarket.reduce((s, p) => s + p.utilisation, 0) / inMarket.length,
      );
      return { label: market, count: inMarket.length, utilisation: avg, total: inMarket.length };
    });
  }, [enriched]);

  const energyMix = useMemo(() => {
    const counts: Record<EnergyKey, number> = { driver: 0, energizer: 0, supporter: 0, analyst: 0 };
    enriched.forEach((p) => (counts[p.primary] += 1));
    return counts;
  }, [enriched]);

  const templateRead = useMemo(() => buildWeeklyInsight(enriched), [enriched]);
  const [aiRead, setAiRead] = useState<string>("");
  const [aiSource, setAiSource] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetchInsightsWeekly()
      .then((res) => {
        if (cancelled) return;
        setAiRead(res.narrative);
        setAiSource((res as { source?: string }).source ?? "claude");
      })
      .catch(() => {
        // silent fallback to template — already shown
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const weeklyRead = aiRead || templateRead;
  const outlook = useMemo(() => buildOutlook(enriched, avgUtil), [enriched, avgUtil]);

  const now = new Date();
  const weekLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.compass, padding: 32 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>Loading insights…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.compass, transition: "background 0.25s ease" }}>
      <TopChrome
        env="compass"
        currentPath="/insights"
        rightSlot={
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
        }
      />

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
            Compass · Weekly board read · {weekLabel}
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
            Insights
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720 }}>
            The C-suite read of where Valtech Nordic stands this week — capacity, retention,
            burnout, and the opportunities the bench is currently giving us.
          </div>
        </div>

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
            <span>This week's read</span>
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
              {aiSource === "claude" ? "AI · Claude" : aiSource ? "Templated fallback" : "Loading…"}
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
            {weeklyRead}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <HeadlineStat
            label="Avg utilisation"
            value={`${avgUtil}%`}
            detail={`${80 - avgUtil >= 0 ? `${80 - avgUtil} points below target` : `${avgUtil - 80} points above target`}`}
            tone={
              avgUtil >= 80
                ? { color: "#1A5C38", bg: "#EEF7F2", border: "#9ED4B8" }
                : avgUtil >= 70
                  ? { color: "#8B5A00", bg: "#FFFBF2", border: "#FAD98A" }
                  : { color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" }
            }
          />
          <HeadlineStat
            label="Revenue at risk"
            value={formatEuros(totalExposure)}
            detail={`Across ${flightRisks.length} flight risk${flightRisks.length === 1 ? "" : "s"} in the next 3 months`}
            tone={{ color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" }}
          />
          <HeadlineStat
            label="Burnout watch"
            value={String(burnouts.length)}
            detail={
              burnouts.length === 0
                ? "No one flagged"
                : burnouts.map((b) => b.name.split(" ")[0]).join(" and ")
            }
            tone={{ color: "#8B5A00", bg: "#FFFBF2", border: "#FAD98A" }}
          />
          <HeadlineStat
            label="Protected revenue"
            value={formatEuros(protectedRevenue)}
            detail="On stable consultants who own key client relationships"
            tone={{ color: "#1A5C38", bg: "#EEF7F2", border: "#9ED4B8" }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Card>
            <SectionLabel>Risk flags · {flightRisks.length + watchList.length}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {flightRisks.length === 0 && watchList.length === 0 ? (
                <div
                  style={{
                    padding: 14,
                    background: "#EEF7F2",
                    border: "0.5px solid #9ED4B8",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "#1A5C38",
                  }}
                >
                  No risk flags this week.
                </div>
              ) : (
                <>
                  {flightRisks.map((p) => (
                    <FlagRow
                      key={p.id}
                      person={p}
                      tone={riskTone[p.capacity.riskLevel]}
                      headline={`Loyalty ${p.capacity.loyaltyScore}/100 · ${p.capacity.benchDays}d on bench`}
                      detail={p.capacity.riskReasons[0] ?? p.capacity.recommendedAction}
                    />
                  ))}
                  {watchList.map((p) => (
                    <FlagRow
                      key={p.id}
                      person={p}
                      tone={riskTone[p.capacity.riskLevel]}
                      headline={`Loyalty ${p.capacity.loyaltyScore}/100 · ${p.capacity.benchDays}d on bench`}
                      detail={p.capacity.riskReasons[0] ?? p.capacity.recommendedAction}
                    />
                  ))}
                </>
              )}
            </div>
          </Card>

          <Card>
            <SectionLabel>Opportunity flags · {opportunities.length}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {opportunities.length === 0 ? (
                <div
                  style={{
                    padding: 14,
                    background: "#FAFAF8",
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "#5A5A5A",
                  }}
                >
                  No bench capacity right now. Allocation is tight.
                </div>
              ) : (
                opportunities.map((p) => (
                  <FlagRow
                    key={p.id}
                    person={p}
                    tone={{
                      color: "#1A5C38",
                      bg: "#EEF7F2",
                      border: "#9ED4B8",
                      text: "#1A5C38",
                      label: "Available",
                      icon: "✦",
                    }}
                    headline={`${p.capacity.benchDays}d available · ${energy[p.primary].label} profile`}
                    detail={p.capacity.recommendedAction}
                  />
                ))
              )}
            </div>
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "0.5px solid rgba(0,0,0,0.06)",
                fontSize: 11,
                color: "#9A9A9A",
                lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 600, color: "#5A5A5A" }}>Bench thresholds:</span>{" "}
              Energizer: risk at {benchThresholds.energizer}d · Supporter: risk at{" "}
              {benchThresholds.supporter}d · Driver &amp; Analyst: risk at {benchThresholds.driver}d
            </div>
          </Card>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Card>
            <SectionLabel>Market utilisation</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {marketRows.map((m) =>
                m.total === 0 ? null : (
                  <MarketBar
                    key={m.label}
                    label={m.label}
                    count={m.count}
                    utilisation={m.utilisation}
                    total={m.total}
                  />
                ),
              )}
            </div>
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "0.5px solid rgba(0,0,0,0.06)",
                fontSize: 11,
                color: "#9A9A9A",
              }}
            >
              <span style={{ fontWeight: 600, color: "#5A5A5A" }}>Energy mix across markets:</span>{" "}
              Driver {energyMix.driver} · Energizer {energyMix.energizer} · Supporter{" "}
              {energyMix.supporter} · Analyst {energyMix.analyst}
            </div>
          </Card>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Card>
            <SectionLabel>Two-week outlook</SectionLabel>
            <p style={{ fontSize: 14, color: "#5A5A5A", lineHeight: 1.7, margin: 0 }}>
              {outlook}
            </p>
          </Card>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <SectionLabel>Client relationships under watch</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {enriched
              .filter((p) => p.capacity.keyClientAtRisk)
              .sort((a, b) => b.capacity.lostRevenue3Months - a.capacity.lostRevenue3Months)
              .map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background: "#FAFAF8",
                    borderRadius: 10,
                    border: "0.5px solid rgba(0,0,0,0.07)",
                  }}
                >
                  <Avatar person={p} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.5 }}>
                      {p.capacity.keyClientAtRisk}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#161311",
                      }}
                    >
                      {formatEuros(p.capacity.lostRevenue3Months)}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#9A9A9A",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                      }}
                    >
                      3-month value
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
