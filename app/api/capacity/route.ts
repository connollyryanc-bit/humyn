import { NextResponse } from "next/server";
import { getAllCapacity, getEnrichedPeople } from "../../lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wantEnriched = url.searchParams.get("enriched") !== "false";
  try {
    if (wantEnriched) {
      const enriched = await getEnrichedPeople();
      return NextResponse.json({ enriched });
    }
    const capacity = await getAllCapacity();
    return NextResponse.json({ capacity });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load capacity." },
      { status: 500 },
    );
  }
}
