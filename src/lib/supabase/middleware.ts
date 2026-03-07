import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "codehunters.dev";

/**
 * Copy any cookies set by Supabase (e.g. refreshed tokens) onto the redirect
 * response so the browser always receives up-to-date auth cookies even when
 * we short-circuit with a redirect instead of returning the next() response.
 * Without this, a refreshed access-token is silently dropped and the old
 * (consumed) refresh-token stays in the browser → infinite redirect loop.
 */
function withSessionCookies(redirect: NextResponse, session: NextResponse): NextResponse {
  session.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirect;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Canonical host redirect: only redirect www.codehunters.dev -> codehunters.dev.
  // Avoid redirecting arbitrary "www.*" hosts (e.g. preview/testing domains).
  const host = (request.headers.get("host") || "").toLowerCase();
  if (host === `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // Skip auth checks if Supabase is not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always use getUser() instead of getSession() for server-side auth validation.
  // getSession() reads from the cookie without server-side verification and is
  // not safe for protecting routes — see Supabase SSR docs.
  let user: { id: string } | null = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Don't fail the entire request when auth provider is temporarily unavailable.
    user = null;
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return withSessionCookies(NextResponse.redirect(url), response);
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return withSessionCookies(NextResponse.redirect(url), response);
    }

    // Check admin role via profile
    let profile: { role: string } | null = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      profile = data;
    } catch {
      profile = null;
    }

    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/my-learning";
      return withSessionCookies(NextResponse.redirect(url), response);
    }
  }

  // Redirect authenticated users away from auth pages.
  // Skip if an ?error param is present — that signals a loop-breaking redirect
  // from the dashboard (e.g. missing profile, DB error) and we must NOT send
  // them back to the dashboard again or we create an infinite redirect loop.
  const hasErrorParam = request.nextUrl.searchParams.has("error");
  if (
    user &&
    !hasErrorParam &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/my-learning";
    return withSessionCookies(NextResponse.redirect(url), response);
  }

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
