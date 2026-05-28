"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EnergyKey, Person, energy } from "../page";
import { PersonWithCapacity } from "../lib/capacity-data";
import { EnergyRing } from "../components/energy";
import {
  TeamAnalysis,
  TeamPayload,
  analyzeTeamViaApi,
  createTeamViaApi,
  deleteTeamViaApi,
  fetchAllPeople,
  fetchAllTeams,
  fetchEnrichedPeople,
  updateTeamViaApi,
} from "../lib/api-client";
import {
  EnergyGap,
  FrictionPair,
  MarketCulture,
  NORDIC_MARKETS,
  SuggestedSwap,
  averageScores,
  calculateConflictCost,
  calculateHarmony,
  computeMarketCulture,
  crossMarketFriction,
  detectEnergyGaps,
  detectFrictionPairs,
  dominantEnergy,
  suggestSwaps,
  teamRiskMix,
} from "../lib/team-intelligence";

type TabKey = "saved" | "build" | "markets";

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
        border: `0.5px solid ${e.border}`,
        fontSize: small ? 10 : 11,
        fontWeight: 500,
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

function StatBlock({
  label,
  value,
  detail,
  color,
  bg,
  border,
}: {
  label: string;
  value: string;
  detail?: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `0.5px solid ${border}`,
        borderRadius: 12,
        padding: "1rem 1.1rem",
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
          color,
          letterSpacing: "-0.4px",
          marginTop: 6,
        }}
      >
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: 11, color: "#5A5A5A", lineHeight: 1.45, marginTop: 4 }}>
          {detail}
        </div>
      )}
    </div>
  );
}

