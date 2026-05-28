import { EnergyKey, Person } from "./people-data";
import { PersonWithCapacity, RiskLevel } from "./capacity-data";

export interface TeamMember {
  personId: number;
  role: string;
}

export interface TeamHarmony {
  score: number;
  balanceScore: number;
  coverageScore: number;
  frictionScore: number;
  band: "Excellent" | "Healthy" | "Watch" | "At risk";
  bandColor: string;
}

export interface ConflictCost {
  productivityLossPct: number;
  euros: number;
  rationale: string;
}

export interface EnergyGap {
  energy: EnergyKey;
  severity: "undersupplied" | "oversupplied";
  detail: string;
}

export interface FrictionPair {
  a: Person;
  b: Person;
  reason: string;
}

export interface SuggestedSwap {
  candidate: Person;
  reason: string;
}

const HARMONY_BANDS: Array<{
  min: number;
  band: TeamHarmony["band"];
  color: string;
}> = [
  { min: 85, band: "Excellent", color: "#2E8B57" },
  { min: 70, band: "Healthy", color: "#F5A623" },
  { min: 50, band: "Watch", color: "#F5A623" },
  { min: 0,  band: "At risk", color: "#E8402A" },
];

const POSITION_OF_PRIMARY: Record<EnergyKey, string> = {
  red: "Driver",
  yellow: "Connector",
  green: "Anchor",
  blue: "Analyst",
};

const ENERGIES: EnergyKey[] = ["red", "yellow", "green", "blue"];

export function averageScores(team: Person[]): Record<EnergyKey, number> {
  if (team.length === 0) return { red: 0, yellow: 0, green: 0, blue: 0 };
  const sum = { red: 0, yellow: 0, green: 0, blue: 0 };
  team.forEach((p) => {
    sum.red += p.scores.red;
    sum.yellow += p.scores.yellow;
    sum.green += p.scores.green;
    sum.blue += p.scores.blue;
  });
  const n = team.length;
  return {
    red: Math.round(sum.red / n),
    yellow: Math.round(sum.yellow / n),
    green: Math.round(sum.green / n),
    blue: Math.round(sum.blue / n),
  };
}

export function dominantEnergy(team: Person[]): EnergyKey {
  const avg = averageScores(team);
  return ENERGIES.reduce((best, k) => (avg[k] > avg[best] ? k : best), "red" as EnergyKey);
}

function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

export function detectFrictionPairs(team: Person[]): FrictionPair[] {
  const pairs: FrictionPair[] = [];
  const norm = (s: string) => s.toLowerCase().trim();
  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      const a = team[i];
      const b = team[j];
      const aDrivers = new Set(a.drivers.map(norm));
      const bDetractors = new Set(b.detractors.map(norm));
      const bDrivers = new Set(b.drivers.map(norm));
      const aDetractors = new Set(a.detractors.map(norm));
      const aTriggersB: string[] = [];
      aDrivers.forEach((d) => {
        if (bDetractors.has(d)) aTriggersB.push(d);
      });
      const bTriggersA: string[] = [];
      bDrivers.forEach((d) => {
        if (aDetractors.has(d)) bTriggersA.push(d);
      });
      const reasons: string[] = [];
      if (aTriggersB.length > 0) {
        reasons.push(
          `${a.name.split(" ")[0]}'s drive for "${aTriggersB[0]}" is on ${b.name.split(" ")[0]}'s drain list`,
        );
      }
      if (bTriggersA.length > 0) {
        reasons.push(
          `${b.name.split(" ")[0]}'s drive for "${bTriggersA[0]}" is on ${a.name.split(" ")[0]}'s drain list`,
        );
      }
      if (a.primary === b.primary && a.primary === "red") {
        reasons.push("Two pure Drivers — watch for pace and authority clashes");
      }
      if (a.primary === b.primary && a.primary === "yellow") {
        reasons.push("Two pure Connectors — risk of low follow-through");
      }
      if (a.primary === b.primary && a.primary === "blue") {
        reasons.push("Two pure Analysts — risk of analysis paralysis");
      }
      if (reasons.length > 0) {
        pairs.push({ a, b, reason: reasons.join("; ") });
      }
    }
  }
  return pairs;
}

