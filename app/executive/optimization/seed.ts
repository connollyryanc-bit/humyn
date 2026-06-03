/**
 * Workforce Optimization Engine — mock data
 *
 * The strategic-differentiator module. Surfaces ranked workforce actions in a
 * deliberate hierarchy: internal moves first (redeploy, upskill, reskill, team
 * redesign), then partners / contractors / freelancers, then hiring or workforce
 * reduction.
 */

export type ActionTier = "internal" | "partner" | "hire";
export type ActionKind =
  | "redeploy"
  | "upskill"
  | "reskill"
  | "team-redesign"
  | "project-realloc"
  | "contractor"
  | "partner"
  | "freelancer"
  | "hire"
  | "reduce";

export interface Action {
  id: number;
  tier: ActionTier;
  kind: ActionKind;
  title: string;
  body: string;
  impactEur: number;
  costEur: number;
  risk: "low" | "medium" | "high";
  timeToValueDays: number;
  confidence: number; // 0-100
  linkedSignals: string[]; // upstream pages / signals that motivated the recommendation
  affects: string[]; // names of consultants or practices affected
}

export const tierMeta: Record<ActionTier, { label: string; description: string; color: string }> = {
  internal: {
    label: "Internal moves",
    description: "Redeploy, upskill, reskill, redesign — evaluate first.",
    color: "#3D8A61",
  },
  partner: {
    label: "Partners & contractors",
    description: "Bridge with external partners or freelancers when internal isn't enough.",
    color: "#B87A2E",
  },
  hire: {
    label: "Hire or reduce",
    description: "The structural last resort. Permanent workforce change.",
    color: "#C4534A",
  },
};

export const kindLabel: Record<ActionKind, string> = {
  redeploy:        "Redeploy",
  upskill:         "Upskill",
  reskill:         "Reskill",
  "team-redesign": "Team redesign",
  "project-realloc": "Project reallocation",
  contractor:      "Contractor",
  partner:         "Partner",
  freelancer:      "Freelancer",
  hire:            "Hire",
  reduce:          "Reduce",
};

