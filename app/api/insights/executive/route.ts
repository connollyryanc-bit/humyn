import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the executive workforce intelligence analyst for Valtech
Nordic — a 187-person professional-services firm operating across Stockholm, Oslo,
Copenhagen and Helsinki. You write the weekly read for the C-suite (CEO, COO,
CFO, CHRO, Head of Growth, board members).

Voice rules:
- Three short paragraphs of flowing prose. No bullets, no headings, no preamble.
- Lead paragraph (most important): the single strategic posture for the week —
  what's happening across capacity, demand, margin and skills, in plain language.
- Middle paragraph: the specific exposure or critical signal — name the
  practice, the brief or the consultant where useful. Be concrete with numbers.
- Closing paragraph: the executive action — what the leadership team should
  actually do this week or month.
- No hedging language ("perhaps", "might consider"). State the call.
- Strategic posture, not operational reporting. The board does not need to know
  what the capacity manager should do today.
- Plain language. No jargon, no internal product names beyond "Humyn".

Return ONLY a JSON object with the shape:
{
  "paragraphs": ["leading paragraph", "exposure paragraph", "action paragraph"]
}

No markdown, no backticks.`;

interface ExecutiveBrief {
  kpis: Array<{ label: string; value: string; detail: string; trendValue: number }>;
  notes?: string[];
}

function defaultBrief(): ExecutiveBrief {
  return {
    kpis: [
      { label: "Revenue Forecast", value: "€6.1M", detail: "Q3 forecast across 47 active engagements", trendValue: 2.1 },
      { label: "Gross Margin", value: "34.5%", detail: "Slipping 0.8pp on higher contractor utilisation in Stockholm + Oslo", trendValue: -0.8 },
      { label: "Utilisation", value: "78%", detail: "2pp below target, trending up", trendValue: 1.2 },
      { label: "Bench %", value: "12%", detail: "23 consultants on bench, 9 over 14-day threshold", trendValue: -0.3 },
      { label: "Open Demand", value: "€11.2M", detail: "Unstaffed + weighted pipeline over 90 days", trendValue: 18 },
      { label: "Pipeline Coverage", value: "1.4×", detail: "Weighted opportunity vs revenue target", trendValue: 0.1 },
      { label: "Delivery Risk", value: "Medium (3.4/5)", detail: "Three programmes flagged amber", trendValue: 0.2 },
      { label: "Skills Gap", value: "7 critical gaps", detail: "Most acute: LLM/Gen AI, Mobile React Native, Applied ML", trendValue: 2 },
    ],
    notes: [
      "Volvo Cars connected platform extension (€3.8M, 75% probability) still has unstaffed Engineering Lead — 12 days open.",
      "Helsinki Data & AI in critical shortage; Henna Mäkinen at 96% utilisation for 6 weeks, burnout-flagged.",
      "Klarna Phase 2 team at 96%+ utilisation for 8 weeks with communication friction signals.",
      "Cross-Nordic redeployment unlocks €420k of bench cost before any hiring.",
      "AI/ML skills gap widened: 4 FTEs vs 24 needed in 24 months. Upskilling delivers 6.5× cost efficiency vs hiring.",
    ],
  };
}

function buildBriefText(brief: ExecutiveBrief): string {
  const kpiLines = brief.kpis
    .map(
      (k) =>
        `- ${k.label}: ${k.value} (${k.trendValue > 0 ? "+" : ""}${k.trendValue}). ${k.detail}`,
    )
    .join("\n");
  const noteLines = (brief.notes ?? []).map((n) => `- ${n}`).join("\n");
  return `Live executive snapshot:\n\n${kpiLines}\n\nContextual signals:\n${noteLines}`;
}

function fallbackParagraphs(): string[] {
  return [
    "Pipeline coverage at 1.4× is healthy and trending up, but Q3 revenue forecast remains €0.3M below target with gross margin slipping 0.8 points on higher contractor utilisation in Stockholm and Oslo.",
    "Critical exposure: the AI/ML skills gap widened to seven roles after three confirmed Q4 starts that need specialists we don't currently have internally. Helsinki utilisation breaking 86% raises burnout risk on the OP Financial programme — two consultants flagged amber.",
    "Cross-Nordic redeployment unlocks an estimated €420k of bench cost before any hiring decision. The Workforce Optimization Engine recommends upskilling four mid-level consultants into the AI/ML capability over the next 90 days; estimated cost-to-value ratio is materially better than external hires.",
  ];
}

export async function POST(req: Request) {
  let body: { brief?: ExecutiveBrief } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return generate(body.brief ?? defaultBrief());
}

export async function GET() {
  return generate(defaultBrief());
}

async function generate(brief: ExecutiveBrief) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      paragraphs: fallbackParagraphs(),
      generatedAt: new Date().toISOString(),
      source: "template",
    });
  }

  const briefText = buildBriefText(brief);

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
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Write this week's executive read.\n\n${briefText}\n\nReturn the JSON only.`,
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json({
      paragraphs: fallbackParagraphs(),
      generatedAt: new Date().toISOString(),
      source: "template-fallback-network",
    });
  }

  if (!response.ok) {
    return NextResponse.json({
      paragraphs: fallbackParagraphs(),
      generatedAt: new Date().toISOString(),
      source: `template-fallback-http-${response.status}`,
    });
  }

  const apiJson: any = await response.json().catch(() => null);
  const raw = (apiJson?.content ?? [])
    .filter((b: any) => b?.type === "text" && typeof b.text === "string")
    .map((b: any) => b.text)
    .join("\n")
    .trim();

  if (!raw) {
    return NextResponse.json({
      paragraphs: fallbackParagraphs(),
      generatedAt: new Date().toISOString(),
      source: "template-fallback-empty",
    });
  }

  let cleaned = raw;
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed?.paragraphs) && parsed.paragraphs.length > 0) {
      return NextResponse.json({
        paragraphs: parsed.paragraphs.filter((p: unknown) => typeof p === "string"),
        generatedAt: new Date().toISOString(),
        source: "claude",
      });
    }
  } catch {
    // fall through to fallback
  }

  return NextResponse.json({
    paragraphs: fallbackParagraphs(),
    generatedAt: new Date().toISOString(),
    source: "template-fallback-parse",
  });
}
