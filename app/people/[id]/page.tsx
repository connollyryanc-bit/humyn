"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AvailKey,
  EnergyKey,
  Person,
  availability,
  energy,
  people,
  utilTone,
} from "../../page";
import { EnergyDynamics, EnergyRing, EnergySpider } from "../../components/energy";
import { fetchPerson } from "../../lib/api-client";

type TabKey = "overview" | "personality" | "engage" | "achievements";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "personality", label: "Personality" },
  { key: "engage", label: "How to Engage" },
  { key: "achievements", label: "Achievements" },
];

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

function Avatar({ person, size = 64 }: { person: Person; size?: number }) {
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
        fontWeight: 500,
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
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
      {a.label}
    </span>
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
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
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
        marginBottom: 10,
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

function EnergyBars({ person }: { person: Person }) {
  return (
    <div>
      {(["driver", "energizer", "supporter", "analyst"] as EnergyKey[]).map((c) => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: energy[c].color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#5A5A5A", width: 130, fontWeight: 500 }}>
            {energy[c].label}
          </span>
          <div style={{ flex: 1, height: 6, background: "#EDEDEA", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${person.scores[c]}%`,
                height: "100%",
                background: energy[c].color,
                borderRadius: 4,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: energy[c].text,
              width: 36,
              textAlign: "right",
              fontWeight: 600,
            }}
          >
            {person.scores[c]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function HeaderStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "#9A9A9A",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 500,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: color ?? "#1A1A1A", letterSpacing: "-0.2px" }}>
        {value}
      </div>
    </div>
  );
}

function buildAiMessage(person: Person, input: string): string {
  const name = person.name.split(" ")[0];
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  switch (person.primary) {
    case "driver":
      return `${name} — quick one. ${trimmed} I'd like a yes/no by end of day and I'll handle the follow-through. If you'd push back, tell me why in one line and I'll bring options.`;
    case "energizer":
      return `Hey ${name}! Got something I think you'll actually enjoy. ${trimmed} Would love your take — even a rough reaction is helpful. Happy to jump on a quick call if it's easier than typing it out.`;
    case "supporter":
      return `Hi ${name}, hope you're doing well. Wanted to bring this to you because I value how you think about these things. ${trimmed} No rush — take the time you need. Let me know what would help you decide.`;
    case "analyst":
      return `${name}, sharing context up front. ${trimmed} The constraints are: timing, scope, and who's downstream of the decision. I'd value your read on the trade-offs before I commit either way. Happy to send any supporting data you want first.`;
  }
}

export default function PersonProfilePage() {
  const params = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>("overview");
  const [draft, setDraft] = useState<string>("");
  const [generated, setGenerated] = useState<string>("");
  const [person, setPerson] = useState<Person | undefined>(() =>
    people.find((p) => p.id === Number(params?.id)),
  );
  const [resolved, setResolved] = useState<boolean>(false);

  const id = Number(params?.id);

  useEffect(() => {
    let cancelled = false;
    fetchPerson(id)
      .then((found) => {
        if (cancelled) return;
        setPerson(found ?? undefined);
        setResolved(true);
      })
      .catch(() => {
        if (cancelled) return;
        setResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (resolved && !person) {
    notFound();
  }

  if (!person) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: 32 }}>Loading…</div>
      </div>
    );
  }

  const tone = utilTone(person.utilisation);
  const primaryColour = energy[person.primary];

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
                color: "#FFFFFF",
                background: "#161311",
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
            href={`/people/${person.id}/edit`}
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Edit profile
          </Link>
          <Link
            href="/"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            ← Back to People
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>
        <section
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 12,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            <Avatar person={person} size={72} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#9A9A9A",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 500,
                }}
              >
                Pulse profile
              </div>
              <h1
                className="font-display"
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: "#161311",
                  letterSpacing: "-0.5px",
                  margin: "4px 0 4px",
                }}
              >
                {person.name}
              </h1>
              <div style={{ fontSize: 13, color: "#5A5A5A" }}>
                {person.role} · {person.location}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                <EnergyBadge k={person.primary} />
                <EnergyBadge k={person.secondary} small />
                <Pill>{person.wheelPosition}</Pill>
                <StatusBadge k={person.available} />
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "#5A5A5A", lineHeight: 1.6, margin: 0 }}>{person.bio}</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 16,
              paddingTop: 16,
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <HeaderStat label="Wheel position" value={person.wheelPosition} />
            <HeaderStat
              label="Utilisation"
              value={`${person.utilisation}% · ${tone.label}`}
              color={tone.color}
            />
            <HeaderStat label="Active clients" value={String(person.clients)} />
            <HeaderStat label="Revenue (12 mo)" value={person.revenue} />
            <HeaderStat label="Availability" value={availability[person.available].label} />
          </div>
        </section>

        <div
          style={{
            display: "flex",
            gap: 4,
            margin: "20px 0 20px",
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: tab === t.key ? "#1A1A1A" : "transparent",
                color: tab === t.key ? "#FFFFFF" : "#5A5A5A",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12 }}>
              <Card>
                <SectionLabel>Energy ring</SectionLabel>
                <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                  <EnergyRing
                    scores={person.scores}
                    position={person.wheelPosition}
                    primary={person.primary}
                  />
                </div>
                <EnergyBars person={person} />
              </Card>

              <Card>
                <SectionLabel>Energy dynamics</SectionLabel>
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                  <EnergyDynamics scores={person.scores} />
                </div>
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    background: primaryColour.bg,
                    border: `1px solid ${primaryColour.border}`,
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: primaryColour.text,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Primary energy
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: primaryColour.text }}>
                    {primaryColour.label} · {person.wheelPosition}
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <SectionLabel>Engagement signals</SectionLabel>
              <div
                style={{
                  fontSize: 12,
                  color: "#9A9A9A",
                  marginBottom: 12,
                  lineHeight: 1.5,
                  maxWidth: 520,
                }}
              >
                Eight engagement dimensions derived from the energy mix — useful for predicting
                how {person.name.split(" ")[0]} shows up in meetings, decisions and reviews.
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <EnergySpider scores={person.scores} primary={person.primary} />
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Card>
                <SectionLabel>Capabilities</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {person.capabilities.map((c) => (
                    <Pill key={c}>{c}</Pill>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionLabel>Best trait & watch-out</SectionLabel>
                <div
                  style={{
                    background: "#EEF7F2",
                    border: "1px solid #9ED4B8",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 13,
                    color: "#1A5C38",
                    lineHeight: 1.55,
                    marginBottom: 10,
                  }}
                >
                  {person.bestTrait}
                </div>
                <div
                  style={{
                    background: "#FDF0EE",
                    border: "1px solid #FCCDC6",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 13,
                    color: "#9B2A1A",
                    lineHeight: 1.55,
                  }}
                >
                  {person.vice}
                </div>
              </Card>

              <Card>
                <SectionLabel>Drivers</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {person.drivers.map((d) => (
                    <Pill key={d}>{d}</Pill>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionLabel>Detractors</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {person.detractors.map((d) => (
                    <Pill key={d}>{d}</Pill>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "personality" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <Card>
              <SectionLabel>Wheel position</SectionLabel>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#1A1A1A",
                  letterSpacing: "-0.4px",
                  marginBottom: 12,
                }}
              >
                {person.wheelPosition}
              </div>
              <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.65, margin: 0 }}>
                {person.name.split(" ")[0]} sits primarily in the{" "}
                <span style={{ color: primaryColour.text, fontWeight: 600 }}>
                  {primaryColour.label}
                </span>{" "}
                quadrant of the Humyn Pulse Map, with{" "}
                <span style={{ color: energy[person.secondary].text, fontWeight: 600 }}>
                  {energy[person.secondary].label}
                </span>{" "}
                as the second energy. People in this position tend to combine the strengths of both
                quadrants — best read alongside the drivers and detractors below.
              </p>
              <div style={{ marginTop: 16 }}>
                <SectionLabel>Energy mix</SectionLabel>
                <EnergyBars person={person} />
              </div>
            </Card>

            <Card>
              <SectionLabel>What drives them</SectionLabel>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {person.drivers.map((d, i) => (
                  <li
                    key={d}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      fontSize: 13,
                      color: "#1A5C38",
                      background: "#EEF7F2",
                      border: "1px solid #9ED4B8",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#1A5C38", fontWeight: 700, minWidth: 16 }}>
                      {i + 1}.
                    </span>
                    <span style={{ lineHeight: 1.5 }}>{d}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 16 }}>
                <SectionLabel>What drains them</SectionLabel>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {person.detractors.map((d, i) => (
                    <li
                      key={d}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontSize: 13,
                        color: "#9B2A1A",
                        background: "#FDF0EE",
                        border: "1px solid #FCCDC6",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <span style={{ fontSize: 11, color: "#9B2A1A", fontWeight: 700, minWidth: 16 }}>
                        {i + 1}.
                      </span>
                      <span style={{ lineHeight: 1.5 }}>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        )}

        {tab === "engage" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card>
              <SectionLabel>How to speak with them</SectionLabel>
              <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.65, margin: 0 }}>
                {person.howToSpeak}
              </p>
            </Card>

            <Card>
              <SectionLabel>How to email them</SectionLabel>
              <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.65, margin: 0 }}>
                {person.howToEmail}
              </p>
            </Card>

            <div style={{ gridColumn: "1 / -1" }}>
              <Card>
                <SectionLabel>AI message composer</SectionLabel>
                <div style={{ fontSize: 12, color: "#9A9A9A", marginBottom: 10, lineHeight: 1.5 }}>
                  Describe what you want to say. We&apos;ll rewrite it in a style that lands with{" "}
                  {person.name.split(" ")[0]}&apos;s {primaryColour.label.toLowerCase()} energy.
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`E.g. I need to push the Nordea kickoff by a week — flag the impact and ask for sign-off.`}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.07)",
                    background: "#FFFFFF",
                    color: "#1A1A1A",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    lineHeight: 1.5,
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                  <button
                    onClick={() => setGenerated(buildAiMessage(person, draft))}
                    disabled={!draft.trim()}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: draft.trim() ? "#1A1A1A" : "#EDEDEA",
                      color: draft.trim() ? "#FFFFFF" : "#9A9A9A",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: draft.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    Generate message
                  </button>
                  {generated && (
                    <button
                      onClick={() => {
                        setGenerated("");
                        setDraft("");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.07)",
                        background: "#FFFFFF",
                        color: "#5A5A5A",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {generated && (
                  <div
                    style={{
                      marginTop: 14,
                      background: primaryColour.bg,
                      border: `1px solid ${primaryColour.border}`,
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: primaryColour.text,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      Suggested message · {primaryColour.label} style
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: primaryColour.text,
                        lineHeight: 1.6,
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {generated}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {tab === "achievements" && (
          <Card>
            <SectionLabel>Key achievements</SectionLabel>
            <ol
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {person.achievements.map((a, i) => (
                <li
                  key={a}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    padding: 14,
                    background: "#FAFAF8",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: primaryColour.bg,
                      color: primaryColour.text,
                      border: `1px solid ${primaryColour.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13, color: "#1A1A1A", lineHeight: 1.55 }}>{a}</div>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </main>
    </div>
  );
}
