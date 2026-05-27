"use client";
import { useState } from "react";
type EnergyKey = "red" | "yellow" | "green" | "blue";
type AvailKey = "now" | "soon" | "allocated";
interface Person { id: number; name: string; initials: string; role: string; location: string; primary: EnergyKey; secondary: EnergyKey; scores: Record<EnergyKey, number>; utilisation: number; available: AvailKey; clients: number; revenue: string; }
const people: Person[] = [
  { id: 1, name: "Anna Lindqvist", initials: "AL", role: "Senior Experience Designer", location: "Stockholm", primary: "yellow", secondary: "green", scores: { red: 28, yellow: 82, green: 71, blue: 44 }, utilisation: 82, available: "now", clients: 7, revenue: "€840k" },
  { id: 2, name: "Marcus Karlsson", initials: "MK", role: "Tech Lead", location: "Stockholm", primary: "red", secondary: "blue", scores: { red: 88, yellow: 42, green: 31, blue: 67 }, utilisation: 91, available: "allocated", clients: 4, revenue: "€1.2m" },
  { id: 3, name: "Sara Eriksson", initials: "SE", role: "Strategy Consultant", location: "Oslo", primary: "blue", secondary: "green", scores: { red: 41, yellow: 38, green: 55, blue: 84 }, utilisation: 74, available: "now", clients: 5, revenue: "€620k" },
  { id: 4, name: "Erik Andersen", initials: "EA", role: "Service Designer", location: "Copenhagen", primary: "green", secondary: "yellow", scores: { red: 33, yellow: 55, green: 79, blue: 48 }, utilisation: 68, available: "now", clients: 3, revenue: "€410k" },
  { id: 5, name: "Maja Bergström", initials: "MB", role: "Data Strategist", location: "Helsinki", primary: "blue", secondary: "red", scores: { red: 62, yellow: 29, green: 44, blue: 91 }, utilisation: 88, available: "soon", clients: 6, revenue: "€980k" },
  { id: 6, name: "Jonas Holm", initials: "JH", role: "Creative Director", location: "Stockholm", primary: "yellow", secondary: "red", scores: { red: 71, yellow: 78, green: 38, blue: 22 }, utilisation: 55, available: "now", clients: 8, revenue: "€1.5m" },
  { id: 7, name: "Lena Svensson", initials: "LS", role: "UX Designer", location: "Oslo", primary: "green", secondary: "blue", scores: { red: 22, yellow: 44, green: 81, blue: 68 }, utilisation: 79, available: "soon", clients: 4, revenue: "€510k" },
  { id: 8, name: "Peter Larsen", initials: "PL", role: "Solutions Architect", location: "Copenhagen", primary: "red", secondary: "blue", scores: { red: 79, yellow: 33, green: 28, blue: 72 }, utilisation: 93, available: "allocated", clients: 5, revenue: "€1.1m" },
];
const energy: Record<EnergyKey, { label: string; color: string; bg: string; text: string; border: string }> = {
  red:    { label: "Fiery Red",       color: "#E8402A", bg: "#FDF0EE", text: "#9B2A1A", border: "#FCCDC6" },
  yellow: { label: "Sunshine Yellow", color: "#F5A623", bg: "#FFFBF2", text: "#8B5A00", border: "#FAD98A" },
  green:  { label: "Earth Green",     color: "#2E8B57", bg: "#EEF7F2", text: "#1A5C38", border: "#9ED4B8" },
  blue:   { label: "Cool Blue",       color: "#1E6FA5", bg: "#EEF4FB", text: "#124A6E", border: "#8DC2E8" },
};
const availability: Record<AvailKey, { label: string; color: string; bg: string }> = {
  now:       { label: "Available now",  color: "#2E8B57", bg: "#EEF7F2" },
  soon:      { label: "Available soon", color: "#F5A623", bg: "#FFFBF2" },
  allocated: { label: "Allocated",      color: "#E8402A", bg: "#FDF0EE" },
};
const utilColor = (u: number) => u >= 80 ? "#2E8B57" : u >= 65 ? "#F5A623" : "#E8402A";
const utilBand  = (u: number) => u >= 80 ? "On target" : u >= 65 ? "Below target" : "At risk";
const groupOptions = [
  { value: "none", label: "No grouping" }, { value: "available", label: "Availability" },
  { value: "primary", label: "Energy type" }, { value: "location", label: "Location" }, { value: "utilBand", label: "Utilisation" },
];
function getGroupValue(p: Person, g: string) { if (g==="available") return p.available; if (g==="primary") return p.primary; if (g==="location") return p.location; if (g==="utilBand") return utilBand(p.utilisation); return "all"; }
function getGroupLabel(v: string, g: string) { if (g==="available") return availability[v as AvailKey]?.label||v; if (g==="primary") return energy[v as EnergyKey]?.label||v; return v; }
function getGroupColor(v: string, g: string) { if (g==="available") return availability[v as AvailKey]?.color||"#9A9A9A"; if (g==="primary") return energy[v as EnergyKey]?.color||"#9A9A9A"; if (g==="utilBand") return v==="On target"?"#2E8B57":v==="Below target"?"#F5A623":"#E8402A"; return "#9A9A9A"; }
function Avatar({ person, size=34 }: { person: Person; size?: number }) {
  const e = energy[person.primary];
  return <div style={{ width:size, height:size, borderRadius:"50%", background:e.bg, border:`1.5px solid ${e.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.32, fontWeight:600, color:e.text, flexShrink:0 }}>{person.initials}</div>;
}
function EnergyBadge({ type }: { type: EnergyKey }) {
  const e = energy[type];
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:500, padding:"2px 8px 2px 6px", borderRadius:100, background:e.bg, color:e.text }}><span style={{ width:6, height:6, borderRadius:"50%", background:e.color }} />{e.label}</span>;
}
function StatusBadge({ person }: { person: Person }) {
  const a = availability[person.available];
  return <span style={{ display:"inline-block", fontSize:11, fontWeight:500, padding:"2px 8px", borderRadius:100, background:a.bg, color:a.color }}>{a.label}</span>;
}
function UtilPill({ value }: { value: number }) {
  const color = utilColor(value);
  return <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:60, height:4, background:"#F0EFED", borderRadius:2, overflow:"hidden" }}><div style={{ width:`${value}%`, height:"100%", background:color, borderRadius:2 }} /></div><span style={{ fontSize:12, fontWeight:600, color }}>{value}%</span></div>;
}
function PersonCard({ person, onSelect }: { person: Person; onSelect: (p: Person) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onSelect(person)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:"#FFFFFF", border:`0.5px solid ${hovered?"#D0CFC9":"rgba(0,0,0,0.07)"}`, borderRadius:10, padding:"1rem", cursor:"pointer", transition:"all 0.15s", boxShadow:hovered?"0 2px 12px rgba(0,0,0,0.06)":"none" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:14 }}>
        <Avatar person={person} size={38} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#1A1A1A", marginBottom:1 }}>{person.name}</div>
          <div style={{ fontSize:12, color:"#9A9A9A" }}>{person.role} · {person.location}</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}><EnergyBadge type={person.primary} /><StatusBadge person={person} /></div>
      <div style={{ marginBottom:12 }}>
        {(["red","yellow","green","blue"] as EnergyKey[]).map(c => (
          <div key={c} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:energy[c].color, flexShrink:0 }} />
            <div style={{ flex:1, height:3, background:"#F0EFED", borderRadius:2, overflow:"hidden" }}><div style={{ width:`${person.scores[c]}%`, height:"100%", background:energy[c].color, borderRadius:2 }} /></div>
            <span style={{ fontSize:10, color:"#C0BFB8", width:24, textAlign:"right" }}>{person.scores[c]}%</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"0.5px solid rgba(0,0,0,0.06)" }}>
        <UtilPill value={person.utilisation} />
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:12, fontWeight:600, color:"#1A1A1A" }}>{person.clients}</div><div style={{ fontSize:10, color:"#9A9A9A" }}>clients</div></div>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:12, fontWeight:600, color:"#1A1A1A" }}>{person.revenue}</div><div style={{ fontSize:10, color:"#9A9A9A" }}>revenue</div></div>
        </div>
      </div>
    </div>
  );
}
function CardView({ grouped, groupBy, onSelect }: { grouped: { key: string; items: Person[] }[]; groupBy: string; onSelect: (p: Person) => void }) {
  return <div>{grouped.map(({ key, items }) => (
    <div key={key} style={{ marginBottom:32 }}>
      {groupBy!=="none" && <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><div style={{ width:3, height:16, borderRadius:2, background:getGroupColor(key,groupBy) }} /><span style={{ fontSize:13, fontWeight:600, color:"#1A1A1A" }}>{getGroupLabel(key,groupBy)}</span><span style={{ fontSize:12, color:"#9A9A9A" }}>{items.length} people</span></div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>{items.map(p => <PersonCard key={p.id} person={p} onSelect={onSelect} />)}</div>
    </div>
  ))}</div>;
}
function TableView({ grouped, groupBy, onSelect }: { grouped: { key: string; items: Person[] }[]; groupBy: string; onSelect: (p: Person) => void }) {
  const cols = ["Person","Role","Location","Energy","Status","Utilisation","Clients","Revenue"];
  return (
    <div style={{ background:"#FFFFFF", border:"0.5px solid rgba(0,0,0,0.07)", borderRadius:10, overflow:"hidden" }}>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1.2fr 1.4fr 1.4fr 1.6fr 0.8fr 1fr", borderBottom:"0.5px solid rgba(0,0,0,0.07)", padding:"0 16px" }}>
        {cols.map(c => <div key={c} style={{ fontSize:11, fontWeight:500, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:"0.06em", padding:"10px 8px" }}>{c}</div>)}
      </div>
      {grouped.map(({ key, items }) => (
        <div key={key}>
          {groupBy!=="none" && <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 24px", background:"#FAFAF8", borderBottom:"0.5px solid rgba(0,0,0,0.05)", borderTop:"0.5px solid rgba(0,0,0,0.05)" }}><div style={{ width:3, height:14, borderRadius:2, background:getGroupColor(key,groupBy) }} /><span style={{ fontSize:12, fontWeight:600, color:"#1A1A1A" }}>{getGroupLabel(key,groupBy)}</span><span style={{ fontSize:11, color:"#9A9A9A" }}>{items.length}</span></div>}
          {items.map((p,i) => (
            <div key={p.id} onClick={() => onSelect(p)} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1.2fr 1.4fr 1.4fr 1.6fr 0.8fr 1fr", padding:"0 16px", borderBottom:i<items.length-1?"0.5px solid rgba(0,0,0,0.05)":"none", cursor:"pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background="#FAFAF8")} onMouseLeave={e => (e.currentTarget.style.background="transparent")}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 8px" }}><Avatar person={p} size={28} /><span style={{ fontSize:13, fontWeight:500, color:"#1A1A1A" }}>{p.name}</span></div>
              <div style={{ display:"flex", alignItems:"center", padding:"10px 8px" }}><span style={{ fontSize:12, color:"#5A5A5A" }}>{p.role}</span></div>
              <div style={{ display:"flex", alignItems:"center", padding:"10px 8px" }}><span style={{ fontSize:12, color:"#5A5A5A" }}>{p.location}</span></div>
              <div style={{ display:"flex", alignItems:"center", padding:"10px 8px" }}><EnergyBadge type={p.primary} /></div>
              <div style={{ display:"flex", alignItems:"center", padding:"10px 8px" }}><StatusBadge person={p} /></div>
              <div style={{ display:"flex", alignItems:"center", padding:"10px 8px" }}><UtilPill value={p.utilisation} /></div>
              <div style={{ display:"flex", alignItems:"center", padding:"10px 8px" }}><span style={{ fontSize:12, fontWeight:500, color:"#1A1A1A" }}>{p.clients}</span></div>
              <div style={{ display:"flex", alignItems:"center", padding:"10px 8px" }}><span style={{ fontSize:12, fontWeight:500, color:"#1A1A1A" }}>{p.revenue}</span></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
function ProfileDrawer({ person, onClose }: { person: Person | null; onClose: () => void }) {
  if (!person) return null;
  const e = energy[person.primary];
  const a = availability[person.available];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,0.2)" }} />
      <div style={{ width:400, background:"#FFFFFF", overflowY:"auto", padding:"24px", boxShadow:"-2px 0 24px rgba(0,0,0,0.1)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontSize:11, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:"0.08em" }}>Profile</span>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9A9A9A" }}>×</button>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:20 }}>
          <Avatar person={person} size={48} />
          <div>
            <div style={{ fontSize:17, fontWeight:600, color:"#1A1A1A" }}>{person.name}</div>
            <div style={{ fontSize:13, color:"#9A9A9A", marginTop:2 }}>{person.role} · {person.location}</div>
            <div style={{ display:"flex", gap:5, marginTop:8, flexWrap:"wrap" }}><EnergyBadge type={person.primary} /><EnergyBadge type={person.secondary} /></div>
          </div>
        </div>
        <div style={{ background:"#FAFAF8", borderRadius:8, padding:"1rem", marginBottom:14 }}>
          <div style={{ fontSize:11, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Energy breakdown</div>
          {(["red","yellow","green","blue"] as EnergyKey[]).map(c => (
            <div key={c} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:energy[c].color, flexShrink:0 }} />
              <span style={{ fontSize:11, color:"#5A5A5A", width:120 }}>{energy[c].label}</span>
              <div style={{ flex:1, height:4, background:"#EDEDEA", borderRadius:2, overflow:"hidden" }}><div style={{ width:`${person.scores[c]}%`, height:"100%", background:energy[c].color, borderRadius:2 }} /></div>
              <span style={{ fontSize:11, color:"#9A9A9A", width:28, textAlign:"right" }}>{person.scores[c]}%</span>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {[{ label:"Utilisation", value:`${person.utilisation}%`, color:utilColor(person.utilisation) }, { label:"Clients", value:`${person.clients}`, color:"#1A1A1A" }, { label:"Revenue", value:person.revenue, color:"#1A1A1A" }].map(s => (
            <div key={s.label} style={{ background:"#FAFAF8", borderRadius:8, padding:"0.75rem", textAlign:"center" }}>
              <div style={{ fontSize:17, fontWeight:600, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#9A9A9A", marginTop:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#FAFAF8", borderRadius:8, padding:"1rem", marginBottom:14 }}>
          <div style={{ fontSize:11, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Availability</div>
          <span style={{ fontSize:13, fontWeight:500, color:a.color }}>{a.label}</span>
        </div>
        <div style={{ background:e.bg, border:`0.5px solid ${e.border}`, borderRadius:8, padding:"1rem" }}>
          <div style={{ fontSize:11, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>AI insight</div>
          <div style={{ fontSize:13, color:"#5A5A5A", lineHeight:1.6 }}>
            {person.primary==="yellow" && "Strong client-facing profile. Consider for relationship-led engagements and facilitation. Watch bench time — Yellow profiles disengage quickly without visibility."}
            {person.primary==="red"    && "High-drive delivery profile. Best in leadership or high-pressure roles. Pair with a Green to balance team dynamics."}
            {person.primary==="blue"   && "Detail and rigour-focused. Ideal for analytical or compliance projects. Needs regular feedback loops to stay engaged."}
            {person.primary==="green"  && "Strong team glue and relationship holder. Valuable in long-term client work. May need encouragement to assert ideas in high-D settings."}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  const [view, setView] = useState<"card"|"table">("card");
  const [groupBy, setGroupBy] = useState("none");
  const [selected, setSelected] = useState<Person|null>(null);
  const [search, setSearch] = useState("");
  const filtered = people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()));
  const groups = groupBy==="none" ? [{ key:"all", items:filtered }] : [...new Set(filtered.map(p => getGroupValue(p,groupBy)))].map(key => ({ key, items:filtered.filter(p => getGroupValue(p,groupBy)===key) }));
  return (
    <div style={{ minHeight:"100vh", background:"#F7F6F3", fontFamily:"system-ui, -apple-system, sans-serif" }}>
      <div style={{ background:"#FFFFFF", borderBottom:"0.5px solid rgba(0,0,0,0.08)", padding:"0 32px", position:"sticky", top:0, zIndex:40 }}>
        <div style={{ maxWidth:1280, margin:"0 auto", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:19, fontWeight:500, letterSpacing:"-0.5px", color:"#1A1A1A" }}>hum<span style={{ color:"#F5A623" }}>y</span>n</div>
          <div style={{ display:"flex", gap:2 }}>
            {["People","Teams","Capacity","Insights"].map(item => <button key={item} style={{ fontSize:13, padding:"5px 14px", borderRadius:100, border:"none", cursor:"pointer", background:item==="People"?"#1A1A1A":"transparent", color:item==="People"?"#FFFFFF":"#5A5A5A", fontWeight:item==="People"?500:400 }}>{item}</button>)}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"#9A9A9A" }}>Nordic Capacity</span>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"#FFFBF2", border:"1.5px solid #FAD98A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color:"#8B5A00" }}>JH</div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div><h1 style={{ fontSize:22, fontWeight:600, color:"#1A1A1A", margin:0, letterSpacing:"-0.3px" }}>People</h1><p style={{ fontSize:12, color:"#9A9A9A", margin:"3px 0 0" }}>Valtech Nordic · {people.length} consultants</p></div>
          <button style={{ fontSize:13, padding:"7px 16px", borderRadius:8, background:"#1A1A1A", color:"#FFFFFF", border:"none", cursor:"pointer", fontWeight:500 }}>+ Add person</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginBottom:24 }}>
          {[{ label:"Total consultants", value:"24", color:"#1A1A1A" },{ label:"Available now", value:"4", color:"#2E8B57" },{ label:"Avg utilisation", value:"76%", color:"#F5A623" },{ label:"Target", value:"80%", color:"#1E6FA5" }].map(s => (
            <div key={s.label} style={{ background:"#FFFFFF", border:"0.5px solid rgba(0,0,0,0.07)", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontSize:22, fontWeight:600, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#9A9A9A", marginTop:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200, maxWidth:280 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9A9A9A", fontSize:13 }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..." style={{ width:"100%", padding:"7px 10px 7px 28px", fontSize:13, border:"0.5px solid rgba(0,0,0,0.1)", borderRadius:8, background:"#FFFFFF", outline:"none", color:"#1A1A1A", boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:12, color:"#9A9A9A" }}>Group by</span>
            <select value={groupBy} onChange={e => setGroupBy(e.target.value)} style={{ fontSize:12, padding:"6px 10px", border:"0.5px solid rgba(0,0,0,0.1)", borderRadius:8, background:"#FFFFFF", color:"#1A1A1A", cursor:"pointer", outline:"none" }}>
              {groupOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:"flex", background:"#FFFFFF", border:"0.5px solid rgba(0,0,0,0.1)", borderRadius:8, overflow:"hidden" }}>
            {([{ v:"card", icon:"⊞", label:"Cards" },{ v:"table", icon:"☰", label:"Table" }] as const).map(({ v, icon, label }) => (
              <button key={v} onClick={() => setView(v)} style={{ fontSize:12, padding:"6px 12px", border:"none", cursor:"pointer", background:view===v?"#1A1A1A":"transparent", color:view===v?"#FFFFFF":"#5A5A5A", fontWeight:view===v?500:400 }}>{icon} {label}</button>
            ))}
          </div>
        </div>
        {view==="card" ? <CardView grouped={groups} groupBy={groupBy} onSelect={setSelected} /> : <TableView grouped={groups} groupBy={groupBy} onSelect={setSelected} />}
      </div>
      <ProfileDrawer person={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
