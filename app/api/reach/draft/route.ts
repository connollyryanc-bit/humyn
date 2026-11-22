import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mode = "questions" | "draft" | "rewrite";

interface ProspectInput {
  name?: string;
  title?: string;
  company?: string;
  segment?: string;
  region?: string;
  primary?: string;
  secondary?: string;
  wheelPosition?: string;
  opener?: string;
  regulated?: boolean;
}

interface Body {
  mode?: Mode;
  prospect?: ProspectInput;
  energy?: string;
  offer?: string;
  channel?: string;
  answers?: { question: string; answer: string }[];
  message?: string;
}

const ENERGY_GUIDE = `Message style by energy type (Humyn Pulse Map):
- Driver (action-focused): short, direct, outcome first, one clear next step, under 90 words.
- Energizer (people-focused): warm, personable, idea-led, enthusiastic, suggests a conversation.
- Supporter (harmony-focused): gentle, low pressure, trust-led, acknowledges their team, never pushes urgency.
- Analyst (process-focused): structured, specific, evidence-based, includes a concrete data point, lets them review before meeting.`;

const SYSTEM = `You are the message strategist inside Humyn Reach, a sales outreach tool.
You help sales people write messages that land with each individual prospect.

${ENERGY_GUIDE}

Rules:
- Use the prospect's energy type only to choose tone, length and structure.
- NEVER mention personality profiling, energy types, colours, or that a profile exists.
- Never invent facts about the prospect, their company, or results. Only use details provided.
- No hype, no false urgency, no emoji. British English. Plain, human language.
- If the prospect is in a regulated segment (healthcare), make no clinical, efficacy or promotional claims, avoid superlatives, and keep the message informational and respectful.
- Return ONLY valid JSON, no markdown, no backticks.`;

function describeProspect(p: ProspectInput | undefined, energy?: string): string {
  if (!p) return energy ? `Target style: ${energy}` : "No specific prospect.";
  return JSON.stringify(
    {
      name: p.name,
      title: p.title,
      company: p.company,
      segment: p.segment,
      region: p.region,
      primaryEnergy: energy || p.primary,
      secondaryEnergy: p.secondary,
      knownDetail: p.opener,
      regulatedSegment: Boolean(p.regulated),
    },
    null,
    2,
  );
}

function buildPrompt(b: Body): string | null {
  const who = describeProspect(b.prospect, b.energy);
  const channel = b.channel || "email";
  if (b.mode === "questions") {
    return `Prospect:\n${who}\n\nWhat the sales person sells:\n${b.offer || "(not provided)"}\n\nAsk the sales person 4 short, specific questions that would let you write a highly tailored ${channel} message to this prospect (for example: the trigger for reaching out now, the strongest relevant proof, what outcome they want, any prior contact). Do not ask things already known.\n\nReturn JSON: {"questions": ["...", "...", "...", "..."]}`;
  }
  if (b.mode === "draft") {
    const qa = (b.answers || [])
      .filter((a) => a.answer && a.answer.trim())
      .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
      .join("\n\n");
    return `Prospect:\n${who}\n\nWhat the sales person sells:\n${b.offer || "(not provided)"}\n\nSales person's answers:\n${qa || "(none)"}\n\nWrite a ${channel} message${channel === "email" ? " with a subject line" : ""} to this prospect, in the style that suits them.\n\nReturn JSON: {"subject": "...", "body": "..."}${channel === "email" ? "" : ' (subject may be an empty string)'}`;
  }
  if (b.mode === "rewrite") {
    if (!b.message || !b.message.trim()) return null;
    return `Prospect:\n${who}\n\nRewrite the sales person's draft below so it lands with this prospect. Keep their intent, facts and sign-off. Change tone, length, order and wording to suit the prospect. Keep any {{placeholders}} exactly as written.\n\nDraft:\n${b.message}\n\nReturn JSON: {"subject": "", "body": "...", "changes": ["2-3 short notes on what you changed and why, without mentioning personality or profiling"]}`;
  }
  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key is not configured on the server." }, { status: 500 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = buildPrompt(body);
  if (!prompt) {
    return NextResponse.json({ error: "Missing or invalid request." }, { status: 400 });
  }

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
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Network error reaching the Anthropic API." }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Anthropic API returned ${res.status}.`, detail: detail.slice(0, 400) },
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
    return NextResponse.json({ error: "The response wasn't valid JSON. Try again." }, { status: 502 });
  }

  if (body.mode === "questions") {
    const questions = Array.isArray(parsed?.questions)
      ? parsed.questions.filter((q: unknown) => typeof q === "string" && q.trim()).slice(0, 6)
      : [];
    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions were returned. Try again." }, { status: 502 });
    }
    return NextResponse.json({ questions });
  }

  const text = typeof parsed?.body === "string" ? parsed.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "No message was returned. Try again." }, { status: 502 });
  }
  return NextResponse.json({
    subject: typeof parsed?.subject === "string" ? parsed.subject.trim() : "",
    body: text,
    changes: Array.isArray(parsed?.changes)
      ? parsed.changes.filter((c: unknown) => typeof c === "string").slice(0, 4)
      : [],
  });
}
