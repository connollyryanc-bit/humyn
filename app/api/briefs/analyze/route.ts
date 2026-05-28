import { NextResponse } from "next/server";
import { getAllPeople, getAllCapacity } from "../../../lib/db";
import { Person, energy } from "../../../lib/people-data";
import { PersonWithCapacity } from "../../../lib/capacity-data";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the Humyn Pulse team-composition AI for Valtech Nordic.
A capacity manager gives you an inbound brief / RFP and your job is to propose
three distinct, named team options drawn ONLY from the consultant pool provided
below. The capacity manager will choose one to take to client.

Voice rules:
- Pulse Map vocabulary only — the four archetypes are Driver (red,
  action-focused), Energizer (yellow, people-focused), Supporter (green,
  stability-focused), Analyst (blue, process-focused). Never Insights
  Discovery vocabulary.
- Use real consultant names from the pool. Never invent.
- Be specific and decisive, not hedging.
- Calibrate proposal naming to the kind of choice it represents (e.g.
  "Lean & senior", "Energy-balanced", "Fastest available", "Best client fit").

Inputs you will receive:
- The brief text
- Optional client name, project duration in months, preferred market
- The consultant pool, each with: id, name, role, location, primary +
  secondary energy, the four energy scores, capabilities, availability,
  utilisation, bench days, risk level, day rate

Rules:
- Return exactly three proposals.
- Each proposal must use a distinct subset of 3–7 people (no proposal can be
  identical to another).
- For each member, give a one-sentence reason rooted in their actual data
  (energy, capability, availability, day rate, market).
- Each proposal must include a one-sentence rationale that frames its
  positioning (e.g. "Built for pace — front-load Driver energy and senior
  presence; expect a richer day-rate.")
- Each proposal should include a one-sentence "watch-out" naming the trade-off
  it makes (e.g. "Light on Supporter — risk of slow consensus on long phases.")
- Prefer people whose availability is "now" or "soon" unless the brief
  explicitly needs an allocated specialist; in that case note the conflict.
- If the brief mentions a specific client, location or skill, weight people
  who match.

Return ONLY a valid JSON object with this exact shape — no markdown,
no preamble, no trailing text:

{
  "briefSummary": "one-sentence summary of what the brief is asking for",
  "inferredRequirements": {
    "skills": ["skill 1", "skill 2"],
    "seniorityNotes": "one sentence on seniority/level the brief implies",
    "energyMix": "one sentence on the energy mix the brief implies"
  },
  "proposals": [
    {
      "name": "short proposal name",
      "rationale": "one sentence framing the positioning",
      "watchOut": "one sentence trade-off",
      "members": [
        { "personId": 123, "role": "Team role (e.g. Lead, Architect, PM)", "reason": "one sentence on why this person fits" }
      ]
    }
  ]
}`;

interface AnalyzeBody {
  briefText?: string;
  client?: string;
  durationMonths?: number;
  preferredMarket?: string;
}

function personLine(p: PersonWithCapacity): string {
  return `id ${p.id}: ${p.name} (${p.role}, ${p.location}). Primary ${energy[p.primary].label} (${p.scores[p.primary]}%), secondary ${energy[p.secondary].label}. All energies: Driver ${p.scores.red} / Energizer ${p.scores.yellow} / Supporter ${p.scores.green} / Analyst ${p.scores.blue}. Capabilities: ${p.capabilities.join(", ") || "n/a"}. Availability: ${p.available}, ${p.utilisation}% util, ${p.capacity.benchDays}d bench, risk ${p.capacity.riskLevel}. Day rate €${p.dayRate || 1500}.`;
}

export async function POST(req: Request) {
  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const briefText = (body.briefText ?? "").trim();
  if (briefText.length < 30) {
    return NextResponse.json(
      { error: "Brief is too short — paste at least a paragraph." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key is not configured on the server." },
      { status: 503 },
    );
  }

  let people: Person[];
  let capacityMap: Record<number, PersonWithCapacity["capacity"]>;
  try {
    [people, capacityMap] = await Promise.all([getAllPeople(), getAllCapacity()]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load people pool." },
      { status: 500 },
    );
  }

  const enriched: PersonWithCapacity[] = people
    .filter((p) => capacityMap[p.id])
    .map((p) => ({ ...p, capacity: capacityMap[p.id] }));

  if (enriched.length === 0) {
    return NextResponse.json(
      { error: "No consultant pool available — seed Supabase first." },
      { status: 503 },
    );
  }

  const poolText = enriched.map(personLine).join("\n");

  const meta: string[] = [];
  if (body.client) meta.push(`Client: ${body.client}`);
  if (body.durationMonths) meta.push(`Estimated duration: ${body.durationMonths} months`);
  if (body.preferredMarket) meta.push(`Preferred market: ${body.preferredMarket}`);

  const userMessage = `Brief:
${briefText}

${meta.length > 0 ? `Project metadata:\n${meta.join("\n")}\n\n` : ""}Consultant pool (${enriched.length}):
${poolText}

Return three distinct proposals as JSON.`;

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
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Network error reaching Anthropic." }, { status: 502 });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return NextResponse.json(
      { error: `Anthropic returned ${response.status}.`, detail: detail.slice(0, 400) },
      { status: 502 },
    );
  }

  const apiJson: any = await response.json().catch(() => null);
  const raw = (apiJson?.content ?? [])
    .filter((b: any) => b?.type === "text" && typeof b.text === "string")
    .map((b: any) => b.text)
    .join("\n")
    .trim();
  if (!raw) {
    return NextResponse.json({ error: "Claude returned an empty response." }, { status: 502 });
  }

  let cleaned = raw;
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Claude's response wasn't valid JSON.", raw: raw.slice(0, 400) },
      { status: 502 },
    );
  }

  if (!parsed?.proposals || !Array.isArray(parsed.proposals)) {
    return NextResponse.json(
      { error: "Claude's response was missing proposals." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    analysis: parsed,
    generatedAt: new Date().toISOString(),
  });
}
