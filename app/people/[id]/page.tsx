"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AvailKey,
  Person,
  availability,
  people,
  utilTone,
} from "../../page";
import { fetchPerson, updatePersonViaApi } from "../../lib/api-client";
import {
  EnergyBadge,
  HeaderStat,
  Pill,
  ProfileHeader,
  PulseProfileBody,
} from "../../components/pulse-profile";
import type { PersonInsights } from "../../lib/insights";
import { ENVIRONMENT_SURFACES, TopChrome } from "../../components/top-chrome";
import { RoleGate, canSeeDayRate } from "../../components/role-context";

function StatusBadge({ k }: { k: AvailKey }) {
  const a = availability[k];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 100,
        background: a.bg,
        color: a.text,
        border: `1px solid ${a.border}`,
        fontSize: 10,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
      {a.label}
    </span>
  );
}

export default function PersonProfilePage() {
  const params = useParams<{ id: string }>();
  const [person, setPerson] = useState<Person | undefined>(() =>
    people.find((p) => p.id === Number(params?.id)),
  );
  const [resolved, setResolved] = useState<boolean>(false);
  const [insightState, setInsightState] = useState<"idle" | "working">("idle");
  const [insightError, setInsightError] = useState<string>("");

  const id = Number(params?.id);

  useEffect(() => {
    let cancelled = false;
    fetchPerson(id)
      .then((found) => {
        if (cancelled) return;
        setPerson(found ?? undefined);
        setResolved(true);
      })
      .catch(() => {
        if (cancelled) return;
        setResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function generateInsights() {
    if (!person) return;
    setInsightState("working");
    setInsightError("");
    try {
      const res = await fetch("/api/pulse/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ person }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate insights.");
      const insights = data.insights as PersonInsights;
      setPerson({ ...person, insights });
      try {
        await updatePersonViaApi(person.id, { ...person, insights });
      } catch {
        setInsightError(
          "Generated, but could not be saved to the database. Run migration 0004 in Supabase, then try again.",
        );
      }
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : "Could not generate insights.");
    } finally {
      setInsightState("idle");
    }
  }

  if (resolved && !person) {
    notFound();
  }

  if (!person) {
    return (
      <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pulse, transition: "background 0.25s ease" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: 32 }}>Loading…</div>
      </div>
    );
  }

  const tone = utilTone(person.utilisation);

  return (
    <div style={{ minHeight: "100vh", background: ENVIRONMENT_SURFACES.pulse, transition: "background 0.25s ease" }}>
      <TopChrome
        env="pulse"
        currentPath="/"
        rightSlot={
          <>
            <Link
              href={`/people/${person.id}/edit`}
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
              Edit profile
            </Link>
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
                textDecoration: "none",
              }}
            >
              ← Back to People
            </Link>
          </>
        }
      />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>
        <ProfileHeader
          person={person}
          eyebrow="Pulse profile"
          subtitle={`${person.role} · ${person.location}`}
          badges={
            <>
              <EnergyBadge k={person.primary} />
              <EnergyBadge k={person.secondary} small />
              <Pill>{person.wheelPosition}</Pill>
              <StatusBadge k={person.available} />
            </>
          }
          stats={
            <>
              <HeaderStat label="Wheel position" value={person.wheelPosition} />
              <HeaderStat
                label="Utilisation"
                value={`${person.utilisation}% · ${tone.label}`}
                color={tone.color}
              />
              <HeaderStat label="Active clients" value={String(person.clients)} />
              <RoleGate can={canSeeDayRate}>
                <HeaderStat label="Revenue (12 mo)" value={person.revenue} />
              </RoleGate>
              <HeaderStat label="Availability" value={availability[person.available].label} />
            </>
          }
        />

        <PulseProfileBody
          person={person}
          insightState={insightState}
          insightError={insightError}
          onGenerateInsights={generateInsights}
          composerPlaceholder="E.g. I need to push the Nordea kickoff by a week — flag the impact and ask for sign-off."
        />
      </main>
    </div>
  );
}
