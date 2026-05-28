# Humyn — Agent Instructions

This file defines how Claude Code should behave when working on the Humyn project.
Always read CLAUDE.md before making any changes.

---

## Before Every Task

1. Read `CLAUDE.md` fully
2. Read `PRODUCT.md` to understand context and priorities
3. Check which files are affected before editing anything
4. Never edit more than what is asked — surgical changes only

---

## How to Approach Tasks

### Understanding the request
- If the request is vague, infer intent from CLAUDE.md and PRODUCT.md context
- If genuinely unclear, ask one focused question before proceeding
- Never ask more than one question at a time
- Assume the user is non-technical — explain what you're doing in plain English

### Before writing code
- Identify which file(s) need to change
- Check if a component already exists before creating a new one
- Check the data model in CLAUDE.md — never invent new fields not in the Person interface without flagging it

### Writing code
- Always use TypeScript with proper types — no implicit `any`
- Always use inline styles — never Tailwind, never CSS modules
- Always follow the colour system in CLAUDE.md exactly
- Always follow the spacing, typography and component patterns in CLAUDE.md
- Keep components small and readable
- Export data and types that other pages need

### After writing code
- Mentally check: does this match the Monday.com-inspired aesthetic described in CLAUDE.md?
- Mentally check: will this build without TypeScript errors?
- Mentally check: does this work on both card and table views if relevant?
- If you created a new page, check it links correctly in the nav

---

## File Rules

| File | Rule |
|------|------|
| `app/page.tsx` | Main people directory. Source of truth — exports `people` array, `Person`, `EnergyKey`, `AvailKey`, `energy`, `availability`, `utilTone`. Every other page imports from here. |
| `app/people/[id]/page.tsx` | Individual profile page. Import people + types from `../../page`. |
| `app/pulse/new/page.tsx` | LinkedIn-paste profile generator. Talks to `/api/pulse`. Never call Anthropic directly from a page component — the key must stay server-side. |
| `app/api/pulse/route.ts` | Server-side Anthropic proxy. Edit only when changing the system prompt, model, or validation. Reads `ANTHROPIC_API_KEY` from env. |
| `app/capacity/page.tsx` | Capacity & retention dashboard. CapacityData lives in this file alongside the page until we wire a real backing store. |
| `app/teams/page.tsx` | Full Teams module. Five tabs. Brief data, PitchRole data and PersonAvailability data all live in this file until a backing store exists. Import Person and EnergyKey from ../../page (check exact depth). |
| `app/pipeline/page.tsx` | Jobs list. Job interface lives here. |
| `app/pipeline/[jobId]/page.tsx` | Per-job candidate kanban. Imports Job from ../page. |
| `app/pipeline/[jobId]/candidates/[candidateId]/page.tsx` | Candidate profile. Imports Candidate and Job from ../../page. Imports Pulse components from ../../../../components/energy. |
| `app/components/energy.tsx` | Shared SVG visualisations (EnergyRing, EnergyDynamics, EnergySpider). **Always import. Never recreate in a page file.** Fix bugs here, not in copies. |
| `app/layout.tsx` | Root layout. Loads Valtech Neue + Sons via next/font/local. Keep minimal. |
| `app/fonts.ts` | next/font/local declarations. Update only when fonts change. |
| `app/globals.css` | Reset + body defaults + `.font-display` utility. No Tailwind. |
| `public/fonts/` | Valtech Neue + Sons `.woff2` files. Do not delete. |
| `CLAUDE.md` | Never edit unless explicitly asked. |
| `AGENTS.md` | Never edit unless explicitly asked. |
| `PRODUCT.md` | Never edit unless explicitly asked. |

### Before building any new visualisation

Always check `app/components/energy.tsx` first. The energy ring, dynamics bars, and
spider chart already exist as shared SVG components. If a page needs one of these, import
it — do not rebuild. If the existing component is missing a feature, extend it in place.

#### Building the Pipeline module — build order

Build in this order to avoid circular dependencies:

1. app/pipeline/page.tsx — jobs list first
   Needs Job interface only. Shows all jobs as a list
   with stage counts, status badges, recruiter assigned.

2. app/pipeline/[jobId]/page.tsx — kanban per job
   Needs Job + Candidate interfaces. The kanban is the
   core interaction. Stages scroll horizontally, each
   column 280px wide. Candidate cards show name, avatar
   with energy colour if profiled, star rating, source.

3. app/pipeline/[jobId]/candidates/[candidateId]/page.tsx
   Needs all interfaces. This is the richest page —
   a Pulse profile combined with a recruitment tracker.
   Reuse the Pulse profile display from people/[id].
   Import EnergyRing, EnergyDynamics from components/energy.

4. app/pipeline/new/page.tsx — job creation last
   Form with internal title, external title, department,
   location, application form builder, stage editor.

