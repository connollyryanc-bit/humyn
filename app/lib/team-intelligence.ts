import { energy, EnergyKey, Person } from "./people-data";
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
  driver: "Driver",
  energizer: "Energizer",
  supporter: "Supporter",
  analyst: "Analyst",
};

const ENERGIES: EnergyKey[] = ["driver", "energizer", "supporter", "analyst"];

export function averageScores(team: Person[]): Record<EnergyKey, number> {
  if (team.length === 0) return { driver: 0, energizer: 0, supporter: 0, analyst: 0 };
  const sum = { driver: 0, energizer: 0, supporter: 0, analyst: 0 };
  team.forEach((p) => {
    sum.driver += p.scores.driver;
    sum.energizer += p.scores.energizer;
    sum.supporter += p.scores.supporter;
    sum.analyst += p.scores.analyst;
  });
  const n = team.length;
  return {
    driver: Math.round(sum.driver / n),
    energizer: Math.round(sum.energizer / n),
    supporter: Math.round(sum.supporter / n),
    analyst: Math.round(sum.analyst / n),
  };
}

export function dominantEnergy(team: Person[]): EnergyKey {
  const avg = averageScores(team);
  return ENERGIES.reduce((best, k) => (avg[k] > avg[best] ? k : best), "driver" as EnergyKey);
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
      if (a.primary === b.primary && a.primary === "driver") {
        reasons.push("Two pure Drivers — watch for pace and authority clashes");
      }
      if (a.primary === b.primary && a.primary === "energizer") {
        reasons.push("Two pure Energizers — risk of low follow-through");
      }
      if (a.primary === b.primary && a.primary === "supporter") {
        reasons.push("Two pure Supporters — risk of slow decisions");
      }
      if (a.primary === b.primary && a.primary === "analyst") {
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
        detail: `Team average ${avg[k]}% — under the 35% threshold for healthy ${energy[k].label} representation.`,
      });
    } else if (avg[k] > 75) {
      gaps.push({
        energy: k,
        severity: "oversupplied",
        detail: `Team average ${avg[k]}% — risks of ${k === "driver" ? "Driver overload (burnout, conflict)" : k === "energizer" ? "Energizer overload (low follow-through)" : k === "supporter" ? "Supporter overload (slow decisions)" : "Analyst overload (analysis paralysis)"}.`,
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

export const PRODUCTIVITY_BANDS: Array<{
  min: number;
  loss: number;
  label: string;
  rationale: string;
}> = [
  {
    min: 85,
    loss: 0,
    label: "Excellent",
    rationale: "No projected friction cost. Run the team as composed.",
  },
  {
    min: 70,
    loss: 0.02,
    label: "Healthy",
    rationale: "~2% productivity loss to small frictions. One kickoff conversation closes most of it.",
  },
  {
    min: 50,
    loss: 0.05,
    label: "Watch",
    rationale: "~5% productivity loss to interpersonal friction. Pair-coaching recommended at kickoff.",
  },
  {
    min: 0,
    loss: 0.1,
    label: "At risk",
    rationale: "10%+ productivity loss is the industry norm in this band. Consider re-composition.",
  },
];

const FALLBACK_DAY_RATE = 1500;
const BILLABLE_DAYS_PER_MONTH = 18;

export function teamCombinedDayRate(team: Person[]): number {
  return team.reduce(
    (sum, p) => sum + (p.dayRate && p.dayRate > 0 ? p.dayRate : FALLBACK_DAY_RATE),
    0,
  );
}

export function calculateConflictCost(
  team: Person[],
  harmonyScore: number,
  monthsRunning = 3,
): ConflictCost {
  const band =
    PRODUCTIVITY_BANDS.find((b) => harmonyScore >= b.min) ??
    PRODUCTIVITY_BANDS[PRODUCTIVITY_BANDS.length - 1];

  const teamDailyRate = teamCombinedDayRate(team);
  const totalProjectBillable = teamDailyRate * BILLABLE_DAYS_PER_MONTH * monthsRunning;
  const euros = Math.round((totalProjectBillable * band.loss) / 1000) * 1000;
  return {
    productivityLossPct: band.loss,
    euros,
    rationale: `${band.label} band — ${band.rationale}`,
  };
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
          reason = `Primary ${energy[g.energy].label} (${p.scores[g.energy]}%) — fills the missing energy directly.`;
        } else if (p.secondary === g.energy && !reason) {
          score += p.scores[g.energy] * 0.6;
          reason = `Secondary ${energy[g.energy].label} (${p.scores[g.energy]}%) — broadens the missing energy without dominating.`;
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
  if (k === "driver") return "Driver";
  if (k === "energizer") return "Energizer";
  if (k === "supporter") return "Supporter";
  return "Analyst";
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
      averageScores: { driver: 0, energizer: 0, supporter: 0, analyst: 0 },
      dominantEnergy: "energizer",
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
    "driver" as EnergyKey,
  );
  const second = ENERGIES.filter((k) => k !== dominant).reduce(
    (best, k) => (avg[k] > avg[best] ? k : best),
    ENERGIES.find((k) => k !== dominant) ?? "driver",
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
    "driver-energizer":     "Client-facing pitches and pace-led engagements where momentum wins.",
    "driver-analyst":       "High-stakes turnarounds and rigorous delivery under pressure.",
    "driver-supporter":     "Senior leadership programmes where steady relationships need decisive direction.",
    "energizer-driver":     "Pitches, workshops and new-business sprints with executive audiences.",
    "energizer-supporter":  "Service design, customer experience and long-term client partnerships.",
    "energizer-analyst":    "Strategy work that needs both creative energy and analytical depth.",
    "supporter-energizer":  "Service design and people-centred change programmes.",
    "supporter-analyst":    "Long-form delivery, programme governance and complex multi-stakeholder work.",
    "supporter-driver":     "Steady delivery anchored by a clear leadership voice.",
    "analyst-driver":       "Critical analytical engagements that need decisive recommendations.",
    "analyst-supporter":    "Research, data and architecture work with a long delivery horizon.",
    "analyst-energizer":    "Analytical engagements that need a client-facing communicator.",
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

// Pulse Map wheel position (clockwise from top): Driver (0°) → Energizer (90°)
// → Supporter (180°) → Analyst (270°). Energies at 180° apart on the wheel
// feel like opposites; neighbours feel close.
const WHEEL_DEGREES: Record<EnergyKey, number> = {
  driver: 0,
  energizer: 90,
  supporter: 180,
  analyst: 270,
};

function angularDistance(a: EnergyKey, b: EnergyKey): number {
  const diff = Math.abs(WHEEL_DEGREES[a] - WHEEL_DEGREES[b]);
  return Math.min(diff, 360 - diff);
}

export function crossMarketFriction(
  a: MarketCulture,
  b: MarketCulture,
): {
  pct: number;
  label: "Low" | "Moderate" | "High";
  note: string;
  why: string;
} {
  // Compute weighted wheel-distance: each pairing of energies between the two
  // markets contributes a × b weight. The result is the "average angular
  // distance" between the two market temperaments, scaled into 0–100.
  let weightedDistance = 0;
  let weightTotal = 0;
  (Object.keys(a.averageScores) as EnergyKey[]).forEach((ea) => {
    (Object.keys(b.averageScores) as EnergyKey[]).forEach((eb) => {
      const w = a.averageScores[ea] * b.averageScores[eb];
      weightedDistance += angularDistance(ea, eb) * w;
      weightTotal += w;
    });
  });

  const avgDistance = weightTotal > 0 ? weightedDistance / weightTotal : 0;
  const pct = Math.round((avgDistance / 180) * 100);

  let label: "Low" | "Moderate" | "High" = "Low";
  if (pct >= 55) label = "High";
  else if (pct >= 35) label = "Moderate";

  const note =
    label === "Low"
      ? `${dominantLabel(a.dominantEnergy)} and ${dominantLabel(b.dominantEnergy)} sit close on the Pulse wheel — collaboration should feel natural.`
      : label === "Moderate"
        ? `${dominantLabel(a.dominantEnergy)} and ${dominantLabel(b.dominantEnergy)} are off-axis — plan explicit handoffs and shared terminology at kickoff.`
        : `${dominantLabel(a.dominantEnergy)} and ${dominantLabel(b.dominantEnergy)} are wheel opposites — assume friction and pair-coach early.`;

  const why = `${a.name}: ${dominantLabel(a.dominantEnergy)} ${a.averageScores[a.dominantEnergy]}%. ${b.name}: ${dominantLabel(b.dominantEnergy)} ${b.averageScores[b.dominantEnergy]}%. Weighted wheel distance ≈ ${Math.round(avgDistance)}° of 180° max.`;

  return { pct, label, note, why };
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
