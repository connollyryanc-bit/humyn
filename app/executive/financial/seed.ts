/**
 * Financial Workforce — mock data
 *
 * The CFO view: revenue per employee, gross profit per employee, margin by
 * region and practice, cost by skill group, utilisation by region.
 */

export interface PerEmployee {
  scope: string;
  headcount: number;
  revenuePerEmployee: number; // €/yr
  grossProfitPerEmployee: number; // €/yr
  marginPct: number; // 0-100
  utilisationPct: number; // 0-100
}

// Per-market (Nordic cities). Historically called "regions" — kept the export name
// for back-compat with the page until the page is updated to use `markets`.
export const markets: PerEmployee[] = [
  { scope: "Stockholm",  headcount: 64, revenuePerEmployee: 248000, grossProfitPerEmployee: 86000, marginPct: 34.7, utilisationPct: 80 },
  { scope: "Oslo",       headcount: 42, revenuePerEmployee: 254000, grossProfitPerEmployee: 92000, marginPct: 36.2, utilisationPct: 81 },
  { scope: "Copenhagen", headcount: 48, revenuePerEmployee: 232000, grossProfitPerEmployee: 76000, marginPct: 32.8, utilisationPct: 76 },
  { scope: "Helsinki",   headcount: 33, revenuePerEmployee: 218000, grossProfitPerEmployee: 68000, marginPct: 31.2, utilisationPct: 73 },
  { scope: "London",     headcount: 32, revenuePerEmployee: 268000, grossProfitPerEmployee: 96000, marginPct: 35.8, utilisationPct: 82 },
  { scope: "Munich",     headcount: 21, revenuePerEmployee: 262000, grossProfitPerEmployee: 92000, marginPct: 35.1, utilisationPct: 79 },
  { scope: "Paris",      headcount: 14, revenuePerEmployee: 246000, grossProfitPerEmployee: 84000, marginPct: 34.1, utilisationPct: 76 },
];

// True region axis — the level above markets.
export const regions: PerEmployee[] = [
  { scope: "Nordics", headcount: 187, revenuePerEmployee: 240000, grossProfitPerEmployee: 82000, marginPct: 34.2, utilisationPct: 78 },
  { scope: "UK",      headcount: 32,  revenuePerEmployee: 268000, grossProfitPerEmployee: 96000, marginPct: 35.8, utilisationPct: 82 },
  { scope: "DACH",    headcount: 21,  revenuePerEmployee: 262000, grossProfitPerEmployee: 92000, marginPct: 35.1, utilisationPct: 79 },
  { scope: "France",  headcount: 14,  revenuePerEmployee: 246000, grossProfitPerEmployee: 84000, marginPct: 34.1, utilisationPct: 76 },
];

export const practices: PerEmployee[] = [
  { scope: "Engineering",           headcount: 38, revenuePerEmployee: 236000, grossProfitPerEmployee: 80000, marginPct: 33.9, utilisationPct: 79 },
  { scope: "Product Design",        headcount: 24, revenuePerEmployee: 252000, grossProfitPerEmployee: 92000, marginPct: 36.5, utilisationPct: 84 },
  { scope: "Data & AI",             headcount: 16, revenuePerEmployee: 286000, grossProfitPerEmployee: 108000, marginPct: 37.8, utilisationPct: 82 },
  { scope: "Strategy & Innovation", headcount: 12, revenuePerEmployee: 272000, grossProfitPerEmployee: 96000, marginPct: 35.3, utilisationPct: 78 },
  { scope: "Service Design",        headcount: 18, revenuePerEmployee: 238000, grossProfitPerEmployee: 82000, marginPct: 34.5, utilisationPct: 76 },
  { scope: "Programme Delivery",    headcount: 21, revenuePerEmployee: 226000, grossProfitPerEmployee: 72000, marginPct: 31.9, utilisationPct: 80 },
  { scope: "Cloud & Architecture",  headcount: 26, revenuePerEmployee: 248000, grossProfitPerEmployee: 88000, marginPct: 35.5, utilisationPct: 81 },
  { scope: "Insights & Analytics",  headcount: 14, revenuePerEmployee: 198000, grossProfitPerEmployee: 58000, marginPct: 29.3, utilisationPct: 70 },
];

export interface CostBucket {
  group: string;
  totalCostEur: number;
  headcount: number;
  avgFullyLoadedEur: number;
}

export const costBySkillGroup: CostBucket[] = [
  { group: "Senior + Lead (€2.4k+ day rate)",   totalCostEur: 6800000, headcount: 42, avgFullyLoadedEur: 162000 },
  { group: "Mid-level (€1.6k-€2.4k)",           totalCostEur: 7200000, headcount: 78, avgFullyLoadedEur: 92000 },
  { group: "Junior (€1.0k-€1.6k)",              totalCostEur: 3100000, headcount: 47, avgFullyLoadedEur: 66000 },
  { group: "Contractors (any seniority)",       totalCostEur: 1840000, headcount: 14, avgFullyLoadedEur: 131000 },
  { group: "Apprentices / graduates",           totalCostEur: 380000,  headcount: 6,  avgFullyLoadedEur: 63000  },
];

export const quarterlyTrend = [
  { q: "Q3 25", revenue: 5.4, margin: 33.1 },
  { q: "Q4 25", revenue: 5.6, margin: 33.8 },
  { q: "Q1 26", revenue: 5.8, margin: 34.7 },
  { q: "Q2 26", revenue: 6.1, margin: 34.5 },
  { q: "Q3 26", revenue: 6.4, margin: 35.2 },
];

export interface FinancialAiInsight {
  category: "outperformer" | "underperformer" | "trend" | "risk";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

export const financialAiInsights: FinancialAiInsight[] = [
  {
    category: "outperformer",
    title: "Data & AI is the highest-margin practice at 37.8%",
    body: "Despite being the smallest practice, Data & AI generates €108k gross profit per employee — €20k above the firm average. Worth protecting the capability through hiring and upskilling rather than letting the shortage erode margin.",
    link: { href: "/executive/skills", label: "See Skills Intelligence" },
  },
  {
    category: "underperformer",
    title: "Insights & Analytics underperforms structurally",
    body: "29.3% margin and 70% utilisation. Carries 300+ days of slack at every horizon. Either redeploy structurally into Data & AI work, or rebalance the practice. Worst margin on the board.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
  {
    category: "trend",
    title: "Quarterly revenue +18% YoY, margin +1.4pp",
    body: "Healthy directional trend across the last five quarters. Q3 26 forecasts continued margin expansion to 35.2% as Data & AI demand grows and Insights & Analytics is rebalanced.",
  },
  {
    category: "risk",
    title: "Helsinki is the weakest market on both axes",
    body: "Lowest revenue per employee (€218k) and lowest utilisation (73%). The Data & AI capability concentration creates margin upside, but only if the shortage is closed.",
    link: { href: "/executive/capacity-demand", label: "See Capacity vs Demand" },
  },
];
