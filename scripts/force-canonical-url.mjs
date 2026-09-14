import fs from "node:fs";

// ============================================================
// 1. Rewrite get-url.ts (Canonical Domain with Hardcoded Fallback)
// ============================================================
const utilsDir = "src/lib/utils";
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

fs.writeFileSync(
  `${utilsDir}/get-url.ts`,
  `export const getURL = (): string => {
  // Use the environment variable if set, otherwise fall back to production URL.
  // This guarantees email links NEVER point to a Vercel Preview URL.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";

  // Ensure trailing slash
  return siteUrl.endsWith("/") ? siteUrl : \`\${siteUrl}/\`;
};
`,
);
console.log("1. Rewrote get-url.ts with canonical domain fallback.");

// ============================================================
// 2. Rewrite forgot-password/page.tsx (Use siteUrl directly)
// ============================================================
const forgotPath = "src/app/forgot-password/page.tsx";

const forgotCode = `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    try {
      const supabase = createClient();

      // Canonical domain: use env var, fall back to production URL.
      // NEVER use window.location.origin (it resolves to preview URLs).
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://igame-fintrack.vercel.app";

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: \`\${siteUrl}/auth/callback?next=/update-password\`,
        }
      );

      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
        <GlassCard className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-green-400">
            Check Your Email
          </h1>
          <p className="text-sm text-slate-300">
            We sent a password reset link to{" "}
            <span className="font-semibold text-white">{email}</span>. Click the
            link in the email to set a new password.
          </p>
          <a
            href="/login"
            className="inline-block text-sm text-blue-400 hover:underline"
          >
            Back to Sign In
          </a>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
      <GlassCard className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">Reset Password</h1>
          <p className="text-sm text-slate-400 mt-2">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none text-white placeholder-slate-400"
            placeholder="you@example.com"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <p className="text-center text-sm text-slate-400">
          Remember your password?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Sign in
          </a>
        </p>
      </GlassCard>
    </main>
  );
}
`;

fs.writeFileSync(forgotPath, forgotCode);
console.log("2. Rewrote forgot-password page with canonical siteUrl.");

// ============================================================
// 3. Rewrite auth/callback/route.ts (Compatible cookie methods)
// ============================================================
const callbackCode = `import { createServerClient } from "@supabase/ssr";
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
      return NextResponse.redirect(\`\${siteUrl}\${next}\`);
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";
  return NextResponse.redirect(
    \`\${siteUrl}/login?error=Could+not+authenticate+user\`
  );
}
`;

fs.writeFileSync("src/app/auth/callback/route.ts", callbackCode);
console.log("3. Rewrote auth callback route with canonical redirect.");

console.log(
  "\n✅ All 3 files updated with canonical domain + hardcoded fallback.",
);
