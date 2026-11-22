"use client";

import { useState } from "react";
import type { EnergyKey } from "../../lib/people-data";
import {
  ENERGY_LABEL,
  PLACEHOLDERS,
  SEGMENT_LABEL,
  SEGMENT_PAIN,
  SEGMENT_PROOF,
  inList,
  type Channel,
  type Sequence,
  type SequenceStep,
} from "../seed";
import { renderTemplate } from "../scoring";
import { useAllLists, useProspects, useSequences } from "../store";
import { Btn, Card, EnergyPill, Label, Page, PageHeader, Pill, R, inputStyle } from "../ui";

const CHANNEL: Record<Channel, { label: string; auto: boolean }> = {
  email: { label: "Email", auto: true },
  linkedin: { label: "LinkedIn", auto: false },
  call: { label: "Call", auto: false },
  sms: { label: "SMS", auto: true },
};

const SENDER = "Alex";

function newStep(channel: Channel, id: number, delayDays: number): SequenceStep {
  const base: Record<Channel, { subject: string; body: string }> = {
    email: { subject: "Subject", body: "Hi {{first_name}},\n\n{{opening_line}}\n\n{{sender_name}}" },
    linkedin: { subject: "Connection note", body: "Hi {{first_name}}, {{opening_line}}" },
    call: { subject: "Call task", body: "Call {{first_name}} at {{company}}." },
    sms: { subject: "SMS", body: "Hi {{first_name}}, it is {{sender_name}}. {{opening_line}}" },
  };
  return { id, channel, delayDays, ...base[channel] };
}

