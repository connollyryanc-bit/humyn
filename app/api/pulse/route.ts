import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a personality analyst specialising in the Humyn Pulse Map,
a four-colour temperament framework informed by Jungian psychological types.
You analyse professional text (LinkedIn profiles, bios, career histories) and
infer personality profiles.

The Humyn Pulse Map uses four energies (Colour — Behaviour — Archetype):
- Red — Action-focused — Driver: Decisive, driven, competitive, direct, strong-willed, purposeful
- Yellow — People-focused — Energizer: Enthusiastic, sociable, dynamic, creative, persuasive, optimistic
- Green — Stability-focused — Supporter: Caring, patient, reliable, empathetic, supportive
- Blue — Process-focused — Analyst: Analytical, precise, deliberate, questioning, formal, methodical

The 8 wheel positions are:
- Driver (pure red): Highly competitive, demanding, strong-willed
- Driving Energizer (red/yellow): Competitive and enthusiastic, drives others forward
- Energizer (pure yellow): Highly enthusiastic, creative, people-focused
- Supportive Energizer (yellow/green): Warm, sociable, caring about people
- Supporter (pure green): Patient, reliable, caring, good listener
- Analytical Supporter (green/blue): Methodical, supportive, detail-oriented
- Analyst (pure blue): Precise, analytical, questioning, reserved
- Driving Analyst (blue/red): Critical thinker, determined, strong standards

Mixed positions can be expressed as e.g. "Energizing Driver" (a Driver with a strong
Energizer influence) when one energy is clearly primary and the second is a strong influence.

Analyse the provided LinkedIn profile text and return ONLY a valid JSON object
with no other text, no markdown, no backticks. The JSON must follow this exact structure
(use the lowercase archetype names — driver, energizer, supporter, analyst — for the
scores keys and the primary/secondary fields):

{
  "name": "extracted or unknown",
  "bio": "2-3 sentence professional summary in third person",
  "scores": {
    "driver": 0-100,
    "energizer": 0-100,
    "supporter": 0-100,
    "analyst": 0-100
  },
  "wheelPosition": "one of the 8 positions above",
  "primary": "driver|energizer|supporter|analyst",
  "secondary": "driver|energizer|supporter|analyst",
  "capabilities": ["capability 1", "capability 2", "capability 3", "capability 4", "capability 5"],
  "achievements": ["achievement 1", "achievement 2", "achievement 3"],
  "bestTrait": "one sentence describing their greatest professional strength",
  "vice": "one sentence describing their main watch-out or blind spot",
  "drivers": ["driver 1", "driver 2", "driver 3", "driver 4"],
  "detractors": ["detractor 1", "detractor 2", "detractor 3", "detractor 4"],
  "howToSpeak": "paragraph on how to communicate verbally with this person based on their energy profile",
  "howToEmail": "paragraph on how to write to this person based on their energy profile",
  "confidence": 0-100
}

Base the confidence score on:
- Very short text (under 100 words): 40-50%
- Medium text (100-300 words): 60-70%
- Rich text (300-600 words): 75-85%
- Very detailed text (600+ words): 85-95%`;

function stripFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "");
    s = s.replace(/```\s*$/, "");
  }
  return s.trim();
}

const ENERGY_KEYS = ["driver", "energizer", "supporter", "analyst"] as const;
type EnergyKey = (typeof ENERGY_KEYS)[number];

// If Claude returns the old colour keys, translate to the archetype keys.
const LEGACY_TO_CURRENT: Record<string, EnergyKey> = {
  red: "driver",
  yellow: "energizer",
  green: "supporter",
  blue: "analyst",
  driver: "driver",
  energizer: "energizer",
  supporter: "supporter",
  analyst: "analyst",
};

function normaliseEnergyKey(value: unknown): EnergyKey | null {
  if (typeof value !== "string") return null;
  const mapped = LEGACY_TO_CURRENT[value.toLowerCase()];
  return mapped ?? null;
}

