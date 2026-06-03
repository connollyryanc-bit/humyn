/**
 * Team Health Overlay — mock data
 *
 * Humyn intelligence as the supporting layer behind delivery risk. Burnout,
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
  composite: HealthLevel;
  burnoutRisk: HealthLevel;
  leadershipBalance: HealthLevel;       // is one energy / decision-style dominating?
  communicationFriction: HealthLevel;
  changeReadiness: HealthLevel;
  utilisation: number;
  weeksAbove95: number;
  contextSummary: string;
}

export const teamHealthSnapshots: TeamHealthSnapshot[] = [
  {
    team: "Klarna CX Phase 2 — Stockholm",
    client: "Klarna",
    market: "Stockholm",
    composite: "elevated",
    burnoutRisk: "elevated",
    leadershipBalance: "medium",
    communicationFriction: "elevated",
    changeReadiness: "medium",
    utilisation: 96,
    weeksAbove95: 8,
    contextSummary:
      "Eight weeks at 96%+ utilisation. Linnea is carrying the engagement-director load on three other accounts. Communication friction signals between the design + engineering subgroups.",
  },
  {
    team: "Maersk Shipment Events v3 — Copenhagen",
    client: "Maersk",
    market: "Copenhagen",
    composite: "low",
    burnoutRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "low",
    utilisation: 86,
    weeksAbove95: 0,
    contextSummary:
      "Healthy team. Mathias as principal architect + Tobias as delivery lead is a calm Supporter/Analyst combination. No friction signals.",
  },
  {
    team: "OP Financial demand model — Helsinki",
    client: "OP Financial",
    market: "Helsinki",
    composite: "elevated",
    burnoutRisk: "critical",
    leadershipBalance: "medium",
    communicationFriction: "low",
    changeReadiness: "medium",
    utilisation: 96,
    weeksAbove95: 6,
    contextSummary:
      "Henna at 96% utilisation for six weeks, burnout-flagged. Sole ML specialist on Kesko + OP — single point of failure. Critical risk if delivery slips.",
  },
  {
    team: "DSB Digital Experience — Copenhagen",
    client: "DSB",
    market: "Copenhagen",
    composite: "low",
    burnoutRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "low",
    utilisation: 78,
    weeksAbove95: 0,
    contextSummary:
      "Just kicked off. Pernille + Tobias = Supporter-led leadership. Strong change readiness scores from kickoff retrospectives.",
  },
  {
    team: "H&M Checkout Redesign — Stockholm",
    client: "H&M",
    market: "Stockholm",
    composite: "medium",
    burnoutRisk: "medium",
    leadershipBalance: "elevated",
    communicationFriction: "medium",
    changeReadiness: "low",
    utilisation: 84,
    weeksAbove95: 1,
    contextSummary:
      "Astrid carrying both H&M and Klarna client-partner load. Leadership balance flagged — Driver energy dominating, less Supporter in the room. Worth a coaching conversation.",
  },
  {
    team: "Storebrand Member Portal — Oslo",
    client: "Storebrand",
    market: "Oslo",
    composite: "low",
    burnoutRisk: "low",
    leadershipBalance: "low",
    communicationFriction: "low",
    changeReadiness: "medium",
    utilisation: 80,
    weeksAbove95: 0,
    contextSummary:
      "Ida + Magnus = Energizer/Driver pairing. Healthy. Some change-readiness softness around the legacy Angular -> Next.js stack but team is engaging.",
  },
];

export interface TeamHealthAiInsight {
  category: "delivery-risk" | "burnout" | "leadership" | "readiness";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

export const teamHealthAiInsights: TeamHealthAiInsight[] = [
  {
    category: "delivery-risk",
    title: "Klarna CX Phase 2 — delivery risk amplified by team health",
    body: "Delivery risk shown as Medium in the operational view. The Humyn overlay reveals 8 weeks of sustained 96%+ utilisation plus communication friction between subgroups. The operational risk is materially understated without this context.",
    link: { href: "/executive/capacity-demand", label: "See Capacity vs Demand" },
  },
  {
    category: "burnout",
    title: "Henna Mäkinen is a single point of failure",
    body: "96% utilisation for six weeks, burnout-flagged, and the sole ML specialist on two engagements (Kesko + OP). The most acute personal-resilience risk on the board. Action: protect her bandwidth before adding the third engagement.",
    link: { href: "/people/5", label: "Open Henna's profile" },
  },
  {
    category: "leadership",
    title: "Astrid Falk — leadership balance flagged on H&M",
    body: "Driver energy dominant, less Supporter / Analyst in the room. Pattern matches lost-pitch postmortems from earlier this year. Coaching conversation recommended before the next major H&M decision.",
  },
  {
    category: "readiness",
    title: "Two teams are healthy enough to absorb additional work",
    body: "DSB Digital and Storebrand Member Portal both show low-friction profiles with utilisation below 80%. If a new opportunity needs immediate staffing, these are the teams to extend rather than reshuffle a stretched team.",
    link: { href: "/executive/optimization", label: "See Workforce Optimization" },
  },
];
