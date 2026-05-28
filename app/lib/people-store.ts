import type { EnergyKey, Person } from "../page";

const STORAGE_KEY = "humyn.custom-people.v1";
const FIRST_CUSTOM_ID = 1001;

export function getStoredPeople(): Person[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Person[];
  } catch {
    return [];
  }
}

export function saveStoredPerson(person: Person): void {
  if (typeof window === "undefined") return;
  const list = getStoredPeople();
  const existing = list.findIndex((p) => p.id === person.id);
  if (existing >= 0) list[existing] = person;
  else list.push(person);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function deleteStoredPerson(id: number): void {
  if (typeof window === "undefined") return;
  const list = getStoredPeople().filter((p) => p.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function nextCustomId(): number {
  const stored = getStoredPeople();
  if (stored.length === 0) return FIRST_CUSTOM_ID;
  const maxId = stored.reduce((m, p) => Math.max(m, p.id), FIRST_CUSTOM_ID - 1);
  return maxId + 1;
}

export function mergePeople(staticPeople: Person[]): Person[] {
  const stored = getStoredPeople();
  const overridden = new Map<number, Person>();
  stored.forEach((p) => overridden.set(p.id, p));
  const result: Person[] = [];
  staticPeople.forEach((p) => result.push(overridden.get(p.id) ?? p));
  stored.forEach((p) => {
    if (!staticPeople.some((s) => s.id === p.id)) result.push(p);
  });
  return result;
}

export function findPerson(id: number, staticPeople: Person[]): Person | undefined {
  return mergePeople(staticPeople).find((p) => p.id === id);
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PURE: Record<EnergyKey, string> = {
  red: "Driver",
  yellow: "Energizer",
  green: "Supporter",
  blue: "Analyst",
};

const MIXED: Record<EnergyKey, Record<EnergyKey, string>> = {
  red:    { red: "Driver",              yellow: "Energizing Driver",   green: "Supportive Driver",    blue: "Analytical Driver"    },
  yellow: { red: "Driving Energizer",   yellow: "Energizer",           green: "Supportive Energizer", blue: "Analytical Energizer" },
  green:  { red: "Driving Supporter",   yellow: "Energizing Supporter",green: "Supporter",            blue: "Analytical Supporter" },
  blue:   { red: "Driving Analyst",     yellow: "Energizing Analyst",  green: "Supportive Analyst",   blue: "Analyst"              },
};

export function deriveWheelPosition(primary: EnergyKey, secondary: EnergyKey): string {
  if (primary === secondary) return PURE[primary];
  return MIXED[primary][secondary];
}

export function emptyPerson(): Person {
  return {
    id: 0,
    name: "",
    initials: "",
    role: "",
    location: "Stockholm",
    primary: "yellow",
    secondary: "green",
    scores: { red: 25, yellow: 60, green: 50, blue: 35 },
    utilisation: 75,
    available: "soon",
    clients: 0,
    revenue: "€0",
    dayRate: 1500,
    bio: "",
    capabilities: [],
    achievements: [],
    bestTrait: "",
    vice: "",
    wheelPosition: "Energizer",
    drivers: [],
    detractors: [],
    howToSpeak: "",
    howToEmail: "",
  };
}
