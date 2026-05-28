"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EnergyKey, Person, energy } from "../../page";
import {
  BriefAnalysis,
  analyzeBriefViaApi,
  createTeamViaApi,
  fetchAllPeople,
} from "../../lib/api-client";
import {
  averageScores,
  calculateConflictCost,
  calculateHarmony,
  dominantEnergy,
  teamCombinedDayRate,
} from "../../lib/team-intelligence";

const SAMPLE_BRIEF = `Nordea is putting their omnichannel banking platform out to bid for Q3 2026. Eight-month engagement, kickoff September. They need a senior, client-facing engagement lead who can hold board-level conversations, a principal architect with deep event-driven systems experience (they're moving off mainframe), one or two product designers who can lead service-design workshops with senior bank stakeholders, and a delivery lead who has handled programmes in financial services.

The relationship is at risk — their existing supplier mishandled a regulatory project last quarter and there's no margin for delivery surprises. They've explicitly said they want a steady, considered team, not a high-pace pitch crew.

Day-rate-sensitive — they want senior craft but expect us to be commercially competitive on the principal grades.`;

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

function Avatar({ person, size = 36 }: { person: Person; size?: number }) {
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

function ProposalCard({
  proposal,
  index,
  people,
  duration,
  client,
  onSaved,
}: {
  proposal: BriefAnalysis["proposals"][number];
  index: number;
  people: Person[];
  duration: number;
  client: string;
  onSaved: (teamId: number) => void;
}) {
  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const members = proposal.members
    .map((m) => ({ ...m, person: peopleById.get(m.personId) }))
    .filter((m): m is typeof m & { person: Person } => Boolean(m.person));

  const teamPeople = members.map((m) => m.person);
  const harmony = calculateHarmony(teamPeople);
  const cost = calculateConflictCost(teamPeople, harmony.score, duration);
  const dailyRate = teamCombinedDayRate(teamPeople);
  const projectBillable = dailyRate * 18 * duration;
  const dom = teamPeople.length > 0 ? dominantEnergy(teamPeople) : null;
  const avg = averageScores(teamPeople);
  const markets = Array.from(new Set(teamPeople.map((p) => p.location)));

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const team = await createTeamViaApi({
        name: proposal.name,
        description: `${proposal.rationale}${client ? ` Client: ${client}.` : ""}`,
        client: client || null,
        members: members.map((m) => ({ personId: m.personId, role: m.role })),
      });
      setSavedId(team.id);
      onSaved(team.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
        <div>
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
            Option {index + 1}
          </div>
          <div
            className="font-display"
            style={{ fontSize: 20, fontWeight: 600, color: "#161311", letterSpacing: "-0.3px" }}
          >
            {proposal.name}
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 100,
            background: harmony.bandColor + "1A",
            color: harmony.bandColor,
            border: `0.5px solid ${harmony.bandColor}55`,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {harmony.score} · {harmony.band}
        </span>
      </div>

      <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6, margin: "8px 0 4px" }}>
        {proposal.rationale}
      </p>
      <div
        style={{
          fontSize: 12,
          color: "#8B5A00",
          background: "#FFFBF2",
          border: "0.5px solid #FAD98A",
          borderRadius: 10,
          padding: "8px 12px",
          lineHeight: 1.55,
          margin: "10px 0 14px",
        }}
      >
        <span style={{ fontWeight: 700, marginRight: 6 }}>Watch-out:</span>
        {proposal.watchOut}
      </div>

      <SectionLabel>Team · {members.length}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {members.map((m) => (
          <div
            key={m.personId}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: 10,
              background: "#FAFAF8",
              borderRadius: 10,
            }}
          >
            <Avatar person={m.person} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Link
                  href={`/people/${m.person.id}`}
                  style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}
                >
                  {m.person.name}
                </Link>
                <EnergyBadge k={m.person.primary} />
                {m.role && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#5A5A5A",
                      background: "#FFFFFF",
                      border: "0.5px solid rgba(0,0,0,0.07)",
                      borderRadius: 100,
                      padding: "2px 8px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {m.role}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 2 }}>
                {m.person.role} · {m.person.location} · €{m.person.dayRate || 1500}/day
              </div>
              <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.5, marginTop: 4 }}>
                {m.reason}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: "#FAFAF8",
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
            Friction cost / {duration} mo
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: cost.euros > 0 ? "#9B2A1A" : "#1A5C38",
            }}
          >
            {cost.euros > 0 ? `€${(cost.euros / 1000).toFixed(0)}k` : "€0"}
          </div>
        </div>
        <div
          style={{
            background: "#FAFAF8",
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
            Combined day rate
          </div>
          <div
            className="font-display"
            style={{ fontSize: 17, fontWeight: 700, color: "#161311" }}
          >
            €{(dailyRate / 1000).toFixed(1)}k
          </div>
        </div>
        <div
          style={{
            background: "#FAFAF8",
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
            Project billable
          </div>
          <div
            className="font-display"
            style={{ fontSize: 17, fontWeight: 700, color: "#161311" }}
          >
            €{(projectBillable / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          fontSize: 11,
          color: "#5A5A5A",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {dom && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: energy[dom].color,
              }}
            />
            Dominant {energy[dom].label}
          </span>
        )}
        <span>
          Driver {avg.driver}% · Energizer {avg.energizer}% · Supporter {avg.supporter}% · Analyst {avg.analyst}%
        </span>
        <span>Markets: {markets.join(" · ")}</span>
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            background: "#FDF0EE",
            border: "0.5px solid #FCCDC6",
            borderRadius: 10,
            fontSize: 12,
            color: "#9B2A1A",
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={save}
          disabled={saving || savedId !== null}
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: 8,
            border: "none",
            background:
              savedId !== null ? "#2E8B57" : saving ? "#EDEDEA" : "#161311",
            color: savedId !== null || !saving ? "#FFFFFF" : "#9A9A9A",
            fontSize: 12,
            fontWeight: 500,
            cursor: saving || savedId !== null ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {savedId !== null ? "Saved to Teams ✓" : saving ? "Saving…" : "Save as team"}
        </button>
        {savedId !== null && (
          <Link
            href="/teams"
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Open in /teams →
          </Link>
        )}
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px dashed rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        color: "#9A9A9A",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#FAFAF8",
          border: "0.5px dashed rgba(0,0,0,0.12)",
        }}
      />
      <div style={{ fontSize: 14, fontWeight: 600, color: "#5A5A5A" }}>Three proposals will appear here</div>
      <p style={{ fontSize: 12, lineHeight: 1.55, maxWidth: 360, margin: 0 }}>
        Paste an RFP, brief or pitch description on the left. Claude reads the brief, infers the
        required skills + seniority + energy mix, then proposes three distinct team compositions
        from your Nordic pool.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        color: "#5A5A5A",
        textAlign: "center",
      }}
    >
      <style>{`@keyframes humyn-brief-pulse{0%,100%{opacity:.45}50%{opacity:1}}`}</style>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#FFFBF2",
          border: "0.5px solid #FAD98A",
          animation: "humyn-brief-pulse 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ fontSize: 14, fontWeight: 600, color: "#161311" }}>
        Reading the brief, scanning the pool, composing teams…
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.55, maxWidth: 360 }}>
        Claude is matching the brief against every consultant's energy, capabilities, day rate and
        availability. Usually 5–12 seconds.
      </div>
    </div>
  );
}

