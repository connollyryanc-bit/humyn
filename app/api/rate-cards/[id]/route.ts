import { NextResponse } from "next/server";
import { deleteRateCard } from "../../../lib/db";

export const runtime = "nodejs";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId || Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  try {
    await deleteRateCard(numId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete rate card." },
      { status: 500 },
    );
  }
}
