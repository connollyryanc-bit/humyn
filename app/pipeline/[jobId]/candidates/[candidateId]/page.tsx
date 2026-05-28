"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DEFAULT_STAGES } from "../../../types";

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

const PROFILE_TABS = [
  { key: "activity",   label: "Activity" },
  { key: "comments",   label: "Comments" },
  { key: "todos",      label: "To-dos" },
  { key: "evaluation", label: "Evaluation" },
  { key: "messages",   label: "Messages" },
] as const;

export default function CandidateProfilePage() {
  const params = useParams<{ jobId: string; candidateId: string }>();
  const jobId = params?.jobId ?? "";
  const candidateId = params?.candidateId ?? "";

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
        <div style={{ marginBottom: 22 }}>
          <Link
            href={`/pipeline/${jobId}`}
            style={{ fontSize: 12, color: "#5A5A5A", textDecoration: "none" }}
          >
            ← Back to job kanban
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
            Pipeline · Job #{jobId || "?"} · Candidate #{candidateId || "?"}
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
            Candidate profile
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
            Two-column layout. Left: Pulse profile (energy ring, dynamics bars,
            spider chart), bio, drivers, detractors, how-to-engage notes.
            Right: recruitment activity tracker with five tabs.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 1fr) minmax(420px, 1.4fr)",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 14,
              padding: "24px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#9A9A9A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              Pulse profile · scaffolded
            </div>
            <div
              style={{
                aspectRatio: "1 / 1",
                background: "#FAFAF8",
                border: "0.5px dashed rgba(0,0,0,0.1)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9A9A9A",
                fontSize: 12,
                textAlign: "center",
                padding: 20,
              }}
            >
              EnergyRing
              <br />
              imported from
              <br />
              components/energy
            </div>
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
              {[
                "Auto-generated from LinkedIn paste on entry",
                "Internal candidates carry their existing profile across",
                "Team fit score vs the team they would join",
                "How-to-speak + how-to-email guidance per energy",
              ].map((b, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12,
                    color: "#5A5A5A",
                    lineHeight: 1.55,
                    paddingLeft: 16,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 7,
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#D4974A",
                    }}
                  />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 14,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingBottom: 14,
                borderBottom: "0.5px solid rgba(0,0,0,0.06)",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#9A9A9A",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginRight: "auto",
                }}
              >
                Current stage
              </div>
              <select
                disabled
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "0.5px solid rgba(0,0,0,0.1)",
                  background: "#FAFAF8",
                  color: "#4D4945",
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              >
                {DEFAULT_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div
                style={{
                  fontSize: 11,
                  color: "#9A9A9A",
                  fontWeight: 400,
                }}
              >
                ★ ★ ★ ★ ★
              </div>
            </div>

            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {PROFILE_TABS.map((t, i) => (
                <span
                  key={t.key}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 400,
                    background: i === 0 ? "#161311" : "transparent",
                    color: i === 0 ? "#FFFFFF" : "#4D4945",
                    border: i === 0 ? "none" : "0.5px solid rgba(0,0,0,0.07)",
                  }}
                >
                  {t.label}
                </span>
              ))}
            </div>

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
              {[
                "Activity feed — every stage change, comment, evaluation timestamped",
                "Comments — internal notes with @mentions",
                "To-dos — tasks assignable to team members",
                "Evaluation — structured scoring per interview round",
                "Messages — full email + scheduling history with candidate",
                "Trigger automation panel per stage (email, schedule, tag, NPS, nurture)",
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
        </div>
      </main>
    </div>
  );
}
