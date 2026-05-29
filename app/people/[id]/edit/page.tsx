"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Person } from "../../../page";
import { PersonForm } from "../../../components/person-form";
import { fetchPerson, updatePersonViaApi } from "../../../lib/api-client";
import { ENVIRONMENT_SURFACES, TopChrome } from "../../../components/top-chrome";

export default function EditPersonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);
  const [person, setPerson] = useState<Person | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPerson(id)
      .then((found) => {
        if (cancelled) return;
        setPerson(found ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loaded && !person) {
    notFound();
  }

  if (!person) {
    return (
      <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pulse, padding: 32 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>Loading…</div>
      </div>
    );
  }

  async function handleSubmit(next: Person) {
    try {
      const saved = await updatePersonViaApi(next.id, next);
      router.push(`/people/${saved.id}`);
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
        currentPath="/"
        rightSlot={
          <Link
            href={`/people/${person.id}`}
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            ← Back to profile
          </Link>
        }
      />

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
            Pulse · Edit profile
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
            Editing {person.name}
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 640 }}>
            Your edits override the directory value for this person and persist in your browser.
          </div>
        </div>

        <PersonForm
          mode="edit"
          initial={person}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/people/${person.id}`)}
        />
      </main>
    </div>
  );
}
