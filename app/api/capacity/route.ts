import { NextResponse } from "next/server";
import { getAllCapacity, getAllRateCards, getEnrichedPeople } from "../../lib/db";
import { resolvePersonDayRate } from "../../lib/rate-card";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wantEnriched = url.searchParams.get("enriched") !== "false";
  try {
    if (wantEnriched) {
      const [enriched, cards] = await Promise.all([getEnrichedPeople(), getAllRateCards()]);
      const resolved = enriched.map((p) => ({
        ...p,
        dayRate: p.dayRate > 0 ? p.dayRate : resolvePersonDayRate(p, cards),
      }));
      return NextResponse.json({ enriched: resolved });
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
