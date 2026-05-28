"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAllPeople, fetchEnrichedPeople } from "../lib/api-client";
import { energy, Person } from "../page";
import type { PersonWithCapacity } from "../lib/capacity-data";
import { BRIEF_STAGES, Brief, BriefStage, PitchRole, TEAMS_TABS, TeamsTabKey } from "./types";
import { seedBriefs, seedPitchRoles } from "./seed";

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

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: "7px 14px",
        borderRadius: 100,
        fontSize: 13,
        fontWeight: 400,
        color: active ? "#FFFFFF" : "#4D4945",
        background: active ? "#161311" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#9A9A9A",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 600,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, padding = "20px 22px", style }: { children: React.ReactNode; padding?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PriorityPill({ priority }: { priority: Brief["priority"] }) {
  const tone =
    priority === "urgent"
      ? { bg: "#FDF3F2", color: "#C4534A", label: "Urgent" }
      : priority === "low"
        ? { bg: "#F3F0EA", color: "#5A5A5A", label: "Low" }
        : { bg: "#FEF8EE", color: "#B87A2E", label: "Normal" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 100,
        background: tone.bg,
        color: tone.color,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {tone.label}
    </span>
  );
}

function StageBadge({ stage }: { stage: BriefStage }) {
  const meta = BRIEF_STAGES.find((s) => s.key === stage);
  if (!meta) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 100,
        background: "#FAFAF8",
        border: "0.5px solid rgba(0,0,0,0.07)",
        fontSize: 11,
        color: "#4D4945",
      }}
    >
      <span
        aria-hidden
        style={{ width: 6, height: 6, borderRadius: "50%", background: meta.tone }}
      />
      {meta.label}
    </span>
  );
}

function HarmonyDot({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: "#9A9A9A", fontSize: 11 }}>—</span>;
  const color = score >= 80 ? "#5CAB82" : score >= 65 ? "#D4974A" : "#D97B73";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#4D4945" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      {score}
    </span>
  );
}

const TAB_STORAGE_KEY = "humyn.teams-tab";

export default function TeamsPage() {
  const [tab, setTab] = useState<TeamsTabKey>("portfolio");
  const [people, setPeople] = useState<Person[]>([]);
  const [enriched, setEnriched] = useState<PersonWithCapacity[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(TAB_STORAGE_KEY);
    if (saved && TEAMS_TABS.some((t) => t.key === saved)) setTab(saved as TeamsTabKey);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TAB_STORAGE_KEY, tab);
  }, [tab]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAllPeople(), fetchEnrichedPeople()])
      .then(([p, e]) => {
        if (cancelled) return;
        setPeople(p);
        setEnriched(e);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
        <div style={{ display: "flex", alignItems: "center", gap: 28, width: "100%", maxWidth: 1280, margin: "0 auto" }}>
          <Link href="/">
            <HumynWordmark />
          </Link>
          <nav style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            <NavLink href="/" label="People" />
            <NavLink href="/teams" label="Teams" active />
            <NavLink href="/available" label="Available" />
            <NavLink href="/capacity" label="Capacity" />
            <NavLink href="/insights" label="Insights" />
            <NavLink href="/board" label="Board" />
            <NavLink href="/pipeline" label="Pipeline" />
            <NavLink href="/settings/rate-card" label="Rates" />
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Compass · Teams
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
            Teams
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
            Brief portfolio across the four Nordic markets. {seedBriefs.length} briefs on the board
            this week. Sample data — wiring to the real backing store comes next.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 12,
            marginBottom: 20,
            overflowX: "auto",
          }}
        >
          {TEAMS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: tab === t.key ? "#161311" : "transparent",
                color: tab === t.key ? "#FFFFFF" : "#4D4945",
                fontSize: 12,
                fontWeight: 400,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "portfolio" && <PortfolioTab briefs={seedBriefs} people={people} enriched={enriched} />}
        {tab === "kanban" && <KanbanTab briefs={seedBriefs} />}
        {tab === "timeline" && <TimelineTab briefs={seedBriefs} people={people} />}
        {tab === "pitch" && <PitchTab roles={seedPitchRoles} />}
        {tab === "availability" && <AvailabilityTab people={people} enriched={enriched} />}
        {tab === "build" && <BuildTeamLink />}
        {tab === "markets" && <MarketsLink />}
      </main>
    </div>
  );
}

