"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EnergyKey, Person, energy } from "../../page";
import { EnergyDynamics, EnergyRing, EnergySpider } from "../../components/energy";
import { initialsFromName } from "../../lib/people-store";
import { createPersonViaApi } from "../../lib/api-client";

interface GeneratedProfile {
  name: string;
  bio: string;
  scores: { red: number; yellow: number; green: number; blue: number };
  wheelPosition: string;
  primary: EnergyKey;
  secondary: EnergyKey;
  capabilities: string[];
  achievements: string[];
  bestTrait: string;
  vice: string;
  drivers: string[];
  detractors: string[];
  howToSpeak: string;
  howToEmail: string;
  confidence: number;
}

const TEST_SAMPLE = `I am a strategic leader with 15 years of experience in digital transformation and organisational change. I have led complex, multi-stakeholder programmes across financial services, retail and public sector. I am direct and results-oriented, and I believe in making clear decisions based on evidence. I have built and scaled teams across Europe and am comfortable operating at board level. My focus is always on delivering measurable business outcomes, not just activity. I hold an MBA from London Business School and am a certified programme director.`;

const LOADING_STAGES = [
  "Analysing profile…",
  "Mapping energy profile…",
  "Building insights…",
];

function HumynWordmark({ size = 22 }: { size?: number }) {
  return (
    <span
      className="font-display"
      style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.5px", color: "#161311" }}
    >
      hum<span style={{ color: "#FF5040" }}>y</span>n
    </span>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
      }}
    >
      {children}
    </span>
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

function EnergyBars({ scores }: { scores: GeneratedProfile["scores"] }) {
  return (
    <div>
      {(["red", "yellow", "green", "blue"] as EnergyKey[]).map((c) => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: energy[c].color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#5A5A5A", width: 130, fontWeight: 500 }}>
            {energy[c].label}
          </span>
          <div style={{ flex: 1, height: 6, background: "#EDEDEA", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(0, Math.min(100, scores[c]))}%`,
                height: "100%",
                background: energy[c].color,
                borderRadius: 4,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: energy[c].text,
              width: 36,
              textAlign: "right",
              fontWeight: 600,
            }}
          >
            {scores[c]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function buildAiMessage(profile: GeneratedProfile, input: string): string {
  const name = profile.name.split(/\s+/)[0] || "there";
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  switch (profile.primary) {
    case "red":
      return `${name} — quick one. ${trimmed} I'd like a yes/no by end of day and I'll handle the follow-through. If you'd push back, tell me why in one line and I'll bring options.`;
    case "yellow":
      return `Hey ${name}! Got something I think you'll actually enjoy. ${trimmed} Would love your take — even a rough reaction is helpful. Happy to jump on a quick call if it's easier than typing it out.`;
    case "green":
      return `Hi ${name}, hope you're doing well. Wanted to bring this to you because I value how you think about these things. ${trimmed} No rush — take the time you need. Let me know what would help you decide.`;
    case "blue":
      return `${name}, sharing context up front. ${trimmed} The constraints are: timing, scope, and who's downstream of the decision. I'd value your read on the trade-offs before I commit either way. Happy to send any supporting data you want first.`;
  }
}

function EmptyPreview() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px dashed rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        color: "#9A9A9A",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#FAFAF8",
          border: "1px dashed rgba(0,0,0,0.12)",
        }}
      />
      <div style={{ fontSize: 14, fontWeight: 600, color: "#5A5A5A" }}>Profile preview</div>
      <p style={{ fontSize: 12, lineHeight: 1.55, maxWidth: 320, margin: 0 }}>
        Paste a LinkedIn About + Experience section on the left and click Generate profile. A full
        Pulse profile will appear here in a few seconds.
      </p>
    </div>
  );
}

