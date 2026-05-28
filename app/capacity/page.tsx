"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EnergyKey, Person, energy, people, utilTone } from "../page";

type RiskLevel = "high" | "medium" | "watch" | "low";

interface CapacityData {
  benchDays: number;
  loyaltyScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  recommendedAction: string;
  replacementCost: number;
  lostRevenue3Months: number;
  onboardingCost: number;
  keyClientAtRisk: string | null;
  currentProject: string | null;
  burnoutRisk: boolean;
}

const capacityData: Record<number, CapacityData> = {
  1: {
    benchDays: 0,
    loyaltyScore: 72,
    riskLevel: "watch",
    riskReasons: [
      "Sustained 90%+ utilisation for six months",
      "Mentor load up to four reports this quarter",
      "No formal recognition this review cycle",
    ],
    recommendedAction:
      "Book a recovery conversation. Offer a two-week step-down after Nordea Q3 closes.",
    replacementCost: 145000,
    lostRevenue3Months: 420000,
    onboardingCost: 95000,
    keyClientAtRisk: "Nordea",
    currentProject: "Nordea omnichannel programme",
    burnoutRisk: true,
  },
  2: {
    benchDays: 0,
    loyaltyScore: 88,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction: "On track. Surface him for the new event-platform pitch.",
    replacementCost: 120000,
    lostRevenue3Months: 200000,
    onboardingCost: 80000,
    keyClientAtRisk: null,
    currentProject: "Maersk events platform",
    burnoutRisk: false,
  },
  3: {
    benchDays: 0,
    loyaltyScore: 91,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction: "On track. Promote to UX practice lead in next cycle.",
    replacementCost: 110000,
    lostRevenue3Months: 170000,
    onboardingCost: 75000,
    keyClientAtRisk: null,
    currentProject: "Danske Bank onboarding",
    burnoutRisk: false,
  },
  4: {
    benchDays: 8,
    loyaltyScore: 58,
    riskLevel: "medium",
    riskReasons: [
      "LinkedIn activity up 240% in the last 30 days",
      "Declined two recruiter messages publicly",
      "Skipped the last two innovation forums",
    ],
    recommendedAction:
      "Put him on the Equinor innovation lab follow-up before end of week. He needs a stage.",
    replacementCost: 95000,
    lostRevenue3Months: 130000,
    onboardingCost: 65000,
    keyClientAtRisk: "Equinor",
    currentProject: "Bench — between Equinor pitches",
    burnoutRisk: false,
  },
  5: {
    benchDays: 0,
    loyaltyScore: 79,
    riskLevel: "watch",
    riskReasons: [
      "Two weekends worked in the last month",
      "Unbillable model-audit backlog piling up",
    ],
    recommendedAction:
      "Reduce Kesko scope by 15%. Move audit work to a mid-level data engineer.",
    replacementCost: 130000,
    lostRevenue3Months: 110000,
    onboardingCost: 85000,
    keyClientAtRisk: null,
    currentProject: "Kesko demand forecasting",
    burnoutRisk: true,
  },
  6: {
    benchDays: 12,
    loyaltyScore: 64,
    riskLevel: "medium",
    riskReasons: [
      "12 days on bench after the SAS handover",
      "Asked twice about cross-team mobility this quarter",
      "Salary band capped without explanation",
    ],
    recommendedAction:
      "Slot into the H&M architecture review. Confirm a salary path within the week.",
    replacementCost: 105000,
    lostRevenue3Months: 135000,
    onboardingCost: 70000,
    keyClientAtRisk: null,
    currentProject: "Bench — post SAS migration",
    burnoutRisk: false,
  },
  7: {
    benchDays: 0,
    loyaltyScore: 87,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction: "On track. Consider for the design-engineering lead role.",
    replacementCost: 90000,
    lostRevenue3Months: 115000,
    onboardingCost: 60000,
    keyClientAtRisk: null,
    currentProject: "Telia self-service",
    burnoutRisk: false,
  },
  8: {
    benchDays: 0,
    loyaltyScore: 84,
    riskLevel: "watch",
    riskReasons: [
      "Carrying two recovery programmes simultaneously",
      "Has not taken summer leave in 18 months",
    ],
    recommendedAction:
      "Mandate two weeks off in August. Move Carlsberg governance to Pernille.",
    replacementCost: 100000,
    lostRevenue3Months: 195000,
    onboardingCost: 70000,
    keyClientAtRisk: null,
    currentProject: "Carlsberg loyalty",
    burnoutRisk: true,
  },
  9: {
    benchDays: 0,
    loyaltyScore: 82,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction: "On track. Strong design-engineering bridge candidate.",
    replacementCost: 80000,
    lostRevenue3Months: 80000,
    onboardingCost: 55000,
    keyClientAtRisk: null,
    currentProject: "Storebrand member portal",
    burnoutRisk: false,
  },
  10: {
    benchDays: 28,
    loyaltyScore: 41,
    riskLevel: "high",
    riskReasons: [
      "28 days on bench — past the Lens 28-day threshold",
      "Two recruiter conversations confirmed by colleagues",
      "Asked twice about a security-guild transfer",
    ],
    recommendedAction:
      "Place on the OP Financial follow-on or move to the internal security tooling team this week. Salary review is overdue.",
    replacementCost: 110000,
    lostRevenue3Months: 70000,
    onboardingCost: 70000,
    keyClientAtRisk: "OP Financial",
    currentProject: "Bench — post OP Financial",
    burnoutRisk: false,
  },
  11: {
    benchDays: 18,
    loyaltyScore: 52,
    riskLevel: "high",
    riskReasons: [
      "Counterpart at Nordea left last month — relationship exposed",
      "Approached privately at a recent client event",
      "Bonus structure changed without consultation",
    ],
    recommendedAction:
      "Lock in a renewed comp conversation this week. Pair her on Volvo Cars expansion to anchor a new flagship.",
    replacementCost: 220000,
    lostRevenue3Months: 380000,
    onboardingCost: 120000,
    keyClientAtRisk: "Nordea & Volvo Cars",
    currentProject: "Between Volvo Cars pitches",
    burnoutRisk: false,
  },
  12: {
    benchDays: 0,
    loyaltyScore: 86,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction: "On track. Cover Linnea's mentor load if she steps down.",
    replacementCost: 115000,
    lostRevenue3Months: 155000,
    onboardingCost: 80000,
    keyClientAtRisk: null,
    currentProject: "Equinor data platform",
    burnoutRisk: false,
  },
};

