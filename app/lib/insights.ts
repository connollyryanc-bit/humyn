/**
 * Deep-dive insights for a person's Pulse profile.
 *
 * Shared by the profile generator (/api/pulse), the backfill route
 * (/api/pulse/insights), the profile page and the Chrome extension.
 */

export type TraitKey =
  | "risk"
  | "trust"
  | "outlook"
  | "pace"
  | "expression"
  | "autonomy"
  | "dominance";

/** Each trait is a 0-100 position between two poles. 0 = left pole, 100 = right pole. */
export const TRAITS: { key: TraitKey; left: string; right: string }[] = [
  { key: "risk", left: "Risk-tolerant", right: "Risk-averse" },
  { key: "trust", left: "Trusting", right: "Sceptical" },
  { key: "outlook", left: "Optimistic", right: "Pragmatic" },
  { key: "pace", left: "Deliberate", right: "Fast-paced" },
  { key: "expression", left: "Matter-of-fact", right: "Expressive" },
  { key: "autonomy", left: "Autonomous", right: "Collaborative" },
  { key: "dominance", left: "Supporting", right: "Dominant" },
];

export interface PersonInsights {
  traits: Record<TraitKey, number>;
  behaviours: string[];
  strengths: string[];
  blindSpots: string[];
  firstImpression: string;
  buildingTrust: string;
  givingFeedback: string;
  driveToAction: string;
  negotiating: string;
  followingUp: string;
  meetings: string;
  doList: string[];
  dontList: string[];
}

/** Coaching sections shown as individual cards. */
export const COACHING_SECTIONS: { key: keyof PersonInsights; label: string }[] = [
  { key: "firstImpression", label: "Making a great first impression" },
  { key: "buildingTrust", label: "Building trust" },
  { key: "givingFeedback", label: "Giving feedback" },
  { key: "driveToAction", label: "Driving them to take action" },
  { key: "negotiating", label: "Negotiating" },
  { key: "followingUp", label: "Following up" },
  { key: "meetings", label: "Running meetings with them" },
];

/** JSON fragment appended to the profile prompt. */
export const INSIGHTS_JSON_SPEC = `"insights": {
    "traits": {
      "risk": 0-100 (0 = risk-tolerant, 100 = risk-averse),
      "trust": 0-100 (0 = trusting, 100 = sceptical),
      "outlook": 0-100 (0 = optimistic, 100 = pragmatic),
      "pace": 0-100 (0 = deliberate, 100 = fast-paced),
      "expression": 0-100 (0 = matter-of-fact, 100 = expressive),
      "autonomy": 0-100 (0 = autonomous, 100 = collaborative),
      "dominance": 0-100 (0 = supporting, 100 = dominant)
    },
    "behaviours": ["4 short typical behaviours, each under 12 words"],
    "strengths": ["4 short strengths, each under 12 words"],
    "blindSpots": ["4 short blind spots, each under 12 words"],
    "firstImpression": "2 sentences: how to make a strong first impression",
    "buildingTrust": "2 sentences: how to build trust over time",
    "givingFeedback": "2 sentences: how to give feedback so it lands",
    "driveToAction": "2 sentences: how to get them to act or decide",
    "negotiating": "2 sentences: how to negotiate with them",
    "followingUp": "2 sentences: how and when to follow up",
    "meetings": "2 sentences: how to run a meeting with them",
    "doList": ["4 short imperative do's"],
    "dontList": ["4 short imperative don'ts"]
  }`;

function strList(v: unknown, max = 6): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, max);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Coerce whatever the model returned into a safe PersonInsights, or null if unusable. */
export function normaliseInsights(raw: unknown): PersonInsights | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const rawTraits = (r.traits && typeof r.traits === "object" ? r.traits : {}) as Record<string, unknown>;

  const traits = {} as Record<TraitKey, number>;
  let traitCount = 0;
  for (const t of TRAITS) {
    const n = Number(rawTraits[t.key]);
    if (Number.isFinite(n)) {
      traits[t.key] = Math.max(0, Math.min(100, Math.round(n)));
      traitCount++;
    } else {
      traits[t.key] = 50;
    }
  }

  const insights: PersonInsights = {
    traits,
    behaviours: strList(r.behaviours),
    strengths: strList(r.strengths),
    blindSpots: strList(r.blindSpots),
    firstImpression: str(r.firstImpression),
    buildingTrust: str(r.buildingTrust),
    givingFeedback: str(r.givingFeedback),
    driveToAction: str(r.driveToAction),
    negotiating: str(r.negotiating),
    followingUp: str(r.followingUp),
    meetings: str(r.meetings),
    doList: strList(r.doList),
    dontList: strList(r.dontList),
  };

  const hasContent =
    traitCount >= 4 || insights.behaviours.length > 0 || insights.strengths.length > 0;
  return hasContent ? insights : null;
}
