import { NextResponse } from "next/server";
import { deleteTeam, updateTeam } from "../../../lib/db";

export const runtime = "nodejs";

interface UpdateTeamBody {
  name?: string;
  description?: string;
  client?: string | null;
  members?: Array<{ personId: number; role: string }>;
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId || Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  let body: UpdateTeamBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Team name is required." }, { status: 400 });
  }
  try {
    const team = await updateTeam(numId, {
      name: body.name.trim(),
      description: body.description ?? "",
      client: body.client ?? null,
      members: body.members ?? [],
    });
    return NextResponse.json({ team });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update team." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId || Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  try {
    await deleteTeam(numId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete team." },
      { status: 500 },
    );
  }
}
