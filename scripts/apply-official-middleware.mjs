import fs from "node:fs";
import path from "node:path";

// 1. Create the Supabase Middleware Helper
const helperDir = "src/lib/supabase";
if (!fs.existsSync(helperDir)) {
  fs.mkdirSync(helperDir, { recursive: true });
}

const helperCode = `import { createServerClient } from "@supabase/ssr";
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

  // Revalidate the token against the Supabase Auth server.
  // ALWAYS use getUser() instead of getSession() in server context for security.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that do NOT require authentication
  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/update-password") || // CRITICAL: Allows user to reach the reset form
    pathname.startsWith("/auth");               // CRITICAL: Allows /auth/callback to process

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
`;

fs.writeFileSync(path.join(helperDir, "middleware.ts"), helperCode);
console.log("✅ Created src/lib/supabase/middleware.ts");

// 2. Create the Root Middleware
const rootMiddlewareCode = `import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Common static assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
`;

fs.writeFileSync("src/middleware.ts", rootMiddlewareCode);
console.log("✅ Created src/middleware.ts");

console.log(
  "\n🎉 Official Supabase Middleware applied with /update-password fix!",
);
