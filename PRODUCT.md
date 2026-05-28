# Humyn — Product Vision & Roadmap

---

## What is Humyn?

Humyn is a people intelligence platform built for Valtech Nordic. It exists because the tools that manage people — HR platforms, personality tools, capacity spreadsheets, ATS systems — are all separate, shallow, and treat people as resources rather than as human beings with distinct personalities, values, relationships and potential.

Humyn brings everything together in one place. It understands not just what someone can do, but how they think, what drives them, how they communicate, what teams they thrive in, and what value they bring to clients and the organisation.

**The north star:** Every person at Valtech Nordic has a rich, living profile. Leaders make better decisions about teams, hiring, and capacity because they understand their people more deeply. Consultants feel valued as individuals, not just day rates.

---

## The Problem We're Solving

### For the Nordic Capacity Manager
- Utilisation data lives in Excel and Power BI — no single source of truth
- No visibility of who is available, when, and what they're suited for
- Team composition decisions are made on skills alone — personality fit is guesswork
- The 80% utilisation target is hard to hit because bench management is reactive
- C-suite needs clear, simple visibility of capacity, revenue and demand

### For hiring managers
- No ATS that integrates with personality profiling
- Candidate assessment is inconsistent and manual
- Interview scheduling, transcript analysis and offer management are all separate tools
- No way to assess cultural or team fit before making an offer

### For people managers
- No understanding of what motivates each individual
- Difficult to know when someone is at risk of disengagement
- No tool to help managers communicate more effectively with different personality types
- Client relationships and revenue contributions are invisible in people data

---

## The Solution — Three Platforms in One

### Platform 1: Pulse — Personality & People Intelligence
The foundation. Every person gets a rich profile built from LinkedIn data and internal signals — no lengthy questionnaire required.

Profiles include:
- Humyn Pulse Map energy profile — four archetypes named Colour → Behaviour → Archetype:
  Driver (red, action-focused), Energizer (yellow, people-focused), Supporter (green,
  stability-focused), Analyst (blue, process-focused)
- Wheel position placement across eight types — pure quadrants (Driver, Energizer,
  Supporter, Analyst) plus mixes (e.g. Energizing Driver, Supportive Energizer,
  Analytical Supporter, Driving Analyst)
- Three visualisations on every profile: energy ring, eight-axis engagement spider chart, vertical energy dynamics bars
- Drivers and detractors
- Communication style guides (how to speak, how to email)
- AI message composer — write in a style that lands with each personality
- Skills, capabilities and achievements
- Team compatibility scoring

Who gets profiled:
- All existing Valtech Nordic consultants
- All new candidates (from LinkedIn URL)
- Client stakeholders (for pitch and relationship intelligence)

### Platform 2: Compass — Capacity & Revenue Intelligence
The operational core. Built on top of Pulse profiles, giving the capacity manager and C-suite a real-time view of the organisation.

Features:
- Live utilisation dashboard — individual, team, and organisation level
- 80% utilisation target tracking with alerts
- Availability heatmap — who's free, when
- Demand forecasting — cross-referenced against pitch pipeline and seasonality
- Revenue per person — clients, relationships, influenced revenue
- Team builder — compose project teams by skill AND personality fit
- C-suite dashboard — clean, simple, read-only view of capacity, margin, revenue

Data sources to integrate:
- Power BI reports
- SharePoint documents
- Excel capacity sheets
- LinkedIn profiles

### Platform 3: Pipeline — Hiring & HR
The talent layer. A proprietary ATS integrated with Pulse from day one.

Features:
- Job posting and management
- Candidate tracking pipeline
- Interview scheduling with calendar sync
- AI transcript analysis — scoring, fit summary, red flags
- Automated email communications
- Offer and onboarding flow
- Pulse assessment triggered automatically for all candidates
- Candidate vs team fit scoring

---

## Users & Access Levels

### Master Admin (Nordic Capacity Manager)
- Full access to everything
- Backend admin panel
- Can edit all profiles, data, settings
- Sees all salary, revenue and margin data
- Manages user access