export const optimizationActions: Action[] = [
  {
    id: 1,
    tier: "internal",
    kind: "redeploy",
    title: "Redeploy Saga Lindqvist + Aksel Berg into the Helsinki Data & AI shortage",
    body: "Both have spare capacity from late July. Saga's product-design + service-design skills cover one workstream of the OP wealth discovery; Aksel's facilitation work bridges the Kesko engagement kickoff. Frees ML specialists for the modelling-only workstreams.",
    impactEur: 280000,
    costEur: 12000,
    risk: "low",
    timeToValueDays: 14,
    confidence: 78,
    linkedSignals: ["Capacity vs Demand", "Pipeline Readiness"],
    affects: ["Saga Lindqvist", "Aksel Berg", "Data & AI Helsinki"],
  },
  {
    id: 2,
    tier: "internal",
    kind: "upskill",
    title: "Upskill 4 mid-level consultants into AI/ML capability",
    body: "Three-month focused programme — fundamentals + applied work shadowing Henna Mäkinen on Kesko. Closes the AI/ML gap structurally over the year. Cost-to-value materially better than external hires.",
    impactEur: 620000,
    costEur: 96000,
    risk: "medium",
    timeToValueDays: 90,
    confidence: 82,
    linkedSignals: ["Skills Intelligence", "Pipeline Readiness"],
    affects: ["4 mid-level consultants", "Data & AI"],
  },
  {
    id: 3,
    tier: "internal",
    kind: "project-realloc",
    title: "Reallocate Niko Virtanen onto the Telia self-service architecture",
    body: "Niko on bench 21 days. Telia v2 needs a senior backend + architecture mind. Stops the bench bleeding (€11k/week) and improves Telia delivery readiness.",
    impactEur: 124000,
    costEur: 0,
    risk: "low",
    timeToValueDays: 5,
    confidence: 91,
    linkedSignals: ["Revenue Leakage", "Pipeline Readiness"],
    affects: ["Niko Virtanen", "Telia"],
  },
  {
    id: 4,
    tier: "internal",
    kind: "team-redesign",
    title: "Redesign the Klarna Phase 2 → Phase 3 transition team",
    body: "Phase 2 still active until Feb 2027; Phase 3 starts November 2026. Pull two senior consultants forward to Phase 3 setup; backfill Phase 2 with mid-level + named lead. Avoids overlap-driven scope risk.",
    impactEur: 340000,
    costEur: 24000,
    risk: "medium",
    timeToValueDays: 45,
    confidence: 70,
    linkedSignals: ["Pipeline Readiness", "Team Health"],
    affects: ["Klarna team", "Phase 2 + Phase 3"],
  },
  {
    id: 5,
    tier: "internal",
    kind: "reskill",
    title: "Reskill two .NET engineers in Mobile React Native",
    body: "Mobile React Native is the recurring capability gap across Volvo extension, Maersk modernisation and Carlsberg phase 4. Two .NET engineers under-utilised in their current practice — six-week reskilling unlocks ~1,200 FTE days of Mobile capacity.",
    impactEur: 480000,
    costEur: 48000,
    risk: "medium",
    timeToValueDays: 60,
    confidence: 65,
    linkedSignals: ["Skills Intelligence"],
    affects: ["2 .NET engineers", "Mobile capability"],
  },
  {
    id: 6,
    tier: "partner",
    kind: "contractor",
    title: "Contract 2 senior ML specialists from the Helsinki pool",
    body: "Bridge for Kesko + OP wealth while the upskilling programme matures. Three-month contracts; converts to hire if needed. Materially cheaper than full hire if the work doesn't extend.",
    impactEur: 360000,
    costEur: 180000,
    risk: "medium",
    timeToValueDays: 21,
    confidence: 74,
    linkedSignals: ["Skills Intelligence", "Pipeline Readiness"],
    affects: ["Helsinki Data & AI"],
  },
  {
    id: 7,
    tier: "partner",
    kind: "partner",
    title: "Partner with an Oslo-based mobile studio for Volvo Cars Mobile",
    body: "Volvo extension needs two senior mobile engineers. Reskilling closes one slot in 60 days; partner studio covers the other immediately. Confirmed studio relationship from Storebrand work.",
    impactEur: 420000,
    costEur: 240000,
    risk: "low",
    timeToValueDays: 14,
    confidence: 80,
    linkedSignals: ["Pipeline Readiness", "Skills Intelligence"],
    affects: ["Volvo Cars team", "Mobile capability"],
  },
  {
    id: 8,
    tier: "partner",
    kind: "freelancer",
    title: "Engage 1 freelance UX lead for Nordea wealth discovery",
    body: "Specialist domain expertise in private banking UX is hard to grow internally for an 8-week engagement. Freelance lead with prior Nordea history available.",
    impactEur: 196000,
    costEur: 84000,
    risk: "low",
    timeToValueDays: 10,
    confidence: 76,
    linkedSignals: ["Pipeline Readiness"],
    affects: ["Nordea pitch team"],
  },
  {
    id: 9,
    tier: "hire",
    kind: "hire",
    title: "Hire 1 Principal ML Engineer (Helsinki)",
    body: "Structural fix for the Data & AI shortage. Combined with upskilling, this closes the year-long capability gap. Recommend after the upskilling programme has clarified what specialism is still missing.",
    impactEur: 720000,
    costEur: 380000,
    risk: "medium",
    timeToValueDays: 120,
    confidence: 62,
    linkedSignals: ["Skills Intelligence", "Capacity vs Demand"],
    affects: ["Data & AI Helsinki"],
  },
  {
    id: 10,
    tier: "hire",
    kind: "hire",
    title: "Hire 2 senior product designers (Stockholm + Copenhagen)",
    body: "Product Design is already 180 days over capacity at 90 days; IKEA UX strand adds 480 more. Hiring case made. Stockholm priority over Copenhagen.",
    impactEur: 540000,
    costEur: 320000,
    risk: "low",
    timeToValueDays: 90,
    confidence: 78,
    linkedSignals: ["Capacity vs Demand", "Pipeline Readiness"],
    affects: ["Product Design"],
  },
  {
    id: 11,
    tier: "hire",
    kind: "reduce",
    title: "Re-examine Insights & Analytics carry capacity",
    body: "Persistent 300+ days of slack at every horizon. Either redeploy structurally into Data & AI, or reduce headcount by 1-2 if redeployment isn't viable. Decision required.",
    impactEur: 220000,
    costEur: 0,
    risk: "high",
    timeToValueDays: 60,
    confidence: 58,
    linkedSignals: ["Capacity vs Demand", "Revenue Leakage"],
    affects: ["Insights & Analytics"],
  },
];

export interface OptimizationAiInsight {
  category: "principle" | "tradeoff" | "sequencing";
  title: string;
  body: string;
}

export const optimizationAiInsights: OptimizationAiInsight[] = [
  {
    category: "principle",
    title: "Internal-first ordering saves €820k vs hire-first ordering",
    body: "If the same workforce gap is closed with internal moves before partners and hiring, projected savings YTD are €820k vs the hire-first counterfactual. The model strongly recommends running through internal options before any external action.",
  },
  {
    category: "sequencing",
    title: "Run actions 1, 3, and 6 first — combined unlock is €764k impact",
    body: "Saga + Aksel redeploy (action 1), Niko reallocation (action 3), and the ML contractor bridge (action 6) together unlock €764k of impact at €192k cost, all in under 21 days. Highest confidence trio in the list.",
  },
  {
    category: "tradeoff",
    title: "Upskilling delivers 6.5× cost efficiency vs hiring for AI/ML",
    body: "Action 2 (upskill 4 mid-levels) returns €620k for €96k — 6.5× cost efficiency. Compared to the equivalent hire (action 9) at 1.9× efficiency. Upskilling should be the structural play; hiring fills the residual gap.",
  },
  {
    category: "principle",
    title: "Action 11 (Insights & Analytics reduction) requires HR-level decision",
    body: "Confidence is the lowest at 58%, risk is high, and it touches headcount. The model flags it for executive consideration rather than automatic recommendation.",
  },
];
