import fs from "node:fs";

// 1. Auth Callback Route Handler (Official @supabase/ssr logic)
const callbackRoute = `import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Default to /update-password if no 'next' parameter is provided
  const next = searchParams.get('next') ?? '/update-password'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Safe to ignore if called from middleware or server component edge cases
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(\`\${origin}\${next}\`)
      } else if (forwardedHost) {
        return NextResponse.redirect(\`https://\${forwardedHost}\${next}\`)
      } else {
        return NextResponse.redirect(\`\${origin}\${next}\`)
      }
    }
  }

  // Redirect to an error page if code exchange fails or code is missing
  return NextResponse.redirect(\`\${origin}/login?error=Invalid%20or%20expired%20reset%20link\`)
}
`;

fs.mkdirSync("src/app/auth/callback", { recursive: true });
fs.writeFileSync("src/app/auth/callback/route.ts", callbackRoute);
console.log("1. Auth Callback Route Handler created.");

// 2. Forgot Password Page (Updated with siteUrl logic)
const forgotPasswordPage = `"use client";

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
      
      // Official logic: use env var or fallback to window.location.origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: \`\${siteUrl}/auth/callback?next=/update-password\`,
      });

      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
        <GlassCard className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-green-400">Check Your Email</h1>
          <p className="text-sm text-slate-300">
            We sent a password reset link to <span className="font-semibold text-white">{email}</span>.
          </p>
          <a href="/login" className="inline-block text-sm text-blue-400 hover:underline">
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
          <p className="text-sm text-slate-400 mt-2">Enter your email and we will send you a reset link.</p>
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
          <a href="/login" className="text-blue-400 hover:underline">Sign in</a>
        </p>
      </GlassCard>
    </main>
  );
}
`;

fs.mkdirSync("src/app/forgot-password", { recursive: true });
fs.writeFileSync("src/app/forgot-password/page.tsx", forgotPasswordPage);
console.log("2. Forgot Password page updated with official siteUrl logic.");

// 3. Update Password Page
const updatePasswordPage = `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(\`Error: \${error.message}\`);
      setIsError(true);
    } else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
      <GlassCard className="w-full max-w-md space-y-6">
        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4 w-full">
          <h2 className="text-2xl font-bold text-white text-center">Set New Password</h2>
          
          {message && (
            <p className={\`text-sm text-center \${isError ? "text-red-400" : "text-green-400"}\`}>
              {message}
            </p>
          )}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={6}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none text-white placeholder-slate-400"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </GlassCard>
    </main>
  );
}
`;

fs.mkdirSync("src/app/update-password", { recursive: true });
fs.writeFileSync("src/app/update-password/page.tsx", updatePasswordPage);
console.log("3. Update Password page created.");

console.log("\n✅ Official Supabase App Router Workflow Applied!");