### People Team / HR
- Access to hiring flows, candidate profiles, HR admin
- Access to all consultant profiles
- Capacity tools
- Cannot see salary data of peers

### Hiring Managers
- Access to candidates in their pipelines
- Can view (not edit) consultant profiles
- No salary or margin data

### C-Suite (Read only)
- Clean dashboard view
- Revenue, margin, capacity, utilisation
- Written AI insights and trend reports
- Cannot see individual salary data

### Individual Consultants (Future)
- View their own profile
- See their utilisation and availability
- Update their capabilities and achievements

---

## Design Principles

1. **People first** — this is a tool about humans, not resources. The language, the design and the insights should reflect that
2. **Lightweight to profile** — no 200-question assessments. Profiles are inferred from existing data
3. **Clean and intuitive** — inspired by Monday.com. White space, clear hierarchy, colour with purpose
4. **Actionable intelligence** — not just data. Every insight should suggest an action
5. **Role-appropriate views** — what the C-suite sees is different from what HR sees. Data is always shown in context
6. **Confidence-scored** — all inferred data shows a confidence level. Transparency builds trust

---

## Personality Framework — The Humyn Pulse Map

Humyn uses its own proprietary four-energy temperament framework, informed by Jungian
psychological types. The Pulse Map is not Insights Discovery — Humyn does not license,
depend on, or reproduce that vocabulary. The platform owns this language outright, which
matters for white-labelling and pan-Nordic rollout.

| Colour | Behaviour          | Archetype  | Hex       | Traits                            | Approximate DISC parallel |
|--------|--------------------|------------|-----------|-----------------------------------|---------------------------|
| Red    | Action-focused     | Driver     | `#E8402A` | Decisive, driven, direct          | Dominant (D)              |
| Yellow | People-focused     | Energizer  | `#F5A623` | Enthusiastic, sociable, creative  | Influential (I)           |
| Green  | Stability-focused  | Supporter  | `#2E8B57` | Caring, patient, reliable         | Steady (S)                |
| Blue   | Process-focused    | Analyst    | `#1E6FA5` | Analytical, precise, careful      | Conscientious (C)         |

The wheel has eight positions — four pure, four mixed:

- **Pure positions**: Driver (red), Energizer (yellow), Supporter (green), Analyst (blue)
- **Mixed positions**: red/yellow, yellow/green, green/blue, blue/red — expressed as
  primary + influence (e.g. *Energizing Driver*, *Supportive Energizer*, *Analytical
  Supporter*, *Driving Analyst*).

---

## Technical Architecture

### Frontend
- Next.js with App Router
- TypeScript
- Inline styles (design system defined in CLAUDE.md)
- Deployed on Vercel

### Data Layer (Phase 2)
- Azure Synapse or similar data warehouse
- Consolidates Power BI, SharePoint, Excel sources
- LinkedIn data ingestion (public profile scraping or API)

### AI Layer
- Claude API for profile inference, message composition, written insights
- LinkedIn text → Humyn Pulse Map energy mapping via a server-side route (`/api/pulse`)
- Interview transcript processing (planned)

### Auth (Phase 2)
- Role-based access control (RBAC)
- Four tiers: Admin, HR, Hiring Manager, C-Suite
- SSO via Valtech Microsoft credentials

### Integrations (Phase 2-3)
- Microsoft 365 (calendar, email)
- Power BI (capacity and revenue data)
- SharePoint (documents and HR records)
- LinkedIn (profile data)

---

## Build Phases

### Phase 1 — Pulse MVP (Mostly shipped)
**Goal:** Every Valtech Nordic consultant has a rich profile. The people directory is live and useful.

