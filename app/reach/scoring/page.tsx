"use client";

import Link from "next/link";
import { scoringDefault, type ScoringConfig } from "../seed";
import { GRADE_STYLE, scoreProspect, type Grade } from "../scoring";
import { useProspects, useScoring } from "../store";
import { Btn, Card, EnergyPill, GradePill, Label, Page, PageHeader, R } from "../ui";

function Slider({
  label,
  hint,
  value,
  min = 0,
  max = 100,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: R.ink }}>{label}</span>
        <span style={{ color: R.ink2, fontWeight: 600 }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: R.ink }}
        aria-label={label}
      />
      {hint && <div style={{ fontSize: 12, color: R.ink3, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

export default function ScoringPage() {
  const [cfg, setCfg] = useScoring();
  const [prospects] = useProspects();

  function set(patch: Partial<ScoringConfig>) {
    setCfg((prev) => ({ ...prev, ...patch }));
  }

  const scored = prospects.map((p) => ({ p, s: scoreProspect(p, cfg) })).sort((a, b) => b.s.total - a.s.total);
  const counts: Record<Grade, number> = { hot: 0, warm: 0, cold: 0 };
  scored.forEach((x) => (counts[x.s.grade] += 1));

  return (
    <Page>
      <PageHeader
        title="Lead scoring"
        subtitle="Decide what a good lead looks like. Change a weight and every prospect is re-scored straight away."
        right={
          <Btn variant="light" onClick={() => setCfg(scoringDefault)}>
            Reset to defaults
          </Btn>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Label>Fit: does this person match your ideal customer</Label>
            <Slider
              label="Job title match"
              value={cfg.fitWeights.title}
              onChange={(v) => set({ fitWeights: { ...cfg.fitWeights, title: v } })}
            />
            <Slider
              label="Industry match"
              value={cfg.fitWeights.industry}
              onChange={(v) => set({ fitWeights: { ...cfg.fitWeights, industry: v } })}
            />
            <Slider
              label="Company size"
              value={cfg.fitWeights.size}
              onChange={(v) => set({ fitWeights: { ...cfg.fitWeights, size: v } })}
            />
            <Slider
              label="Region"
              value={cfg.fitWeights.region}
              onChange={(v) => set({ fitWeights: { ...cfg.fitWeights, region: v } })}
            />
          </Card>

          <Card>
            <Label>Engagement: points for each action</Label>
            <Slider
              label="Email opened"
              value={cfg.engagementPoints.opens}
              max={20}
              onChange={(v) => set({ engagementPoints: { ...cfg.engagementPoints, opens: v } })}
            />
            <Slider
              label="Link clicked"
              value={cfg.engagementPoints.clicks}
              max={30}
              onChange={(v) => set({ engagementPoints: { ...cfg.engagementPoints, clicks: v } })}
            />
            <Slider
              label="Reply received"
              value={cfg.engagementPoints.replies}
              max={50}
              onChange={(v) => set({ engagementPoints: { ...cfg.engagementPoints, replies: v } })}
            />
            <Slider
              label="Meeting booked"
              value={cfg.engagementPoints.meetings}
              max={60}
              onChange={(v) => set({ engagementPoints: { ...cfg.engagementPoints, meetings: v } })}
            />
          </Card>

          <Card>
            <Label>Balance and thresholds</Label>
            <Slider
              label="Weight on fit (the rest goes to engagement)"
              value={cfg.fitShare}
              onChange={(v) => set({ fitShare: v })}
              hint="Higher favours the right profile. Lower favours people who are already responding."
            />
            <Slider label="Hot from score" value={cfg.hotAt} onChange={(v) => set({ hotAt: Math.max(v, cfg.warmAt + 1) })} />
            <Slider label="Warm from score" value={cfg.warmAt} onChange={(v) => set({ warmAt: Math.min(v, cfg.hotAt - 1) })} />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Label>Where your prospects land</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {(["hot", "warm", "cold"] as Grade[]).map((g) => (
                <div
                  key={g}
                  style={{
                    background: GRADE_STYLE[g].bg,
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div className="font-display" style={{ fontSize: 28, fontWeight: 600, color: GRADE_STYLE[g].text }}>
                    {counts[g]}
                  </div>
                  <div style={{ fontSize: 12, color: GRADE_STYLE[g].text }}>{GRADE_STYLE[g].label}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
              <Label>Live scoring</Label>
            </div>
            {scored.map(({ p, s }) => (
              <Link
                key={p.id}
                href={`/reach/prospects/${p.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 0.7fr 0.7fr 1fr",
                  gap: 8,
                  alignItems: "center",
                  padding: "10px 1.25rem",
                  borderTop: R.line,
                  fontSize: 13,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: R.ink }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: R.ink3 }}>{p.company}</div>
                </div>
                <EnergyPill k={p.primary} />
                <span style={{ color: R.ink2 }}>Fit {s.fit}</span>
                <span style={{ color: R.ink2 }}>Eng {s.engagement}</span>
                <GradePill grade={s.grade} score={s.total} />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </Page>
  );
}
