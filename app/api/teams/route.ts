import { NextResponse } from "next/server";
import { createTeam, getAllTeams } from "../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const teams = await getAllTeams();
    return NextResponse.json({ teams });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load teams." },
      { status: 500 },
    );
  }
}

interface CreateTeamBody {
  name?: string;
  description?: string;
  client?: string | null;
  members?: Array<{ personId: number; role: string }>;
}

export async function POST(req: Request) {
  let body: CreateTeamBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Team name is required." }, { status: 400 });
  }
  try {
    const team = await createTeam({
      name: body.name.trim(),
      description: body.description ?? "",
      client: body.client ?? null,
      members: body.members ?? [],
    });
    return NextResponse.json({ team });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create team." },
      { status: 500 },
    );
  }
}
