import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const redirectAfterLogin =
    path + request.nextUrl.search;

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/api/generations") ||
    path === "/api/generate" ||
    path === "/api/usage" ||
    path === "/api/dashboard/data" ||
    path === "/api/checkout";

  if (isProtected && !user) {
    if (path.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let safeRedirect = redirectAfterLogin;
    if (safeRedirect.length > 1024) {
      safeRedirect = path.startsWith("/dashboard") ? "/dashboard" : path;
    }
    const loginUrl = new URL(request.url);
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", safeRedirect);
    return NextResponse.redirect(loginUrl);
  }

  if (
    user &&
    (path === "/login" || path === "/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
