"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ENVIRONMENT_ACCENTS,
  ENVIRONMENT_SURFACES,
  TopChrome,
} from "../../components/top-chrome";
import {
  ImpactTone,
  Scenario,
  ScenarioImpact,
  ScenarioKey,
  scenarios,
} from "./seed";
import { ScopeBreadcrumb } from "../scope-breadcrumb";
import { describeScope, scopeIsRoot, useExecutiveScope } from "../scope-context";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";
const EXEC_INK_SECONDARY = "#3A3633";

const TONE_COLOURS: Record<ImpactTone, { color: string; bg: string; border: string }> = {
  positive: { color: "#3D8A61", bg: "#EFF8F3", border: "#B6E0CB" },
  warning:  { color: "#B87A2E", bg: "#FEF8EE", border: "#F2DCB0" },
  critical: { color: "#C4534A", bg: "#FDF3F2", border: "#F0CECA" },
  neutral:  { color: "#5A5754", bg: "#F3F0EA", border: "rgba(0,0,0,0.08)" },
};

const DIMENSION_LABELS: Record<ScenarioImpact["dimension"], { label: string; icon: string }> = {
  financial: { label: "Financial", icon: "€" },
  capacity:  { label: "Capacity",  icon: "◆" },
  delivery:  { label: "Delivery",  icon: "▲" },
  skill:     { label: "Skill",     icon: "★" },
};

const CATEGORY_LABELS: Record<Scenario["category"], { label: string; color: string }> = {
  growth:       { label: "Growth",       color: "#3D8A61" },
  downside:     { label: "Downside",     color: "#C4534A" },
  structural:   { label: "Structural",   color: EXEC_ACCENT },
  productivity: { label: "Productivity", color: "#B87A2E" },
};

export default function ScenariosPage() {
  const [selectedKey, setSelectedKey] = useState<ScenarioKey>(scenarios[0].key);
  const selected = scenarios.find((s) => s.key === selectedKey)!;
  const { scope } = useExecutiveScope();

  const [inputs, setInputs] = useState<Record<string, number>>(
    Object.fromEntries(selected.inputs.map((i) => [i.key, i.defaultValue])),
  );

  // When the user selects a different scenario, reset inputs to that scenario's defaults
  function pickScenario(key: ScenarioKey) {
    setSelectedKey(key);
    const next = scenarios.find((s) => s.key === key)!;
    setInputs(Object.fromEntries(next.inputs.map((i) => [i.key, i.defaultValue])));
  }

  const impacts = useMemo(() => selected.computeImpacts(inputs), [selected, inputs]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ENVIRONMENT_SURFACES.executive,
        transition: "background 0.25s ease",
      }}
    >
      <TopChrome env="executive" currentPath="/executive/scenarios" />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" }}>
        <Link
          href="/executive"
          style={{ fontSize: 12, color: EXEC_INK_SECONDARY, textDecoration: "none", display: "inline-block", marginBottom: 18 }}
        >
          ← Executive home
        </Link>

        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
            Executive · Scenario planning
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: EXEC_INK,
              letterSpacing: "-1px",
              margin: "12px 0 14px",
              lineHeight: 1.05,
              maxWidth: 880,
            }}
          >
            Scenario Planning
          </h1>
          <p style={{ fontSize: 15, color: EXEC_INK_SECONDARY, maxWidth: 760, lineHeight: 1.7, margin: 0 }}>
            What-if simulator. Pick a scenario, adjust the inputs, see projected impact across
            financial, capacity, delivery and skill dimensions. Every projection runs live against
            current baseline numbers.
            {!scopeIsRoot(scope) && (
              <>
                {" "}
                Baselines from <strong style={{ color: EXEC_INK }}>{describeScope(scope)}</strong>.
              </>
            )}
          </p>
        </section>

        <section style={{ marginBottom: 24 }}>
          <ScopeBreadcrumb />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 320px) 1fr",
            gap: 22,
            alignItems: "start",
          }}
        >
          <ScenarioList
            selectedKey={selectedKey}
            onSelect={pickScenario}
          />

          <ScenarioDetail
            scenario={selected}
            inputs={inputs}
            onInputChange={(key, value) => setInputs((prev) => ({ ...prev, [key]: value }))}
            impacts={impacts}
          />
        </section>
      </main>
    </div>
  );
}

