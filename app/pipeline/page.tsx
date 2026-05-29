"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { JOB_STATUS_TONE, Job } from "./types";
import { seedCandidates, seedJobs } from "./seed";
import { energy } from "../page";
import { TopChrome } from "../components/top-chrome";

function StatusBadge({ status }: { status: Job["status"] }) {
  const tone = JOB_STATUS_TONE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 100,
        background: tone.bg,
        color: tone.color,
        border: "0.5px solid rgba(0,0,0,0.07)",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: tone.color }} />
      {tone.label}
    </span>
  );
}

type StatusFilter = "all" | Job["status"];

export default function PipelinePage() {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: seedJobs.length, draft: 0, active: 0, paused: 0, closed: 0 };
    seedJobs.forEach((j) => {
      c[j.status] = (c[j.status] ?? 0) + 1;
    });
    return c;
  }, []);

  const jobs = seedJobs.filter((j) => filter === "all" || j.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
      <TopChrome env="pipeline" currentPath="/pipeline" />

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
              {seedJobs.length} jobs on the board · {seedCandidates.length} candidates in
              flight across the Nordic markets. Sample data — wiring to the real backing
              store comes next.
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
            display: "flex",
            gap: 4,
            padding: 4,
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 12,
            marginBottom: 16,
            width: "fit-content",
          }}
        >
          {(["all", "active", "paused", "draft", "closed"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: filter === f ? "#161311" : "transparent",
                color: filter === f ? "#FFFFFF" : "#4D4945",
                fontSize: 12,
                fontWeight: 400,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} · {counts[f]}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {jobs.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "#9A9A9A", fontSize: 13 }}>
              No jobs match this filter.
            </div>
          )}
          {jobs.map((j, i) => {
            const applicantsInJob = seedCandidates.filter((c) => c.jobId === j.id).length;
            const e = energy[j.requiredEnergy];
            return (
              <Link
                key={j.id}
                href={`/pipeline/${j.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 2.5fr) 130px 130px 110px 110px",
                  gap: 12,
                  alignItems: "center",
                  padding: "14px 22px",
                  borderTop: i === 0 ? "none" : "0.5px solid rgba(0,0,0,0.05)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: e.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#161311" }}>{j.internalTitle}</div>
                    <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 2 }}>
                      {j.externalTitle} · {j.tags.join(" · ")}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#5A5A5A" }}>{j.department}</div>
                <div style={{ fontSize: 12, color: "#5A5A5A" }}>{j.market}</div>
                <div style={{ fontSize: 12, color: "#161311", fontWeight: 500 }}>
                  {applicantsInJob} candidate{applicantsInJob === 1 ? "" : "s"}
                </div>
                <StatusBadge status={j.status} />
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
