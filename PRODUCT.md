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
- Insights Discovery energy profile (four colours: Red, Yellow, Green, Blue)
- 72-position wheel placement (e.g. Inspirer, Director, Supporter)
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

## Personality Framework

Humyn uses the **Insights Discovery** model as its scientific foundation:

| Energy | Colour | Traits | DISC equivalent |
|--------|--------|--------|-----------------|
| Fiery Red | 🔴 | Decisive, driven, direct | Dominant (D) |
| Sunshine Yellow | 🟡 | Enthusiastic, sociable, creative | Influential (I) |
| Earth Green | 🟢 | Caring, patient, steady | Steady (S) |
| Cool Blue | 🔵 | Analytical, precise, careful | Conscientious (C) |

The 72-position wheel gives nuance within each quadrant:
- Pure positions: Director (Red), Inspirer (Yellow), Supporter (Green), Observer (Blue)
- Mixed positions: Motivator (Red/Yellow), Helper (Yellow/Green), Coordinator (Green/Blue), Reformer (Blue/Red)
- Plus further refinements within each (8 positions per quadrant = 72 total positions on the wheel)

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
- NLP model for LinkedIn text → Insights energy mapping
- Interview transcript processing

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

### Phase 1 — Pulse MVP (Current)
**Goal:** Every Valtech Nordic consultant has a rich profile. The people directory is live and useful.

- [x] People directory with card and table views
- [x] Flexible grouping and search
- [x] Individual profile pages
- [x] Quick view drawer
- [x] Team builder (basic)
- [x] AI message composer (template-based)
- [ ] LinkedIn paste → profile generation
- [ ] Add/edit person flow
- [ ] 72-position energy wheel visualisation
- [ ] Profile confidence scoring

### Phase 2 — Compass (Capacity)
**Goal:** The capacity manager has a real-time view of utilisation, availability and demand.

- [ ] Utilisation dashboard
- [ ] Availability heatmap
- [ ] C-suite read-only dashboard
- [ ] Power BI / Excel data integration
- [ ] Demand forecasting
- [ ] Written AI insights reports

### Phase 3 — Pipeline (Hiring)
**Goal:** Hiring is managed entirely within Humyn, integrated with Pulse from day one.

- [ ] Job posting management
- [ ] Candidate tracking pipeline
- [ ] Interview scheduling
- [ ] AI transcript analysis
- [ ] Email automation
- [ ] Offer and onboarding flow
- [ ] Candidate Pulse assessment

---

## Success Metrics

- **Utilisation**: Valtech Nordic hits 80% average utilisation consistently
- **Time to profile**: Any consultant or candidate can be profiled in under 2 minutes
- **Hiring velocity**: Time from application to offer decision reduced by 40%
- **Team harmony**: Projects using Humyn team builder report lower interpersonal conflict
- **Adoption**: 100% of Valtech Nordic staff have active Humyn profiles within 6 months

---

## The Bigger Picture

If Pulse proves its value at Valtech Nordic, the platform has a clear expansion path:

1. **Pan-Nordic rollout** — Sweden, Norway, Denmark, Finland
2. **Other Valtech markets** — UK, Netherlands, Germany
3. **White-label product** — Humyn as a SaaS product for other consultancies
4. **Client-facing version** — Profile client stakeholders, improve pitch win rates

The goal is to make Humyn the people intelligence layer for the modern consultancy.

---

*Last updated: May 2026*
*Owner: Nordic Capacity Manager, Valtech*
*Built with: Next.js, TypeScript, Vercel, Claude AI*