const riskTone: Record<
  RiskLevel,
  { color: string; bg: string; text: string; border: string; label: string }
> = {
  high:   { color: "#E8402A", bg: "#FDF0EE", text: "#9B2A1A", border: "#FCCDC6", label: "High risk" },
  medium: { color: "#F5A623", bg: "#FFFBF2", text: "#8B5A00", border: "#FAD98A", label: "Medium risk" },
  watch:  { color: "#F5A623", bg: "#FAFAF8", text: "#5A5A5A", border: "rgba(0,0,0,0.07)", label: "Watch" },
  low:    { color: "#2E8B57", bg: "#EEF7F2", text: "#1A5C38", border: "#9ED4B8", label: "Low risk" },
};

const RISK_ORDER: RiskLevel[] = ["high", "medium", "watch", "low"];

const benchThresholds: Record<EnergyKey, number> = {
  red: 28,
  yellow: 14,
  green: 21,
  blue: 28,
};

function formatEuros(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `€${Math.round(n / 1_000)}k`;
  return `€${n}`;
}

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

function Avatar({ person, size = 38 }: { person: Person; size?: number }) {
  const colour = energy[person.primary];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colour.bg,
        color: colour.text,
        border: `1px solid ${colour.border}`,
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

function EnergyBadge({ k, small = true }: { k: EnergyKey; small?: boolean }) {
  const e = energy[k];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: small ? "3px 8px" : "4px 10px",
        borderRadius: 100,
        background: e.bg,
        color: e.text,
        border: `1px solid ${e.border}`,
        fontSize: small ? 10 : 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
      {e.label}
    </span>
  );
}

