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
  { key: "inbox",             label: "Inbox",              tone: "#6E7090" },
  { key: "reviewing",         label: "Reviewing",          tone: "#FF9F5A" },
  { key: "phone-screening",   label: "Phone screening",    tone: "#FF9F5A" },
  { key: "manager-interview", label: "Manager interview",  tone: "#5B7BFF" },
  { key: "hr-interview",      label: "HR interview",       tone: "#5B7BFF" },
  { key: "group-interview",   label: "Group interview",    tone: "#5B7BFF" },
  { key: "reference-check",   label: "Reference check",    tone: "#A68BFF" },
  { key: "offer",             label: "Offer",              tone: "#A68BFF" },
  { key: "hired",             label: "Hired",              tone: "#A68BFF" },
] as const;

export type DefaultStageKey = (typeof DEFAULT_STAGES)[number]["key"];

export const JOB_STATUS_TONE: Record<JobStatus, { color: string; bg: string; label: string }> = {
  draft:   { color: "#6E7090", bg: "#F4F4F8", label: "Draft" },
  active:  { color: "#7C5CE6", bg: "#F4F0FF", label: "Active" },
  paused:  { color: "#D9782F", bg: "#FFF5EC", label: "Paused" },
  closed:  { color: "#4B4C6B", bg: "#F4F4F8", label: "Closed" },
};
