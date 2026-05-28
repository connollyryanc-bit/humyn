"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { DEFAULT_STAGES, JOB_STATUS_TONE } from "../types";
import { seedCandidates, seedJobs } from "../seed";
import { energy } from "../../page";

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

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
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

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function JobKanbanPage() {
  const params = useParams<{ jobId: string }>();
  const jobIdNum = Number(params?.jobId);
  const job = seedJobs.find((j) => j.id === jobIdNum);
  const candidates = useMemo(
    () => seedCandidates.filter((c) => c.jobId === jobIdNum),
    [jobIdNum],
  );

  const byStage = useMemo(() => {
    const map = new Map<string, typeof candidates>();
    DEFAULT_STAGES.forEach((s) => map.set(s.key, []));
    candidates.forEach((c) => {
      const arr = map.get(c.currentStage) ?? [];
      arr.push(c);
      map.set(c.currentStage, arr);
    });
    return map;
  }, [candidates]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 28, width: "100%", maxWidth: 1280, margin: "0 auto" }}>
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
            style={{ fontSize: 12, color: "#5A5A5A", textDecoration: "none" }}
          >
            ← All jobs
          </Link>
          {job ? (
            <>
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
                Pipeline · {job.department} · {job.market}
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
                {job.internalTitle}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  fontSize: 12,
                  color: "#5A5A5A",
                  marginTop: 6,
                }}
              >
                <span>{job.externalTitle}</span>
                <span style={{ color: "#9A9A9A" }}>·</span>
                <span>{candidates.length} candidates</span>
                <span style={{ color: "#9A9A9A" }}>·</span>
                <span>
                  Required energy:{" "}
                  <strong style={{ color: energy[job.requiredEnergy].text }}>
                    {energy[job.requiredEnergy].label}
                  </strong>
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: JOB_STATUS_TONE[job.status].color,
                    background: JOB_STATUS_TONE[job.status].bg,
                    padding: "3px 9px",
                    borderRadius: 100,
                    fontWeight: 600,
                  }}
                >
                  {JOB_STATUS_TONE[job.status].label}
                </span>
              </div>
            </>
          ) : (
            <h1 className="font-display" style={{ fontSize: 24, color: "#161311", marginTop: 12 }}>
              Job not found
            </h1>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {DEFAULT_STAGES.map((s) => {
            const inStage = byStage.get(s.key) ?? [];
            return (
              <div
                key={s.key}
                style={{
                  flexShrink: 0,
                  width: 280,
                  background: "#FFFFFF",
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  borderRadius: 12,
                  padding: "14px 14px 18px",
                  minHeight: 460,
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
                  <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: s.tone }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#161311", flex: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#9A9A9A" }}>{inStage.length}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {inStage.length === 0 && (
                    <div style={{ fontSize: 11, color: "#9A9A9A", textAlign: "center", padding: "16px 4px" }}>
                      No candidates here.
                    </div>
                  )}
                  {inStage.map((c) => {
                    const e = c.pulseProfile ? energy[c.pulseProfile.primary] : null;
                    return (
                      <Link
                        key={c.id}
                        href={`/pipeline/${jobIdNum}/candidates/${c.id}`}
                        style={{
                          display: "block",
                          border: "0.5px solid rgba(0,0,0,0.07)",
                          borderRadius: 10,
                          padding: 12,
                          background: "#FAFAF8",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: e ? e.bg : "#F3F0EA",
                              color: e ? e.text : "#5A5A5A",
                              border: `0.5px solid ${e ? e.border : "rgba(0,0,0,0.1)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {initialsOf(c.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#161311" }}>{c.name}</div>
                            <div style={{ fontSize: 10, color: "#9A9A9A", marginTop: 2 }}>
                              {c.location} · {c.source}
                            </div>
                          </div>
                          {c.isInternal && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                color: "#3D8A61",
                                background: "#EFF8F3",
                                padding: "2px 6px",
                                borderRadius: 100,
                                letterSpacing: "0.05em",
                              }}
                            >
                              INT
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 10,
                            fontSize: 11,
                            color: "#9A9A9A",
                          }}
                        >
                          <span>{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</span>
                          {c.teamFitScore !== null && (
                            <span style={{ color: "#3D8A61", fontWeight: 600 }}>
                              {c.teamFitScore}% fit
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
