import type { Prospect, ScoringConfig } from "./seed";

export type Grade = "hot" | "warm" | "cold";

export interface ScoreResult {
  fit: number;
  engagement: number;
  total: number;
  grade: Grade;
}

export function scoreProspect(p: Prospect, cfg: ScoringConfig): ScoreResult {
  const w = cfg.fitWeights;
  const weightSum = w.title + w.industry + w.size + w.region || 1;
  const fit = Math.round(
    (p.fit.title * w.title + p.fit.industry * w.industry + p.fit.size * w.size + p.fit.region * w.region) / weightSum,
  );

  const e = p.engagement;
  const pts = cfg.engagementPoints;
  const engagement = Math.min(
    100,
    e.opens * pts.opens + e.clicks * pts.clicks + e.replies * pts.replies + e.meetings * pts.meetings,
  );

  const share = Math.max(0, Math.min(100, cfg.fitShare)) / 100;
  const total = Math.round(fit * share + engagement * (1 - share));
  const grade: Grade = total >= cfg.hotAt ? "hot" : total >= cfg.warmAt ? "warm" : "cold";
  return { fit, engagement, total, grade };
}

export const GRADE_STYLE: Record<Grade, { label: string; color: string; bg: string; text: string }> = {
  hot: { label: "Hot", color: "#F23D7A", bg: "#FFE8F0", text: "#B0154F" },
  warm: { label: "Warm", color: "#FF9F5A", bg: "#FFF0E4", text: "#A04A0C" },
  cold: { label: "Cold", color: "#6E7090", bg: "#F4F4F8", text: "#4B4C6B" },
};

export function renderTemplate(
  template: string,
  p: Prospect,
  extras: { opening: string; pain: string; proof: string; sender: string },
): string {
  const first = p.name.split(" ").filter((w) => !/^dr\.?$/i.test(w))[0] ?? p.name;
  const map: Record<string, string> = {
    "{{first_name}}": first,
    "{{company}}": p.company,
    "{{title}}": p.title,
    "{{sender_name}}": extras.sender,
    "{{meeting_link}}": "humyn.reach/book/alex",
    "{{opening_line}}": extras.opening,
    "{{pain_point}}": extras.pain,
    "{{proof_point}}": extras.proof,
  };
  return Object.keys(map).reduce((acc, k) => acc.split(k).join(map[k]), template);
}
