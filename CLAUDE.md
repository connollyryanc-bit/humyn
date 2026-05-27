# Humyn — Claude Code Instructions

Always read this file before making any changes to the project.

---

## What is Humyn?

Humyn is a people intelligence platform built for Valtech Nordic. It is a proprietary alternative to Crystal Knows and Teamtailor — built from scratch, owned entirely by Valtech.

The platform has three stages:
- **Stage 1 — Pulse**: Personality profiling and people intelligence (current build)
- **Stage 2 — Compass**: Capacity management, utilisation tracking, C-suite dashboards
- **Stage 3 — Pipeline**: Hiring platform, ATS, interview orchestration

We are currently building Stage 1.

---

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode OFF — use `strict: false` in tsconfig)
- **Styling**: Inline styles only — no Tailwind classes, no CSS modules, no external UI libraries
- **Charts**: Only if needed — use simple inline SVG or canvas, no chart libraries unless explicitly requested
- **No external UI component libraries** — everything is built from scratch

---

## Design System

### Brand
- Name: **humyn** (always lowercase)
- Wordmark: `hum` + `y` in Sunshine Yellow + `n` — the `y` is always the brand accent colour
- Tone: Clean, modern, minimal — inspired by Monday.com's aesthetic
- No heavy borders, no drop shadows unless subtle, lots of white space

### Colours — Insights Discovery Energy System
These four colours are the entire colour language of Humyn. Use them consistently and meaningfully.

```
Fiery Red:
  color: #E8402A
  bg: #FDF0EE
  text: #9B2A1A
  border: #FCCDC6

Sunshine Yellow (brand primary):
  color: #F5A623
  bg: #FFFBF2
  text: #8B5A00
  border: #FAD98A

Earth Green:
  color: #2E8B57
  bg: #EEF7F2
  text: #1A5C38
  border: #9ED4B8

Cool Blue:
  color: #1E6FA5
  bg: #EEF4FB
  text: #124A6E
  border: #8DC2E8
```

### Neutral Palette
```
Ink (primary text):     #1A1A1A
Ink2 (secondary text):  #5A5A5A
Ink3 (tertiary/labels): #9A9A9A
Surface (page bg):      #F7F6F3
Card (white):           #FFFFFF
Border:                 rgba(0,0,0,0.07)
Subtle bg:              #FAFAF8
```

### Typography
- Font: `system-ui, -apple-system, sans-serif`
- Page titles: 22–26px, weight 600, letter-spacing -0.3px to -0.5px
- Section labels: 11px, weight 500, uppercase, letter-spacing 0.06–0.08em, color Ink3
- Body: 13–14px, color Ink2, line-height 1.6
- Small labels: 10–11px

### Spacing & Shape
- Border radius: 8–12px for cards, 100px for pills/badges
- Card padding: 1rem to 1.25rem
- Gap between cards: 12px
- Page max-width: 1280px
- Page padding: 28px 32px
- Nav height: 52px

### Components — always build these consistently

**Avatar**: Circular, coloured background from primary energy colour, initials, bordered
**EnergyBadge**: Pill with colour dot + energy label, coloured bg/text
**StatusBadge**: Pill — green for available now, amber for soon, red for allocated
**UtilPill**: Small bar + percentage, colour-coded green/amber/red vs 80% target
**Section label**: Uppercase, 11px, Ink3, letter-spacing 0.06em

---

## Data Model

Every person has these fields:

```typescript
interface Person {
  id: number;
  name: string;
  initials: string;
  role: string;
  location: string;
  primary: "red" | "yellow" | "green" | "blue";
  secondary: "red" | "yellow" | "green" | "blue";
  scores: { red: number; yellow: number; green: number; blue: number };
  utilisation: number;        // percentage 0-100
  available: "now" | "soon" | "allocated";
  clients: number;
  revenue: string;            // e.g. "€840k"
  bio: string;                // 2-3 sentence professional summary
  capabilities: string[];     // top 3-4 skills
  achievements: string[];     // 3 key achievements
  bestTrait: string;          // one-line strength
  vice: string;               // one-line watch-out
  wheelPosition: string;      // Insights 72-position name e.g. "Inspirer", "Director"
  drivers: string[];          // 4 things that motivate them
  detractors: string[];       // 4 things that drain them
  howToSpeak: string;         // paragraph on verbal communication style
  howToEmail: string;         // paragraph on written communication style
}
```

