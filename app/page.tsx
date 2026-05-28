"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAllPeople } from "./lib/api-client";
import { SignedInBadge } from "./components/signed-in-badge";
import {
  AvailKey,
  EnergyKey,
  Person,
  availability,
  energy,
  people,
  utilTone,
} from "./lib/people-data";

export type { AvailKey, EnergyKey, Person };
export { availability, energy, people, utilTone };


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

function EnergyBadge({ k, small = false }: { k: EnergyKey; small?: boolean }) {
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
        fontWeight: 400,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
      {e.label}
    </span>
  );
}

function StatusBadge({ k }: { k: AvailKey }) {
  const a = availability[k];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 100,
        background: a.bg,
        color: a.text,
        border: `1px solid ${a.border}`,
        fontSize: 10,
        fontWeight: 400,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
      {a.label}
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
        fontWeight: 400,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 100,
        background: "#FAFAF8",
        color: "#5A5A5A",
        border: "1px solid rgba(0,0,0,0.07)",
        fontSize: 11,
        fontWeight: 400,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function EnergyBars({ person }: { person: Person }) {
  return (
    <div>
      {(["driver", "energizer", "supporter", "analyst"] as EnergyKey[]).map((c) => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: energy[c].color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#5A5A5A", width: 110 }}>{energy[c].label}</span>
          <div style={{ flex: 1, height: 4, background: "#EDEDEA", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${person.scores[c]}%`,
                height: "100%",
                background: energy[c].color,
                borderRadius: 2,
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "#9A9A9A", width: 28, textAlign: "right" }}>
            {person.scores[c]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function EnergyDots({ person }: { person: Person }) {
  const max = 12;
  const min = 4;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {(["driver", "energizer", "supporter", "analyst"] as EnergyKey[]).map((k) => {
        const v = person.scores[k];
        const size = min + (v / 100) * (max - min);
        return (
          <span
            key={k}
            title={`${energy[k].label} ${v}%`}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: energy[k].color,
              opacity: 0.35 + (v / 100) * 0.65,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

function PersonCard({
  person,
  inTeam,
  onQuickView,
  onToggleTeam,
}: {
  person: Person;
  inTeam: boolean;
  onQuickView: (p: Person) => void;
  onToggleTeam: (p: Person) => void;
}) {
  const tone = utilTone(person.utilisation);
  const e = energy[person.primary];
  const statusDotBg =
    person.available === "now"
      ? "#5CAB82"
      : person.available === "soon"
        ? "#D4974A"
        : "#E0DDD8";
  const statusDotBorder =
    person.available === "now" || person.available === "soon"
      ? "none"
      : "0.5px solid rgba(0,0,0,0.15)";
  return (
    <div
      onClick={() => onQuickView(person)}
      style={{
        position: "relative",
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 16,
        padding: "20px 22px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.borderColor = e.border;
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: e.color,
          opacity: 0.55,
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            position: "relative",
            width: 52,
            height: 52,
            flexShrink: 0,
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              border: `1.5px solid ${e.color}`,
              opacity: 0.6,
            }}
          />
          <Avatar person={person} size={52} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="font-display"
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.3px",
              lineHeight: 1.2,
            }}
          >
            {person.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#5A5A5A",
              marginTop: 3,
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            {person.role}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              marginTop: 1,
              fontWeight: 400,
            }}
          >
            {person.location}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <span
            aria-hidden
            title={availability[person.available].label}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusDotBg,
              border: statusDotBorder,
              flexShrink: 0,
            }}
          />
          <button
            onClick={(ev) => {
              ev.stopPropagation();
              onToggleTeam(person);
            }}
            aria-label={inTeam ? "Remove from team" : "Add to team"}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.1)",
              background: inTeam ? "#161311" : "#FFFFFF",
              color: inTeam ? "#FFFFFF" : "#161311",
              cursor: "pointer",
              fontSize: 15,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {inTeam ? "−" : "+"}
          </button>
        </div>
      </div>

      <p
        style={{
          fontSize: 13,
          color: "#3A3633",
          lineHeight: 1.55,
          margin: 0,
          fontStyle: "italic",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        &ldquo;{person.bestTrait}&rdquo;
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontSize: 9,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            {person.wheelPosition}
          </div>
          <EnergyDots person={person} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 9,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            Utilisation
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: tone.color,
              letterSpacing: "-0.3px",
              lineHeight: 1.1,
              marginTop: 2,
            }}
          >
            {person.utilisation}%
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 14,
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: 11, color: "#9A9A9A" }}>
          {person.clients} {person.clients === 1 ? "client" : "clients"} · {person.revenue}
        </div>
        <Link
          href={`/people/${person.id}`}
          onClick={(ev) => ev.stopPropagation()}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: e.text,
            textDecoration: "none",
          }}
        >
          Open profile →
        </Link>
      </div>
    </div>
  );
}

function PersonRow({
  person,
  inTeam,
  onQuickView,
  onToggleTeam,
}: {
  person: Person;
  inTeam: boolean;
  onQuickView: (p: Person) => void;
  onToggleTeam: (p: Person) => void;
}) {
  const tone = utilTone(person.utilisation);
  return (
    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <td style={{ padding: "10px 14px", width: 44 }}>
        <Avatar person={person} size={32} />
      </td>
      <td style={{ padding: "10px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}>{person.name}</div>
      </td>
      <td style={{ padding: "10px 14px", fontSize: 12, color: "#9A9A9A", fontWeight: 500 }}>
        {person.role}
      </td>
      <td style={{ padding: "10px 14px", fontSize: 12, color: "#5A5A5A" }}>{person.location}</td>
      <td style={{ padding: "10px 14px" }}>
        <EnergyBadge k={person.primary} small />
      </td>
      <td style={{ padding: "10px 14px", minWidth: 140 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              height: 5,
              background: "#EDEDEA",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(person.utilisation, 100)}%`,
                height: "100%",
                background: tone.color,
                borderRadius: 3,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              color: tone.color,
              fontWeight: 600,
              minWidth: 36,
              textAlign: "right",
            }}
          >
            {person.utilisation}%
          </span>
        </div>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <StatusBadge k={person.available} />
      </td>
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button
            onClick={() => onQuickView(person)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 11,
              fontWeight: 400,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Quick view
          </button>
          <Link
            href={`/people/${person.id}`}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: "#161311",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 400,
            }}
          >
            Open
          </Link>
          <button
            onClick={() => onToggleTeam(person)}
            aria-label={inTeam ? "Remove from team" : "Add to team"}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: inTeam ? "#161311" : "#FFFFFF",
              color: inTeam ? "#FFFFFF" : "#161311",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              fontFamily: "inherit",
            }}
          >
            {inTeam ? "−" : "+"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function QuickViewDrawer({ person, onClose }: { person: Person; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.2)", cursor: "pointer" }} />
      <div
        style={{
          width: 420,
          background: "#FFFFFF",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "-2px 0 24px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href={`/people/${person.id}`}
            style={{ fontSize: 12, color: "#1E6FA5", fontWeight: 500 }}
          >
            Full profile →
          </Link>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#1A1A1A",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar person={person} size={56} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>
              {person.name}
            </div>
            <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 2 }}>
              {person.role} · {person.location}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <EnergyBadge k={person.primary} small />
          <Pill>{person.wheelPosition}</Pill>
          <StatusBadge k={person.available} />
        </div>

        <div>
          <SectionLabel>About</SectionLabel>
          <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6, margin: 0 }}>{person.bio}</p>
        </div>

        <div>
          <SectionLabel>Energy profile</SectionLabel>
          <EnergyBars person={person} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div
            style={{
              background: "#EEF7F2",
              border: "1px solid #9ED4B8",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#1A5C38",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Best trait
            </div>
            <div style={{ fontSize: 12, color: "#1A5C38", lineHeight: 1.5 }}>{person.bestTrait}</div>
          </div>
          <div
            style={{
              background: "#FDF0EE",
              border: "1px solid #FCCDC6",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#9B2A1A",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Watch-out
            </div>
            <div style={{ fontSize: 12, color: "#9B2A1A", lineHeight: 1.5 }}>{person.vice}</div>
          </div>
        </div>

        <div>
          <SectionLabel>Drivers</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {person.drivers.map((d) => (
              <Pill key={d}>{d}</Pill>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Detractors</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {person.detractors.map((d) => (
              <Pill key={d}>{d}</Pill>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>How to speak with them</SectionLabel>
          <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6, margin: 0 }}>
            {person.howToSpeak}
          </p>
        </div>
      </div>
    </div>
  );
}

function TeamBuilderDrawer({
  team,
  onClose,
  onRemove,
}: {
  team: Person[];
  onClose: () => void;
  onRemove: (p: Person) => void;
}) {
  const combined = useMemo(() => {
    const sum = { driver: 0, energizer: 0, supporter: 0, analyst: 0 };
    team.forEach((p) => {
      sum.driver += p.scores.driver;
      sum.energizer += p.scores.energizer;
      sum.supporter += p.scores.supporter;
      sum.analyst += p.scores.analyst;
    });
    const n = Math.max(team.length, 1);
    return {
      driver: Math.round(sum.driver / n),
      energizer: Math.round(sum.energizer / n),
      supporter: Math.round(sum.supporter / n),
      analyst: Math.round(sum.analyst / n),
    };
  }, [team]);

  const dominant: EnergyKey = (["driver", "energizer", "supporter", "analyst"] as EnergyKey[]).reduce(
    (best, c) => (combined[c] > combined[best] ? c : best),
    "driver" as EnergyKey,
  );

  const avgUtil = team.length
    ? Math.round(team.reduce((a, p) => a + p.utilisation, 0) / team.length)
    : 0;

  const gaps: string[] = [];
  (["driver", "energizer", "supporter", "analyst"] as EnergyKey[]).forEach((c) => {
    if (team.length > 0 && combined[c] < 35) gaps.push(energy[c].label);
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.2)", cursor: "pointer" }} />
      <div
        style={{
          width: 420,
          background: "#FFFFFF",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "-2px 0 24px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>
            Team builder
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#1A1A1A",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {team.length === 0 ? (
          <div
            style={{
              padding: 24,
              background: "#FAFAF8",
              border: "1px dashed rgba(0,0,0,0.1)",
              borderRadius: 10,
              color: "#9A9A9A",
              fontSize: 13,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Add people from the directory using the + button on any card. The team profile builds itself
            as you go.
          </div>
        ) : (
          <>
            <div>
              <SectionLabel>Selected · {team.length}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {team.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 10,
                      background: "#FAFAF8",
                      borderRadius: 10,
                    }}
                  >
                    <Avatar person={p} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#9A9A9A" }}>{p.role}</div>
                    </div>
                    <EnergyBadge k={p.primary} small />
                    <button
                      onClick={() => onRemove(p)}
                      aria-label={`Remove ${p.name}`}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "1px solid rgba(0,0,0,0.07)",
                        background: "#FFFFFF",
                        cursor: "pointer",
                        fontSize: 13,
                        lineHeight: 1,
                      }}
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Combined energy</SectionLabel>
              {(["driver", "energizer", "supporter", "analyst"] as EnergyKey[]).map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: energy[c].color }} />
                  <span style={{ fontSize: 11, color: "#5A5A5A", width: 110 }}>{energy[c].label}</span>
                  <div style={{ flex: 1, height: 4, background: "#EDEDEA", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${combined[c]}%`,
                        height: "100%",
                        background: energy[c].color,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#9A9A9A", width: 28, textAlign: "right" }}>
                    {combined[c]}%
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div
                style={{
                  background: energy[dominant].bg,
                  border: `1px solid ${energy[dominant].border}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: energy[dominant].text,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Dominant energy
                </div>
                <div style={{ fontSize: 13, color: energy[dominant].text, fontWeight: 600 }}>
                  {energy[dominant].label}
                </div>
              </div>

              <div
                style={{
                  background: "#FAFAF8",
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#9A9A9A",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Avg utilisation
                </div>
                <div style={{ fontSize: 13, color: utilTone(avgUtil).color, fontWeight: 600 }}>
                  {avgUtil}% · {utilTone(avgUtil).label}
                </div>
              </div>
            </div>

            {gaps.length > 0 && (
              <div
                style={{
                  background: "#FFFBF2",
                  border: "1px solid #FAD98A",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#8B5A00",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Energy gap warning
                </div>
                <div style={{ fontSize: 12, color: "#8B5A00", lineHeight: 1.5 }}>
                  This team is light on {gaps.join(", ")}. Consider balancing before kickoff.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type GroupKey = "none" | "available" | "energy" | "location" | "utilisation";

function groupLabel(g: GroupKey, k: string): string {
  if (g === "available") return availability[k as AvailKey]?.label ?? k;
  if (g === "energy") return energy[k as EnergyKey]?.label ?? k;
  if (g === "utilisation") {
    if (k === "high") return "On target (80%+)";
    if (k === "mid") return "Below target (65–79%)";
    return "At risk (under 65%)";
  }
  return k;
}

function groupKeyFor(p: Person, g: GroupKey): string {
  if (g === "available") return p.available;
  if (g === "energy") return p.primary;
  if (g === "location") return p.location;
  if (g === "utilisation") {
    if (p.utilisation >= 80) return "high";
    if (p.utilisation >= 65) return "mid";
    return "low";
  }
  return "all";
}

const VIEW_STORAGE_KEY = "humyn.directory-view";

export default function PeoplePage() {
  const [view, setView] = useState<"card" | "list">("card");
  const [search, setSearch] = useState<string>("");
  const [groupBy, setGroupBy] = useState<GroupKey>("none");
  const [selected, setSelected] = useState<Person | null>(null);
  const [team, setTeam] = useState<Person[]>([]);
  const [teamOpen, setTeamOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "card" || saved === "list") setView(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);
  const [mergedPeople, setMergedPeople] = useState<Person[]>(people);

  useEffect(() => {
    let cancelled = false;
    fetchAllPeople()
      .then((list) => {
        if (!cancelled && list.length > 0) setMergedPeople(list);
      })
      .catch((err) => {
        console.error("Failed to load people from API:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo<Person[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mergedPeople;
    return mergedPeople.filter((p) => {
      const hay = [p.name, p.role, p.location, ...p.capabilities].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [search, mergedPeople]);

  const grouped = useMemo<{ key: string; label: string; people: Person[] }[]>(() => {
    if (groupBy === "none") {
      return [{ key: "all", label: "All people", people: filtered }];
    }
    const map = new Map<string, Person[]>();
    filtered.forEach((p) => {
      const k = groupKeyFor(p, groupBy);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    });
    return Array.from(map.entries()).map(([key, list]) => ({
      key,
      label: groupLabel(groupBy, key),
      people: list,
    }));
  }, [filtered, groupBy]);

  function toggleTeam(p: Person) {
    setTeam((prev) =>
      prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p],
    );
  }

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
          <HumynWordmark />
          <nav style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 400,
                color: "#FFFFFF",
                background: "#161311",
              }}
            >
              People
            </span>
            <Link
              href="/teams"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 400,
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
                fontWeight: 400,
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
                fontWeight: 400,
                color: "#4D4945",
                background: "transparent",
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
                fontWeight: 400,
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
                fontWeight: 400,
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
                fontWeight: 400,
                color: "#4D4945",
                background: "transparent",
              }}
            >
              Rates
            </Link>
          </nav>
          <div style={{ flex: 1 }} />
          <Link
            href="/people/new"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 400,
            }}
          >
            Add manually
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
              fontWeight: 400,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1, color: "#FF5040" }}>+</span> New profile
          </Link>
          <Link
            href="/briefs/new"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "none",
              background: "#161311",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 400,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Brief → Team
          </Link>
          <button
            onClick={() => setTeamOpen(true)}
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "1px solid rgba(0,0,0,0.07)",
              background: team.length ? "#1A1A1A" : "#FFFFFF",
              color: team.length ? "#FFFFFF" : "#1A1A1A",
              fontSize: 12,
              fontWeight: 400,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Build team
            {team.length > 0 && (
              <span
                style={{
                  background: "#FF5040",
                  color: "#FFFFFF",
                  borderRadius: 100,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 7px",
                }}
              >
                {team.length}
              </span>
            )}
          </button>
          <SignedInBadge />
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 6,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#9A9A9A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 400,
              }}
            >
              Pulse · Valtech Nordic
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: "#161311",
                letterSpacing: "-0.5px",
                margin: "6px 0 0",
              }}
            >
              People
            </h1>
            <div style={{ fontSize: 13, color: "#5A5A5A", marginTop: 4 }}>
              {filtered.length} {filtered.length === 1 ? "person" : "people"} · {mergedPeople.length} total
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, role, location, skill…"
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#1A1A1A",
                fontSize: 12,
                width: 280,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupKey)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#1A1A1A",
                fontSize: 12,
                cursor: "pointer",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="none">Group by: None</option>
              <option value="available">Group by: Availability</option>
              <option value="energy">Group by: Energy type</option>
              <option value="location">Group by: Location</option>
              <option value="utilisation">Group by: Utilisation</option>
            </select>
            <div
              style={{
                display: "flex",
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 8,
                padding: 2,
              }}
            >
              {(["card", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={v === "card" ? "Cards view" : "List view"}
                  title={v === "card" ? "Cards view" : "List view"}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: view === v ? "#161311" : "transparent",
                    color: view === v ? "#FFFFFF" : "#5A5A5A",
                    fontSize: 12,
                    fontWeight: 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span aria-hidden style={{ fontSize: 11, opacity: 0.85 }}>
                    {v === "card" ? "▦" : "☰"}
                  </span>
                  {v === "card" ? "Cards" : "List"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 32 }}>
          {grouped.map((g) => (
            <section key={g.key}>
              {groupBy !== "none" && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9A9A9A",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 400,
                    }}
                  >
                    {g.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#9A9A9A" }}>· {g.people.length}</div>
                </div>
              )}

              {view === "card" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 20,
                  }}
                >
                  {g.people.map((p) => (
                    <PersonCard
                      key={p.id}
                      person={p}
                      inTeam={team.some((x) => x.id === p.id)}
                      onQuickView={setSelected}
                      onToggleTeam={toggleTeam}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#FAFAF8" }}>
                        {["", "Name", "Role", "Location", "Energy", "Utilisation", "Availability", ""].map(
                          (h, i) => (
                            <th
                              key={i}
                              style={{
                                textAlign: i === 7 ? "right" : "left",
                                padding: "10px 14px",
                                fontSize: 10,
                                color: "#9A9A9A",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                fontWeight: 400,
                                borderBottom: "1px solid rgba(0,0,0,0.06)",
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {g.people.map((p) => (
                        <PersonRow
                          key={p.id}
                          person={p}
                          inTeam={team.some((x) => x.id === p.id)}
                          onQuickView={setSelected}
                          onToggleTeam={toggleTeam}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                background: "#FFFFFF",
                border: "0.5px solid rgba(0,0,0,0.07)",
                borderRadius: 12,
                padding: 48,
                textAlign: "center",
                color: "#9A9A9A",
                fontSize: 13,
              }}
            >
              No people match &ldquo;{search}&rdquo;.
            </div>
          )}
        </div>
      </main>

      {selected && <QuickViewDrawer person={selected} onClose={() => setSelected(null)} />}
      {teamOpen && (
        <TeamBuilderDrawer
          team={team}
          onClose={() => setTeamOpen(false)}
          onRemove={(p) => toggleTeam(p)}
        />
      )}
    </div>
  );
}
