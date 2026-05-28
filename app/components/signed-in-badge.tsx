"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../lib/supabase-browser";

export function SignedInBadge() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const sb = getSupabaseBrowser();
      sb.auth
        .getUser()
        .then(({ data }) => {
          if (cancelled) return;
          setEmail(data.user?.email ?? null);
          setReady(true);
        })
        .catch(() => {
          if (cancelled) return;
          setReady(true);
        });
      const sub = sb.auth.onAuthStateChange((_e, session) => {
        if (cancelled) return;
        setEmail(session?.user?.email ?? null);
      });
      return () => {
        cancelled = true;
        sub.data.subscription.unsubscribe();
      };
    } catch {
      setReady(true);
      return () => {
        cancelled = true;
      };
    }
  }, []);

  if (!ready || !email) return null;

  return (
    <form action="/auth/sign-out" method="post" style={{ display: "inline-flex" }}>
      <button
        type="submit"
        title={`Signed in as ${email}`}
        style={{
          padding: "7px 14px",
          borderRadius: 100,
          border: "0.5px solid rgba(0,0,0,0.07)",
          background: "#FFFFFF",
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
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#161311",
            color: "#FFFFFF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
          }}
        >
          {email.charAt(0).toUpperCase()}
        </span>
        Sign out
      </button>
    </form>
  );
}
