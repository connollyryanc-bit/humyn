"use client";

import Link from "next/link";
import { useState } from "react";
import type { EnergyKey } from "../../lib/people-data";
import { ENERGY_LABEL, SEGMENT_LABEL, STAGES, inList, listsSeed, type ProspectList, type Segment } from "../seed";
import { scoreProspect } from "../scoring";
import { useCustomLists, useProspects, useScoring } from "../store";
import { Avatar, Btn, Card, DemoTag, EnergyPill, GradePill, Label, Page, PageHeader, Pill, R, SegmentPill, inputStyle } from "../ui";

const IMPORT_SOURCES = [
  { name: "LinkedIn extension", note: "Save any profile as you browse. Includes the Pulse read." },
  { name: "Sales Navigator", note: "Export a lead list as CSV and import it here." },
  { name: "HubSpot, Salesforce, Dynamics", note: "Two-way sync of contacts, stages and activity." },
  { name: "CSV file", note: "Any spreadsheet with name, title and company." },
];

export default function ProspectsPage() {
  const [prospects] = useProspects();
  const [cfg] = useScoring();
  const [customLists, setCustomLists] = useCustomLists();

  const [activeId, setActiveId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment | "all">("all");
  const [energyFilter, setEnergyFilter] = useState<EnergyKey | "all">("all");
  const [sort, setSort] = useState<"score" | "name" | "recent">("score");
  const [listName, setListName] = useState("");
  const [showImport, setShowImport] = useState(false);

  const lists: ProspectList[] = [...listsSeed, ...customLists];
  const active = lists.find((l) => l.id === activeId);

  const q = query.trim().toLowerCase();
  const rows = prospects
      .filter((p) => (active ? inList(p, active) : true))
      .filter((p) => (segment === "all" ? true : p.segment === segment))
      .filter((p) => (energyFilter === "all" ? true : p.primary === energyFilter))
      .filter((p) =>
        q === "" ? true : [p.name, p.title, p.company, p.region].some((s) => s.toLowerCase().includes(q)),
      )
      .map((p) => ({ p, s: scoreProspect(p, cfg) }))
      .sort((a, b) =>
        sort === "score"
          ? b.s.total - a.s.total
          : sort === "name"
            ? a.p.name.localeCompare(b.p.name)
            : a.p.addedDaysAgo - b.p.addedDaysAgo,
      );

  const filtersActive = segment !== "all" || energyFilter !== "all" || query.trim() !== "";

  function saveList() {
    const name = listName.trim();
    if (!name) return;
    const id = "custom-" + Date.now();
    const list: ProspectList = {
      id,
      name,
      description: "Custom list",
      custom: true,
      filter: {
        segment: segment === "all" ? undefined : segment,
        energy: energyFilter === "all" ? undefined : energyFilter,
        titleIncludes: query.trim() ? [query.trim()] : undefined,
      },
    };
    setCustomLists((prev) => [...prev, list]);
    setListName("");
    setActiveId(id);
    setSegment("all");
    setEnergyFilter("all");
    setQuery("");
  }

  function removeList(id: string) {
    setCustomLists((prev) => prev.filter((l) => l.id !== id));
    if (activeId === id) setActiveId("all");
  }

  const selectStyle = { ...inputStyle, width: "auto", padding: "8px 10px", fontSize: 12 };

  return (
    <Page>
      <PageHeader
        title="Prospects"
        subtitle="Everyone you want to reach, profiled and scored. Group them by role, sector or personality, then write to each one."
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <DemoTag />
            <Btn variant="moss" onClick={() => setShowImport((v) => !v)}>
              Add prospects
            </Btn>
          </div>
        }
      />

      {showImport && (
        <Card style={{ marginBottom: 12 }}>
          <Label>Bring prospects in</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {IMPORT_SOURCES.map((s) => (
              <div key={s.name} style={{ border: R.line, borderRadius: 10, padding: 14, background: R.subtle }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: R.ink, marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: R.ink2, lineHeight: 1.5, marginBottom: 10 }}>{s.note}</div>
                <Pill>Available in full version</Pill>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 12, alignItems: "start" }}>
        <Card style={{ padding: "1rem" }}>
          <Label>Lists</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[{ id: "all", name: "All prospects", count: prospects.length, custom: false }, ...lists.map((l) => ({
              id: l.id,
              name: l.name,
              count: prospects.filter((p) => inList(p, l)).length,
              custom: Boolean(l.custom),
            }))].map((l) => {
              const on = activeId === l.id;
              return (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 8,
                    background: on ? R.ink : "transparent",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(l.id)}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      padding: "8px 10px",
                      fontSize: 13,
                      cursor: "pointer",
                      color: on ? "#FFFFFF" : R.ink2,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span>{l.name}</span>
                    <span style={{ color: on ? "#C8C5BD" : R.ink3 }}>{l.count}</span>
                  </button>
                  {l.custom && (
                    <button
                      type="button"
                      onClick={() => removeList(l.id)}
                      aria-label={`Remove ${l.name}`}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: on ? "#C8C5BD" : R.ink3,
                        cursor: "pointer",
                        padding: "0 8px",
                        fontSize: 16,
                      }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {active && (
            <div style={{ fontSize: 12, color: R.ink3, lineHeight: 1.5, marginTop: 12 }}>{active.description}</div>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ padding: "1rem" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, title, company, region"
                style={{ ...inputStyle, flex: 1, minWidth: 220, padding: "8px 12px", fontSize: 12 }}
              />
              <select value={segment} onChange={(e) => setSegment(e.target.value as Segment | "all")} style={selectStyle}>
                <option value="all">All sectors</option>
                {(Object.keys(SEGMENT_LABEL) as Segment[]).map((s) => (
                  <option key={s} value={s}>
                    {SEGMENT_LABEL[s]}
                  </option>
                ))}
              </select>
              <select
                value={energyFilter}
                onChange={(e) => setEnergyFilter(e.target.value as EnergyKey | "all")}
                style={selectStyle}
              >
                <option value="all">All energy types</option>
                {(Object.keys(ENERGY_LABEL) as EnergyKey[]).map((k) => (
                  <option key={k} value={k}>
                    {ENERGY_LABEL[k]}
                  </option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={selectStyle}>
                <option value="score">Sort by score</option>
                <option value="name">Sort by name</option>
                <option value="recent">Newest first</option>
              </select>
            </div>
            {filtersActive && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                <input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Name this group to save it as a list"
                  style={{ ...inputStyle, maxWidth: 320, padding: "7px 12px", fontSize: 12 }}
                />
                <Btn small onClick={saveList} disabled={!listName.trim()}>
                  Save as list
                </Btn>
                <span style={{ fontSize: 12, color: R.ink3 }}>{rows.length} matching</span>
              </div>
            )}
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2.4fr 1.2fr 1fr 1fr 1fr",
                gap: 12,
                padding: "10px 16px",
                background: R.subtle,
                borderBottom: R.line,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: R.ink3,
              }}
            >
              <span>Prospect</span>
              <span>Sector</span>
              <span>Energy</span>
              <span>Stage</span>
              <span>Score</span>
            </div>
            {rows.length === 0 && (
              <div style={{ padding: 32, fontSize: 13, color: R.ink3, textAlign: "center" }}>
                No prospects match these filters.
              </div>
            )}
            {rows.map(({ p, s }) => (
              <Link
                key={p.id}
                href={`/reach/prospects/${p.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.4fr 1.2fr 1fr 1fr 1fr",
                  gap: 12,
                  padding: "12px 16px",
                  alignItems: "center",
                  borderBottom: R.line,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <Avatar initials={p.initials} k={p.primary} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: R.ink }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: R.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.title}, {p.company}
                    </div>
                  </div>
                </div>
                <SegmentPill s={p.segment} />
                <EnergyPill k={p.primary} />
                <span style={{ fontSize: 12, color: R.ink2 }}>
                  {p.doNotContact ? "Do not contact" : STAGES.find((x) => x.key === p.stage)?.label ?? "Lost"}
                </span>
                <GradePill grade={s.grade} score={s.total} />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </Page>
  );
}
