import "server-only";
import { Person } from "./people-data";
import { RateCardRow } from "./db";

// Lightweight role-band classifier. Maps a person's free-text role to one of
// the rate-card bands. Add new bands here as the team grows.
function classifyRoleBand(role: string): string {
  const r = role.toLowerCase();
  if (r.includes("client partner") || r.includes("engagement") || r.includes("account"))
    return "Engagement / Account";
  if (r.includes("data") || r.includes("strategy") || r.includes("consultant"))
    return "Strategy / Data";
  if (r.includes("design") || r.includes("ux") || r.includes("creative"))
    return "Design / UX";
  if (r.includes("delivery") || r.includes("programme") || r.includes("pm"))
    return "Delivery / PM";
  // default: anyone with "engineer", "architect", "tech", or otherwise lands
  // in Engineering.
  return "Engineering";
}

function classifySeniority(role: string): string {
  const r = role.toLowerCase();
  if (
    r.includes("director") ||
    r.includes("partner") ||
    r.includes("vp") ||
    r.includes("head of")
  )
    return "Director";
  if (r.includes("principal") || r.includes("lead") || r.includes("manager"))
    return "Principal";
  if (r.includes("senior")) return "Senior";
  if (r.includes("junior") || r.includes("graduate")) return "Junior";
  return "Mid";
}

export function resolvePersonDayRate(
  person: Pick<Person, "role" | "location" | "dayRate">,
  cards: RateCardRow[],
): number {
  if (person.dayRate && person.dayRate > 0) return person.dayRate;
  const roleBand = classifyRoleBand(person.role);
  const seniority = classifySeniority(person.role);
  // Exact match
  const exact = cards.find(
    (c) =>
      c.roleBand === roleBand &&
      c.seniority === seniority &&
      c.market === person.location,
  );
  if (exact) return exact.dayRateEur;
  // Fallback: any market, same role band + seniority
  const anyMarket = cards.find(
    (c) => c.roleBand === roleBand && c.seniority === seniority,
  );
  if (anyMarket) return anyMarket.dayRateEur;
  return 0;
}
