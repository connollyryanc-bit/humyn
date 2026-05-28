import { NextResponse } from "next/server";
import { getEnrichedPeople } from "../../../lib/db";
import {
  PersonWithCapacity,
  benchThresholds,
  buildWeeklyInsight,
} from "../../../lib/capacity-data";
import { energy } from "../../../lib/people-data";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the Humyn Pulse retention analyst for Valtech Nordic.
Write the C-suite's weekly read on capacity, retention, burnout and team health.
You are speaking to senior executives — be specific, calm, and decisive.

Voice rules:
- Real names, real numbers from the data below. No generic prose.
- Reference the Humyn Pulse Map energies as Driver (red), Energizer (yellow),
  Supporter (green), Analyst (blue) — never Insights Discovery vocabulary.
- 4–6 sentences of flowing prose, not bullet points.
- Lead with the single most urgent decision this week.
- Include one specific forward-looking action a leader could take by Friday.
- No hedging language ("perhaps", "might consider"). State the call.`;

function buildAnalystBrief(enriched: PersonWithCapacity[]): string {
  if (enriched.length === 0) return "No people on record. Skip the weekly read this week.";

  const flightRisks = enriched.filter(
    (p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium",
  );
  const watch = enriched.filter((p) => p.capacity.riskLevel === "watch");
  const burnouts = enriched.filter((p) => p.capacity.burnoutRisk);
  const onBench = enriched.filter((p) => p.capacity.benchDays > 0);
  const totalExposure = enriched
    .filter((p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium")
    .reduce((s, p) => s + p.capacity.lostRevenue3Months, 0);
  const avgUtil = Math.round(
    enriched.reduce((s, p) => s + p.utilisation, 0) / enriched.length,
  );

  function summary(p: PersonWithCapacity): string {
    return `- ${p.name} (${p.role}, ${p.location}, ${energy[p.primary].label} primary, util ${p.utilisation}%, loyalty ${p.capacity.loyaltyScore}, bench ${p.capacity.benchDays}d, risk ${p.capacity.riskLevel}${p.capacity.burnoutRisk ? ", burnout-flagged" : ""}${p.capacity.keyClientAtRisk ? `, client at risk: ${p.capacity.keyClientAtRisk}` : ""}). Recommended action: ${p.capacity.recommendedAction}`;
  }

  const sections: string[] = [];
  sections.push(`This week's numbers:
- Headcount: ${enriched.length}
- Average utilisation: ${avgUtil}% (target 80%, gap ${80 - avgUtil}pp)
- Flight risks (high or medium tier): ${flightRisks.length}
- Watch tier: ${watch.length}
- Burnout-flagged: ${burnouts.length}
- On bench: ${onBench.length} (${onBench.reduce((s, p) => s + p.capacity.benchDays, 0)} days combined)
- Three-month revenue exposure from flight risks: €${(totalExposure / 1000).toFixed(0)}k
- Energy-specific bench thresholds: Energizer ${benchThresholds.yellow}d · Supporter ${benchThresholds.green}d · Driver ${benchThresholds.red}d · Analyst ${benchThresholds.blue}d`);

  if (flightRisks.length > 0) {
    sections.push(`Flight risks needing decisions this week:
${flightRisks.sort((a, b) => a.capacity.loyaltyScore - b.capacity.loyaltyScore).map(summary).join("\n")}`);
  }

  if (watch.length > 0) {
    sections.push(`Watch tier — soft signals, no immediate action required:
${watch.map(summary).join("\n")}`);
  }

  if (burnouts.length > 0) {
    sections.push(`Burnout-flagged (sustained above 86% utilisation):
${burnouts.map(summary).join("\n")}`);
  }

  return sections.join("\n\n");
}

export async function GET() {
  let enriched: PersonWithCapacity[];
  try {
    enriched = await getEnrichedPeople();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load capacity data." },
      { status: 500 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      narrative: buildWeeklyInsight(enriched),
      generatedAt: new Date().toISOString(),
      source: "template",
    });
  }

  const brief = buildAnalystBrief(enriched);
  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Write this week's read using the data below. Output is prose only — no bullets, no headings, no preamble.\n\n${brief}`,
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json({
      narrative: buildWeeklyInsight(enriched),
      generatedAt: new Date().toISOString(),
      source: "template-fallback-network",
    });
  }

  if (!response.ok) {
    return NextResponse.json({
      narrative: buildWeeklyInsight(enriched),
      generatedAt: new Date().toISOString(),
      source: `template-fallback-http-${response.status}`,
    });
  }

  const apiJson: any = await response.json().catch(() => null);
  const text = (apiJson?.content ?? [])
    .filter((b: any) => b?.type === "text" && typeof b.text === "string")
    .map((b: any) => b.text)
    .join("\n")
    .trim();

  if (!text) {
    return NextResponse.json({
      narrative: buildWeeklyInsight(enriched),
      generatedAt: new Date().toISOString(),
      source: "template-fallback-empty",
    });
  }

  return NextResponse.json({
    narrative: text,
    generatedAt: new Date().toISOString(),
    source: "claude",
  });
}