- [x] People directory with card and table views
- [x] Flexible grouping (None / Availability / Energy / Location / Utilisation) and search across name, role, location, capabilities
- [x] Individual profile pages with four tabs (Overview, Personality, How to Engage, Achievements)
- [x] Quick view drawer (420px, right-side, energy bars + best trait / watch-out / drivers / how to speak)
- [x] Team builder (selected people, combined energy, dominant energy, average utilisation, energy gap warnings)
- [x] AI message composer (template-based, primary-energy themed output)
- [x] LinkedIn paste → profile generation via Claude API at `/pulse/new`
- [x] Energy ring, energy dynamics bars, and engagement spider chart on every profile (see `app/components/energy.tsx`)
- [x] Profile confidence scoring (returned by the AI generator, displayed on the generated profile)
- [x] Rebrand to the Humyn Pulse Map — full break from Insights Discovery vocabulary
- [x] Valtech brand alignment (Coral accent, Off White surface, Valtech Neue + Sons fonts)
- [ ] Add / edit person flow (form to author profiles without code)
- [ ] Save-to-directory wiring on the Pulse generator
- [ ] Chrome extension — one-click profile generation from any LinkedIn page

### Phase 2 — Compass (Capacity) — In progress
**Goal:** The capacity manager has a real-time view of utilisation, availability and demand.

