import { NextResponse } from "next/server";
import { INSIGHTS_JSON_SPEC, normaliseInsights } from "../../../lib/insights";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a personality analyst using the Humyn Pulse Map, a four-energy
temperament framework: Driver (action-focused), Energizer (people-focused),
Supporter (stability-focused) and Analyst (process-focused).

You are given an existing Pulse profile. Extend it with deeper, practical guidance for
anyone who works with this person. Stay consistent with the energy scores and wheel
position provided. Be specific and concrete, never generic. Write in British English.

Return ONLY a valid JSON object, no markdown and no backticks, with exactly this shape:

{
  ${INSIGHTS_JSON_SPEC}
}`;

interface PersonInput {
  name?: string;
  role?: string;
  bio?: string;
  wheelPosition?: string;
  primary?: string;
  secondary?: string;
  scores?: Record<string, number>;
  capabilities?: string[];
  drivers?: string[];
  detractors?: string[];
  bestTrait?: string;
  vice?: string;
  howToSpeak?: string;
  howToEmail?: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key is not configured on the server." },
      { status: 500 },
    );
  }

  let body: { person?: PersonInput };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const p = body.person;
  if (!p || !p.name || !p.scores) {
    return NextResponse.json({ error: "Missing person profile." }, { status: 400 });
  }

  const summary = JSON.stringify(
    {
      name: p.name,
      role: p.role,
      bio: p.bio,
      wheelPosition: p.wheelPosition,
      primary: p.primary,
      secondary: p.secondary,
      scores: p.scores,
      capabilities: p.capabilities,
      drivers: p.drivers,
      detractors: p.detractors,
      bestTrait: p.bestTrait,
      vice: p.vice,
      howToSpeak: p.howToSpeak,
      howToEmail: p.howToEmail,
    },
    null,
    2,
  );

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: "Generate the deep-dive insights for this profile:\n\n" + summary },
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Network error reaching the Anthropic API." }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Anthropic API returned ${res.status}.`, detail: detail.slice(0, 500) },
      { status: 502 },
    );
  }

  const json: any = await res.json().catch(() => null);
  const raw = ((json?.content ?? []) as any[])
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Claude's response wasn't valid JSON. Try again." }, { status: 502 });
  }

  const insights = normaliseInsights(parsed?.insights);
  if (!insights) {
    return NextResponse.json({ error: "Generated insights were incomplete. Try again." }, { status: 502 });
  }
  return NextResponse.json({ insights });
}
