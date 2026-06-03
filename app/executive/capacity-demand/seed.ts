/**
 * Capacity vs Demand Intelligence — mock data
 *
 * Numbers are FTE-days across a 90-day horizon by default. The store also holds
 * snapshots at 30/60/90/180/365-day horizons so the page can switch contexts.
 */

export type HorizonKey = "30d" | "60d" | "90d" | "180d" | "365d";

export const HORIZONS: { key: HorizonKey; label: string; days: number }[] = [
  { key: "30d",  label: "30 days",   days: 30 },
  { key: "60d",  label: "60 days",   days: 60 },
  { key: "90d",  label: "90 days",   days: 90 },
  { key: "180d", label: "180 days",  days: 180 },
  { key: "365d", label: "365 days",  days: 365 },
];

export type RiskLevel = "critical" | "warning" | "neutral" | "positive";

export interface PracticeSnapshot {
  practice: string;
  region: string;
  headcount: number;
  capacity: number;          // FTE days available
  confirmedDemand: number;   // FTE days for active + confirmed work
  weightedPipeline: number;  // FTE days probability-weighted
  risk: RiskLevel;
  note: string;
}

/**
 * Per-horizon snapshots. Numbers scale roughly with the horizon length but
 * narrow stories vary — e.g. Data & AI is the headline shortage at every horizon.
 */