function normaliseProfile(p: any): any {
  if (!p || typeof p !== "object") return p;
  const out: any = { ...p };

  // Translate primary / secondary
  const primary = normaliseEnergyKey(p.primary);
  const secondary = normaliseEnergyKey(p.secondary);
  if (primary) out.primary = primary;
  if (secondary) out.secondary = secondary;

  // Translate scores object: { red, yellow, green, blue } -> { driver, energizer, supporter, analyst }
  if (p.scores && typeof p.scores === "object") {
    const nextScores: any = {};
    for (const [k, v] of Object.entries(p.scores)) {
      const target = LEGACY_TO_CURRENT[k.toLowerCase()];
      if (target) nextScores[target] = v;
    }
    // Preserve any keys already in the new shape
    out.scores = { ...p.scores, ...nextScores };
  }
  return out;
}

function validateProfile(p: any): string | null {
  if (!p || typeof p !== "object") return "Response was not an object.";
  if (typeof p.name !== "string") return "Missing name.";
  if (typeof p.bio !== "string") return "Missing bio.";
  if (!p.scores || typeof p.scores !== "object") return "Missing scores.";
  for (const k of ENERGY_KEYS) {
    if (typeof p.scores[k] !== "number") return `Missing score for ${k}.`;
  }
  if (!ENERGY_KEYS.includes(p.primary)) return "Invalid primary energy.";
  if (!ENERGY_KEYS.includes(p.secondary)) return "Invalid secondary energy.";
  if (!Array.isArray(p.capabilities)) return "Missing capabilities.";
  if (!Array.isArray(p.achievements)) return "Missing achievements.";
  if (typeof p.bestTrait !== "string") return "Missing bestTrait.";
  if (typeof p.vice !== "string") return "Missing vice.";
  if (!Array.isArray(p.drivers)) return "Missing drivers.";
  if (!Array.isArray(p.detractors)) return "Missing detractors.";
  if (typeof p.howToSpeak !== "string") return "Missing howToSpeak.";
  if (typeof p.howToEmail !== "string") return "Missing howToEmail.";
  if (typeof p.confidence !== "number") return "Missing confidence.";
  if (typeof p.wheelPosition !== "string") return "Missing wheelPosition.";
  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key is not configured on the server." },
      { status: 500 },
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (text.length < 40) {
    return NextResponse.json(
      { error: "Please paste a longer LinkedIn excerpt — at least a paragraph or two." },
      { status: 400 },
    );
  }

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content:
              "Analyse this LinkedIn profile and generate a Humyn Pulse personality profile:\n\n" +
              text,
          },
        ],
      }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Network error reaching the Anthropic API." },
      { status: 502 },
    );
  }

  if (!anthropicResponse.ok) {
    const detail = await anthropicResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Anthropic API returned ${anthropicResponse.status}.`,
        detail: detail.slice(0, 500),
      },
      { status: 502 },
    );
  }

  const apiJson: any = await anthropicResponse.json().catch(() => null);
  if (!apiJson) {
    return NextResponse.json(
      { error: "Anthropic API returned a non-JSON response." },
      { status: 502 },
    );
  }

  const textBlocks = (apiJson.content ?? []).filter(
    (b: any) => b && b.type === "text" && typeof b.text === "string",
  );
  const raw = textBlocks.map((b: any) => b.text).join("\n").trim();
  if (!raw) {
    return NextResponse.json(
      { error: "Claude returned an empty response." },
      { status: 502 },
    );
  }

  const cleaned = stripFences(raw);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      {
        error:
          "Claude's response wasn't valid JSON. Try pasting more profile text and generate again.",
      },
      { status: 502 },
    );
  }

  const normalised = normaliseProfile(parsed);

  const problem = validateProfile(normalised);
  if (problem) {
    return NextResponse.json(
      { error: `Generated profile failed validation: ${problem}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ profile: normalised });
}