export default function BriefsNewPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoaded, setPeopleLoaded] = useState(false);

  const [briefText, setBriefText] = useState<string>("");
  const [client, setClient] = useState<string>("");
  const [duration, setDuration] = useState<number>(3);
  const [preferredMarket, setPreferredMarket] = useState<string>("");

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllPeople()
      .then((list) => {
        if (cancelled) return;
        setPeople(list);
        setPeopleLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPeopleLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function generate() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const result = await analyzeBriefViaApi({
        briefText,
        client: client.trim() || undefined,
        durationMonths: duration,
        preferredMarket: preferredMarket.trim() || undefined,
      });
      setAnalysis(result);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Generation failed.");
    }
  }

  const wordCount = useMemo(
    () => briefText.trim().split(/\s+/).filter(Boolean).length,
    [briefText],
  );

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
                color: "#4D4945",
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
            Pulse · Brief to team
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
            Paste a brief, get a team
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720 }}>
            Claude reads the RFP, infers the required skills, seniority and energy mix, then
            proposes three distinct team compositions from your Nordic pool of {people.length || "—"}{" "}
            consultants. Save any of them straight to /teams.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 12,
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              position: "sticky",
              top: 72,
            }}
          >
            <div>
              <SectionLabel>Brief or RFP text</SectionLabel>
              <textarea
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                placeholder="Paste the inbound brief, RFP excerpt or pitch description here…"
                rows={16}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  background: "#FFFFFF",
                  color: "#161311",
                  fontSize: 13,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  lineHeight: 1.55,
                  fontFamily: "inherit",
                  minHeight: 320,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                  fontSize: 11,
                  color: "#9A9A9A",
                }}
              >
                <span>
                  {wordCount} {wordCount === 1 ? "word" : "words"} pasted
                </span>
                <button
                  onClick={() => setBriefText(SAMPLE_BRIEF)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 100,
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    background: "#FFFFFF",
                    color: "#5A5A5A",
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Use sample brief
                </button>
              </div>
            </div>

            <div>
              <SectionLabel>Project metadata (optional)</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <input
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Client name (e.g. Nordea)"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    background: "#FFFFFF",
                    color: "#161311",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "0.5px solid rgba(0,0,0,0.07)",
                      background: "#FFFFFF",
                      color: "#161311",
                      fontSize: 13,
                      cursor: "pointer",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value={1}>1 month</option>
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={9}>9 months</option>
                    <option value={12}>12 months</option>
                  </select>
                  <select
                    value={preferredMarket}
                    onChange={(e) => setPreferredMarket(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "0.5px solid rgba(0,0,0,0.07)",
                      background: "#FFFFFF",
                      color: "#161311",
                      fontSize: 13,
                      cursor: "pointer",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">Any market</option>
                    <option value="Stockholm">Stockholm</option>
                    <option value="Oslo">Oslo</option>
                    <option value="Copenhagen">Copenhagen</option>
                    <option value="Helsinki">Helsinki</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={
                status === "loading" ||
                briefText.trim().length < 30 ||
                !peopleLoaded ||
                people.length === 0
              }
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background:
                  status === "loading" || briefText.trim().length < 30 || people.length === 0
                    ? "#EDEDEA"
                    : "#161311",
                color:
                  status === "loading" || briefText.trim().length < 30 || people.length === 0
                    ? "#9A9A9A"
                    : "#FFFFFF",
                fontSize: 13,
                fontWeight: 500,
                cursor:
                  status === "loading" || briefText.trim().length < 30 || people.length === 0
                    ? "not-allowed"
                    : "pointer",
                fontFamily: "inherit",
              }}
            >
              {status === "loading" ? "Composing teams…" : "Generate 3 team options"}
            </button>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {status === "idle" && <EmptyState />}
            {status === "loading" && <LoadingState />}
            {status === "error" && (
              <div
                style={{
                  background: "#FDF0EE",
                  border: "0.5px solid #FCCDC6",
                  borderRadius: 12,
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#9B2A1A",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Generation failed
                </div>
                <div style={{ fontSize: 13, color: "#9B2A1A", lineHeight: 1.55, marginBottom: 12 }}>
                  {errorMessage}
                </div>
                <button
                  onClick={() => setStatus("idle")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "0.5px solid #FCCDC6",
                    background: "#FFFFFF",
                    color: "#9B2A1A",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Try again
                </button>
              </div>
            )}
            {status === "ready" && analysis && (
              <>
                <Card>
                  <SectionLabel>What Claude read in the brief</SectionLabel>
                  <p style={{ fontSize: 14, color: "#161311", lineHeight: 1.6, margin: 0 }}>
                    {analysis.briefSummary}
                  </p>
                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 8,
                    }}
                  >
                    {analysis.inferredRequirements.skills.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#9A9A9A",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Inferred skills
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {analysis.inferredRequirements.skills.map((s) => (
                            <span
                              key={s}
                              style={{
                                padding: "3px 9px",
                                borderRadius: 100,
                                background: "#FAFAF8",
                                color: "#5A5A5A",
                                border: "0.5px solid rgba(0,0,0,0.07)",
                                fontSize: 11,
                                fontWeight: 500,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.inferredRequirements.seniorityNotes && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#5A5A5A",
                          lineHeight: 1.55,
                          padding: "8px 12px",
                          background: "#FAFAF8",
                          borderRadius: 8,
                          border: "0.5px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: 6 }}>Seniority:</span>
                        {analysis.inferredRequirements.seniorityNotes}
                      </div>
                    )}
                    {analysis.inferredRequirements.energyMix && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#5A5A5A",
                          lineHeight: 1.55,
                          padding: "8px 12px",
                          background: "#FAFAF8",
                          borderRadius: 8,
                          border: "0.5px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: 6 }}>Energy mix:</span>
                        {analysis.inferredRequirements.energyMix}
                      </div>
                    )}
                  </div>
                </Card>

                {analysis.proposals.map((p, i) => (
                  <ProposalCard
                    key={i}
                    proposal={p}
                    index={i}
                    people={people}
                    duration={duration}
                    client={client}
                    onSaved={(_id) => {
                      void _id;
                    }}
                  />
                ))}

                <div
                  style={{
                    padding: "10px 14px",
                    background: "#FAFAF8",
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#5A5A5A",
                    lineHeight: 1.55,
                    textAlign: "center",
                  }}
                >
                  Want to tweak a proposal? Click{" "}
                  <Link href="/teams" style={{ color: "#1E6FA5", fontWeight: 600 }}>
                    /teams
                  </Link>{" "}
                  to swap members, run the AI deep read, and adjust before going to client.
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
