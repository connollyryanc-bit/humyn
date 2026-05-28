"use client";

import Link from "next/link";

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

export default function PipelinePage() {
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
            <NavLink href="/teams" label="Teams" />
            <NavLink href="/available" label="Available" />
            <NavLink href="/capacity" label="Capacity" />
            <NavLink href="/insights" label="Insights" />
            <NavLink href="/board" label="Board" />
            <NavLink href="/pipeline" label="Pipeline" active />
            <NavLink href="/settings/rate-card" label="Rates" />
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#9A9A9A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}
            >
              Pipeline · Hiring
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
              Jobs
            </h1>
            <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
              Proprietary ATS with Pulse from day one. Every candidate is profiled the
              moment they enter the pipeline, with a team-fit score against the team
              they would join.
            </div>
          </div>
          <Link
            href="/pipeline/new"
            style={{
              padding: "8px 16px",
              borderRadius: 100,
              border: "none",
              background: "#161311",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 400,
              textDecoration: "none",
            }}
          >
            + New job
          </Link>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            padding: "28px 32px",
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
            Jobs list
          </h2>
          <p style={{ fontSize: 14, color: "#4D4945", lineHeight: 1.65, margin: "0 0 16px", maxWidth: 720 }}>
            A scannable list of every open hire. Each row will surface the internal
            title, department, market, recruiter, application count and current status.
            Clicking a job opens the per-job kanban.
          </p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxWidth: 720,
            }}
          >
            {[
              "List view with internal title, department, market, status, application count, recruiter",
              "Status badges: Draft, Active, Paused, Closed",
              "Filter by department, market, recruiter, status",
              "Click a job → /pipeline/[jobId] for the candidate kanban",
              "+ New job → /pipeline/new for the job-creation flow",
            ].map((b, i) => (
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
        </div>
      </main>
    </div>
  );
}
