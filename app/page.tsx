"use client";
import { useState } from "react";

const people = [
  {
    id: 1,
    name: "Anna Lindqvist",
    role: "Senior Experience Designer",
    location: "Stockholm",
    primary: "yellow",
    secondary: "green",
    scores: { red: 28, yellow: 82, green: 71, blue: 44 },
    utilisation: 82,
    available: "3 Jun",
    clients: 7,
    revenue: "€840k",
  },
  {
    id: 2,
    name: "Marcus Karlsson",
    role: "Tech Lead",
    location: "Stockholm",
    primary: "red",
    secondary: "blue",
    scores: { red: 88, yellow: 42, green: 31, blue: 67 },
    utilisation: 91,
    available: "Allocated",
    clients: 4,
    revenue: "€1.2m",
  },
  {
    id: 3,
    name: "Sara Eriksson",
    role: "Strategy Consultant",
    location: "Oslo",
    primary: "blue",
    secondary: "green",
    scores: { red: 41, yellow: 38, green: 55, blue: 84 },
    utilisation: 74,
    available: "Now",
    clients: 5,
    revenue: "€620k",
  },
  {
    id: 4,
    name: "Erik Andersen",
    role: "Service Designer",
    location: "Copenhagen",
    primary: "green",
    secondary: "yellow",
    scores: { red: 33, yellow: 55, green: 79, blue: 48 },
    utilisation: 68,
    available: "Now",
    clients: 3,
    revenue: "€410k",
  },
  {
    id: 5,
    name: "Maja Bergström",
    role: "Data Strategist",
    location: "Helsinki",
    primary: "blue",
    secondary: "red",
    scores: { red: 62, yellow: 29, green: 44, blue: 91 },
    utilisation: 88,
    available: "14 Jun",
    clients: 6,
    revenue: "€980k",
  },
  {
    id: 6,
    name: "Jonas Holm",
    role: "Creative Director",
    location: "Stockholm",
    primary: "yellow",
    secondary: "red",
    scores: { red: 71, yellow: 78, green: 38, blue: 22 },
    utilisation: 55,
    available: "Now",
    clients: 8,
    revenue: "€1.5m",
  },
];

const energyConfig = {
  red:    { label: "Fiery Red",      bg: "#FDF0EE", text: "#9B2A1A", bar: "#E8402A", border: "#F5C4BC" },
  yellow: { label: "Sunshine Yellow",bg: "#FFFBF2", text: "#8B5A00", bar: "#F5A623", border: "#FAD98A" },
  green:  { label: "Earth Green",    bg: "#EEF7F2", text: "#1A5C38", bar: "#2E8B57", border: "#9ED4B8" },
  blue:   { label: "Cool Blue",      bg: "#EEF4FB", text: "#124A6E", bar: "#1E6FA5", border: "#8DC2E8" },
};

function EnergyBar({ color, value }) {
  const c = energyConfig[color];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.bar, flexShrink: 0 }} />
      <div style={{ flex: 1, height: 5, background: "#F0EFED", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: c.bar, borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 11, color: "#9A9A9A", width: 28, textAlign: "right" }}>{value}%</div>
    </div>
  );
}