export function detectEnergyGaps(team: Person[]): EnergyGap[] {
  if (team.length === 0) return [];
  const avg = averageScores(team);
  const gaps: EnergyGap[] = [];
  ENERGIES.forEach((k) => {
    if (avg[k] < 35) {
      gaps.push({
        energy: k,
        severity: "undersupplied",
        detail: `Team average ${avg[k]}% — under the 35% threshold for healthy ${k === "red" ? "Drive" : k === "yellow" ? "Spark" : k === "green" ? "Steady" : "Lens"} representation.`,
      });
    } else if (avg[k] > 75) {
      gaps.push({
        energy: k,
        severity: "oversupplied",
        detail: `Team average ${avg[k]}% — risks of ${k === "red" ? "drive overload (burnout, conflict)" : k === "yellow" ? "spark overload (low follow-through)" : k === "green" ? "steady overload (slow decisions)" : "lens overload (analysis paralysis)"}.`,
      });
    }
  });
  return gaps;
}

export function calculateHarmony(team: Person[]): TeamHarmony {
  if (team.length === 0) {
    return {
      score: 0,
      balanceScore: 0,
      coverageScore: 0,
      frictionScore: 0,
      band: "At risk",
      bandColor: "#E8402A",
    };
  }

  const avg = averageScores(team);
  const cov = coefficientOfVariation(Object.values(avg));
  const balanceScore = Math.round(Math.max(0, 40 - cov * 100));

  const uniqueQuadrants = new Set(team.map((p) => POSITION_OF_PRIMARY[p.primary]));
  const coverageScore = Math.round(((uniqueQuadrants.size - 1) * 30) / 3 + (uniqueQuadrants.size > 0 ? 5 : 0));

  const friction = detectFrictionPairs(team);
  const frictionScore = Math.max(0, 30 - friction.length * 6);

  const totalScore = Math.min(100, balanceScore + coverageScore + frictionScore);
  const bandEntry =
    HARMONY_BANDS.find((b) => totalScore >= b.min) ?? HARMONY_BANDS[HARMONY_BANDS.length - 1];

  return {
    score: totalScore,
    balanceScore,
    coverageScore,
    frictionScore,
    band: bandEntry.band,
    bandColor: bandEntry.color,
  };
}

export function calculateConflictCost(
  team: Person[],
  harmonyScore: number,
  monthsRunning = 3,
  avgDayRate = 950,
): ConflictCost {
  let productivityLossPct: number;
  let rationale: string;
  if (harmonyScore >= 85) {
    productivityLossPct = 0;
    rationale = "Excellent harmony — no projected friction cost. Run the team as composed.";
  } else if (harmonyScore >= 70) {
    productivityLossPct = 0.02;
    rationale = "Healthy band — ~2% productivity loss to small frictions. Worth one kickoff conversation.";
  } else if (harmonyScore >= 50) {
    productivityLossPct = 0.05;
    rationale = "Watch band — ~5% productivity loss to interpersonal friction. Pair-coaching recommended.";
  } else {
    productivityLossPct = 0.1;
    rationale = "At-risk band — 10%+ productivity loss is the industry norm. Consider re-composition.";
  }
  const billableDaysPerMonth = 18;
  const teamDailyRate = team.length * avgDayRate;
  const totalProjectBillable = teamDailyRate * billableDaysPerMonth * monthsRunning;
  const euros = Math.round((totalProjectBillable * productivityLossPct) / 1000) * 1000;
  return { productivityLossPct, euros, rationale };
}

