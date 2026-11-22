"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EnergyKey } from "../../lib/people-data";
import { ENERGY_LABEL, ENERGY_STYLE, PLACEHOLDERS, SEGMENT_LABEL, type Prospect } from "../seed";
import { useProspects } from "../store";
import { Avatar, Btn, Card, EnergyPill, Label, Page, PageHeader, Pill, R, inputStyle } from "../ui";

type Mode = "write" | "rewrite";
type Channel = "email" | "linkedin";

interface Draft {
  subject: string;
  body: string;
  changes: string[];
}

const DEFAULT_OFFER =
  "We help B2B teams turn profile and engagement data into personalised outreach, so reps spend less time writing and get more replies.";

interface DraftResponse {
  questions: string[];
  subject: string;
  body: string;
  changes: string[];
}

async function callDraft(payload: Record<string, unknown>): Promise<DraftResponse> {
  const res = await fetch("/api/reach/draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Something went wrong. Try again.");
  return data;
}

function prospectPayload(p: Prospect) {
  return {
    name: p.name,
    title: p.title,
    company: p.company,
    segment: SEGMENT_LABEL[p.segment],
    region: p.region,
    primary: p.primary,
    secondary: p.secondary,
    wheelPosition: p.wheelPosition,
    opener: p.opener,
    regulated: p.regulated,
  };
}

