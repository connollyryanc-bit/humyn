"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EnergyKey, Person, availability as availabilityMeta, energy } from "../page";
import { PersonWithCapacity } from "../lib/capacity-data";
import { fetchEnrichedPeople } from "../lib/api-client";

const MARKETS = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"] as const;
type Market = typeof MARKETS[number];
const ENERGIES: EnergyKey[] = ["red", "yellow", "green", "blue"];

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

function Avatar({ person, size = 42 }: { person: Person; size?: number }) {
  const c = energy[person.primary];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: c.bg,
        color: c.text,
        border: `0.5px solid ${c.border}`,
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

function HeroStat({
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
          fontSize: 26,
          fontWeight: 700,
          color,
          letterSpacing: "-0.4px",
          marginTop: 4,
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

function PersonCard({ p }: { p: PersonWithCapacity }) {
  const avail = availabilityMeta[p.available];
  const benchDays = p.capacity.benchDays;
  const teamHref = `/teams?preselect=${p.id}`;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "1rem 1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar person={p} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/people/${p.id}`}
            style={{ fontSize: 15, fontWeight: 600, color: "#161311", letterSpacing: "-0.2px" }}
          >
            {p.name}
          </Link>
          <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 2 }}>
            {p.role} · {p.location}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <EnergyBadge k={p.primary} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 9px",
            borderRadius: 100,
            background: avail.bg,
            color: avail.text,
            border: `0.5px solid ${avail.border}`,
            fontSize: 10,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: avail.color }} />
          {avail.label}
        </span>
        {benchDays > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 9px",
              borderRadius: 100,
              background: benchDays > 14 ? "#FDF0EE" : "#FFFBF2",
              color: benchDays > 14 ? "#9B2A1A" : "#8B5A00",
              border: `0.5px solid ${benchDays > 14 ? "#FCCDC6" : "#FAD98A"}`,
              fontSize: 10,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {benchDays} days on bench
          </span>
        )}
      </div>

      {p.capabilities.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {p.capabilities.slice(0, 3).map((c) => (
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
      )}

      <div
        style={{
          paddingTop: 12,
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          display: "flex",
          gap: 24,
          alignItems: "center",
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
            Day rate
          </div>
          <div
            className="font-display"
            style={{ fontSize: 16, fontWeight: 700, color: "#161311", marginTop: 2 }}
          >
            €{(p.dayRate || 1500).toLocaleString("en-GB")}
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
            Loyalty
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: p.capacity.loyaltyScore >= 70 ? "#1A5C38" : p.capacity.loyaltyScore >= 50 ? "#8B5A00" : "#9B2A1A",
              marginTop: 2,
            }}
          >
            {p.capacity.loyaltyScore}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Link
          href={`/people/${p.id}`}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "0.5px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#161311",
            fontSize: 12,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Profile
        </Link>
        <Link
          href={teamHref}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#161311",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Add to team
        </Link>
      </div>
    </div>
  );
}

