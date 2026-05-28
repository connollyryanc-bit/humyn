"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Person } from "../../page";
import { PersonForm } from "../../components/person-form";
import { emptyPerson } from "../../lib/people-store";
import { createPersonViaApi } from "../../lib/api-client";

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

export default function NewPersonPage() {
  const router = useRouter();
  const initial = useMemo<Person>(() => emptyPerson(), []);

  async function handleSubmit(person: Person) {
    try {
      const created = await createPersonViaApi(person);
      router.push(`/people/${created.id}`);
    } catch (err) {
      alert(
        `Could not save: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
      <header
        style={{
          height: 52,
          background: "#FFFFFF",
          borderBottom: "0.5px solid rgba(0,0,0,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <Link href="/">
            <HumynWordmark />
          </Link>
          <nav style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            <Link
              href="/"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#FFFFFF",
                background: "#161311",
              }}
            >
              People
            </Link>
            <Link
              href="/teams"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Teams
            </Link>
            <Link
              href="/available"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Available
            </Link>
            <Link
              href="/capacity"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Capacity
            </Link>
            <Link
              href="/insights"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Insights
            </Link>
          </nav>
          <div style={{ flex: 1 }} />
          <Link
            href="/"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            ← Back to People
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Pulse · New profile
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.5px",
              margin: "6px 0 4px",
            }}
          >
            Add a person
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 640 }}>
            Fill in by hand. For LinkedIn-paste AI generation use{" "}
            <Link href="/pulse/new" style={{ color: "#1E6FA5", fontWeight: 500 }}>
              the Pulse generator
            </Link>
            . Profiles are stored in your browser for now — multi-user wiring lands with the
            backend.
          </div>
        </div>

        <PersonForm
          mode="create"
          initial={initial}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/")}
        />
      </main>
    </div>
  );
}
