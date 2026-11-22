"use client";

import type { CSSProperties, ReactNode } from "react";
import { energy, type EnergyKey } from "../lib/people-data";
import { ENERGY_LABEL, SEGMENT_LABEL, type Segment } from "./seed";
import { GRADE_STYLE, type Grade } from "./scoring";

export const R = {
  surface: "#F1F3EE",
  ink: "#161311",
  ink2: "#4D4945",
  ink3: "#9A9A9A",
  line: "0.5px solid rgba(0,0,0,0.07)",
  moss: "#9CFF40",
  subtle: "#FAFAF8",
};

export function Page({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div style={{ maxWidth: narrow ? 960 : 1280, margin: "0 auto", padding: "28px 32px 64px" }}>{children}</div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 24,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1
          className="font-display"
          style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.5px", margin: 0, color: R.ink }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: R.ink2, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 640 }}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: R.line,
        borderRadius: 12,
        padding: "1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Label({ children, dot }: { children: ReactNode; dot?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: R.ink3,
        marginBottom: 12,
      }}
    >
      {dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />}
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "dark",
  disabled = false,
  small = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "dark" | "light" | "moss";
  disabled?: boolean;
  small?: boolean;
}) {
  const styles: Record<string, CSSProperties> = {
    dark: { background: R.ink, color: "#FFFFFF", border: "none" },
    light: { background: "#FFFFFF", color: R.ink, border: "0.5px solid rgba(0,0,0,0.15)" },
    moss: { background: R.moss, color: R.ink, border: "none" },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: small ? "6px 12px" : "9px 18px",
        borderRadius: 100,
        fontSize: small ? 12 : 13,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  bg = "#FAFAF8",
  color = R.ink2,
  border = "rgba(0,0,0,0.07)",
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  border?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 100,
        background: bg,
        color,
        border: `0.5px solid ${border}`,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function EnergyPill({ k }: { k: EnergyKey }) {
  const e = energy[k];
  return (
    <Pill bg={e.bg} color={e.text} border={e.border}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: e.color }} />
      {ENERGY_LABEL[k]}
    </Pill>
  );
}

export function SegmentPill({ s }: { s: Segment }) {
  return <Pill>{SEGMENT_LABEL[s]}</Pill>;
}

export function GradePill({ grade, score }: { grade: Grade; score?: number }) {
  const g = GRADE_STYLE[grade];
  return (
    <Pill bg={g.bg} color={g.text} border="transparent">
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: g.color }} />
      {g.label}
      {score !== undefined ? ` ${score}` : ""}
    </Pill>
  );
}

export function Avatar({ initials, k, size = 36 }: { initials: string; k: EnergyKey; size?: number }) {
  const e = energy[k];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: e.bg,
        color: e.text,
        border: `1px solid ${e.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function DemoTag() {
  return (
    <Pill bg="#FFFFFF" color={R.ink3}>
      Sample data
    </Pill>
  );
}

export function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div style={{ height: 6, background: R.surface, borderRadius: 100, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`,
          height: 6,
          background: color,
          borderRadius: 100,
        }}
      />
    </div>
  );
}

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.15)",
  background: "#FFFFFF",
  fontSize: 13,
  color: R.ink,
  outline: "none",
};
