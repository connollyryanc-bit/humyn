"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DEFAULT_STAGES, JOB_STATUS_TONE, Candidate } from "../types";
import { seedCandidates, seedJobs } from "../seed";
import { energy } from "../../page";
import { usePersistedState } from "../../lib/local-store";

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

const STAGE_KEYS = DEFAULT_STAGES.map((s) => s.key) as string[];

function stageIndex(stage: string): number {
  return STAGE_KEYS.indexOf(stage);
}

export default function JobKanbanPage() {
  const params = useParams<{ jobId: string }>();
  const jobIdNum = Number(params?.jobId);
  const job = seedJobs.find((j) => j.id === jobIdNum);

  const [candidates, setCandidates] = usePersistedState<Candidate[]>(
    "humyn.candidates.v1",
    seedCandidates,
  );

  const jobCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === jobIdNum),
    [candidates, jobIdNum],
  );

  const byStage = useMemo(() => {
    const map = new Map<string, Candidate[]>();
    DEFAULT_STAGES.forEach((s) => map.set(s.key, []));
    jobCandidates.forEach((c) => {
      const arr = map.get(c.currentStage) ?? [];
      arr.push(c);
      map.set(c.currentStage, arr);
    });
    return map;
  }, [jobCandidates]);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  function moveCandidate(candidateId: number, direction: -1 | 1) {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        const idx = stageIndex(c.currentStage);
        const next = idx + direction;
        if (next < 0 || next >= STAGE_KEYS.length) return c;
        return { ...c, currentStage: STAGE_KEYS[next] };
      }),
    );
  }

  function setStage(candidateId: number, stageKey: string) {
    if (!STAGE_KEYS.includes(stageKey)) return;
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, currentStage: stageKey } : c)),
    );
  }

  function setRating(candidateId: number, rating: number) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, rating } : c)),
    );
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
          <Link href="/pipeline" style={{ fontSize: 12, color: "#5A5A5A", textDecoration: "none" }}>
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
                <span>{jobCandidates.length} candidates</span>
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
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: "#9A9A9A",
                  lineHeight: 1.5,
                  maxWidth: 720,
                }}
              >
                Use the chevrons on each card to move candidates between stages, or click the
                stars to score them. Every change is saved to this browser instantly.
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
            const isDropTarget = dragOverStage === s.key;
            return (
              <div
                key={s.key}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  ev.dataTransfer.dropEffect = "move";
                  if (dragOverStage !== s.key) setDragOverStage(s.key);
                }}
                onDragLeave={(ev) => {
                  const related = ev.relatedTarget as Node | null;
                  if (related && ev.currentTarget.contains(related)) return;
                  if (dragOverStage === s.key) setDragOverStage(null);
                }}
                onDrop={(ev) => {
                  ev.preventDefault();
                  const raw = ev.dataTransfer.getData("text/plain");
                  const id = Number(raw);
                  if (!Number.isNaN(id)) setStage(id, s.key);
                  setDragOverStage(null);
                  setDraggingId(null);
                }}
                style={{
                  flexShrink: 0,
                  width: 280,
                  background: isDropTarget ? "#EFF8F3" : "#FFFFFF",
                  border: isDropTarget
                    ? "1px dashed #5CAB82"
                    : "0.5px solid rgba(0,0,0,0.07)",
                  borderRadius: 12,
                  padding: "14px 14px 18px",
                  minHeight: 460,
                  transition: "background 0.12s ease, border-color 0.12s ease",
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
                      {isDropTarget ? "Release to move here" : "Drag candidates here or use the chevrons."}
                    </div>
                  )}
                  {inStage.map((c) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      jobId={jobIdNum}
                      isDragging={draggingId === c.id}
                      onMove={moveCandidate}
                      onRate={setRating}
                      onDragStart={(id) => setDraggingId(id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverStage(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function CandidateCard({
  candidate,
  jobId,
  isDragging,
  onMove,
  onRate,
  onDragStart,
  onDragEnd,
}: {
  candidate: Candidate;
  jobId: number;
  isDragging: boolean;
  onMove: (id: number, dir: -1 | 1) => void;
  onRate: (id: number, r: number) => void;
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
}) {
  const e = candidate.pulseProfile ? energy[candidate.pulseProfile.primary] : null;
  const idx = stageIndex(candidate.currentStage);
  const canBack = idx > 0;
  const canFwd = idx < STAGE_KEYS.length - 1;

  return (
    <div
      draggable
      onDragStart={(ev) => {
        ev.dataTransfer.setData("text/plain", String(candidate.id));
        ev.dataTransfer.effectAllowed = "move";
        onDragStart(candidate.id);
      }}
      onDragEnd={onDragEnd}
      style={{
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 10,
        padding: 12,
        background: "#FAFAF8",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        transition: "opacity 0.12s ease",
      }}
    >
      <Link
        href={`/pipeline/${jobId}/candidates/${candidate.id}`}
        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}
      >
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
          {initialsOf(candidate.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#161311" }}>{candidate.name}</div>
          <div style={{ fontSize: 10, color: "#9A9A9A", marginTop: 2 }}>
            {candidate.location} · {candidate.source}
          </div>
        </div>
        {candidate.isInternal && (
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
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#9A9A9A",
        }}
      >
        <StarRating value={candidate.rating} onChange={(r) => onRate(candidate.id, r)} />
        {candidate.teamFitScore !== null && (
          <span style={{ color: "#3D8A61", fontWeight: 600 }}>{candidate.teamFitScore}% fit</span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          paddingTop: 8,
          borderTop: "0.5px dashed rgba(0,0,0,0.06)",
        }}
      >
        <button
          onClick={() => onMove(candidate.id, -1)}
          disabled={!canBack}
          aria-label="Move to previous stage"
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "0.5px solid rgba(0,0,0,0.08)",
            background: canBack ? "#FFFFFF" : "#FAFAF8",
            color: canBack ? "#4D4945" : "#D1CDC4",
            fontSize: 11,
            cursor: canBack ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => onMove(candidate.id, 1)}
          disabled={!canFwd}
          aria-label="Move to next stage"
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "none",
            background: canFwd ? "#161311" : "#E0DDD8",
            color: canFwd ? "#FFFFFF" : "#9A9A9A",
            fontSize: 11,
            cursor: canFwd ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            onChange(value === i ? i - 1 : i);
          }}
          aria-label={`Rate ${i} star${i === 1 ? "" : "s"}`}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 13,
            lineHeight: 1,
            color: i <= value ? "#D4974A" : "#E0DDD8",
            fontFamily: "inherit",
          }}
        >
          ★
        </button>
      ))}
    </span>
  );
}
