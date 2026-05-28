import { NextResponse } from "next/server";
import { createPerson, getAllPeople } from "../../lib/db";
import type { Person } from "../../lib/people-data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const people = await getAllPeople();
    return NextResponse.json({ people });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load people." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
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
    const created = await createPerson(body.person);
    return NextResponse.json({ person: created });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create person." },
      { status: 500 },
    );
  }
}
