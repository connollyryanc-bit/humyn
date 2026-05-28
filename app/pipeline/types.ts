import type { EnergyKey } from "../page";

export type JobStatus = "draft" | "active" | "paused" | "closed";

export interface Job {
  id: number;
  internalTitle: string;
  externalTitle: string;
  department: string;
  location: string;
  market: string;
  status: JobStatus;
  recruiterId: number;
  hiringManagerId: number;
  tags: string[];
  createdDate: string;
  applicationCount: number;
  requiredEnergy: EnergyKey;
  teamId: number | null;
}

export type CandidateSource =
  | "direct"
  | "linkedin"
  | "referral"
  | "internal"
  | "nurture"
  | "agency";

export interface Candidate {
  id: number;
  jobId: number;
  name: string;
  email: string;
  location: string;
  linkedIn: string | null;
  currentStage: string;
  rating: number;
  tags: string[];
  isInternal: boolean;
  pulseProfile: {
    primary: EnergyKey;
    secondary: EnergyKey;
    scores: Record<EnergyKey, number>;
    wheelPosition: string;
    confidence: number;
  } | null;
  teamFitScore: number | null;
  appliedDate: string;
  source: CandidateSource;
}

export const DEFAULT_STAGES = [
  { key: "inbox",             label: "Inbox",              tone: "#9A9A9A" },
  { key: "reviewing",         label: "Reviewing",          tone: "#D4974A" },
  { key: "phone-screening",   label: "Phone screening",    tone: "#D4974A" },
  { key: "manager-interview", label: "Manager interview",  tone: "#6B9FCC" },
  { key: "hr-interview",      label: "HR interview",       tone: "#6B9FCC" },
  { key: "group-interview",   label: "Group interview",    tone: "#6B9FCC" },
  { key: "reference-check",   label: "Reference check",    tone: "#5CAB82" },
  { key: "offer",             label: "Offer",              tone: "#5CAB82" },
  { key: "hired",             label: "Hired",              tone: "#5CAB82" },
] as const;

export type DefaultStageKey = (typeof DEFAULT_STAGES)[number]["key"];

export const JOB_STATUS_TONE: Record<JobStatus, { color: string; bg: string; label: string }> = {
  draft:   { color: "#9A9A9A", bg: "#F3F0EA", label: "Draft" },
  active:  { color: "#3D8A61", bg: "#EFF8F3", label: "Active" },
  paused:  { color: "#B87A2E", bg: "#FEF8EE", label: "Paused" },
  closed:  { color: "#4D4945", bg: "#F3F0EA", label: "Closed" },
};