export const practiceSnapshots: Record<HorizonKey, PracticeSnapshot[]> = {
  "30d": [
    { practice: "Engineering",           region: "Nordics", headcount: 38, capacity: 760,  confirmedDemand: 720, weightedPipeline: 110, risk: "neutral",  note: "On track. Storebrand rebuild on plan." },
    { practice: "Product Design",        region: "Nordics", headcount: 24, capacity: 480,  confirmedDemand: 540, weightedPipeline: 80,  risk: "warning",  note: "Klarna + H&M overlap pushes Stockholm above 95%." },
    { practice: "Data & AI",             region: "Nordics", headcount: 16, capacity: 320,  confirmedDemand: 380, weightedPipeline: 140, risk: "critical", note: "OP Financial + Kesko both staffing in May. ML specialists short by 60 days." },
    { practice: "Strategy & Innovation", region: "Nordics", headcount: 12, capacity: 240,  confirmedDemand: 200, weightedPipeline: 60,  risk: "neutral",  note: "Equinor strand 2 confirmed. Capacity matches demand." },
    { practice: "Service Design",        region: "Nordics", headcount: 18, capacity: 360,  confirmedDemand: 240, weightedPipeline: 80,  risk: "positive", note: "DSB ramps in June — capacity holds until then." },
    { practice: "Programme Delivery",    region: "Nordics", headcount: 21, capacity: 420,  confirmedDemand: 380, weightedPipeline: 90,  risk: "neutral",  note: "Spread across Klarna, Maersk, DSB, Carlsberg." },
    { practice: "Cloud & Architecture",  region: "Nordics", headcount: 26, capacity: 520,  confirmedDemand: 460, weightedPipeline: 120, risk: "neutral",  note: "Capacity covers Maersk + SAS discovery in parallel." },
    { practice: "Insights & Analytics",  region: "Nordics", headcount: 14, capacity: 280,  confirmedDemand: 180, weightedPipeline: 70,  risk: "positive", note: "Bench available. Could absorb a pitch quickly." },
  ],
  "60d": [
    { practice: "Engineering",           region: "Nordics", headcount: 38, capacity: 1520, confirmedDemand: 1380, weightedPipeline: 280, risk: "neutral",  note: "Volvo Cars extension unstaffed lead — biggest single gap." },
    { practice: "Product Design",        region: "Nordics", headcount: 24, capacity: 960,  confirmedDemand: 1040, weightedPipeline: 180, risk: "warning",  note: "IKEA UX strand kicks off August — needs 2 senior designers." },
    { practice: "Data & AI",             region: "Nordics", headcount: 16, capacity: 640,  confirmedDemand: 780,  weightedPipeline: 260, risk: "critical", note: "Critical shortage. ML/AI specialists are the biggest hire need." },
    { practice: "Strategy & Innovation", region: "Nordics", headcount: 12, capacity: 480,  confirmedDemand: 420,  weightedPipeline: 140, risk: "neutral",  note: "Equinor work absorbs most of the capacity." },
    { practice: "Service Design",        region: "Nordics", headcount: 18, capacity: 720,  confirmedDemand: 560,  weightedPipeline: 160, risk: "positive", note: "DSB ramp is the main draw. Spare capacity for one more brief." },
    { practice: "Programme Delivery",    region: "Nordics", headcount: 21, capacity: 840,  confirmedDemand: 760,  weightedPipeline: 200, risk: "neutral",  note: "Healthy spread, no single brief at risk." },
    { practice: "Cloud & Architecture",  region: "Nordics", headcount: 26, capacity: 1040, confirmedDemand: 920,  weightedPipeline: 240, risk: "neutral",  note: "Maersk v3 + Telia migration sit comfortably." },
    { practice: "Insights & Analytics",  region: "Nordics", headcount: 14, capacity: 560,  confirmedDemand: 360,  weightedPipeline: 140, risk: "positive", note: "Persistent bench — candidates for cross-practice redeployment." },
  ],
  "90d": [
    { practice: "Engineering",           region: "Nordics", headcount: 38, capacity: 2280, confirmedDemand: 1960, weightedPipeline: 580, risk: "warning",  note: "Volvo Cars lead unstaffed for 12 days. If pipeline lands, 260-day shortage." },
    { practice: "Product Design",        region: "Nordics", headcount: 24, capacity: 1440, confirmedDemand: 1620, weightedPipeline: 320, risk: "critical", note: "Already 180 days over. IKEA UX strand worsens the gap by 480 days." },
    { practice: "Data & AI",             region: "Nordics", headcount: 16, capacity: 960,  confirmedDemand: 1200, weightedPipeline: 480, risk: "critical", note: "Most acute shortage. Kesko + OP need ML specialists Helsinki doesn't have." },
    { practice: "Strategy & Innovation", region: "Nordics", headcount: 12, capacity: 720,  confirmedDemand: 600,  weightedPipeline: 180, risk: "neutral",  note: "Nordea pitch is the swing — landing it adds 180 days of need." },
    { practice: "Service Design",        region: "Nordics", headcount: 18, capacity: 1080, confirmedDemand: 720,  weightedPipeline: 220, risk: "positive", note: "Healthy surplus until DSB main phase kicks in." },
    { practice: "Programme Delivery",    region: "Nordics", headcount: 21, capacity: 1260, confirmedDemand: 1180, weightedPipeline: 240, risk: "neutral",  note: "On the edge. Adding one programme tips this into shortage." },
    { practice: "Cloud & Architecture",  region: "Nordics", headcount: 26, capacity: 1560, confirmedDemand: 1320, weightedPipeline: 380, risk: "neutral",  note: "Strong utilisation. Volvo Cars work adds 280-day need if confirmed." },
    { practice: "Insights & Analytics",  region: "Nordics", headcount: 14, capacity: 840,  confirmedDemand: 540,  weightedPipeline: 280, risk: "positive", note: "Persistent bench — Saga + Aksel free in July." },
  ],
  "180d": [
    { practice: "Engineering",           region: "Nordics", headcount: 38, capacity: 4560, confirmedDemand: 3800, weightedPipeline: 1380, risk: "warning",  note: "Major Volvo + Storebrand phases overlap H2." },
    { practice: "Product Design",        region: "Nordics", headcount: 24, capacity: 2880, confirmedDemand: 3120, weightedPipeline: 760,  risk: "critical", note: "Already over capacity across H2 even without pipeline." },
    { practice: "Data & AI",             region: "Nordics", headcount: 16, capacity: 1920, confirmedDemand: 2280, weightedPipeline: 980,  risk: "critical", note: "Sustained shortage. Three confirmed Q4 starts need specialists." },
    { practice: "Strategy & Innovation", region: "Nordics", headcount: 12, capacity: 1440, confirmedDemand: 1080, weightedPipeline: 460,  risk: "neutral",  note: "Capacity holds unless Nordea wealth lands." },
    { practice: "Service Design",        region: "Nordics", headcount: 18, capacity: 2160, confirmedDemand: 1620, weightedPipeline: 520,  risk: "neutral",  note: "Healthy through Q3, tighter in Q4 as DSB peaks." },
    { practice: "Programme Delivery",    region: "Nordics", headcount: 21, capacity: 2520, confirmedDemand: 2320, weightedPipeline: 540,  risk: "warning",  note: "Tight margin in Q4 — adding programmes pushes shortage." },
    { practice: "Cloud & Architecture",  region: "Nordics", headcount: 26, capacity: 3120, confirmedDemand: 2680, weightedPipeline: 820,  risk: "neutral",  note: "Strong but contractor reliance creeping up — margin risk." },
    { practice: "Insights & Analytics",  region: "Nordics", headcount: 14, capacity: 1680, confirmedDemand: 1140, weightedPipeline: 580,  risk: "positive", note: "Capacity for one more major analytics engagement." },
  ],
  "365d": [
    { practice: "Engineering",           region: "Nordics", headcount: 38, capacity: 9240, confirmedDemand: 6800, weightedPipeline: 3100, risk: "neutral",  note: "Full-year picture balanced. Q4 is the pressure point." },
    { practice: "Product Design",        region: "Nordics", headcount: 24, capacity: 5840, confirmedDemand: 5640, weightedPipeline: 1620, risk: "warning",  note: "Marginal full-year. Hiring case made for two senior designers." },
    { practice: "Data & AI",             region: "Nordics", headcount: 16, capacity: 3880, confirmedDemand: 4220, weightedPipeline: 2180, risk: "critical", note: "Structural full-year shortage. Hire OR upskill OR partner — decision required." },
    { practice: "Strategy & Innovation", region: "Nordics", headcount: 12, capacity: 2920, confirmedDemand: 2160, weightedPipeline: 980,  risk: "neutral",  note: "Stable full year. Pipeline plays the swing role." },
    { practice: "Service Design",        region: "Nordics", headcount: 18, capacity: 4380, confirmedDemand: 3240, weightedPipeline: 1080, risk: "neutral",  note: "Healthy structural position." },
    { practice: "Programme Delivery",    region: "Nordics", headcount: 21, capacity: 5120, confirmedDemand: 4620, weightedPipeline: 1240, risk: "neutral",  note: "Margin tight but holds across the year." },
    { practice: "Cloud & Architecture",  region: "Nordics", headcount: 26, capacity: 6340, confirmedDemand: 5320, weightedPipeline: 1860, risk: "neutral",  note: "Strong year. Watch contractor blend on margin." },
    { practice: "Insights & Analytics",  region: "Nordics", headcount: 14, capacity: 3380, confirmedDemand: 2240, weightedPipeline: 1260, risk: "positive", note: "Capacity to absorb two more major engagements." },
  ],
};

