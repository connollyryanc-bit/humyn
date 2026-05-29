"use client";

import Link from "next/link";

export type Environment = "pulse" | "pipeline" | "compass";

const ENVIRONMENTS: { key: Environment; label: string; home: string; accent: string }[] = [
  { key: "pulse",    label: "Pulse",    home: "/",          accent: "#FF5040" },
  { key: "pipeline", label: "Pipeline", home: "/pipeline",  accent: "#6B9FCC" },
  { key: "compass",  label: "Compass",  home: "/board",     accent: "#5CAB82" },
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
    { href: "/teams",                label: "Teams" },
    { href: "/available",            label: "Available" },
    { href: "/pipeline",             label: "Jobs" },
    { href: "/briefs/new",           label: "New brief" },
    { href: "/pipeline/new",         label: "New job" },
  ],
  compass: [
    { href: "/board",                label: "Board" },
    { href: "/capacity",             label: "Capacity" },
    { href: "/insights",             label: "Insights" },
    { href: "/settings/rate-card",   label: "Rates" },
  ],
};

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

function isPathActive(currentPath: string | null | undefined, href: string): boolean {
  if (!currentPath) return false;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(href + "/");
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
          height: 44,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          borderBottom: "0.5px solid rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
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
            style={{ width: 1, height: 18, background: "rgba(0,0,0,0.08)", marginLeft: 4 }}
          />
          <div style={{ display: "flex", gap: 2 }}>
            {ENVIRONMENTS.map((e) => {
              const active = e.key === env;
              return (
                <Link
                  key={e.key}
                  href={e.home}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 500,
                    color: active ? "#161311" : "#9A9A9A",
                    background: active ? "#F3F0EA" : "transparent",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: active ? e.accent : "transparent",
                      border: active ? "none" : `0.5px solid ${e.accent}`,
                    }}
                  />
                  {e.label}
                </Link>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 10, color: "#9A9A9A", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
            {envMeta.label} environment
          </div>
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
