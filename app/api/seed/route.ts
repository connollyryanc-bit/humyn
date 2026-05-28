import { NextResponse } from "next/server";
import { EnergyKey, people } from "../../lib/people-data";
import { capacityData } from "../../lib/capacity-data";
import { getSupabaseAdmin } from "../../lib/supabase";

export const runtime = "nodejs";

const APP_TO_DB: Record<EnergyKey, "red" | "yellow" | "green" | "blue"> = {
  driver: "red",
  energizer: "yellow",
  supporter: "green",
  analyst: "blue",
};

export async function POST() {
  const sb = getSupabaseAdmin();

  const peopleRows = people.map((p) => ({
    id: p.id,
    name: p.name,
    initials: p.initials,
    role: p.role,
    location: p.location,
    primary_energy: APP_TO_DB[p.primary],
    secondary_energy: APP_TO_DB[p.secondary],
    score_red: p.scores.driver,
    score_yellow: p.scores.energizer,
    score_green: p.scores.supporter,
    score_blue: p.scores.analyst,
    utilisation: p.utilisation,
    available: p.available,
    clients: p.clients,
    revenue: p.revenue,
    day_rate_eur: p.dayRate ?? 0,
    bio: p.bio,
    capabilities: p.capabilities,
    achievements: p.achievements,
    best_trait: p.bestTrait,
    vice: p.vice,
    wheel_position: p.wheelPosition,
    drivers: p.drivers,
    detractors: p.detractors,
    how_to_speak: p.howToSpeak,
    how_to_email: p.howToEmail,
  }));

  const { error: peopleError } = await sb
    .from("people")
    .upsert(peopleRows, { onConflict: "id" });

  if (peopleError) {
    return NextResponse.json(
      { error: `Seeding people failed: ${peopleError.message}` },
      { status: 500 },
    );
  }

  const capacityRows = Object.entries(capacityData).map(([id, c]) => ({
    person_id: Number(id),
    bench_days: c.benchDays,
    loyalty_score: c.loyaltyScore,
    risk_level: c.riskLevel,
    risk_reasons: c.riskReasons,
    recommended_action: c.recommendedAction,
    replacement_cost: c.replacementCost,
    lost_revenue_3_months: c.lostRevenue3Months,
    onboarding_cost: c.onboardingCost,
    key_client_at_risk: c.keyClientAtRisk,
    current_project: c.currentProject,
    burnout_risk: c.burnoutRisk,
  }));

  const { error: capacityError } = await sb
    .from("capacity_data")
    .upsert(capacityRows, { onConflict: "person_id" });

  if (capacityError) {
    return NextResponse.json(
      { error: `Seeding capacity_data failed: ${capacityError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    seeded: { people: peopleRows.length, capacity: capacityRows.length },
  });
}

export async function GET() {
  return NextResponse.json(
    { hint: "POST to this endpoint to seed the database." },
    { status: 405 },
  );
}
