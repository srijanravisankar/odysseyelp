// middleware.ts (in the project root, NOT in lib/)

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function createClient(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        // read cookies from the incoming request
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // write updated cookies to the outgoing response
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });

  return supabase;
}

export async function middleware(request: NextRequest) {
  // default "pass-through" response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes that should be accessible WITHOUT being logged in
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/landing") ||
    pathname.startsWith("/supabase"); // your test page, optional

  // 1) Not logged in & trying to access a protected route → send to /landing
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";

    // Optional: remember where they were trying to go
    url.searchParams.set("redirectTo", pathname + request.nextUrl.search);

    return NextResponse.redirect(url);
  }

  // 2) Logged in & trying to access an auth route → send to home (/)
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    const redirectTo = url.searchParams.get("redirectTo") || "/";
    url.searchParams.delete("redirectTo");
    url.pathname = redirectTo;
    return NextResponse.redirect(url);
  }

  // Otherwise just continue
  return response;
}

export const config = {
  matcher: [
    // run middleware on all routes EXCEPT:
    // - Next internals
    // - favicon
    // - most static images/assets by file extension
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