function MiniEnergyBars({ scores }: { scores: Record<EnergyKey, number> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {(["red", "yellow", "green", "blue"] as EnergyKey[]).map((c) => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#5A5A5A", width: 56, fontWeight: 500 }}>
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
          <span style={{ fontSize: 10, color: energy[c].text, width: 28, textAlign: "right", fontWeight: 600 }}>
            {scores[c]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function HarmonyDial({ score, color }: { score: number; color: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx={48} cy={48} r={radius} stroke="#EDEDEA" strokeWidth={8} fill="none" />
      <circle
        cx={48}
        cy={48}
        r={radius}
        stroke={color}
        strokeWidth={8}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text
        x={48}
        y={47}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 22, fontWeight: 700, fill: "#161311" }}
        className="font-display"
      >
        {score}
      </text>
      <text
        x={48}
        y={64}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 9, fill: "#9A9A9A", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}
      >
        out of 100
      </text>
    </svg>
  );
}

function Header({ active }: { active: TabKey }) {
  return (
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
              color: "#FFFFFF",
              background: "#161311",
            }}
          >
            Teams
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
        </nav>
        <div style={{ flex: 1 }} />
        <Link
          href="/briefs/new"
          style={{
            padding: "7px 14px",
            borderRadius: 100,
            border: "none",
            background: "#161311",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Brief → Team
        </Link>
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
      <span style={{ display: "none" }}>{active}</span>
    </header>
  );
}

function Tabs({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const items: { key: TabKey; label: string }[] = [
    { key: "saved", label: "Teams" },
    { key: "build", label: "Build" },
    { key: "markets", label: "Markets" },
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        margin: "0 0 20px",
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 10,
        padding: 4,
        width: "fit-content",
      }}
    >
      {items.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: tab === t.key ? "#161311" : "transparent",
            color: tab === t.key ? "#FFFFFF" : "#4D4945",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SavedTeamCard({
  team,
  people,
  onOpen,
  onDelete,
}: {
  team: TeamPayload;
  people: Person[];
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const teamPeople = team.members
    .map((m) => peopleById.get(m.personId))
    .filter((p): p is Person => Boolean(p));
  const harmony = calculateHarmony(teamPeople);
  const cost = calculateConflictCost(teamPeople, harmony.score);
  const dom = teamPeople.length > 0 ? dominantEnergy(teamPeople) : null;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="font-display"
            style={{ fontSize: 18, fontWeight: 600, color: "#161311", letterSpacing: "-0.3px" }}
          >
            {team.name}
          </div>
          {team.client && (
            <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 2 }}>{team.client}</div>
          )}
          {team.description && (
            <p style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.5, margin: "8px 0 0" }}>
              {team.description}
            </p>
          )}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 100,
            background: harmony.bandColor + "1A",
            color: harmony.bandColor,
            border: `0.5px solid ${harmony.bandColor}55`,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {harmony.score} · {harmony.band}
        </span>
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", marginRight: 8 }}>
          {teamPeople.slice(0, 6).map((p, i) => (
            <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
              <Avatar person={p} size={28} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 11, color: "#9A9A9A" }}>
            {teamPeople.length} {teamPeople.length === 1 ? "person" : "people"}
          </span>
          {dom && (
            <span style={{ fontSize: 11, color: energy[dom].text, fontWeight: 600 }}>
              Dominant {energy[dom].label}
            </span>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 10,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Friction cost / qtr
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: cost.euros > 0 ? "#9B2A1A" : "#1A5C38",
              marginTop: 2,
            }}
          >
            {cost.euros > 0 ? `€${(cost.euros / 1000).toFixed(0)}k` : "—"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          onClick={() => onOpen(team.id)}
          style={{
            flex: 1,
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#161311",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Open in builder
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete team "${team.name}"?`)) onDelete(team.id);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "0.5px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#9B2A1A",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Delete
        </button>
      </div>
    </Card>
  );
}

function PersonPickerRow({
  person,
  inTeam,
  onToggle,
}: {
  person: Person;
  inTeam: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        background: inTeam ? "#EEF7F2" : "#FFFFFF",
        border: `0.5px solid ${inTeam ? "#9ED4B8" : "rgba(0,0,0,0.07)"}`,
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        width: "100%",
      }}
    >
      <Avatar person={person} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{person.name}</div>
        <div style={{ fontSize: 11, color: "#9A9A9A" }}>
          {person.role} · {person.location}
        </div>
      </div>
      <EnergyBadge k={person.primary} />
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: inTeam ? "#2E8B57" : "#FFFFFF",
          color: inTeam ? "#FFFFFF" : "#9A9A9A",
          border: `0.5px solid ${inTeam ? "#2E8B57" : "rgba(0,0,0,0.1)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {inTeam ? "−" : "+"}
      </span>
    </button>
  );
}

function MarketCard({ market }: { market: MarketCulture }) {
  const dom = energy[market.dominantEnergy];
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div
            className="font-display"
            style={{ fontSize: 20, fontWeight: 600, color: "#161311", letterSpacing: "-0.3px" }}
          >
            {market.name}
          </div>
          <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 2 }}>
            {market.count} consultant{market.count === 1 ? "" : "s"}
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 100,
            background: dom.bg,
            color: dom.text,
            border: `0.5px solid ${dom.border}`,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dom.color }} />
          Dominant {dom.label}
        </span>
      </div>

      {market.count > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
            <MiniEnergyBars scores={market.averageScores} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                  style={{ fontSize: 17, fontWeight: 700, color: "#161311" }}
                >
                  {market.averageUtilisation}%
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
                  Avg loyalty
                </div>
                <div
                  className="font-display"
                  style={{ fontSize: 17, fontWeight: 700, color: "#161311" }}
                >
                  {market.averageLoyalty}
                </div>
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#161311",
              lineHeight: 1.6,
              margin: "16px 0 14px",
              fontStyle: "italic",
            }}
          >
            {market.signature}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                background: "#EEF7F2",
                border: "0.5px solid #9ED4B8",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#1A5C38",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Best for
              </div>
              <div style={{ fontSize: 12, color: "#1A5C38", lineHeight: 1.5 }}>{market.bestFor}</div>
            </div>
            <div
              style={{
                background: "#FFFBF2",
                border: "0.5px solid #FAD98A",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#8B5A00",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Watch for
              </div>
              <div style={{ fontSize: 12, color: "#8B5A00", lineHeight: 1.5 }}>{market.watchFor}</div>
            </div>
            {market.topCapabilities.length > 0 && (
              <div>
                <SectionLabel>Top capabilities</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {market.topCapabilities.map((c) => (
                    <span
                      key={c}
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
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: "#9A9A9A" }}>No consultants in {market.name} yet.</div>
      )}
    </Card>
  );
}

function CrossMarketMatrix({ markets }: { markets: MarketCulture[] }) {
  const valid = markets.filter((m) => m.count > 0);
  const [hover, setHover] = useState<{ row: string; col: string } | null>(null);
  if (valid.length < 2) return null;
  const hovered =
    hover && valid.find((m) => m.name === hover.row) && valid.find((m) => m.name === hover.col)
      ? crossMarketFriction(
          valid.find((m) => m.name === hover.row)!,
          valid.find((m) => m.name === hover.col)!,
        )
      : null;
  return (
    <Card>
      <SectionLabel>Cross-market collaboration friction</SectionLabel>
      <div style={{ fontSize: 12, color: "#5A5A5A", marginBottom: 14, lineHeight: 1.55, maxWidth: 640 }}>
        Computed from the weighted Pulse-wheel distance between each market's full energy mix —
        not a hardcoded score. 0° = identical temperament, 180° = wheel opposites. Higher numbers
        mean more explicit handoffs and pair-coaching needed at kickoff. Hover any cell to see the
        underlying maths.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ background: "transparent", padding: 8 }} />
              {valid.map((m) => (
                <th
                  key={m.name}
                  style={{
                    fontSize: 11,
                    color: "#5A5A5A",
                    fontWeight: 600,
                    padding: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {valid.map((row) => (
              <tr key={row.name}>
                <th
                  style={{
                    fontSize: 11,
                    color: "#5A5A5A",
                    fontWeight: 600,
                    padding: 8,
                    textAlign: "right",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {row.name}
                </th>
                {valid.map((col) => {
                  if (row.name === col.name) {
                    return (
                      <td
                        key={col.name}
                        style={{
                          background: "#FAFAF8",
                          borderRadius: 6,
                          padding: "12px 8px",
                          textAlign: "center",
                          fontSize: 11,
                          color: "#9A9A9A",
                        }}
                      >
                        —
                      </td>
                    );
                  }
                  const f = crossMarketFriction(row, col);
                  const colour =
                    f.label === "Low" ? "#2E8B57" : f.label === "Moderate" ? "#F5A623" : "#E8402A";
                  const bg =
                    f.label === "Low" ? "#EEF7F2" : f.label === "Moderate" ? "#FFFBF2" : "#FDF0EE";
                  const isHover = hover && hover.row === row.name && hover.col === col.name;
                  return (
                    <td
                      key={col.name}
                      title={`${f.note}\n\n${f.why}`}
                      onMouseEnter={() => setHover({ row: row.name, col: col.name })}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        background: bg,
                        borderRadius: 6,
                        padding: "12px 8px",
                        textAlign: "center",
                        outline: isHover ? `2px solid ${colour}` : "none",
                        cursor: "help",
                      }}
                    >
                      <div
                        className="font-display"
                        style={{ fontSize: 18, fontWeight: 700, color: colour }}
                      >
                        {f.pct}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: colour,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                        }}
                      >
                        {f.label}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: 14,
          padding: 12,
          background: "#FAFAF8",
          border: "0.5px solid rgba(0,0,0,0.07)",
          borderRadius: 10,
          minHeight: 56,
        }}
      >
        {hovered && hover ? (
          <>
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
              {hover.row} ↔ {hover.col} · {hovered.label} friction · {hovered.pct}
            </div>
            <div style={{ fontSize: 13, color: "#161311", lineHeight: 1.55, marginBottom: 4 }}>
              {hovered.note}
            </div>
            <div style={{ fontSize: 11, color: "#5A5A5A", lineHeight: 1.5 }}>{hovered.why}</div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "#9A9A9A", lineHeight: 1.55 }}>
            Hover any matrix cell to see the underlying calculation and the cross-market collaboration note.
          </div>
        )}
      </div>
    </Card>
  );
}

function BuildTab({
  pool,
  enriched,
  selected,
  setSelected,
  draft,
  setDraft,
  onSave,
  onReset,
  saving,
  editingId,
}: {
  pool: Person[];
  enriched: PersonWithCapacity[];
  selected: Person[];
  setSelected: (next: Person[]) => void;
  draft: { name: string; client: string; description: string; duration: number };
  setDraft: (next: { name: string; client: string; description: string; duration: number }) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  saving: boolean;
  editingId: number | null;
}) {
  const [search, setSearch] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<TeamAnalysis | null>(null);
  const [aiHash, setAiHash] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");

  const currentHash = useMemo(
    () => selected.map((p) => p.id).sort((a, b) => a - b).join("-"),
    [selected],
  );
  const aiStale = aiHash !== currentHash;

  const harmony = useMemo(() => calculateHarmony(selected), [selected]);
  const cost = useMemo(
    () => calculateConflictCost(selected, harmony.score, draft.duration),
    [selected, harmony.score, draft.duration],
  );
  const gaps = useMemo<EnergyGap[]>(() => detectEnergyGaps(selected), [selected]);
  const friction = useMemo<FrictionPair[]>(() => detectFrictionPairs(selected), [selected]);
  const avg = useMemo(() => averageScores(selected), [selected]);
  const dom = selected.length > 0 ? dominantEnergy(selected) : null;
  const swaps = useMemo<SuggestedSwap[]>(() => suggestSwaps(selected, pool, 3), [selected, pool]);
  const riskMix = useMemo(() => teamRiskMix(selected, enriched), [selected, enriched]);
  const marketsRepresented = useMemo(
    () => Array.from(new Set(selected.map((p) => p.location))),
    [selected],
  );

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((p) =>
      [p.name, p.role, p.location, ...p.capabilities].join(" ").toLowerCase().includes(q),
    );
  }, [pool, search]);

  function toggle(p: Person) {
    if (selected.some((x) => x.id === p.id)) {
      setSelected(selected.filter((x) => x.id !== p.id));
    } else {
      setSelected([...selected, p]);
    }
  }

  function addSuggested(p: Person) {
    if (!selected.some((x) => x.id === p.id)) setSelected([...selected, p]);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 12, alignItems: "start" }}>
      <Card>
        <SectionLabel>People · {pool.length}</SectionLabel>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, role, skill, location…"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "0.5px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#161311",
            fontSize: 13,
            outline: "none",
            marginBottom: 10,
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 540, overflowY: "auto" }}>
          {filteredPool.map((p) => (
            <PersonPickerRow
              key={p.id}
              person={p}
              inTeam={selected.some((x) => x.id === p.id)}
              onToggle={() => toggle(p)}
            />
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <SectionLabel>{editingId ? `Editing team #${editingId}` : "New team"}</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Team name (e.g. Nordea omnichannel)"
              style={{
                padding: "9px 12px",
                borderRadius: 8,
                border: "0.5px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#161311",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <input
              value={draft.client}
              onChange={(e) => setDraft({ ...draft, client: e.target.value })}
              placeholder="Client (optional)"
              style={{
                padding: "9px 12px",
                borderRadius: 8,
                border: "0.5px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#161311",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="One-line description of the engagement…"
            rows={2}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#5A5A5A" }}>
            <span style={{ fontWeight: 600 }}>Project duration:</span>
            <select
              value={draft.duration}
              onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                border: "0.5px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#161311",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <option value={1}>1 month</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
            <span style={{ color: "#9A9A9A" }}>Used for the friction-cost projection.</span>
          </div>
        </Card>

        <Card>
          <SectionLabel>Selected · {selected.length}</SectionLabel>
          {selected.length === 0 ? (
            <div
              style={{
                padding: 18,
                background: "#FAFAF8",
                border: "0.5px dashed rgba(0,0,0,0.12)",
                borderRadius: 10,
                fontSize: 13,
                color: "#9A9A9A",
                textAlign: "center",
              }}
            >
              Pick people from the left to start composing a team. The intelligence panel below
              updates live.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selected.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 8,
                    background: "#FAFAF8",
                    borderRadius: 10,
                  }}
                >
                  <Avatar person={p} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#9A9A9A" }}>
                      {p.role} · {p.location}
                    </div>
                  </div>
                  <EnergyBadge k={p.primary} />
                  <button
                    onClick={() => toggle(p)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "0.5px solid rgba(0,0,0,0.07)",
                      background: "#FFFFFF",
                      color: "#9B2A1A",
                      cursor: "pointer",
                      fontSize: 13,
                      lineHeight: 1,
                      fontFamily: "inherit",
                    }}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {selected.length > 0 && (
          <>
            <Card>
              <SectionLabel>Team intelligence</SectionLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 12,
                }}
              >
                <StatBlock
                  label="Culture fit"
                  value={`${harmony.score}`}
                  detail={`${harmony.band} · Balance ${harmony.balanceScore} · Coverage ${harmony.coverageScore} · Friction ${harmony.frictionScore}`}
                  color={harmony.bandColor}
                  bg={harmony.bandColor + "10"}
                  border={harmony.bandColor + "44"}
                />
                <StatBlock
                  label={`Friction cost · ${draft.duration} mo`}
                  value={cost.euros > 0 ? `€${(cost.euros / 1000).toFixed(0)}k` : "€0"}
                  detail={cost.rationale}
                  color={cost.euros > 0 ? "#9B2A1A" : "#1A5C38"}
                  bg={cost.euros > 0 ? "#FDF0EE" : "#EEF7F2"}
                  border={cost.euros > 0 ? "#FCCDC6" : "#9ED4B8"}
                />
                <StatBlock
                  label="Risk-tier mix"
                  value={`${riskMix.high + riskMix.medium}`}
                  detail={`${riskMix.high} high · ${riskMix.medium} medium · ${riskMix.watch} watch (out of ${selected.length})`}
                  color={riskMix.high + riskMix.medium > 0 ? "#9B2A1A" : "#1A5C38"}
                  bg={riskMix.high + riskMix.medium > 0 ? "#FDF0EE" : "#EEF7F2"}
                  border={riskMix.high + riskMix.medium > 0 ? "#FCCDC6" : "#9ED4B8"}
                />
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <HarmonyDial score={harmony.score} color={harmony.bandColor} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                      Markets in this team
                    </span>
                    <span style={{ fontSize: 13, color: "#161311", fontWeight: 600 }}>
                      {marketsRepresented.join(" · ")}
                    </span>
                    {marketsRepresented.length > 1 && (
                      <span style={{ fontSize: 11, color: "#8B5A00" }}>
                        Cross-market team — plan explicit handoffs.
                      </span>
                    )}
                  </div>
                </div>
                {dom && (
                  <div>
                    <SectionLabel>Combined energy</SectionLabel>
                    <MiniEnergyBars scores={avg} />
                    <div style={{ marginTop: 8, fontSize: 11, color: energy[dom].text, fontWeight: 600 }}>
                      Dominant {energy[dom].label}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <div>
                  <SectionLabel>AI deep read · Claude</SectionLabel>
                  <div style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.55, maxWidth: 520 }}>
                    Semantic pass over the team's drivers, detractors and energy mix. Catches frictions the heuristic misses and adds dynamics + missing-angle observations.
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (aiLoading) return;
                    setAiError("");
                    setAiLoading(true);
                    try {
                      const result = await analyzeTeamViaApi(selected.map((p) => p.id));
                      setAiAnalysis(result);
                      setAiHash(currentHash);
                    } catch (err) {
                      setAiError(err instanceof Error ? err.message : "Analysis failed.");
                    } finally {
                      setAiLoading(false);
                    }
                  }}
                  disabled={aiLoading || selected.length < 2}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    background:
                      aiLoading || selected.length < 2
                        ? "#EDEDEA"
                        : aiAnalysis && !aiStale
                          ? "#FFFFFF"
                          : "#161311",
                    color:
                      aiLoading || selected.length < 2
                        ? "#9A9A9A"
                        : aiAnalysis && !aiStale
                          ? "#161311"
                          : "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor:
                      aiLoading || selected.length < 2 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    border:
                      aiAnalysis && !aiStale && !aiLoading && selected.length >= 2
                        ? "0.5px solid rgba(0,0,0,0.07)"
                        : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {aiLoading
                    ? "Analysing…"
                    : aiAnalysis && !aiStale
                      ? "Re-run analysis"
                      : "Run AI analysis"}
                </button>
              </div>

              {selected.length < 2 && (
                <div
                  style={{
                    padding: 12,
                    background: "#FAFAF8",
                    border: "0.5px dashed rgba(0,0,0,0.12)",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#9A9A9A",
                    textAlign: "center",
                  }}
                >
                  Add at least two people to run the AI deep read.
                </div>
              )}

              {aiError && (
                <div
                  style={{
                    padding: 12,
                    background: "#FDF0EE",
                    border: "0.5px solid #FCCDC6",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#9B2A1A",
                  }}
                >
                  {aiError}
                </div>
              )}

              {aiAnalysis && !aiError && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {aiStale && (
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#FFFBF2",
                        border: "0.5px solid #FAD98A",
                        borderRadius: 10,
                        fontSize: 11,
                        color: "#8B5A00",
                      }}
                    >
                      Team has changed since the last analysis. Re-run to refresh.
                    </div>
                  )}

                  <p
                    style={{
                      fontSize: 14,
                      color: "#161311",
                      lineHeight: 1.6,
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    {aiAnalysis.compositionSummary}
                  </p>

                  {aiAnalysis.strengths.length > 0 && (
                    <div>
                      <SectionLabel>Strengths</SectionLabel>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1A5C38", lineHeight: 1.65 }}>
                        {aiAnalysis.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.frictionPairs.length > 0 && (
                    <div>
                      <SectionLabel>AI-identified friction · {aiAnalysis.frictionPairs.length}</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {aiAnalysis.frictionPairs.map((fp, i) => {
                          const tone =
                            fp.severity === "high"
                              ? { bg: "#FDF0EE", border: "#FCCDC6", text: "#9B2A1A" }
                              : fp.severity === "medium"
                                ? { bg: "#FFFBF2", border: "#FAD98A", text: "#8B5A00" }
                                : { bg: "#FAFAF8", border: "rgba(0,0,0,0.07)", text: "#5A5A5A" };
                          return (
                            <div
                              key={i}
                              style={{
                                padding: "10px 12px",
                                background: tone.bg,
                                border: `0.5px solid ${tone.border}`,
                                borderRadius: 10,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>
                                  {fp.a} ↔ {fp.b}
                                </span>
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: 100,
                                    background: tone.text + "22",
                                    color: tone.text,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  {fp.severity}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: tone.text, lineHeight: 1.5 }}>{fp.reason}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {aiAnalysis.dynamicsRisks.length > 0 && (
                    <div>
                      <SectionLabel>Team-dynamic risks</SectionLabel>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#8B5A00", lineHeight: 1.65 }}>
                        {aiAnalysis.dynamicsRisks.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.missingAngle && (
                    <div
                      style={{
                        padding: 12,
                        background: "#EEF4FB",
                        border: "0.5px solid #8DC2E8",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#124A6E",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Missing angle
                      </div>
                      <div style={{ fontSize: 13, color: "#124A6E", lineHeight: 1.55 }}>{aiAnalysis.missingAngle}</div>
                    </div>
                  )}

                  {aiAnalysis.kickoffPrompt && (
                    <div
                      style={{
                        padding: 12,
                        background: "#161311",
                        color: "#FFFFFF",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.6)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Open the kickoff with
                      </div>
                      <div style={{ fontSize: 13, color: "#FFFFFF", lineHeight: 1.55, fontStyle: "italic" }}>
                        &ldquo;{aiAnalysis.kickoffPrompt}&rdquo;
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {gaps.length > 0 && (
              <Card>
                <SectionLabel>Energy balance flags · {gaps.length}</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {gaps.map((g) => {
                    const e = energy[g.energy];
                    const isUnder = g.severity === "undersupplied";
                    return (
                      <div
                        key={`${g.energy}-${g.severity}`}
                        style={{
                          background: isUnder ? "#FDF0EE" : "#FFFBF2",
                          border: `0.5px solid ${isUnder ? "#FCCDC6" : "#FAD98A"}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: e.color,
                            marginTop: 5,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: isUnder ? "#9B2A1A" : "#8B5A00",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              marginBottom: 2,
                            }}
                          >
                            {e.label} {isUnder ? "undersupplied" : "oversupplied"}
                          </div>
                          <div style={{ fontSize: 12, color: isUnder ? "#9B2A1A" : "#8B5A00" }}>
                            {g.detail}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {friction.length > 0 && (
              <Card>
                <SectionLabel>Friction pairs · {friction.length}</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {friction.map((f) => (
                    <div
                      key={`${f.a.id}-${f.b.id}`}
                      style={{
                        background: "#FFFBF2",
                        border: "0.5px solid #FAD98A",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Avatar person={f.a} size={24} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{f.a.name}</span>
                        <span style={{ fontSize: 11, color: "#8B5A00" }}>↔</span>
                        <Avatar person={f.b} size={24} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{f.b.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#8B5A00", lineHeight: 1.5 }}>{f.reason}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {swaps.length > 0 && (
              <Card>
                <SectionLabel>Suggested swaps · close the gaps</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {swaps.map((s) => (
                    <div
                      key={s.candidate.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: 10,
                        background: "#EEF4FB",
                        border: "0.5px solid #8DC2E8",
                        borderRadius: 10,
                      }}
                    >
                      <Avatar person={s.candidate} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>
                          {s.candidate.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#124A6E", lineHeight: 1.5, marginTop: 2 }}>
                          {s.reason}
                        </div>
                      </div>
                      <button
                        onClick={() => addSuggested(s.candidate)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: "0.5px solid #8DC2E8",
                          background: "#FFFFFF",
                          color: "#124A6E",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Add to team
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onReset}
            disabled={saving}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#5A5A5A",
              fontSize: 13,
              fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Reset
          </button>
          <button
            onClick={onSave}
            disabled={saving || selected.length === 0 || !draft.name.trim()}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background:
                saving || selected.length === 0 || !draft.name.trim() ? "#EDEDEA" : "#161311",
              color: saving || selected.length === 0 || !draft.name.trim() ? "#9A9A9A" : "#FFFFFF",
              fontSize: 13,
              fontWeight: 500,
              cursor:
                saving || selected.length === 0 || !draft.name.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Saving…" : editingId ? "Update team" : "Save team"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [tab, setTab] = useState<TabKey>("saved");
  const [people, setPeople] = useState<Person[]>([]);
  const [enriched, setEnriched] = useState<PersonWithCapacity[]>([]);
  const [teams, setTeams] = useState<TeamPayload[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const [selected, setSelected] = useState<Person[]>([]);
  const [draft, setDraft] = useState<{
    name: string;
    client: string;
    description: string;
    duration: number;
  }>({ name: "", client: "", description: "", duration: 3 });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAllPeople(), fetchEnrichedPeople(), fetchAllTeams()])
      .then(([p, e, t]) => {
        if (cancelled) return;
        setPeople(p);
        setEnriched(e);
        setTeams(t);
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

  const marketCultures = useMemo<MarketCulture[]>(
    () => NORDIC_MARKETS.map((m) => computeMarketCulture(m, enriched)),
    [enriched],
  );

  const overallAverage = useMemo(() => averageScores(people), [people]);

  function reset() {
    setSelected([]);
    setDraft({ name: "", client: "", description: "", duration: 3 });
    setEditingId(null);
  }

  function openTeamForEdit(id: number) {
    const t = teams.find((x) => x.id === id);
    if (!t) return;
    const peopleById = new Map(people.map((p) => [p.id, p]));
    setSelected(
      t.members
        .map((m) => peopleById.get(m.personId))
        .filter((p): p is Person => Boolean(p)),
    );
    setDraft({
      name: t.name,
      client: t.client ?? "",
      description: t.description,
      duration: 3,
    });
    setEditingId(t.id);
    setTab("build");
  }

  async function saveTeam() {
    if (selected.length === 0 || !draft.name.trim()) return;
    setSaving(true);
    try {
      const input = {
        name: draft.name.trim(),
        description: draft.description.trim(),
        client: draft.client.trim() || null,
        members: selected.map((p) => ({ personId: p.id, role: "" })),
      };
      const saved = editingId
        ? await updateTeamViaApi(editingId, input)
        : await createTeamViaApi(input);
      const fresh = await fetchAllTeams();
      setTeams(fresh);
      setEditingId(saved.id);
      setTab("saved");
    } catch (err) {
      alert(`Failed to save: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeam(id: number) {
    try {
      await deleteTeamViaApi(id);
      setTeams(teams.filter((t) => t.id !== id));
      if (editingId === id) reset();
    } catch (err) {
      alert(`Failed to delete: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
        <Header active="saved" />
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: 32 }}>Loading teams…</main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
      <Header active={tab} />
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
            Pulse · Team intelligence
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
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720 }}>
            Compose teams that perform. Culture-fit scoring, conflict-cost projection, energy
            balance warnings — and a market-by-market view of how Stockholm, Oslo, Copenhagen and
            Helsinki differ.
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

        <Tabs tab={tab} setTab={setTab} />

        {tab === "saved" && (
          <div>
            {teams.length === 0 ? (
              <Card>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div
                    className="font-display"
                    style={{ fontSize: 18, fontWeight: 600, color: "#161311", marginBottom: 6 }}
                  >
                    No teams saved yet
                  </div>
                  <div style={{ fontSize: 13, color: "#5A5A5A", marginBottom: 14 }}>
                    Switch to the Build tab to compose your first team.
                  </div>
                  <button
                    onClick={() => {
                      reset();
                      setTab("build");
                    }}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 8,
                      border: "none",
                      background: "#161311",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Start building
                  </button>
                </div>
              </Card>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                  gap: 12,
                }}
              >
                {teams.map((t) => (
                  <SavedTeamCard
                    key={t.id}
                    team={t}
                    people={people}
                    onOpen={openTeamForEdit}
                    onDelete={deleteTeam}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "build" && (
          <BuildTab
            pool={people}
            enriched={enriched}
            selected={selected}
            setSelected={setSelected}
            draft={draft}
            setDraft={setDraft}
            onSave={saveTeam}
            onReset={reset}
            saving={saving}
            editingId={editingId}
          />
        )}

        {tab === "markets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <SectionLabel>Nordic Pulse mix · Valtech Nordic</SectionLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 220px) minmax(0, 1fr)",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <EnergyRing
                    scores={overallAverage}
                    position="Whole organisation"
                    primary={dominantEnergy(people)}
                    size={240}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6 }}>
                    Average across {people.length} consultants — Drive {overallAverage.red}% · Spark{" "}
                    {overallAverage.yellow}% · Steady {overallAverage.green}% · Lens{" "}
                    {overallAverage.blue}%. The market cards below show how each office leans
                    against this average.
                  </div>
                </div>
              </div>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
                gap: 12,
              }}
            >
              {marketCultures.map((m) => (
                <MarketCard key={m.name} market={m} />
              ))}
            </div>

            <CrossMarketMatrix markets={marketCultures} />
          </div>
        )}
      </main>
    </div>
  );
}
