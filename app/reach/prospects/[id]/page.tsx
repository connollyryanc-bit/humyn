"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { PersonInsights } from "../../../lib/insights";
import {
  EnergyBadge,
  HeaderStat,
  Pill,
  ProfileHeader,
  PulseProfileBody,
} from "../../../components/pulse-profile";
import { ENERGY_STYLE, SEGMENT_LABEL, SEGMENT_PAIN, STAGES, type Prospect, type Stage } from "../../seed";
import { GRADE_STYLE, scoreProspect, type ScoreResult } from "../../scoring";
import { prospectToPerson } from "../../prospect-person";
import { useProspects, useScoring } from "../../store";
import { Bar, Btn, Card, GradePill, Label, Page, R, inputStyle } from "../../ui";

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

function Bullets({ items, dot }: { items: string[]; dot: string }) {
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

function OutreachTab({
  p,
  s,
  onStage,
}: {
  p: Prospect;
  s: ScoreResult;
  onStage: (stage: Stage) => void;
}) {
  const style = ENERGY_STYLE[p.primary];
  const first = p.name.split(" ")[0];
  const fitRows: { label: string; value: number }[] = [
    { label: "Job title match", value: p.fit.title },
    { label: "Industry match", value: p.fit.industry },
    { label: "Company size", value: p.fit.size },
    { label: "Region", value: p.fit.region },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <Label>How to write to {first}</Label>
          <p style={{ fontSize: 14, color: R.ink, lineHeight: 1.6, margin: "0 0 18px" }}>{style.summary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2E8B57", marginBottom: 10 }}>Do</div>
              <Bullets items={style.do} dot="#2E8B57" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E8402A", marginBottom: 10 }}>Don&apos;t</div>
              <Bullets items={style.dont} dot="#E8402A" />
            </div>
          </div>
        </Card>
        <Card>
          <Label>Suggested opening</Label>
          <p style={{ fontSize: 13, color: R.ink2, lineHeight: 1.6, margin: 0 }}>{p.opener}</p>
          <p style={{ fontSize: 12, color: R.ink3, lineHeight: 1.6, margin: "8px 0 0" }}>
            Likely focus: {SEGMENT_PAIN[p.segment]}.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link href={`/reach/studio?prospect=${p.id}`}>
              <Btn variant="moss">Write a message to {first}</Btn>
            </Link>
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <Label>Pipeline stage</Label>
          <select
            value={p.stage}
            onChange={(ev) => onStage(ev.target.value as Stage)}
            style={inputStyle}
            aria-label="Pipeline stage"
          >
            {STAGES.map((st) => (
              <option key={st.key} value={st.key}>
                {st.label}
              </option>
            ))}
            <option value="lost">Lost</option>
          </select>
        </Card>

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
  );
}

export default function ProspectProfile() {
  const params = useParams<{ id: string }>();
  const [prospects, setProspects, hydrated] = useProspects();
  const [cfg] = useScoring();
  const [insightState, setInsightState] = useState<"idle" | "working">("idle");
  const [insightError, setInsightError] = useState("");

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

  const prospect = p;
  const s = scoreProspect(prospect, cfg);
  const person = prospectToPerson(prospect);
  const grade = GRADE_STYLE[s.grade];

  function setStage(stage: Stage) {
    setProspects((prev) => prev.map((x) => (x.id === prospect.id ? { ...x, stage } : x)));
  }

  async function generateInsights() {
    setInsightState("working");
    setInsightError("");
    try {
      const res = await fetch("/api/pulse/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ person }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate the deep dive.");
      const insights = data.insights as PersonInsights;
      setProspects((prev) => prev.map((x) => (x.id === prospect.id ? { ...x, insights } : x)));
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : "Could not generate the deep dive.");
    } finally {
      setInsightState("idle");
    }
  }

  const stageLabel = prospect.doNotContact
    ? "Do not contact"
    : STAGES.find((x) => x.key === prospect.stage)?.label ?? "Lost";

  return (
    <Page>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Link href="/reach/prospects" style={{ fontSize: 13, color: R.ink2 }}>
          &larr; Back to prospects
        </Link>
        <Link href={`/reach/studio?prospect=${prospect.id}`}>
          <Btn variant="moss">Write a message</Btn>
        </Link>
      </div>

      {(prospect.regulated || prospect.doNotContact) && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: prospect.doNotContact ? "#FDF0EE" : "#FFFBF2",
            border: `0.5px solid ${prospect.doNotContact ? "#FCCDC6" : "#FAD98A"}`,
            color: prospect.doNotContact ? "#9B2A1A" : "#8B5A00",
            fontSize: 13,
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {prospect.doNotContact
            ? "This contact is on the do-not-contact list. Sequences will skip them."
            : "Regulated segment. Messages to healthcare professionals are limited to informational content with no clinical or promotional claims. Check local rules before sending."}
        </div>
      )}

      <ProfileHeader
        person={person}
        eyebrow="Prospect profile"
        subtitle={`${prospect.title}, ${prospect.company} · ${prospect.region}`}
        badges={
          <>
            <EnergyBadge k={person.primary} />
            <EnergyBadge k={person.secondary} small />
            <Pill>{person.wheelPosition}</Pill>
            <Pill>{SEGMENT_LABEL[prospect.segment]}</Pill>
            <GradePill grade={s.grade} score={s.total} />
          </>
        }
        stats={
          <>
            <HeaderStat label="Lead score" value={`${s.total} · ${grade.label}`} color={grade.color} />
            <HeaderStat label="Stage" value={stageLabel} />
            <HeaderStat label="Sector" value={SEGMENT_LABEL[prospect.segment]} />
            <HeaderStat label="Company size" value={prospect.companySize} />
            <HeaderStat label="Source" value={prospect.source} />
          </>
        }
      />

      <PulseProfileBody
        person={person}
        insightState={insightState}
        insightError={insightError}
        onGenerateInsights={generateInsights}
        composerPlaceholder="E.g. I would like to book a 20-minute call about reducing unplanned downtime across their plants."
        capabilitiesLabel="Role and company"
        showAchievements={false}
        extraTabs={[
          {
            key: "outreach",
            label: "Outreach",
            content: <OutreachTab p={prospect} s={s} onStage={setStage} />,
          },
        ]}
      />
    </Page>
  );
}
