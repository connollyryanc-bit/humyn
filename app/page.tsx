"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type EnergyKey = "red" | "yellow" | "green" | "blue";
export type AvailKey = "now" | "soon" | "allocated";

export interface Person {
  id: number;
  name: string;
  initials: string;
  role: string;
  location: string;
  primary: EnergyKey;
  secondary: EnergyKey;
  scores: { red: number; yellow: number; green: number; blue: number };
  utilisation: number;
  available: AvailKey;
  clients: number;
  revenue: string;
  bio: string;
  capabilities: string[];
  achievements: string[];
  bestTrait: string;
  vice: string;
  wheelPosition: string;
  drivers: string[];
  detractors: string[];
  howToSpeak: string;
  howToEmail: string;
}

export const energy: Record<
  EnergyKey,
  { color: string; bg: string; text: string; border: string; label: string }
> = {
  red:    { color: "#E8402A", bg: "#FDF0EE", text: "#9B2A1A", border: "#FCCDC6", label: "Fiery Red" },
  yellow: { color: "#F5A623", bg: "#FFFBF2", text: "#8B5A00", border: "#FAD98A", label: "Sunshine Yellow" },
  green:  { color: "#2E8B57", bg: "#EEF7F2", text: "#1A5C38", border: "#9ED4B8", label: "Earth Green" },
  blue:   { color: "#1E6FA5", bg: "#EEF4FB", text: "#124A6E", border: "#8DC2E8", label: "Cool Blue" },
};

export const availability: Record<
  AvailKey,
  { color: string; bg: string; text: string; border: string; label: string }
> = {
  now:       { color: "#2E8B57", bg: "#EEF7F2", text: "#1A5C38", border: "#9ED4B8", label: "Available now" },
  soon:      { color: "#F5A623", bg: "#FFFBF2", text: "#8B5A00", border: "#FAD98A", label: "Available soon" },
  allocated: { color: "#E8402A", bg: "#FDF0EE", text: "#9B2A1A", border: "#FCCDC6", label: "Allocated" },
};

export function utilTone(u: number): { color: string; label: string } {
  if (u >= 80) return { color: "#2E8B57", label: "On target" };
  if (u >= 65) return { color: "#F5A623", label: "Below target" };
  return { color: "#E8402A", label: "At risk" };
}

