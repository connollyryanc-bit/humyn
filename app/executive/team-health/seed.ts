/**
 * Team Health Overlay — mock data
 *
 * Humyn intelligence as the supporting layer behind delivery risk. Overload,
 * leadership balance, communication friction, change readiness — surfaced where
 * they amplify or explain operational signals from the other modules.
 *
 * Per the spec: this data should never dominate executive reporting. It appears
 * as supporting context for delivery risk, not as the primary lens.
 */

export type HealthLevel = "low" | "medium" | "elevated" | "critical";

export interface TeamHealthSnapshot {
  team: string;
  client: string;
  market: string;
  region: string;
  composite: HealthLevel;
  overloadRisk: HealthLevel;
  leadershipBalance: HealthLevel;       // is one energy / decision-style dominating?
  communicationFriction: HealthLevel;
  changeReadiness: HealthLevel;
  utilisation: number;
  weeksAbove95: number;
  contextSummary: string;
}

export const teamHealthSnapshots: TeamHealthSnapshot[] = [
  {
    team: "Payflow CX Phase 2 — Stockholm",
    client: "Payflow",
    market: "Stockholm",
    region: "Nordics",
    composite: "elevated",
    overloadRisk: "elevated",
    leadershipBalance: "medium",
    communicationFriction: "elevated",
    changeReadiness: "medium",
    utilisation: 96,
    weeksAbove95: 8,
    contextSummary:
      "Eight weeks at 96%+ utilisation. Linnea is carrying the engagement-director load on three other accounts. Communication friction signals between the design + engineering subgroups.",
  },
  {
    team: "Tidewater Shipping Shipment Events v3 — Copenhagen",
    client: "Tidewater Shipping",
    market: "Copenhagen",
    region: "Nordics",
    composite: "low",
    overloadRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "low",
    utilisation: 86,
    weeksAbove95: 0,
    contextSummary:
      "Healthy team. Mathias as principal architect + Tobias as delivery lead is a calm Harmoniser/Analyst combination. No friction signals.",
  },
  {
    team: "Kestrel Bank demand model — Helsinki",
    client: "Kestrel Bank",
    market: "Helsinki",
    region: "Nordics",
    composite: "elevated",
    overloadRisk: "critical",
    leadershipBalance: "medium",
    communicationFriction: "low",
    changeReadiness: "medium",
    utilisation: 96,
    weeksAbove95: 6,
    contextSummary:
      "Henna at 96% utilisation for six weeks, over-allocated. Sole ML specialist on Kauppa Group + Kestrel Bank — single point of failure. Critical risk if delivery slips.",
  },
  {
    team: "Rail Nord Digital Experience — Copenhagen",
    client: "Rail Nord",
    market: "Copenhagen",
    region: "Nordics",
    composite: "low",
    overloadRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "low",
    utilisation: 78,
    weeksAbove95: 0,
    contextSummary:
      "Just kicked off. Pernille + Tobias = Harmoniser-led leadership. Strong change readiness scores from kickoff retrospectives.",
  },
  {
    team: "Nordmode Checkout Redesign — Stockholm",
    client: "Nordmode",
    market: "Stockholm",
    region: "Nordics",
    composite: "medium",
    overloadRisk: "medium",
    leadershipBalance: "elevated",
    communicationFriction: "medium",
    changeReadiness: "low",
    utilisation: 84,
    weeksAbove95: 1,
    contextSummary:
      "Astrid carrying both Nordmode and Payflow client-partner load. Leadership balance flagged — Driver energy dominating, less Harmoniser in the room. Worth a coaching conversation.",
  },
  {
    team: "Fjellvik Pension Member Portal — Oslo",
    client: "Fjellvik Pension",
    market: "Oslo",
    region: "Nordics",
    composite: "low",
    overloadRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "medium",
    utilisation: 80,
    weeksAbove95: 0,
    contextSummary:
      "Ida + Magnus = Energizer/Driver pairing. Healthy. Some change-readiness softness around the legacy Angular -> Next.js stack but team is engaging.",
  },
  {
    team: "Greengate Retail Loyalty Rebuild — London",
    client: "Greengate Retail",
    market: "London",
    region: "UK",
    composite: "medium",
    overloadRisk: "medium",
    leadershipBalance: "low",
    communicationFriction: "medium",
    changeReadiness: "low",
    utilisation: 88,
    weeksAbove95: 0,
    contextSummary:
      "Healthy team. James + Priya pairing covering loyalty platform rebuild. Minor friction with Greengate Retail product owner over backlog priority.",
  },
  {
    team: "Lloyds Banking — Data discovery",
    client: "Albion Bank",
    market: "London",
    region: "UK",
    composite: "elevated",
    overloadRisk: "elevated",
    leadershipBalance: "elevated",
    communicationFriction: "medium",
    changeReadiness: "medium",
    utilisation: 94,
    weeksAbove95: 4,
    contextSummary:
      "Priya carrying two ML engagements alone (Lloyds + Sainsbury's pilot). Overload signal building. London ML hire decision is the operative unlock.",
  },
  {
    team: "Aegis Insurance Claims Platform — Munich",
    client: "Aegis Insurance",
    market: "Munich",
    region: "DACH",
    composite: "low",
    overloadRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "low",
    utilisation: 82,
    weeksAbove95: 0,
    contextSummary:
      "Stefan-led team in strong shape. Healthy Analyst-led leadership balance, no friction signals, clean retrospectives.",
  },
  {
    team: "Voltaris Innovation Lab — Munich",
    client: "Voltaris",
    market: "Munich",
    region: "DACH",
    composite: "low",
    overloadRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "medium",
    utilisation: 76,
    weeksAbove95: 0,
    contextSummary:
      "Innovation lab team operating with healthy headroom. Capacity available for one more strand.",
  },
  {
    team: "Lumière Bank Wealth — Paris",
    client: "Lumière Bank",
    market: "Paris",
    region: "France",
    composite: "low",
    overloadRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "low",
    utilisation: 74,
    weeksAbove95: 0,
    contextSummary:
      "Discovery team — Camille leading. Light utilisation. Strong stakeholder rapport.",
  },
];

