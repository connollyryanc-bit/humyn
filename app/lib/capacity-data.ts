import { EnergyKey, Person, energy, people } from "./people-data";

export type RiskLevel = "high" | "medium" | "watch" | "low";

export interface CapacityData {
  benchDays: number;
  loyaltyScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  recommendedAction: string;
  replacementCost: number;
  lostRevenue3Months: number;
  onboardingCost: number;
  keyClientAtRisk: string | null;
  currentProject: string | null;
  overloadRisk: boolean;
}

export type PersonWithCapacity = Person & { capacity: CapacityData };

export const capacityData: Record<number, CapacityData> = {
  1: {
    benchDays: 0,
    loyaltyScore: 88,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction:
      "Linnea is stable and highly engaged at 92% utilisation. Monitor for overload — check in on workload in 4 weeks.",
    replacementCost: 110000,
    lostRevenue3Months: 210000,
    onboardingCost: 50000,
    keyClientAtRisk: "Payflow — €1.4m account, Linnea is primary relationship",
    currentProject: "Payflow CX Transformation",
    overloadRisk: true,
  },
  2: {
    benchDays: 7,
    loyaltyScore: 71,
    riskLevel: "low",
    riskReasons: [
      "7 days bench — manageable for Analyst profile",
      "Strong pipeline — likely allocated within 2 weeks",
    ],
    recommendedAction:
      "Offer the Telenor data strategy brief — analytical complexity suits his Analyst profile perfectly.",
    replacementCost: 95000,
    lostRevenue3Months: 123000,
    onboardingCost: 42000,
    keyClientAtRisk: null,
    currentProject: null,
    overloadRisk: false,
  },
  3: {
    benchDays: 0,
    loyaltyScore: 82,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction:
      "Pernille is well allocated and engaged. Consider her for the UX lead role on the Nordmode brief.",
    replacementCost: 85000,
    lostRevenue3Months: 103000,
    onboardingCost: 38000,
    keyClientAtRisk: "Rail Nord — 2 year relationship built through UX work",
    currentProject: "Rail Nord Digital Platform",
    overloadRisk: false,
  },
  4: {
    benchDays: 14,
    loyaltyScore: 54,
    riskLevel: "medium",
    riskReasons: [
      "14 days on bench — Energizer profiles disengage fast without momentum",
      "No pitch work since Q1 — needs creative strategic engagement",
      "Second month below 80% utilisation",
    ],
    recommendedAction:
      "Get Aksel onto pitch work immediately. He is exactly what the Baltica Bank brand brief needs — Energizer energy, strategy background, available now. This is a high risk of losing him.",
    replacementCost: 78000,
    lostRevenue3Months: 76000,
    onboardingCost: 35000,
    keyClientAtRisk: "Polar Air — relationship Aksel built over 18 months",
    currentProject: null,
    overloadRisk: false,
  },
  5: {
    benchDays: 0,
    loyaltyScore: 84,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction:
      "Henna is stable at 88% utilisation. Strong performer — ensure she is considered for the data lead opening.",
    replacementCost: 82000,
    lostRevenue3Months: 63000,
    onboardingCost: 36000,
    keyClientAtRisk: null,
    currentProject: "Kestrel Bank Analytics",
    overloadRisk: true,
  },
  6: {
    benchDays: 11,
    loyaltyScore: 61,
    riskLevel: "watch",
    riskReasons: [
      "11 days bench — approaching risk threshold for Analyst profile",
      "Last two projects were below seniority level",
      "Analyst profiles need intellectual challenge — watch for disengagement",
    ],
    recommendedAction:
      "Erik needs a technically complex brief. Consider him for the cloud architecture work coming from Northlink Telecom — it is exactly the kind of problem that will re-engage an Analyst profile.",
    replacementCost: 72000,
    lostRevenue3Months: 81000,
    onboardingCost: 33000,
    keyClientAtRisk: null,
    currentProject: null,
    overloadRisk: false,
  },
  7: {
    benchDays: 0,
    loyaltyScore: 79,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction:
      "Saga is well allocated. Her Energizer energy is valuable on the Hemma Living account — protect that relationship.",
    replacementCost: 68000,
    lostRevenue3Months: 69000,
    onboardingCost: 31000,
    keyClientAtRisk: "Hemma Living — Saga is key creative relationship",
    currentProject: "Hemma Living Experience Platform",
    overloadRisk: false,
  },
  8: {
    benchDays: 0,
    loyaltyScore: 86,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction:
      "Tobias is performing well and highly engaged. At 86% utilisation with a Harmoniser profile he is in a good place.",
    replacementCost: 88000,
    lostRevenue3Months: 117000,
    onboardingCost: 40000,
    keyClientAtRisk: "Tidewater Shipping — delivery relationship",
    currentProject: "Tidewater Shipping Logistics Platform",
    overloadRisk: false,
  },
  9: {
    benchDays: 9,
    loyaltyScore: 63,
    riskLevel: "watch",
    riskReasons: [
      "9 days bench — Energizer profile approaching risk window",
      "Junior to mid transition — needs mentorship and visible projects",
      "Low revenue figures may reflect underutilisation of her actual skill",
    ],
    recommendedAction:
      "Pair Ida with a senior Energizer mentor. Get her onto a client-facing project where she can develop relationships. She has strong potential that is currently underutilised.",
    replacementCost: 52000,
    lostRevenue3Months: 49000,
    onboardingCost: 25000,
    keyClientAtRisk: null,
    currentProject: null,
    overloadRisk: false,
  },
  10: {
    benchDays: 21,
    loyaltyScore: 34,
    riskLevel: "high",
    riskReasons: [
      "21 days on bench — critical for any profile type",
      "Utilisation at 59% — second month running",
      "Analyst profile without intellectual challenge disengages permanently",
      "No project pipeline visibility for next 4 weeks",
    ],
    recommendedAction:
      "Urgent — speak with Niko this week. 21 days bench for an Analyst profile is a serious flight risk. The Northlink Telecom cloud architecture brief is perfect for him. If no allocation in 5 working days the risk of losing him becomes very high.",
    replacementCost: 65000,
    lostRevenue3Months: 42000,
    onboardingCost: 28000,
    keyClientAtRisk: null,
    currentProject: null,
    overloadRisk: false,
  },
  11: {
    benchDays: 0,
    loyaltyScore: 91,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction:
      "Astrid is one of the highest performers on the team. Protect her relationship with the Nordmode account at all costs.",
    replacementCost: 120000,
    lostRevenue3Months: 165000,
    onboardingCost: 55000,
    keyClientAtRisk: "Nordmode — €1.1m account, Astrid is sole relationship owner",
    currentProject: "Nordmode Commerce Transformation",
    overloadRisk: false,
  },
  12: {
    benchDays: 0,
    loyaltyScore: 77,
    riskLevel: "low",
    riskReasons: [],
    recommendedAction:
      "Magnus is stable. As Engineering Manager his Driver energy is well placed — ensure he has visibility on the upcoming Northlink Telecom brief.",
    replacementCost: 90000,
    lostRevenue3Months: 93000,
    onboardingCost: 41000,
    keyClientAtRisk: "Ardent Motors — engineering relationship",
    currentProject: "Ardent Motors Connected Platform",
    overloadRisk: false,
  },
};