// ---------- Portfolio ----------

function PortfolioTab({ briefs, people, enriched }: { briefs: Brief[]; people: Person[]; enriched: PersonWithCapacity[] }) {
  const urgent = briefs.filter((b) => b.priority === "urgent");
  const unstaffed = briefs.filter((b) => b.stage === "unstaffed");
  const nowAvailable = people.filter((p) => p.available === "now");
  const benchByMarket = new Map<string, number>();
  enriched.forEach((p) => {
    if (p.capacity.benchDays > 0) {
      benchByMarket.set(p.location, (benchByMarket.get(p.location) ?? 0) + 1);
    }
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <SectionLabel>Priority actions · {urgent.length + unstaffed.length}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...urgent, ...unstaffed.filter((b) => b.priority !== "urgent")].slice(0, 6).map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#FDF3F2",
                  border: "0.5px solid #F0CECA",
                }}
              >
                <PriorityPill priority={b.priority} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "#5A5A5A", marginTop: 2 }}>
                    {b.client} · {b.market} · starts {b.startDate}
                    {b.daysToStart !== null && ` · ${b.daysToStart}d to start`}
                  </div>
                </div>
                <StageBadge stage={b.stage} />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="0">
          <div style={{ padding: "16px 22px 8px" }}>
            <SectionLabel>All briefs · {briefs.length}</SectionLabel>
          </div>
          <div>
            {briefs.map((b, i) => (
              <div
                key={b.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 2fr) 110px 70px 110px",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 22px",
                  borderTop: i === 0 ? "0.5px solid rgba(0,0,0,0.05)" : "0.5px solid rgba(0,0,0,0.05)",
                  fontSize: 13,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "#161311", marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "#9A9A9A" }}>
                    {b.client} · {b.market} · {b.briefType}
                  </div>
                </div>
                <StageBadge stage={b.stage} />
                <HarmonyDot score={b.harmonyScore} />
                <PriorityPill priority={b.priority} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <SectionLabel>Available now · {nowAvailable.length}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nowAvailable.length === 0 && (
              <div style={{ fontSize: 12, color: "#9A9A9A" }}>No one is on the bench this week.</div>
            )}
            {nowAvailable.slice(0, 6).map((p) => {
              const e = energy[p.primary];
              return (
                <Link
                  key={p.id}
                  href={`/people/${p.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 8px",
                    borderRadius: 8,
                    textDecoration: "none",
                  }}
                >
                  <span
                    aria-hidden
                    style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#161311", flex: 1, minWidth: 0 }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 11, color: "#9A9A9A" }}>{p.location}</span>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionLabel>Market snapshot</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Stockholm", "Oslo", "Copenhagen", "Helsinki"].map((m) => {
              const briefsHere = briefs.filter((b) => b.market === m).length;
              const benchHere = benchByMarket.get(m) ?? 0;
              return (
                <div
                  key={m}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <div style={{ color: "#161311", fontWeight: 500 }}>{m}</div>
                  <div style={{ color: "#9A9A9A" }}>{briefsHere} briefs</div>
                  <div style={{ color: benchHere > 0 ? "#B87A2E" : "#9A9A9A" }}>{benchHere} on bench</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionLabel>This week’s read</SectionLabel>
          <p style={{ fontSize: 12.5, color: "#4D4945", lineHeight: 1.6, margin: 0 }}>
            {urgent.length} urgent briefs need attention this week — biggest gap is the
            Volvo Cars extension (Driver-led engineering lead) which is still unstaffed.
            Nordea wealth pitch closes in five days. Helsinki bench widening — two consultants
            available now, both Analyst-led.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ---------- Kanban ----------

function KanbanTab({ briefs }: { briefs: Brief[] }) {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
      {BRIEF_STAGES.map((s) => {
        const inStage = briefs.filter((b) => b.stage === s.key);
        return (
          <div
            key={s.key}
            style={{
              flexShrink: 0,
              width: 280,
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 12,
              padding: "14px 14px 18px",
              minHeight: 480,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
                paddingBottom: 10,
                borderBottom: "0.5px solid rgba(0,0,0,0.05)",
              }}
            >
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: s.tone }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "#161311", flex: 1 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#9A9A9A" }}>{inStage.length}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {inStage.length === 0 && (
                <div style={{ fontSize: 11, color: "#9A9A9A", textAlign: "center", padding: "16px 4px" }}>
                  No briefs in this stage.
                </div>
              )}
              {inStage.map((b) => (
                <div
                  key={b.id}
                  style={{
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    borderRadius: 10,
                    padding: 12,
                    background: "#FAFAF8",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <PriorityPill priority={b.priority} />
                    <HarmonyDot score={b.harmonyScore} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#161311", marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "#9A9A9A", lineHeight: 1.5 }}>
                    {b.client} · {b.market}
                    <br />
                    Starts {b.startDate}
                    {b.daysToStart !== null && ` · in ${b.daysToStart}d`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Timeline ----------

function TimelineTab({ briefs, people }: { briefs: Brief[]; people: Person[] }) {
  const stickyBriefs = briefs.filter((b) => b.stage === "active" || b.stage === "confirmed");
  return (
    <Card>
      <SectionLabel>Next 8 weeks · {people.length} consultants</SectionLabel>
      <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.6, marginBottom: 16 }}>
        Sample timeline based on active and confirmed briefs. The full Gantt loads here
        once we wire engagement plans. Until then this is a snapshot of confirmed work.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stickyBriefs.map((b) => (
          <div
            key={b.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.6fr) 110px 80px 90px",
              gap: 12,
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: 10,
              background: "#FAFAF8",
              border: "0.5px solid rgba(0,0,0,0.05)",
              fontSize: 13,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "#161311" }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "#9A9A9A" }}>
                {b.client} · {b.market}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#5A5A5A" }}>Start {b.startDate}</div>
            <div style={{ fontSize: 11, color: "#5A5A5A" }}>{b.duration}</div>
            <StageBadge stage={b.stage} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- Pitch board ----------

function PitchTab({ roles }: { roles: PitchRole[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 4 }}>
          <SectionLabel>Open roles · {roles.length}</SectionLabel>
          <div style={{ fontSize: 11, color: "#9A9A9A" }}>
            Apply earns 20 credits · Shortlisted earns 40 · Selected earns full
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 12,
            marginTop: 12,
          }}
        >
          {roles.map((r) => {
            const e = energy[r.requiredEnergy];
            return (
              <div
                key={r.id}
                style={{
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  borderRadius: 12,
                  padding: 16,
                  background: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 9px",
                      borderRadius: 100,
                      background: e.bg,
                      color: e.text,
                      border: `0.5px solid ${e.border}`,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
                    {e.label} · {r.level}
                  </span>
                  <span style={{ fontSize: 11, color: "#9A9A9A" }}>+{r.creditsOnSelection} credits</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#161311", lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 2 }}>
                    {r.briefName} · {r.market}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {r.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 10,
                        color: "#5A5A5A",
                        background: "#FAFAF8",
                        border: "0.5px solid rgba(0,0,0,0.07)",
                        padding: "2px 8px",
                        borderRadius: 100,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "0.5px solid rgba(0,0,0,0.05)",
                    marginTop: "auto",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#9A9A9A" }}>
                    {r.duration} · starts {r.startDate}
                  </div>
                  <div style={{ fontSize: 11, color: "#5A5A5A" }}>
                    {r.applicantCount} {r.applicantCount === 1 ? "applicant" : "applicants"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ---------- Availability ----------

function AvailabilityTab({ people, enriched }: { people: Person[]; enriched: PersonWithCapacity[] }) {
  const markets = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"];
  const enrichedById = new Map(enriched.map((p) => [p.id, p]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {markets.map((m) => {
        const inMarket = people.filter((p) => p.location === m);
        if (inMarket.length === 0) return null;
        return (
          <Card key={m}>
            <SectionLabel>
              {m} · {inMarket.length}
            </SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 8,
              }}
            >
              {inMarket.map((p) => {
                const e = energy[p.primary];
                const cap = enrichedById.get(p.id);
                const benchDays = cap?.capacity.benchDays ?? 0;
                const statusBg =
                  p.available === "now"
                    ? "#5CAB82"
                    : p.available === "soon"
                      ? "#D4974A"
                      : "#E0DDD8";
                return (
                  <Link
                    key={p.id}
                    href={`/people/${p.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "0.5px solid rgba(0,0,0,0.06)",
                      background: "#FAFAF8",
                      textDecoration: "none",
                    }}
                  >
                    <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#161311" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: "#9A9A9A" }}>{p.role}</div>
                    </div>
                    <span
                      aria-hidden
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: statusBg,
                      }}
                      title={`${p.available}${benchDays > 0 ? ` · ${benchDays}d bench` : ""}`}
                    />
                  </Link>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ---------- Build team + Markets (link out) ----------

function BuildTeamLink() {
  return (
    <ScaffoldCard
      title="Build team — compose teams with personality fit"
      body="The full team-composition workbench. Drag people into a draft team, see the harmony score update live, get energy-gap warnings, an AI conflict-cost projection, and ranked swap suggestions. Saved teams live in the same workbench."
      bullets={[
        "Draft picker — every consultant filterable by market, energy, availability",
        "Harmony dial — live score as you add or remove people",
        "Energy gap detection — undersupplied + oversupplied energies",
        "AI team analysis — friction pairs, missing angle, kickoff prompt",
        "Conflict cost projection — productivity loss in euros per quarter",
        "Saved teams list — name, client, members, harmony, last edit",
      ]}
      cta={{ href: "/teams/markets?tab=build", label: "Open Build team workbench →" }}
    />
  );
}

function MarketsLink() {
  return (
    <ScaffoldCard
      title="Markets — Nordic culture analysis"
      body="Per-market culture profiles plus the cross-market friction matrix. Understand how Stockholm, Oslo, Copenhagen and Helsinki differ in dominant energy so projects spanning markets can be staffed deliberately."
      bullets={[
        "Per-market culture cards (dominant energy, top capabilities, signature)",
        "Cross-market friction matrix — every market pair scored",
        "Best-for and watch-for notes per market",
        "Average loyalty + utilisation per market",
      ]}
      cta={{ href: "/teams/markets?tab=markets", label: "Open Markets analysis →" }}
    />
  );
}

function ScaffoldCard({ title, body, bullets, cta }: { title: string; body: string; bullets: string[]; cta?: { href: string; label: string } }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "28px 32px",
        maxWidth: 720,
      }}
    >
      <h2
        className="font-display"
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#161311",
          letterSpacing: "-0.3px",
          margin: "0 0 10px",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 14, color: "#4D4945", lineHeight: 1.65, margin: "0 0 16px" }}>{body}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {bullets.map((b, i) => (
          <li
            key={i}
            style={{
              fontSize: 13,
              color: "#5A5A5A",
              lineHeight: 1.55,
              paddingLeft: 18,
              position: "relative",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 8,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#D4974A",
              }}
            />
            {b}
          </li>
        ))}
      </ul>
      {cta && (
        <Link
          href={cta.href}
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "8px 14px",
            borderRadius: 100,
            background: "#161311",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 400,
            textDecoration: "none",
          }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