export const people: Person[] = [
  {
    id: 1,
    name: "Linnea Sjöberg",
    initials: "LS",
    role: "Engagement Director",
    location: "Stockholm",
    primary: "red",
    secondary: "yellow",
    scores: { red: 86, yellow: 71, green: 32, blue: 44 },
    utilisation: 92,
    available: "allocated",
    clients: 6,
    revenue: "€1.4M",
    bio: "Senior delivery lead with 14 years across financial services and retail. Known for landing big-ticket pitches and turning around stalled engagements without burning the team out.",
    capabilities: ["Engagement leadership", "Pitch & sales", "Digital strategy", "Stakeholder management"],
    achievements: [
      "Closed €4.2M Nordea omnichannel programme — largest Nordic win of 2025.",
      "Stabilised the H&M loyalty rebuild after a six-month delivery slip.",
      "Mentor to four senior consultants now leading their own engagements.",
    ],
    bestTrait: "Cuts through noise — makes the hard call when no one else will.",
    vice: "Can run past people. Watch for steamrolling in early-stage workshops.",
    wheelPosition: "Motivating Director",
    drivers: ["Winning competitive pitches", "Visible commercial impact", "Pace and momentum", "High-trust autonomy"],
    detractors: ["Endless alignment meetings", "Vague briefs", "Micro-management", "Death by committee"],
    howToSpeak: "Be direct and lead with the headline. Linnea wants the bottom line in the first sentence — context comes after. Skip the small talk and bring decisions, not options to admire.",
    howToEmail: "Short paragraphs. Bold the asks. One decision per email. If you need a yes by Thursday, say so in the subject line — she scans first and reads second.",
  },
  {
    id: 2,
    name: "Mathias Lund",
    initials: "ML",
    role: "Principal Tech Lead",
    location: "Copenhagen",
    primary: "blue",
    secondary: "green",
    scores: { red: 28, yellow: 24, green: 64, blue: 91 },
    utilisation: 78,
    available: "soon",
    clients: 3,
    revenue: "€820k",
    bio: "Backend architect specialising in event-driven systems. The person we send in when an engagement is technically off the rails and needs a calm hand to redesign without drama.",
    capabilities: ["Distributed systems", "Event sourcing", "AWS architecture", "Technical due diligence"],
    achievements: [
      "Re-architected Maersk shipment events platform — 99.99% uptime since go-live.",
      "Authored the Valtech Nordic event-driven reference architecture.",
      "Speaker at GOTO Copenhagen 2025 on graceful degradation.",
    ],
    bestTrait: "Sees the second-order failure before anyone else does.",
    vice: "Will over-engineer if left unsupervised on a quiet sprint.",
    wheelPosition: "Coordinating Observer",
    drivers: ["Hard technical problems", "Quiet focus time", "Written specs", "Clean abstractions"],
    detractors: ["Hand-wavy requirements", "Pressure to ship without review", "Open-plan noise", "Status theatre"],
    howToSpeak: "Bring the data. Mathias wants the constraint, the trade-off, and the failure mode. Speak slower than you think you should and leave space for him to think before he answers.",
    howToEmail: "Threaded, structured, with headings if it's long. Send the doc 24 hours before the meeting. He'll come back with the four questions that actually matter.",
  },
  {
    id: 3,
    name: "Pernille Andersen",
    initials: "PA",
    role: "UX Director",
    location: "Copenhagen",
    primary: "green",
    secondary: "yellow",
    scores: { red: 22, yellow: 67, green: 88, blue: 41 },
    utilisation: 84,
    available: "allocated",
    clients: 4,
    revenue: "€690k",
    bio: "User research and service design lead. Builds psychologically safe teams where junior designers do their best work. Clients ask for her by name three years after engagements end.",
    capabilities: ["Service design", "Qualitative research", "Workshop facilitation", "Team coaching"],
    achievements: [
      "Led the Danske Bank onboarding redesign — NPS up 31 points.",
      "Founded the Nordic UX guild; 40+ members across four offices.",
      "Promoted three designers to senior in the last 18 months.",
    ],
    bestTrait: "Holds the room — gets the quietest voice talking by minute ten.",
    vice: "Avoids hard conversations longer than she should.",
    wheelPosition: "Helping Supporter",
    drivers: ["Healthy team dynamics", "Long-term client relationships", "Mentoring juniors", "Real user contact"],
    detractors: ["Conflict left to fester", "Last-minute scope changes", "Cynicism", "Being asked to choose between people"],
    howToSpeak: "Slow down and ask about the team before the work. Pernille reads tone first, content second. If something's hard, name it gently — she'll meet you there.",
    howToEmail: "Warm opener, clear ask, no jargon. Acknowledge the human side of any change before the timeline. She'll reply thoughtfully, not quickly.",
  },
  {
    id: 4,
    name: "Aksel Berg",
    initials: "AB",
    role: "Strategy Consultant",
    location: "Oslo",
    primary: "yellow",
    secondary: "red",
    scores: { red: 64, yellow: 89, green: 41, blue: 36 },
    utilisation: 71,
    available: "soon",
    clients: 5,
    revenue: "€510k",
    bio: "Strategy and innovation consultant. The face in the room at C-suite workshops — turns abstract ambition into a roadmap clients can actually start on Monday.",
    capabilities: ["Innovation strategy", "C-suite facilitation", "Storytelling", "New venture design"],
    achievements: [
      "Designed Equinor's customer innovation lab from a blank page.",
      "Top-rated facilitator on Valtech Nordic's exec leadership programme 2024 and 2025.",
      "Hosted four Innovation Mondays bringing in 60+ client leaders.",
    ],
    bestTrait: "Gets a sceptical exec team excited and aligned in one workshop.",
    vice: "Loves the kickoff, drifts on the long middle. Pair with a strong delivery lead.",
    wheelPosition: "Inspiring Motivator",
    drivers: ["New ideas", "Visible audiences", "Variety", "Big-picture problems"],
    detractors: ["Repetitive admin", "Solo deep work for days", "Cynics in the room", "Tight process boxes"],
    howToSpeak: "Bring energy. Aksel matches the room — if you're flat, the workshop will be flat. Use stories, not bullet points, and let him riff before you converge.",
    howToEmail: "Short, warm, with a hook in line one. Skip long preambles. He replies on the move so keep the ask scannable on a phone screen.",
  },
  {
    id: 5,
    name: "Henna Mäkinen",
    initials: "HM",
    role: "Senior Data Scientist",
    location: "Helsinki",
    primary: "blue",
    secondary: "red",
    scores: { red: 58, yellow: 31, green: 39, blue: 88 },
    utilisation: 88,
    available: "allocated",
    clients: 2,
    revenue: "€420k",
    bio: "Applied ML lead with a stats PhD. Builds production models that survive contact with real data. Direct, occasionally blunt, deeply respected by engineering.",
    capabilities: ["Applied ML", "MLOps", "Causal inference", "Forecasting"],
    achievements: [
      "Shipped Kesko's demand forecasting model — 14% inventory reduction in pilot stores.",
      "Built the Nordic MLOps reference stack now used on six engagements.",
      "Published two papers on time-series uncertainty in retail.",
    ],
    bestTrait: "Will tell you when the model isn't ready, even when the client doesn't want to hear it.",
    vice: "Low patience for vague business questions — coach her to translate, don't shield her.",
    wheelPosition: "Reforming Observer",
    drivers: ["Clean data", "Quantifiable problems", "Intellectual honesty", "Fast iteration cycles"],
    detractors: ["Vanity metrics", "Stakeholders who won't pick a target", "Theatre over substance", "Vague success criteria"],
    howToSpeak: "Lead with the question and the metric. Henna wants to know what decision the work informs. Don't soften — she reads softening as evasion.",
    howToEmail: "Numbered points. State the hypothesis. Attach the notebook. She'll respond with sharper questions than you sent.",
  },
  {
    id: 6,
    name: "Erik Holm",
    initials: "EH",
    role: "Solutions Architect",
    location: "Stockholm",
    primary: "blue",
    secondary: "green",
    scores: { red: 26, yellow: 38, green: 71, blue: 84 },
    utilisation: 67,
    available: "soon",
    clients: 3,
    revenue: "€540k",
    bio: "Cross-functional architect who bridges product, engineering and ops. Calm in escalations, thorough in writeups, the person clients trust when stakes are high.",
    capabilities: ["Enterprise architecture", "API design", "Cloud migration", "Technical writing"],
    achievements: [
      "Migrated SAS Group's customer platform off mainframe with zero downtime.",
      "Authored the Valtech Nordic cloud migration playbook.",
      "Trained 20+ engineers in solution-architecture fundamentals.",
    ],
    bestTrait: "Brings order to chaos without making anyone feel small.",
    vice: "Can overthink first drafts. Time-box his exploratory phases.",
    wheelPosition: "Coordinating Observer",
    drivers: ["Well-scoped problems", "Cross-team collaboration", "Documentation", "Mentoring engineers"],
    detractors: ["Crisis-mode escalations", "Politics", "Shipping before review", "Ambiguous ownership"],
    howToSpeak: "Be patient and precise. Erik thinks before he answers — silence isn't disagreement. Give him the constraints and the success criteria upfront.",
    howToEmail: "Structured, with context first, then the ask. He'll often reply with a diagram or a doc rather than prose — that's a good sign.",
  },
  {
    id: 7,
    name: "Saga Lindqvist",
    initials: "SL",
    role: "Senior Product Designer",
    location: "Stockholm",
    primary: "yellow",
    secondary: "green",
    scores: { red: 33, yellow: 86, green: 72, blue: 38 },
    utilisation: 81,
    available: "allocated",
    clients: 4,
    revenue: "€460k",
    bio: "Product designer with a service-design heart. Pairs effortlessly with engineering, runs lightweight workshops that move decisions forward instead of generating Post-its.",
    capabilities: ["Product design", "Design systems", "Prototyping", "Workshop facilitation"],
    achievements: [
      "Led the Telia self-service redesign — 22% drop in support tickets.",
      "Built the Valtech Nordic design-system kit now used by 30+ designers.",
      "Hosted the Stockholm design meetup three years running.",
    ],
    bestTrait: "Makes complex flows feel inevitable — clients ask why it wasn't always like this.",
    vice: "Sometimes resists pushback she'd benefit from. Frame critique as collaboration.",
    wheelPosition: "Inspiring Helper",
    drivers: ["Cross-discipline collaboration", "Real users in the room", "Craft pride", "A clear product vision"],
    detractors: ["HiPPO decisions", "Design by committee", "Endless rounds without users", "Politics dressed as feedback"],
    howToSpeak: "Be curious, not corrective. Saga responds to 'what if we tried X?' more than 'we need X'. Bring her into the framing, not just the build.",
    howToEmail: "Conversational, with a Figma link and a single clear question. Long briefs lose her — anchor the email to one decision.",
  },
  {
    id: 8,
    name: "Tobias Krogh",
    initials: "TK",
    role: "Delivery Lead",
    location: "Copenhagen",
    primary: "green",
    secondary: "blue",
    scores: { red: 31, yellow: 42, green: 87, blue: 69 },
    utilisation: 86,
    available: "allocated",
    clients: 2,
    revenue: "€780k",
    bio: "Programme manager who keeps engagements healthy. Quietly unblocks two things before standup that no one knew were stuck. Loved by both clients and engineers.",
    capabilities: ["Programme management", "Agile delivery", "Risk management", "Client governance"],
    achievements: [
      "Recovered the Carlsberg loyalty programme on the original launch date.",
      "Coached two team leads through their first major client escalation.",
      "Built the delivery health-check now used across every Nordic engagement.",
    ],
    bestTrait: "Stays calm in a storm — the team trusts him because he never panics.",
    vice: "Will absorb pressure himself rather than escalate. Check in regularly.",
    wheelPosition: "Coordinating Supporter",
    drivers: ["Team wellbeing", "Predictable cadence", "Clear roles", "Long-term partnerships"],
    detractors: ["Last-minute scope swings", "Heroics culture", "Skipped retros", "Manufactured urgency"],
    howToSpeak: "Be steady. Tobias reads tone — if you're agitated, he'll first calm the room and then ask what's actually wrong. Bring facts, not vibes.",
    howToEmail: "Plain language, clear status, no surprises. Flag risks early and explicitly. He'll handle the rest with a calmer message to the client than you would have sent.",
  },
  {
    id: 9,
    name: "Ida Sørensen",
    initials: "IS",
    role: "Senior Frontend Engineer",
    location: "Oslo",
    primary: "yellow",
    secondary: "blue",
    scores: { red: 34, yellow: 84, green: 47, blue: 71 },
    utilisation: 74,
    available: "soon",
    clients: 3,
    revenue: "€330k",
    bio: "React specialist who pairs design sensibility with type-system rigour. Brings energy into the engineering team — the rare frontend clients want in the workshop.",
    capabilities: ["React & Next.js", "TypeScript", "Accessibility", "Design-engineering bridge"],
    achievements: [
      "Led the Storebrand member portal rebuild — Lighthouse 98 on launch.",
      "Authored the Nordic frontend accessibility playbook.",
      "Maintains three popular internal Valtech Nordic component libraries.",
    ],
    bestTrait: "Translates fluently between design and engineering — no information lost.",
    vice: "Can take critique of her code personally. Frame as 'how do we make it better' not 'this is wrong'.",
    wheelPosition: "Inspirer",
    drivers: ["Craft and polish", "Working with designers", "Trying new tools", "Visible user impact"],
    detractors: ["Vague requirements", "Style-over-substance reviews", "Being siloed from product", "Slow CI"],
    howToSpeak: "Bring warmth and curiosity. Ida wants to feel like a partner, not a ticket-taker. Ask what she'd do differently if she owned the problem outright.",
    howToEmail: "Friendly, with a Loom or a screenshot. Long text emails will get a short reply — better to jump on a call when nuance matters.",
  },
  {
    id: 10,
    name: "Niko Virtanen",
    initials: "NV",
    role: "Senior Backend Engineer",
    location: "Helsinki",
    primary: "blue",
    secondary: "red",
    scores: { red: 61, yellow: 28, green: 36, blue: 87 },
    utilisation: 59,
    available: "now",
    clients: 2,
    revenue: "€280k",
    bio: "Backend engineer with a security mindset. Quietly precise, asks the question that exposes the shaky assumption. Coming off a long engagement and ready for the next hard problem.",
    capabilities: ["Go & Rust", "API security", "Postgres performance", "Threat modelling"],
    achievements: [
      "Closed five critical CVEs in OP Financial's customer API in his first quarter.",
      "Designed the auth service used across three Valtech Nordic engagements.",
      "Holds OSCP — runs our internal security book club.",
    ],
    bestTrait: "Spots the security or performance hole that every other reviewer missed.",
    vice: "Can be terse in PR reviews. Pair him with a softer reviewer on junior code.",
    wheelPosition: "Reforming Observer",
    drivers: ["Hard problems", "Security and correctness", "Quiet focus", "Honest code review"],
    detractors: ["Performance theatre", "Bureaucratic process", "Vague success criteria", "Drive-by feedback"],
    howToSpeak: "Be specific and brief. Niko respects people who've done their homework. Don't bring problems you haven't tried to solve yourself first.",
    howToEmail: "Bullet points and code blocks. State the threat model or the constraint. He'll engage deeply when the question is sharp.",
  },
  {
    id: 11,
    name: "Astrid Falk",
    initials: "AF",
    role: "Client Partner",
    location: "Stockholm",
    primary: "red",
    secondary: "yellow",
    scores: { red: 82, yellow: 78, green: 36, blue: 41 },
    utilisation: 64,
    available: "now",
    clients: 7,
    revenue: "€1.1M",
    bio: "Senior client partner owning the top three Nordic accounts. Reads a room in seconds, negotiates hard, leaves the relationship stronger than she found it.",
    capabilities: ["Account leadership", "Negotiation", "Executive coaching", "Pipeline building"],
    achievements: [
      "Renewed the Nordea master agreement at +18% on prior commercials.",
      "Built the Volvo Cars relationship from a single statement of work into a programme.",
      "Coached two seniors into client-partner roles.",
    ],
    bestTrait: "Walks into a tough client meeting and walks out with a bigger relationship.",
    vice: "Can over-commit the delivery team to land the deal. Bring her into capacity calls early.",
    wheelPosition: "Motivating Director",
    drivers: ["High-stakes negotiations", "Executive relationships", "Visible wins", "Pace"],
    detractors: ["Sluggish internal process", "Delivery surprises", "Indecisive stakeholders", "Sandbagged targets"],
    howToSpeak: "Be confident and concise. Astrid respects people who own a position. Bring options with a clear recommendation, not a menu.",
    howToEmail: "Two paragraphs max. Lead with the commercial impact. She'll move fast — make sure you can match the pace.",
  },
  {
    id: 12,
    name: "Magnus Dahl",
    initials: "MD",
    role: "Engineering Manager",
    location: "Oslo",
    primary: "red",
    secondary: "blue",
    scores: { red: 79, yellow: 38, green: 42, blue: 74 },
    utilisation: 83,
    available: "allocated",
    clients: 3,
    revenue: "€620k",
    bio: "Engineering manager with a deep technical bench. Sets a high bar, runs tight engagements, and grows engineers fast. The person clients ask for when timelines look impossible.",
    capabilities: ["Engineering management", "Technical strategy", "Hiring", "Performance coaching"],
    achievements: [
      "Built the Equinor data-platform team from 2 to 14 in 18 months.",
      "Led the rescue of the Posten Norge logistics rebuild on the original deadline.",
      "Coached six engineers into senior in the last two years.",
    ],
    bestTrait: "Drives outcomes without dropping people. Engineers stay because of him.",
    vice: "High standards can read as cold. Pair with a warmer comms lead for sensitive clients.",
    wheelPosition: "Reforming Director",
    drivers: ["High-performing teams", "Clear ownership", "Engineering rigour", "Stretch goals"],
    detractors: ["Process without purpose", "Tolerated underperformance", "Slow decisions", "Politics"],
    howToSpeak: "Be direct and bring a position. Magnus will probe — that's not opposition, that's interest. Don't hedge; he reads hedging as weakness.",
    howToEmail: "Short, structured, with a recommendation. Numbered actions get done. Vague threads get archived.",
  },
];