function RiskPill({ level }: { level: RiskLevel }) {
  const t = riskTone[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 100,
        background: t.bg,
        color: t.text,
        border: `1px solid ${t.border}`,
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.color }} />
      {t.label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "#9A9A9A",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
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

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: { color: string; bg: string; border: string };
}) {
  return (
    <div
      style={{
        background: tone?.bg ?? "#FFFFFF",
        border: `0.5px solid ${tone?.border ?? "rgba(0,0,0,0.07)"}`,
        borderRadius: 12,
        padding: "1rem 1.1rem",
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
          letterSpacing: "0.07em",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: tone?.color ?? "#161311",
          letterSpacing: "-0.4px",
        }}
      >
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: 11, color: "#9A9A9A", lineHeight: 1.4 }}>{detail}</div>
      )}
    </div>
  );
}

function FlightRiskCard({ person, data }: { person: Person; data: CapacityData }) {
  const tone = riskTone[data.riskLevel];
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        borderLeft: `4px solid ${tone.color}`,
        padding: "1.1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar person={person} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Link
              href={`/people/${person.id}`}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#161311",
                letterSpacing: "-0.2px",
              }}
            >
              {person.name}
            </Link>
            <EnergyBadge k={person.primary} small />
          </div>
          <div style={{ fontSize: 12, color: "#4D4945", marginTop: 2 }}>
            {person.role} · {person.location}
            {data.currentProject ? ` · ${data.currentProject}` : ""}
          </div>
        </div>
        <RiskPill level={data.riskLevel} />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#9A9A9A",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          <span>Loyalty score</span>
          <span style={{ color: tone.color, fontWeight: 700 }}>{data.loyaltyScore}/100</span>
        </div>
        <div style={{ height: 6, background: "#EDEDEA", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              width: `${data.loyaltyScore}%`,
              height: "100%",
              background: tone.color,
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      {data.riskReasons.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.riskReasons.map((r) => (
            <div key={r} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: tone.color,
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#4D4945", lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          background: "#FAFAF8",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 12,
          color: "#161311",
          lineHeight: 1.55,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "#9A9A9A",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
            marginRight: 8,
          }}
        >
          Action
        </span>
        {data.recommendedAction}
      </div>
    </div>
  );
}

function UtilisationRow({ person, data }: { person: Person; data: CapacityData }) {
  const tone = utilTone(person.utilisation);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <Avatar person={person} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Link
            href={`/people/${person.id}`}
            style={{ fontSize: 12, fontWeight: 600, color: "#161311" }}
          >
            {person.name}
          </Link>
          {data.burnoutRisk && (
            <span
              title="Burnout risk"
              style={{
                fontSize: 12,
                color: "#E8402A",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ⚠
            </span>
          )}
        </div>
        <div style={{ position: "relative", height: 6, background: "#EDEDEA", borderRadius: 4 }}>
          <div
            style={{
              width: `${Math.min(person.utilisation, 100)}%`,
              height: "100%",
              background: tone.color,
              borderRadius: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -2,
              bottom: -2,
              left: "80%",
              width: 1,
              background: "rgba(0,0,0,0.25)",
            }}
            title="80% target"
          />
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: tone.color,
          width: 38,
          textAlign: "right",
        }}
      >
        {person.utilisation}%
      </div>
    </div>
  );
}