function Avatar({ person }) {
  const c = energyConfig[person.primary];
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      background: c.bg, border: `2px solid ${c.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 600, color: c.text, flexShrink: 0,
    }}>
      {person.name.split(" ").map(n => n[0]).join("")}
    </div>
  );
}

function Badge({ color, label }) {
  const c = energyConfig[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px 3px 7px", borderRadius: 100,
      background: c.bg, fontSize: 11, fontWeight: 500, color: c.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.bar }} />
      {label}
    </span>
  );
}

function UtilBar({ value }) {
  const color = value >= 80 ? "#2E8B57" : value >= 65 ? "#F5A623" : "#E8402A";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#9A9A9A" }}>Utilisation</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: "#F0EFED", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function PersonCard({ person, onClick }) {
  const primary = energyConfig[person.primary];
  const availColor = person.available === "Now" ? "#2E8B57" : person.available === "Allocated" ? "#E8402A" : "#F5A623";
  const availBg = person.available === "Now" ? "#EEF7F2" : person.available === "Allocated" ? "#FDF0EE" : "#FFFBF2";

  return (
    <div
      onClick={() => onClick(person)}
      style={{
        background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 12, padding: "1.125rem", cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
        <Avatar person={person} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 1 }}>{person.name}</div>
          <div style={{ fontSize: 12, color: "#5A5A5A", marginBottom: 6 }}>{person.role} · {person.location}</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <Badge color={person.primary} label={primary.label} />
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 500,
              padding: "3px 8px", borderRadius: 100,
              background: availBg, color: availColor,
            }}>
              {person.available === "Now" ? "● Available now" : person.available === "Allocated" ? "● Allocated" : `● Free ${person.available}`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        {["red", "yellow", "green", "blue"].map(c => (
          <EnergyBar key={c} color={c} value={person.scores[c]} />
        ))}
      </div>

      <UtilBar value={person.utilisation} />

      <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>{person.clients}</div>
          <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.06em" }}>Clients</div>
        </div>
        <div style={{ width: "0.5px", background: "rgba(0,0,0,0.08)" }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>{person.revenue}</div>
          <div style={{ fontSize: 10, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.06em" }}>Revenue</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = filter === "all" ? people : people.filter(p => p.primary === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Nav */}
      <div style={{ background: "#FFFFFF", borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.5px", color: "#1A1A1A" }}>
            hum<span style={{ color: "#F5A623" }}>y</span>n
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {["People", "Teams", "Capacity", "Insights"].map(item => (
              <button key={item} style={{
                fontSize: 13, padding: "5px 14px", borderRadius: 100,
                border: "none", cursor: "pointer",
                background: item === "People" ? "#1A1A1A" : "transparent",
                color: item === "People" ? "#FFFFFF" : "#5A5A5A",
                fontWeight: item === "People" ? 500 : 400,
              }}>{item}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#5A5A5A" }}>Nordic Capacity</span>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#FFFBF2", border: "1.5px solid #FAD98A",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: "#8B5A00",
            }}>JH</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.5px", margin: 0 }}>People</h1>
            <p style={{ fontSize: 13, color: "#9A9A9A", marginTop: 4 }}>Valtech Nordic · {people.length} consultants</p>
          </div>
          <button style={{
            fontSize: 13, padding: "8px 18px", borderRadius: 100,
            background: "#1A1A1A", color: "#FFFFFF", border: "none", cursor: "pointer", fontWeight: 500,
          }}>+ Add person</button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total consultants", value: "24", color: "#1A1A1A" },
            { label: "Available now", value: "3", color: "#2E8B57" },
            { label: "Avg utilisation", value: "76%", color: "#F5A623" },
            { label: "Target", value: "80%", color: "#1E6FA5" },
          ].map(s => (
            <div key={s.label} style={{ background: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {["all", "red", "yellow", "green", "blue"].map(f => {
            const isAll = f === "all";
            const c = isAll ? null : energyConfig[f];
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                fontSize: 12, padding: "5px 14px", borderRadius: 100,
                border: `0.5px solid ${active ? (isAll ? "#1A1A1A" : c.bar) : "rgba(0,0,0,0.1)"}`,
                background: active ? (isAll ? "#1A1A1A" : c.bg) : "#FFFFFF",
                color: active ? (isAll ? "#FFFFFF" : c.text) : "#5A5A5A",
                cursor: "pointer", fontWeight: active ? 500 : 400,
              }}>
                {isAll ? "All energies" : c.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(p => <PersonCard key={p.id} person={p} onClick={setSelected} />)}
        </div>
      </div>

      {/* Profile drawer */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div onClick={() => setSelected(null)} style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} />
          <div style={{
            width: 420, background: "#FFFFFF", overflowY: "auto",
            padding: "28px 24px", boxShadow: "-4px 0 40px rgba(0,0,0,0.12)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.08em" }}>Profile</div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9A9A9A" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
              <Avatar person={selected} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A" }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: "#5A5A5A", marginTop: 2 }}>{selected.role} · {selected.location}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                  <Badge color={selected.primary} label={energyConfig[selected.primary].label} />
                  <Badge color={selected.secondary} label={energyConfig[selected.secondary].label} />
                </div>
              </div>
            </div>

            <div style={{ background: "#F7F6F3", borderRadius: 10, padding: "1rem", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Energy breakdown</div>
              {["red", "yellow", "green", "blue"].map(c => (
                <EnergyBar key={c} color={c} value={selected.scores[c]} />
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Utilisation", value: `${selected.utilisation}%`, color: selected.utilisation >= 80 ? "#2E8B57" : "#F5A623" },
                { label: "Clients", value: selected.clients },
                { label: "Revenue", value: selected.revenue },
              ].map(s => (
                <div key={s.label} style={{ background: "#F7F6F3", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: s.color || "#1A1A1A" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#9A9A9A", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#FFFBF2", border: "0.5px solid #FAD98A", borderRadius: 10, padding: "1rem" }}>
              <div style={{ fontSize: 11, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>AI insight</div>
              <div style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6 }}>
                {selected.primary === "yellow" && "Strong client-facing profile. Consider for relationship-led engagements and workshop facilitation. Watch bench time — Yellow profiles disengage quickly without visibility."}
                {selected.primary === "red" && "High-drive profile. Best utilised in leadership or delivery-pressure roles. Pair with a Green to balance team dynamics and avoid friction."}
                {selected.primary === "blue" && "Detail and rigour focused. Ideal for complex data, compliance or analytical projects. Ensure regular feedback loops — Blue profiles need to know their work is valued."}
                {selected.primary === "green" && "Strong team glue. Valuable in long-term client relationships and complex stakeholder environments. May need encouragement to assert ideas in high-D team settings."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}