/**
 * Time-series: weekly capacity vs demand over the selected horizon.
 * Each horizon has a different number of points (4, 8, 12, 24, 52 weeks).
 */
export const timeSeries: Record<HorizonKey, { week: string; capacity: number; confirmed: number; pipeline: number }[]> = {
  "30d": [
    { week: "W1", capacity: 880, confirmed: 820, pipeline: 110 },
    { week: "W2", capacity: 880, confirmed: 860, pipeline: 130 },
    { week: "W3", capacity: 880, confirmed: 900, pipeline: 140 },
    { week: "W4", capacity: 880, confirmed: 880, pipeline: 150 },
  ],
  "60d": [
    { week: "W1", capacity: 880, confirmed: 820, pipeline: 110 },
    { week: "W2", capacity: 880, confirmed: 860, pipeline: 130 },
    { week: "W3", capacity: 880, confirmed: 900, pipeline: 150 },
    { week: "W4", capacity: 880, confirmed: 920, pipeline: 170 },
    { week: "W5", capacity: 880, confirmed: 940, pipeline: 200 },
    { week: "W6", capacity: 880, confirmed: 920, pipeline: 220 },
    { week: "W7", capacity: 880, confirmed: 880, pipeline: 240 },
    { week: "W8", capacity: 880, confirmed: 860, pipeline: 260 },
  ],
  "90d": [
    { week: "W1", capacity: 880, confirmed: 820, pipeline: 110 },
    { week: "W2", capacity: 880, confirmed: 880, pipeline: 130 },
    { week: "W3", capacity: 880, confirmed: 920, pipeline: 160 },
    { week: "W4", capacity: 880, confirmed: 960, pipeline: 190 },
    { week: "W5", capacity: 880, confirmed: 1000, pipeline: 220 },
    { week: "W6", capacity: 880, confirmed: 1040, pipeline: 260 },
    { week: "W7", capacity: 880, confirmed: 1080, pipeline: 290 },
    { week: "W8", capacity: 880, confirmed: 1060, pipeline: 320 },
    { week: "W9", capacity: 880, confirmed: 1020, pipeline: 360 },
    { week: "W10", capacity: 880, confirmed: 980, pipeline: 380 },
    { week: "W11", capacity: 880, confirmed: 940, pipeline: 360 },
    { week: "W12", capacity: 880, confirmed: 900, pipeline: 340 },
  ],
  "180d": [
    { week: "M1", capacity: 3520, confirmed: 3340, pipeline: 540 },
    { week: "M2", capacity: 3520, confirmed: 3580, pipeline: 720 },
    { week: "M3", capacity: 3520, confirmed: 3760, pipeline: 980 },
    { week: "M4", capacity: 3520, confirmed: 3840, pipeline: 1180 },
    { week: "M5", capacity: 3520, confirmed: 3700, pipeline: 1320 },
    { week: "M6", capacity: 3520, confirmed: 3520, pipeline: 1400 },
  ],
  "365d": [
    { week: "Q1", capacity: 10500, confirmed: 9220, pipeline: 1820 },
    { week: "Q2", capacity: 10500, confirmed: 10160, pipeline: 2860 },
    { week: "Q3", capacity: 10500, confirmed: 10980, pipeline: 3640 },
    { week: "Q4", capacity: 10500, confirmed: 10720, pipeline: 4100 },
  ],
};

