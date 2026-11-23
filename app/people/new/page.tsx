"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Person } from "../../page";
import { PersonForm } from "../../components/person-form";
import { emptyPerson } from "../../lib/people-store";
import { createPersonViaApi } from "../../lib/api-client";
import { ENVIRONMENT_SURFACES, TopChrome } from "../../components/top-chrome";

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
    <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pulse, transition: "background 0.25s ease" }}>
      <TopChrome
        env="pulse"
        currentPath="/people/new"
        rightSlot={
          <Link
            href="/"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#0E0F26",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            ← Back to People
          </Link>
        }
      />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              color: "#6E7090",
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
              color: "#0E0F26",
              letterSpacing: "-0.5px",
              margin: "6px 0 4px",
            }}
          >
            Add a person
          </h1>
          <div style={{ fontSize: 13, color: "#4B4C6B", maxWidth: 640 }}>
            Fill in by hand. For LinkedIn-paste AI generation use{" "}
            <Link href="/pulse/new" style={{ color: "#3355E8", fontWeight: 500 }}>
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
