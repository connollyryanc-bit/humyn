"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedInBadge } from "../components/signed-in-badge";
import { R } from "./ui";

const NAV: { href: string; label: string }[] = [
  { href: "/reach", label: "Dashboard" },
  { href: "/reach/prospects", label: "Prospects" },
  { href: "/reach/studio", label: "Message studio" },
  { href: "/reach/sequences", label: "Sequences" },
  { href: "/reach/analytics", label: "Analytics" },
  { href: "/reach/scoring", label: "Lead scoring" },
];

export function ReachChrome() {
  const path = usePathname() || "/reach";

  function isActive(href: string): boolean {
    if (href === "/reach") return path === "/reach";
    return path === href || path.startsWith(href + "/");
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#FFFFFF",
        borderBottom: R.line,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          height: 52,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        <Link href="/reach" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span
            className="font-display"
            style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px", color: R.ink }}
          >
            hum<span style={{ color: "#FF5040" }}>y</span>n
          </span>
          <span
            style={{
              background: R.moss,
              color: R.ink,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "3px 9px",
              borderRadius: 100,
            }}
          >
            Reach
          </span>
        </Link>

        <nav style={{ display: "flex", gap: 4, flex: 1 }}>
          {NAV.map((n) => {
            const on = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  padding: "7px 14px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 500,
                  background: on ? R.ink : "transparent",
                  color: on ? "#FFFFFF" : R.ink2,
                  transition: "background 0.15s",
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: R.ink2,
            padding: "7px 14px",
            borderRadius: 100,
            border: "0.5px solid rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
          }}
        >
          &larr; humyn people intelligence
        </Link>
        <SignedInBadge />
      </div>
    </div>
  );
}
