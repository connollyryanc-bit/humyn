/**
 * Pipeline Readiness — mock data
 *
 * Commercial pipeline opportunities (CRM-style records) with delivery-readiness
 * scoring layered on top. Replace with real CRM + resource-management data once
 * those integrations are wired.
 */

export type PipelineStage =
  | "qualified"
  | "discovery"
  | "pitch"
  | "proposed"
  | "negotiation"
  | "closed-won"
  | "closed-lost";

export const PIPELINE_STAGES: { key: PipelineStage; label: string; tone: string }[] = [
  { key: "qualified",   label: "Qualified",   tone: "#9A9A9A" },
  { key: "discovery",   label: "Discovery",   tone: "#D4974A" },
  { key: "pitch",       label: "Pitch",       tone: "#D4974A" },
  { key: "proposed",    label: "Proposed",    tone: "#6B9FCC" },
  { key: "negotiation", label: "Negotiation", tone: "#6B9FCC" },
  { key: "closed-won",  label: "Closed-won",  tone: "#5CAB82" },
  { key: "closed-lost", label: "Closed-lost", tone: "#D97B73" },
];

export type ReadinessTone = "ready" | "stretch" | "risk" | "gap";

export interface Opportunity {
  id: number;
  name: string;
  client: string;
  market: string;
  practice: string;
  stage: PipelineStage;
  valueEur: number;          // total deal value
  probability: number;       // 0-100
  expectedStart: string;     // ISO date
  duration: string;
  requiredSkills: string[];
  requiredFTE: number;
  readiness: number;         // 0-100
  readinessTone: ReadinessTone;
  riskFlags: string[];
  owner: string;
  daysInStage: number;
}

