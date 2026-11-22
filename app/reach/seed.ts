import type { EnergyKey } from "../lib/people-data";

export type Segment = "manufacturing" | "healthcare" | "finance" | "retail";
export type Stage = "new" | "contacted" | "engaged" | "meeting" | "opportunity" | "won" | "lost";
export type Channel = "email" | "linkedin" | "call" | "sms";

export const SEGMENT_LABEL: Record<Segment, string> = {
  manufacturing: "B2B manufacturing",
  healthcare: "Healthcare",
  finance: "Finance",
  retail: "Retail",
};

export const STAGES: { key: Stage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "engaged", label: "Engaged" },
  { key: "meeting", label: "Meeting" },
  { key: "opportunity", label: "Opportunity" },
  { key: "won", label: "Won" },
];

export interface FitComponents {
  title: number;
  industry: number;
  size: number;
  region: number;
}

export interface Engagement {
  sent: number;
  opens: number;
  clicks: number;
  replies: number;
  meetings: number;
}

export interface Prospect {
  id: number;
  name: string;
  initials: string;
  title: string;
  company: string;
  segment: Segment;
  region: string;
  companySize: string;
  primary: EnergyKey;
  secondary: EnergyKey;
  scores: Record<EnergyKey, number>;
  wheelPosition: string;
  confidence: number;
  fit: FitComponents;
  engagement: Engagement;
  stage: Stage;
  source: "LinkedIn extension" | "Sales Navigator import" | "CRM sync" | "CSV import";
  addedDaysAgo: number;
  lastActivity: string;
  opener: string;
  doNotContact?: boolean;
  regulated?: boolean;
}

export interface ListFilter {
  segment?: Segment;
  titleIncludes?: string[];
  region?: string;
  energy?: EnergyKey;
}

export interface ProspectList {
  id: string;
  name: string;
  description: string;
  filter: ListFilter;
  custom?: boolean;
}

export interface SequenceStep {
  id: number;
  channel: Channel;
  delayDays: number;
  subject: string;
  body: string;
}

export interface Sequence {
  id: number;
  name: string;
  listId: string;
  status: "active" | "draft" | "paused";
  steps: SequenceStep[];
  stats: { enrolled: number; sent: number; opened: number; replied: number; meetings: number };
  genericReplyRate: number;
}

export const ENERGY_LABEL: Record<EnergyKey, string> = {
  driver: "Driver",
  energizer: "Energizer",
  supporter: "Supporter",
  analyst: "Analyst",
};

export const ENERGY_STYLE: Record<EnergyKey, { summary: string; do: string[]; dont: string[] }> = {
  driver: {
    summary: "Short, direct, outcome first. Gets to the point and asks for a clear next step.",
    do: ["Lead with the result and the number", "Keep it under 90 words", "Ask for one specific next step"],
    dont: ["Open with long pleasantries", "Bury the ask", "Send attachments without a summary"],
  },
  energizer: {
    summary: "Warm, idea-led and personable. Responds to enthusiasm and a fresh angle.",
    do: ["Open with something personal or topical", "Paint the possibility, not the process", "Suggest a conversation, not a form"],
    dont: ["Send a wall of detail", "Sound formal or cold", "Make it all about process"],
  },
  supporter: {
    summary: "Gentle, low pressure and trust-led. Values being listened to and not rushed.",
    do: ["Acknowledge their team and context", "Offer help, not a hard pitch", "Give them time to reply"],
    dont: ["Push urgency or deadlines", "Use aggressive language", "Ask for a decision in the first message"],
  },
  analyst: {
    summary: "Structured, specific and evidence-based. Wants facts before a call.",
    do: ["Include a concrete data point or case", "Be precise about what you are offering", "Let them review before meeting"],
    dont: ["Use vague claims", "Rush to a call", "Overstate results"],
  },
};

