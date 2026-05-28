import type { Person } from "./people-data";
import type { PersonWithCapacity } from "./capacity-data";

async function jsonOrThrow<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ?? "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`${label} (${res.status}): ${detail || "unknown error"}`);
  }
  return (await res.json()) as T;
}

export async function fetchAllPeople(): Promise<Person[]> {
  const res = await fetch("/api/people", { cache: "no-store" });
  const data = await jsonOrThrow<{ people: Person[] }>(res, "GET /api/people");
  return data.people;
}

export async function fetchPerson(id: number): Promise<Person | null> {
  const res = await fetch(`/api/people/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  const data = await jsonOrThrow<{ person: Person }>(res, `GET /api/people/${id}`);
  return data.person;
}

export async function createPersonViaApi(person: Person): Promise<Person> {
  const res = await fetch("/api/people", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ person }),
  });
  const data = await jsonOrThrow<{ person: Person }>(res, "POST /api/people");
  return data.person;
}

export async function updatePersonViaApi(id: number, person: Person): Promise<Person> {
  const res = await fetch(`/api/people/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ person }),
  });
  const data = await jsonOrThrow<{ person: Person }>(res, `PUT /api/people/${id}`);
  return data.person;
}

export async function fetchEnrichedPeople(): Promise<PersonWithCapacity[]> {
  const res = await fetch("/api/capacity", { cache: "no-store" });
  const data = await jsonOrThrow<{ enriched: PersonWithCapacity[] }>(res, "GET /api/capacity");
  return data.enriched;
}

export interface TeamPayload {
  id: number;
  name: string;
  description: string;
  client: string | null;
  members: Array<{ personId: number; role: string }>;
}

export async function fetchAllTeams(): Promise<TeamPayload[]> {
  const res = await fetch("/api/teams", { cache: "no-store" });
  const data = await jsonOrThrow<{ teams: TeamPayload[] }>(res, "GET /api/teams");
  return data.teams;
}

export async function createTeamViaApi(input: {
  name: string;
  description?: string;
  client?: string | null;
  members: Array<{ personId: number; role: string }>;
}): Promise<TeamPayload> {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await jsonOrThrow<{ team: TeamPayload }>(res, "POST /api/teams");
  return data.team;
}

export async function updateTeamViaApi(
  id: number,
  input: {
    name: string;
    description?: string;
    client?: string | null;
    members: Array<{ personId: number; role: string }>;
  },
): Promise<TeamPayload> {
  const res = await fetch(`/api/teams/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await jsonOrThrow<{ team: TeamPayload }>(res, `PUT /api/teams/${id}`);
  return data.team;
}

export async function deleteTeamViaApi(id: number): Promise<void> {
  const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
  await jsonOrThrow<{ ok: boolean }>(res, `DELETE /api/teams/${id}`);
}

export async function fetchInsightsWeekly(): Promise<{ narrative: string; generatedAt: string }> {
  const res = await fetch("/api/insights/weekly", { cache: "no-store" });
  return jsonOrThrow<{ narrative: string; generatedAt: string }>(res, "GET /api/insights/weekly");
}

export interface TeamAnalysis {
  compositionSummary: string;
  strengths: string[];
  frictionPairs: Array<{
    a: string;
    b: string;
    severity: "low" | "medium" | "high";
    reason: string;
  }>;
  dynamicsRisks: string[];
  missingAngle: string;
  kickoffPrompt: string;
}

export async function analyzeTeamViaApi(personIds: number[]): Promise<TeamAnalysis> {
  const res = await fetch("/api/teams/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ personIds }),
  });
  const data = await jsonOrThrow<{ analysis: TeamAnalysis }>(res, "POST /api/teams/analyze");
  return data.analysis;
}

export interface BriefAnalysis {
  briefSummary: string;
  inferredRequirements: {
    skills: string[];
    seniorityNotes: string;
    energyMix: string;
  };
  proposals: Array<{
    name: string;
    rationale: string;
    watchOut: string;
    members: Array<{
      personId: number;
      role: string;
      reason: string;
    }>;
  }>;
}

export async function analyzeBriefViaApi(input: {
  briefText: string;
  client?: string;
  durationMonths?: number;
  preferredMarket?: string;
}): Promise<BriefAnalysis> {
  const res = await fetch("/api/briefs/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await jsonOrThrow<{ analysis: BriefAnalysis }>(res, "POST /api/briefs/analyze");
  return data.analysis;
}

export interface RateCardRow {
  id: number;
  roleBand: string;
  seniority: string;
  market: string;
  dayRateEur: number;
  notes: string;
}

export async function fetchRateCards(): Promise<RateCardRow[]> {
  const res = await fetch("/api/rate-cards", { cache: "no-store" });
  const data = await jsonOrThrow<{ cards: RateCardRow[] }>(res, "GET /api/rate-cards");
  return data.cards;
}

export async function upsertRateCardViaApi(input: {
  roleBand: string;
  seniority: string;
  market: string;
  dayRateEur: number;
  notes?: string;
}): Promise<RateCardRow> {
  const res = await fetch("/api/rate-cards", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await jsonOrThrow<{ card: RateCardRow }>(res, "POST /api/rate-cards");
  return data.card;
}

export async function deleteRateCardViaApi(id: number): Promise<void> {
  const res = await fetch(`/api/rate-cards/${id}`, { method: "DELETE" });
  await jsonOrThrow<{ ok: boolean }>(res, `DELETE /api/rate-cards/${id}`);
}
