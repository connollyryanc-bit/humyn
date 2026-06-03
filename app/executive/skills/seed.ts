/**
 * Skills Intelligence — mock data
 *
 * Current capability inventory vs forecast demand at 6, 12 and 24 months.
 * Identifies critical future skills, declining skills, and upskilling
 * opportunities the firm should build into rather than hire for.
 */

export type SkillTrend = "rising" | "stable" | "declining";

export interface Skill {
  name: string;
  category: string;
  currentSupply: number; // FTEs with this skill at usable level
  certifiedCount: number; // formal certifications
  demand6m: number;       // FTEs needed in 6 months
  demand12m: number;      // FTEs needed in 12 months
  demand24m: number;      // FTEs needed in 24 months
  trend: SkillTrend;
  criticalityScore: number; // 0-100
  upskillFeasibility: number; // 0-100 — how feasible to upskill into this from adjacent skills
}

export const skills: Skill[] = [
  // Engineering
  { name: "React / Next.js",       category: "Frontend",       currentSupply: 22, certifiedCount: 8,  demand6m: 26, demand12m: 30, demand24m: 34, trend: "rising",    criticalityScore: 88, upskillFeasibility: 70 },
  { name: "TypeScript",            category: "Frontend",       currentSupply: 38, certifiedCount: 0,  demand6m: 40, demand12m: 44, demand24m: 48, trend: "rising",    criticalityScore: 82, upskillFeasibility: 85 },
  { name: "React Native (Mobile)", category: "Mobile",         currentSupply: 6,  certifiedCount: 2,  demand6m: 11, demand12m: 14, demand24m: 16, trend: "rising",    criticalityScore: 90, upskillFeasibility: 60 },
  { name: "iOS native (Swift)",    category: "Mobile",         currentSupply: 4,  certifiedCount: 1,  demand6m: 5,  demand12m: 6,  demand24m: 6,  trend: "stable",    criticalityScore: 55, upskillFeasibility: 35 },
  { name: "Go",                    category: "Backend",        currentSupply: 9,  certifiedCount: 0,  demand6m: 12, demand12m: 14, demand24m: 15, trend: "rising",    criticalityScore: 78, upskillFeasibility: 55 },
  { name: "Java / Spring",         category: "Backend",        currentSupply: 16, certifiedCount: 6,  demand6m: 14, demand12m: 12, demand24m: 10, trend: "declining", criticalityScore: 48, upskillFeasibility: 80 },
  { name: ".NET",                  category: "Backend",        currentSupply: 14, certifiedCount: 4,  demand6m: 11, demand12m: 9,  demand24m: 8,  trend: "declining", criticalityScore: 42, upskillFeasibility: 80 },
  { name: "Event-driven (Kafka)",  category: "Architecture",   currentSupply: 5,  certifiedCount: 1,  demand6m: 8,  demand12m: 10, demand24m: 12, trend: "rising",    criticalityScore: 84, upskillFeasibility: 50 },

  // Data & AI
  { name: "Applied ML / Forecasting", category: "Data & AI",   currentSupply: 3,  certifiedCount: 2,  demand6m: 8,  demand12m: 11, demand24m: 14, trend: "rising",    criticalityScore: 95, upskillFeasibility: 40 },
  { name: "MLOps",                 category: "Data & AI",      currentSupply: 2,  certifiedCount: 1,  demand6m: 5,  demand12m: 7,  demand24m: 9,  trend: "rising",    criticalityScore: 88, upskillFeasibility: 55 },
  { name: "LLM / Generative AI",   category: "Data & AI",      currentSupply: 4,  certifiedCount: 0,  demand6m: 12, demand12m: 18, demand24m: 24, trend: "rising",    criticalityScore: 98, upskillFeasibility: 50 },
  { name: "Causal inference",      category: "Data & AI",      currentSupply: 2,  certifiedCount: 1,  demand6m: 3,  demand12m: 4,  demand24m: 5,  trend: "stable",    criticalityScore: 62, upskillFeasibility: 30 },

  // Design
  { name: "Product design",        category: "Design",         currentSupply: 18, certifiedCount: 0,  demand6m: 22, demand12m: 24, demand24m: 26, trend: "rising",    criticalityScore: 80, upskillFeasibility: 65 },
  { name: "Service design",        category: "Design",         currentSupply: 12, certifiedCount: 3,  demand6m: 14, demand12m: 16, demand24m: 18, trend: "rising",    criticalityScore: 76, upskillFeasibility: 55 },
  { name: "Design systems",        category: "Design",         currentSupply: 8,  certifiedCount: 1,  demand6m: 10, demand12m: 12, demand24m: 14, trend: "rising",    criticalityScore: 72, upskillFeasibility: 75 },

  // Strategy
  { name: "Innovation strategy",   category: "Strategy",       currentSupply: 9,  certifiedCount: 0,  demand6m: 10, demand12m: 11, demand24m: 12, trend: "stable",    criticalityScore: 68, upskillFeasibility: 45 },
  { name: "Workshop facilitation", category: "Strategy",       currentSupply: 16, certifiedCount: 4,  demand6m: 18, demand12m: 20, demand24m: 22, trend: "rising",    criticalityScore: 65, upskillFeasibility: 75 },

  // Delivery
  { name: "Programme management",  category: "Delivery",       currentSupply: 14, certifiedCount: 8,  demand6m: 15, demand12m: 16, demand24m: 17, trend: "stable",    criticalityScore: 72, upskillFeasibility: 60 },
  { name: "Agile coaching",        category: "Delivery",       currentSupply: 7,  certifiedCount: 5,  demand6m: 8,  demand12m: 9,  demand24m: 10, trend: "stable",    criticalityScore: 58, upskillFeasibility: 65 },

  // Cloud / Ops
  { name: "AWS architecture",      category: "Cloud",          currentSupply: 12, certifiedCount: 7,  demand6m: 14, demand12m: 16, demand24m: 18, trend: "rising",    criticalityScore: 78, upskillFeasibility: 70 },
  { name: "Cloud migration",       category: "Cloud",          currentSupply: 8,  certifiedCount: 3,  demand6m: 10, demand12m: 11, demand24m: 12, trend: "rising",    criticalityScore: 70, upskillFeasibility: 65 },
];

export interface SkillsAiInsight {
  category: "critical-gap" | "upskill" | "declining" | "structural";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

export const skillsAiInsights: SkillsAiInsight[] = [
  {
    category: "critical-gap",
    title: "LLM / Generative AI is the largest forecast gap",
    body: "Current supply of 4 FTEs vs forecast demand of 12 at 6 months, 18 at 12 months, 24 at 24 months. Highest criticality score on the board (98). Materially affects which commercial work we can credibly pitch.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
  {
    category: "critical-gap",
    title: "Applied ML / MLOps gap is structural",
    body: "Applied ML at 3 FTEs against 14 needed in 24 months; MLOps at 2 vs 9. Both critical. Upskilling feasibility 40-55% — combined hiring + upskilling programme required.",
    link: { href: "/executive/pipeline", label: "See Pipeline Readiness" },
  },
  {
    category: "upskill",
    title: "Java + .NET surplus is the natural upskilling source for AI/ML and Mobile",
    body: "16 Java + 14 .NET engineers, declining demand. Adjacent-skill upskilling feasibility 80% into modern backend, 55-60% into Mobile RN or applied ML. Six-month structured programme would convert ~30% of this pool.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
  {
    category: "declining",
    title: "Java and .NET demand is trending down",
    body: "Combined supply 30 FTEs but combined 24-month demand only 18. The right move is upskilling rather than reducing — internal first.",
  },
];
