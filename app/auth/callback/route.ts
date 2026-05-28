import { NextResponse } from "next/server";
import { getSupabaseRoute } from "../../lib/supabase-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getSupabaseRoute();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    const failure = new URL("/auth/sign-in", origin);
    failure.searchParams.set("error", error.message);
    return NextResponse.redirect(failure);
  }

  // No code on the URL — bounce back to sign-in.
  return NextResponse.redirect(`${origin}/auth/sign-in`);
}