export const PLACEHOLDERS: { token: string; label: string; ai: boolean; hint: string }[] = [
  { token: "{{first_name}}", label: "First name", ai: false, hint: "From the prospect record." },
  { token: "{{company}}", label: "Company", ai: false, hint: "From the prospect record." },
  { token: "{{title}}", label: "Job title", ai: false, hint: "From the prospect record." },
  { token: "{{sender_name}}", label: "Your name", ai: false, hint: "From your account." },
  { token: "{{meeting_link}}", label: "Meeting link", ai: false, hint: "Your booking page." },
  { token: "{{opening_line}}", label: "Opening line", ai: true, hint: "Written per person from their profile and recent activity." },
  { token: "{{pain_point}}", label: "Pain point", ai: true, hint: "Chosen for their industry and role." },
  { token: "{{proof_point}}", label: "Proof point", ai: true, hint: "The most relevant case study for their sector." },
];

export const SEGMENT_PAIN: Record<Segment, string> = {
  manufacturing: "unplanned downtime and rising maintenance cost across plants",
  healthcare: "administrative load pulling clinical time away from patients",
  finance: "slow, manual onboarding and compliance reviews",
  retail: "rising acquisition cost and weak repeat purchase",
};

export const SEGMENT_PROOF: Record<Segment, string> = {
  manufacturing: "a 31% cut in unplanned downtime at a three-plant manufacturer",
  healthcare: "6 hours of admin saved per clinician per week at a regional clinic group",
  finance: "onboarding time cut from 11 days to 3 at a mid-size lender",
  retail: "a 22% lift in repeat purchase rate within one quarter",
};

const POSITION_PAIRS: Record<string, string> = {
  "driver>energizer": "Energizing Driver",
  "energizer>driver": "Driving Energizer",
  "energizer>supporter": "Supportive Energizer",
  "supporter>energizer": "Energizing Supporter",
  "supporter>analyst": "Analytical Supporter",
  "analyst>supporter": "Supportive Analyst",
  "analyst>driver": "Driving Analyst",
  "driver>analyst": "Analytical Driver",
};

function position(primary: EnergyKey, secondary: EnergyKey): string {
  return POSITION_PAIRS[primary + ">" + secondary] ?? ENERGY_LABEL[primary];
}

function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Row = [
  number, string, string, string, Segment, string, string,
  EnergyKey, EnergyKey, [number, number, number, number], number,
  [number, number, number, number],
  [number, number, number, number, number],
  Stage, Prospect["source"], number, string, string,
];

