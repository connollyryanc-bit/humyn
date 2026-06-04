"use client";

import Link from "next/link";
import { ENVIRONMENT_SURFACES, TopChrome } from "./top-chrome";
import { ROLE_LABEL, Role, useRole } from "./role-context";

type EnvKey = "pulse" | "pipeline" | "compass" | "executive";

export function RestrictedPage({
  env = "pulse",
  currentPath,
  module,
  title,
  reason,
  requiredRoles,
  backHref = "/",
  backLabel = "Back to People",
}: {
  env?: EnvKey;
  currentPath?: string;
  module?: string;
  title: string;
  reason: string;
  requiredRoles: Role[];
  backHref?: string;
  backLabel?: string;
}) {
  const { role, realRole, isImpersonating, setViewAs } = useRole();
  const bg = ENVIRONMENT_SURFACES[env] ?? ENVIRONMENT_SURFACES.pulse;
  return (
    <div style={{ minHeight: "100vh", background: bg }}>
      <TopChrome env={env} currentPath={currentPath} />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 32px" }}>
        <Link
          href={backHref}
          style={{
            fontSize: 12,
            color: "#3A3633",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 24,
          }}
        >
          ← {backLabel}
        </Link>
        {module && (
          <div
            style={{
              fontSize: 11,
              color: "#6F6B66",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            {module}
          </div>
        )}
        <h1
          className="font-display"
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#161311",
            letterSpacing: "-0.8px",
            margin: "0 0 16px",
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 15, color: "#3A3633", lineHeight: 1.7, margin: "0 0 24px" }}>
          {reason}
        </p>
        <div
          style={{
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.07)",
            borderRadius: 12,
            padding: "18px 22px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#6F6B66",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Required role
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {requiredRoles.map((r) => (
              <span
                key={r}
                style={{
                  padding: "4px 10px",
                  borderRadius: 100,
                  background: "#F3F0EA",
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  fontSize: 11.5,
                  color: "#161311",
                  fontWeight: 500,
                }}
              >
                {ROLE_LABEL[r]}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "#5A5754", lineHeight: 1.5 }}>
            You're currently viewing as <strong style={{ color: "#161311" }}>{ROLE_LABEL[role]}</strong>
            {isImpersonating && (
              <> (your real role is <strong style={{ color: "#161311" }}>{ROLE_LABEL[realRole]}</strong>)</>
            )}
            .
            {isImpersonating && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setViewAs(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    color: "#FF5040",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  Switch back to your real role
                </button>
                .
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export function RestrictedSection({
  title = "Restricted",
  reason,
  requiredRoles,
}: {
  title?: string;
  reason: string;
  requiredRoles: Role[];
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "26px 28px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#6F6B66",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, color: "#3A3633", lineHeight: 1.6, marginBottom: 12 }}>
        {reason}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {requiredRoles.map((r) => (
          <span
            key={r}
            style={{
              padding: "3px 9px",
              borderRadius: 100,
              background: "#F3F0EA",
              border: "0.5px solid rgba(0,0,0,0.08)",
              fontSize: 11,
              color: "#161311",
              fontWeight: 500,
            }}
          >
            {ROLE_LABEL[r]}
          </span>
        ))}
      </div>
    </div>
  );
}
