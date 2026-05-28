"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EnergyKey, Person, energy } from "../page";
import { PersonWithCapacity } from "../lib/capacity-data";
import { fetchEnrichedPeople } from "../lib/api-client";

const MARKETS = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"] as const;
type Market = (typeof MARKETS)[number];
const WEEK_COUNT = 26;
const WEEK_COLUMN_WIDTH = 76;
const LEFT_COLUMN_WIDTH = 280;

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

function Avatar({ person, size = 32 }: { person: Person; size?: number }) {
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

interface WeekStub {
  start: Date;
  end: Date;
  label: string;
  startLabel: string;
}

function buildWeeks(weekCount: number, start: Date): WeekStub[] {
  // Snap to Monday (Mon = 1, Sun = 0)
  const monday = new Date(start);
  const dow = monday.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const out: WeekStub[] = [];
  for (let i = 0; i < weekCount; i++) {
    const s = new Date(monday);
    s.setDate(monday.getDate() + i * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    const startLabel = s.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    out.push({
      start: s,
      end: e,
      label: i === 0 ? "This week" : `W+${i}`,
      startLabel,
    });
  }
  return out;
}

interface AllocationCell {
  pct: number; // 0..100 — 0 means available
  label: "Allocated" | "Partial" | "Available";
}

function buildAllocationPattern(p: PersonWithCapacity): number[] {
  const util = p.utilisation;
  const benchDays = p.capacity.benchDays;

  // Seed = the first 8 weeks (the believable, near-term outlook).
  // Tail = a generic "what comes next" assumption (the speculative far-future).
  let seed: number[];
  let tail: number;
  if (p.available === "allocated") {
    if (util >= 90) {
      seed = [100, 100, 100, 100, 100, 100, 100, 100];
      tail = 75;
    } else if (util >= 80) {
      seed = [100, 100, 100, 100, 100, 90, 75, 60];
      tail = 50;
    } else if (util >= 70) {
      seed = [100, 100, 100, 90, 75, 50, 0, 0];
      tail = 25;
    } else {
      seed = [100, 100, 75, 50, 25, 0, 0, 0];
      tail = 25;
    }
  } else if (p.available === "soon") {
    seed = [100, 90, 25, 0, 0, 0, 0, 0];
    tail = 75;
  } else if (benchDays > 14) {
    seed = [0, 0, 0, 0, 0, 0, 0, 0];
    tail = 25;
  } else if (benchDays > 7) {
    seed = [0, 0, 0, 0, 25, 50, 75, 75];
    tail = 75;
  } else {
    seed = [0, 25, 50, 75, 75, 75, 75, 75];
    tail = 75;
  }

  const out = seed.slice();
  // Gentle ramp from the last seed value toward the tail assumption.
  const last = seed[seed.length - 1];
  for (let i = seed.length; i < WEEK_COUNT; i++) {
    const step = i - seed.length + 1;
    const blend = Math.min(1, step / 4);
    const value = Math.round(last + (tail - last) * blend);
    out.push(value);
  }
  return out;
}

function deriveAllocation(p: PersonWithCapacity): AllocationCell[] {
  return buildAllocationPattern(p).map((v) => ({
    pct: v,
    label: v >= 75 ? "Allocated" : v > 0 ? "Partial" : "Available",
  }));
}

interface TooltipInfo {
  rowId: number;
  week: number;
  text: string;
}

function TimelineRow({
  person,
  weeks,
  allocation,
  onCellEnter,
  onCellLeave,
}: {
  person: PersonWithCapacity;
  weeks: WeekStub[];
  allocation: AllocationCell[];
  onCellEnter: (info: TooltipInfo) => void;
  onCellLeave: () => void;
}) {
  const e = energy[person.primary];
  const client = person.capacity.currentProject ?? person.capacity.keyClientAtRisk ?? "Unassigned";
  const lastAllocatedIndex = (() => {
    for (let i = allocation.length - 1; i >= 0; i--) {
      if (allocation[i].pct >= 75) return i;
    }
    return -1;
  })();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        borderTop: "0.5px solid rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          position: "sticky",
          left: 0,
          background: "#FFFFFF",
          zIndex: 2,
          width: LEFT_COLUMN_WIDTH,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRight: "0.5px solid rgba(0,0,0,0.07)",
          boxSizing: "border-box",
        }}
      >
        <Avatar person={person} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/people/${person.id}`}
            style={{ fontSize: 13, fontWeight: 600, color: "#161311" }}
          >
            {person.name}
          </Link>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              fontWeight: 400,
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {person.role}
          </div>
        </div>
        <span
          aria-hidden
          title={`Primary energy: ${e.label}`}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: e.color,
            flexShrink: 0,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeks.length}, ${WEEK_COLUMN_WIDTH}px)`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        {allocation.map((cell, i) => {
          const isAllocated = cell.pct >= 75;
          const isPartial = cell.pct > 0 && cell.pct < 75;
          const bg = isAllocated
            ? e.color
            : isPartial
              ? "#FAD98A"
              : "#EFF8F3";
          const fill = isAllocated
            ? 1
            : isPartial
              ? cell.pct / 100
              : 1;
          const tooltipText = isAllocated
            ? `${client} · ${cell.pct}% · ${weeks[i].startLabel} → ${weeks[lastAllocatedIndex === -1 ? i : Math.max(lastAllocatedIndex, i)].startLabel}`
            : isPartial
              ? `${client} · ${cell.pct}% (partial) · ${weeks[i].startLabel}`
              : `Available · ${weeks[i].startLabel}`;
          return (
            <div
              key={i}
              onMouseEnter={() =>
                onCellEnter({ rowId: person.id, week: i, text: tooltipText })
              }
              onMouseLeave={onCellLeave}
              style={{
                position: "relative",
                padding: "10px 4px",
                borderRight:
                  i < allocation.length - 1
                    ? "0.5px dashed rgba(0,0,0,0.05)"
                    : "none",
                background: cell.pct === 0 ? "rgba(92,171,130,0.06)" : "transparent",
                cursor: "default",
              }}
            >
              <div
                style={{
                  height: 22,
                  borderRadius: 6,
                  background: bg,
                  opacity: cell.pct === 0 ? 0.5 : fill,
                  border:
                    cell.pct === 0
                      ? "0.5px dashed #B6E0CB"
                      : "0.5px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 600,
                  color: isAllocated ? "#FFFFFF" : isPartial ? "#8B5A00" : "#3D8A61",
                  letterSpacing: "0.02em",
                }}
              >
                {isAllocated ? `${cell.pct}%` : isPartial ? `${cell.pct}%` : "Free"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: { active: string; activeBg: string };
}) {
  const activeColor = tone?.active ?? "#FFFFFF";
  const activeBg = tone?.activeBg ?? "#161311";
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 100,
        border: active ? "none" : "0.5px solid rgba(0,0,0,0.07)",
        background: active ? activeBg : "#FFFFFF",
        color: active ? activeColor : "#4D4945",
        fontSize: 12,
        fontWeight: 400,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

export default function AvailablePage() {
  const [enriched, setEnriched] = useState<PersonWithCapacity[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>("");

  const [marketFilter, setMarketFilter] = useState<"all" | Market>("all");
  const [availableNow2Wk, setAvailableNow2Wk] = useState<boolean>(false);
  const [collapsedCities, setCollapsedCities] = useState<Set<Market>>(new Set());
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const weeks = useMemo(() => buildWeeks(WEEK_COUNT, new Date()), []);

  function jumpToToday() {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }

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

  const allocations = useMemo(() => {
    const map = new Map<number, AllocationCell[]>();
    enriched.forEach((p) => map.set(p.id, deriveAllocation(p)));
    return map;
  }, [enriched]);

  const visiblePool = useMemo(() => {
    return enriched.filter((p) => {
      if (marketFilter !== "all" && p.location !== marketFilter) return false;
      if (availableNow2Wk) {
        const a = allocations.get(p.id);
        if (!a) return false;
        // person counts if either of the first two weeks is free
        if (a[0].pct > 0 && a[1].pct > 0) return false;
      }
      return true;
    });
  }, [enriched, marketFilter, availableNow2Wk, allocations]);

  const byMarket = useMemo(() => {
    const groups = new Map<Market, PersonWithCapacity[]>();
    MARKETS.forEach((m) => groups.set(m, []));
    visiblePool.forEach((p) => {
      const m = p.location as Market;
      if (MARKETS.includes(m)) groups.get(m)!.push(p);
    });
    groups.forEach((list) => {
      list.sort((a, b) => {
        // sort by total allocation ascending (most available first)
        const aa = allocations.get(a.id);
        const bb = allocations.get(b.id);
        const sumA = aa ? aa.reduce((s, c) => s + c.pct, 0) : 0;
        const sumB = bb ? bb.reduce((s, c) => s + c.pct, 0) : 0;
        return sumA - sumB;
      });
    });
    return groups;
  }, [visiblePool, allocations]);

  function toggleCity(m: Market) {
    setCollapsedCities((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
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
                fontWeight: 400,
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
                fontWeight: 400,
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
                fontWeight: 400,
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
                fontWeight: 400,
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
                fontWeight: 400,
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
                fontWeight: 400,
                color: "#4D4945",
              }}
            >
              Board
            </Link>
            <Link
              href="/pipeline"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 400,
                color: "#4D4945",
              }}
            >
              Pipeline
            </Link>
            <Link
              href="/settings/rate-card"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 400,
                color: "#4D4945",
              }}
            >
              Rates
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
              fontWeight: 400,
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
              fontWeight: 400,
            }}
          >
            Compass · Resource timeline · next {WEEK_COUNT} weeks
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
            A {WEEK_COUNT}-week look at every consultant&apos;s engagement window — scroll
            horizontally for the far horizon. Coloured bars are current allocations, green cells
            are free capacity. Grouped by Nordic market — click a city header to collapse.
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
          <div
            style={{
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            Loading timeline…
          </div>
        ) : (
          <>
            <div
              style={{
                background: "#FFFFFF",
                border: "0.5px solid rgba(0,0,0,0.07)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#9A9A9A",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                City
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <FilterChip active={marketFilter === "all"} onClick={() => setMarketFilter("all")}>
                  All
                </FilterChip>
                {MARKETS.map((m) => (
                  <FilterChip
                    key={m}
                    active={marketFilter === m}
                    onClick={() => setMarketFilter(m)}
                  >
                    {m}
                  </FilterChip>
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
              <FilterChip
                active={availableNow2Wk}
                onClick={() => setAvailableNow2Wk((v) => !v)}
                tone={{ active: "#1A5C38", activeBg: "#EEF7F2" }}
              >
                Available in next 2 weeks
              </FilterChip>
              <button
                onClick={jumpToToday}
                style={{
                  padding: "6px 12px",
                  borderRadius: 100,
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  background: "#FFFFFF",
                  color: "#4D4945",
                  fontSize: 12,
                  fontWeight: 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Jump to today
              </button>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 11,
                  color: "#5A5A5A",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: "#9A9A9A",
                      opacity: 0.85,
                    }}
                  />
                  Allocated
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: "#FAD98A",
                    }}
                  />
                  Partial
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: "#EFF8F3",
                      border: "0.5px dashed #B6E0CB",
                    }}
                  />
                  Available
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "0.5px solid rgba(0,0,0,0.07)",
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {tooltip && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 14,
                    background: "#161311",
                    color: "#FFFFFF",
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 400,
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  {tooltip.text}
                </div>
              )}

              <div
                ref={scrollRef}
                style={{
                  overflowX: "auto",
                  overflowY: "visible",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    background: "#FAFAF8",
                    borderBottom: "0.5px solid rgba(0,0,0,0.06)",
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                  }}
                >
                  <div
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 4,
                      background: "#FAFAF8",
                      width: LEFT_COLUMN_WIDTH,
                      flexShrink: 0,
                      padding: "10px 14px",
                      fontSize: 10,
                      color: "#9A9A9A",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                      borderRight: "0.5px solid rgba(0,0,0,0.07)",
                      boxSizing: "border-box",
                    }}
                  >
                    Consultant
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${weeks.length}, ${WEEK_COLUMN_WIDTH}px)`,
                      flexShrink: 0,
                    }}
                  >
                    {weeks.map((w, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "10px 4px",
                          fontSize: 10,
                          color: "#9A9A9A",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          textAlign: "center",
                          borderRight:
                            i < weeks.length - 1
                              ? "0.5px solid rgba(0,0,0,0.04)"
                              : "none",
                        }}
                      >
                        <div>{w.label}</div>
                        <div style={{ color: "#5A5A5A", fontWeight: 400, marginTop: 2 }}>
                          {w.startLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {MARKETS.map((m) => {
                  const list = byMarket.get(m) ?? [];
                  if (marketFilter !== "all" && marketFilter !== m) return null;
                  if (list.length === 0 && marketFilter === "all") return null;
                  const collapsed = collapsedCities.has(m);
                  const cityRowWidth = LEFT_COLUMN_WIDTH + weeks.length * WEEK_COLUMN_WIDTH;
                  return (
                    <div key={m}>
                      <button
                        onClick={() => toggleCity(m)}
                        style={{
                          width: cityRowWidth,
                          padding: 0,
                          background: "transparent",
                          border: "none",
                          borderTop: "0.5px solid rgba(0,0,0,0.06)",
                          borderBottom: collapsed ? "none" : "0.5px solid rgba(0,0,0,0.06)",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "block",
                        }}
                      >
                        <div
                          style={{
                            position: "sticky",
                            left: 0,
                            width: LEFT_COLUMN_WIDTH + weeks.length * WEEK_COLUMN_WIDTH,
                            background: "#FAFAF8",
                            padding: "10px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            boxSizing: "border-box",
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              display: "inline-block",
                              fontSize: 10,
                              color: "#5A5A5A",
                              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                              transition: "transform 0.15s ease",
                            }}
                          >
                            ▼
                          </span>
                          <span
                            className="font-display"
                            style={{ fontSize: 15, fontWeight: 600, color: "#161311" }}
                          >
                            {m}
                          </span>
                          <span style={{ fontSize: 11, color: "#9A9A9A" }}>
                            {list.length} {list.length === 1 ? "consultant" : "consultants"}
                          </span>
                        </div>
                      </button>
                      {!collapsed &&
                        list.map((p) => (
                          <TimelineRow
                            key={p.id}
                            person={p}
                            weeks={weeks}
                            allocation={allocations.get(p.id) ?? []}
                            onCellEnter={setTooltip}
                            onCellLeave={() => setTooltip(null)}
                          />
                        ))}
                      {!collapsed && list.length === 0 && (
                        <div
                          style={{
                            padding: "14px 14px",
                            fontSize: 12,
                            color: "#9A9A9A",
                            borderTop: "0.5px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          No consultants in {m} match the current filters.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 11,
                color: "#9A9A9A",
                lineHeight: 1.55,
                maxWidth: 720,
              }}
            >
              The {WEEK_COUNT}-week outlook is derived from each consultant&apos;s current
              availability, utilisation and bench days — not from a live engagement plan. When ERP
              / OpenAir integration lands, these bars will use real engagement start and end
              dates.
            </div>
          </>
        )}
      </main>
    </div>
  );
}
