import { NextResponse } from "next/server";
import { getEnrichedPeople } from "../../../lib/db";
import { PersonWithCapacity } from "../../../lib/capacity-data";
import { energy } from "../../../lib/people-data";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the Humyn Pulse analyst writing the executive board read
for Valtech Nordic. The audience is the C-suite and external board members
scanning this page in under a minute.

Voice rules:
- Three short sentences. Maximum.
- Strategic posture, not operational action. The board does not need to know
  what the capacity manager should do this week. They need to know whether
  the platform is holding up.
- No names — talk about the organisation's posture and exposure in aggregate.
- Pulse Map vocabulary only (Driver, Energizer, Supporter, Analyst). Never
  Insights Discovery vocabulary.
- No bullet points, no headings, no hedging language ("perhaps", "might").
- Lead with the headline number that matters most this week.
- Plain language. No jargon, no internal product names beyond "Humyn Pulse".`;

function buildAnalystBrief(enriched: PersonWithCapacity[]): string {
  if (enriched.length === 0) return "No people on record. Skip the board read this week.";

  const flightRisks = enriched.filter(
    (p) => p.capacity.riskLevel === "high" || p.capacity.riskLevel === "medium",
  );
  const burnouts = enriched.filter((p) => p.capacity.burnoutRisk);
  const onBench = enriched.filter((p) => p.capacity.benchDays > 0);
  const totalRevenueAtRisk = flightRisks.reduce(
    (s, p) => s + p.capacity.lostRevenue3Months,
    0,
  );
  const totalAttritionCost = enriched.reduce(
    (s, p) =>
      s + p.capacity.replacementCost + p.capacity.lostRevenue3Months + p.capacity.onboardingCost,
    0,
  );
  const avgUtil = Math.round(
    enriched.reduce((s, p) => s + p.utilisation, 0) / enriched.length,
  );
  const avgLoyalty = Math.round(
    enriched.reduce((s, p) => s + p.capacity.loyaltyScore, 0) / enriched.length,
  );
  const dailyBillable = enriched.reduce((s, p) => s + (p.dayRate || 1500), 0);

  return `Aggregate state (no individual names — for board prose):
- Headcount: ${enriched.length}
- Average utilisation: ${avgUtil}% (target 80%, gap ${80 - avgUtil}pp)
- Average loyalty score: ${avgLoyalty}/100
- Combined billable capacity: €${(dailyBillable / 1000).toFixed(1)}k/day
- Three-month revenue exposure from retention: €${(totalRevenueAtRisk / 1000).toFixed(0)}k
- Total attrition cost exposure across the org: €${(totalAttritionCost / 1000).toFixed(0)}k
- Flight risks (high or medium tier): ${flightRisks.length} (${Math.round((flightRisks.length / enriched.length) * 100)}% of workforce)
- Burnout-flagged: ${burnouts.length}
- On bench: ${onBench.length}

Dominant energies across the org: Driver ${enriched.filter((p) => p.primary === "red").length}, Energizer ${enriched.filter((p) => p.primary === "yellow").length}, Supporter ${enriched.filter((p) => p.primary === "green").length}, Analyst ${enriched.filter((p) => p.primary === "blue").length}.`;
}

export async function GET() {
  let enriched: PersonWithCapacity[];
  try {
    enriched = await getEnrichedPeople();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load people." },
      { status: 500 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      narrative:
        "AI summary unavailable — Anthropic API key is not configured. Numbers below are still accurate.",
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
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Write this week's board read. Three sentences, strategic posture, no names, no bullets, no preamble.\n\n${brief}`,
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json({
      narrative: "AI summary unavailable — network error. Numbers below are still accurate.",
      generatedAt: new Date().toISOString(),
      source: "template-fallback",
    });
  }

  if (!response.ok) {
    return NextResponse.json({
      narrative: `AI summary unavailable — upstream returned ${response.status}.`,
      generatedAt: new Date().toISOString(),
      source: `template-fallback-${response.status}`,
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
      narrative: "AI summary unavailable — empty response.",
      generatedAt: new Date().toISOString(),
      source: "template-fallback-empty",
    });
  }

  // Quick avoidance of energy-name leakage for board prose
  const labels = {
    red: energy.red.label,
    yellow: energy.yellow.label,
    green: energy.green.label,
    blue: energy.blue.label,
  };
  void labels;

  return NextResponse.json({
    narrative: text,
    generatedAt: new Date().toISOString(),
    source: "claude",
  });
}