export function suggestSwaps(
  team: Person[],
  pool: Person[],
  count = 3,
): SuggestedSwap[] {
  if (team.length === 0) return [];
  const gaps = detectEnergyGaps(team).filter((g) => g.severity === "undersupplied");
  if (gaps.length === 0) return [];

  const teamIds = new Set(team.map((p) => p.id));
  const candidates = pool.filter((p) => !teamIds.has(p.id));

  const ranked = candidates
    .map((p) => {
      let score = 0;
      let reason = "";
      gaps.forEach((g) => {
        if (p.primary === g.energy) {
          score += p.scores[g.energy];
          reason = `Primary ${g.energy === "red" ? "Drive" : g.energy === "yellow" ? "Spark" : g.energy === "green" ? "Steady" : "Lens"} (${p.scores[g.energy]}%) — fills the missing energy directly.`;
        } else if (p.secondary === g.energy && !reason) {
          score += p.scores[g.energy] * 0.6;
          reason = `Secondary ${g.energy === "red" ? "Drive" : g.energy === "yellow" ? "Spark" : g.energy === "green" ? "Steady" : "Lens"} (${p.scores[g.energy]}%) — broadens the missing energy without dominating.`;
        }
      });
      return { candidate: p, score, reason };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return ranked.map((s) => ({ candidate: s.candidate, reason: s.reason }));
}

export type MarketName = "Stockholm" | "Oslo" | "Copenhagen" | "Helsinki";

export const NORDIC_MARKETS: MarketName[] = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"];

export interface MarketCulture {
  name: MarketName;
  count: number;
  averageScores: Record<EnergyKey, number>;
  dominantEnergy: EnergyKey;
  averageUtilisation: number;
  averageLoyalty: number;
  topCapabilities: string[];
  bestFor: string;
  watchFor: string;
  signature: string;
}

function dominantLabel(k: EnergyKey): string {
  if (k === "red") return "Drive";
  if (k === "yellow") return "Spark";
  if (k === "green") return "Steady";
  return "Lens";
}

export function computeMarketCulture(
  market: MarketName,
  enriched: PersonWithCapacity[],
): MarketCulture {
  const inMarket = enriched.filter((p) => p.location === market);
  if (inMarket.length === 0) {
    return {
      name: market,
      count: 0,
      averageScores: { red: 0, yellow: 0, green: 0, blue: 0 },
      dominantEnergy: "yellow",
      averageUtilisation: 0,
      averageLoyalty: 0,
      topCapabilities: [],
      bestFor: "No data yet.",
      watchFor: "No data yet.",
      signature: `${market} has no consultants on record yet.`,
    };
  }

  const avg = averageScores(inMarket);
  const dominant = ENERGIES.reduce(
    (best, k) => (avg[k] > avg[best] ? k : best),
    "red" as EnergyKey,
  );
  const second = ENERGIES.filter((k) => k !== dominant).reduce(
    (best, k) => (avg[k] > avg[best] ? k : best),
    ENERGIES.find((k) => k !== dominant) ?? "red",
  );

  const averageUtilisation = Math.round(
    inMarket.reduce((s, p) => s + p.utilisation, 0) / inMarket.length,
  );
  const averageLoyalty = Math.round(
    inMarket.reduce((s, p) => s + p.capacity.loyaltyScore, 0) / inMarket.length,
  );

  const capCounts = new Map<string, number>();
  inMarket.forEach((p) =>
    p.capabilities.forEach((c) => capCounts.set(c, (capCounts.get(c) ?? 0) + 1)),
  );
  const topCapabilities = Array.from(capCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cap]) => cap);

  const bestFor = buildBestFor(dominant, second);
  const watchFor = buildWatchFor(dominant, avg);
  const signature = buildSignature(market, dominant, second, avg, inMarket.length);

  return {
    name: market,
    count: inMarket.length,
    averageScores: avg,
    dominantEnergy: dominant,
    averageUtilisation,
    averageLoyalty,
    topCapabilities,
    bestFor,
    watchFor,
    signature,
  };
}

function buildBestFor(dominant: EnergyKey, second: EnergyKey): string {
  const pairs: Record<string, string> = {
    "red-yellow": "Client-facing pitches and pace-led engagements where momentum wins.",
    "red-blue":   "High-stakes turnarounds and rigorous delivery under pressure.",
    "red-green":  "Senior leadership programmes where steady relationships need decisive direction.",
    "yellow-red": "Pitches, workshops and new-business sprints with executive audiences.",
    "yellow-green": "Service design, customer experience and long-term client partnerships.",
    "yellow-blue":  "Strategy work that needs both creative energy and analytical depth.",
    "green-yellow": "Service design and people-centred change programmes.",
    "green-blue":   "Long-form delivery, programme governance and complex multi-stakeholder work.",
    "green-red":    "Steady delivery anchored by a clear leadership voice.",
    "blue-red":   "Critical analytical engagements that need decisive recommendations.",
    "blue-green": "Research, data and architecture work with a long delivery horizon.",
    "blue-yellow":"Analytical engagements that need a client-facing communicator.",
  };
  const key = `${dominant}-${second}`;
  return pairs[key] ?? "Balanced engagements across the spectrum.";
}

