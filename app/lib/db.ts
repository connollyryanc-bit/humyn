import "server-only";
import { AvailKey, EnergyKey, Person } from "./people-data";
import { CapacityData, PersonWithCapacity, RiskLevel } from "./capacity-data";
import { getSupabaseAdmin } from "./supabase";

interface PersonRow {
  id: number;
  name: string;
  initials: string;
  role: string;
  location: string;
  primary_energy: EnergyKey;
  secondary_energy: EnergyKey;
  score_red: number;
  score_yellow: number;
  score_green: number;
  score_blue: number;
  utilisation: number;
  available: AvailKey;
  clients: number;
  revenue: string;
  bio: string;
  capabilities: string[];
  achievements: string[];
  best_trait: string;
  vice: string;
  wheel_position: string;
  drivers: string[];
  detractors: string[];
  how_to_speak: string;
  how_to_email: string;
}

interface CapacityRow {
  person_id: number;
  bench_days: number;
  loyalty_score: number;
  risk_level: RiskLevel;
  risk_reasons: string[];
  recommended_action: string;
  replacement_cost: number;
  lost_revenue_3_months: number;
  onboarding_cost: number;
  key_client_at_risk: string | null;
  current_project: string | null;
  burnout_risk: boolean;
}

function rowToPerson(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    role: row.role,
    location: row.location,
    primary: row.primary_energy,
    secondary: row.secondary_energy,
    scores: {
      red: row.score_red,
      yellow: row.score_yellow,
      green: row.score_green,
      blue: row.score_blue,
    },
    utilisation: row.utilisation,
    available: row.available,
    clients: row.clients,
    revenue: row.revenue,
    bio: row.bio,
    capabilities: row.capabilities ?? [],
    achievements: row.achievements ?? [],
    bestTrait: row.best_trait,
    vice: row.vice,
    wheelPosition: row.wheel_position,
    drivers: row.drivers ?? [],
    detractors: row.detractors ?? [],
    howToSpeak: row.how_to_speak,
    howToEmail: row.how_to_email,
  };
}

function personToRow(p: Person): Omit<PersonRow, "id"> & { id?: number } {
  const row: Omit<PersonRow, "id"> & { id?: number } = {
    name: p.name,
    initials: p.initials,
    role: p.role,
    location: p.location,
    primary_energy: p.primary,
    secondary_energy: p.secondary,
    score_red: p.scores.red,
    score_yellow: p.scores.yellow,
    score_green: p.scores.green,
    score_blue: p.scores.blue,
    utilisation: p.utilisation,
    available: p.available,
    clients: p.clients,
    revenue: p.revenue,
    bio: p.bio,
    capabilities: p.capabilities,
    achievements: p.achievements,
    best_trait: p.bestTrait,
    vice: p.vice,
    wheel_position: p.wheelPosition,
    drivers: p.drivers,
    detractors: p.detractors,
    how_to_speak: p.howToSpeak,
    how_to_email: p.howToEmail,
  };
  if (p.id) row.id = p.id;
  return row;
}

function rowToCapacity(row: CapacityRow): CapacityData {
  return {
    benchDays: row.bench_days,
    loyaltyScore: row.loyalty_score,
    riskLevel: row.risk_level,
    riskReasons: row.risk_reasons ?? [],
    recommendedAction: row.recommended_action,
    replacementCost: row.replacement_cost,
    lostRevenue3Months: row.lost_revenue_3_months,
    onboardingCost: row.onboarding_cost,
    keyClientAtRisk: row.key_client_at_risk,
    currentProject: row.current_project,
    burnoutRisk: row.burnout_risk,
  };
}

function capacityToRow(personId: number, c: CapacityData): CapacityRow {
  return {
    person_id: personId,
    bench_days: c.benchDays,
    loyalty_score: c.loyaltyScore,
    risk_level: c.riskLevel,
    risk_reasons: c.riskReasons,
    recommended_action: c.recommendedAction,
    replacement_cost: c.replacementCost,
    lost_revenue_3_months: c.lostRevenue3Months,
    onboarding_cost: c.onboardingCost,
    key_client_at_risk: c.keyClientAtRisk,
    current_project: c.currentProject,
    burnout_risk: c.burnoutRisk,
  };
}

export async function getAllPeople(): Promise<Person[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("people")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(`getAllPeople: ${error.message}`);
  return (data as PersonRow[]).map(rowToPerson);
}

export async function getPerson(id: number): Promise<Person | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("people").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getPerson(${id}): ${error.message}`);
  return data ? rowToPerson(data as PersonRow) : null;
}

export async function createPerson(p: Person): Promise<Person> {
  const sb = getSupabaseAdmin();
  const row = personToRow(p);
  delete row.id;
  const { data, error } = await sb.from("people").insert(row).select("*").single();
  if (error) throw new Error(`createPerson: ${error.message}`);
  return rowToPerson(data as PersonRow);
}

export async function updatePerson(id: number, p: Person): Promise<Person> {
  const sb = getSupabaseAdmin();
  const row = personToRow(p);
  delete row.id;
  const { data, error } = await sb
    .from("people")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updatePerson(${id}): ${error.message}`);
  return rowToPerson(data as PersonRow);
}

export async function upsertPerson(p: Person): Promise<Person> {
  const sb = getSupabaseAdmin();
  const row = personToRow(p);
  const { data, error } = await sb
    .from("people")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw new Error(`upsertPerson: ${error.message}`);
  return rowToPerson(data as PersonRow);
}

export async function deletePerson(id: number): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("people").delete().eq("id", id);
  if (error) throw new Error(`deletePerson(${id}): ${error.message}`);
}

export async function getAllCapacity(): Promise<Record<number, CapacityData>> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("capacity_data").select("*");
  if (error) throw new Error(`getAllCapacity: ${error.message}`);
  const map: Record<number, CapacityData> = {};
  (data as CapacityRow[]).forEach((row) => {
    map[row.person_id] = rowToCapacity(row);
  });
  return map;
}

export async function upsertCapacity(personId: number, c: CapacityData): Promise<CapacityData> {
  const sb = getSupabaseAdmin();
  const row = capacityToRow(personId, c);
  const { data, error } = await sb
    .from("capacity_data")
    .upsert(row, { onConflict: "person_id" })
    .select("*")
    .single();
  if (error) throw new Error(`upsertCapacity(${personId}): ${error.message}`);
  return rowToCapacity(data as CapacityRow);
}

export async function getEnrichedPeople(): Promise<PersonWithCapacity[]> {
  const [people, capacity] = await Promise.all([getAllPeople(), getAllCapacity()]);
  return people
    .filter((p) => capacity[p.id])
    .map((p) => ({ ...p, capacity: capacity[p.id] }));
}