Key Pipeline patterns:
- Kanban uses click-to-move-stage buttons (not drag/drop)
- Every stage change logs to the activity feed
- Internal candidates already have a Pulse profile —
  display it, never regenerate
- Team fit score compares candidate Pulse scores against
  average scores of the team they would join
- Trigger automation is shown as a UI config panel
  per stage — implementation can be stubbed for now

#### Pipeline design patterns

Pipeline pages feel more task-focused than profile-focused.
Clean kanban aesthetic with Humyn energy colour language.
Candidate profile is richest page — Pulse profile display
plus recruitment activity tracker in a two-column layout.
Stage columns scroll horizontally, fixed 280px each.

#### Building the Teams module

The Teams module is the operational heart for a capacity
manager handling 15-20 concurrent briefs simultaneously.
The primary view is the portfolio — everything at once,
triaged by urgency, not a single brief in isolation.

Five tabs — build in this order:
1. Portfolio tab first — this is the default view and
   the most important. Priority actions surfaced at top,
   briefs list below, available people and market
   snapshot on the right, AI insight at the bottom.

2. Kanban tab — all briefs as cards across 6 stage
   columns. Horizontally scrollable. Same stage colour
   system as Pipeline.

3. Availability tab — all people by market. Simple grid.
   Filterable by energy type and availability status.

4. Pitch board tab — four sub-tabs. Open roles is the
   consultant view. Manage roles is the capacity manager
   view. My applications shows application status.
   Credits shows the gamification score.

5. Timeline tab last — 8-week Gantt, consultants as rows,
   project blocks as columns. Most complex to build.

Monday bench email settings:
- Collapsible panel below the main tabs
- Shows who receives an email this Monday (benchDays > 0)
- Toggle settings for: bench consultants, finishing within
  14 days, personalise by energy, matched roles only
- Shows total count and scheduled send time

#### Gamification — ethical design rules

The credit system rewards participation not ranking.
Scores are private — consultants see their own score,
never colleagues'. No leaderboards. No public rankings.
No punitive mechanics — credits only go up, never down.
The score signals proactive engagement for performance
review and bonus framework when available.
Referral credits reward collaborative sourcing — pointing
a colleague toward a role they'd suit, even if you
applied yourself, earns credits when they are selected.
This makes every consultant a distributed sourcing agent
without it feeling competitive or transactional.

---

## TypeScript Patterns — Always Use These

```typescript
// Energy key type
type EnergyKey = "red" | "yellow" | "green" | "blue";

// Availability type  
type AvailKey = "now" | "soon" | "allocated";

// Casting string to key type when indexing
energy[value as EnergyKey]
availability[value as AvailKey]

// Component prop types — always explicit
function Avatar({ person, size = 34 }: { person: Person; size?: number })

// State with type
const [selected, setSelected] = useState<Person | null>(null);
const [view, setView] = useState<"card" | "table">("card");

// Arrays of energy keys — always cast
(["red", "yellow", "green", "blue"] as EnergyKey[]).map(...)
```

---

## Component Patterns — Always Use These

### Energy bar (for profile breakdowns)
```tsx
{(["red","yellow","green","blue"] as EnergyKey[]).map(c => (
  <div key={c} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
    <div style={{ width:6, height:6, borderRadius:"50%", background:energy[c].color, flexShrink:0 }}/>
    <span style={{ fontSize:11, color:"#5A5A5A", width:120 }}>{energy[c].label}</span>
    <div style={{ flex:1, height:4, background:"#EDEDEA", borderRadius:2, overflow:"hidden" }}>
      <div style={{ width:`${person.scores[c]}%`, height:"100%", background:energy[c].color, borderRadius:2 }}/>
    </div>
    <span style={{ fontSize:11, color:"#9A9A9A", width:28, textAlign:"right" }}>{person.scores[c]}%</span>
  </div>
))}
```

### Section label
```tsx
<div style={{ fontSize:11, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
  Label text
</div>
```

### Card wrapper
```tsx
<div style={{ background:"#FFFFFF", border:"0.5px solid rgba(0,0,0,0.07)", borderRadius:12, padding:"1.25rem" }}>
```

### Drawer wrapper
```tsx
<div style={{ position:"fixed", inset:0, zIndex:50, display:"flex" }}>
  <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,0.2)" }}/>
  <div style={{ width:420, background:"#FFFFFF", overflowY:"auto", padding:"24px", boxShadow:"-2px 0 24px rgba(0,0,0,0.1)" }}>
    {/* content */}
  </div>
</div>
```

---

## Colour Usage Rules

The four Pulse Map energies are personality data. Use their colours only when the UI is
about a person's energy mix, never as decorative chrome.

- **Driver (red, `#E8402A`)** — action-focused; urgency, decisiveness, high-risk states,
  allocated availability
