import { NextResponse } from "next/server";
import { getAllPeople } from "../../../lib/db";
import { Person, energy } from "../../../lib/people-data";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a team-composition analyst specialising in the Humyn Pulse Map
(four energies — Driver (red, action-focused), Energizer (yellow, people-focused),
Supporter (green, stability-focused), Analyst (blue, process-focused)).
You are given a composed team and must return a structured JSON analysis useful
to a Nordic capacity manager.

Voice:
- Direct, calm, specific. Real names from the data.
- Do not invent skills or facts not present in the data.
- The Pulse Map vocabulary only — never Insights Discovery names.

Return ONLY a valid JSON object with this exact shape, no markdown, no preamble:

{
  "compositionSummary": "one sentence summary of the composed team",
  "strengths": ["short bullet 1", "short bullet 2", "short bullet 3"],
  "frictionPairs": [
    {
      "a": "person name",
      "b": "person name",
      "severity": "low|medium|high",
      "reason": "one sentence explaining the predicted friction in plain English"
    }
  ],
  "dynamicsRisks": ["short bullet describing a team-dynamic risk beyond pairwise friction"],
  "missingAngle": "one sentence describing the most useful additional perspective the team is missing",
  "kickoffPrompt": "one sentence the team lead should open the kickoff with to surface and dissolve the biggest predicted friction"
}

Rules:
- Only include frictionPairs that are real risks based on the data. If none, return an empty array.
- Limit to the top 3 most material friction pairs.
- Limit strengths to 3 items.
- Limit dynamicsRisks to 2 items.
- Each string is one sentence, max ~25 words.`;

interface AnalyzeBody {
  personIds?: number[];
}

function personBrief(p: Person): string {
  return `- ${p.name} (${p.role}, ${p.location}). Primary energy: ${energy[p.primary].label}, secondary: ${energy[p.secondary].label}. Wheel position: ${p.wheelPosition}. Energy scores: Driver ${p.scores.red}, Energizer ${p.scores.yellow}, Supporter ${p.scores.green}, Analyst ${p.scores.blue}. Best trait: ${p.bestTrait || "n/a"}. Watch-out: ${p.vice || "n/a"}. Drivers: ${p.drivers.join("; ") || "none"}. Detractors: ${p.detractors.join("; ") || "none"}.`;
}

export async function POST(req: Request) {
  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const ids = (body.personIds ?? []).filter((n) => typeof n === "number");
  if (ids.length === 0) {
    return NextResponse.json({ error: "Provide personIds (numbers)." }, { status: 400 });
  }

  let allPeople: Person[];
  try {
    allPeople = await getAllPeople();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load people." },
      { status: 500 },
    );
  }

  const team = ids
    .map((id) => allPeople.find((p) => p.id === id))
    .filter((p): p is Person => Boolean(p));

  if (team.length === 0) {
    return NextResponse.json({ error: "No matching people found." }, { status: 404 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key is not configured." }, { status: 503 });
  }

  const brief = `Composed team (${team.length} people):\n\n${team.map(personBrief).join("\n\n")}`;

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
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analyse this team:\n\n${brief}\n\nReturn only the JSON.`,
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Network error reaching Anthropic." }, { status: 502 });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Anthropic returned ${response.status}.`,
        detail: detail.slice(0, 400),
      },
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
      {
        error: "Claude's response wasn't valid JSON.",
        raw: raw.slice(0, 400),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    analysis: parsed,
    teamHash: ids.sort((a, b) => a - b).join("-"),
    generatedAt: new Date().toISOString(),
  });
}
