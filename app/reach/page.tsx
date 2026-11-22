"use client";

import Link from "next/link";
import { funnelSeed, sequencesSeed, weeklyActivity } from "./seed";
import { scoreProspect } from "./scoring";
import { useProspects, useScoring, useSequences } from "./store";
import { Avatar, Bar, Card, DemoTag, EnergyPill, GradePill, Label, Page, PageHeader, Pill, R } from "./ui";

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card>
      <Label>{label}</Label>
      <div className="font-display" style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.5px", color: R.ink }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: R.ink3, marginTop: 4 }}>{note}</div>
    </Card>
  );
}

function ActivityChart() {
  const w = 460;
  const h = 170;
  const padB = 24;
  const maxSent = Math.max(...weeklyActivity.map((d) => d.sent));
  const maxReply = Math.max(...weeklyActivity.map((d) => d.replies));
  const slot = w / weeklyActivity.length;
  const barW = 30;
  const points = weeklyActivity
    .map((d, i) => {
      const x = i * slot + slot / 2;
      const y = (h - padB) - (d.replies / maxReply) * (h - padB - 14);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} aria-label="Weekly sent and replies">
      {weeklyActivity.map((d, i) => {
        const bh = (d.sent / maxSent) * (h - padB - 14);
        const x = i * slot + slot / 2 - barW / 2;
        return (
          <g key={d.week}>
            <rect x={x} y={h - padB - bh} width={barW} height={bh} fill="#E3E8DC" rx={4} />
            <text x={x + barW / 2} y={h - 6} textAnchor="middle" style={{ fontSize: 10, fill: R.ink3 }}>
              {d.week}
            </text>
          </g>
        );
      })}
      <polyline points={points} fill="none" stroke={R.ink} strokeWidth={2} />
      {weeklyActivity.map((d, i) => {
        const x = i * slot + slot / 2;
        const y = (h - padB) - (d.replies / maxReply) * (h - padB - 14);
        return <circle key={d.week} cx={x} cy={y} r={4} fill="#FFFFFF" stroke={R.ink} strokeWidth={2} />;
      })}
    </svg>
  );
}

export default function ReachDashboard() {
  const [prospects] = useProspects();
  const [cfg] = useScoring();
  const [sequences] = useSequences();

  const scored = prospects
    .map((p) => ({ p, s: scoreProspect(p, cfg) }))
    .sort((a, b) => b.s.total - a.s.total);
  const hot = scored.filter((x) => x.s.grade === "hot");
  const regulated = prospects.filter((p) => p.regulated).length;
  const suppressed = prospects.filter((p) => p.doNotContact).length;

  const top = funnelSeed[0].value;
  const replyRate = ((funnelSeed[2].value / top) * 100).toFixed(1);

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        subtitle="Your outreach at a glance: who is warm, what is working, and what needs attention today."
        right={<DemoTag />}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
        <Kpi label="Contacts reached" value={top.toLocaleString()} note="Last 6 weeks" />
        <Kpi label="Reply rate" value={`${replyRate}%`} note="Up from 3.0% with generic templates" />
        <Kpi label="Meetings booked" value={String(funnelSeed[3].value)} note="From 148 replies" />
        <Kpi label="Hot prospects" value={String(hot.length)} note="Ready for a personal touch" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <Label>Conversion funnel</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {funnelSeed.map((f, i) => {
              const prev = i === 0 ? null : funnelSeed[i - 1].value;
              return (
                <div key={f.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: R.ink }}>{f.label}</span>
                    <span style={{ color: R.ink2 }}>
                      {f.value.toLocaleString()}
                      {prev !== null && (
                        <span style={{ color: R.ink3, marginLeft: 8 }}>
                          {((f.value / prev) * 100).toFixed(0)}% of previous
                        </span>
                      )}
                    </span>
                  </div>
                  <Bar value={f.value} max={top} color={i < 2 ? "#C9D3BD" : R.ink} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <Label>Sent and replies by week</Label>
          <ActivityChart />
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: R.ink2, marginTop: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, background: "#E3E8DC", borderRadius: 2 }} /> Sent
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 2, background: R.ink }} /> Replies
            </span>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
        <Card>
          <Label>Hottest prospects</Label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {scored.slice(0, 6).map(({ p, s }) => (
              <Link
                key={p.id}
                href={`/reach/prospects/${p.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: R.line,
                }}
              >
                <Avatar initials={p.initials} k={p.primary} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: R.ink }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: R.ink3 }}>
                    {p.title}, {p.company}
                  </div>
                </div>
                <EnergyPill k={p.primary} />
                <GradePill grade={s.grade} score={s.total} />
              </Link>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Label>Active sequences</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(sequences.length ? sequences : sequencesSeed).map((s) => (
                <Link key={s.id} href="/reach/sequences" style={{ display: "block" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: R.ink }}>{s.name}</span>
                    <Pill>{s.status}</Pill>
                  </div>
                  <div style={{ fontSize: 12, color: R.ink3 }}>
                    {s.stats.enrolled} enrolled, {s.stats.replied} replies, {s.stats.meetings} meetings
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <Label dot="#2E8B57">Compliance</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: R.ink2, lineHeight: 1.55 }}>
              <div>
                <b style={{ color: R.ink }}>{suppressed}</b> contact on the do-not-contact list. Never emailed again.
              </div>
              <div>
                <b style={{ color: R.ink }}>{regulated}</b> contacts are in a regulated segment. Messages are checked
                against tighter rules before sending.
              </div>
              <div>Every contact keeps a record of where its data came from.</div>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
