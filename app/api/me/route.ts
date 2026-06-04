import { NextResponse } from "next/server";
import { getSupabaseRoute } from "../../lib/supabase-route";
import { roleForEmail } from "../../lib/roles";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sb = await getSupabaseRoute();
    const { data } = await sb.auth.getUser();
    const email = data.user?.email ?? null;
    const role = roleForEmail(email);
    return NextResponse.json({ email, role, signedIn: Boolean(email) });
  } catch (err) {
    return NextResponse.json({
      email: null,
      role: roleForEmail(null),
      signedIn: false,
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}