const ROWS: Row[] = [
  [1, "Elin Rask", "Marketing Director", "Lumen Retail Group", "retail", "Nordics", "1,000-5,000", "energizer", "driver", [68, 84, 41, 30], 82, [95, 80, 70, 90], [3, 3, 2, 1, 1], "meeting", "LinkedIn extension", 6, "2 days ago", "Saw Lumen's autumn brand relaunch land well on social."],
  [2, "Tomas Wegner", "Marketing Director", "Halden Precision", "manufacturing", "DACH", "500-1,000", "analyst", "driver", [52, 28, 40, 86], 74, [95, 85, 60, 75], [4, 2, 1, 0, 0], "contacted", "Sales Navigator import", 12, "5 days ago", "Noticed Halden's new technical content hub for plant engineers."],
  [3, "Sofia Marchetti", "Chief Marketing Officer", "Alder & Vane Bank", "finance", "Benelux", "5,000+", "driver", "analyst", [88, 34, 29, 62], 90, [85, 90, 90, 70], [5, 4, 3, 2, 1], "opportunity", "CRM sync", 31, "Yesterday", "Congratulations on the digital onboarding launch last month."],
  [4, "Jonas Lindqvist", "Marketing Director", "Kestrel Outdoor", "retail", "Nordics", "200-500", "supporter", "energizer", [30, 64, 82, 36], 64, [95, 80, 50, 90], [2, 1, 0, 0, 0], "contacted", "LinkedIn extension", 9, "6 days ago", "Liked your post on building a calmer, more loyal customer community."],
  [5, "Priya Natarajan", "Head of E-commerce", "Northgate Home", "retail", "UK & Ireland", "1,000-5,000", "driver", "energizer", [80, 66, 33, 40], 70, [75, 85, 70, 70], [3, 2, 1, 0, 0], "contacted", "Sales Navigator import", 14, "3 days ago", "Saw the checkout redesign you led go live before peak season."],
  [6, "Henrik Bauer", "Plant Manager", "Nordvik Industrial", "manufacturing", "Nordics", "1,000-5,000", "analyst", "supporter", [38, 30, 64, 84], 86, [100, 95, 70, 90], [4, 3, 2, 1, 0], "engaged", "CRM sync", 22, "Today", "Noticed the new Tampere line commissioning earlier this year."],
  [7, "Marta Kowalczyk", "VP Operations", "Brightfield Components", "manufacturing", "DACH", "1,000-5,000", "driver", "analyst", [86, 26, 34, 70], 84, [85, 95, 70, 75], [3, 2, 1, 1, 0], "engaged", "Sales Navigator import", 18, "2 days ago", "Read your interview on cutting changeover time at scale."],
  [8, "Daniel Ferreira", "Maintenance Director", "Atlas Fabrication", "manufacturing", "Iberia", "500-1,000", "supporter", "analyst", [28, 40, 80, 72], 72, [90, 95, 55, 60], [2, 1, 0, 0, 0], "contacted", "CSV import", 8, "1 week ago", "Saw Atlas invest in a predictive maintenance pilot."],
  [9, "Greta Holm", "Supply Chain Director", "Fjordline Packaging", "manufacturing", "Nordics", "500-1,000", "analyst", "driver", [50, 24, 36, 88], 78, [90, 85, 65, 90], [4, 3, 1, 0, 0], "contacted", "LinkedIn extension", 11, "4 days ago", "Your talk on supplier resilience was widely shared this spring."],
  [10, "Rahul Mehta", "Chief Operating Officer", "Ironbridge Metals", "manufacturing", "UK & Ireland", "5,000+", "driver", "energizer", [90, 62, 24, 38], 88, [70, 95, 90, 70], [3, 3, 2, 2, 1], "opportunity", "CRM sync", 40, "Yesterday", "Congratulations on the second site expansion."],
  [11, "Dr Annika Vogel", "Medical Director", "Kestrel Medical Group", "healthcare", "DACH", "1,000-5,000", "analyst", "supporter", [30, 36, 62, 84], 76, [80, 85, 65, 70], [2, 1, 0, 0, 0], "contacted", "Sales Navigator import", 16, "1 week ago", "Read your paper on reducing documentation burden in outpatient care."],
  [12, "Dr Samuel Osei", "GP Partner", "Riverside Health Partners", "healthcare", "UK & Ireland", "50-200", "supporter", "energizer", [26, 60, 86, 40], 58, [60, 85, 30, 70], [0, 0, 0, 0, 0], "new", "LinkedIn extension", 2, "Added 2 days ago", "Noticed your practice's patient-first approach to appointments."],
  [13, "Ingrid Solberg", "Clinic Director", "Nordlys Klinikker", "healthcare", "Nordics", "200-500", "energizer", "supporter", [44, 78, 70, 30], 80, [90, 85, 70, 90], [3, 2, 2, 1, 1], "meeting", "CRM sync", 25, "3 days ago", "Saw the opening of your fourth clinic in Bergen."],
  [14, "Dr Karim Haddad", "Consultant Radiologist", "St Aldric Hospital", "healthcare", "UK & Ireland", "5,000+", "analyst", "driver", [48, 22, 34, 90], 52, [55, 80, 90, 70], [0, 0, 0, 0, 0], "new", "CSV import", 3, "Added 3 days ago", "Read your recent talk on imaging workflow efficiency."],
  [15, "Lena Fischer", "Head of Digital Health", "Medora Clinics", "healthcare", "DACH", "500-1,000", "driver", "energizer", [82, 68, 30, 36], 74, [85, 85, 60, 75], [2, 1, 1, 0, 0], "contacted", "Sales Navigator import", 10, "5 days ago", "Saw Medora's patient app pass 100,000 users."],
  [16, "Oscar Brandt", "Hospital Operations Director", "Westmark University Hospital", "healthcare", "Nordics", "5,000+", "supporter", "analyst", [30, 38, 78, 70], 70, [90, 85, 90, 60], [1, 0, 0, 0, 0], "new", "LinkedIn extension", 4, "4 days ago", "Your work on shorter waiting times has been noticed."],
  [17, "Clara Beaumont", "Chief Risk Officer", "Alder & Vane Bank", "finance", "Benelux", "5,000+", "analyst", "driver", [46, 26, 38, 90], 68, [85, 90, 90, 70], [2, 1, 1, 0, 0], "contacted", "CRM sync", 20, "1 week ago", "Read your note on explainable models in credit decisions."],
  [18, "Viktor Lund", "Head of Wealth Partnerships", "Meridian Capital", "finance", "Nordics", "1,000-5,000", "energizer", "driver", [64, 84, 30, 40], 80, [90, 90, 70, 90], [3, 2, 2, 1, 0], "engaged", "LinkedIn extension", 13, "2 days ago", "Saw Meridian's new partner programme announced."],
  [19, "Hannah Weiss", "Director of Operations, Insurance", "Santra Insurance", "finance", "DACH", "1,000-5,000", "supporter", "analyst", [28, 42, 82, 66], 66, [80, 85, 70, 75], [1, 1, 0, 0, 0], "contacted", "Sales Navigator import", 15, "6 days ago", "Your team's claims handling award was well deserved."],
  [20, "Marcus Doyle", "Marketing Director", "Pinnacle Mutual", "finance", "UK & Ireland", "1,000-5,000", "driver", "energizer", [84, 70, 28, 34], 72, [95, 80, 70, 70], [2, 2, 1, 1, 0], "engaged", "Sales Navigator import", 17, "Yesterday", "Liked your point on trust being the real brand metric in financial services."],
  [21, "Camille Laurent", "Director of Customer Experience", "Maison Verde", "retail", "Benelux", "1,000-5,000", "energizer", "supporter", [40, 82, 66, 30], 76, [85, 85, 70, 90], [2, 2, 1, 0, 0], "contacted", "LinkedIn extension", 7, "3 days ago", "Saw the loyalty relaunch roll out across all stores."],
  [22, "Eero Virtanen", "Retail Operations Director", "Pohjola Stores", "retail", "Nordics", "5,000+", "analyst", "supporter", [36, 30, 62, 86], 70, [80, 90, 90, 90], [1, 1, 0, 0, 0], "new", "CSV import", 5, "5 days ago", "Noticed your store footprint review published last quarter."],
  [23, "Olivia Grant", "Brand Director", "Harlow & Pine", "retail", "UK & Ireland", "200-500", "energizer", "driver", [60, 86, 32, 34], 62, [75, 75, 50, 70], [0, 0, 0, 0, 0], "new", "LinkedIn extension", 1, "Added yesterday", "Loved the new campaign launched with the independent makers."],
  [24, "Nils Åkesson", "Managing Director", "Skarpa Tools", "manufacturing", "Nordics", "200-500", "driver", "supporter", [84, 38, 66, 40], 60, [70, 80, 55, 90], [3, 0, 0, 0, 0], "lost", "CRM sync", 45, "3 weeks ago", "Saw the move into the European market this year."],
];

