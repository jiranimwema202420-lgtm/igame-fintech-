"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSent(false);

    if (!captchaToken) {
      setError("Please complete the security check.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const redirectTo = `${siteUrl}/auth/callback?next=/update-password`;

      console.log("[Forgot Password] Reset request starting");
      console.log("[Forgot Password] Redirect URL:", redirectTo);
      console.log("[Forgot Password] CAPTCHA token present:", !!captchaToken);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo,
          captchaToken,
        },
      );

      if (resetError) {
        console.error("[Forgot Password] Supabase error:", resetError.message);
        throw resetError;
      }

      console.log("[Forgot Password] Reset email sent successfully");

      setSent(true);
      setCaptchaToken(null);
    } catch (err) {
      setCaptchaToken(null);

      setError(
        err instanceof Error ? err.message : "Failed to send reset link.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <GlassCard className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-green-400">
            Check Your Email
          </h1>

          <p className="text-sm text-slate-300">
            We sent a password reset link to{" "}
            <span className="font-semibold text-white">{email}</span>.
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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <GlassCard className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">Reset Password</h1>

          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder-slate-400"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />

          <div className="flex justify-center py-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onSuccess={(token) => {
                console.log(
                  "[Turnstile] Password reset verification successful",
                );
                setCaptchaToken(token);
                setError(null);
              }}
              onExpire={() => {
                console.log("[Turnstile] Password reset token expired");
                setCaptchaToken(null);
                setError("Security verification expired. Please verify again.");
              }}
              onError={(errorCode) => {
                console.error(
                  "[Turnstile] Password reset verification failed:",
                  errorCode,
                );
                setCaptchaToken(null);
                setError(
                  errorCode
                    ? `Security verification failed (${errorCode}).`
                    : "Security verification failed. Please try again.",
                );
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {error && (
          <p role="alert" className="text-center text-sm text-red-400">
            {error}
          </p>
        )}

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
