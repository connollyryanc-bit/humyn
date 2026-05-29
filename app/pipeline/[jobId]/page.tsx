"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ENVIRONMENT_SURFACES, TopChrome } from "../../components/top-chrome";
import { energy } from "../../page";
import { usePersistedState } from "../../lib/local-store";
import { BRIEF_STAGES, Brief, BriefRole } from "../../teams/types";
import { seedBriefs } from "../../teams/seed";

function StageBadge({ stage }: { stage: Brief["stage"] }) {
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

export default function BriefDetailPage() {
  const params = useParams<{ jobId: string }>();
  const briefId = Number(params?.jobId);
  const brief = seedBriefs.find((b) => b.id === briefId);

  const [applications, setApplications] = usePersistedState<number[]>(
    "humyn.brief-role-applications.v1",
    [],
  );

  if (!brief) {
    return (
      <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pipeline, transition: "background 0.25s ease" }}>
        <TopChrome env="pipeline" currentPath="/pipeline" />
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 32px" }}>
          <Link href="/pipeline" style={{ fontSize: 12, color: "#5A5A5A", textDecoration: "none" }}>
            ← Back to briefs
          </Link>
          <h1 className="font-display" style={{ fontSize: 24, color: "#161311", marginTop: 12 }}>
            Brief not found
          </h1>
        </main>
      </div>
    );
  }

  function toggleApplication(roleId: number) {
    setApplications((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  }

  const totalApplicants = brief.roles.reduce((sum, r) => sum + r.applicants, 0);
  const totalOpen = brief.roles.reduce((sum, r) => sum + Math.max(0, r.openings - r.filled), 0);
  const totalOpenings = brief.roles.reduce((sum, r) => sum + r.openings, 0);

  return (
    <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pipeline, transition: "background 0.25s ease" }}>
      <TopChrome env="pipeline" currentPath="/pipeline" />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 32px 60px" }}>
        <Link
          href="/pipeline"
          style={{
            fontSize: 12,
            color: "#5A5A5A",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 18,
          }}
        >
          ← Back to briefs
        </Link>

        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 18,
            padding: "32px 36px",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <StageBadge stage={brief.stage} />
            <PriorityBadge priority={brief.priority} />
            <div style={{ fontSize: 11, color: "#9A9A9A", marginLeft: "auto" }}>
              Brief #{brief.id}
            </div>
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.6px",
              margin: "0 0 12px",
              lineHeight: 1.15,
            }}
          >
            {brief.name}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              fontSize: 12,
              color: "#5A5A5A",
              marginBottom: 20,
            }}
          >
            <Pill>{brief.client}</Pill>
            <Pill>{brief.market}</Pill>
            <Pill>{brief.duration}</Pill>
            <Pill>{brief.briefType}</Pill>
            <Pill>Budget {brief.budget}</Pill>
            <Pill>
              Starts {brief.startDate}
              {brief.daysToStart !== null && ` · in ${brief.daysToStart}d`}
            </Pill>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 32 }}>
            <div>
              <SectionLabel>Scope</SectionLabel>
              <p style={{ fontSize: 15, color: "#161311", lineHeight: 1.65, margin: "0 0 22px" }}>
                {brief.scope}
              </p>
              <SectionLabel>Context</SectionLabel>
              <p style={{ fontSize: 14, color: "#4D4945", lineHeight: 1.65, margin: 0 }}>
                {brief.context}
              </p>
            </div>

            <div>
              <SectionLabel>Required energy mix</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(["driver", "energizer", "supporter", "analyst"] as const).map((k) => {
                  const level = brief.requiredEnergy[k];
                  const e = energy[k];
                  return (
                    <div
                      key={k}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "16px 100px 1fr 80px",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }}
                      />
                      <span style={{ fontSize: 12, color: "#4D4945", fontWeight: 500 }}>
                        {e.label}
                      </span>
                      <div
                        style={{
                          height: 4,
                          background: "#EDEDEA",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: levelToPct(level) + "%",
                            height: "100%",
                            background: e.color,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: e.text,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontWeight: 600,
                          textAlign: "right",
                        }}
                      >
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 28,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <StatBlock label="Open roles" value={`${totalOpen} of ${totalOpenings}`} />
                <StatBlock label="Applicants" value={String(totalApplicants)} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <SectionLabel>Roles · {brief.roles.length}</SectionLabel>
          <div style={{ fontSize: 12, color: "#9A9A9A", marginTop: -4 }}>
            Apply to any open role. Your application earns credits and goes to the capacity
            manager for review.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {brief.roles.map((role) => (
            <RoleRow
              key={role.id}
              role={role}
              applied={applications.includes(role.id)}
              onToggle={() => toggleApplication(role.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function levelToPct(level: "essential" | "high" | "medium" | "low"): number {
  if (level === "essential") return 100;
  if (level === "high") return 75;
  if (level === "medium") return 50;
  return 25;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#9A9A9A",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: 600,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "4px 10px",
        borderRadius: 100,
        background: "#FAFAF8",
        border: "0.5px solid rgba(0,0,0,0.07)",
        fontSize: 11,
        color: "#4D4945",
      }}
    >
      {children}
    </span>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        background: "#FAFAF8",
        border: "0.5px solid rgba(0,0,0,0.06)",
      }}
    >
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
        {label}
      </div>
      <div
        className="font-display"
        style={{ fontSize: 18, fontWeight: 600, color: "#161311", letterSpacing: "-0.3px" }}
      >
        {value}
      </div>
    </div>
  );
}

function RoleRow({
  role,
  applied,
  onToggle,
}: {
  role: BriefRole;
  applied: boolean;
  onToggle: () => void;
}) {
  const e = energy[role.requiredEnergy];
  const open = Math.max(0, role.openings - role.filled);
  const isOpen = open > 0;

  return (
    <div
      onMouseEnter={(ev) => {
        ev.currentTarget.style.borderColor = e.border;
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.borderColor = applied
          ? "#5CAB82"
          : "rgba(0,0,0,0.07)";
      }}
      style={{
        background: applied ? "#EFF8F3" : "#FFFFFF",
        border: applied ? "0.5px solid #5CAB82" : "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "18px 22px",
        transition: "border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 9px",
                borderRadius: 100,
                background: e.bg,
                color: e.text,
                border: `0.5px solid ${e.border}`,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
              {e.label} · {role.level}
            </span>
            {isOpen ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#3D8A61",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {open} open
              </span>
            ) : (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#9A9A9A",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Filled
              </span>
            )}
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.2px",
              marginBottom: 8,
            }}
          >
            {role.title}
          </div>
          <p style={{ fontSize: 13, color: "#4D4945", lineHeight: 1.55, margin: "0 0 12px" }}>
            {role.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {role.skills.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 10,
                  color: "#5A5A5A",
                  background: "#FAFAF8",
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  padding: "3px 9px",
                  borderRadius: 100,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
            minWidth: 200,
          }}
        >
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#5A5A5A" }}>
            <div>
              <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Duration
              </div>
              <div style={{ fontSize: 12, color: "#161311", marginTop: 2 }}>{role.duration}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Day rate
              </div>
              <div style={{ fontSize: 12, color: "#161311", marginTop: 2 }}>
                €{role.dayRateBandEur.min}–{role.dayRateBandEur.max}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: "#9A9A9A" }}>
              {role.applicants + (applied ? 1 : 0)} applicant
              {role.applicants + (applied ? 1 : 0) === 1 ? "" : "s"}
            </span>
            {isOpen ? (
              <button
                onClick={onToggle}
                style={{
                  padding: "8px 18px",
                  borderRadius: 100,
                  border: applied ? "0.5px solid #5CAB82" : "none",
                  background: applied ? "#FFFFFF" : "#161311",
                  color: applied ? "#3D8A61" : "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {applied ? "✓ Applied" : "Apply"}
              </button>
            ) : (
              <span
                style={{
                  padding: "8px 18px",
                  borderRadius: 100,
                  background: "#F3F0EA",
                  color: "#9A9A9A",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
