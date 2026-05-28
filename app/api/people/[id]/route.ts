import { NextResponse } from "next/server";
import { deletePerson, getPerson, updatePerson } from "../../../lib/db";
import type { Person } from "../../../lib/people-data";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId || Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  try {
    const person = await getPerson(numId);
    if (!person) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ person });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load person." },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId || Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  let body: { person?: Person };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.person || !body.person.name) {
    return NextResponse.json(
      { error: "Missing person payload (must include name)." },
      { status: 400 },
    );
  }
  try {
    const updated = await updatePerson(numId, body.person);
    return NextResponse.json({ person: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update person." },
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
    await deletePerson(numId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete person." },
      { status: 500 },
    );
  }
}