export const riskTone: Record<
  RiskLevel,
  { color: string; bg: string; text: string; border: string; label: string; icon: string }
> = {
  high:   { color: "#F23D7A", bg: "#FFE8F0", text: "#B0154F", border: "#FFC2D7", label: "High risk",   icon: "🔴" },
  medium: { color: "#FF9F5A", bg: "#FFF0E4", text: "#A04A0C", border: "#FFD2B0", label: "Medium risk", icon: "🟡" },
  watch:  { color: "#9B7CFF", bg: "#F7F7FA", text: "#5B37D6", border: "#D2C5FF", label: "Watch",       icon: "👁" },
  low:    { color: "#9B7CFF", bg: "#F1ECFF", text: "#5B37D6", border: "#D2C5FF", label: "Low risk",    icon: "✓" },
};

export const benchThresholds: Record<EnergyKey, number> = {
  driver: 28,
  energizer: 14,
  supporter: 21,
  analyst: 28,
};

export function formatEuros(value: number): string {
  return value >= 1000 ? `€${Math.round(value / 1000)}k` : `€${value}`;
}

export function enrichedPeople(): PersonWithCapacity[] {
  return people
    .filter((p) => capacityData[p.id])
    .map((p) => ({ ...p, capacity: capacityData[p.id] }));
}

