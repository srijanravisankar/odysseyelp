// import { type NextRequest, NextResponse } from "next/server";
// import { createServerClient, type CookieOptions } from "@supabase/ssr";

// export async function middleware(request: NextRequest) {
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             response.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // Redirect to login if user not authenticated and trying to access protected routes
//   if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return response;
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
// };

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Create a Supabase client bound to this request/response
function createClient(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        // read cookies from the incoming request
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // write any updated auth cookies to the outgoing response
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });

  return supabase;
}

export async function middleware(request: NextRequest) {
  // Start with a "pass-through" response
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

  // Routes that do NOT require auth
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // 1) If NOT logged in and trying to access a protected route → redirect to /login
  if (!user && !isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";

    // Optional: remember where they were trying to go
    redirectUrl.searchParams.set(
      "redirectTo",
      pathname + request.nextUrl.search
    );

    return NextResponse.redirect(redirectUrl);
  }

  // 2) If logged in and on /login or /signup → kick them to home (/)
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(redirectUrl);
  }

  // Otherwise proceed as normal
  return response;
}

export const config = {
  matcher: [
    // run middleware on all routes except Next internals / static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
