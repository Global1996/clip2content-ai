import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Copy session cookies and no-cache headers from the base `NextResponse` (where
 * Supabase applied setAll) onto another response (redirect / JSON).
 * Request cookies must never be mutated in middleware — that throws on the Edge (ReadonlyRequestCookiesError).
 */
function mergeSupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
  for (const headerName of ["cache-control", "expires", "pragma"] as const) {
    const v = from.headers.get(headerName);
    if (v) to.headers.set(headerName, v);
  }
}

export async function updateSession(request: NextRequest) {
  try {
    return await runSession(request);
  } catch (err) {
    console.error("[proxy/middleware session]", err);
    return NextResponse.next({ request });
  }
}

async function runSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const redirectAfterLogin = path + request.nextUrl.search;

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/api/generations") ||
    path.startsWith("/api/favorites") ||
    path === "/api/generate" ||
    path === "/api/usage" ||
    path === "/api/dashboard/data" ||
    path === "/api/checkout";

  if (isProtected && !user) {
    if (path.startsWith("/api")) {
      const apiResponse = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      mergeSupabaseCookies(response, apiResponse);
      return apiResponse;
    }
    let safeRedirect = redirectAfterLogin;
    if (safeRedirect.length > 1024) {
      safeRedirect = path.startsWith("/dashboard") ? "/dashboard" : path;
    }
    const loginUrl = new URL(request.url);
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", safeRedirect);
    const redirectResponse = NextResponse.redirect(loginUrl);
    mergeSupabaseCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (user && (path === "/login" || path === "/register")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    mergeSupabaseCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}