function LoadingPreview() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % LOADING_STAGES.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <style>{`@keyframes humyn-pulse{0%,100%{opacity:.45}50%{opacity:1}}`}</style>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#FFFBF2",
          border: "1px solid #FAD98A",
          animation: "humyn-pulse 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{LOADING_STAGES[stage]}</div>
      <div style={{ fontSize: 12, color: "#9A9A9A", textAlign: "center", maxWidth: 320 }}>
        Claude is reading the profile and inferring the Pulse energy mix. This usually takes 3–10
        seconds.
      </div>
      <div
        style={{
          width: "70%",
          maxWidth: 240,
          height: 4,
          background: "#EDEDEA",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "40%",
            height: "100%",
            background: "#FF5040",
            borderRadius: 4,
            animation: "humyn-pulse 1.4s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

function ErrorPreview({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        background: "#FDF0EE",
        border: "1px solid #FCCDC6",
        borderRadius: 12,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#9B2A1A",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 600,
        }}
      >
        Profile generation failed
      </div>
      <div style={{ fontSize: 13, color: "#9B2A1A", lineHeight: 1.55 }}>{message}</div>
      <button
        onClick={onRetry}
        style={{
          alignSelf: "flex-start",
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #FCCDC6",
          background: "#FFFFFF",
          color: "#9B2A1A",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

function ProfileView({
  profile,
  nameDraft,
  setNameDraft,
  onSave,
  onStartOver,
  onCopyLink,
  saveState,
  copyState,
}: {
  profile: GeneratedProfile;
  nameDraft: string;
  setNameDraft: (v: string) => void;
  onSave: () => void;
  onStartOver: () => void;
  onCopyLink: () => void;
  saveState: "idle" | "saved";
  copyState: "idle" | "copied";
}) {
  const primary = energy[profile.primary];
  const [composerInput, setComposerInput] = useState<string>("");
  const [composerOutput, setComposerOutput] = useState<string>("");

  const displayName = nameDraft.trim() || profile.name || "Unknown";
  const firstName = displayName.split(/\s+/)[0] || "they";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <section
        style={{
          background: "#FFFFFF",
          border: "0.5px solid rgba(0,0,0,0.07)",
          borderRadius: 12,
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: primary.bg,
              color: primary.text,
              border: `1px solid ${primary.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            {initialsOf(displayName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: "#9A9A9A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Generated Pulse profile
            </div>
            <input
              className="font-display"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={profile.name || "Add a name"}
              style={{
                width: "100%",
                fontSize: 28,
                fontWeight: 600,
                color: "#161311",
                letterSpacing: "-0.5px",
                border: "none",
                outline: "none",
                background: "transparent",
                padding: 0,
                marginBottom: 6,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              <EnergyBadge k={profile.primary} />
              <EnergyBadge k={profile.secondary} small />
              <Pill>{profile.wheelPosition}</Pill>
            </div>
            <div style={{ fontSize: 12, color: "#9A9A9A" }}>
              Profile confidence: {profile.confidence}%
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12 }}>
        <Card>
          <SectionLabel>Energy ring</SectionLabel>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <EnergyRing
              scores={profile.scores}
              position={profile.wheelPosition}
              primary={profile.primary}
            />
          </div>
          <EnergyBars scores={profile.scores} />
        </Card>

        <Card>
          <SectionLabel>Energy dynamics</SectionLabel>
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
            <EnergyDynamics scores={profile.scores} />
          </div>
          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: primary.bg,
              border: `1px solid ${primary.border}`,
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: primary.text,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Primary energy
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: primary.text }}>
              {primary.label} · {profile.wheelPosition}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionLabel>Engagement signals</SectionLabel>
        <div
          style={{
            fontSize: 12,
            color: "#9A9A9A",
            marginBottom: 12,
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          Eight engagement dimensions derived from the energy mix — how this person is likely to
          show up in meetings, decisions and reviews.
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <EnergySpider scores={profile.scores} primary={profile.primary} />
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card>
          <SectionLabel>Bio</SectionLabel>
          <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
        </Card>

        <Card>
          <SectionLabel>Best trait & watch for</SectionLabel>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#2E8B57",
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 13, color: "#1A5C38", lineHeight: 1.55 }}>{profile.bestTrait}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#E8402A",
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 13, color: "#9B2A1A", lineHeight: 1.55 }}>{profile.vice}</div>
          </div>
        </Card>

        <Card>
          <SectionLabel>Drivers</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {profile.drivers.map((d) => (
              <span
                key={d}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: primary.bg,
                  color: primary.text,
                  border: `1px solid ${primary.border}`,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>Detractors</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {profile.detractors.map((d) => (
              <Pill key={d}>{d}</Pill>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>Capabilities</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {profile.capabilities.map((c) => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>Achievements</SectionLabel>
          <ol
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {profile.achievements.map((a, i) => (
              <li
                key={a}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 13,
                  color: "#1A1A1A",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: primary.bg,
                    color: primary.text,
                    border: `1px solid ${primary.border}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <SectionLabel>How to speak with {firstName}</SectionLabel>
        <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.65, margin: "0 0 16px" }}>
          {profile.howToSpeak}
        </p>
        <SectionLabel>How to email {firstName}</SectionLabel>
        <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.65, margin: 0 }}>
          {profile.howToEmail}
        </p>
      </Card>

      <Card>
        <SectionLabel>Write a message to {firstName}</SectionLabel>
        <div style={{ fontSize: 12, color: "#9A9A9A", marginBottom: 10, lineHeight: 1.5 }}>
          Describe what you want to say and the AI will write it in a way that lands perfectly with
          their {profile.wheelPosition} personality.
        </div>
        <textarea
          value={composerInput}
          onChange={(e) => setComposerInput(e.target.value)}
          placeholder={`E.g. I want to invite ${firstName} to lead a new initiative — explain the opportunity and ask for a yes/no.`}
          rows={4}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#1A1A1A",
            fontSize: 13,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            lineHeight: 1.5,
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            onClick={() => setComposerOutput(buildAiMessage(profile, composerInput))}
            disabled={!composerInput.trim()}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: composerInput.trim() ? "#1A1A1A" : "#EDEDEA",
              color: composerInput.trim() ? "#FFFFFF" : "#9A9A9A",
              fontSize: 12,
              fontWeight: 500,
              cursor: composerInput.trim() ? "pointer" : "not-allowed",
            }}
          >
            Generate message
          </button>
          {composerOutput && (
            <button
              onClick={() => {
                setComposerOutput("");
                setComposerInput("");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.07)",
                background: "#FFFFFF",
                color: "#5A5A5A",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          )}
        </div>
        {composerOutput && (
          <div
            style={{
              marginTop: 14,
              background: primary.bg,
              border: `1px solid ${primary.border}`,
              borderRadius: 10,
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: primary.text,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Suggested message · {primary.label} style
            </div>
            <p
              style={{
                fontSize: 13,
                color: primary.text,
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {composerOutput}
            </p>
          </div>
        )}
      </Card>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          padding: "12px 0 4px",
        }}
      >
        <button
          onClick={onSave}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: saveState === "saved" ? "#2E8B57" : "#1A1A1A",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {saveState === "saved" ? "Saved to Humyn" : "Save to Humyn"}
        </button>
        <button
          onClick={onStartOver}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#1A1A1A",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Start over
        </button>
        <button
          onClick={onCopyLink}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            color: "#1A1A1A",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {copyState === "copied" ? "Link copied" : "Copy profile link"}
        </button>
      </div>
    </div>
  );
}

export default function PulseNewPage() {
  const router = useRouter();
  const [text, setText] = useState<string>("");
  const [nameDraft, setNameDraft] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [profile, setProfile] = useState<GeneratedProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  async function generate() {
    setStatus("loading");
    setErrorMessage("");
    setSaveState("idle");
    setCopyState("idle");
    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.error ||
            "Profile generation failed. Please check you've pasted enough text from the LinkedIn profile and try again.",
        );
        return;
      }
      const p = data.profile as GeneratedProfile;
      setProfile(p);
      setNameDraft(p.name && p.name !== "unknown" ? p.name : "");
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Profile generation failed. Please check your connection and try again.",
      );
    }
  }

  function startOver() {
    setProfile(null);
    setNameDraft("");
    setText("");
    setStatus("idle");
    setErrorMessage("");
    setSaveState("idle");
    setCopyState("idle");
  }

  async function saveProfile() {
    if (!profile) return;
    const displayName = (nameDraft.trim() || profile.name || "Unknown").trim();
    const wheelLabel = profile.wheelPosition || `${energy[profile.primary].label} type`;
    const draftPerson: Person = {
      id: 0,
      name: displayName,
      initials: initialsFromName(displayName),
      role: "Generated from LinkedIn",
      location: "Stockholm",
      primary: profile.primary,
      secondary: profile.secondary,
      scores: profile.scores,
      utilisation: 0,
      available: "now",
      clients: 0,
      revenue: "—",
      dayRate: 1500,
      bio: profile.bio,
      capabilities: profile.capabilities,
      achievements: profile.achievements,
      bestTrait: profile.bestTrait,
      vice: profile.vice,
      wheelPosition: wheelLabel,
      drivers: profile.drivers,
      detractors: profile.detractors,
      howToSpeak: profile.howToSpeak,
      howToEmail: profile.howToEmail,
    };
    try {
      const saved = await createPersonViaApi(draftPerson);
      setSaveState("saved");
      setTimeout(() => router.push(`/people/${saved.id}/edit`), 600);
    } catch (err) {
      alert(
        `Could not save: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }
  }

  async function copyLink() {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopyState("copied");
        setTimeout(() => setCopyState("idle"), 2000);
      }
    } catch {
      // ignore — fallback silently
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
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
          <Link href="/">
            <HumynWordmark />
          </Link>
          <nav style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            <Link
              href="/"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
                background: "transparent",
              }}
            >
              People
            </Link>
            <Link
              href="/teams"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
                background: "transparent",
              }}
            >
              Teams
            </Link>
            <Link
              href="/capacity"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
                background: "transparent",
              }}
            >
              Capacity
            </Link>
            <Link
              href="/insights"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
                background: "transparent",
              }}
            >
              Insights
            </Link>
          </nav>
          <div style={{ flex: 1 }} />
          <Link
            href="/pulse/new"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
              color: "#FFFFFF",
              background: "#1A1A1A",
            }}
          >
            New profile
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px" }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Pulse · Profile generator
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.5px",
              margin: "6px 0 4px",
            }}
          >
            Paste a LinkedIn profile, get a Humyn profile
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720 }}>
            Drop in the About and Experience text from any LinkedIn profile — yours, a candidate&apos;s,
            or a client&apos;s. Claude reads it and builds a full Pulse energy profile with
            communication guidance and a confidence score.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)",
            gap: 16,
            alignItems: "start",
          }}
          className="pulse-grid"
        >
          <style>{`
            @media (max-width: 900px) {
              .pulse-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>

          <section
            style={{
              background: "#FFFFFF",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: 12,
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              position: "sticky",
              top: 72,
            }}
          >
            <div>
              <SectionLabel>Name (optional)</SectionLabel>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="E.g. Anna Lindqvist"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.07)",
                  background: "#FFFFFF",
                  color: "#1A1A1A",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <SectionLabel>LinkedIn profile text</SectionLabel>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the About section and Experience entries from any LinkedIn profile here…"
                rows={16}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.07)",
                  background: "#FFFFFF",
                  color: "#1A1A1A",
                  fontSize: 13,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  lineHeight: 1.55,
                  fontFamily: "inherit",
                  minHeight: 280,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                  fontSize: 11,
                  color: "#9A9A9A",
                }}
              >
                <span>
                  {wordCount} {wordCount === 1 ? "word" : "words"} pasted
                </span>
                <button
                  onClick={() => setText(TEST_SAMPLE)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 100,
                    border: "1px solid rgba(0,0,0,0.07)",
                    background: "#FFFFFF",
                    color: "#5A5A5A",
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Use test sample
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={generate}
                disabled={status === "loading" || text.trim().length < 40}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    status === "loading" || text.trim().length < 40 ? "#EDEDEA" : "#1A1A1A",
                  color:
                    status === "loading" || text.trim().length < 40 ? "#9A9A9A" : "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor:
                    status === "loading" || text.trim().length < 40
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {status === "loading" ? "Analysing…" : "Generate profile"}
              </button>
              {text && status !== "loading" && (
                <button
                  onClick={() => setText("")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.07)",
                    background: "#FFFFFF",
                    color: "#5A5A5A",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#9A9A9A",
                lineHeight: 1.55,
                padding: "10px 12px",
                background: "#FAFAF8",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              Tip: paste the full About + a few Experience entries for the best result. Short text
              gives a lower confidence score.
            </div>
          </section>

          <section>
            {status === "idle" && <EmptyPreview />}
            {status === "loading" && <LoadingPreview />}
            {status === "error" && (
              <ErrorPreview message={errorMessage} onRetry={() => setStatus("idle")} />
            )}
            {status === "ready" && profile && (
              <ProfileView
                profile={profile}
                nameDraft={nameDraft}
                setNameDraft={setNameDraft}
                onSave={saveProfile}
                onStartOver={startOver}
                onCopyLink={copyLink}
                saveState={saveState}
                copyState={copyState}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
