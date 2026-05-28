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
