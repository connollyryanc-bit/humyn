import type { EnergyKey, Person } from "../lib/people-data";
import { SEGMENT_LABEL, SEGMENT_PAIN, type Prospect } from "./seed";

interface EnergyProfileText {
  bestTrait: string;
  vice: string;
  drivers: string[];
  detractors: string[];
  howToSpeak: string;
  howToEmail: string;
}

/** Default guidance for a prospect, by primary energy. Replaced by the deep dive once generated. */
const ENERGY_PROFILE: Record<EnergyKey, EnergyProfileText> = {
  driver: {
    bestTrait: "Decisive and direct. Will tell you quickly whether there is a fit.",
    vice: "Can dismiss ideas that arrive without a clear result attached.",
    drivers: [
      "Clear, measurable outcomes",
      "Speed and momentum",
      "Being in control of the decision",
      "Straight talk with no padding",
    ],
    detractors: [
      "Long preamble before the point",
      "Vague claims without numbers",
      "Slow, committee-style decisions",
      "Being sold to rather than helped",
    ],
    howToSpeak:
      "Open with the result you can deliver, then stop talking. Keep calls short, ask for a decision, and be ready to be challenged. Respect their time and they will respect yours.",
    howToEmail:
      "Four or five lines, with the outcome in the first sentence and one clear ask. No attachments without a one-line summary. A direct subject line works better than a clever one.",
  },
  energizer: {
    bestTrait: "Enthusiastic and well connected. Quick to see possibilities and bring others along.",
    vice: "Can commit in the moment and lose track of the detail afterwards.",
    drivers: [
      "New ideas and fresh angles",
      "Working with and through people",
      "Recognition for being first",
      "Variety and momentum",
    ],
    detractors: [
      "Heavy process and paperwork",
      "A cold, formal tone",
      "Being asked for detail too early",
      "Working alone for long stretches",
    ],
    howToSpeak:
      "Be warm and curious. Start with something personal or topical, share the idea with energy, and let them talk. A conversation lands better than a pitch.",
    howToEmail:
      "Friendly and short, with a personal first line and a clear picture of the possibility. Suggest a quick chat rather than a form. Avoid walls of detail.",
  },
  supporter: {
    bestTrait: "Patient, trusted and a good listener. People bring problems to them.",
    vice: "May avoid saying no and take a long time to commit.",
    drivers: [
      "Harmony and fairness within the team",
      "Long-term relationships",
      "Being heard and consulted",
      "Stability and predictability",
    ],
    detractors: [
      "Pressure and artificial urgency",
      "Aggressive or pushy approaches",
      "Sudden change without warning",
      "Conflict in the room",
    ],
    howToSpeak:
      "Slow down and listen first. Acknowledge their team and context, offer help rather than a pitch, and give them time to think before asking for anything.",
    howToEmail:
      "Polite and unhurried, with a human opening. Make one gentle ask, show you understand how a decision would affect their people, and avoid deadlines.",
  },
  analyst: {
    bestTrait: "Precise and thorough. Will spot the flaw in a weak argument.",
    vice: "Can over-analyse and delay a decision while waiting for more data.",
    drivers: [
      "Accuracy and evidence",
      "Clear structure and process",
      "Time to think before deciding",
      "Quality and getting it right",
    ],
    detractors: [
      "Vague or inflated claims",
      "Being rushed to a decision",
      "Surprises and last-minute changes",
      "Opinion presented as fact",
    ],
    howToSpeak:
      "Be prepared and precise. Share data and a structure for the conversation in advance, answer questions fully, and do not push for an instant decision.",
    howToEmail:
      "Structured and specific, with one concrete data point or case study. State exactly what you are offering and let them review before suggesting a call.",
  },
};

/** Shape a prospect as a Person so it can use the same profile screens as the people directory. */
export function prospectToPerson(p: Prospect): Person {
  const text = ENERGY_PROFILE[p.primary];
  return {
    id: p.id,
    name: p.name,
    initials: p.initials,
    role: `${p.title}, ${p.company}`,
    location: p.region,
    primary: p.primary,
    secondary: p.secondary,
    scores: p.scores,
    utilisation: 0,
    available: "now",
    clients: 0,
    revenue: "",
    dayRate: 0,
    bio: `${p.title} at ${p.company} (${SEGMENT_LABEL[p.segment]}, ${p.region}, ${p.companySize} employees). Likely focus right now: ${SEGMENT_PAIN[p.segment]}.`,
    capabilities: [SEGMENT_LABEL[p.segment], p.title, p.region, `${p.companySize} employees`],
    achievements: [],
    bestTrait: text.bestTrait,
    vice: text.vice,
    wheelPosition: p.wheelPosition,
    drivers: text.drivers,
    detractors: text.detractors,
    howToSpeak: text.howToSpeak,
    howToEmail: text.howToEmail,
    insights: p.insights ?? null,
  };
}