export const prospectsSeed: Prospect[] = ROWS.map((r) => {
  const scores = { driver: r[9][0], energizer: r[9][1], supporter: r[9][2], analyst: r[9][3] };
  const gap = scores[r[7]] - scores[r[8]];
  return {
    id: r[0],
    name: r[1],
    initials: initials(r[1]),
    title: r[2],
    company: r[3],
    segment: r[4],
    region: r[5],
    companySize: r[6],
    primary: r[7],
    secondary: r[8],
    scores,
    wheelPosition: gap > 28 ? ENERGY_LABEL[r[7]] : position(r[7], r[8]),
    confidence: r[10],
    fit: { title: r[11][0], industry: r[11][1], size: r[11][2], region: r[11][3] },
    engagement: { sent: r[12][0], opens: r[12][1], clicks: r[12][2], replies: r[12][3], meetings: r[12][4] },
    stage: r[13],
    source: r[14],
    addedDaysAgo: r[15],
    lastActivity: r[16],
    opener: r[17],
    regulated: r[4] === "healthcare",
    doNotContact: r[0] === 24,
  };
});

export const listsSeed: ProspectList[] = [
  {
    id: "marketing-directors",
    name: "Marketing directors, all sectors",
    description: "Marketing directors and CMOs for new business outreach.",
    filter: { titleIncludes: ["marketing director", "chief marketing"] },
  },
  {
    id: "plant-ops",
    name: "Plant and operations leaders",
    description: "Manufacturing decision makers who own uptime and cost.",
    filter: { segment: "manufacturing", titleIncludes: ["plant", "operations", "maintenance", "supply chain", "operating"] },
  },
  {
    id: "clinical",
    name: "Clinical decision makers",
    description: "Doctors and clinic leaders. Regulated segment.",
    filter: { segment: "healthcare" },
  },
  {
    id: "finance-leaders",
    name: "Finance leaders",
    description: "Banking, insurance and wealth leaders.",
    filter: { segment: "finance" },
  },
  {
    id: "retail-digital",
    name: "Retail growth and experience",
    description: "Retail marketing, e-commerce and customer experience.",
    filter: { segment: "retail" },
  },
];

