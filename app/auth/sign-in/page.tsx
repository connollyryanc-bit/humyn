"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";

const MICROSOFT_ENABLED = process.env.NEXT_PUBLIC_AUTH_AZURE_ENABLED === "true";

function HumynWordmark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="font-display"
      style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.5px", color: "#161311" }}
    >
      hum<span style={{ color: "#FF5040" }}>y</span>n
    </span>
  );
}

function SignInForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setError("");
    try {
      const sb = getSupabaseBrowser();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: signInError } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (signInError) throw signInError;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send the magic link.");
    }
  }

  async function signInWithAzure() {
    try {
      const sb = getSupabaseBrowser();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: signInError } = await sb.auth.signInWithOAuth({
        provider: "azure",
        options: { redirectTo },
      });
      if (signInError) throw signInError;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not start Microsoft sign-in.");
    }
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <button
        onClick={signInWithAzure}
        disabled={!MICROSOFT_ENABLED}
        style={{
          padding: "11px 14px",
          borderRadius: 10,
          border: "0.5px solid rgba(0,0,0,0.07)",
          background: MICROSOFT_ENABLED ? "#FFFFFF" : "#FAFAF8",
          color: MICROSOFT_ENABLED ? "#161311" : "#9A9A9A",
          fontSize: 13,
          fontWeight: 600,
          cursor: MICROSOFT_ENABLED ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            width: 20,
            height: 20,
            background: MICROSOFT_ENABLED ? "#1A2EAA" : "#C8C5BD",
            color: "#FFFFFF",
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          M
        </span>
        <span style={{ flex: 1 }}>
          Sign in with Microsoft
          {!MICROSOFT_ENABLED && (
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 500,
                color: "#9A9A9A",
                marginTop: 2,
              }}
            >
              Coming soon — Entra SSO requires one-time Supabase + Microsoft setup.
            </span>
          )}
        </span>
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#9A9A9A",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
        }}
      >
        <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
        or magic link
        <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
      </div>

      <form onSubmit={sendMagicLink} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#161311" }}>Work email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@valtech.com"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending" || !email.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background:
              status === "sending" || !email.trim() ? "#EDEDEA" : "#161311",
            color:
              status === "sending" || !email.trim() ? "#9A9A9A" : "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            cursor:
              status === "sending" || !email.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {status === "sending" ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>

      {status === "sent" && (
        <div
          style={{
            background: "#EEF7F2",
            border: "0.5px solid #9ED4B8",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 12,
            color: "#1A5C38",
            lineHeight: 1.55,
          }}
        >
          Check <strong>{email}</strong> — we sent a sign-in link. Click it to land back here signed
          in. Links expire after one hour.
        </div>
      )}

      {status === "error" && error && (
        <div
          style={{
            background: "#FDF0EE",
            border: "0.5px solid #FCCDC6",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 12,
            color: "#9B2A1A",
            lineHeight: 1.55,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F0EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 18 }}>
            <HumynWordmark />
          </Link>
          <div
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.4px",
              marginBottom: 6,
            }}
          >
            Sign in to Humyn
          </div>
          <div style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.55 }}>
            People intelligence for Valtech Nordic. Use your work email — we&apos;ll send you a
            one-tap sign-in link.
          </div>
        </div>
        <Suspense fallback={<div>Loading…</div>}>
          <SignInForm />
        </Suspense>
        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            color: "#9A9A9A",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Need help getting in? Ask your Valtech Nordic Capacity Manager.
        </div>
      </div>
    </div>
  );
}
