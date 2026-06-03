"use client";

import {
  ExecutiveScope,
  NORDIC_MARKETS,
  PRACTICES,
  REGIONS,
  Region,
  scopeIsRoot,
  useExecutiveScope,
} from "./scope-context";

const ACCENT = "#1A2EAA";
const INK = "#161311";
const INK_SECONDARY = "#3A3633";

export function ScopeBreadcrumb({ style }: { style?: React.CSSProperties }) {
  const { scope, setScope, resetScope } = useExecutiveScope();

  function setRegion(region: Region) {
    setScope({ region });
  }

  function setMarket(value: string) {
    if (value === "All markets") {
      setScope({ region: scope.region, practice: scope.practice });
      return;
    }
    setScope({
      region: scope.region,
      market: value as ExecutiveScope["market"],
      practice: scope.practice,
    });
  }

  function setPractice(value: string) {
    if (value === "All practices") {
      setScope({ region: scope.region, market: scope.market });
      return;
    }
    setScope({
      region: scope.region,
      market: scope.market,
      practice: value as ExecutiveScope["practice"],
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        flexWrap: "wrap",
        ...style,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: "#9A9A9A",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
          marginRight: 4,
        }}
      >
        Scope
      </span>

      <ScopePicker
        value={scope.region}
        options={[...REGIONS]}
        onChange={(v) => setRegion(v as Region)}
        accent
      />

      {scope.region === "Nordics" && (
        <>
          <Caret />
          <ScopePicker
            value={scope.market ?? "All markets"}
            options={["All markets", ...NORDIC_MARKETS]}
            onChange={setMarket}
            muted={!scope.market}
          />
        </>
      )}

      <Caret />
      <ScopePicker
        value={scope.practice ?? "All practices"}
        options={["All practices", ...PRACTICES]}
        onChange={setPractice}
        muted={!scope.practice}
      />

      <div style={{ flex: 1 }} />

      {!scopeIsRoot(scope) && (
        <button
          onClick={resetScope}
          style={{
            padding: "4px 10px",
            borderRadius: 100,
            border: "0.5px solid rgba(0,0,0,0.08)",
            background: "#FAFAF8",
            color: INK_SECONDARY,
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Reset to Europe
        </button>
      )}
    </div>
  );
}

function Caret() {
  return (
    <span aria-hidden style={{ color: "rgba(0,0,0,0.18)", fontSize: 12 }}>
      ›
    </span>
  );
}

function ScopePicker({
  value,
  options,
  onChange,
  accent,
  muted,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          padding: "5px 26px 5px 12px",
          borderRadius: 100,
          border: `0.5px solid ${accent ? `${ACCENT}33` : "rgba(0,0,0,0.08)"}`,
          background: accent ? `${ACCENT}10` : "#FAFAF8",
          color: muted ? "#9A9A9A" : accent ? ACCENT : INK,
          fontSize: 12,
          fontWeight: accent ? 600 : 500,
          letterSpacing: accent ? "0.04em" : undefined,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 10,
          fontSize: 9,
          color: muted ? "#9A9A9A" : accent ? ACCENT : "#6F6B66",
          pointerEvents: "none",
        }}
      >
        ▼
      </span>
    </label>
  );
}
