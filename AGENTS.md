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
| `app/page.tsx` | Main people directory. Export `people` array and `Person` type. |
| `app/people/[id]/page.tsx` | Individual profile page. Import people from `../../page`. |
| `app/layout.tsx` | Global layout. Keep minimal — no global styles beyond reset basics. |
| `CLAUDE.md` | Never edit unless explicitly asked. |
| `AGENTS.md` | Never edit unless explicitly asked. |
| `PRODUCT.md` | Never edit unless explicitly asked. |

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

- **Red** = urgency, high drive, allocated status, warnings
- **Yellow** = brand, highlight, primary actions, sunshine energy
- **Green** = positive, available, on target, earth energy
- **Blue** = analytical, cool, information, calm energy
- **Never** use these colours decoratively — always purposefully
- **Never** invent new colours outside the defined palette

---

## Common Mistakes to Avoid

- Using `energyConfig` instead of `energy` as the variable name
- Forgetting to export `people` and `Person` from page.tsx
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

## Git Commit Messages

Always use clear, descriptive commit messages:
- `add [feature name]`
- `fix [what was broken]`
- `update [what changed and why]`
- `refactor [what and why]`

Never: `update`, `fix`, `changes`, `wip`

