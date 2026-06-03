/**
 * Scenario Planning — predefined what-if scenarios
 *
 * Each scenario takes one or two user-tweakable inputs and projects an impact
 * across four dimensions: financial, capacity, delivery, skill.
 */

export type ScenarioKey =
  | "win-major-deal"
  | "lose-major-client"
  | "hiring-freeze"
  | "expansion"
  | "acquisition"
  | "new-capability"
  | "market-downturn"
  | "ai-productivity";

export type ImpactTone = "positive" | "warning" | "critical" | "neutral";

export interface ScenarioInput {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface ScenarioImpact {
  dimension: "financial" | "capacity" | "delivery" | "skill";
  label: string;
  baseline: string;
  projected: string;
  delta: string;
  tone: ImpactTone;
  narrative: string;
}

export interface Scenario {
  key: ScenarioKey;
  title: string;
  shortTitle: string;
  category: "growth" | "downside" | "structural" | "productivity";
  description: string;
  context: string;
  inputs: ScenarioInput[];
  /**
   * Compute impacts given the current input values. Returns four impact rows.
   */
  computeImpacts: (inputs: Record<string, number>) => ScenarioImpact[];
}

// Baseline figures referenced by every scenario
const BASELINE = {
  annualRevenue: 23_400_000,
  monthlyRevenue: 1_950_000,
  blendedMarginPct: 34.5,
  utilisationPct: 78,
  totalCapacityDays90: 12_800,
  confirmedDemandDays90: 11_200,
  workforce: 187,
  ftePerEngagement: 6,
  deliveryRiskScore: 3.4,
  skillsGapCount: 7,
};

function fmtEur(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `€${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${value < 0 ? "-" : ""}€${Math.round(Math.abs(value) / 1_000)}k`;
  return `${value < 0 ? "-" : ""}€${Math.abs(value)}`;
}

export const scenarios: Scenario[] = [
  {
    key: "win-major-deal",
    title: "Win a major deal",
    shortTitle: "Major deal win",
    category: "growth",
    description: "Land an unstaffed brief as a confirmed engagement. Project revenue, capacity hit, delivery confidence and skill demands.",
    context: "Models the impact of converting one in-pipeline opportunity into a confirmed engagement. Volvo Cars extension is the marquee example at €3.8M.",
    inputs: [
      { key: "dealValueEur", label: "Deal value",     unit: "€",   min: 200_000,  max: 5_000_000, step: 100_000, defaultValue: 3_800_000 },
      { key: "durationMonths", label: "Duration",    unit: "mo",  min: 2,        max: 24,        step: 1,        defaultValue: 12 },
      { key: "fteRequired",  label: "FTE required",  unit: "FTE", min: 2,        max: 20,        step: 1,        defaultValue: 11 },
    ],
    computeImpacts: ({ dealValueEur, durationMonths, fteRequired }) => {
      const monthlyRev = dealValueEur / durationMonths;
      const newAnnualRev = BASELINE.annualRevenue + monthlyRev * 12;
      const capacityDaysNeeded = fteRequired * 20 * Math.min(durationMonths, 3); // 90d window
      const newDemand = BASELINE.confirmedDemandDays90 + capacityDaysNeeded;
      const utilProjected = Math.min(100, Math.round((newDemand / BASELINE.totalCapacityDays90) * 100));
      const deliveryShift = fteRequired >= 8 ? "+0.4 to 3.8 (warning)" : "+0.2 to 3.6";
      return [
        {
          dimension: "financial",
          label: "Annual revenue",
          baseline: fmtEur(BASELINE.annualRevenue),
          projected: fmtEur(newAnnualRev),
          delta: `+${fmtEur(monthlyRev * 12)}`,
          tone: "positive",
          narrative: `Adds ${fmtEur(monthlyRev)}/month over ${durationMonths} months at blended margin.`,
        },
        {
          dimension: "capacity",
          label: "Utilisation",
          baseline: `${BASELINE.utilisationPct}%`,
          projected: `${utilProjected}%`,
          delta: `+${utilProjected - BASELINE.utilisationPct}pp`,
          tone: utilProjected >= 90 ? "critical" : utilProjected >= 85 ? "warning" : "positive",
          narrative: `${capacityDaysNeeded.toLocaleString()} FTE-days needed in the next 90 days. ${
            utilProjected >= 90 ? "Pushes utilisation above the burnout threshold." : "Lifts utilisation toward target."
          }`,
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: deliveryShift.split(" ")[2] ?? `${BASELINE.deliveryRiskScore} / 5`,
          delta: deliveryShift.split(" ")[0],
          tone: fteRequired >= 8 ? "warning" : "neutral",
          narrative: `${fteRequired} FTEs across ${Math.ceil(fteRequired / 4)} roles. Delivery confidence depends on closing the lead within 4 weeks.`,
        },
        {
          dimension: "skill",
          label: "Skills gap",
          baseline: `${BASELINE.skillsGapCount} critical gaps`,
          projected: `${BASELINE.skillsGapCount + 1} critical gaps`,
          delta: "+1",
          tone: "warning",
          narrative: "Adds Mobile React Native to the capability watchlist; recurring gap across three engagements.",
        },
      ];
    },
  },
  {
    key: "lose-major-client",
    title: "Lose a major client",
    shortTitle: "Major client loss",
    category: "downside",
    description: "Simulate losing a top-3 client mid-contract. Project the revenue cliff, bench impact, and rebound capacity.",
    context: "Worst-case stress test. Klarna is currently the largest single account at €2.4M ARR; models that scale of disruption.",
    inputs: [
      { key: "annualRevenueLossEur", label: "Annualised revenue lost", unit: "€",   min: 500_000, max: 5_000_000, step: 100_000, defaultValue: 2_400_000 },
      { key: "fteOnContract",       label: "FTEs on the contract",     unit: "FTE", min: 3,       max: 25,        step: 1,        defaultValue: 9 },
    ],
    computeImpacts: ({ annualRevenueLossEur, fteOnContract }) => {
      const newAnnualRev = BASELINE.annualRevenue - annualRevenueLossEur;
      const benchCostPerMonth = fteOnContract * 12_000; // €12k/month avg fully-loaded
      const benchCost3m = benchCostPerMonth * 3;
      const newUtil = Math.max(60, BASELINE.utilisationPct - Math.round((fteOnContract / BASELINE.workforce) * 100));
      return [
        {
          dimension: "financial",
          label: "Annual revenue",
          baseline: fmtEur(BASELINE.annualRevenue),
          projected: fmtEur(newAnnualRev),
          delta: `-${fmtEur(annualRevenueLossEur)}`,
          tone: "critical",
          narrative: `${Math.round((annualRevenueLossEur / BASELINE.annualRevenue) * 100)}% of group revenue. Bench cost adds ${fmtEur(benchCost3m)} over the rebound window.`,
        },
        {
          dimension: "capacity",
          label: "Utilisation",
          baseline: `${BASELINE.utilisationPct}%`,
          projected: `${newUtil}%`,
          delta: `-${BASELINE.utilisationPct - newUtil}pp`,
          tone: "critical",
          narrative: `${fteOnContract} FTEs onto bench immediately. Estimated 3-month rebound to redeploy. Workforce Optimization recommends partner work to bridge.`,
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: `${(BASELINE.deliveryRiskScore - 0.4).toFixed(1)} / 5`,
          delta: "-0.4",
          tone: "positive",
          narrative: "Risk falls because less concurrent delivery — but morale and retention risk rises in proportion.",
        },
        {
          dimension: "skill",
          label: "Skills inventory",
          baseline: `${BASELINE.workforce} FTEs`,
          projected: `${BASELINE.workforce} FTEs (${fteOnContract} unbilled)`,
          delta: "+upskilling window",
          tone: "neutral",
          narrative: "Window opens for the workforce-optimization upskilling programme. Convert the bench into AI/ML and Mobile RN capability.",
        },
      ];
    },
  },
  {
    key: "hiring-freeze",
    title: "Hiring freeze",
    shortTitle: "Hiring freeze",
    category: "downside",
    description: "Pause all open hires for a defined period. Project the capability gap and pipeline opportunity loss.",
    context: "Board-imposed freeze in response to a downturn or to consolidate margin. Models the gap that opens between demand and supply.",
    inputs: [
      { key: "freezeMonths",  label: "Freeze duration", unit: "mo",     min: 3,  max: 18, step: 1, defaultValue: 6 },
      { key: "openRolesAtStart", label: "Open roles paused", unit: "roles", min: 2, max: 15, step: 1, defaultValue: 6 },
    ],
    computeImpacts: ({ freezeMonths, openRolesAtStart }) => {
      const missedHires = openRolesAtStart + Math.round(freezeMonths * 0.6); // hires deferred
      const opportunityLoss = missedHires * 220_000; // avg revenue per FTE annualised, prorated
      const newSkillsGap = BASELINE.skillsGapCount + Math.min(4, Math.round(freezeMonths / 2));
      return [
        {
          dimension: "financial",
          label: "Opportunity loss",
          baseline: fmtEur(0),
          projected: `-${fmtEur(opportunityLoss)}`,
          delta: `-${fmtEur(opportunityLoss)}`,
          tone: "warning",
          narrative: `${missedHires} hires deferred over ${freezeMonths} months. Revenue impact assumes each FTE generates baseline revenue prorated.`,
        },
        {
          dimension: "capacity",
          label: "Utilisation",
          baseline: `${BASELINE.utilisationPct}%`,
          projected: `${Math.min(100, BASELINE.utilisationPct + Math.round(freezeMonths * 1.2))}%`,
          delta: `+${Math.round(freezeMonths * 1.2)}pp`,
          tone: "warning",
          narrative: "Existing workforce absorbs more demand. Burnout risk rises across high-criticality practices.",
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: `${(BASELINE.deliveryRiskScore + 0.5).toFixed(1)} / 5`,
          delta: "+0.5",
          tone: "critical",
          narrative: "Critical practices (Data & AI, Product Design) are already short. Freeze locks the shortage in.",
        },
        {
          dimension: "skill",
          label: "Skills gap",
          baseline: `${BASELINE.skillsGapCount} critical gaps`,
          projected: `${newSkillsGap} critical gaps`,
          delta: `+${newSkillsGap - BASELINE.skillsGapCount}`,
          tone: "critical",
          narrative: "Demand for LLM/Gen AI and Mobile RN continues to climb during the freeze. Upskilling becomes the only available lever.",
        },
      ];
    },
  },
  {
    key: "expansion",
    title: "Open a new market",
    shortTitle: "Market expansion",
    category: "growth",
    description: "Open a new geographic market or office. Project the cost ramp, revenue ramp, and capability transfer needed.",
    context: "Models a deliberate geographic expansion — e.g. opening in Amsterdam or Berlin — at a defined headcount target.",
    inputs: [
      { key: "targetHeadcount",  label: "Target headcount", unit: "FTE",  min: 8,   max: 40, step: 1,  defaultValue: 20 },
      { key: "rampMonths",       label: "Ramp period",      unit: "mo",   min: 6,   max: 24, step: 1,  defaultValue: 12 },
      { key: "openingCostEur",   label: "Opening cost",     unit: "€",    min: 200_000, max: 2_000_000, step: 50_000, defaultValue: 900_000 },
    ],
    computeImpacts: ({ targetHeadcount, rampMonths, openingCostEur }) => {
      const annualRevAtMaturity = targetHeadcount * 220_000;
      const year1Revenue = annualRevAtMaturity * 0.45; // ramps to ~45% in year 1
      const totalCostYear1 = openingCostEur + targetHeadcount * 0.6 * 95_000; // partial-year salary
      return [
        {
          dimension: "financial",
          label: "Year-1 net",
          baseline: fmtEur(0),
          projected: fmtEur(year1Revenue - totalCostYear1),
          delta: fmtEur(year1Revenue - totalCostYear1),
          tone: year1Revenue - totalCostYear1 < 0 ? "warning" : "positive",
          narrative: `Revenue ramps to ${fmtEur(year1Revenue)} in year 1, cost ${fmtEur(totalCostYear1)}. Annual revenue at maturity: ${fmtEur(annualRevAtMaturity)}.`,
        },
        {
          dimension: "capacity",
          label: "Workforce",
          baseline: `${BASELINE.workforce} FTEs`,
          projected: `${BASELINE.workforce + targetHeadcount} FTEs`,
          delta: `+${targetHeadcount}`,
          tone: "positive",
          narrative: `${targetHeadcount} new FTEs over ${rampMonths} months. Mix of senior transfers from existing markets + local hires.`,
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: `${(BASELINE.deliveryRiskScore + 0.3).toFixed(1)} / 5`,
          delta: "+0.3",
          tone: "warning",
          narrative: "Senior transfers thin existing markets during the transition. Buddy / mentor coverage needed.",
        },
        {
          dimension: "skill",
          label: "Capability transfer",
          baseline: `${BASELINE.skillsGapCount} critical gaps`,
          projected: `${BASELINE.skillsGapCount + 2} critical gaps`,
          delta: "+2",
          tone: "neutral",
          narrative: "New market lacks local Data & AI + Mobile RN capability initially. Plan to bridge with cross-market deployment for 12 months.",
        },
      ];
    },
  },
  {
    key: "acquisition",
    title: "Acquire a smaller firm",
    shortTitle: "Acquisition",
    category: "structural",
    description: "Acquire a complementary professional-services firm. Project combined revenue, integration cost, capability uplift.",
    context: "Strategic acquisition for capability, geography or client portfolio. Includes integration overhead.",
    inputs: [
      { key: "targetHeadcount",  label: "Target firm headcount", unit: "FTE", min: 10, max: 80, step: 5,  defaultValue: 30 },
      { key: "targetArrEur",     label: "Target firm ARR",       unit: "€",   min: 1_500_000, max: 15_000_000, step: 500_000, defaultValue: 5_400_000 },
      { key: "purchasePriceEur", label: "Purchase price",         unit: "€",   min: 3_000_000, max: 40_000_000, step: 500_000, defaultValue: 12_000_000 },
    ],
    computeImpacts: ({ targetHeadcount, targetArrEur, purchasePriceEur }) => {
      const combinedRev = BASELINE.annualRevenue + targetArrEur;
      const integrationCost = purchasePriceEur * 0.08 + targetHeadcount * 4_000;
      const dilutedMargin = (BASELINE.annualRevenue * BASELINE.blendedMarginPct + targetArrEur * 30) / combinedRev;
      return [
        {
          dimension: "financial",
          label: "Combined annual revenue",
          baseline: fmtEur(BASELINE.annualRevenue),
          projected: fmtEur(combinedRev),
          delta: `+${fmtEur(targetArrEur)}`,
          tone: "positive",
          narrative: `Combined firm at ${fmtEur(combinedRev)} ARR. Integration cost ${fmtEur(integrationCost)} year 1. Blended margin shifts to ${dilutedMargin.toFixed(1)}%.`,
        },
        {
          dimension: "capacity",
          label: "Workforce",
          baseline: `${BASELINE.workforce} FTEs`,
          projected: `${BASELINE.workforce + targetHeadcount} FTEs`,
          delta: `+${targetHeadcount}`,
          tone: "positive",
          narrative: `Onboards ${targetHeadcount} FTEs. Cultural integration is the long pole — expect 12-18 months to full harmony.`,
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: `${(BASELINE.deliveryRiskScore + 0.7).toFixed(1)} / 5`,
          delta: "+0.7",
          tone: "critical",
          narrative: "Integration creates real delivery risk. Existing engagements affected by team reshuffles. Recommend leadership-pair coaching across both firms.",
        },
        {
          dimension: "skill",
          label: "Capability uplift",
          baseline: `${BASELINE.skillsGapCount} critical gaps`,
          projected: `${Math.max(2, BASELINE.skillsGapCount - 3)} critical gaps`,
          delta: "−3",
          tone: "positive",
          narrative: "Inherit specialist capability (typical acquisitions add 2-3 critical skill closures). Best fit if target is AI/ML or Mobile-RN heavy.",
        },
      ];
    },
  },
  {
    key: "new-capability",
    title: "Launch a new capability",
    shortTitle: "New capability",
    category: "structural",
    description: "Stand up a new practice (e.g. Gen AI, Cyber, Quantum). Project investment, breakeven, and demand uplift.",
    context: "Models a deliberate capability investment without acquisition — bring 3-8 specialists in, plus internal training.",
    inputs: [
      { key: "seedHires",         label: "Seed hires",     unit: "FTE",   min: 2, max: 12, step: 1,    defaultValue: 4 },
      { key: "rampMonths",         label: "Ramp period",     unit: "mo",    min: 6, max: 24, step: 1,    defaultValue: 12 },
      { key: "internalReskillCount", label: "Internal upskill",  unit: "FTE", min: 0, max: 12, step: 1,    defaultValue: 4 },
    ],
    computeImpacts: ({ seedHires, rampMonths, internalReskillCount }) => {
      const investment = seedHires * 180_000 + internalReskillCount * 24_000;
      const year2Revenue = (seedHires + internalReskillCount) * 240_000;
      const year2Margin = year2Revenue * 0.32;
      return [
        {
          dimension: "financial",
          label: "Year-2 contribution",
          baseline: fmtEur(0),
          projected: fmtEur(year2Margin),
          delta: `+${fmtEur(year2Margin)}`,
          tone: "positive",
          narrative: `Year-1 investment ${fmtEur(investment)}. Year-2 revenue contribution ${fmtEur(year2Revenue)} at 32% margin.`,
        },
        {
          dimension: "capacity",
          label: "Workforce",
          baseline: `${BASELINE.workforce} FTEs`,
          projected: `${BASELINE.workforce + seedHires} FTEs`,
          delta: `+${seedHires} external · +${internalReskillCount} reskilled`,
          tone: "neutral",
          narrative: `${seedHires} senior hires + ${internalReskillCount} internal reskillers over ${rampMonths} months.`,
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: `${BASELINE.deliveryRiskScore.toFixed(1)} / 5`,
          delta: "0.0",
          tone: "neutral",
          narrative: "Capability launch doesn't materially shift existing-engagement risk — separate workstream.",
        },
        {
          dimension: "skill",
          label: "Capability uplift",
          baseline: `${BASELINE.skillsGapCount} critical gaps`,
          projected: `${Math.max(1, BASELINE.skillsGapCount - 2)} critical gaps`,
          delta: "−2",
          tone: "positive",
          narrative: "Directly closes 2 of the 7 critical gaps when targeted at LLM/Gen AI or Mobile-RN.",
        },
      ];
    },
  },
  {
    key: "market-downturn",
    title: "Market downturn",
    shortTitle: "Downturn",
    category: "downside",
    description: "Broad market pullback. Project deal-close rate drop, pipeline thinning, margin compression.",
    context: "Models a recessionary environment where pipeline win rates fall and clients push for discounts on renewals.",
    inputs: [
      { key: "winRateDropPp",   label: "Win-rate drop",        unit: "pp", min: 5,  max: 35, step: 1,  defaultValue: 15 },
      { key: "discountPressurePp", label: "Rate-card discount", unit: "pp", min: 2,  max: 18, step: 1,  defaultValue: 8 },
    ],
    computeImpacts: ({ winRateDropPp, discountPressurePp }) => {
      const revenueDrop = BASELINE.annualRevenue * (winRateDropPp / 100) * 0.6; // 60% of win-rate drop materialises as revenue
      const marginDrop = discountPressurePp * 0.6; // pp of margin lost
      const newMargin = BASELINE.blendedMarginPct - marginDrop;
      return [
        {
          dimension: "financial",
          label: "Annual revenue",
          baseline: fmtEur(BASELINE.annualRevenue),
          projected: fmtEur(BASELINE.annualRevenue - revenueDrop),
          delta: `-${fmtEur(revenueDrop)}`,
          tone: "critical",
          narrative: `Win-rate drop ${winRateDropPp}pp reduces revenue by ~${fmtEur(revenueDrop)}. Margin compresses to ${newMargin.toFixed(1)}%.`,
        },
        {
          dimension: "capacity",
          label: "Utilisation",
          baseline: `${BASELINE.utilisationPct}%`,
          projected: `${Math.max(58, BASELINE.utilisationPct - Math.round(winRateDropPp / 1.5))}%`,
          delta: `-${Math.round(winRateDropPp / 1.5)}pp`,
          tone: "critical",
          narrative: "Bench widens as pipeline thins. Bench cost projected to double in the worst quarter.",
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: `${(BASELINE.deliveryRiskScore - 0.2).toFixed(1)} / 5`,
          delta: "-0.2",
          tone: "neutral",
          narrative: "Risk falls slightly as concurrent delivery softens — masked by client tension over fixed-price scope.",
        },
        {
          dimension: "skill",
          label: "Skills posture",
          baseline: `${BASELINE.skillsGapCount} critical gaps`,
          projected: `${BASELINE.skillsGapCount} critical gaps`,
          delta: "no change",
          tone: "neutral",
          narrative: "Downturn doesn't change skills demand structurally — but opportunity to upskill the widening bench.",
        },
      ];
    },
  },
  {
    key: "ai-productivity",
    title: "AI productivity uplift",
    shortTitle: "AI productivity",
    category: "productivity",
    description: "Internal AI tooling lifts average consultant productivity. Project margin uplift and capacity release.",
    context: "Models the impact of AI-driven productivity tools — coding co-pilots, design automation, AI-assisted research — across the workforce.",
    inputs: [
      { key: "productivityUpliftPct", label: "Productivity uplift", unit: "%", min: 5, max: 30, step: 1, defaultValue: 12 },
    ],
    computeImpacts: ({ productivityUpliftPct }) => {
      const releasedDays = (productivityUpliftPct / 100) * BASELINE.totalCapacityDays90 * 4;
      const billableDays = releasedDays * 0.65;
      const newRev = billableDays * 1800; // avg day rate
      return [
        {
          dimension: "financial",
          label: "Annual revenue uplift",
          baseline: fmtEur(BASELINE.annualRevenue),
          projected: fmtEur(BASELINE.annualRevenue + newRev),
          delta: `+${fmtEur(newRev)}`,
          tone: "positive",
          narrative: `${productivityUpliftPct}% productivity gain releases ${Math.round(releasedDays).toLocaleString()} FTE-days/year. Assuming 65% convert to billable, revenue uplift ${fmtEur(newRev)}.`,
        },
        {
          dimension: "capacity",
          label: "Capacity unlocked",
          baseline: `${BASELINE.totalCapacityDays90.toLocaleString()}d / 90d`,
          projected: `${(BASELINE.totalCapacityDays90 + Math.round(releasedDays / 4)).toLocaleString()}d / 90d`,
          delta: `+${Math.round(releasedDays / 4).toLocaleString()}d`,
          tone: "positive",
          narrative: "Effective capacity equivalent to adding ~10 FTEs without hiring.",
        },
        {
          dimension: "delivery",
          label: "Delivery risk score",
          baseline: `${BASELINE.deliveryRiskScore} / 5`,
          projected: `${(BASELINE.deliveryRiskScore - 0.3).toFixed(1)} / 5`,
          delta: "-0.3",
          tone: "positive",
          narrative: "Risk falls as the same workforce delivers more per engagement. Watch quality + over-reliance carefully.",
        },
        {
          dimension: "skill",
          label: "Capability mix",
          baseline: `${BASELINE.skillsGapCount} critical gaps`,
          projected: `${BASELINE.skillsGapCount - 1} critical gaps`,
          delta: "-1",
          tone: "positive",
          narrative: "Reduces the marginal need for one mid-level capability hire. Doesn't substitute for senior specialism.",
        },
      ];
    },
  },
];
