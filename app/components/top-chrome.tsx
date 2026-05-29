"use client";

import Link from "next/link";
import { SignedInBadge } from "./signed-in-badge";

export type Environment = "pulse" | "pipeline" | "compass";

interface EnvironmentMeta {
  key: Environment;
  label: string;
  tagline: string;
  description: string;
  home: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
}

const ENVIRONMENTS: EnvironmentMeta[] = [
  {
    key: "pulse",
    label: "Pulse",
    tagline: "People intelligence",
    description: "Profiles, personality and team composition.",
    home: "/",
    accent: "#FF5040",
    accentBg: "#FDF3F2",
    accentBorder: "#F0CECA",
  },
  {
    key: "pipeline",
    label: "Pipeline",
    tagline: "Recruiting & staffing",
    description: "Briefs, internal pitch board and hiring.",
    home: "/pipeline",
    accent: "#6B9FCC",
    accentBg: "#F0F5FB",
    accentBorder: "#C4D9EF",
  },
  {
    key: "compass",
    label: "Compass",
    tagline: "Executive reporting",
    description: "Utilisation, capacity and board narrative.",
    home: "/board",
    accent: "#5CAB82",
    accentBg: "#EFF8F3",
    accentBorder: "#B6E0CB",
  },
];

interface NavItem {
  href: string;
  label: string;
}

const NAVS: Record<Environment, NavItem[]> = {
  pulse: [
    { href: "/",            label: "People" },
    { href: "/pulse/new",   label: "New profile" },
    { href: "/people/new",  label: "Add manually" },
  ],
  pipeline: [
    { href: "/teams",        label: "Teams" },
    { href: "/available",    label: "Available" },
    { href: "/pipeline",     label: "Jobs" },
    { href: "/briefs/new",   label: "New brief" },
    { href: "/pipeline/new", label: "New job" },
  ],
  compass: [
    { href: "/board",              label: "Board" },
    { href: "/capacity",           label: "Capacity" },
    { href: "/insights",           label: "Insights" },
    { href: "/settings/rate-card", label: "Rates" },
  ],
};

function HumynWordmark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="font-display"
      style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.5px", color: "#161311" }}
    >
      hum<span style={{ color: "#FF5040" }}>y</span>n
    </span>
  );
}

function isPathActive(currentPath: string | null | undefined, href: string): boolean {
  if (!currentPath) return false;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(href + "/");
}

function EnvironmentTile({
  env,
  active,
}: {
  env: EnvironmentMeta;
  active: boolean;
}) {
  return (
    <Link
      href={env.home}
      style={{
        display: "block",
        flex: 1,
        padding: "10px 16px",
        borderRadius: 12,
        border: active ? `0.5px solid ${env.accentBorder}` : "0.5px solid rgba(0,0,0,0.07)",
        background: active ? env.accentBg : "#FFFFFF",
        textDecoration: "none",
        position: "relative",
        transition: "background 0.12s ease, border-color 0.12s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: active ? env.accent : "transparent",
            border: active ? "none" : `0.5px solid ${env.accent}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: active ? "#161311" : "#4D4945",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {env.label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: active ? "#5A5A5A" : "#9A9A9A",
          }}
        >
          · {env.tagline}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          color: active ? "#5A5A5A" : "#9A9A9A",
          lineHeight: 1.45,
          paddingLeft: 15,
        }}
      >
        {env.description}
      </div>
    </Link>
  );
}

export function TopChrome({
  env,
  currentPath,
  rightSlot,
}: {
  env: Environment;
  currentPath?: string;
  rightSlot?: React.ReactNode;
}) {
  const envMeta = ENVIRONMENTS.find((e) => e.key === env)!;
  const nav = NAVS[env];
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "#FFFFFF",
        borderBottom: "0.5px solid rgba(0,0,0,0.07)",
      }}
    >
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          borderBottom: "0.5px solid rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <Link href="/" aria-label="Humyn home" style={{ display: "inline-flex" }}>
            <HumynWordmark />
          </Link>
          <div
            aria-hidden
            style={{ width: 1, height: 16, background: "rgba(0,0,0,0.08)", margin: "0 14px" }}
          />
          <div
            style={{
              fontSize: 10,
              color: "#9A9A9A",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {envMeta.label} environment
          </div>
          <div style={{ flex: 1 }} />
          <SignedInBadge />
        </div>
      </div>

      <div
        style={{
          padding: "12px 32px",
          background: "#FAFAF8",
          borderBottom: "0.5px solid rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          {ENVIRONMENTS.map((e) => (
            <EnvironmentTile key={e.key} env={e} active={e.key === env} />
          ))}
        </div>
      </div>

      <div
        aria-hidden
        style={{
          height: 2,
          background: envMeta.accent,
          opacity: 0.85,
        }}
      />

      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <nav style={{ display: "flex", gap: 4 }}>
            {nav.map((item) => {
              const active = isPathActive(currentPath, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 400,
                    color: active ? "#FFFFFF" : "#4D4945",
                    background: active ? "#161311" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ flex: 1 }} />
          {rightSlot}
        </div>
      </div>
    </div>
  );
}
