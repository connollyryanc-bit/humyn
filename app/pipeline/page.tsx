"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ENVIRONMENT_SURFACES, TopChrome } from "../components/top-chrome";
import { energy } from "../page";
import { Brief, BRIEF_STAGES, BriefStage } from "../teams/types";
import { seedBriefs } from "../teams/seed";

type StageFilter = "all" | BriefStage;

const STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "unstaffed", label: "Unstaffed" },
  { key: "analysing", label: "Analysing" },
  { key: "proposed",  label: "Proposed" },
  { key: "buyin",     label: "Buy-in" },
  { key: "confirmed", label: "Confirmed" },
  { key: "active",    label: "Active" },
];

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
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: meta.tone }} />
      {meta.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Brief["priority"] }) {
  const tone =
    priority === "urgent"
      ? { bg: "#FDF3F2", color: "#C4534A", label: "Urgent" }
      : priority === "low"
        ? { bg: "#F3F0EA", color: "#5A5A5A", label: "Low" }
        : null;
  if (!tone) return null;
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
        textTransform: "uppercase",
      }}
    >
      {tone.label}
    </span>
  );
}

function rolesSummary(brief: Brief): { open: number; total: number; applicants: number } {
  let open = 0;
  let total = 0;
  let applicants = 0;
  brief.roles.forEach((r) => {
    total += r.openings;
    open += Math.max(0, r.openings - r.filled);
    applicants += r.applicants;
  });
  return { open, total, applicants };
}

function BriefCard({ brief }: { brief: Brief }) {
  const { open, total, applicants } = rolesSummary(brief);
  const primaryEnergyKey = (Object.entries(brief.requiredEnergy).sort(
    (a, b) => weight(b[1]) - weight(a[1]),
  )[0]?.[0] ?? "energizer") as keyof typeof energy;
  const e = energy[primaryEnergyKey];

  return (
    <Link
      href={`/pipeline/${brief.id}`}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = "translateY(-2px)";
        ev.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
        ev.currentTarget.style.borderColor = e.border;
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = "translateY(0)";
        ev.currentTarget.style.boxShadow = "none";
        ev.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
      }}
      style={{
        display: "block",
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "16px 18px 14px",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: e.color,
          opacity: 0.55,
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StageBadge stage={brief.stage} />
            <PriorityBadge priority={brief.priority} />
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.25px",
              lineHeight: 1.25,
            }}
          >
            {brief.name}
          </div>
          <div style={{ fontSize: 10.5, color: "#9A9A9A" }}>
            {brief.client} · {brief.market} · {brief.duration}
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: 12,
          color: "#4D4945",
          lineHeight: 1.5,
          margin: "0 0 12px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {brief.scope}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingTop: 10,
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          fontSize: 10.5,
          color: "#5A5A5A",
        }}
      >
        <div>
          <span style={{ color: "#161311", fontWeight: 600 }}>{open}</span>{" "}
          <span style={{ color: "#9A9A9A" }}>of {total} roles open</span>
        </div>
        <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
        <div>
          <span style={{ color: "#161311", fontWeight: 600 }}>{applicants}</span>{" "}
          <span style={{ color: "#9A9A9A" }}>
            applicant{applicants === 1 ? "" : "s"}
          </span>
        </div>
        <div style={{ marginLeft: "auto", color: "#9A9A9A" }}>
          Starts {brief.startDate}
          {brief.daysToStart !== null && ` · in ${brief.daysToStart}d`}
        </div>
      </div>
    </Link>
  );
}

function weight(level: "essential" | "high" | "medium" | "low"): number {
  return level === "essential" ? 4 : level === "high" ? 3 : level === "medium" ? 2 : 1;
}

export default function BriefBoardPage() {
  const [filter, setFilter] = useState<StageFilter>("all");
  const [marketFilter, setMarketFilter] = useState<"all" | string>("all");

  const counts = useMemo(() => {
    const c = new Map<StageFilter, number>();
    c.set("all", seedBriefs.length);
    seedBriefs.forEach((b) => {
      c.set(b.stage, (c.get(b.stage) ?? 0) + 1);
    });
    return c;
  }, []);

  const markets = useMemo(() => {
    const set = new Set<string>();
    seedBriefs.forEach((b) => set.add(b.market));
    return Array.from(set).sort();
  }, []);

  const briefs = seedBriefs.filter((b) => {
    if (filter !== "all" && b.stage !== filter) return false;
    if (marketFilter !== "all" && b.market !== marketFilter) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pipeline, transition: "background 0.25s ease" }}>
      <TopChrome
        env="pipeline"
        currentPath="/pipeline"
        rightSlot={
          <Link
            href="/briefs/new"
            style={{
              padding: "8px 16px",
              borderRadius: 100,
              border: "none",
              background: "#161311",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            + New brief
          </Link>
        }
      />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Pipeline · Brief board
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.4px",
              margin: "6px 0 4px",
            }}
          >
            Briefs
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
            Every active engagement at Valtech Nordic. Each brief contains the scope, the
            client context, and the roles that still need staffing. Click any brief to read
            the detail and apply to a role.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 18,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 12,
            }}
          >
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: filter === f.key ? "#161311" : "transparent",
                  color: filter === f.key ? "#FFFFFF" : "#4D4945",
                  fontSize: 12,
                  fontWeight: 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                {f.label} {f.key !== "all" && <span style={{ opacity: 0.6 }}>· {counts.get(f.key) ?? 0}</span>}
                {f.key === "all" && <span style={{ opacity: 0.6 }}>· {counts.get("all") ?? 0}</span>}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 12,
            }}
          >
            <button
              onClick={() => setMarketFilter("all")}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: marketFilter === "all" ? "#161311" : "transparent",
                color: marketFilter === "all" ? "#FFFFFF" : "#4D4945",
                fontSize: 12,
                fontWeight: 400,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              All markets
            </button>
            {markets.map((m) => (
              <button
                key={m}
                onClick={() => setMarketFilter(m)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: marketFilter === m ? "#161311" : "transparent",
                  color: marketFilter === m ? "#FFFFFF" : "#4D4945",
                  fontSize: 12,
                  fontWeight: 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {briefs.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              background: "#FFFFFF",
              border: "0.5px dashed rgba(0,0,0,0.12)",
              borderRadius: 14,
              color: "#9A9A9A",
              fontSize: 13,
            }}
          >
            No briefs match this filter.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 16,
            }}
          >
            {briefs.map((b) => (
              <BriefCard key={b.id} brief={b} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
