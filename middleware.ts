import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Set REQUIRE_AUTH=true on Vercel (Production / Preview / Development) when
// you're ready to lock the site down. Until then, this middleware is a no-op.
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === "true";

// Anything under these prefixes always passes the auth gate.
const OPEN_PATH_PREFIXES = ["/auth", "/api/auth", "/_next", "/favicon", "/fonts"];

export async function middleware(request: NextRequest) {
  if (!REQUIRE_AUTH) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (OPEN_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    "";

  if (!url || !anon) return NextResponse.next();

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/auth/sign-in";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
