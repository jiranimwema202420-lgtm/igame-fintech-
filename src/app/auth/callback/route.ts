import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/update-password";

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
            } catch {
              // Safe to ignore if called from middleware or server component edge cases
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // FORCE CANONICAL DOMAIN: Prevents redirecting to protected Vercel Preview URLs
      const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";
      return NextResponse.redirect(`${canonicalUrl}${next}`);
    }
  }

  // Redirect to an error page if code exchange fails or code is missing
  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";
  return NextResponse.redirect(
    `${canonicalUrl}/login?error=Invalid%20or%20expired%20reset%20link`
  );
}
