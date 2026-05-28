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

const STEPS = [
  { key: "details",     label: "Job details",        body: "Internal title, external title, department, location, market, status." },
  { key: "form",        label: "Application form",   body: "Per-field on/optional/mandatory (Name, Email, Phone, Resume, Cover letter)." },
  { key: "questions",   label: "Screening questions",body: "Text, Yes/No, Multiple choice, Range 1-10, Video response. AI-suggested by role type." },
  { key: "stages",      label: "Stages",             body: "Use the default 9-stage flow or customise stages per job." },
  { key: "automation",  label: "Trigger automation", body: "Set per-stage triggers — email, comment, tag, schedule, NPS, nurture." },
];

export default function NewJobPage() {
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

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "28px 32px 40px" }}>
        <Link
          href="/pipeline"
          style={{ fontSize: 12, color: "#5A5A5A", textDecoration: "none" }}
        >
          ← All jobs
        </Link>
        <div
          style={{
            fontSize: 11,
            color: "#9A9A9A",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
            marginTop: 12,
          }}
        >
          Pipeline · New job
        </div>
        <h1
          className="font-display"
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#161311",
            letterSpacing: "-0.5px",
            margin: "6px 0 4px",
          }}
        >
          Create a job
        </h1>
        <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6, marginBottom: 24 }}>
          Five-step flow. Each step is a discrete block of the form. Save as draft at
          any point; only published jobs surface on the career site.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              style={{
                background: "#FFFFFF",
                border: "0.5px solid rgba(0,0,0,0.07)",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#FAFAF8",
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4D4945",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#161311",
                    marginBottom: 4,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.55 }}>
                  {s.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            color: "#9A9A9A",
            lineHeight: 1.55,
          }}
        >
          Form fields, validation, and submit wiring come in the next iteration.
        </div>
      </main>
    </div>
  );
}
