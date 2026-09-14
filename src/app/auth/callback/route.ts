import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/update-password";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the canonical production origin, not the preview origin.
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";
  return NextResponse.redirect(
    `${siteUrl}/login?error=Could+not+authenticate+user`
  );
}
