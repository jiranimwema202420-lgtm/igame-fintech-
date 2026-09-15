import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/update-password";

  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);
  const verifierCookies = cookieNames.filter((name) =>
    name.includes("code-verifier"),
  );

  console.log("[AUTH CALLBACK] Cookie diagnostic:", {
    totalCookies: cookieNames.length,
    verifierCookies,
  });
  
  // FORCE CANONICAL URL: Prevents Vercel preview loops
  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintech-lovat.vercel.app";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // EXPOSE THE ERROR: Put the exact Supabase error message in the URL!
      return NextResponse.redirect(
        `${canonicalUrl}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    if (data.session) {
      return NextResponse.redirect(`${canonicalUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${canonicalUrl}/login?error=Missing_code_in_url`);
}
