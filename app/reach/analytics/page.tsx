"use client";

import { energy, type EnergyKey } from "../../lib/people-data";
import {
  ENERGY_LABEL,
  SEGMENT_LABEL,
  STAGES,
  energyPerformance,
  funnelSeed,
  segmentPerformance,
  sequencesSeed,
} from "../seed";
import { useProspects, useSequences } from "../store";
import { Bar, Card, DemoTag, Label, Page, PageHeader, R } from "../ui";

export default function AnalyticsPage() {
  const [prospects] = useProspects();
  const [sequences] = useSequences();
  const seqs = sequences.length ? sequences : sequencesSeed;

  const top = funnelSeed[0].value;
  const maxEnergy = Math.max(...energyPerformance.map((e) => e.personalised));
  const maxSeg = Math.max(...segmentPerformance.map((s) => s.replyRate));
  const stageCounts = STAGES.map((s) => ({ ...s, count: prospects.filter((p) => p.stage === s.key).length }));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));

  const avgPersonalised = energyPerformance.reduce((a, e) => a + e.personalised, 0) / energyPerformance.length;
  const avgGeneric = energyPerformance.reduce((a, e) => a + e.generic, 0) / energyPerformance.length;

  return (
    <Page>
      <PageHeader
        title="Analytics"
        subtitle="What is working, for whom, and where leads are being lost."
        right={<DemoTag />}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
        {[
          ["Reply rate, personalised", `${avgPersonalised.toFixed(1)}%`],
          ["Reply rate, generic", `${avgGeneric.toFixed(1)}%`],
          ["Open to reply", `${((funnelSeed[2].value / funnelSeed[1].value) * 100).toFixed(1)}%`],
          ["Reply to meeting", `${((funnelSeed[3].value / funnelSeed[2].value) * 100).toFixed(1)}%`],
        ].map(([l, v]) => (
          <Card key={l}>
            <Label>{l}</Label>
            <div className="font-display" style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.5px" }}>
              {v}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <Label>Reply rate by energy type</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {energyPerformance.map((e) => (
              <div key={e.energy}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: R.ink, fontWeight: 600 }}>{ENERGY_LABEL[e.energy as EnergyKey]}</span>
                  <span style={{ color: R.ink2 }}>
                    {e.personalised}% <span style={{ color: R.ink3 }}>vs {e.generic}% generic</span>
                  </span>
                </div>
                <Bar value={e.personalised} max={maxEnergy} color={energy[e.energy].color} />
                <div style={{ height: 4 }} />
                <Bar value={e.generic} max={maxEnergy} color="#D7D4CC" />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: R.ink2, marginTop: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, background: R.ink, borderRadius: 2 }} /> Tailored to the person
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, background: "#D7D4CC", borderRadius: 2 }} /> Same message for everyone
            </span>
          </div>
        </Card>

        <Card>
          <Label>Performance by sector</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {segmentPerformance.map((s) => (
              <div key={s.segment}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: R.ink, fontWeight: 600 }}>{SEGMENT_LABEL[s.segment]}</span>
                  <span style={{ color: R.ink2 }}>
                    {s.replyRate}% reply <span style={{ color: R.ink3 }}>&middot; {s.meetingRate}% meeting &middot; {s.sent} sent</span>
                  </span>
                </div>
                <Bar value={s.replyRate} max={maxSeg} color={R.ink} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: R.ink3, lineHeight: 1.6, margin: "16px 0 0" }}>
            Healthcare converts lowest, which is typical for a regulated audience that is protected from sales approaches.
          </p>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.25rem 0" }}>
            <Label>Sequence performance</Label>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 0.8fr 0.8fr 0.8fr 0.9fr 1fr",
              gap: 8,
              padding: "8px 1.25rem",
              background: R.subtle,
              borderTop: R.line,
              borderBottom: R.line,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: R.ink3,
            }}
          >
            <span>Sequence</span>
            <span>Enrolled</span>
            <span>Replies</span>
            <span>Meetings</span>
            <span>Reply rate</span>
            <span>Vs generic</span>
          </div>
          {seqs.map((s) => {
            const rate = s.stats.sent > 0 ? (s.stats.replied / s.stats.sent) * 100 : 0;
            return (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 0.8fr 0.8fr 0.8fr 0.9fr 1fr",
                  gap: 8,
                  padding: "12px 1.25rem",
                  borderBottom: R.line,
                  fontSize: 13,
                  color: R.ink2,
                  alignItems: "center",
                }}
              >
                <span style={{ color: R.ink, fontWeight: 600 }}>{s.name}</span>
                <span>{s.stats.enrolled}</span>
                <span>{s.stats.replied}</span>
                <span>{s.stats.meetings}</span>
                <span>{s.stats.sent > 0 ? `${rate.toFixed(1)}%` : "Not started"}</span>
                <span style={{ color: rate > s.genericReplyRate ? "#2E8B57" : R.ink3 }}>
                  {s.stats.sent > 0 ? `+${(rate - s.genericReplyRate).toFixed(1)} pts` : "-"}
                </span>
              </div>
            );
          })}
        </Card>

        <Card>
          <Label>Prospects by stage</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stageCounts.map((s) => (
              <div key={s.key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: R.ink }}>{s.label}</span>
                  <span style={{ color: R.ink2 }}>{s.count}</span>
                </div>
                <Bar value={s.count} max={maxStage} color={R.ink} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: R.ink3, marginTop: 14 }}>
            Based on your {prospects.length} saved prospects. Change a stage on any prospect and this updates.
          </div>
        </Card>
      </div>

      <div style={{ fontSize: 12, color: R.ink3, marginTop: 16 }}>
        Funnel totals, sector and energy figures are sample data from {top.toLocaleString()} demo contacts.
      </div>
    </Page>
  );
}
