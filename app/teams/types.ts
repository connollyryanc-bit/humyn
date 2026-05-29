import type { EnergyKey } from "../page";

export type BriefStage =
  | "unstaffed"
  | "analysing"
  | "proposed"
  | "buyin"
  | "confirmed"
  | "active";

export type BriefPriority = "urgent" | "normal" | "low";

export type BriefRoleLevel = "junior" | "mid" | "senior" | "lead";

export interface BriefRole {
  id: number;
  title: string;
  level: BriefRoleLevel;
  requiredEnergy: EnergyKey;
  skills: string[];
  openings: number;
  filled: number;
  applicants: number;
  duration: string;
  dayRateBandEur: { min: number; max: number };
  description: string;
}

export interface Brief {
  id: number;
  name: string;
  client: string;
  market: string;
  stage: BriefStage;
  startDate: string;
  duration: string;
  harmonyScore: number | null;
  teamIds: number[];
  priority: BriefPriority;
  briefType: string;
  daysToStart: number | null;
  scope: string;
  context: string;
  budget: string;
  requiredEnergy: {
    driver: "essential" | "high" | "medium" | "low";
    energizer: "essential" | "high" | "medium" | "low";
    supporter: "essential" | "high" | "medium" | "low";
    analyst: "essential" | "high" | "medium" | "low";
  };
  roles: BriefRole[];
}

export type PitchRoleLevel = "junior" | "mid" | "senior" | "lead";

export interface PitchRole {
  id: number;
  briefId: number;
  title: string;
  briefName: string;
  market: string;
  duration: string;
  startDate: string;
  level: PitchRoleLevel;
  requiredEnergy: EnergyKey;
  skills: string[];
  applicantCount: number;
  closingDate: string;
  creditsOnSelection: number;
  postedDaysAgo: number;
}

export const BRIEF_STAGES: { key: BriefStage; label: string; tone: string }[] = [
  { key: "unstaffed", label: "Unstaffed",  tone: "#D97B73" },
  { key: "analysing", label: "Analysing",  tone: "#D4974A" },
  { key: "proposed",  label: "Proposed",   tone: "#6B9FCC" },
  { key: "buyin",     label: "Buy-in",     tone: "#6B9FCC" },
  { key: "confirmed", label: "Confirmed",  tone: "#5CAB82" },
  { key: "active",    label: "Active",     tone: "#5CAB82" },
];

export const TEAMS_TABS = [
  { key: "portfolio",    label: "Portfolio" },
  { key: "kanban",       label: "Kanban" },
  { key: "timeline",     label: "Timeline" },
  { key: "pitch",        label: "Pitch board" },
  { key: "availability", label: "Availability" },
  { key: "build",        label: "Build team" },
  { key: "markets",      label: "Markets" },
] as const;

export type TeamsTabKey = (typeof TEAMS_TABS)[number]["key"];
