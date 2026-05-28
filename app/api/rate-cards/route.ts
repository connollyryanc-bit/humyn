import { NextResponse } from "next/server";
import { getAllRateCards, upsertRateCard } from "../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cards = await getAllRateCards();
    return NextResponse.json({ cards });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load rate cards." },
      { status: 500 },
    );
  }
}

interface UpsertBody {
  roleBand?: string;
  seniority?: string;
  market?: string;
  dayRateEur?: number;
  notes?: string;
}

export async function POST(req: Request) {
  let body: UpsertBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.roleBand || !body.seniority || !body.market) {
    return NextResponse.json(
      { error: "roleBand, seniority and market are required." },
      { status: 400 },
    );
  }
  const dayRate = Number(body.dayRateEur ?? 0);
  if (!Number.isFinite(dayRate) || dayRate < 0) {
    return NextResponse.json({ error: "dayRateEur must be a non-negative number." }, { status: 400 });
  }
  try {
    const card = await upsertRateCard({
      roleBand: body.roleBand.trim(),
      seniority: body.seniority.trim(),
      market: body.market.trim(),
      dayRateEur: Math.round(dayRate),
      notes: body.notes ?? "",
    });
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save rate card." },
      { status: 500 },
    );
  }
}