export interface TeamHealthAiInsight {
  category: "delivery-risk" | "overload" | "leadership" | "readiness";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

export const teamHealthAiInsights: TeamHealthAiInsight[] = [
  {
    category: "delivery-risk",
    title: "Payflow CX Phase 2 — delivery risk amplified by team health",
    body: "Delivery risk shown as Medium in the operational view. The Humyn overlay reveals 8 weeks of sustained 96%+ utilisation plus communication friction between subgroups. The operational risk is materially understated without this context.",
    link: { href: "/executive/capacity-demand", label: "See Capacity vs Demand" },
  },
  {
    category: "overload",
    title: "Henna Mäkinen is a single point of failure",
    body: "96% utilisation for six weeks, over-allocated, and the sole ML specialist on two engagements (Kauppa Group + Kestrel Bank). The most acute personal-resilience risk on the board. Action: protect her bandwidth before adding the third engagement.",
    link: { href: "/people/5", label: "Open Henna's profile" },
  },
  {
    category: "leadership",
    title: "Astrid Falk — leadership balance flagged on Nordmode",
    body: "Driver energy dominant, less Harmoniser / Analyst in the room. Pattern matches lost-pitch postmortems from earlier this year. Coaching conversation recommended before the next major Nordmode decision.",
  },
  {
    category: "readiness",
    title: "Two teams are healthy enough to absorb additional work",
    body: "Rail Nord Digital and Fjellvik Pension Member Portal both show low-friction profiles with utilisation below 80%. If a new opportunity needs immediate staffing, these are the teams to extend rather than reshuffle a stretched team.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
];
