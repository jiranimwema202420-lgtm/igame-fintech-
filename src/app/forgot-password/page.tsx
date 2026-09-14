"use client";

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
        redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
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
