"use client";

import { useEffect, useRef, useState } from "react";
import { useRole, ROLES, ROLE_LABEL, type Role } from "./role-context";
import { ROLE_DESCRIPTION } from "../lib/roles";

export function SignedInBadge() {
  const { email, role, realRole, isImpersonating, setViewAs, ready } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!ready || !email) return null;

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`Signed in as ${email}`}
        style={{
          padding: "7px 12px 7px 8px",
          borderRadius: 100,
          border: isImpersonating
            ? "0.5px solid rgba(255,80,64,0.45)"
            : "0.5px solid rgba(0,0,0,0.07)",
          background: isImpersonating ? "rgba(255,80,64,0.05)" : "#FFFFFF",
          color: "#161311",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#161311",
            color: "#FFFFFF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {initial}
        </span>
        <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 1, lineHeight: 1.1 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            {ROLE_LABEL[role]}
            {isImpersonating && (
              <span style={{ marginLeft: 6, fontSize: 10, color: "#FF5040", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                view-as
              </span>
            )}
          </span>
          <span style={{ fontSize: 10, color: "#6F6B66", fontWeight: 400 }}>
            {email.length > 26 ? email.slice(0, 24) + "…" : email}
          </span>
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" style={{ marginLeft: 2, color: "#6F6B66", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }}>
          <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 320,
            background: "#FFFFFF",
            border: "0.5px solid rgba(0,0,0,0.08)",
            borderRadius: 14,
            boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
            padding: 10,
            zIndex: 80,
          }}
        >
          <div style={{ padding: "8px 12px 12px", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Signed in
            </div>
            <div style={{ fontSize: 13, color: "#161311", fontWeight: 500, marginTop: 4, wordBreak: "break-all" }}>
              {email}
            </div>
            <div style={{ fontSize: 11, color: "#6F6B66", marginTop: 4 }}>
              Real role: <strong style={{ color: "#161311" }}>{ROLE_LABEL[realRole]}</strong>
            </div>
          </div>

          <div style={{ padding: "10px 12px 4px" }}>
            <div style={{ fontSize: 11, color: "#6F6B66", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              View as
            </div>
            <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 4 }}>
              Preview the platform from another role. Doesn't change your access.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "6px 6px 8px" }}>
            {ROLES.map((r: Role) => {
              const active = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    if (r === realRole) setViewAs(null);
                    else setViewAs(r);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? "#F3F0EA" : "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 100,
                      marginTop: 4,
                      flexShrink: 0,
                      background: active ? "#161311" : "transparent",
                      border: active ? "none" : "1.5px solid rgba(0,0,0,0.18)",
                    }}
                  />
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, color: "#161311", fontWeight: active ? 600 : 500 }}>
                      {ROLE_LABEL[r]}
                      {r === realRole && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: "#6F6B66", fontWeight: 500 }}>
                          (yours)
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 11, color: "#5A5754", lineHeight: 1.4 }}>
                      {ROLE_DESCRIPTION[r]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: "6px 6px 0", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
            <form action="/auth/sign-out" method="post" style={{ width: "100%" }}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "#161311",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
