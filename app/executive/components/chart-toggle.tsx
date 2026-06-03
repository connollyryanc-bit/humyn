"use client";

import { ENVIRONMENT_ACCENTS } from "../../components/top-chrome";

export type ChartKind = "bar" | "line" | "area" | "pie";

const EXEC_ACCENT = ENVIRONMENT_ACCENTS.executive;
const EXEC_INK = "#161311";

export function ChartTypeToggle({
  value,
  onChange,
  options,
}: {
  value: ChartKind;
  onChange: (k: ChartKind) => void;
  options: { key: ChartKind; label: string; icon: React.ReactNode }[];
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          fontSize: 10,
          color: "#6F6B66",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
        }}
      >
        View
      </span>
      <div
        style={{
          display: "inline-flex",
          gap: 2,
          padding: 4,
          background: "#F3F0EA",
          border: "0.5px solid rgba(0,0,0,0.08)",
          borderRadius: 10,
        }}
      >
        {options.map((opt) => {
          const isActive = opt.key === value;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={isActive}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 11px",
                borderRadius: 7,
                border: "none",
                background: isActive ? EXEC_INK : "transparent",
                color: isActive ? "#F3F0EA" : "#3A3633",
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "background 0.15s ease, color 0.15s ease",
                boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <span aria-hidden style={{ display: "inline-flex" }}>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Tiny inline icons, sized to match a 12px label
export const ChartIcons = {
  bar: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="6" width="2" height="5" fill="currentColor" />
      <rect x="5" y="3" width="2" height="8" fill="currentColor" />
      <rect x="9" y="1" width="2" height="10" fill="currentColor" />
    </svg>
  ),
  line: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 9 L4 6 L7 8 L11 2" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="2" r="1" fill="currentColor" />
    </svg>
  ),
  area: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 9 L4 6 L7 8 L11 2 L11 11 L1 11 Z" fill="currentColor" opacity="0.35" />
      <path d="M1 9 L4 6 L7 8 L11 2" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pie: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" fill="currentColor" opacity="0.35" />
      <path d="M6 1 A5 5 0 0 1 11 6 L6 6 Z" fill="currentColor" />
    </svg>
  ),
};

export { EXEC_ACCENT };