export function inList(p: Prospect, list: ProspectList): boolean {
  const f = list.filter;
  if (f.segment && p.segment !== f.segment) return false;
  if (f.region && p.region !== f.region) return false;
  if (f.energy && p.primary !== f.energy) return false;
  if (f.titleIncludes && f.titleIncludes.length > 0) {
    const t = p.title.toLowerCase();
    if (!f.titleIncludes.some((s) => t.includes(s.toLowerCase()))) return false;
  }
  return true;
}

export const sequencesSeed: Sequence[] = [
  {
    id: 1,
    name: "Marketing directors, new business",
    listId: "marketing-directors",
    status: "active",
    genericReplyRate: 3.1,
    stats: { enrolled: 148, sent: 402, opened: 231, replied: 31, meetings: 11 },
    steps: [
      {
        id: 1,
        channel: "email",
        delayDays: 0,
        subject: "{{company}} and {{pain_point}}",
        body:
          "Hi {{first_name}},\n\n{{opening_line}}\n\nMany {{title}}s we speak to are dealing with {{pain_point}}. We recently helped with {{proof_point}}.\n\nWorth a short conversation? {{meeting_link}}\n\n{{sender_name}}",
      },
      {
        id: 2,
        channel: "linkedin",
        delayDays: 2,
        subject: "Connection note",
        body: "Hi {{first_name}}, {{opening_line}} Would be good to connect.",
      },
      {
        id: 3,
        channel: "email",
        delayDays: 4,
        subject: "Re: {{company}} and {{pain_point}}",
        body:
          "Hi {{first_name}},\n\nFollowing up on my note. If {{pain_point}} is on your list this quarter, I can share how {{proof_point}} came about.\n\n{{sender_name}}",
      },
      {
        id: 4,
        channel: "call",
        delayDays: 7,
        subject: "Call task",
        body: "Call {{first_name}} at {{company}}. Reference {{opening_line}} Ask one question about {{pain_point}}.",
      },
      {
        id: 5,
        channel: "email",
        delayDays: 10,
        subject: "Closing the loop",
        body:
          "Hi {{first_name}},\n\nI will leave it here so I do not crowd your inbox. If the timing changes, {{meeting_link}} is always open.\n\n{{sender_name}}",
      },
    ],
  },
  {
    id: 2,
    name: "Plant managers, downtime reduction",
    listId: "plant-ops",
    status: "active",
    genericReplyRate: 2.4,
    stats: { enrolled: 96, sent: 270, opened: 168, replied: 26, meetings: 9 },
    steps: [
      {
        id: 1,
        channel: "email",
        delayDays: 0,
        subject: "Fewer unplanned stops at {{company}}",
        body:
          "Hi {{first_name}},\n\n{{opening_line}}\n\nPlants like yours often struggle with {{pain_point}}. {{proof_point}} is a recent example.\n\nI can send a one-page summary if useful.\n\n{{sender_name}}",
      },
      {
        id: 2,
        channel: "email",
        delayDays: 5,
        subject: "Re: Fewer unplanned stops at {{company}}",
        body: "Hi {{first_name}},\n\nHappy to share the numbers behind {{proof_point}}. Open to a 20-minute call? {{meeting_link}}\n\n{{sender_name}}",
      },
      {
        id: 3,
        channel: "call",
        delayDays: 8,
        subject: "Call task",
        body: "Call {{first_name}}. Ask how {{company}} tracks downtime today.",
      },
    ],
  },
  {
    id: 3,
    name: "Clinic directors, admin time",
    listId: "clinical",
    status: "draft",
    genericReplyRate: 1.8,
    stats: { enrolled: 0, sent: 0, opened: 0, replied: 0, meetings: 0 },
    steps: [
      {
        id: 1,
        channel: "email",
        delayDays: 0,
        subject: "Giving {{company}} clinicians time back",
        body:
          "Dear {{first_name}},\n\n{{opening_line}}\n\nMany clinical leaders tell us about {{pain_point}}. We would value your view. {{meeting_link}}\n\n{{sender_name}}",
      },
      {
        id: 2,
        channel: "linkedin",
        delayDays: 4,
        subject: "Connection note",
        body: "Dear {{first_name}}, I would value connecting to learn how {{company}} approaches admin workload.",
      },
    ],
  },
];