Utilisation colour logic:
- 80%+ = green (#2E8B57) = "On target"
- 65–79% = amber (#F5A623) = "Below target"  
- Below 65% = red (#E8402A) = "At risk"

---

## File Structure

```
app/
  page.tsx              — People directory (main page)
  people/
    [id]/
      page.tsx          — Individual full profile page
  teams/
    page.tsx            — Team builder (Stage 1, coming soon)
  capacity/
    page.tsx            — Capacity dashboard (Stage 2)
  insights/
    page.tsx            — AI insights & reports (Stage 2)
```

---

## Navigation

The nav has four items: People, Teams, Capacity, Insights
- Active item: black pill background, white text
- Inactive: transparent background, Ink2 text
- Nav is sticky, white background, subtle bottom border

---

## Key UX Patterns

**People directory:**
- Default view: card grid (auto-fill, min 300px)
- Alt view: table — toggled by Cards/Table button top right
- Group by dropdown: None, Availability, Energy type, Location, Utilisation
- Search: filters by name, role, location, capabilities
- Each card has: Quick view button (opens drawer), Full profile link (goes to /people/[id]), + button (adds to team builder)

**Quick view drawer:**
- Slides in from right, 420px wide
- Dark overlay behind, click to close
- Shows: bio, energy breakdown bars, best trait, vice, drivers, how to speak
- Has "Full profile →" link at top

**Full profile page (/people/[id]):**
- Tabs: Overview, Personality, How to Engage, Achievements
- Overview: energy bars, capabilities, best trait/vice, drivers/detractors
- Personality: wheel position description, drivers list, detractors list
- How to Engage: how to speak, how to email, AI message composer
- Achievements: numbered list of key achievements

**Team builder:**
- Triggered by "Build team" button in nav (shows count when people added)
- Slides in from right
- Shows selected people, combined energy profile, dominant energy, avg utilisation, energy gap warning
- + button on cards adds/removes from team

**AI message composer (on full profile page):**
- Text area: user describes what they want to say
- Button generates a message written in the style that lands with that person's energy type
- Output shown in coloured box matching their primary energy

---

## TypeScript Rules

- Always define interfaces for all data types
- Use union types for energy keys: `type EnergyKey = "red" | "yellow" | "green" | "blue"`
- Use union types for availability: `type AvailKey = "now" | "soon" | "allocated"`
- Cast string indexes: `energy[value as EnergyKey]`
- Never use implicit `any` types
- Export the `people` array and `Person` interface from `app/page.tsx` so profile pages can import them

---

## What NOT to do

- Never use Tailwind CSS classes
- Never use external component libraries (no shadcn, no MUI, no Chakra)
- Never use CSS modules or separate `.css` files
- Never add unnecessary comments or console.logs
- Never make the design dark mode — always light
- Never use emoji in the UI
- Never use gradients — flat colours only
- Never add animations beyond simple CSS transitions (0.15s)
- Never make cards or sections feel heavy or cramped — white space is intentional
- Never abbreviate energy colour names (always "Fiery Red" not "Red")

---

## Current Status

Stage 1 is in active development. The following is built:
- People directory with card and table views
- Flexible grouping and search
- Quick view drawer
- Individual profile pages with tabs
- Team builder (basic)
- AI message composer (template-based, not yet connected to Claude API)

Next priorities:
- Connect AI message composer to real Claude API
- LinkedIn paste → profile generation (Pulse inference engine)
- Add person flow
- Richer energy wheel visualisation (72-position)
- Capacity dashboard (Stage 2 start)

---

## The Owner

This platform is being built for and by the Nordic Capacity Manager at Valtech. They are not a developer. All code must be clean, well-structured, and easy to hand off to a developer later. Prioritise clarity over cleverness.

