"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { energy } from "../../../lib/people-data";
import { EnergyBalance, EnergyRing } from "../../../components/energy";
import { ENERGY_STYLE, SEGMENT_PAIN, STAGES, type Stage } from "../../seed";
import { scoreProspect } from "../../scoring";
import { useProspects, useScoring } from "../../store";
import { Avatar, Bar, Btn, Card, EnergyPill, GradePill, Label, Page, Pill, R, SegmentPill, inputStyle } from "../../ui";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display" style={{ fontSize: 24, fontWeight: 600, color: R.ink }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: R.ink3, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function List({ items, dot }: { items: string[]; dot: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((t) => (
        <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, marginTop: 7, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: R.ink2, lineHeight: 1.55 }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProspectProfile() {
  const params = useParams<{ id: string }>();
  const [prospects, setProspects, hydrated] = useProspects();
  const [cfg] = useScoring();
  const p = prospects.find((x) => x.id === Number(params?.id));

  if (!p) {
    return (
      <Page narrow>
        <Link href="/reach/prospects" style={{ fontSize: 13, color: R.ink2 }}>
          &larr; Prospects
        </Link>
        <p style={{ fontSize: 14, color: R.ink2, marginTop: 24 }}>
          {hydrated ? "This prospect could not be found." : "Loading..."}
        </p>
      </Page>
    );
  }

  const s = scoreProspect(p, cfg);
  const e = energy[p.primary];
  const style = ENERGY_STYLE[p.primary];

  function setStage(stage: Stage) {
    setProspects((prev) => prev.map((x) => (x.id === p!.id ? { ...x, stage } : x)));
  }

  const fitRows: { label: string; value: number }[] = [
    { label: "Job title match", value: p.fit.title },
    { label: "Industry match", value: p.fit.industry },
    { label: "Company size", value: p.fit.size },
    { label: "Region", value: p.fit.region },
  ];

  return (
    <Page>
      <Link href="/reach/prospects" style={{ fontSize: 13, color: R.ink2 }}>
        &larr; Prospects
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, margin: "16px 0 24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Avatar initials={p.initials} k={p.primary} size={64} />
          <div>
            <h1 className="font-display" style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.5px", margin: 0 }}>
              {p.name}
            </h1>
            <div style={{ fontSize: 14, color: R.ink2, margin: "6px 0 10px" }}>
              {p.title}, {p.company} &middot; {p.region}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <EnergyPill k={p.primary} />
              <Pill>{p.wheelPosition}</Pill>
              <SegmentPill s={p.segment} />
              <GradePill grade={s.grade} score={s.total} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <select
            value={p.stage}
            onChange={(ev) => setStage(ev.target.value as Stage)}
            style={{ ...inputStyle, width: "auto", padding: "9px 12px", fontSize: 12 }}
            aria-label="Pipeline stage"
          >
            {STAGES.map((st) => (
              <option key={st.key} value={st.key}>
                {st.label}
              </option>
            ))}
            <option value="lost">Lost</option>
          </select>
          <Link href={`/reach/studio?prospect=${p.id}`}>
            <Btn variant="moss">Write a message</Btn>
          </Link>
        </div>
      </div>

      {(p.regulated || p.doNotContact) && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: p.doNotContact ? "#FDF0EE" : "#FFFBF2",
            border: `0.5px solid ${p.doNotContact ? "#FCCDC6" : "#FAD98A"}`,
            color: p.doNotContact ? "#9B2A1A" : "#8B5A00",
            fontSize: 13,
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {p.doNotContact
            ? "This contact is on the do-not-contact list. Sequences will skip them."
            : "Regulated segment. Messages to healthcare professionals are limited to informational content with no clinical or promotional claims. Check local rules before sending."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <Label dot={e.color}>Pulse profile</Label>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <EnergyRing scores={p.scores} position={p.wheelPosition} primary={p.primary} size={260} />
          </div>
          <div style={{ fontSize: 12, color: R.ink3, textAlign: "center", marginTop: 4 }}>
            Confidence {p.confidence}%. Predicted from public information, not their own result.
          </div>
        </Card>

        <Card>
          <Label dot={e.color}>Leading and reserve energies</Label>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 8px 0" }}>
            <EnergyBalance scores={p.scores} height={250} />
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <Label dot={e.color}>How to write to {p.name.split(" ")[0]}</Label>
          <p style={{ fontSize: 14, color: R.ink, lineHeight: 1.6, margin: "0 0 18px" }}>{style.summary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2E8B57", marginBottom: 10 }}>Do</div>
              <List items={style.do} dot="#2E8B57" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E8402A", marginBottom: 10 }}>Don&apos;t</div>
              <List items={style.dont} dot="#E8402A" />
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: R.line }}>
            <Label>Suggested opening</Label>
            <p style={{ fontSize: 13, color: R.ink2, lineHeight: 1.6, margin: 0 }}>{p.opener}</p>
            <p style={{ fontSize: 12, color: R.ink3, lineHeight: 1.6, margin: "8px 0 0" }}>
              Likely focus: {SEGMENT_PAIN[p.segment]}.
            </p>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Label>Lead score</Label>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
              <span className="font-display" style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.5px" }}>
                {s.total}
              </span>
              <span style={{ fontSize: 12, color: R.ink3 }}>
                fit {s.fit} &middot; engagement {s.engagement}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {fitRows.map((r) => (
                <div key={r.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: R.ink2, marginBottom: 5 }}>
                    <span>{r.label}</span>
                    <span style={{ color: R.ink3 }}>{r.value}</span>
                  </div>
                  <Bar value={r.value} color={R.ink} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Label>Outreach so far</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              <Stat label="Sent" value={p.engagement.sent} />
              <Stat label="Opens" value={p.engagement.opens} />
              <Stat label="Clicks" value={p.engagement.clicks} />
              <Stat label="Replies" value={p.engagement.replies} />
              <Stat label="Meetings" value={p.engagement.meetings} />
            </div>
            <div style={{ fontSize: 12, color: R.ink3, marginTop: 14, lineHeight: 1.6 }}>
              Last activity: {p.lastActivity}. Added {p.addedDaysAgo} days ago from {p.source}.
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
