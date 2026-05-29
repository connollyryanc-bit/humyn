"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DEFAULT_STAGES } from "../../../types";
import { seedCandidates, seedJobs } from "../../../seed";
import { energy } from "../../../../page";
import type { EnergyKey } from "../../../../page";
import { ENVIRONMENT_SURFACES, TopChrome } from "../../../../components/top-chrome";

const PROFILE_TABS = [
  { key: "activity",   label: "Activity" },
  { key: "comments",   label: "Comments" },
  { key: "todos",      label: "To-dos" },
  { key: "evaluation", label: "Evaluation" },
  { key: "messages",   label: "Messages" },
] as const;

type TabKey = (typeof PROFILE_TABS)[number]["key"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CandidateProfilePage() {
  const params = useParams<{ jobId: string; candidateId: string }>();
  const jobIdNum = Number(params?.jobId);
  const candidateIdNum = Number(params?.candidateId);
  const job = seedJobs.find((j) => j.id === jobIdNum);
  const candidate = seedCandidates.find((c) => c.id === candidateIdNum);

  const [tab, setTab] = useState<TabKey>("activity");

  const stageMeta = useMemo(
    () => DEFAULT_STAGES.find((s) => s.key === candidate?.currentStage),
    [candidate],
  );

  return (
    <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pipeline, transition: "background 0.25s ease" }}>
      <TopChrome env="pipeline" currentPath="/pipeline" />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 22 }}>
          <Link
            href={`/pipeline/${jobIdNum}`}
            style={{ fontSize: 12, color: "#5A5A5A", textDecoration: "none" }}
          >
            ← Back to {job?.internalTitle ?? "job"}
          </Link>
        </div>

        {!candidate ? (
          <div style={{ fontSize: 14, color: "#9A9A9A" }}>Candidate not found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(420px, 1.4fr)", gap: 20 }}>
            <PulseColumn candidate={candidate} />
            <ActivityColumn
              candidate={candidate}
              tab={tab}
              setTab={setTab}
              stageMeta={stageMeta}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function PulseColumn({ candidate }: { candidate: ReturnType<typeof seedCandidates.find> }) {
  if (!candidate) return null;
  const e = candidate.pulseProfile ? energy[candidate.pulseProfile.primary] : null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "24px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: e ? e.bg : "#F3F0EA",
            color: e ? e.text : "#5A5A5A",
            border: `1.5px solid ${e ? e.color : "rgba(0,0,0,0.15)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {initialsOf(candidate.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 600, color: "#161311", letterSpacing: "-0.3px" }}>
            {candidate.name}
          </div>
          <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 4 }}>
            {candidate.location} · {candidate.source}
            {candidate.isInternal && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#3D8A61",
                  background: "#EFF8F3",
                  padding: "2px 6px",
                  borderRadius: 100,
                  letterSpacing: "0.05em",
                }}
              >
                INTERNAL
              </span>
            )}
          </div>
        </div>
      </div>

      {candidate.pulseProfile ? (
        <>
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#9A9A9A",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Pulse profile · {candidate.pulseProfile.confidence}% confidence
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: e ? e.text : "#161311",
                marginBottom: 14,
              }}
            >
              {candidate.pulseProfile.wheelPosition}
            </div>
            <EnergyBars scores={candidate.pulseProfile.scores} />
          </div>

          {candidate.teamFitScore !== null && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "#EFF8F3",
                border: "0.5px solid #B6E0CB",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#3D8A61",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Team fit
              </div>
              <div style={{ fontSize: 22, color: "#3D8A61", fontWeight: 600, letterSpacing: "-0.4px" }}>
                {candidate.teamFitScore}%
              </div>
              <div style={{ fontSize: 11, color: "#3D8A61", marginTop: 2 }}>
                Match against the team this role joins
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            fontSize: 12,
            color: "#9A9A9A",
            padding: "16px 14px",
            background: "#FAFAF8",
            borderRadius: 10,
            lineHeight: 1.55,
          }}
        >
          Pulse profile pending. Paste their LinkedIn to generate one.
        </div>
      )}

      {candidate.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {candidate.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 10,
                color: "#5A5A5A",
                background: "#FAFAF8",
                border: "0.5px solid rgba(0,0,0,0.07)",
                padding: "3px 9px",
                borderRadius: 100,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EnergyBars({ scores }: { scores: Record<EnergyKey, number> }) {
  const order: EnergyKey[] = ["driver", "energizer", "supporter", "analyst"];
  return (
    <div>
      {order.map((k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: energy[k].color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#5A5A5A", width: 80 }}>{energy[k].label}</span>
          <div style={{ flex: 1, height: 4, background: "#EDEDEA", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${scores[k]}%`,
                height: "100%",
                background: energy[k].color,
                borderRadius: 2,
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "#9A9A9A", width: 28, textAlign: "right" }}>
            {scores[k]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function ActivityColumn({
  candidate,
  tab,
  setTab,
  stageMeta,
}: {
  candidate: ReturnType<typeof seedCandidates.find>;
  tab: TabKey;
  setTab: (t: TabKey) => void;
  stageMeta: ReturnType<typeof DEFAULT_STAGES.find>;
}) {
  if (!candidate) return null;
  return (
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
          gap: 12,
          paddingBottom: 14,
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Current stage
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#161311",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {stageMeta && (
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: stageMeta.tone }} />
            )}
            {stageMeta?.label ?? candidate.currentStage}
          </div>
        </div>
        <div style={{ fontSize: 14, color: "#D4974A", letterSpacing: "0.05em" }}>
          {"★".repeat(candidate.rating)}
          <span style={{ color: "#EDEDEA" }}>{"☆".repeat(5 - candidate.rating)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {PROFILE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 400,
              background: tab === t.key ? "#161311" : "transparent",
              color: tab === t.key ? "#FFFFFF" : "#4D4945",
              border: tab === t.key ? "none" : "0.5px solid rgba(0,0,0,0.07)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "activity" && (
        <ActivityFeed
          candidate={candidate}
          stageLabel={stageMeta?.label ?? candidate.currentStage}
        />
      )}
      {tab === "comments" && <PlaceholderBlock body="Internal notes with @mentions will land here." />}
      {tab === "todos" && <PlaceholderBlock body="Tasks assignable to recruiters and hiring managers." />}
      {tab === "evaluation" && <PlaceholderBlock body="Structured scoring across the interview rounds." />}
      {tab === "messages" && <PlaceholderBlock body="Full email + scheduling history with the candidate." />}
    </div>
  );
}