export const opportunities: Opportunity[] = [
  {
    id: 1,
    name: "Nordea wealth portal — discovery",
    client: "Nordea",
    market: "Stockholm",
    practice: "Service Design",
    stage: "pitch",
    valueEur: 280000,
    probability: 65,
    expectedStart: "2026-07-15",
    duration: "2 months",
    requiredSkills: ["UX leadership", "Wealth/private banking", "Prototyping"],
    requiredFTE: 4,
    readiness: 82,
    readinessTone: "ready",
    riskFlags: [],
    owner: "Linnea Sjöberg",
    daysInStage: 11,
  },
  {
    id: 2,
    name: "Volvo Cars connected platform — extension",
    client: "Volvo Cars",
    market: "Stockholm",
    practice: "Engineering",
    stage: "negotiation",
    valueEur: 3800000,
    probability: 75,
    expectedStart: "2026-09-01",
    duration: "12 months",
    requiredSkills: ["Engineering management", "Cloud architecture", "Mobile (React Native)", "Data pipelines"],
    requiredFTE: 11,
    readiness: 44,
    readinessTone: "risk",
    riskFlags: ["Engineering lead unstaffed", "Data Engineering 3 vacancies"],
    owner: "Astrid Falk",
    daysInStage: 6,
  },
  {
    id: 3,
    name: "Kesko grocery — demand forecasting",
    client: "Kesko",
    market: "Helsinki",
    practice: "Data & AI",
    stage: "proposed",
    valueEur: 520000,
    probability: 60,
    expectedStart: "2026-08-01",
    duration: "5 months",
    requiredSkills: ["Applied ML", "Time-series forecasting", "MLOps"],
    requiredFTE: 2,
    readiness: 32,
    readinessTone: "gap",
    riskFlags: ["Senior ML specialist not on bench", "Helsinki Data & AI at critical shortage"],
    owner: "Henna Mäkinen",
    daysInStage: 18,
  },
  {
    id: 4,
    name: "IKEA experience platform — UX strand",
    client: "IKEA",
    market: "Stockholm",
    practice: "Product Design",
    stage: "negotiation",
    valueEur: 1200000,
    probability: 80,
    expectedStart: "2026-08-25",
    duration: "9 months",
    requiredSkills: ["Service design", "Design systems", "Workshop facilitation"],
    requiredFTE: 3,
    readiness: 58,
    readinessTone: "stretch",
    riskFlags: ["Product Design already 180d over capacity"],
    owner: "Saga Lindqvist",
    daysInStage: 4,
  },
  {
    id: 5,
    name: "Posten Norge logistics — phase 4",
    client: "Posten Norge",
    market: "Oslo",
    practice: "Engineering",
    stage: "qualified",
    valueEur: 1900000,
    probability: 35,
    expectedStart: "2026-09-15",
    duration: "8 months",
    requiredSkills: ["Go", "Event-driven systems", "Routing optimisation"],
    requiredFTE: 5,
    readiness: 71,
    readinessTone: "ready",
    riskFlags: ["Posten internal funding still being confirmed"],
    owner: "Magnus Dahl",
    daysInStage: 22,
  },
  {
    id: 6,
    name: "Telia self-service v2",
    client: "Telia",
    market: "Stockholm",
    practice: "Product Design",
    stage: "proposed",
    valueEur: 1400000,
    probability: 70,
    expectedStart: "2026-09-01",
    duration: "8 months",
    requiredSkills: ["Product design", "Design systems", "Cloud migration"],
    requiredFTE: 6,
    readiness: 64,
    readinessTone: "stretch",
    riskFlags: ["Saga continuity not yet confirmed"],
    owner: "Linnea Sjöberg",
    daysInStage: 9,
  },
  {
    id: 7,
    name: "SAS Group customer cloud — full migration",
    client: "SAS Group",
    market: "Stockholm",
    practice: "Cloud & Architecture",
    stage: "discovery",
    valueEur: 2400000,
    probability: 25,
    expectedStart: "2027-01-15",
    duration: "10 months",
    requiredSkills: ["Cloud migration", "Enterprise architecture", "Mainframe-to-cloud"],
    requiredFTE: 6,
    readiness: 78,
    readinessTone: "ready",
    riskFlags: ["Exploratory — no commitment yet"],
    owner: "Erik Holm",
    daysInStage: 14,
  },
  {
    id: 8,
    name: "Klarna CX Transformation — Phase 3",
    client: "Klarna",
    market: "Stockholm",
    practice: "Programme Delivery",
    stage: "qualified",
    valueEur: 2800000,
    probability: 55,
    expectedStart: "2026-11-15",
    duration: "9 months",
    requiredSkills: ["Programme delivery", "Engineering", "Product design"],
    requiredFTE: 8,
    readiness: 52,
    readinessTone: "stretch",
    riskFlags: ["Phase 2 still active — risk of team overlap"],
    owner: "Linnea Sjöberg",
    daysInStage: 5,
  },
  {
    id: 9,
    name: "Equinor innovation lab — strand 3",
    client: "Equinor",
    market: "Oslo",
    practice: "Strategy & Innovation",
    stage: "qualified",
    valueEur: 380000,
    probability: 50,
    expectedStart: "2026-11-01",
    duration: "3 months",
    requiredSkills: ["Innovation strategy", "Workshop facilitation", "Rapid prototyping"],
    requiredFTE: 3,
    readiness: 84,
    readinessTone: "ready",
    riskFlags: [],
    owner: "Aksel Berg",
    daysInStage: 31,
  },
  {
    id: 10,
    name: "Carlsberg loyalty — phase 4 (mobile)",
    client: "Carlsberg",
    market: "Copenhagen",
    practice: "Product Design",
    stage: "discovery",
    valueEur: 720000,
    probability: 60,
    expectedStart: "2027-02-15",
    duration: "6 months",
    requiredSkills: ["Mobile design", "Gamification", "Loyalty"],
    requiredFTE: 4,
    readiness: 70,
    readinessTone: "ready",
    riskFlags: [],
    owner: "Pernille Andersen",
    daysInStage: 8,
  },
  {
    id: 11,
    name: "OP Financial — wealth platform discovery",
    client: "OP Financial",
    market: "Helsinki",
    practice: "Data & AI",
    stage: "pitch",
    valueEur: 460000,
    probability: 45,
    expectedStart: "2026-10-01",
    duration: "3 months",
    requiredSkills: ["Wealth/private banking", "Applied ML", "Discovery research"],
    requiredFTE: 3,
    readiness: 38,
    readinessTone: "gap",
    riskFlags: ["Helsinki Data & AI capacity already critical"],
    owner: "Henna Mäkinen",
    daysInStage: 16,
  },
  {
    id: 12,
    name: "DSB digital — phase 2",
    client: "DSB",
    market: "Copenhagen",
    practice: "Service Design",
    stage: "qualified",
    valueEur: 1800000,
    probability: 65,
    expectedStart: "2027-06-01",
    duration: "9 months",
    requiredSkills: ["Service design", "Programme delivery", "Customer journey mapping"],
    requiredFTE: 6,
    readiness: 72,
    readinessTone: "ready",
    riskFlags: [],
    owner: "Pernille Andersen",
    daysInStage: 12,
  },
  {
    id: 13,
    name: "Maersk customer portal — modernisation",
    client: "Maersk",
    market: "Copenhagen",
    practice: "Engineering",
    stage: "proposed",
    valueEur: 1600000,
    probability: 70,
    expectedStart: "2026-10-15",
    duration: "7 months",
    requiredSkills: ["React/Next.js", "Event-driven systems", "Integration"],
    requiredFTE: 5,
    readiness: 66,
    readinessTone: "stretch",
    riskFlags: ["Senior FE Engineer continuity from v3"],
    owner: "Mathias Lund",
    daysInStage: 7,
  },
  {
    id: 14,
    name: "H&M Commerce — international rollout",
    client: "H&M",
    market: "Stockholm",
    practice: "Product Design",
    stage: "discovery",
    valueEur: 980000,
    probability: 55,
    expectedStart: "2026-11-01",
    duration: "6 months",
    requiredSkills: ["E-commerce", "Conversion optimisation", "Multi-market UX"],
    requiredFTE: 4,
    readiness: 48,
    readinessTone: "risk",
    riskFlags: ["Astrid Falk capacity already committed to Klarna"],
    owner: "Astrid Falk",
    daysInStage: 19,
  },
];