function BenchRow({
  person,
  data,
  maxDays,
}: {
  person: Person;
  data: CapacityData;
  maxDays: number;
}) {
  const tone = riskTone[data.riskLevel];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <Avatar person={person} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <Link
            href={`/people/${person.id}`}
            style={{ fontSize: 12, fontWeight: 600, color: "#161311" }}
          >
            {person.name}
          </Link>
          <span style={{ fontSize: 11, color: "#9A9A9A" }}>
            {energy[person.primary].label} · threshold {benchThresholds[person.primary]}d
          </span>
        </div>
        <div style={{ height: 6, background: "#EDEDEA", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min((data.benchDays / Math.max(maxDays, 1)) * 100, 100)}%`,
              height: "100%",
              background: tone.color,
              borderRadius: 4,
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: tone.color,
          width: 44,
          textAlign: "right",
        }}
      >
        {data.benchDays}d
      </div>
    </div>
  );
}

function CostMetric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      style={{
        background: emphasis ? "#FDF0EE" : "#FAFAF8",
        border: `1px solid ${emphasis ? "#FCCDC6" : "rgba(0,0,0,0.06)"}`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: emphasis ? "#9B2A1A" : "#9A9A9A",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: emphasis ? "#9B2A1A" : "#161311",
          letterSpacing: "-0.3px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AllClearRow({ person, data }: { person: Person; data: CapacityData }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: "#FFFFFF",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Avatar person={person} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{person.name}</div>
        <div style={{ fontSize: 11, color: "#9A9A9A" }}>
          {person.role} · {data.currentProject ?? "Available"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "#9A9A9A" }}>Loyalty</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A5C38" }}>
          {data.loyaltyScore}
        </span>
      </div>
    </div>
  );
}

function buildAiInsight(
  enrichedPeople: { person: Person; data: CapacityData }[],
  averageUtil: number,
): string {
  const topFlight = enrichedPeople
    .filter((p) => p.data.riskLevel === "high")
    .sort((a, b) => b.data.lostRevenue3Months - a.data.lostRevenue3Months);
  const burnouts = enrichedPeople.filter((p) => p.data.burnoutRisk);
  const onBench = enrichedPeople.filter((p) => p.data.benchDays > 0);
  const benchTotal = onBench.reduce((s, p) => s + p.data.benchDays, 0);

  const top = topFlight[0];
  const second = topFlight[1];

  const burnoutNames = burnouts.map((b) => b.person.name.split(" ")[0]);
  const burnoutClause =
    burnouts.length === 0
      ? "No burnout flags this week."
      : burnouts.length === 1
        ? `${burnoutNames[0]} is sustaining above 86% — worth a step-down conversation.`
        : `${burnoutNames.slice(0, -1).join(", ")} and ${burnoutNames[burnoutNames.length - 1]} are all sustaining above 86%; staggering one down to 80% for two weeks frees capacity to absorb their critical paths.`;

  const flightClause =
    top && second
      ? `Two flight risks need a decision this week. ${top.person.name} carries ${formatEuros(top.data.lostRevenue3Months)} of three-month revenue exposure on ${top.data.keyClientAtRisk ?? "key accounts"}, with ${top.data.benchDays} days off-project — the comp conversation should land before Friday. ${second.person.name} has crossed the ${energy[second.person.primary].label} ${benchThresholds[second.person.primary]}-day bench threshold; ${second.data.recommendedAction.toLowerCase()}`
      : top
        ? `${top.person.name} is the single highest exposure — ${formatEuros(top.data.lostRevenue3Months)} of three-month revenue at risk and ${top.data.benchDays} days off-project. ${top.data.recommendedAction}`
        : "No high-risk people this week — keep watching the medium tier.";

  const utilClause = `Average utilisation is ${averageUtil}% — ${averageUtil >= 80 ? "on target" : `${80 - averageUtil} points below target`}, ${onBench.length === 0 ? "with no one on bench" : `largely explained by ${onBench.length} ${onBench.length === 1 ? "person" : "people"} on bench (${benchTotal} days combined)`}.`;

  return `${flightClause} ${burnoutClause} ${utilClause}`;
}

export default function CapacityPage() {
  const enriched = useMemo(
    () =>
      people
        .map((person) => ({ person, data: capacityData[person.id] }))
        .filter((p) => p.data),
    [],
  );

  const [costPersonId, setCostPersonId] = useState<number>(() => {
    const sorted = [...enriched].sort(
      (a, b) =>
        b.data.replacementCost +
        b.data.lostRevenue3Months +
        b.data.onboardingCost -
        (a.data.replacementCost + a.data.lostRevenue3Months + a.data.onboardingCost),
    );
    return sorted[0]?.person.id ?? people[0].id;
  });

  const averageUtil = useMemo(
    () => Math.round(people.reduce((s, p) => s + p.utilisation, 0) / people.length),
    [],
  );

  const flightRisks = useMemo(
    () =>
      enriched
        .filter((p) => p.data.riskLevel !== "low")
        .sort((a, b) => {
          const order = RISK_ORDER.indexOf(a.data.riskLevel) - RISK_ORDER.indexOf(b.data.riskLevel);
          if (order !== 0) return order;
          return a.data.loyaltyScore - b.data.loyaltyScore;
        }),
    [enriched],
  );

  const allClear = useMemo(
    () =>
      enriched
        .filter((p) => p.data.riskLevel === "low")
        .sort((a, b) => b.data.loyaltyScore - a.data.loyaltyScore),
    [enriched],
  );

  const utilSorted = useMemo(
    () => [...enriched].sort((a, b) => b.person.utilisation - a.person.utilisation),
    [enriched],
  );

  const benchPeople = useMemo(
    () =>
      enriched
        .filter((p) => p.data.benchDays > 0)
        .sort((a, b) => b.data.benchDays - a.data.benchDays),
    [enriched],
  );

  const maxBenchDays = useMemo(
    () => benchPeople.reduce((m, p) => Math.max(m, p.data.benchDays), 0),
    [benchPeople],
  );

  const revenueAtRisk = useMemo(
    () =>
      enriched
        .filter((p) => p.data.riskLevel === "high" || p.data.riskLevel === "medium")
        .reduce((s, p) => s + p.data.lostRevenue3Months, 0),
    [enriched],
  );

  const flightCount = enriched.filter(
    (p) => p.data.riskLevel === "high" || p.data.riskLevel === "medium",
  ).length;

  const costEntry = enriched.find((p) => p.person.id === costPersonId) ?? enriched[0];
  const costPerson = costEntry.person;
  const costData = costEntry.data;
  const totalCost =
    costData.replacementCost + costData.lostRevenue3Months + costData.onboardingCost;

  const aiInsight = useMemo(
    () => buildAiInsight(enriched, averageUtil),
    [enriched, averageUtil],
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
      <header
        style={{
          height: 52,
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
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
                background: "transparent",
              }}
            >
              People
            </Link>
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Teams
            </span>
            <Link
              href="/capacity"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#FFFFFF",
                background: "#161311",
              }}
            >
              Capacity
            </Link>
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Insights
            </span>
          </nav>
          <div style={{ flex: 1 }} />
          <Link
            href="/pulse/new"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1, color: "#FF5040" }}>+</span> New profile
          </Link>
        </div>
      </header>

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
            Compass · Valtech Nordic · Live
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
            Capacity & retention
          </h1>
          <div style={{ fontSize: 13, color: "#4D4945", maxWidth: 720 }}>
            Who is at risk of leaving, who is overloaded, and what the bench situation is costing
            us this quarter.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <StatCard
            label="Average utilisation"
            value={`${averageUtil}%`}
            detail={`${averageUtil >= 80 ? "On target" : `${80 - averageUtil}pp below target`}`}
            tone={
              averageUtil >= 80
                ? { color: "#1A5C38", bg: "#EEF7F2", border: "#9ED4B8" }
                : { color: "#8B5A00", bg: "#FFFBF2", border: "#FAD98A" }
            }
          />
          <StatCard
            label="Target"
            value="80%"
            detail="Valtech Nordic standard"
            tone={{ color: "#1A5C38", bg: "#EEF7F2", border: "#9ED4B8" }}
          />
          <StatCard
            label="Flight risks"
            value={String(flightCount)}
            detail="High + medium tier"
            tone={{ color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" }}
          />
          <StatCard
            label="On bench"
            value={String(benchPeople.length)}
            detail={`${benchPeople.reduce((s, p) => s + p.data.benchDays, 0)} days combined`}
            tone={{ color: "#8B5A00", bg: "#FFFBF2", border: "#FAD98A" }}
          />
          <StatCard
            label="Revenue at risk"
            value={formatEuros(revenueAtRisk)}
            detail="3-month exposure if flight risks leave"
            tone={{ color: "#9B2A1A", bg: "#FDF0EE", border: "#FCCDC6" }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <SectionLabel>Flight risk alerts · {flightRisks.length}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {flightRisks.map((p) => (
                  <FlightRiskCard key={p.person.id} person={p.person} data={p.data} />
                ))}
              </div>
            </Card>

            <Card>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#1A5C38",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontWeight: 600,
                  }}
                >
                  All clear · {allClear.length}
                </div>
                <span style={{ fontSize: 11, color: "#9A9A9A" }}>
                  Low flight risk · loyalty 80+
                </span>
              </div>
              <div
                style={{
                  background: "#EEF7F2",
                  border: "1px solid #9ED4B8",
                  borderRadius: 10,
                  padding: 10,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 8,
                }}
              >
                {allClear.map((p) => (
                  <AllClearRow key={p.person.id} person={p.person} data={p.data} />
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <SectionLabel>Utilisation · 80% target</SectionLabel>
              <div>
                {utilSorted.map((p) => (
                  <UtilisationRow key={p.person.id} person={p.person} data={p.data} />
                ))}
              </div>
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  fontSize: 11,
                  color: "#9A9A9A",
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#2E8B57",
                    }}
                  />
                  ≥ 80%
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#F5A623",
                    }}
                  />
                  65–79%
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#E8402A",
                    }}
                  />
                  &lt; 65%
                </span>
                <span style={{ color: "#E8402A", fontWeight: 600 }}>⚠ Burnout risk</span>
              </div>
            </Card>

            <Card>
              <SectionLabel>Bench duration · {benchPeople.length} on bench</SectionLabel>
              {benchPeople.length === 0 ? (
                <div
                  style={{
                    padding: 14,
                    background: "#EEF7F2",
                    border: "1px solid #9ED4B8",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#1A5C38",
                  }}
                >
                  No one is on bench right now.
                </div>
              ) : (
                <div>
                  {benchPeople.map((p) => (
                    <BenchRow
                      key={p.person.id}
                      person={p.person}
                      data={p.data}
                      maxDays={maxBenchDays}
                    />
                  ))}
                </div>
              )}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  fontSize: 11,
                  color: "#9A9A9A",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontWeight: 600, color: "#4D4945" }}>Energy thresholds:</span>{" "}
                Drive 28d · Spark 14d · Steady 21d · Lens 28d
              </div>
            </Card>

            <Card>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#9A9A9A",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontWeight: 500,
                  }}
                >
                  Cost of leaving
                </div>
                <select
                  value={costPersonId}
                  onChange={(e) => setCostPersonId(Number(e.target.value))}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.07)",
                    background: "#FFFFFF",
                    color: "#161311",
                    fontSize: 12,
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {enriched.map((p) => (
                    <option key={p.person.id} value={p.person.id}>
                      {p.person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Avatar person={costPerson} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#161311" }}>
                    {costPerson.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#9A9A9A" }}>
                    {costPerson.role} · {costPerson.location}
                  </div>
                </div>
                <RiskPill level={costData.riskLevel} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <CostMetric label="Recruitment" value={formatEuros(costData.replacementCost)} />
                <CostMetric
                  label="Lost revenue (3mo)"
                  value={formatEuros(costData.lostRevenue3Months)}
                />
                <CostMetric label="Onboarding" value={formatEuros(costData.onboardingCost)} />
                <CostMetric label="Total cost" value={formatEuros(totalCost)} emphasis />
              </div>

              {costData.keyClientAtRisk && (
                <div
                  style={{
                    background: "#FDF0EE",
                    border: "1px solid #FCCDC6",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#9B2A1A",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Key client at risk
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#9B2A1A" }}>
                    {costData.keyClientAtRisk}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            background: "#FFFBF2",
            border: "1px solid #FAD98A",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#F5A623",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              AI
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#8B5A00",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                This week&apos;s read
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#8B5A00",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {aiInsight}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