export interface CapacityAiInsight {
  category: "shortage" | "surplus" | "bottleneck" | "risk";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

export const capacityAiInsights: CapacityAiInsight[] = [
  {
    category: "shortage",
    title: "Data & AI is the most acute shortage at every horizon",
    body: "240-day gap at 90 days, widening to 980 days at 12 months once Kesko and OP Financial confirmed starts land. Three Q4 engagements already accepted depend on ML specialists not currently on the bench.",
    link: { href: "/executive/skills", label: "See Skills Intelligence" },
  },
  {
    category: "shortage",
    title: "Product Design over capacity through H2",
    body: "Already 180 days over confirmed demand at 90 days. IKEA UX strand kicking off in August adds 480 days. Hiring case made for two senior designers — backstops to upskilling or contractor cover via Workforce Optimization.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
  {
    category: "bottleneck",
    title: "Engineering bottleneck: Volvo Cars extension still without a lead",
    body: "Twelve days unstaffed. Engineering capacity at 90d covers the work but only if the lead role is filled within four weeks. Beyond that the downstream Storebrand and Maersk phases tip into shortage.",
    link: { href: "/teams", label: "Open the brief portfolio" },
  },
  {
    category: "surplus",
    title: "Insights & Analytics has carry capacity",
    body: "300+ days of slack at every horizon. Saga Lindqvist and Aksel Berg free from late July. Could be absorbed into the data-led storytelling work on Equinor or the upcoming Nordea wealth pitch.",
    link: { href: "/available", label: "Open the resource timeline" },
  },
  {
    category: "risk",
    title: "Programme Delivery margin is thin",
    body: "Capacity holds at every horizon but only just — adding one new programme tips the practice into shortage. Worth pre-confirming Tobias Krogh's H2 plan before any new wins close.",
  },
  {
    category: "surplus",
    title: "Cross-Nordic redeployment unlocks €420k",
    body: "Stockholm's Service Design surplus + Copenhagen's Programme Delivery slack could be redeployed onto the Helsinki Data & AI shortage with two weeks of bridging time. Estimated bench-cost saving €420k over the quarter.",
    link: { href: "/executive/optimization", label: "Open Workforce Optimization" },
  },
];