function ActivityFeed({
  candidate,
  stageLabel,
}: {
  candidate: NonNullable<ReturnType<typeof seedCandidates.find>>;
  stageLabel: string;
}) {
  const items: { when: string; who: string; what: string }[] = [
    {
      when: "Today",
      who: "Ryan (Capacity)",
      what: `Reviewed Pulse profile — strong ${
        candidate.pulseProfile ? energy[candidate.pulseProfile.primary].label : "unknown"
      } signal.`,
    },
    { when: "Yesterday", who: "System", what: `Moved to ${stageLabel}.` },
    { when: "3 days ago", who: "Sara (Recruiting)", what: "Sent calendar invite for manager interview." },
    { when: "5 days ago", who: "System", what: "Pulse profile auto-generated from LinkedIn paste." },
    { when: candidate.appliedDate, who: "System", what: `Candidate entered pipeline via ${candidate.source}.` },
  ];
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: 12,
            padding: "10px 12px",
            background: "#FAFAF8",
            borderRadius: 10,
            border: "0.5px solid rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 11, color: "#9A9A9A", width: 90, flexShrink: 0 }}>{it.when}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: "#161311" }}>{it.what}</div>
            <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 2 }}>by {it.who}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PlaceholderBlock({ body }: { body: string }) {
  return (
    <div
      style={{
        padding: "20px 18px",
        background: "#FAFAF8",
        borderRadius: 10,
        fontSize: 12.5,
        color: "#5A5A5A",
        lineHeight: 1.6,
      }}
    >
      {body}
    </div>
  );
}
