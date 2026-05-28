"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EnergyKey, Person, energy, utilTone } from "../page";
import {
  PersonWithCapacity,
  RiskLevel,
  averageUtilisation,
  benchThresholds,
  buildWeeklyInsight,
  formatEuros,
  riskTone,
  utilisationStatTone,
} from "../lib/capacity-data";
import { fetchEnrichedPeople } from "../lib/api-client";

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

function EnergyBadge({ k }: { k: EnergyKey }) {
  const e = energy[k];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 100,
        background: e.bg,
        color: e.text,
        border: `0.5px solid ${e.border}`,
        fontSize: 10,
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
        border: `0.5px solid ${t.border}`,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ fontSize: 11, lineHeight: 1 }}>
        {t.icon}
      </span>
      {t.label}
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
  tone: { color: string; bg: string; border: string };
}) {
  return (
    <div
      style={{
        background: tone.bg,
        border: `0.5px solid ${tone.border}`,
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
          letterSpacing: "0.08em",
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
          color: tone.color,
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

function RiskCard({ person }: { person: PersonWithCapacity }) {
  const tone = riskTone[person.capacity.riskLevel];
  const loyalty = person.capacity.loyaltyScore;
  const loyaltyColour =
    loyalty < 50 ? "#E8402A" : loyalty < 70 ? "#F5A623" : "#2E8B57";

  return (
    <div
      style={{
        background: tone.bg,
        borderLeft: `3px solid ${tone.color}`,
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
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
            <EnergyBadge k={person.primary} />
          </div>
          <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 2 }}>
            {person.role} · {person.location}
            {person.capacity.currentProject ? ` · ${person.capacity.currentProject}` : ""}
          </div>
        </div>
        <RiskPill level={person.capacity.riskLevel} />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#9A9A9A",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          <span>Loyalty score</span>
          <span style={{ color: loyaltyColour, fontWeight: 700 }}>{loyalty}/100</span>
        </div>
        <div style={{ height: 6, background: "#EDEDEA", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              width: `${loyalty}%`,
              height: "100%",
              background: loyaltyColour,
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      {person.capacity.riskReasons.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {person.capacity.riskReasons.map((r) => (
            <div key={r} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: tone.color,
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          background: "#FFFFFF",
          border: "0.5px solid rgba(0,0,0,0.07)",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#9A9A9A",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Recommended action
        </div>
        <div style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.55 }}>
          {person.capacity.recommendedAction}
        </div>
      </div>
    </div>
  );
}

function AllClearRow({ person }: { person: PersonWithCapacity }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        background: "#FFFFFF",
        borderRadius: 10,
        border: "0.5px solid rgba(0,0,0,0.07)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#EEF7F2",
          color: "#1A5C38",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
          border: "0.5px solid #9ED4B8",
        }}
      >
        ✓
      </span>
      <Avatar person={person} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{person.name}</div>
        <div style={{ fontSize: 11, color: "#9A9A9A" }}>Stable — no immediate action needed</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1A5C38" }}>
        {person.capacity.loyaltyScore}
      </div>
    </div>
  );
}

function UtilisationRow({ person }: { person: PersonWithCapacity }) {
  const tone = utilTone(person.utilisation);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <Avatar person={person} size={28} />
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#161311",
          width: 140,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <Link href={`/people/${person.id}`} style={{ color: "inherit" }}>
          {person.name}
        </Link>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ height: 5, background: "#EDEDEA", borderRadius: 4 }}>
          <div
            style={{
              width: `${Math.min(person.utilisation, 100)}%`,
              height: "100%",
              background: tone.color,
              borderRadius: 4,
            }}
          />
        </div>
        <div
          aria-hidden
          title="80% target"
          style={{
            position: "absolute",
            top: -2,
            bottom: -2,
            left: "80%",
            width: 1,
            background: "rgba(0,0,0,0.28)",
          }}
        />
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
      {person.capacity.burnoutRisk && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 100,
            background: "#FFFBF2",
            color: "#8B5A00",
            border: "0.5px solid #FAD98A",
            fontSize: 10,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          ⚠ Burnout risk
        </span>
      )}
    </div>
  );
}

function BenchRow({ person, maxDays }: { person: PersonWithCapacity; maxDays: number }) {
  const days = person.capacity.benchDays;
  const colour = days > 14 ? "#E8402A" : days > 7 ? "#F5A623" : "#2E8B57";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <Avatar person={person} size={28} />
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#161311",
          width: 140,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <Link href={`/people/${person.id}`} style={{ color: "inherit" }}>
          {person.name}
        </Link>
      </div>
      <div style={{ flex: 1, height: 5, background: "#EDEDEA", borderRadius: 4 }}>
        <div
          style={{
            width: `${Math.min((days / Math.max(maxDays, 28)) * 100, 100)}%`,
            height: "100%",
            background: colour,
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: colour,
          width: 44,
          textAlign: "right",
        }}
      >
        {days}d
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
        border: `0.5px solid ${emphasis ? "#FCCDC6" : "rgba(0,0,0,0.07)"}`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: emphasis ? "#9B2A1A" : "#9A9A9A",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 20,
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

const RISK_ORDER: Record<RiskLevel, number> = {
  high: 0,
  medium: 1,
  watch: 2,
  low: 3,
};

export default function CapacityPage() {
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

  const flightRisks = useMemo(
    () =>
      enriched
        .filter((p) => p.capacity.riskLevel !== "low")
        .sort((a, b) => {
          const order =
            RISK_ORDER[a.capacity.riskLevel] - RISK_ORDER[b.capacity.riskLevel];
          if (order !== 0) return order;
          return a.capacity.loyaltyScore - b.capacity.loyaltyScore;
        }),
    [enriched],
  );

  const allClear = useMemo(
    () =>
      enriched
        .filter((p) => p.capacity.riskLevel === "low")
        .sort((a, b) => b.capacity.loyaltyScore - a.capacity.loyaltyScore),
    [enriched],
  );

  const utilSorted = useMemo(
    () => [...enriched].sort((a, b) => b.utilisation - a.utilisation),
    [enriched],
  );

  const benchPeople = useMemo(
    () =>
      enriched
        .filter((p) => p.capacity.benchDays > 0)
        .sort((a, b) => b.capacity.benchDays - a.capacity.benchDays),
    [enriched],
  );

  const maxBenchDays = useMemo(
    () => benchPeople.reduce((m, p) => Math.max(m, p.capacity.benchDays), 0),
    [benchPeople],
  );

  const avgUtil = averageUtilisation(enriched);
  const utilStatTone = utilisationStatTone(avgUtil);

  const flightCount = enriched.filter(
    (p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium",
  ).length;

  const revenueAtRisk = enriched
    .filter((p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium")
    .reduce((s, p) => s + p.capacity.lostRevenue3Months, 0);

  const lowestLoyalty = useMemo(
    () => [...flightRisks].sort((a, b) => a.capacity.loyaltyScore - b.capacity.loyaltyScore)[0],
    [flightRisks],
  );

  const [costPersonId, setCostPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (costPersonId == null && enriched.length > 0) {
      const fallback = lowestLoyalty?.id ?? flightRisks[0]?.id ?? enriched[0].id;
      setCostPersonId(fallback);
    }
  }, [enriched.length, lowestLoyalty, flightRisks, costPersonId]);

  const costEntry =
    enriched.find((p) => p.id === costPersonId) ?? lowestLoyalty ?? enriched[0];
  const cost = costEntry?.capacity;
  const totalCost = cost
    ? cost.replacementCost + cost.lostRevenue3Months + cost.onboardingCost
    : 0;

  const aiInsight = useMemo(() => buildWeeklyInsight(enriched), [enriched]);

  if (loaded && enriched.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F0EA", padding: 32 }}>
        <div style={{ maxWidth: 720, margin: "60px auto", textAlign: "center" }}>
          <h1 className="font-display" style={{ fontSize: 24, color: "#161311" }}>
            No capacity data yet
          </h1>
          <p style={{ fontSize: 14, color: "#5A5A5A", marginTop: 10, lineHeight: 1.6 }}>
            Seed the database by POSTing to <code>/api/seed</code>, or add people via the
            directory.
          </p>
        </div>
      </div>
    );
  }

  if (!loaded || !costEntry) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F0EA", padding: 32 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>Loading capacity…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
      <header
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
                background: "transparent",
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
                background: "transparent",
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
                background: "transparent",
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
                color: "#FFFFFF",
                background: "#161311",
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
                background: "transparent",
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
                color: "#4D4945",
                background: "transparent",
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
                background: "transparent",
              }}
            >
              Rates
            </Link>
          </nav>
          <div style={{ flex: 1 }} />
          <Link
            href="/pulse/new"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
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
            Capacity &amp; retention
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A" }}>
            Valtech Nordic · {enriched.length} consultants · Live
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
            label="Avg utilisation"
            value={`${avgUtil}%`}
            detail={utilStatTone.label}
            tone={{ color: utilStatTone.color, bg: utilStatTone.bg, border: utilStatTone.border }}
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
            detail={`${benchPeople.reduce((s, p) => s + p.capacity.benchDays, 0)} days combined`}
            tone={{ color: "#8B5A00", bg: "#FFFBF2", border: "#FAD98A" }}
          />
          <StatCard
            label="Revenue at risk"
            value={formatEuros(revenueAtRisk)}
            detail="3-month exposure"
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
              <div>
                {flightRisks.length === 0 ? (
                  <div
                    style={{
                      padding: 18,
                      background: "#EEF7F2",
                      border: "0.5px solid #9ED4B8",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#1A5C38",
                    }}
                  >
                    No one is at flight risk this week.
                  </div>
                ) : (
                  flightRisks.map((p) => <RiskCard key={p.id} person={p} />)
                )}
              </div>
            </Card>

            <Card>
              <SectionLabel>All clear · {allClear.length} stable</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {allClear.map((p) => (
                  <AllClearRow key={p.id} person={p} />
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <SectionLabel>Utilisation — all consultants</SectionLabel>
              <div>
                {utilSorted.map((p) => (
                  <UtilisationRow key={p.id} person={p} />
                ))}
              </div>
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "0.5px solid rgba(0,0,0,0.06)",
                  fontSize: 11,
                  color: "#9A9A9A",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 1,
                      height: 12,
                      background: "rgba(0,0,0,0.28)",
                    }}
                  />
                  80% target
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  ⚠ Burnout risk flagged
                </span>
              </div>
            </Card>

            <Card>
              <SectionLabel>On bench now · {benchPeople.length}</SectionLabel>
              {benchPeople.length === 0 ? (
                <div
                  style={{
                    padding: 14,
                    background: "#EEF7F2",
                    border: "0.5px solid #9ED4B8",
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
                    <BenchRow key={p.id} person={p} maxDays={maxBenchDays} />
                  ))}
                </div>
              )}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "0.5px solid rgba(0,0,0,0.06)",
                  fontSize: 11,
                  color: "#9A9A9A",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontWeight: 600, color: "#5A5A5A" }}>Risk thresholds:</span>{" "}
                Energizer: risk at {benchThresholds.yellow}d · Supporter: risk at{" "}
                {benchThresholds.green}d · Driver &amp; Analyst: risk at {benchThresholds.red}d
              </div>
            </Card>

            <Card>
              <SectionLabel>Cost of losing a consultant</SectionLabel>
              {flightRisks.length === 0 ? (
                <div
                  style={{
                    padding: 14,
                    background: "#EEF7F2",
                    border: "0.5px solid #9ED4B8",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#1A5C38",
                  }}
                >
                  No flight risks to cost out this week.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    {flightRisks.map((p) => {
                      const active = p.id === costEntry.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setCostPersonId(p.id)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 100,
                            border: `0.5px solid ${active ? "#161311" : "rgba(0,0,0,0.07)"}`,
                            background: active ? "#161311" : "#FFFFFF",
                            color: active ? "#FFFFFF" : "#5A5A5A",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {p.name.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <Avatar person={costEntry} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#161311" }}>
                        {costEntry.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#9A9A9A" }}>
                        {costEntry.role} · {costEntry.location}
                      </div>
                    </div>
                    <RiskPill level={costEntry.capacity.riskLevel} />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: cost.keyClientAtRisk ? 12 : 0,
                    }}
                  >
                    <CostMetric label="Recruitment cost" value={formatEuros(cost.replacementCost)} />
                    <CostMetric
                      label="Lost revenue 3mo"
                      value={formatEuros(cost.lostRevenue3Months)}
                    />
                    <CostMetric label="Onboarding cost" value={formatEuros(cost.onboardingCost)} />
                    <CostMetric label="Total cost" value={formatEuros(totalCost)} emphasis />
                  </div>

                  {cost.keyClientAtRisk && (
                    <div
                      style={{
                        background: "#FDF0EE",
                        border: "0.5px solid #FCCDC6",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#9B2A1A",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Client at risk
                      </div>
                      <div style={{ fontSize: 13, color: "#9B2A1A", lineHeight: 1.5 }}>
                        {cost.keyClientAtRisk}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            background: "#FFFBF2",
            border: "0.5px solid #FAD98A",
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
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              AI
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#8B5A00",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Weekly insight — generated today
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