export interface ScoringConfig {
  fitWeights: FitComponents;
  engagementPoints: { opens: number; clicks: number; replies: number; meetings: number };
  fitShare: number;
  hotAt: number;
  warmAt: number;
}

export const scoringDefault: ScoringConfig = {
  fitWeights: { title: 35, industry: 25, size: 20, region: 20 },
  engagementPoints: { opens: 3, clicks: 6, replies: 20, meetings: 35 },
  fitShare: 60,
  hotAt: 70,
  warmAt: 45,
};

export const funnelSeed = [
  { label: "Contacts reached", value: 1840 },
  { label: "Opened", value: 1062 },
  { label: "Replied", value: 148 },
  { label: "Meetings booked", value: 52 },
  { label: "Opportunities", value: 21 },
  { label: "Won", value: 7 },
];

export const segmentPerformance: { segment: Segment; sent: number; replyRate: number; meetingRate: number }[] = [
  { segment: "manufacturing", sent: 520, replyRate: 9.2, meetingRate: 3.5 },
  { segment: "finance", sent: 410, replyRate: 8.1, meetingRate: 2.9 },
  { segment: "retail", sent: 560, replyRate: 7.4, meetingRate: 2.6 },
  { segment: "healthcare", sent: 350, replyRate: 5.9, meetingRate: 1.7 },
];

export const energyPerformance: { energy: EnergyKey; personalised: number; generic: number }[] = [
  { energy: "driver", personalised: 9.4, generic: 3.0 },
  { energy: "energizer", personalised: 10.1, generic: 3.6 },
  { energy: "supporter", personalised: 7.2, generic: 2.4 },
  { energy: "analyst", personalised: 8.3, generic: 2.1 },
];

export const weeklyActivity: { week: string; sent: number; replies: number }[] = [
  { week: "W1", sent: 210, replies: 14 },
  { week: "W2", sent: 245, replies: 19 },
  { week: "W3", sent: 260, replies: 22 },
  { week: "W4", sent: 300, replies: 27 },
  { week: "W5", sent: 285, replies: 31 },
  { week: "W6", sent: 320, replies: 35 },
];
