"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignedInBadge } from "./signed-in-badge";

export type Environment = "pulse" | "pipeline" | "compass";

export const ENVIRONMENT_SURFACES: Record<Environment, string> = {
  pulse:    "#F3F0EA",
  pipeline: "#F7F6F3",
  compass:  "#FAFAF8",
};

export const ENVIRONMENT_ACCENTS: Record<Environment, string> = {
  pulse:    "#FF5040",
  pipeline: "#6B9FCC",
  compass:  "#5CAB82",
};

interface MenuItem {
  href: string;
  title: string;
  body: string;
}

interface FeaturedCard {
  label: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

interface EnvironmentMeta {
  key: Environment;
  label: string;
  tagline: string;
  headline: string;
  accent: string;
  home: string;
  items: MenuItem[];
  featured: FeaturedCard;
}

const ENVIRONMENTS: EnvironmentMeta[] = [
  {
    key: "pulse",
    label: "Pulse",
    tagline: "People intelligence",
    headline: "Get to know your people.",
    accent: "#FF5040",
    home: "/",
    items: [
      {
        href: "/",
        title: "People directory",
        body: "Everyone in Valtech Nordic. Filter by energy, market, availability or capability.",
      },
      {
        href: "/pulse/new",
        title: "Generate a profile from LinkedIn",
        body: "Paste a profile. Two minutes later, you'll know how to talk to them.",
      },
      {
        href: "/people/new",
        title: "Add someone manually",
        body: "When LinkedIn isn't enough — author a profile by hand.",
      },
    ],
    featured: {
      label: "On the bench",
      title: "Niko Virtanen has been on bench for 21 days.",
      body: "Analyst-led, deeply technical, at flight-risk threshold. The Telia cloud architecture brief is a fit. Worth a call this week.",
      href: "/people/10",
      cta: "Open Niko's profile",
    },
  },
  {
    key: "pipeline",
    label: "Pipeline",
    tagline: "Recruiting & resourcing",
    headline: "Plan the week. Run the briefs.",
    accent: "#6B9FCC",
    home: "/teams",
    items: [
      {
        href: "/teams",
        title: "Brief portfolio",
        body: "15 briefs on the board this week. Triage by priority, stage or market.",
      },
      {
        href: "/available",
        title: "Resource timeline",
        body: "A 26-week view of who's allocated and who's free.",
      },
      {
        href: "/pipeline",
        title: "Brief board",
        body: "Every engagement on one screen. Each brief lists its open roles — apply directly.",
      },
      {
        href: "/teams",
        title: "Internal pitch board",
        body: "Roles consultants can apply to directly. Credits reward participation.",
      },
      {
        href: "/briefs/new",
        title: "New brief from RFP",
        body: "Upload an RFP. The AI proposes three ranked team options.",
      },
    ],
    featured: {
      label: "This week",
      title: "3 urgent briefs need staffing.",
      body: "Volvo Cars extension has been unstaffed for 12 days. Kesko forecasting needs a Senior Data Scientist. Nordea wealth pitch closes Friday.",
      href: "/teams",
      cta: "Open the portfolio",
    },
  },
  {
    key: "compass",
    label: "Compass",
    tagline: "Executive reporting",
    headline: "Numbers and narrative for the boardroom.",
    accent: "#5CAB82",
    home: "/board",
    items: [
      {
        href: "/board",
        title: "Board view",
        body: "C-suite at a glance. Anonymous by default. Print-ready.",
      },
      {
        href: "/capacity",
        title: "Capacity & retention",
        body: "Flight risks, utilisation vs 80%, bench duration, cost of leaving.",
      },
      {
        href: "/insights",
        title: "Weekly AI insights",
        body: "Claude-written narrative read. The week in five sentences.",
      },
      {
        href: "/settings/rate-card",
        title: "Rate card",
        body: "Day rates by role × seniority × market. The numbers behind the projections.",
      },
    ],
    featured: {
      label: "Right now",
      title: "78% average utilisation across the Nordic team.",
      body: "4 flight risks across the org. €420k of three-month revenue exposure. Two consultants approaching burnout threshold.",
      href: "/board",
      cta: "Open the board view",
    },
  },
];

function HumynWordmark({ size = 20, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span
      className="font-display"
      style={{
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.5px",
        color: dark ? "#F3F0EA" : "#161311",
      }}
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
  const [openMenu, setOpenMenu] = useState<Environment | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const envMeta = ENVIRONMENTS.find((e) => e.key === env)!;

  useEffect(() => {
    function handleClick(ev: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(ev.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const openMeta = openMenu ? ENVIRONMENTS.find((e) => e.key === openMenu) : null;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#FFFFFF",
        borderBottom: "0.5px solid rgba(0,0,0,0.07)",
      }}
    >
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            gap: 32,
          }}
        >
          <Link href="/" aria-label="Humyn home" style={{ display: "inline-flex" }}>
            <HumynWordmark />
          </Link>
          <nav style={{ display: "flex", gap: 4 }}>
            {ENVIRONMENTS.map((e) => {
              const isCurrent = e.key === env;
              const isOpen = openMenu === e.key;
              return (
                <button
                  key={e.key}
                  onClick={() =>
                    setOpenMenu((prev) => (prev === e.key ? null : e.key))
                  }
                  aria-expanded={isOpen}
                  style={{
                    position: "relative",
                    padding: "6px 4px",
                    margin: "0 10px",
                    border: "none",
                    background: "transparent",
                    color: isCurrent ? "#161311" : "#4D4945",
                    fontSize: 14,
                    fontWeight: isCurrent ? 500 : 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {e.label}
                  {isCurrent && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 4,
                        right: 4,
                        bottom: 0,
                        height: 2,
                        background: e.accent,
                        borderRadius: 2,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
          <div style={{ flex: 1 }} />
          {rightSlot}
          <SignedInBadge />
        </div>
      </div>

      {openMeta && (
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            background: "#161311",
            color: "#F3F0EA",
            boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
            animation: "humyn-mega-in 220ms cubic-bezier(0.2, 0.6, 0.2, 1)",
          }}
        >
          <style>{`
            @keyframes humyn-mega-in {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "44px 32px 48px",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
              gap: 64,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: openMeta.accent,
                  marginBottom: 14,
                }}
              >
                {openMeta.label} · {openMeta.tagline}
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  margin: "0 0 28px",
                  letterSpacing: "-0.4px",
                  color: "#F3F0EA",
                }}
              >
                {openMeta.headline}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {openMeta.items.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    onClick={() => setOpenMenu(null)}
                    style={{
                      display: "block",
                      padding: "14px 0",
                      borderTop: "0.5px solid rgba(243,240,234,0.08)",
                      textDecoration: "none",
                      color: "#F3F0EA",
                      transition: "color 0.12s ease, padding-left 0.18s ease",
                    }}
                    onMouseEnter={(ev) => {
                      ev.currentTarget.style.paddingLeft = "8px";
                      const titleEl = ev.currentTarget.querySelector(
                        "[data-item-title]",
                      ) as HTMLElement | null;
                      if (titleEl) titleEl.style.color = openMeta.accent;
                    }}
                    onMouseLeave={(ev) => {
                      ev.currentTarget.style.paddingLeft = "0";
                      const titleEl = ev.currentTarget.querySelector(
                        "[data-item-title]",
                      ) as HTMLElement | null;
                      if (titleEl) titleEl.style.color = "#F3F0EA";
                    }}
                  >
                    <div
                      data-item-title
                      className="font-display"
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        letterSpacing: "-0.2px",
                        marginBottom: 4,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(243,240,234,0.55)",
                        lineHeight: 1.55,
                        maxWidth: 480,
                      }}
                    >
                      {item.body}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <FeaturedPanel
                featured={openMeta.featured}
                accent={openMeta.accent}
                onClose={() => setOpenMenu(null)}
              />
            </div>
          </div>
        </div>
      )}

      <div
        aria-hidden
        style={{
          height: 2,
          background: envMeta.accent,
          opacity: 0.85,
        }}
      />
    </div>
  );
}

function FeaturedPanel({
  featured,
  accent,
  onClose,
}: {
  featured: FeaturedCard;
  accent: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        background: "#1F1B18",
        border: "0.5px solid rgba(243,240,234,0.08)",
        borderRadius: 14,
        padding: "24px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
      }}
    >
      <div
        aria-hidden
        style={{
          height: 88,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${accent}22 0%, ${accent}05 100%)`,
          border: `0.5px solid ${accent}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            color: accent,
            opacity: 0.18,
            fontWeight: 700,
            letterSpacing: "-2px",
          }}
        >
          {featured.label.split(" ").slice(0, 2).join(" ").toLowerCase()}
        </span>
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: accent,
        }}
      >
        {featured.label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 19,
          fontWeight: 500,
          lineHeight: 1.35,
          color: "#F3F0EA",
          letterSpacing: "-0.2px",
        }}
      >
        {featured.title}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "rgba(243,240,234,0.7)",
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {featured.body}
      </div>
      <Link
        href={featured.href}
        onClick={onClose}
        style={{
          alignSelf: "flex-start",
          padding: "8px 16px",
          borderRadius: 100,
          border: "0.5px solid rgba(243,240,234,0.18)",
          color: "#F3F0EA",
          fontSize: 12,
          fontWeight: 500,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {featured.cta} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

// Backward-compat: kept exported for any future external use of HumynWordmark
export { HumynWordmark };
