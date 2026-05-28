import { NextResponse } from "next/server";
import { getSupabaseRoute } from "../../lib/supabase-route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await getSupabaseRoute();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth/sign-in", request.url));
}

export async function GET(request: Request) {
  return POST(request);
}
