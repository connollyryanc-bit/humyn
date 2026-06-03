/**
 * Executive Workforce Intelligence — mock data
 *
 * This is the foundation seed for the Executive module. Numbers are realistic for
 * a ~190-person professional services firm operating across the Nordic markets,
 * extrapolated to a European parent. Replace this with real ERP/CRM/HRIS feeds
 * when those integrations land.
 */

export type Trend = {
  value: number;        // signed pp/percentage delta
  forecast: number;     // forward projection
  variance: number;     // vs target
  direction: "up" | "down" | "flat";
};

export interface ExecutiveKpi {
  key: string;
  label: string;
  value: string;
  detail: string;
  trend: Trend;
  tone?: "positive" | "neutral" | "warning" | "critical";
}

export const executiveScope = {
  region: "Europe",
  consultants: 254,
  markets: 7,
  practices: 8,
  revenue: "€60.8M ARR",
};

export interface ExecutiveScopeShape {
  consultants: number;
  markets: number;
  practices: number;
  revenue: string;
}

export const executiveScopeByRegion: Record<string, ExecutiveScopeShape> = {
  Europe:  { consultants: 254, markets: 7, practices: 8, revenue: "€60.8M ARR" },
  Nordics: { consultants: 187, markets: 4, practices: 8, revenue: "€44.9M ARR" },
  UK:      { consultants: 32,  markets: 1, practices: 5, revenue: "€8.6M ARR"  },
  DACH:    { consultants: 21,  markets: 1, practices: 4, revenue: "€5.5M ARR"  },
  France:  { consultants: 14,  markets: 1, practices: 3, revenue: "€3.4M ARR"  },
};

export const executiveKpis: ExecutiveKpi[] = [
  {
    key: "revenue-forecast",
    label: "Revenue Forecast",
    value: "€15.7M",
    detail: "Q3 forecast across all European engagements",
    trend: { value: 2.1, forecast: 16.4, variance: -0.4, direction: "up" },
    tone: "positive",
  },
  {
    key: "gross-margin",
    label: "Gross Margin",
    value: "34.8%",
    detail: "Blended across European delivery work",
    trend: { value: -0.6, forecast: 34.2, variance: -1.8, direction: "down" },
    tone: "warning",
  },
  {
    key: "utilization",
    label: "Utilisation",
    value: "78%",
    detail: "Two points below the 80% target, trending up",
    trend: { value: 1.2, forecast: 80.4, variance: -2.0, direction: "up" },
    tone: "neutral",
  },
  {
    key: "bench",
    label: "Bench %",
    value: "11%",
    detail: "28 consultants currently on bench, 11 over the 14-day threshold",
    trend: { value: -0.3, forecast: 10.7, variance: 2.0, direction: "down" },
    tone: "neutral",
  },
  {
    key: "open-demand",
    label: "Open Demand",
    value: "€18.6M",
    detail: "Unstaffed and weighted pipeline over the next 90 days",
    trend: { value: 18, forecast: 19.4, variance: 0, direction: "up" },
    tone: "positive",
  },
  {
    key: "pipeline-coverage",
    label: "Pipeline Coverage",
    value: "1.4×",
    detail: "Weighted opportunity value vs revenue target",
    trend: { value: 0.1, forecast: 1.5, variance: -0.1, direction: "up" },
    tone: "neutral",
  },
  {
    key: "delivery-risk",
    label: "Delivery Risk",
    value: "Medium",
    detail: "3.4 / 5 composite — four programmes flagged amber",
    trend: { value: 0.2, forecast: 3.2, variance: 0.4, direction: "up" },
    tone: "warning",
  },
  {
    key: "skills-gap",
    label: "Skills Gap",
    value: "9",
    detail: "Critical skills shortages over the 12-month horizon",
    trend: { value: 2, forecast: 11, variance: 6, direction: "up" },
    tone: "critical",
  },
];

