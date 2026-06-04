/**
 * Roles + access gates.
 *
 * Humyn uses six roles. Most of the platform is open to everyone; sensitive
 * fields (day rates, salaries, financial €) are gated by role.
 *
 * The email → role map below is the single source of truth until we wire a
 * proper `user_roles` table. Add new users here.
 *
 * Demo override: in the browser, users can switch their view-as role from the
 * top-chrome user menu. That override only affects what they see — it cannot
 * grant them access they don't already have on the server side.
 */

export const ROLES = [
  "admin",
  "c-suite",
  "capacity-manager",
  "hiring-manager",
  "sales",
  "bdm",
  "viewer",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  "c-suite": "C-suite",
  "capacity-manager": "Capacity Manager",
  "hiring-manager": "Hiring Manager",
  sales: "Sales",
  bdm: "BDM",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  admin: "Full access including rate-card administration and roles.",
  "c-suite": "Full read access including all financial and salary data.",
  "capacity-manager":
    "Operational view — utilisation, briefs, bench, day rates. Hides salaries.",
  "hiring-manager": "Pipeline + people directory. Hides financial data.",
  sales: "Pipeline + brief portfolio. Hides salaries and cost data.",
  bdm: "Pipeline + opportunities. Hides salaries and internal cost data.",
  viewer: "Read-only access to public profile data.",
};

const DEFAULT_ROLE: Role = "capacity-manager";

// Single source of truth until we wire a Supabase roles table.
const EMAIL_TO_ROLE: Record<string, Role> = {
  "ryan.connolly@valtech.com": "admin",
};

export function roleForEmail(email: string | null | undefined): Role {
  if (!email) return DEFAULT_ROLE;
  return EMAIL_TO_ROLE[email.toLowerCase()] ?? DEFAULT_ROLE;
}

// ─── access gates ─────────────────────────────────────────────────────

/** Can see aggregate financial data (€M revenue, margin, leakage figures). */
export function canSeeFinancials(role: Role): boolean {
  return role === "admin" || role === "c-suite";
}

/** Can see per-person day rates (rate card output). */
export function canSeeDayRate(role: Role): boolean {
  return (
    role === "admin" ||
    role === "c-suite" ||
    role === "capacity-manager" ||
    role === "sales" ||
    role === "bdm"
  );
}

/** Can see per-person individual salary / compensation. */
export function canSeeSalary(role: Role): boolean {
  return role === "admin" || role === "c-suite";
}

/** Can see cost figures on the capacity dashboard (replacement cost, lost revenue). */
export function canSeeCosts(role: Role): boolean {
  return role === "admin" || role === "c-suite" || role === "capacity-manager";
}

/** Can edit the rate card. */
export function canEditRateCard(role: Role): boolean {
  return role === "admin";
}

/** Can access the Executive environment. */
export function canAccessExecutive(role: Role): boolean {
  return role === "admin" || role === "c-suite";
}

/** Can edit a person's profile. */
export function canEditPeople(role: Role): boolean {
  return role === "admin" || role === "capacity-manager" || role === "hiring-manager";
}