function HumynWordmark({ size = 22 }: { size?: number }) {
  return (
    <span style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.5px", color: "#1A1A1A" }}>
      hum<span style={{ color: "#F5A623" }}>y</span>n
    </span>
  );
}

function Avatar({ person, size = 38 }: { person: Person; size?: number }) {
  const colour = energy[person.primary];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colour.bg,
        color: colour.text,
        border: `1px solid ${colour.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: Math.round(size * 0.36),
        flexShrink: 0,
      }}
    >
      {person.initials}
    </div>
  );
}

function EnergyBadge({ k, small = false }: { k: EnergyKey; small?: boolean }) {
  const e = energy[k];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: small ? "3px 8px" : "4px 10px",
        borderRadius: 100,
        background: e.bg,
        color: e.text,
        border: `1px solid ${e.border}`,
        fontSize: small ? 10 : 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
      {e.label}
    </span>
  );
}

function StatusBadge({ k }: { k: AvailKey }) {
  const a = availability[k];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 100,
        background: a.bg,
        color: a.text,
        border: `1px solid ${a.border}`,
        fontSize: 10,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
      {a.label}
    </span>
  );
}

function UtilPill({ value }: { value: number }) {
  const tone = utilTone(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 72, height: 5, background: "#EDEDEA", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.min(value, 100)}%`,
            height: "100%",
            background: tone.color,
            borderRadius: 4,
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: tone.color, fontWeight: 600 }}>{value}%</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "#9A9A9A",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        fontWeight: 500,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 100,
        background: "#FAFAF8",
        color: "#5A5A5A",
        border: "1px solid rgba(0,0,0,0.07)",
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function EnergyBars({ person }: { person: Person }) {
  return (
    <div>
      {(["red", "yellow", "green", "blue"] as EnergyKey[]).map((c) => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: energy[c].color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#5A5A5A", width: 110 }}>{energy[c].label}</span>
          <div style={{ flex: 1, height: 4, background: "#EDEDEA", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${person.scores[c]}%`,
                height: "100%",
                background: energy[c].color,
                borderRadius: 2,
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "#9A9A9A", width: 28, textAlign: "right" }}>
            {person.scores[c]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function PersonCard({
  person,
  inTeam,
  onQuickView,
  onToggleTeam,
}: {
  person: Person;
  inTeam: boolean;
  onQuickView: (p: Person) => void;
  onToggleTeam: (p: Person) => void;
}) {
  const tone = utilTone(person.utilisation);
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar person={person} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.2px" }}>
            {person.name}
          </div>
          <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 2 }}>
            {person.role} · {person.location}
          </div>
        </div>
        <button
          onClick={() => onToggleTeam(person)}
          aria-label={inTeam ? "Remove from team" : "Add to team"}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.07)",
            background: inTeam ? "#1A1A1A" : "#FFFFFF",
            color: inTeam ? "#FFFFFF" : "#1A1A1A",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {inTeam ? "−" : "+"}
        </button>
      </div>

      <p
        style={{
          fontSize: 13,
          color: "#5A5A5A",
          lineHeight: 1.55,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {person.bio}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {person.capabilities.slice(0, 3).map((c) => (
          <Pill key={c}>{c}</Pill>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <EnergyBadge k={person.primary} small />
        <Pill>{person.wheelPosition}</Pill>
        <StatusBadge k={person.available} />
      </div>

      <div>
        <SectionLabel>Energy profile</SectionLabel>
        <EnergyBars person={person} />
      </div>

      <div>
        <SectionLabel>Utilisation · {tone.label}</SectionLabel>
        <div style={{ height: 6, background: "#EDEDEA", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min(person.utilisation, 100)}%`,
              height: "100%",
              background: tone.color,
              borderRadius: 4,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: "#9A9A9A" }}>{person.utilisation}% of 80% target</span>
          <span style={{ fontSize: 11, color: tone.color, fontWeight: 600 }}>{tone.label}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <div
            style={{
              fontSize: 10,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Clients
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginTop: 2 }}>
            {person.clients}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Revenue
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginTop: 2 }}>
            {person.revenue}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onQuickView(person)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#1A1A1A",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Quick view
        </button>
        <Link
          href={`/people/${person.id}`}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#1A1A1A",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Full profile
        </Link>
      </div>
    </div>
  );
}

