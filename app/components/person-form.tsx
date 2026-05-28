"use client";

import { useEffect, useMemo, useState } from "react";
import { AvailKey, EnergyKey, Person, energy } from "../page";
import { deriveWheelPosition, initialsFromName } from "../lib/people-store";

const ENERGIES: EnergyKey[] = ["driver", "energizer", "supporter", "analyst"];
const LOCATIONS = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"] as const;
const AVAILABILITIES: { value: AvailKey; label: string }[] = [
  { value: "now", label: "Available now" },
  { value: "soon", label: "Available soon" },
  { value: "allocated", label: "Allocated" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#9A9A9A",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 500,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#161311" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#9A9A9A", lineHeight: 1.4 }}>{hint}</span>}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.07)",
  background: "#FFFFFF",
  color: "#161311",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.55,
  minHeight: 80,
};

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function listToLines(list: string[]): string {
  return list.join("\n");
}

export function PersonForm({
  initial,
  mode,
  onSubmit,
  onCancel,
}: {
  initial: Person;
  mode: "create" | "edit";
  onSubmit: (person: Person) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [initialsOverride, setInitialsOverride] = useState(initial.initials);
  const [role, setRole] = useState(initial.role);
  const [location, setLocation] = useState(initial.location);
  const [primary, setPrimary] = useState<EnergyKey>(initial.primary);
  const [secondary, setSecondary] = useState<EnergyKey>(initial.secondary);
  const [scores, setScores] = useState(initial.scores);
  const [utilisation, setUtilisation] = useState(initial.utilisation);
  const [available, setAvailable] = useState<AvailKey>(initial.available);
  const [clients, setClients] = useState(initial.clients);
  const [revenue, setRevenue] = useState(initial.revenue);
  const [dayRate, setDayRate] = useState(initial.dayRate ?? 0);
  const [bio, setBio] = useState(initial.bio);
  const [bestTrait, setBestTrait] = useState(initial.bestTrait);
  const [vice, setVice] = useState(initial.vice);
  const [howToSpeak, setHowToSpeak] = useState(initial.howToSpeak);
  const [howToEmail, setHowToEmail] = useState(initial.howToEmail);
  const [capabilitiesText, setCapabilitiesText] = useState(listToLines(initial.capabilities));
  const [achievementsText, setAchievementsText] = useState(listToLines(initial.achievements));
  const [driversText, setDriversText] = useState(listToLines(initial.drivers));
  const [detractorsText, setDetractorsText] = useState(listToLines(initial.detractors));
  const [wheelPosition, setWheelPosition] = useState(initial.wheelPosition);
  const [autoPosition, setAutoPosition] = useState(
    initial.wheelPosition === deriveWheelPosition(initial.primary, initial.secondary),
  );

  useEffect(() => {
    if (autoPosition) setWheelPosition(deriveWheelPosition(primary, secondary));
  }, [primary, secondary, autoPosition]);

  const derivedInitials = useMemo(() => initialsFromName(name), [name]);
  const finalInitials = initialsOverride.trim() || derivedInitials;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Person = {
      id: initial.id,
      name: name.trim(),
      initials: finalInitials,
      role: role.trim(),
      location,
      primary,
      secondary,
      scores,
      utilisation,
      available,
      clients,
      revenue: revenue.trim(),
      dayRate: Math.max(0, Math.round(dayRate || 0)),
      bio: bio.trim(),
      capabilities: linesToList(capabilitiesText),
      achievements: linesToList(achievementsText),
      bestTrait: bestTrait.trim(),
      vice: vice.trim(),
      wheelPosition: wheelPosition.trim(),
      drivers: linesToList(driversText),
      detractors: linesToList(detractorsText),
      howToSpeak: howToSpeak.trim(),
      howToEmail: howToEmail.trim(),
    };
    onSubmit(next);
  }

  const submitDisabled = name.trim().length === 0 || role.trim().length === 0;

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <SectionLabel>Identity</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: 12,
          }}
        >
          <Field label="Full name" hint="As you'd put it on their profile page.">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Linnea Sjöberg"
              style={inputStyle}
            />
          </Field>
          <Field
            label="Initials"
            hint={`Auto: ${derivedInitials}. Override if you want something different.`}
          >
            <input
              value={initialsOverride}
              onChange={(e) => setInitialsOverride(e.target.value.toUpperCase().slice(0, 3))}
              placeholder={derivedInitials}
              style={inputStyle}
            />
          </Field>
          <Field label="Role / title">
            <input
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="E.g. Engagement Director"
              style={inputStyle}
            />
          </Field>
          <Field label="Location">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <SectionLabel>Pulse Map energy</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 12,
          }}
        >
          <Field label="Primary energy">
            <select
              value={primary}
              onChange={(e) => setPrimary(e.target.value as EnergyKey)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {ENERGIES.map((e) => (
                <option key={e} value={e}>
                  {energy[e].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Secondary energy">
            <select
              value={secondary}
              onChange={(e) => setSecondary(e.target.value as EnergyKey)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {ENERGIES.map((e) => (
                <option key={e} value={e}>
                  {energy[e].label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <SectionLabel>Energy scores (0–100)</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ENERGIES.map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: energy[k].color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ width: 80, fontSize: 12, color: "#5A5A5A", fontWeight: 500 }}>
                  {energy[k].label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scores[k]}
                  onChange={(e) =>
                    setScores({ ...scores, [k]: Number(e.target.value) })
                  }
                  style={{ flex: 1, accentColor: energy[k].color }}
                />
                <span
                  style={{
                    width: 44,
                    fontSize: 12,
                    fontWeight: 700,
                    color: energy[k].text,
                    textAlign: "right",
                  }}
                >
                  {scores[k]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field
            label="Wheel position"
            hint={
              autoPosition
                ? `Auto-derived from ${energy[primary].label} + ${energy[secondary].label}. Untick to write your own.`
                : "Custom — won't update when you change primary or secondary."
            }
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={wheelPosition}
                onChange={(e) => {
                  setAutoPosition(false);
                  setWheelPosition(e.target.value);
                }}
                style={{ ...inputStyle, flex: 1 }}
              />
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  color: "#5A5A5A",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <input
                  type="checkbox"
                  checked={autoPosition}
                  onChange={(e) => setAutoPosition(e.target.checked)}
                />
                Auto-derive
              </label>
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <SectionLabel>Capacity & commercials</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <Field label="Utilisation %">
            <input
              type="number"
              min={0}
              max={100}
              value={utilisation}
              onChange={(e) => setUtilisation(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>
          <Field label="Availability">
            <select
              value={available}
              onChange={(e) => setAvailable(e.target.value as AvailKey)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {AVAILABILITIES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Active clients">
            <input
              type="number"
              min={0}
              value={clients}
              onChange={(e) => setClients(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>
          <Field label="Revenue (12mo)" hint="Free text e.g. €1.4M or €820k">
            <input
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field
            label="Day rate (€)"
            hint="Used by the team builder's friction-cost projection. Sum of team day rates × productivity loss × project days = projected friction cost."
          >
            <input
              type="number"
              min={0}
              step={100}
              value={dayRate}
              onChange={(e) => setDayRate(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionLabel>Narrative</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Bio" hint="2–3 sentences in third person.">
            <textarea
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              style={textareaStyle}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 12,
            }}
          >
            <Field label="Best trait" hint="One line.">
              <input
                value={bestTrait}
                onChange={(e) => setBestTrait(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Watch-out (vice)" hint="One line.">
              <input
                value={vice}
                onChange={(e) => setVice(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>
          <Field label="How to speak with them" hint="A short paragraph of guidance.">
            <textarea
              value={howToSpeak}
              onChange={(e) => setHowToSpeak(e.target.value)}
              rows={3}
              style={textareaStyle}
            />
          </Field>
          <Field label="How to email them" hint="A short paragraph of guidance.">
            <textarea
              value={howToEmail}
              onChange={(e) => setHowToEmail(e.target.value)}
              rows={3}
              style={textareaStyle}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionLabel>Lists — one item per line</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 12,
          }}
        >
          <Field label="Capabilities" hint="Top 3–5 skills.">
            <textarea
              value={capabilitiesText}
              onChange={(e) => setCapabilitiesText(e.target.value)}
              rows={5}
              placeholder={"Engagement leadership\nPitch & sales\nDigital strategy"}
              style={textareaStyle}
            />
          </Field>
          <Field label="Achievements" hint="3 key wins.">
            <textarea
              value={achievementsText}
              onChange={(e) => setAchievementsText(e.target.value)}
              rows={5}
              placeholder={"Closed €4M Nordea win\nStabilised H&M loyalty rebuild\nMentor to 4 senior consultants"}
              style={textareaStyle}
            />
          </Field>
          <Field label="Drivers" hint="4 things that motivate.">
            <textarea
              value={driversText}
              onChange={(e) => setDriversText(e.target.value)}
              rows={5}
              placeholder={"Winning competitive pitches\nVisible commercial impact\nPace and momentum\nHigh-trust autonomy"}
              style={textareaStyle}
            />
          </Field>
          <Field label="Detractors" hint="4 things that drain.">
            <textarea
              value={detractorsText}
              onChange={(e) => setDetractorsText(e.target.value)}
              rows={5}
              placeholder={"Endless alignment meetings\nVague briefs\nMicro-management\nDeath by committee"}
              style={textareaStyle}
            />
          </Field>
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          padding: "6px 0",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "0.5px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#5A5A5A",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitDisabled}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: submitDisabled ? "#EDEDEA" : "#161311",
            color: submitDisabled ? "#9A9A9A" : "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            cursor: submitDisabled ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {mode === "create" ? "Create profile" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