function Output({ draft, channel }: { draft: Draft; channel: Channel }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const text = (draft.subject ? `Subject: ${draft.subject}\n\n` : "") + draft.body;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div style={{ border: R.line, borderRadius: 10, background: R.subtle, padding: 16 }}>
      {channel === "email" && draft.subject && (
        <div style={{ fontSize: 13, fontWeight: 600, color: R.ink, marginBottom: 10 }}>
          Subject: {draft.subject}
        </div>
      )}
      <div style={{ fontSize: 13, color: R.ink2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{draft.body}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
        <Btn small variant="light" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Btn>
        <span style={{ fontSize: 12, color: R.ink3 }}>{draft.body.split(/\s+/).length} words</span>
      </div>
    </div>
  );
}

function StudioInner() {
  const search = useSearchParams();
  const [prospects] = useProspects();
  const contactable = prospects.filter((p) => !p.doNotContact);

  const [chosenId, setChosenId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("write");
  const [channel, setChannel] = useState<Channel>("email");
  const [offer, setOffer] = useState(DEFAULT_OFFER);

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);

  const [original, setOriginal] = useState("");
  const [tailorAs, setTailorAs] = useState<EnergyKey | "prospect">("prospect");

  const [busy, setBusy] = useState<"" | "questions" | "draft" | "rewrite">("");
  const [error, setError] = useState("");

  const fromUrl = Number(search?.get("prospect")) || 0;
  const prospectId = chosenId ?? (fromUrl || contactable[0]?.id || 0);

  const p = prospects.find((x) => x.id === prospectId);

  function reset() {
    setQuestions([]);
    setAnswers([]);
    setDraft(null);
    setError("");
  }

  async function askQuestions() {
    if (!p) return;
    setBusy("questions");
    setError("");
    setDraft(null);
    try {
      const data = await callDraft({ mode: "questions", prospect: prospectPayload(p), offer, channel });
      setQuestions(data.questions);
      setAnswers(data.questions.map(() => ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  async function writeDraft() {
    if (!p) return;
    setBusy("draft");
    setError("");
    try {
      const data = await callDraft({
        mode: "draft",
        prospect: prospectPayload(p),
        offer,
        channel,
        answers: questions.map((q, i) => ({ question: q, answer: answers[i] || "" })),
      });
      setDraft({ subject: data.subject, body: data.body, changes: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  async function rewrite() {
    if (!p || !original.trim()) return;
    setBusy("rewrite");
    setError("");
    try {
      const data = await callDraft({
        mode: "rewrite",
        prospect: prospectPayload(p),
        energy: tailorAs === "prospect" ? undefined : tailorAs,
        message: original,
        channel,
      });
      setDraft({ subject: data.subject, body: data.body, changes: data.changes || [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const style = p ? ENERGY_STYLE[p.primary] : null;
  const tabBtn = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        setDraft(null);
        setError("");
      }}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: "none",
        background: mode === m ? R.ink : "transparent",
        color: mode === m ? "#FFFFFF" : R.ink2,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <Page>
      <PageHeader
        title="Message studio"
        subtitle="Write to one person at a time. Reach asks you what it needs, then writes in the style that suits them. Or paste your own draft and it will tailor it."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <Label>Who are you writing to</Label>
                <select
                  value={prospectId}
                  onChange={(e) => {
                    setChosenId(Number(e.target.value));
                    reset();
                  }}
                  style={inputStyle}
                >
                  {contactable.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}, {x.title}, {x.company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Channel</Label>
                <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)} style={inputStyle}>
                  <option value="email">Email</option>
                  <option value="linkedin">LinkedIn message</option>
                </select>
              </div>
            </div>
            <Label>What you are offering</Label>
            <textarea
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
            />
          </Card>

          <Card>
            <div
              style={{
                display: "flex",
                gap: 4,
                background: R.subtle,
                border: R.line,
                borderRadius: 10,
                padding: 4,
                width: "fit-content",
                marginBottom: 16,
              }}
            >
              {tabBtn("write", "Write with questions")}
              {tabBtn("rewrite", "Rewrite my message")}
            </div>

            {mode === "write" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {questions.length === 0 ? (
                  <div>
                    <p style={{ fontSize: 13, color: R.ink2, lineHeight: 1.6, margin: "0 0 14px" }}>
                      Reach will ask a few short questions about this prospect and your offer, so the message is
                      specific rather than generic.
                    </p>
                    <Btn variant="moss" onClick={askQuestions} disabled={!p || busy !== ""}>
                      {busy === "questions" ? "Thinking of questions..." : "Ask me questions"}
                    </Btn>
                  </div>
                ) : (
                  <>
                    {questions.map((q, i) => (
                      <div key={q}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: R.ink, marginBottom: 6 }}>
                          {i + 1}. {q}
                        </div>
                        <textarea
                          value={answers[i] || ""}
                          onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
                          rows={2}
                          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                        />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="moss" onClick={writeDraft} disabled={busy !== ""}>
                        {busy === "draft" ? "Writing..." : draft ? "Write again" : "Write the message"}
                      </Btn>
                      <Btn variant="light" onClick={reset} disabled={busy !== ""}>
                        Start over
                      </Btn>
                    </div>
                  </>
                )}
              </div>
            )}

            {mode === "rewrite" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <textarea
                  value={original}
                  onChange={(e) => setOriginal(e.target.value)}
                  rows={7}
                  placeholder="Paste the message you would normally send. Placeholders like {{first_name}} are kept."
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Btn variant="moss" onClick={rewrite} disabled={!original.trim() || busy !== "" || !p}>
                    {busy === "rewrite" ? "Rewriting..." : `Tailor for ${p ? p.name.split(" ")[0] : "prospect"}`}
                  </Btn>
                  <span style={{ fontSize: 12, color: R.ink3 }}>or try the style of</span>
                  <select
                    value={tailorAs}
                    onChange={(e) => setTailorAs(e.target.value as EnergyKey | "prospect")}
                    style={{ ...inputStyle, width: "auto", padding: "8px 10px", fontSize: 12 }}
                  >
                    <option value="prospect">Their own type</option>
                    {(Object.keys(ENERGY_LABEL) as EnergyKey[]).map((k) => (
                      <option key={k} value={k}>
                        {ENERGY_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 8,
                  background: "#FDF0EE",
                  color: "#9B2A1A",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {draft && (
              <div style={{ marginTop: 20 }}>
                <Label>{mode === "rewrite" ? "Tailored version" : "Your message"}</Label>
                <Output draft={draft} channel={channel} />
                {draft.changes.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <Label>What changed</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {draft.changes.map((c) => (
                        <div key={c} style={{ fontSize: 13, color: R.ink2, lineHeight: 1.55 }}>
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {p && style && (
            <Card>
              <Label>Writing to</Label>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                <Avatar initials={p.initials} k={p.primary} size={44} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: R.ink }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: R.ink3 }}>
                    {p.title}, {p.company}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <EnergyPill k={p.primary} />
                <Pill>{p.wheelPosition}</Pill>
              </div>
              <p style={{ fontSize: 13, color: R.ink2, lineHeight: 1.6, margin: "0 0 14px" }}>{style.summary}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {style.do.map((d) => (
                  <div key={d} style={{ fontSize: 12, color: R.ink2, display: "flex", gap: 8 }}>
                    <span style={{ color: "#2E8B57", fontWeight: 700 }}>+</span>
                    {d}
                  </div>
                ))}
                {style.dont.map((d) => (
                  <div key={d} style={{ fontSize: 12, color: R.ink2, display: "flex", gap: 8 }}>
                    <span style={{ color: "#E8402A", fontWeight: 700 }}>-</span>
                    {d}
                  </div>
                ))}
              </div>
              {p.regulated && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 10,
                    borderRadius: 8,
                    background: "#FFFBF2",
                    border: "0.5px solid #FAD98A",
                    color: "#8B5A00",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  Regulated segment. Reach keeps claims informational and avoids promotional language.
                </div>
              )}
            </Card>
          )}

          <Card>
            <Label>Smart placeholders</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PLACEHOLDERS.map((ph) => (
                <div key={ph.token}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <code style={{ fontSize: 12, color: R.ink }}>{ph.token}</code>
                    {ph.ai && <Pill bg="#EEF7F2" color="#1A5C38" border="transparent">AI written</Pill>}
                  </div>
                  <div style={{ fontSize: 12, color: R.ink3, marginTop: 2 }}>{ph.hint}</div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ fontSize: 12, color: R.ink3, lineHeight: 1.6, padding: "0 4px" }}>
            Reach uses a prospect&apos;s profile only to choose tone, length and structure. It never mentions the
            profile in a message and never invents facts.
          </div>
        </div>
      </div>
    </Page>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioInner />
    </Suspense>
  );
}
