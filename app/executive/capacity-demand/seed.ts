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
    // UK
    { practice: "Engineering",           region: "UK",      headcount: 12, capacity: 240,  confirmedDemand: 220, weightedPipeline: 70,  risk: "neutral",  note: "Tesco loyalty rebuild on plan." },
    { practice: "Data & AI",             region: "UK",      headcount: 8,  capacity: 160,  confirmedDemand: 180, weightedPipeline: 90,  risk: "warning",  note: "Lloyds discovery + Sainsbury's pilot overlap." },
    { practice: "Cloud & Architecture",  region: "UK",      headcount: 6,  capacity: 120,  confirmedDemand: 100, weightedPipeline: 40,  risk: "neutral",  note: "Capacity holds for the Bupa migration." },
    // DACH
    { practice: "Engineering",           region: "DACH",    headcount: 8,  capacity: 160,  confirmedDemand: 120, weightedPipeline: 50,  risk: "positive", note: "Allianz claim platform staffed comfortably." },
    { practice: "Strategy & Innovation", region: "DACH",    headcount: 5,  capacity: 100,  confirmedDemand: 80,  weightedPipeline: 30,  risk: "neutral",  note: "Siemens innovation lab on plan." },
    { practice: "Cloud & Architecture",  region: "DACH",    headcount: 4,  capacity: 80,   confirmedDemand: 60,  weightedPipeline: 20,  risk: "positive", note: "Daimler integration work absorbed in plan." },
    // France
    { practice: "Strategy & Innovation", region: "France",  headcount: 5,  capacity: 100,  confirmedDemand: 70,  weightedPipeline: 25,  risk: "positive", note: "BNP Paribas discovery — early days, healthy headroom." },
    { practice: "Service Design",        region: "France",  headcount: 4,  capacity: 80,   confirmedDemand: 50,  weightedPipeline: 20,  risk: "positive", note: "Capacity to take on one more brief." },
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
    // UK
    { practice: "Engineering",           region: "UK",      headcount: 12, capacity: 480,  confirmedDemand: 420,  weightedPipeline: 140, risk: "neutral",  note: "Tesco loyalty extension + BarclaysAPI work both ramping." },
    { practice: "Data & AI",             region: "UK",      headcount: 8,  capacity: 320,  confirmedDemand: 360,  weightedPipeline: 180, risk: "critical", note: "UK ML demand outstripping supply. Hire or partner needed." },
    { practice: "Cloud & Architecture",  region: "UK",      headcount: 6,  capacity: 240,  confirmedDemand: 200,  weightedPipeline: 80,  risk: "neutral",  note: "Bupa migration on plan, room for one more." },
    // DACH
    { practice: "Engineering",           region: "DACH",    headcount: 8,  capacity: 320,  confirmedDemand: 240,  weightedPipeline: 100, risk: "positive", note: "Allianz claim platform + Siemens prototyping." },
    { practice: "Strategy & Innovation", region: "DACH",    headcount: 5,  capacity: 200,  confirmedDemand: 160,  weightedPipeline: 60,  risk: "neutral",  note: "Capacity matches confirmed work; pipeline thin." },
    { practice: "Cloud & Architecture",  region: "DACH",    headcount: 4,  capacity: 160,  confirmedDemand: 120,  weightedPipeline: 50,  risk: "positive", note: "Daimler integration work absorbed." },
    // France
    { practice: "Strategy & Innovation", region: "France",  headcount: 5,  capacity: 200,  confirmedDemand: 140,  weightedPipeline: 50,  risk: "positive", note: "BNP discovery progressing." },
    { practice: "Service Design",        region: "France",  headcount: 4,  capacity: 160,  confirmedDemand: 100,  weightedPipeline: 40,  risk: "positive", note: "Healthy headroom — could pitch into French luxury." },
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
    // UK
    { practice: "Engineering",           region: "UK",      headcount: 12, capacity: 720,  confirmedDemand: 620,  weightedPipeline: 220, risk: "neutral",  note: "Tesco extension confirmed; Barclays API discovery in proposal." },
    { practice: "Data & AI",             region: "UK",      headcount: 8,  capacity: 480,  confirmedDemand: 540,  weightedPipeline: 260, risk: "critical", note: "UK is the second AI/ML shortage hotspot after Helsinki." },
    { practice: "Cloud & Architecture",  region: "UK",      headcount: 6,  capacity: 360,  confirmedDemand: 300,  weightedPipeline: 130, risk: "neutral",  note: "Bupa migration steady; London commerce pitch could add 80 days." },
    // DACH
    { practice: "Engineering",           region: "DACH",    headcount: 8,  capacity: 480,  confirmedDemand: 380,  weightedPipeline: 160, risk: "positive", note: "Healthy. Allianz core + Siemens phase 2." },
    { practice: "Strategy & Innovation", region: "DACH",    headcount: 5,  capacity: 300,  confirmedDemand: 240,  weightedPipeline: 90,  risk: "neutral",  note: "Siemens innovation lab continues; pipeline thinner." },
    { practice: "Cloud & Architecture",  region: "DACH",    headcount: 4,  capacity: 240,  confirmedDemand: 180,  weightedPipeline: 70,  risk: "positive", note: "Daimler steady. Capacity for one more." },
    // France
    { practice: "Strategy & Innovation", region: "France",  headcount: 5,  capacity: 300,  confirmedDemand: 220,  weightedPipeline: 70,  risk: "positive", note: "BNP discovery confirmed; second French bank in pitch." },
    { practice: "Service Design",        region: "France",  headcount: 4,  capacity: 240,  confirmedDemand: 180,  weightedPipeline: 60,  risk: "positive", note: "Underutilised — investment for growth opportunity." },
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
    // UK
    { practice: "Engineering",           region: "UK",      headcount: 12, capacity: 1440, confirmedDemand: 1220, weightedPipeline: 460, risk: "neutral",  note: "H2 demand strong — Tesco + Barclays both extending." },
    { practice: "Data & AI",             region: "UK",      headcount: 8,  capacity: 960,  confirmedDemand: 1100, weightedPipeline: 560, risk: "critical", note: "UK AI/ML structurally short. London hiring case strong." },
    { practice: "Cloud & Architecture",  region: "UK",      headcount: 6,  capacity: 720,  confirmedDemand: 580,  weightedPipeline: 280, risk: "neutral",  note: "Bupa + new commerce pitches." },
    // DACH
    { practice: "Engineering",           region: "DACH",    headcount: 8,  capacity: 960,  confirmedDemand: 740,  weightedPipeline: 320, risk: "positive", note: "Healthy H2 across automotive and banking." },
    { practice: "Strategy & Innovation", region: "DACH",    headcount: 5,  capacity: 600,  confirmedDemand: 480,  weightedPipeline: 180, risk: "neutral",  note: "Siemens phase 2 + BMW innovation lab pitch." },
    { practice: "Cloud & Architecture",  region: "DACH",    headcount: 4,  capacity: 480,  confirmedDemand: 360,  weightedPipeline: 150, risk: "positive", note: "Daimler stable; capacity for second client." },
    // France
    { practice: "Strategy & Innovation", region: "France",  headcount: 5,  capacity: 600,  confirmedDemand: 440,  weightedPipeline: 160, risk: "positive", note: "Two French banks now in active engagement." },
    { practice: "Service Design",        region: "France",  headcount: 4,  capacity: 480,  confirmedDemand: 360,  weightedPipeline: 140, risk: "positive", note: "Luxury and retail pitches building." },
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
    // UK
    { practice: "Engineering",           region: "UK",      headcount: 12, capacity: 2880, confirmedDemand: 2380, weightedPipeline: 940, risk: "neutral",  note: "UK Engineering full year — balanced." },
    { practice: "Data & AI",             region: "UK",      headcount: 8,  capacity: 1920, confirmedDemand: 2180, weightedPipeline: 1080, risk: "critical", note: "Structural full-year shortage in UK. London hire decision Q3." },
    { practice: "Cloud & Architecture",  region: "UK",      headcount: 6,  capacity: 1440, confirmedDemand: 1180, weightedPipeline: 540, risk: "neutral",  note: "Steady. Cross-skill opportunity with London engineering." },
    // DACH
    { practice: "Engineering",           region: "DACH",    headcount: 8,  capacity: 1920, confirmedDemand: 1480, weightedPipeline: 620, risk: "positive", note: "Allianz + BMW continue. Healthy headroom." },
    { practice: "Strategy & Innovation", region: "DACH",    headcount: 5,  capacity: 1200, confirmedDemand: 980,  weightedPipeline: 380, risk: "neutral",  note: "Stable across the year." },
    { practice: "Cloud & Architecture",  region: "DACH",    headcount: 4,  capacity: 960,  confirmedDemand: 740,  weightedPipeline: 300, risk: "positive", note: "Daimler + one new automotive client expected." },
    // France
    { practice: "Strategy & Innovation", region: "France",  headcount: 5,  capacity: 1200, confirmedDemand: 880,  weightedPipeline: 320, risk: "positive", note: "BNP + Société Générale forming the year's spine." },
    { practice: "Service Design",        region: "France",  headcount: 4,  capacity: 960,  confirmedDemand: 720,  weightedPipeline: 280, risk: "positive", note: "Two new accounts; capability scaling steadily." },
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