export const executiveKpisByRegion: Record<string, ExecutiveKpi[]> = {
  Europe: executiveKpis,
  Nordics: [
    { key: "revenue-forecast",  label: "Revenue Forecast",  value: "€11.2M", detail: "Q3 forecast across Nordic engagements",         trend: { value: 2.1, forecast: 11.8, variance: -0.3, direction: "up" },   tone: "positive" },
    { key: "gross-margin",      label: "Gross Margin",      value: "34.2%",  detail: "Blended across Nordic delivery work",            trend: { value: -0.8, forecast: 33.5, variance: -2.0, direction: "down" }, tone: "warning"  },
    { key: "utilization",       label: "Utilisation",       value: "78%",    detail: "Two points below the 80% target",                trend: { value: 1.2, forecast: 80.4, variance: -2.0, direction: "up" },   tone: "neutral"  },
    { key: "bench",             label: "Bench %",           value: "12%",    detail: "23 consultants on bench, 9 over the 14-day threshold", trend: { value: -0.3, forecast: 11.1, variance: 2.0, direction: "down" }, tone: "neutral" },
    { key: "open-demand",       label: "Open Demand",       value: "€11.2M", detail: "Unstaffed + weighted pipeline · next 90 days",   trend: { value: 18, forecast: 12.4, variance: 0, direction: "up" },       tone: "positive" },
    { key: "pipeline-coverage", label: "Pipeline Coverage", value: "1.4×",   detail: "Weighted opportunity value vs revenue target",   trend: { value: 0.1, forecast: 1.5, variance: -0.1, direction: "up" },    tone: "neutral"  },
    { key: "delivery-risk",     label: "Delivery Risk",     value: "Medium", detail: "3 programmes flagged amber",                      trend: { value: 0.2, forecast: 3.2, variance: 0.4, direction: "up" },     tone: "warning"  },
    { key: "skills-gap",        label: "Skills Gap",        value: "7",      detail: "Critical skills shortages · 12-month horizon",   trend: { value: 2, forecast: 9, variance: 5, direction: "up" },           tone: "critical" },
  ],
  UK: [
    { key: "revenue-forecast",  label: "Revenue Forecast",  value: "€2.1M",  detail: "Q3 forecast across UK engagements",              trend: { value: 3.4, forecast: 2.3, variance: 0.1, direction: "up" },     tone: "positive" },
    { key: "gross-margin",      label: "Gross Margin",      value: "35.8%",  detail: "UK blended margin — above firm average",         trend: { value: 0.3, forecast: 36.0, variance: 1.0, direction: "up" },    tone: "positive" },
    { key: "utilization",       label: "Utilisation",       value: "82%",    detail: "Above target on the back of Tesco + Barclays",   trend: { value: 1.8, forecast: 83.0, variance: 2.0, direction: "up" },    tone: "positive" },
    { key: "bench",             label: "Bench %",           value: "8%",     detail: "3 consultants on bench",                          trend: { value: -0.5, forecast: 7.5, variance: -2.0, direction: "down" }, tone: "positive" },
    { key: "open-demand",       label: "Open Demand",       value: "€4.6M",  detail: "Unstaffed + weighted pipeline · next 90 days",   trend: { value: 22, forecast: 5.0, variance: 0.2, direction: "up" },      tone: "positive" },
    { key: "pipeline-coverage", label: "Pipeline Coverage", value: "1.7×",   detail: "UK pipeline is the strongest in Europe",         trend: { value: 0.3, forecast: 1.8, variance: 0.3, direction: "up" },     tone: "positive" },
    { key: "delivery-risk",     label: "Delivery Risk",     value: "Medium", detail: "Lloyds discovery flagged amber",                  trend: { value: 0.1, forecast: 2.9, variance: 0.1, direction: "up" },     tone: "warning"  },
    { key: "skills-gap",        label: "Skills Gap",        value: "2",      detail: "AI/ML and senior product leadership",            trend: { value: 1, forecast: 3, variance: 1, direction: "up" },           tone: "critical" },
  ],
  DACH: [
    { key: "revenue-forecast",  label: "Revenue Forecast",  value: "€1.4M",  detail: "Q3 forecast across DACH engagements",            trend: { value: 1.8, forecast: 1.5, variance: 0, direction: "up" },       tone: "positive" },
    { key: "gross-margin",      label: "Gross Margin",      value: "35.1%",  detail: "Healthy automotive + banking blend",              trend: { value: 0.4, forecast: 35.4, variance: 0.4, direction: "up" },    tone: "positive" },
    { key: "utilization",       label: "Utilisation",       value: "79%",    detail: "On target",                                       trend: { value: 0.6, forecast: 80.0, variance: -1.0, direction: "up" },   tone: "neutral"  },
    { key: "bench",             label: "Bench %",           value: "9%",     detail: "2 consultants on bench",                          trend: { value: 0.4, forecast: 9.5, variance: 0.5, direction: "up" },     tone: "neutral"  },
    { key: "open-demand",       label: "Open Demand",       value: "€2.1M",  detail: "Allianz + Siemens active deals",                  trend: { value: 8, forecast: 2.3, variance: 0, direction: "up" },         tone: "positive" },
    { key: "pipeline-coverage", label: "Pipeline Coverage", value: "1.5×",   detail: "Healthy pipeline coverage",                       trend: { value: 0.0, forecast: 1.5, variance: 0, direction: "flat" },     tone: "neutral"  },
    { key: "delivery-risk",     label: "Delivery Risk",     value: "Low",    detail: "No programmes flagged amber",                    trend: { value: 0, forecast: 2.5, variance: -0.5, direction: "flat" },    tone: "positive" },
    { key: "skills-gap",        label: "Skills Gap",        value: "1",      detail: "Senior cloud architecture",                       trend: { value: 0, forecast: 1, variance: 0, direction: "flat" },         tone: "warning"  },
  ],
  France: [
    { key: "revenue-forecast",  label: "Revenue Forecast",  value: "€0.9M",  detail: "Q3 forecast — BNP discovery on plan",            trend: { value: 1.2, forecast: 1.0, variance: 0, direction: "up" },       tone: "positive" },
    { key: "gross-margin",      label: "Gross Margin",      value: "34.1%",  detail: "France blended margin",                           trend: { value: 0.1, forecast: 34.2, variance: -0.5, direction: "up" },   tone: "neutral"  },
    { key: "utilization",       label: "Utilisation",       value: "76%",    detail: "Below target — investment for growth",            trend: { value: 0.8, forecast: 77.0, variance: -4.0, direction: "up" },   tone: "warning"  },
    { key: "bench",             label: "Bench %",           value: "14%",    detail: "2 consultants on bench, growth phase",            trend: { value: 0.5, forecast: 14.5, variance: 2.0, direction: "up" },    tone: "neutral"  },
    { key: "open-demand",       label: "Open Demand",       value: "€0.7M",  detail: "Build phase — pipeline forming",                  trend: { value: 12, forecast: 0.8, variance: 0, direction: "up" },        tone: "positive" },
    { key: "pipeline-coverage", label: "Pipeline Coverage", value: "1.1×",   detail: "Forming pipeline — coverage thin",                trend: { value: 0.2, forecast: 1.3, variance: -0.3, direction: "up" },    tone: "warning"  },
    { key: "delivery-risk",     label: "Delivery Risk",     value: "Low",    detail: "All engagements healthy",                         trend: { value: 0, forecast: 2.2, variance: -0.8, direction: "flat" },    tone: "positive" },
    { key: "skills-gap",        label: "Skills Gap",        value: "0",      detail: "Capability balanced to current demand",           trend: { value: 0, forecast: 0, variance: 0, direction: "flat" },         tone: "positive" },
  ],
};

