"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DEFAULT_STAGES } from "../types";

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

export default function JobKanbanPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId ?? "";

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
            href="/pipeline"
            style={{
              fontSize: 12,
              color: "#5A5A5A",
              textDecoration: "none",
            }}
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
            Pipeline · Job #{jobId || "?"}
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
            Candidate kanban
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
            Drag-free kanban — stage transitions via per-card buttons. Internal
            candidates carry their existing Pulse profile across from the pitch board.
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            padding: "20px 22px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Default stages — customisable per job
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {DEFAULT_STAGES.map((s) => (
              <span
                key={s.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 100,
                  background: "#FAFAF8",
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  fontSize: 11,
                  color: "#4D4945",
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: s.tone,
                  }}
                />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 12,
          }}
        >
          {DEFAULT_STAGES.map((s) => (
            <div
              key={s.key}
              style={{
                flexShrink: 0,
                width: 280,
                background: "#FFFFFF",
                border: "0.5px solid rgba(0,0,0,0.07)",
                borderRadius: 12,
                padding: "14px 14px 18px",
                minHeight: 360,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: s.tone,
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#161311",
                    flex: 1,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: "#9A9A9A" }}>0</div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#9A9A9A",
                  textAlign: "center",
                  padding: "20px 8px",
                  lineHeight: 1.5,
                }}
              >
                Candidates appear here once we wire the data layer.
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