export default function SequencesPage() {
  const [sequences, setSequences] = useSequences();
  const [prospects] = useProspects();
  const lists = useAllLists();

  const [selectedId, setSelectedId] = useState<number>(1);
  const [previewProspectId, setPreviewProspectId] = useState<number>(0);
  const [previewStepId, setPreviewStepId] = useState<number>(0);
  const [tailorAs, setTailorAs] = useState<EnergyKey | "prospect">("prospect");
  const [tailoredResult, setTailoredResult] = useState<{ key: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorResult, setErrorResult] = useState<{ key: string; text: string } | null>(null);

  const seq = sequences.find((s) => s.id === selectedId) ?? sequences[0];
  const list = seq ? lists.find((l) => l.id === seq.listId) : undefined;
  const members = list ? prospects.filter((p) => inList(p, list) && !p.doNotContact) : [];
  const previewProspect = members.find((m) => m.id === previewProspectId) ?? members[0];
  const previewStep = seq?.steps.find((s) => s.id === previewStepId) ?? seq?.steps[0];

  const viewKey = `${seq?.id}-${previewProspect?.id}-${previewStep?.id}-${tailorAs}`;
  const tailored = tailoredResult && tailoredResult.key === viewKey ? tailoredResult.text : "";
  const error = errorResult && errorResult.key === viewKey ? errorResult.text : "";

  if (!seq) return null;

  function update(patch: Partial<Sequence>) {
    setSequences((prev) => prev.map((s) => (s.id === seq.id ? { ...s, ...patch } : s)));
  }

  function updateStep(stepId: number, patch: Partial<SequenceStep>) {
    update({ steps: seq.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)) });
  }

  function addStep(channel: Channel) {
    const nextId = Math.max(0, ...seq.steps.map((s) => s.id)) + 1;
    const lastDay = seq.steps.length ? seq.steps[seq.steps.length - 1].delayDays : 0;
    update({ steps: [...seq.steps, newStep(channel, nextId, lastDay + 3)] });
  }

  function removeStep(stepId: number) {
    update({ steps: seq.steps.filter((s) => s.id !== stepId) });
  }

  function rendered(): string {
    if (!previewProspect || !previewStep) return "";
    return renderTemplate(previewStep.body, previewProspect, {
      opening: previewProspect.opener,
      pain: SEGMENT_PAIN[previewProspect.segment],
      proof: SEGMENT_PROOF[previewProspect.segment],
      sender: SENDER,
    });
  }

  async function tailor() {
    if (!previewProspect) return;
    setBusy(true);
    setErrorResult(null);
    const key = viewKey;
    try {
      const res = await fetch("/api/reach/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "rewrite",
          prospect: {
            name: previewProspect.name,
            title: previewProspect.title,
            company: previewProspect.company,
            segment: SEGMENT_LABEL[previewProspect.segment],
            region: previewProspect.region,
            primary: previewProspect.primary,
            secondary: previewProspect.secondary,
            opener: previewProspect.opener,
            regulated: previewProspect.regulated,
          },
          energy: tailorAs === "prospect" ? undefined : tailorAs,
          channel: previewStep?.channel,
          message: rendered(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Something went wrong. Try again.");
      setTailoredResult({ key, text: data.body });
    } catch (e) {
      setErrorResult({ key, text: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  const uplift = seq.stats.sent > 0 ? (seq.stats.replied / seq.stats.sent) * 100 : 0;

  return (
    <Page>
      <PageHeader
        title="Sequences"
        subtitle="Multi-step outreach across email and tasks. Every step is written once, then personalised for each person."
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12, alignItems: "start" }}>
        <Card style={{ padding: "1rem" }}>
          <Label>Your sequences</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sequences.map((s) => {
              const on = s.id === seq.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(s.id);
                    setPreviewProspectId(0);
                    setPreviewStepId(0);
                  }}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 10,
                    border: on ? `1px solid ${R.ink}` : R.line,
                    background: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: R.ink, marginBottom: 6 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Pill>{s.status}</Pill>
                    <span style={{ fontSize: 12, color: R.ink3 }}>{s.steps.length} steps</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <input
                  value={seq.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="font-display"
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.3px",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    width: "100%",
                    color: R.ink,
                    padding: 0,
                  }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: R.ink3 }}>Sends to</span>
                  <select
                    value={seq.listId}
                    onChange={(e) => {
                      update({ listId: e.target.value });
                      setPreviewProspectId(0);
                    }}
                    style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12 }}
                  >
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 12, color: R.ink3 }}>{members.length} contactable prospects</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Pill>{seq.status}</Pill>
                <Btn
                  variant={seq.status === "active" ? "light" : "moss"}
                  onClick={() => update({ status: seq.status === "active" ? "paused" : "active" })}
                >
                  {seq.status === "active" ? "Pause" : "Activate"}
                </Btn>
              </div>
            </div>

            {seq.stats.sent > 0 && (
              <div style={{ display: "flex", gap: 28, marginTop: 18, paddingTop: 16, borderTop: R.line, flexWrap: "wrap" }}>
                {[
                  ["Enrolled", seq.stats.enrolled],
                  ["Sent", seq.stats.sent],
                  ["Opened", seq.stats.opened],
                  ["Replied", seq.stats.replied],
                  ["Meetings", seq.stats.meetings],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <div className="font-display" style={{ fontSize: 22, fontWeight: 600 }}>
                      {v}
                    </div>
                    <div style={{ fontSize: 11, color: R.ink3, letterSpacing: "0.07em", textTransform: "uppercase" }}>{l}</div>
                  </div>
                ))}
                <div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 600 }}>
                    {uplift.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 11, color: R.ink3, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Reply rate vs {seq.genericReplyRate}% generic
                  </div>
                </div>
              </div>
            )}
          </Card>

          {list?.filter.segment === "healthcare" && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: "#FFFBF2",
                border: "0.5px solid #FAD98A",
                color: "#8B5A00",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              This list is in a regulated segment. Keep messages informational, avoid clinical or promotional claims,
              and confirm local rules for contacting healthcare professionals before activating.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 12, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {seq.steps.map((st, i) => {
                const meta = CHANNEL[st.channel];
                const showSubject = st.channel === "email";
                return (
                  <Card key={st.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: R.ink,
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: R.ink }}>{meta.label}</span>
                      <Pill bg={meta.auto ? "#EEF7F2" : "#F3F0EA"} color={meta.auto ? "#1A5C38" : R.ink2} border="transparent">
                        {meta.auto ? "Sent automatically" : "Task for you"}
                      </Pill>
                      <span style={{ flex: 1 }} />
                      <span style={{ fontSize: 12, color: R.ink3 }}>Day</span>
                      <input
                        type="number"
                        min={0}
                        value={st.delayDays}
                        onChange={(e) => updateStep(st.id, { delayDays: Math.max(0, Number(e.target.value) || 0) })}
                        style={{ ...inputStyle, width: 60, padding: "5px 8px", fontSize: 12 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(st.id)}
                        aria-label="Remove step"
                        style={{ border: "none", background: "transparent", color: R.ink3, cursor: "pointer", fontSize: 18 }}
                      >
                        &times;
                      </button>
                    </div>
                    {showSubject && (
                      <input
                        value={st.subject}
                        onChange={(e) => updateStep(st.id, { subject: e.target.value })}
                        placeholder="Subject"
                        style={{ ...inputStyle, marginBottom: 8, fontWeight: 600 }}
                      />
                    )}
                    <textarea
                      value={st.body}
                      onChange={(e) => updateStep(st.id, { body: e.target.value })}
                      rows={st.channel === "email" ? 7 : 3}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                      {PLACEHOLDERS.map((ph) => (
                        <button
                          key={ph.token}
                          type="button"
                          onClick={() => updateStep(st.id, { body: st.body + (st.body.endsWith(" ") || st.body.endsWith("\n") ? "" : " ") + ph.token })}
                          title={ph.hint}
                          style={{
                            border: R.line,
                            background: ph.ai ? "#EEF7F2" : R.subtle,
                            color: ph.ai ? "#1A5C38" : R.ink2,
                            borderRadius: 100,
                            padding: "3px 10px",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          {ph.token}
                        </button>
                      ))}
                    </div>
                  </Card>
                );
              })}

              <Card style={{ padding: "1rem" }}>
                <Label>Add a step</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(Object.keys(CHANNEL) as Channel[]).map((c) => (
                    <Btn key={c} variant="light" small onClick={() => addStep(c)}>
                      + {CHANNEL[c].label}
                    </Btn>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: R.ink3, lineHeight: 1.6, margin: "10px 0 0" }}>
                  Email and SMS send automatically. LinkedIn and calls become tasks, with the message or script
                  ready for you to use. SMS needs recorded consent in most countries.
                </p>
              </Card>
            </div>

            <div style={{ position: "sticky", top: 76 }}>
              <Card>
                <Label>Preview</Label>
                {members.length === 0 || !previewProspect || !previewStep ? (
                  <p style={{ fontSize: 13, color: R.ink3, margin: 0 }}>Choose a list with prospects to preview.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <select
                      value={previewProspect.id}
                      onChange={(e) => setPreviewProspectId(Number(e.target.value))}
                      style={{ ...inputStyle, fontSize: 12 }}
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}, {m.company}
                        </option>
                      ))}
                    </select>
                    <select
                      value={previewStep.id}
                      onChange={(e) => setPreviewStepId(Number(e.target.value))}
                      style={{ ...inputStyle, fontSize: 12 }}
                    >
                      {seq.steps.map((s, i) => (
                        <option key={s.id} value={s.id}>
                          Step {i + 1}: {CHANNEL[s.channel].label}, day {s.delayDays}
                        </option>
                      ))}
                    </select>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <EnergyPill k={previewProspect.primary} />
                      <span style={{ fontSize: 12, color: R.ink3 }}>placeholders filled for this person</span>
                    </div>

                    <div
                      style={{
                        border: R.line,
                        borderRadius: 10,
                        background: R.subtle,
                        padding: 14,
                        fontSize: 13,
                        color: R.ink2,
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {previewStep.channel === "email" && (
                        <div style={{ fontWeight: 600, color: R.ink, marginBottom: 8 }}>
                          {renderTemplate(previewStep.subject, previewProspect, {
                            opening: previewProspect.opener,
                            pain: SEGMENT_PAIN[previewProspect.segment],
                            proof: SEGMENT_PROOF[previewProspect.segment],
                            sender: SENDER,
                          })}
                        </div>
                      )}
                      {rendered()}
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <Btn small variant="moss" onClick={tailor} disabled={busy}>
                        {busy ? "Tailoring..." : "Tailor with AI"}
                      </Btn>
                      <select
                        value={tailorAs}
                        onChange={(e) => setTailorAs(e.target.value as EnergyKey | "prospect")}
                        style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12 }}
                      >
                        <option value="prospect">Their own type</option>
                        {(Object.keys(ENERGY_LABEL) as EnergyKey[]).map((k) => (
                          <option key={k} value={k}>
                            As a {ENERGY_LABEL[k]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {error && (
                      <div style={{ padding: 10, borderRadius: 8, background: "#FDF0EE", color: "#9B2A1A", fontSize: 12 }}>
                        {error}
                      </div>
                    )}

                    {tailored && (
                      <div>
                        <Label>Tailored version</Label>
                        <div
                          style={{
                            border: "0.5px solid #9ED4B8",
                            borderRadius: 10,
                            background: "#EEF7F2",
                            padding: 14,
                            fontSize: 13,
                            color: "#1A5C38",
                            lineHeight: 1.65,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {tailored}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