export const aiExecutiveRead = {
  generatedAt: "2026-05-29 08:14 CET",
  source: "claude" as const,
  paragraphs: [
    "Pipeline coverage at 1.4× is healthy and trending up, but Q3 revenue forecast remains €0.3M below target with gross margin slipping 0.8 points on the back of higher contractor utilisation in Stockholm and Oslo.",
    "Critical exposure: the AI/ML skills gap widened to seven roles after three confirmed Q4 starts that need specialists we don't currently have internally. Helsinki utilisation breaking 86% raises burnout risk on the OP Financial programme — two consultants flagged amber.",
    "Cross-Nordic redeployment unlocks an estimated €420k of bench cost before any hiring decision. The Workforce Optimization Engine recommends upskilling four mid-level consultants into the AI/ML capability over the next 90 days; estimated cost-to-value ratio is materially better than external hires.",
  ],
};

export interface ExecutiveModuleSummary {
  href: string;
  title: string;
  body: string;
  status: string;
  statusTone: "neutral" | "warning" | "critical" | "positive";
}

export const executiveModules: ExecutiveModuleSummary[] = [
  {
    href: "/executive/capacity-demand",
    title: "Capacity vs Demand Intelligence",
    body: "Workforce supply vs confirmed and forecast demand. 30/60/90/180/365-day horizons across regions and practices.",
    status: "3 shortages forecast within 60d",
    statusTone: "warning",
  },
  {
    href: "/executive/pipeline",
    title: "Pipeline Readiness",
    body: "Upcoming pitches with required skills, FTEs and delivery confidence. Which deals to chase vs decline.",
    status: "2 high-value opps at delivery risk",
    statusTone: "warning",
  },
  {
    href: "/executive/revenue-leakage",
    title: "Revenue Leakage",
    body: "Bench cost, unused capacity, opportunity loss. Where capacity isn't converting to revenue.",
    status: "€840k bench cost YTD",
    statusTone: "critical",
  },
  {
    href: "/executive/optimization",
    title: "Workforce Optimization Engine",
    body: "AI evaluates redeployment, upskilling and partner options before any hiring or workforce reduction.",
    status: "12 actions identified",
    statusTone: "positive",
  },
  {
    href: "/executive/skills",
    title: "Skills Intelligence",
    body: "Current inventory vs 6/12/24-month demand. Critical gaps, declining skills, upskilling opportunities.",
    status: "AI/ML gap widening",
    statusTone: "critical",
  },
  {
    href: "/executive/financial",
    title: "Financial Workforce",
    body: "Revenue per employee, gross profit per employee, margin by region and practice, cost by skill group.",
    status: "All practices ahead of plan",
    statusTone: "positive",
  },
  {
    href: "/executive/team-health",
    title: "Team Health Overlay",
    body: "Burnout risk, leadership balance, team dynamics, communication friction — Humyn intelligence applied to delivery risk.",
    status: "2 teams flagged",
    statusTone: "warning",
  },
  {
    href: "/executive/scenarios",
    title: "Scenario Planning",
    body: "Simulate a major win, a lost client, a hiring freeze, an acquisition, or AI-driven productivity gains.",
    status: "4 scenarios saved",
    statusTone: "neutral",
  },
];