export default function AvailablePage() {
  const [enriched, setEnriched] = useState<PersonWithCapacity[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>("");

  const [marketFilter, setMarketFilter] = useState<"all" | Market>("all");
  const [energyFilter, setEnergyFilter] = useState<Set<EnergyKey>>(new Set());
  const [search, setSearch] = useState<string>("");
  const [includeSoon, setIncludeSoon] = useState<boolean>(true);

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

  const availableNow = useMemo(
    () => enriched.filter((p) => p.available === "now"),
    [enriched],
  );
  const availableSoon = useMemo(
    () => enriched.filter((p) => p.available === "soon"),
    [enriched],
  );
  const availablePool = useMemo(
    () => (includeSoon ? [...availableNow, ...availableSoon] : availableNow),
    [includeSoon, availableNow, availableSoon],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availablePool.filter((p) => {
      if (marketFilter !== "all" && p.location !== marketFilter) return false;
      if (energyFilter.size > 0 && !energyFilter.has(p.primary)) return false;
      if (q) {
        const hay = [p.name, p.role, p.location, ...p.capabilities].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [availablePool, marketFilter, energyFilter, search]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const benchDelta = b.capacity.benchDays - a.capacity.benchDays;
        if (benchDelta !== 0) return benchDelta;
        return (a.dayRate || 0) - (b.dayRate || 0);
      }),
    [filtered],
  );

  const marketCounts = useMemo(() => {
    const counts: Record<Market, number> = {
      Stockholm: 0,
      Oslo: 0,
      Copenhagen: 0,
      Helsinki: 0,
    };
    availablePool.forEach((p) => {
      if (MARKETS.includes(p.location as Market)) {
        counts[p.location as Market] += 1;
      }
    });
    return counts;
  }, [availablePool]);

  const combinedDayRate = useMemo(
    () => filtered.reduce((s, p) => s + (p.dayRate || 1500), 0),
    [filtered],
  );

  function toggleEnergy(k: EnergyKey) {
    setEnergyFilter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
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
                color: "#FFFFFF",
                background: "#161311",
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
            Compass · Pan-Nordic availability
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
            Available
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
            Every consultant available now or soon across Stockholm, Oslo, Copenhagen and Helsinki
            in one view. Replaces the weekly phone-around between market capacity managers.
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

        {!loaded ? (
          <Card>Loading availability…</Card>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <HeroStat
                label="Available now"
                value={String(availableNow.length)}
                detail="On bench or coming off-project this week"
                color="#1A5C38"
                bg="#EEF7F2"
                border="#9ED4B8"
              />
              <HeroStat
                label="Available soon"
                value={String(availableSoon.length)}
                detail="Coming off-project in the next 2–4 weeks"
                color="#8B5A00"
                bg="#FFFBF2"
                border="#FAD98A"
              />
              <HeroStat
                label="Markets covered"
                value={String(
                  Object.values(marketCounts).filter((c) => c > 0).length,
                )}
                detail={MARKETS.map((m) => `${m} ${marketCounts[m]}`).join(" · ")}
                color="#124A6E"
                bg="#EEF4FB"
                border="#8DC2E8"
              />
              <HeroStat
                label="Combined day rate"
                value={`€${(combinedDayRate / 1000).toFixed(1)}k`}
                detail={`Across ${filtered.length} matching ${filtered.length === 1 ? "person" : "people"}`}
                color="#161311"
                bg="#FAFAF8"
                border="rgba(0,0,0,0.07)"
              />
            </div>

            <Card>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#9A9A9A",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                    }}
                  >
                    Market
                  </span>
                  {(["all", ...MARKETS] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarketFilter(m)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 100,
                        border:
                          marketFilter === m
                            ? "none"
                            : "0.5px solid rgba(0,0,0,0.07)",
                        background: marketFilter === m ? "#161311" : "#FFFFFF",
                        color: marketFilter === m ? "#FFFFFF" : "#4D4945",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {m === "all" ? "All" : m}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    width: 1,
                    height: 22,
                    background: "rgba(0,0,0,0.07)",
                    margin: "0 4px",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#9A9A9A",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                    }}
                  >
                    Energy
                  </span>
                  {ENERGIES.map((k) => {
                    const active = energyFilter.has(k);
                    const e = energy[k];
                    return (
                      <button
                        key={k}
                        onClick={() => toggleEnergy(k)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 100,
                          border: `0.5px solid ${active ? e.color : "rgba(0,0,0,0.07)"}`,
                          background: active ? e.bg : "#FFFFFF",
                          color: active ? e.text : "#4D4945",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }}
                        />
                        {e.label}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    width: 1,
                    height: 22,
                    background: "rgba(0,0,0,0.07)",
                    margin: "0 4px",
                  }}
                />

                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#4D4945",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeSoon}
                    onChange={(e) => setIncludeSoon(e.target.checked)}
                  />
                  Include &ldquo;soon&rdquo;
                </label>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, role, capability…"
                    style={{
                      width: "100%",
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "0.5px solid rgba(0,0,0,0.07)",
                      background: "#FFFFFF",
                      color: "#161311",
                      fontSize: 12,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "0.5px solid rgba(0,0,0,0.06)",
                  fontSize: 12,
                  color: "#5A5A5A",
                }}
              >
                {filtered.length === 0
                  ? "No one matches the current filters."
                  : `${filtered.length} ${filtered.length === 1 ? "person" : "people"} match — sorted by days on bench (longest first), then by day rate (lowest first).`}
              </div>
            </Card>

            <div style={{ height: 12 }} />

            {sorted.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 12,
                }}
              >
                {sorted.map((p) => (
                  <PersonCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
