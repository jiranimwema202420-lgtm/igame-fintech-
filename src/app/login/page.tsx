"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            captchaToken,
          },
        });

      if (signInError) {
        throw signInError;
      }

      const userId = data.user?.id;

      if (!userId) {
        throw new Error("Unable to determine the signed-in user.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Profile lookup error:", profileError);
        throw new Error("Unable to determine your account role.");
      }

      const roleRoutes: Record<string, string> = {
        super_admin: "/super-admin",
        admin: "/admin",
        manager: "/manager",
        staff: "/staff",
        compliance: "/compliance",
        analyst: "/analyst",
        player: "/player",
      };

      const role = profile?.role ?? "player";
      const destination = roleRoutes[role] ?? "/player";

      window.location.assign(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/player`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <GlassCard className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to access your dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Globe className="mr-2 h-5 w-5" />
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-slate-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-white/40"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-400"
              placeholder="********"
            />
          </div>

          <div className="flex justify-center py-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => {
                setCaptchaToken(token);
                setError(null);
              }}
              onExpire={() => {
                setCaptchaToken(null);
              }}
              onError={() => {
                setCaptchaToken(null);
                setError("Security verification failed. Please try again.");
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full rounded-xl bg-white/20 px-4 py-3 font-semibold hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {error ? (
          <p role="alert" className="text-center text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-slate-400 transition-colors hover:text-white"
          >
            Forgot your password?
          </Link>

          <p className="text-slate-400">
            Do not have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </GlassCard>
    </main>
  );
}
