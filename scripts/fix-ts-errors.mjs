import fs from "node:fs";

const code = `import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/player";

  if (code) {
    const response = NextResponse.redirect(\`\${origin}\${next}\`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get("cookie")
              ?.split("; ")
              .map((c: string) => {
                const [name, ...rest] = c.split("=");
                return { name, value: rest.join("=") };
              }) ?? [];
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach((cookie: any) => {
              response.cookies.set(cookie.name, cookie.value, cookie.options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(\`\${origin}/login?error=Could not authenticate user\`);
}
`;

fs.writeFileSync("src/app/auth/callback/route.ts", code);
console.log("TypeScript types fixed in auth callback route.");