- [x] Capacity & retention dashboard at `/capacity` — flight-risk alerts, utilisation bars vs 80% target, bench duration with energy-specific thresholds (Energizer 14d · Supporter 21d · Driver/Analyst 28d), cost-of-leaving breakdown, AI-written weekly read
- [ ] Availability heatmap (who's free, by week)
- [ ] Demand forecasting cross-referenced against the pitch pipeline and seasonality
- [ ] C-suite read-only board dashboard (revenue, margin, capacity, demand)
- [ ] ERP / OpenAir integration for live availability data
- [ ] Power BI / SharePoint / Excel data ingestion
- [ ] AI-written weekly narrative reports (auto-generated, exportable as PDF)
- [ ] Pan-Nordic job board — every available person across all markets in one view

### Phase 3 — Pipeline (Hiring)
**Goal:** Hiring is managed entirely within Humyn, integrated with Pulse from day one.

- [ ] Job posting management
- [ ] Candidate tracking pipeline (Applied → Screened → Interviewed → Offer → Hired)
- [ ] Brief / RFP upload → AI team suggestion (the dream feature — see Evolved Vision)
- [ ] Interview scheduling with calendar sync
- [ ] AI transcript analysis (scoring, fit summary, red flags)
- [ ] Email automation
- [ ] Offer and onboarding flow
- [ ] Candidate Pulse assessment auto-triggered from LinkedIn paste

---

## The Evolved Vision

Pulse / Compass / Pipeline are the platform structure. The six themes below are what the
platform is *for* — the strategic problems Humyn solves that the spreadsheets and ATSes
cannot.

### 1. Culture and harmony intelligence
Understanding the cost of culture mismatch across teams and markets. Humyn measures
harmony — how the energy mix of a team predicts conflict, decision-making speed, and
client satisfaction — and quantifies the cost of mismatch in lost margin and missed
deadlines. Culture is also compared across Stockholm, Oslo, Copenhagen and Helsinki so
leaders can see where the Nordic markets differ and where they cohere, and so that
projects spanning markets can be staffed deliberately rather than by availability alone.

### 2. Retention prediction and loyalty intelligence
Predicting who is going to leave before they do. The model combines bench time, primary
energy, recent project fit, team energy balance, and external signals (LinkedIn activity,
recruiter contact) into a single loyalty score per person. Each profile carries a
cost-of-leaving calculator: recruitment + lost three-month revenue + onboarding. Bench
risk thresholds are energy-specific — **Energizer goes restless at 14 days, Supporter at
21, Driver and Analyst at 28** — and the dashboard flags people the moment they cross
the line.
First version of this is live at `/capacity`.

### 3. Brief and RFP → team AI (the dream feature)
Upload an RFP or project brief. The AI reads it, infers the required skills, seniority
band, personality types, and client context, and proposes three ranked team options drawn
from every Valtech Nordic market. Each option shows skills fit, energy-harmony score,
combined availability, and projected day-rate. This requires ERP / OpenAir integration
for live availability data — but once it exists, **this is the feature that makes Humyn
irreplaceable.** No spreadsheet, no ATS, no capacity tool combines personality and
availability into a single team recommendation.

### 4. Pan-Nordic job board
Every available person across every Nordic market in one view. Replaces the weekly phone
calls between market capacity managers asking "do you have a senior data scientist free
in Q3?" Filterable by skill, location, energy type, availability, day rate, and
client-history. Live availability is pulled from OpenAir (or whichever ERP the relevant
market uses) so the board never goes stale.

### 5. Executive and board dashboards
A clean, read-only view designed for the C-suite and board. Revenue per consultant,
margin trends, capacity vs target, demand forecast cross-referenced against the pitch
pipeline and seasonality. AI-written weekly narrative reports turn the data into prose
that an executive can scan in 90 seconds. Individual consultant revenue and client
relationship value surface in the same view so the board can see who carries the firm.

### 6. Hiring platform with Pulse from day one
A proprietary ATS built from scratch — not a Teamtailor integration. Every candidate is
profiled via LinkedIn paste the moment they enter the pipeline, with a team-fit score
calculated against the actual team they would join. AI handles interview scheduling,
transcript analysis (scoring, fit summary, red flags), and offer management. When a
candidate is hired, their profile moves straight into the people directory without any
re-keying. The Pulse identity follows the person from application to alumnus.

---

## Commercial Opportunity

Every professional-services firm has the same set of problems — fragmented people data,
reactive capacity management, gut-feel hiring. Humyn is differentiated because:

- **Works from LinkedIn data alone** — no 200-question assessments, no consultant time
  burned filling in forms. A profile is two minutes from a paste.
- **Purpose-built for consultancies** — not generic HR software retrofitted, not a
  personality tool retrofitted. Built for utilisation, day-rates, bench risk and
  team composition from the ground up.
- **Combines personality, capacity and hiring in one platform** — the three things that
  every consultancy currently runs in separate tools.
- **Proprietary Pulse Map framework** — Driver / Energizer / Supporter / Analyst are
  Humyn's own vocabulary. No Crystal Knows licence, no Insights Discovery dependency, no royalty
  exposure as the platform scales or white-labels.
- **Chrome extension as the Phase 2 profiling accelerator** — one click on any LinkedIn
  profile generates a Humyn profile in place. This is what makes profiling client
  stakeholders and prospective candidates frictionless.

### Expansion path

1. **Valtech Nordic** — current build, real users in Stockholm, Oslo, Copenhagen, Helsinki
2. **Pan-Nordic rollout** — all Valtech Nordic markets fully on platform
3. **Other Valtech global markets** — UK, Netherlands, Germany, France, North America
4. **White-label SaaS product** — Humyn as a standalone product for other consultancies,
   priced per seat, with the Pulse Map as the trademarked core

The goal is to make Humyn the people-intelligence layer for the modern consultancy.

---

## Success Metrics

- **Utilisation**: Valtech Nordic hits 80% average utilisation consistently
- **Time to profile**: Any consultant or candidate can be profiled in under 2 minutes
- **Hiring velocity**: Time from application to offer decision reduced by 40%
- **Team harmony**: Projects using Humyn team builder report lower interpersonal conflict
- **Adoption**: 100% of Valtech Nordic staff have active Humyn profiles within 6 months

---

## The Bigger Picture

If Pulse proves its value at Valtech Nordic, the platform has a clear expansion path
(see Commercial Opportunity above for the full mechanics). Two further angles worth
noting separately:

- **Client-facing intelligence** — once stakeholder profiling is wired through the Chrome
  extension, sales and pitch teams can profile a prospect's procurement panel and shape
  the pitch to their dominant energy mix. Early data suggests this materially shifts
  win-rate on close decisions.
- **Alumni network** — when someone leaves Valtech, their Humyn profile follows them.
  Alumni become a referral and rehire pool, profiled and warm, rather than disappearing
  into LinkedIn.

---

*Last updated: May 2026*
*Owner: Nordic Capacity Manager, Valtech*
*Built with: Next.js, TypeScript, Vercel, Claude AI*