function ScenarioList({
  selectedKey,
  onSelect,
}: {
  selectedKey: ScenarioKey;
  onSelect: (k: ScenarioKey) => void;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        overflow: "hidden",
        position: "sticky",
        top: 188,
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          background: "#FAFAF8",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          fontSize: 10,
          color: "#6F6B66",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
        }}
      >
        Scenarios · {scenarios.length}
      </div>
      {scenarios.map((s) => {
        const isSelected = s.key === selectedKey;
        const cat = CATEGORY_LABELS[s.category];
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "14px 18px",
              border: "none",
              background: isSelected ? "#F3F0EA" : "transparent",
              borderTop: "0.5px solid rgba(0,0,0,0.04)",
              cursor: "pointer",
              fontFamily: "inherit",
              position: "relative",
              transition: "background 0.15s ease",
            }}
          >
            {isSelected && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: EXEC_ACCENT,
                }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: cat.color,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: cat.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                {cat.label}
              </span>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: EXEC_INK,
                letterSpacing: "-0.1px",
              }}
            >
              {s.title}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ScenarioDetail({
  scenario,
  inputs,
  onInputChange,
  impacts,
}: {
  scenario: Scenario;
  inputs: Record<string, number>;
  onInputChange: (key: string, value: number) => void;
  impacts: ScenarioImpact[];
}) {
  const cat = CATEGORY_LABELS[scenario.category];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          background: "#FFFFFF",
          border: "0.5px solid rgba(0,0,0,0.07)",
          borderRadius: 14,
          padding: "26px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 100,
              background: cat.color + "15",
              color: cat.color,
              border: `0.5px solid ${cat.color}33`,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat.color }} />
            {cat.label}
          </span>
        </div>
        <h2
          className="font-display"
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: EXEC_INK,
            letterSpacing: "-0.6px",
            margin: "0 0 10px",
            lineHeight: 1.1,
          }}
        >
          {scenario.title}
        </h2>
        <p style={{ fontSize: 14, color: EXEC_INK_SECONDARY, lineHeight: 1.65, margin: "0 0 14px" }}>
          {scenario.description}
        </p>
        <p style={{ fontSize: 13, color: "#6F6B66", lineHeight: 1.65, margin: 0 }}>{scenario.context}</p>
      </div>

      <div
        style={{
          background: "#FFFFFF",
          border: "0.5px solid rgba(0,0,0,0.07)",
          borderRadius: 14,
          padding: "24px 28px",
        }}
      >
        <SectionLabel>Inputs</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {scenario.inputs.map((input) => (
            <InputRow
              key={input.key}
              input={input}
              value={inputs[input.key] ?? input.defaultValue}
              onChange={(v) => onInputChange(input.key, v)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Projected impact</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {impacts.map((impact) => (
            <ImpactCard key={impact.dimension} impact={impact} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#6F6B66",
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

function InputRow({
  input,
  value,
  onChange,
}: {
  input: Scenario["inputs"][number];
  value: number;
  onChange: (v: number) => void;
}) {
  const display =
    input.unit === "€"
      ? value >= 1_000_000
        ? `€${(value / 1_000_000).toFixed(2)}M`
        : `€${Math.round(value / 1_000)}k`
      : `${value}${input.unit ? " " + input.unit : ""}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 130px", gap: 18, alignItems: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: EXEC_INK }}>{input.label}</div>
      <input
        type="range"
        min={input.min}
        max={input.max}
        step={input.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: EXEC_ACCENT }}
      />
      <div className="font-display" style={{ textAlign: "right", fontSize: 18, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.2px" }}>
        {display}
      </div>
    </div>
  );
}

function ImpactCard({ impact }: { impact: ScenarioImpact }) {
  const tone = TONE_COLOURS[impact.tone];
  const dim = DIMENSION_LABELS[impact.dimension];
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: tone.color, opacity: 0.85 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            background: tone.bg,
            color: tone.color,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {dim.icon}
        </span>
        <span style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
          {dim.label}
        </span>
      </div>
      <div className="font-display" style={{ fontSize: 16, fontWeight: 600, color: EXEC_INK, letterSpacing: "-0.2px" }}>
        {impact.label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 2 }}>
            Baseline
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500, color: "#6F6B66", letterSpacing: "-0.2px" }}>
            {impact.baseline}
          </div>
        </div>
        <span aria-hidden style={{ color: "#D1CDC4", fontSize: 16 }}>→</span>
        <div>
          <div style={{ fontSize: 10, color: tone.color, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 2 }}>
            Projected
          </div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 600, color: tone.color, letterSpacing: "-0.3px" }}>
            {impact.projected}
          </div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            padding: "3px 10px",
            borderRadius: 100,
            background: tone.bg,
            border: `0.5px solid ${tone.border}`,
            color: tone.color,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {impact.delta}
        </span>
      </div>
      <p style={{ fontSize: 12.5, color: EXEC_INK_SECONDARY, lineHeight: 1.6, margin: 0 }}>{impact.narrative}</p>
    </div>
  );
}