export interface PipelineAiInsight {
  category: "chase" | "decline" | "capability" | "risk";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

export const pipelineAiInsights: PipelineAiInsight[] = [
  {
    category: "chase",
    title: "Volvo Cars extension — biggest weighted-value win at risk",
    body: "75% probability × €3.8M = €2.85M weighted. But delivery readiness is only 44% — Engineering lead and three data-engineering vacancies. Close the staffing in four weeks or this win becomes a delivery failure.",
    link: { href: "/executive/capacity-demand", label: "See Engineering capacity" },
  },
  {
    category: "decline",
    title: "Two Helsinki Data & AI opportunities should be reviewed",
    body: "Kesko forecasting (60% × €520k) and OP wealth discovery (45% × €460k) both depend on ML specialists the Helsinki practice doesn't have. Either decline one, or commit to hiring + upskilling now.",
    link: { href: "/executive/skills", label: "See Skills Intelligence" },
  },
  {
    category: "capability",
    title: "Mobile React Native is a recurring capability gap",
    body: "Three live opportunities (Volvo Cars, Maersk, Carlsberg phase 4) cite Mobile React Native in required skills. Only six consultants across the four markets have it. Worth a targeted hiring or upskilling decision this quarter.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
  {
    category: "risk",
    title: "Klarna Phase 3 risks overlapping with Phase 2",
    body: "Phase 2 active until February 2027. Phase 3 expected start November 2026. Three of the same senior consultants are named on both. Either confirm overlap can be handled or push Phase 3 start by two months.",
    link: { href: "/pipeline/1", label: "Open Klarna Phase 2 brief" },
  },
  {
    category: "chase",
    title: "DSB Phase 2 is the cleanest large opportunity in the pipeline",
    body: "65% probability × €1.8M, healthy 72% readiness, long lead time, named owner (Pernille). Push to proposal stage early.",
  },
  {
    category: "decline",
    title: "H&M international rollout has structural delivery risk",
    body: "55% × €980k looks attractive but Astrid Falk's capacity is fully committed and there is no clear successor for the H&M account. Either build the team behind her now, or pass this opportunity to another agency.",
  },
];