function PersonRow({
  person,
  inTeam,
  onQuickView,
  onToggleTeam,
}: {
  person: Person;
  inTeam: boolean;
  onQuickView: (p: Person) => void;
  onToggleTeam: (p: Person) => void;
}) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar person={person} size={32} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{person.name}</div>
            <div style={{ fontSize: 11, color: "#9A9A9A" }}>{person.role}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12, color: "#5A5A5A" }}>{person.location}</td>
      <td style={{ padding: "12px 14px" }}>
        <EnergyBadge k={person.primary} small />
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12, color: "#5A5A5A" }}>{person.wheelPosition}</td>
      <td style={{ padding: "12px 14px" }}>
        <UtilPill value={person.utilisation} />
      </td>
      <td style={{ padding: "12px 14px" }}>
        <StatusBadge k={person.available} />
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12, color: "#5A5A5A" }}>{person.revenue}</td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button
            onClick={() => onQuickView(person)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#1A1A1A",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Quick view
          </button>
          <Link
            href={`/people/${person.id}`}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: "#1A1A1A",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Open
          </Link>
          <button
            onClick={() => onToggleTeam(person)}
            aria-label={inTeam ? "Remove from team" : "Add to team"}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.07)",
              background: inTeam ? "#1A1A1A" : "#FFFFFF",
              color: inTeam ? "#FFFFFF" : "#1A1A1A",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            {inTeam ? "−" : "+"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function QuickViewDrawer({ person, onClose }: { person: Person; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.2)", cursor: "pointer" }} />
      <div
        style={{
          width: 420,
          background: "#FFFFFF",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "-2px 0 24px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href={`/people/${person.id}`}
            style={{ fontSize: 12, color: "#1E6FA5", fontWeight: 500 }}
          >
            Full profile →
          </Link>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#1A1A1A",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar person={person} size={56} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>
              {person.name}
            </div>
            <div style={{ fontSize: 12, color: "#5A5A5A", marginTop: 2 }}>
              {person.role} · {person.location}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <EnergyBadge k={person.primary} small />
          <Pill>{person.wheelPosition}</Pill>
          <StatusBadge k={person.available} />
        </div>

        <div>
          <SectionLabel>About</SectionLabel>
          <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6, margin: 0 }}>{person.bio}</p>
        </div>

        <div>
          <SectionLabel>Energy profile</SectionLabel>
          <EnergyBars person={person} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div
            style={{
              background: "#EEF7F2",
              border: "1px solid #9ED4B8",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#1A5C38",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Best trait
            </div>
            <div style={{ fontSize: 12, color: "#1A5C38", lineHeight: 1.5 }}>{person.bestTrait}</div>
          </div>
          <div
            style={{
              background: "#FDF0EE",
              border: "1px solid #FCCDC6",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#9B2A1A",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Watch-out
            </div>
            <div style={{ fontSize: 12, color: "#9B2A1A", lineHeight: 1.5 }}>{person.vice}</div>
          </div>
        </div>

        <div>
          <SectionLabel>Drivers</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {person.drivers.map((d) => (
              <Pill key={d}>{d}</Pill>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Detractors</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {person.detractors.map((d) => (
              <Pill key={d}>{d}</Pill>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>How to speak with them</SectionLabel>
          <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6, margin: 0 }}>
            {person.howToSpeak}
          </p>
        </div>
      </div>
    </div>
  );
}

function TeamBuilderDrawer({
  team,
  onClose,
  onRemove,
}: {
  team: Person[];
  onClose: () => void;
  onRemove: (p: Person) => void;
}) {
  const combined = useMemo(() => {
    const sum = { red: 0, yellow: 0, green: 0, blue: 0 };
    team.forEach((p) => {
      sum.red += p.scores.red;
      sum.yellow += p.scores.yellow;
      sum.green += p.scores.green;
      sum.blue += p.scores.blue;
    });
    const n = Math.max(team.length, 1);
    return {
      red: Math.round(sum.red / n),
      yellow: Math.round(sum.yellow / n),
      green: Math.round(sum.green / n),
      blue: Math.round(sum.blue / n),
    };
  }, [team]);

  const dominant: EnergyKey = (["red", "yellow", "green", "blue"] as EnergyKey[]).reduce(
    (best, c) => (combined[c] > combined[best] ? c : best),
    "red" as EnergyKey,
  );

  const avgUtil = team.length
    ? Math.round(team.reduce((a, p) => a + p.utilisation, 0) / team.length)
    : 0;

  const gaps: string[] = [];
  (["red", "yellow", "green", "blue"] as EnergyKey[]).forEach((c) => {
    if (team.length > 0 && combined[c] < 35) gaps.push(energy[c].label);
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.2)", cursor: "pointer" }} />
      <div
        style={{
          width: 420,
          background: "#FFFFFF",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "-2px 0 24px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>
            Team builder
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#1A1A1A",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {team.length === 0 ? (
          <div
            style={{
              padding: 24,
              background: "#FAFAF8",
              border: "1px dashed rgba(0,0,0,0.1)",
              borderRadius: 10,
              color: "#9A9A9A",
              fontSize: 13,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Add people from the directory using the + button on any card. The team profile builds itself
            as you go.
          </div>
        ) : (
          <>
            <div>
              <SectionLabel>Selected · {team.length}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {team.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 10,
                      background: "#FAFAF8",
                      borderRadius: 10,
                    }}
                  >
                    <Avatar person={p} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#9A9A9A" }}>{p.role}</div>
                    </div>
                    <EnergyBadge k={p.primary} small />
                    <button
                      onClick={() => onRemove(p)}
                      aria-label={`Remove ${p.name}`}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "1px solid rgba(0,0,0,0.07)",
                        background: "#FFFFFF",
                        cursor: "pointer",
                        fontSize: 13,
                        lineHeight: 1,
                      }}
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Combined energy</SectionLabel>
              {(["red", "yellow", "green", "blue"] as EnergyKey[]).map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: energy[c].color }} />
                  <span style={{ fontSize: 11, color: "#5A5A5A", width: 110 }}>{energy[c].label}</span>
                  <div style={{ flex: 1, height: 4, background: "#EDEDEA", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${combined[c]}%`,
                        height: "100%",
                        background: energy[c].color,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#9A9A9A", width: 28, textAlign: "right" }}>
                    {combined[c]}%
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div
                style={{
                  background: energy[dominant].bg,
                  border: `1px solid ${energy[dominant].border}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: energy[dominant].text,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Dominant energy
                </div>
                <div style={{ fontSize: 13, color: energy[dominant].text, fontWeight: 600 }}>
                  {energy[dominant].label}
                </div>
              </div>

              <div
                style={{
                  background: "#FAFAF8",
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#9A9A9A",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Avg utilisation
                </div>
                <div style={{ fontSize: 13, color: utilTone(avgUtil).color, fontWeight: 600 }}>
                  {avgUtil}% · {utilTone(avgUtil).label}
                </div>
              </div>
            </div>

            {gaps.length > 0 && (
              <div
                style={{
                  background: "#FFFBF2",
                  border: "1px solid #FAD98A",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#8B5A00",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Energy gap warning
                </div>
                <div style={{ fontSize: 12, color: "#8B5A00", lineHeight: 1.5 }}>
                  This team is light on {gaps.join(", ")}. Consider balancing before kickoff.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type GroupKey = "none" | "available" | "energy" | "location" | "utilisation";

function groupLabel(g: GroupKey, k: string): string {
  if (g === "available") return availability[k as AvailKey]?.label ?? k;
  if (g === "energy") return energy[k as EnergyKey]?.label ?? k;
  if (g === "utilisation") {
    if (k === "high") return "On target (80%+)";
    if (k === "mid") return "Below target (65–79%)";
    return "At risk (under 65%)";
  }
  return k;
}

function groupKeyFor(p: Person, g: GroupKey): string {
  if (g === "available") return p.available;
  if (g === "energy") return p.primary;
  if (g === "location") return p.location;
  if (g === "utilisation") {
    if (p.utilisation >= 80) return "high";
    if (p.utilisation >= 65) return "mid";
    return "low";
  }
  return "all";
}

export default function PeoplePage() {
  const [view, setView] = useState<"card" | "table">("card");
  const [search, setSearch] = useState<string>("");
  const [groupBy, setGroupBy] = useState<GroupKey>("none");
  const [selected, setSelected] = useState<Person | null>(null);
  const [team, setTeam] = useState<Person[]>([]);
  const [teamOpen, setTeamOpen] = useState<boolean>(false);

  const filtered = useMemo<Person[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const hay = [p.name, p.role, p.location, ...p.capabilities].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [search]);

  const grouped = useMemo<{ key: string; label: string; people: Person[] }[]>(() => {
    if (groupBy === "none") {
      return [{ key: "all", label: "All people", people: filtered }];
    }
    const map = new Map<string, Person[]>();
    filtered.forEach((p) => {
      const k = groupKeyFor(p, groupBy);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    });
    return Array.from(map.entries()).map(([key, list]) => ({
      key,
      label: groupLabel(groupBy, key),
      people: list,
    }));
  }, [filtered, groupBy]);

  function toggleTeam(p: Person) {
    setTeam((prev) =>
      prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p],
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3" }}>
      <header
        style={{
          height: 52,
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <HumynWordmark />
          <nav style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            {[
              { label: "People", active: true },
              { label: "Teams", active: false },
              { label: "Capacity", active: false },
              { label: "Insights", active: false },
            ].map((n) => (
              <span
                key={n.label}
                style={{
                  padding: "7px 14px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 500,
                  color: n.active ? "#FFFFFF" : "#5A5A5A",
                  background: n.active ? "#1A1A1A" : "transparent",
                  cursor: "pointer",
                }}
              >
                {n.label}
              </span>
            ))}
          </nav>
          <div style={{ flex: 1 }} />
          <Link
            href="/pulse/new"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "1px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#1A1A1A",
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1, color: "#F5A623" }}>+</span> New profile
          </Link>
          <button
            onClick={() => setTeamOpen(true)}
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "1px solid rgba(0,0,0,0.07)",
              background: team.length ? "#1A1A1A" : "#FFFFFF",
              color: team.length ? "#FFFFFF" : "#1A1A1A",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Build team
            {team.length > 0 && (
              <span
                style={{
                  background: "#F5A623",
                  color: "#1A1A1A",
                  borderRadius: 100,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 7px",
                }}
              >
                {team.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 6,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#9A9A9A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}
            >
              Pulse · Valtech Nordic
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: "#1A1A1A",
                letterSpacing: "-0.5px",
                margin: "6px 0 0",
              }}
            >
              People
            </h1>
            <div style={{ fontSize: 13, color: "#5A5A5A", marginTop: 4 }}>
              {filtered.length} {filtered.length === 1 ? "person" : "people"} · {people.length} total
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, role, location, skill…"
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#1A1A1A",
                fontSize: 12,
                width: 280,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupKey)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#1A1A1A",
                fontSize: 12,
                cursor: "pointer",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="none">Group by: None</option>
              <option value="available">Group by: Availability</option>
              <option value="energy">Group by: Energy type</option>
              <option value="location">Group by: Location</option>
              <option value="utilisation">Group by: Utilisation</option>
            </select>
            <div
              style={{
                display: "flex",
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 8,
                padding: 2,
              }}
            >
              {(["card", "table"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: view === v ? "#1A1A1A" : "transparent",
                    color: view === v ? "#FFFFFF" : "#5A5A5A",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {v === "card" ? "Cards" : "Table"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 32 }}>
          {grouped.map((g) => (
            <section key={g.key}>
              {groupBy !== "none" && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9A9A9A",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 500,
                    }}
                  >
                    {g.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#9A9A9A" }}>· {g.people.length}</div>
                </div>
              )}

              {view === "card" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 12,
                  }}
                >
                  {g.people.map((p) => (
                    <PersonCard
                      key={p.id}
                      person={p}
                      inTeam={team.some((x) => x.id === p.id)}
                      onQuickView={setSelected}
                      onToggleTeam={toggleTeam}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#FAFAF8" }}>
                        {["Person", "Location", "Energy", "Wheel", "Utilisation", "Available", "Revenue", ""].map(
                          (h, i) => (
                            <th
                              key={i}
                              style={{
                                textAlign: i === 7 ? "right" : "left",
                                padding: "10px 14px",
                                fontSize: 10,
                                color: "#9A9A9A",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                fontWeight: 500,
                                borderBottom: "1px solid rgba(0,0,0,0.06)",
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {g.people.map((p) => (
                        <PersonRow
                          key={p.id}
                          person={p}
                          inTeam={team.some((x) => x.id === p.id)}
                          onQuickView={setSelected}
                          onToggleTeam={toggleTeam}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                background: "#FFFFFF",
                border: "0.5px solid rgba(0,0,0,0.07)",
                borderRadius: 12,
                padding: 48,
                textAlign: "center",
                color: "#9A9A9A",
                fontSize: 13,
              }}
            >
              No people match &ldquo;{search}&rdquo;.
            </div>
          )}
        </div>
      </main>

      {selected && <QuickViewDrawer person={selected} onClose={() => setSelected(null)} />}
      {teamOpen && (
        <TeamBuilderDrawer
          team={team}
          onClose={() => setTeamOpen(false)}
          onRemove={(p) => toggleTeam(p)}
        />
      )}
    </div>
  );
}
