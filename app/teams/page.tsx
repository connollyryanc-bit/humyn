"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TEAMS_TABS, TeamsTabKey } from "./types";

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

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
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

const TAB_STORAGE_KEY = "humyn.teams-tab";

export default function TeamsPage() {
  const [tab, setTab] = useState<TeamsTabKey>("portfolio");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(TAB_STORAGE_KEY);
    if (saved && TEAMS_TABS.some((t) => t.key === saved)) {
      setTab(saved as TeamsTabKey);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TAB_STORAGE_KEY, tab);
  }, [tab]);

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
            Brief portfolio across the four Nordic markets. Triage on Monday, run the
            week from one screen. Switch tabs for the kanban, an 8-week timeline, the
            internal pitch board, market availability, and the market culture analysis.
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

        {tab === "portfolio" && <PortfolioPlaceholder />}
        {tab === "kanban" && <KanbanPlaceholder />}
        {tab === "timeline" && <TimelinePlaceholder />}
        {tab === "pitch" && <PitchPlaceholder />}
        {tab === "availability" && <AvailabilityPlaceholder />}
        {tab === "markets" && <MarketsLink />}
      </main>
    </div>
  );
}

function ScaffoldCard({
  title,
  body,
  bullets,
  cta,
}: {
  title: string;
  body: string;
  bullets: string[];
  cta?: { href: string; label: string };
}) {
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
      <div
        style={{
          fontSize: 11,
          color: "#9A9A9A",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        Scaffolded — coming soon
      </div>
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
      <p style={{ fontSize: 14, color: "#4D4945", lineHeight: 1.65, margin: "0 0 16px" }}>
        {body}
      </p>
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

function PortfolioPlaceholder() {
  return (
    <ScaffoldCard
      title="Portfolio — your Monday morning brief"
      body="One screen for triaging 15-20 concurrent briefs. Priority actions surface at the top, the full brief list sits below, available people and a market snapshot run down the right, with an AI-written weekly insight at the bottom."
      bullets={[
        "Priority actions (urgent + low-harmony briefs first)",
        "All briefs as a scannable list with stage badges",
        "Available people grouped by market",
        "Market snapshot — utilisation, bench, flight risks",
        "Upcoming availability for the next two weeks",
        "AI weekly insight pulled from /insights",
      ]}
    />
  );
}

function KanbanPlaceholder() {
  return (
    <ScaffoldCard
      title="Kanban — every brief by stage"
      body="Six horizontally scrolling columns: Unstaffed, Analysing, Proposed, Buy-in, Confirmed, Active. One card per brief — drag (or stage-button) to advance. Same colour system as the Pipeline kanban."
      bullets={[
        "Cards show client, market, start date, harmony score, priority",
        "Stage transitions logged for the brief history",
        "Hover reveals the proposed team and any energy gaps",
        "Filter by market, priority, brief type",
      ]}
    />
  );
}

function TimelinePlaceholder() {
  return (
    <ScaffoldCard
      title="Timeline — 8-week Gantt across all consultants"
      body="Rows are consultants, columns are weeks, project blocks colour-coded by the consultant's primary energy. Same horizontal-scroll pattern as /available but with brief allocation overlays."
      bullets={[
        "Consultant rows sorted by market and utilisation",
        "Project blocks pull from confirmed/active briefs",
        "Click a block to open the brief",
        "Available cells (bench) tinted Supporter green",
      ]}
    />
  );
}

function PitchPlaceholder() {
  return (
    <ScaffoldCard
      title="Pitch board — internal job marketplace"
      body="Two-way marketplace. Consultants self-select into open roles. Capacity manager posts roles and sees AI-ranked applicants. Credits reward participation."
      bullets={[
        "Open roles — match % by energy + skills fit",
        "Manage roles — capacity manager view of all posted roles + applicants",
        "My applications — application status for the signed-in consultant",
        "Credits — private gamification score, never a leaderboard",
        "Monday email automation panel — bench consultants get a personalised email at 08:00",
      ]}
    />
  );
}

function AvailabilityPlaceholder() {
  return (
    <ScaffoldCard
      title="Availability — all markets, filterable"
      body="Grid of every consultant grouped by Nordic market. Faster glance than /available — filter by energy type, availability status, day rate band."
      bullets={[
        "Markets stacked: Stockholm · Oslo · Copenhagen · Helsinki",
        "Filter by energy type and availability status",
        "Sort by next-free date or current utilisation",
        "Links into individual profiles or directly into a brief",
      ]}
    />
  );
}

function MarketsLink() {
  return (
    <ScaffoldCard
      title="Markets — Nordic culture analysis"
      body="The existing Markets, Saved teams and Team builder views — the full team-composition workbench — live at /teams/markets while we wire the new module. Nothing was lost; everything is one click away."
      bullets={[
        "Cross-market friction matrix",
        "Per-market culture cards (dominant energy, top capabilities, signature)",
        "Saved teams list with harmony scores",
        "Team builder with energy gap detection + AI analysis",
      ]}
      cta={{ href: "/teams/markets", label: "Open Markets view →" }}
    />
  );
}
