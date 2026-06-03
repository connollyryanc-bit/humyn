/**
 * Revenue Leakage — mock data
 *
 * Tracks where the workforce isn't converting to revenue: bench days,
 * sub-utilisation, scope-creep absorption, contractor over-spend, lost pitches,
 * margin erosion from rate-discounts.
 */

export type LeakageCategory =
  | "bench-cost"
  | "sub-utilisation"
  | "scope-absorption"
  | "contractor-spend"
  | "lost-pitch"
  | "rate-discount";

export interface LeakageItem {
  key: LeakageCategory;
  label: string;
  costEur: number;
  description: string;
  trend: "up" | "down" | "flat";
  changePct: number;
  recoverable: number; // 0-100, share of this leakage we could plausibly recover
}

export const leakageItems: LeakageItem[] = [
  {
    key: "bench-cost",
    label: "Bench cost",
    costEur: 840000,
    description: "Direct salary cost of consultants on bench beyond their energy threshold.",
    trend: "up",
    changePct: 12,
    recoverable: 65,
  },
  {
    key: "sub-utilisation",
    label: "Sub-utilisation",
    costEur: 620000,
    description: "Consultants billing below 80% target across active engagements.",
    trend: "up",
    changePct: 8,
    recoverable: 55,
  },
  {
    key: "scope-absorption",
    label: "Scope absorption",
    costEur: 410000,
    description: "Out-of-scope work absorbed into fixed-price engagements.",
    trend: "down",
    changePct: -4,
    recoverable: 45,
  },
  {
    key: "contractor-spend",
    label: "Contractor over-spend",
    costEur: 380000,
    description: "Contractors used where internal capacity existed but wasn't surfaced.",
    trend: "up",
    changePct: 22,
    recoverable: 80,
  },
  {
    key: "lost-pitch",
    label: "Lost pitch opportunity",
    costEur: 290000,
    description: "Pitches lost where delivery readiness was a stated reason.",
    trend: "flat",
    changePct: 1,
    recoverable: 35,
  },
  {
    key: "rate-discount",
    label: "Rate discount erosion",
    costEur: 220000,
    description: "Renewals signed below rate-card on the back of incumbent pressure.",
    trend: "up",
    changePct: 6,
    recoverable: 30,
  },
];

export const monthlyLeakage = [
  { month: "Jan", value: 180000 },
  { month: "Feb", value: 195000 },
  { month: "Mar", value: 220000 },
  { month: "Apr", value: 245000 },
  { month: "May", value: 268000 },
  { month: "Jun", value: 292000 },
  { month: "Jul", value: 312000 },
  { month: "Aug", value: 335000 },
  { month: "Sep", value: 322000 },
  { month: "Oct", value: 295000 },
  { month: "Nov", value: 268000 },
  { month: "Dec", value: 248000 },
];

export const leakageByMarket = [
  { market: "Stockholm",  ytd: 920000, share: 35 },
  { market: "Oslo",       ytd: 680000, share: 26 },
  { market: "Copenhagen", ytd: 540000, share: 21 },
  { market: "Helsinki",   ytd: 480000, share: 18 },
];

export interface LeakageAiInsight {
  category: "biggest" | "fastest-growing" | "recoverable" | "structural";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

export const leakageAiInsights: LeakageAiInsight[] = [
  {
    category: "biggest",
    title: "Bench cost is the largest leak — €840k YTD",
    body: "Helsinki's Data & AI bench (3 specialists, 38 days each) plus the Insights & Analytics carry capacity in Stockholm account for €420k alone. Cross-market redeployment unlocks ~65% of this.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
  {
    category: "fastest-growing",
    title: "Contractor over-spend is up 22% YTD",
    body: "€380k spent on contractors where internal capacity existed but wasn't surfaced through the pitch board. Better demand signal would unlock most of this.",
    link: { href: "/teams", label: "Open the pitch board" },
  },
  {
    category: "structural",
    title: "Sub-utilisation is creeping up across the Nordics",
    body: "Aggregate utilisation at 78% (2pp below 80% target). The €620k cost reflects a 2pp shortfall × billable capacity. Closing the gap requires either firmer brief acceptance or workforce reduction in over-staffed practices.",
    link: { href: "/executive/capacity-demand", label: "See Capacity vs Demand" },
  },
  {
    category: "recoverable",
    title: "€1.45M of €2.76M total leakage is plausibly recoverable",
    body: "Highest-recoverability categories: contractor over-spend (80%), bench cost (65%), sub-utilisation (55%). Worth a quarterly recovery target.",
  },
];