export function loyaltyTone(score: number): { color: string; bg: string; label: string } {
  if (score >= 70) return { color: "#5B37D6", bg: "#F1ECFF", label: "Loyal" };
  if (score >= 50) return { color: "#A04A0C", bg: "#FFF0E4", label: "Soft" };
  return { color: "#B0154F", bg: "#FFE8F0", label: "Critical" };
}

export function benchTone(days: number): { color: string; label: string } {
  if (days > 14) return { color: "#F23D7A", label: "Critical" };
  if (days > 7) return { color: "#FF9F5A", label: "Watch" };
  return { color: "#9B7CFF", label: "Manageable" };
}

export function averageUtilisation(source: PersonWithCapacity[] = enrichedPeople()): number {
  if (source.length === 0) return 0;
  return Math.round(source.reduce((s, p) => s + p.utilisation, 0) / source.length);
}

export function utilisationStatTone(util: number) {
  if (util >= 80) return { color: "#5B37D6", bg: "#F1ECFF", border: "#D2C5FF", label: "On target" };
  if (util >= 70) return { color: "#A04A0C", bg: "#FFF0E4", border: "#FFD2B0", label: "Below target" };
  return { color: "#B0154F", bg: "#FFE8F0", border: "#FFC2D7", label: "At risk" };
}

export function buildWeeklyInsight(source?: PersonWithCapacity[]): string {
  const enriched = source ?? enrichedPeople();
  if (enriched.length === 0) {
    return "No people data available yet — the directory is still loading.";
  }
  const lowestLoyalty = [...enriched].sort(
    (a, b) => a.capacity.loyaltyScore - b.capacity.loyaltyScore,
  )[0];
  const flightRisks = enriched.filter(
    (p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium",
  );
  const overloads = enriched.filter((p) => p.capacity.overloadRisk);
  const avgUtil = averageUtilisation(enriched);
  const utilGap = 80 - avgUtil;

  const flightNames = flightRisks
    .map((p) => p.name.split(" ")[0])
    .join(flightRisks.length > 1 ? " and " : "");

  const overloadNames = overloads.map((p) => p.name.split(" ")[0]);

  const lowestSentence = `${lowestLoyalty.name} is the single most urgent retention call this week — loyalty score ${lowestLoyalty.capacity.loyaltyScore}, ${lowestLoyalty.capacity.benchDays} days on bench, ${energy[lowestLoyalty.primary].label} profile.`;

  const utilSentence =
    utilGap > 0
      ? `Average utilisation sits at ${avgUtil}% — ${utilGap} points below the 80% target, almost entirely driven by the ${flightRisks.length} flight risk${flightRisks.length === 1 ? "" : "s"} (${flightNames}).`
      : `Average utilisation is at ${avgUtil}%, comfortably on target despite ${flightRisks.length} flight risk${flightRisks.length === 1 ? "" : "s"} (${flightNames}).`;

  const overloadSentence =
    overloads.length === 0
      ? "No overload flags this week."
      : overloads.length === 1
        ? `${overloadNames[0]} is sustaining above 86% utilisation — high engagement can mask disengagement, so a recovery conversation is worth booking before the holidays.`
        : `${overloadNames.slice(0, -1).join(", ")} and ${overloadNames[overloadNames.length - 1]} are all sustaining above 86% utilisation — high engagement can mask disengagement, and the cost of any of them stepping back is materially higher than the cost of giving them a week off.`;

  const action = lowestLoyalty.capacity.recommendedAction;
  const recommendation = `Specific action this week: ${action}`;

  return `${lowestSentence} ${utilSentence} ${overloadSentence} ${recommendation}`;
}