function buildWatchFor(dominant: EnergyKey, avg: Record<EnergyKey, number>): string {
  const missing = ENERGIES.filter((k) => avg[k] < 35).map(dominantLabel);
  if (missing.length === 0) {
    return `Well-balanced market — no single colour is dangerously light. Monitor for burnout if utilisation creeps above 88%.`;
  }
  if (missing.length === 1) {
    return `Light on ${missing[0]} — be wary of staffing engagements that lean heavily into ${missing[0]} territory from this market alone.`;
  }
  return `Light on ${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]} — consider cross-market staffing for engagements needing those energies.`;
}

function buildSignature(
  market: MarketName,
  dominant: EnergyKey,
  second: EnergyKey,
  avg: Record<EnergyKey, number>,
  size: number,
): string {
  return `${market} runs ${dominantLabel(dominant)}–${dominantLabel(second)} (avg ${dominantLabel(dominant)} ${avg[dominant]}%, ${dominantLabel(second)} ${avg[second]}%) across ${size} consultant${size === 1 ? "" : "s"}.`;
}

const ENERGY_FRICTION_MATRIX: Record<EnergyKey, Record<EnergyKey, number>> = {
  red:    { red: 25, yellow: 10, green: 35, blue: 20 },
  yellow: { red: 10, yellow: 20, green: 5,  blue: 30 },
  green:  { red: 35, yellow: 5,  green: 15, blue: 10 },
  blue:   { red: 20, yellow: 30, green: 10, blue: 25 },
};

export function crossMarketFriction(a: MarketCulture, b: MarketCulture): {
  pct: number;
  label: "Low" | "Moderate" | "High";
  note: string;
} {
  const pct = ENERGY_FRICTION_MATRIX[a.dominantEnergy][b.dominantEnergy];
  let label: "Low" | "Moderate" | "High" = "Low";
  if (pct >= 30) label = "High";
  else if (pct >= 15) label = "Moderate";

  const note =
    label === "Low"
      ? `${dominantLabel(a.dominantEnergy)} and ${dominantLabel(b.dominantEnergy)} sit close on the wheel — should collaborate easily.`
      : label === "Moderate"
        ? `${dominantLabel(a.dominantEnergy)} and ${dominantLabel(b.dominantEnergy)} need explicit handoffs and shared terminology to avoid drift.`
        : `${dominantLabel(a.dominantEnergy)} and ${dominantLabel(b.dominantEnergy)} are wheel opposites — assume friction at kickoff and pair-coach.`;

  return { pct, label, note };
}

export interface SavedTeamSummary {
  id: number;
  name: string;
  description: string;
  client: string | null;
  members: Array<{ person: Person; role: string }>;
}

export interface EnrichedTeamSummary extends SavedTeamSummary {
  harmony: TeamHarmony;
  conflictCost: ConflictCost;
  dominant: EnergyKey;
  energyGaps: EnergyGap[];
  averageScores: Record<EnergyKey, number>;
}

export function enrichTeam(team: SavedTeamSummary, monthsRunning = 3): EnrichedTeamSummary {
  const people = team.members.map((m) => m.person);
  const harmony = calculateHarmony(people);
  const conflictCost = calculateConflictCost(people, harmony.score, monthsRunning);
  return {
    ...team,
    harmony,
    conflictCost,
    dominant: dominantEnergy(people),
    energyGaps: detectEnergyGaps(people),
    averageScores: averageScores(people),
  };
}

export function teamRiskMix(team: Person[], enriched: PersonWithCapacity[]) {
  const enrichedById = new Map(enriched.map((p) => [p.id, p]));
  let high = 0;
  let medium = 0;
  let watch = 0;
  team.forEach((p) => {
    const cap = enrichedById.get(p.id)?.capacity;
    if (!cap) return;
    if (cap.riskLevel === "high") high += 1;
    else if (cap.riskLevel === "medium") medium += 1;
    else if (cap.riskLevel === "watch") watch += 1;
  });
  return { high, medium, watch };
}

export type { RiskLevel };