- **Energizer (yellow, `#F5A623`)** — people-focused; enthusiasm signals, soft warnings,
  "below target" utilisation, medium risk in the capacity dashboard. **Never used for
  chrome** — that's Coral's job.
- **Supporter (green, `#2E8B57`)** — stability-focused; calm, supportive signals, "on
  target" utilisation, low risk, available-now status
- **Analyst (blue, `#1E6FA5`)** — process-focused; analytical signals, information,
  precise reads

Chrome (the parts of the UI that are NOT about personality data) uses the Valtech brand
palette — Coral `#FF5040` is the accent, Off White `#F3F0EA` is the surface, Soft Black
`#161311` is the primary ink. The accent `y` in the humyn wordmark is Coral, not
Energizer yellow.

- **Never** invent colours outside the Pulse + Valtech palettes
- **Never** use Energizer yellow for chrome (the wordmark, buttons, badges that aren't about energy)
- **Never** use Coral for personality data (the four energies own those slots)

---

## Common Mistakes to Avoid

- Using `energyConfig` instead of `energy` as the variable name
- Forgetting to export `people` and `Person` from page.tsx
- Using Insights Discovery vocabulary (Fiery Red, Sunshine Yellow, Director, Inspirer,
  72-position wheel). The framework is the Humyn Pulse Map — four archetypes named by
  colour and behaviour: **Driver** (red, action-focused), **Energizer** (yellow,
  people-focused), **Supporter** (green, stability-focused), **Analyst** (blue,
  process-focused). Eight wheel positions: pure quadrants (Driver / Energizer / Supporter
  / Analyst) plus mixes (e.g. "Energizing Driver", "Supportive Energizer", "Analytical
  Supporter", "Driving Analyst").
- Using Energizer yellow `#F5A623` for chrome — the wordmark `y`, the "+" icon, the
  team-count badge are all **Coral `#FF5040`**. Energizer belongs to personality data
  only.
- Rebuilding an energy ring / spider / dynamics chart inline in a page file — always import
  from `app/components/energy.tsx`.
- Calling the Anthropic API directly from a client component. The key only ever sits on
  the server route at `app/api/pulse/route.ts`.
- Setting `fontFamily` inline to use Valtech Neue — always use `className="font-display"`
  so the next/font CSS variable lookup stays consistent.
- Using `onClick` on a div without also setting `cursor: pointer`
- Forgetting `boxSizing: "border-box"` on inputs
- Using `<a>` tags instead of Next.js `<Link>` for internal navigation
- Putting `"use client"` on layout.tsx unnecessarily
- Creating components that import from each other circularly

---

## When Something Breaks

1. Read the error message carefully — TypeScript errors usually tell you exactly what's wrong
2. Check the type definitions in CLAUDE.md
3. Most common fix: add `as EnergyKey` or `as AvailKey` cast to string index operations
4. If a build fails on Vercel but works locally, it's almost always a TypeScript strict error
5. Run `npx tsc --noEmit` locally to catch all TypeScript errors before pushing

---

## Planned Future Features — Aware But Not Yet Built

Keep these in mind when working — they shape architecture decisions today:

- **Chrome extension** — one-click Humyn profile generation from any LinkedIn page. The
  extension posts the same scraped text to `/api/pulse` that the manual paste flow uses,
  so keep that route stable.
- **ERP / OpenAir integration** — live availability data replacing the hand-curated
  `utilisation` and `available` fields on `Person`. Don't bake assumptions about that
  data being static into new code.
- **Brief / RFP → AI team suggestion** — the dream feature. Will need a new route that
  accepts a brief and returns ranked team options. Plan for it; don't build it.
- **Pan-Nordic job board** at `/jobs` — single view of every available person.
- **C-suite read-only dashboard** at `/board` — clean revenue + capacity + demand view.
- **Hiring pipeline** at `/pipeline` — proprietary ATS with Pulse from day one.

See PRODUCT.md "The Evolved Vision" for the full strategic picture.

---

## Git Commit Messages

Always use clear, descriptive commit messages — first line is a short summary, body
explains the why and the user-visible effect.

Good first lines (concrete, scoped, user-visible):
- `add /capacity dashboard with flight-risk, utilisation, bench and cost-of-leaving panels`
- `rename to Humyn Pulse Map and add ring + spider + dynamics visuals`
- `wire Valtech Neue + Sons fonts via next/font/local`
- `fix overlapping labels on the energy ring`
- `align humyn chrome with Valtech brand: Coral accent, Off White surface`
- `add Pulse profile generator at /pulse/new`

Bad first lines:
- `update` / `fix` / `changes` / `wip` — too vague
- `tweak styles` — no information
- `refactor components` — doesn't tell future-you what changed
- `feat: blah` — no Conventional Commits in this repo

Always co-author the commit:
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Push to `main` only when explicitly authorised. Vercel auto-deploys main to production.

