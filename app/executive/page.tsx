"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../components/top-chrome";
import {
  aiExecutiveRead,
  executiveKpis,
  executiveKpisByRegion,
  executiveModules,
  executiveScope,
  executiveScopeByRegion,
  ExecutiveKpi,
} from "./seed";
import { ScopeBreadcrumb } from "./scope-breadcrumb";
import { describeScope, useExecutiveScope } from "./scope-context";
import { canAccessExecutive, useRole } from "../components/role-context";
import { RestrictedPage } from "../components/restricted";

interface LiveExecutiveRead {
  paragraphs: string[];
  generatedAt: string;
  source: string;
}

const REGIONS = ["Europe", "Nordics", "UK", "DACH", "France"] as const;
type Region = (typeof REGIONS)[number];

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#0E0F26";
const EXEC_INK_SECONDARY = "#2A2B45";

export default function ExecutivePage() {
  const [region, setRegion] = useState<Region>("Europe");
  const { scope } = useExecutiveScope();
  const { role, ready } = useRole();
  const restricted = ready && !canAccessExecutive(role);
  const [liveRead, setLiveRead] = useState<LiveExecutiveRead | null>(null);
  const [loadingRead, setLoadingRead] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingRead(true);
    fetch("/api/insights/executive", { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data && Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
          setLiveRead({
            paragraphs: data.paragraphs,
            generatedAt: data.generatedAt ?? new Date().toISOString(),
            source: data.source ?? "template",
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingRead(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const regionScopeShape = executiveScopeByRegion[scope.region] ?? executiveScope;
  const regionKpis = executiveKpisByRegion[scope.region] ?? executiveKpis;

  const paragraphs = liveRead?.paragraphs ?? aiExecutiveRead.paragraphs;
  const generatedAt = liveRead?.generatedAt
    ? new Date(liveRead.generatedAt).toLocaleString()
    : aiExecutiveRead.generatedAt;
  const source = liveRead?.source ?? aiExecutiveRead.source;
  const isLiveClaude = source === "claude";

  if (restricted) {
    return (
      <RestrictedPage
        env="executive"
        currentPath="/executive"
        module="Executive · Workforce intelligence"
        title="Executive Workforce Intelligence"
        reason="The executive environment is reserved for the C-suite and Admin. It surfaces firm-wide financial, workforce and strategic data that's outside the scope of operational roles."
        requiredRoles={["c-suite", "admin"]}
        backHref="/"
        backLabel="Back to People"
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome
        env="executive"
        currentPath="/executive"
        rightSlot={
          <RegionPicker region={region} onChange={setRegion} />
        }
      />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" }}>
        <section style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              color: "#5F6080",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontWeight: 600,
            }}
          >
            Executive · Workforce intelligence · {describeScope(scope)}
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 52,
              fontWeight: 600,
              color: EXEC_INK,
              letterSpacing: "-1.1px",
              margin: "14px 0 16px",
              lineHeight: 1.05,
              maxWidth: 880,
            }}
          >
            Strategic workforce intelligence
            <br />
            for {scope.practice
              ? `${scope.practice} across ${scope.market ?? scope.region}`
              : `the ${(scope.market ?? scope.region).toLowerCase()} practice`}.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: EXEC_INK_SECONDARY,
              maxWidth: 720,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {regionScopeShape.consultants} consultants across {regionScopeShape.markets} markets and{" "}
            {regionScopeShape.practices} practices, delivering {regionScopeShape.revenue}. Drill down
            to country, practice, team or individual — every KPI updates as you go.
          </p>
        </section>

        <section style={{ marginBottom: 44 }}>
          <ScopeBreadcrumb />
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>The week in numbers</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {regionKpis.map((k) => (
              <KpiCard key={k.key} kpi={k} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel>AI executive copilot</SectionLabel>
          <div
            style={{
              background: "#0E0F26",
              color: "#F4F4F8",
              borderRadius: 16,
              padding: "32px 36px 30px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: EXEC_ACCENT,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: isLiveClaude ? "rgba(51,85,232,0.15)" : "rgba(244,244,248,0.08)",
                  border: `0.5px solid ${isLiveClaude ? "rgba(51,85,232,0.4)" : "rgba(244,244,248,0.16)"}`,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: EXEC_ACCENT,
                }}
              >
                <span
                  style={{ width: 6, height: 6, borderRadius: "50%", background: EXEC_ACCENT }}
                />
                {loadingRead ? "Generating…" : isLiveClaude ? "Claude · Live read" : "Template read"}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(244,244,248,0.55)",
                  marginLeft: "auto",
                }}
              >
                Generated {generatedAt}
              </span>
            </div>
            <div
              className="font-display"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                opacity: loadingRead ? 0.65 : 1,
                transition: "opacity 0.25s ease",
              }}
            >
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: i === 0 ? 21 : 18,
                    lineHeight: 1.55,
                    letterSpacing: i === 0 ? "-0.3px" : "-0.2px",
                    margin: 0,
                    fontWeight: i === 0 ? 500 : 400,
                    color: i === 0 ? "#F4F4F8" : "rgba(244,244,248,0.78)",
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>Modules</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 14,
            }}
          >
            {executiveModules.map((m) => (
              <ModuleCard key={m.href} module={m} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function RegionPicker({
  region,
  onChange,
}: {
  region: Region;
  onChange: (r: Region) => void;
}) {
  return (
    <select
      value={region}
      onChange={(e) => onChange(e.target.value as Region)}
      style={{
        padding: "7px 14px",
        borderRadius: 100,
        border: "0.5px solid rgba(0,0,0,0.12)",
        background: "#FFFFFF",
        color: "#0E0F26",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {REGIONS.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#5F6080",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontWeight: 600,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  const tone = kpi.tone ?? "neutral";
  const accentLine =
    tone === "critical"
      ? "#D93670"
      : tone === "warning"
        ? "#D9782F"
        : tone === "positive"
          ? "#7C5CE6"
          : EXEC_ACCENT;
  const arrow = kpi.trend.direction === "up" ? "↑" : kpi.trend.direction === "down" ? "↓" : "→";
  const trendSign = kpi.trend.value > 0 ? "+" : "";

  return (
    <div
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = "translateY(-2px)";
        ev.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = "translateY(0)";
        ev.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
      }}
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "22px 22px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 196,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 2,
          height: "100%",
          background: accentLine,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          fontSize: 10,
          color: "#5F6080",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 600,
        }}
      >
        {kpi.label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 44,
          fontWeight: 600,
          color: EXEC_INK,
          letterSpacing: "-0.9px",
          lineHeight: 1.0,
          marginTop: -4,
        }}
      >
        {kpi.value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#4B4C6B",
          lineHeight: 1.5,
        }}
      >
        {kpi.detail}
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: accentLine,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        <span>{arrow}</span>
        <span>
          {trendSign}
          {kpi.trend.value}
          {typeof kpi.trend.value === "number" && Math.abs(kpi.trend.value) < 10 ? "pp" : ""}
        </span>
        <span style={{ color: "#6E7090", fontWeight: 400 }}>vs last period</span>
      </div>
    </div>
  );
}

function ModuleCard({
  module,
}: {
  module: (typeof executiveModules)[number];
}) {
  const statusTone =
    module.statusTone === "critical"
      ? { color: "#D93670", bg: "#FFEEF4", border: "#FFCADB" }
      : module.statusTone === "warning"
        ? { color: "#D9782F", bg: "#FFF5EC", border: "#FFDCC2" }
        : module.statusTone === "positive"
          ? { color: "#7C5CE6", bg: "#F4F0FF", border: "#DCD1FF" }
          : { color: "#4B4C6B", bg: "#F4F4F8", border: "rgba(0,0,0,0.08)" };

  return (
    <Link
      href={module.href}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = "translateY(-2px)";
        ev.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.05)";
        ev.currentTarget.style.borderColor = EXEC_ACCENT;
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = "translateY(0)";
        ev.currentTarget.style.boxShadow = "none";
        ev.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "18px 20px 16px",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            padding: "3px 9px",
            borderRadius: 100,
            background: statusTone.bg,
            color: statusTone.color,
            border: `0.5px solid ${statusTone.border}`,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {module.status}
        </span>
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: EXEC_INK,
          letterSpacing: "-0.3px",
          lineHeight: 1.25,
        }}
      >
        {module.title}
      </div>
      <p
        style={{
          fontSize: 12.5,
          color: EXEC_INK_SECONDARY,
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {module.body}
      </p>
      <div
        style={{
          marginTop: "auto",
          paddingTop: 8,
          fontSize: 12,
          fontWeight: 500,
          color: EXEC_ACCENT,
        }}
      >
        Open module →
      </div>
    </Link>
  );
}
