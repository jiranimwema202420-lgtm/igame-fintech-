"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    console.log("[ForgotPassword Debug] Form submitted");
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("[ForgotPassword Debug] Creating Supabase client...");
      const supabase = createClient();
      console.log("[ForgotPassword Debug] Supabase client created");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      console.log("[ForgotPassword Debug] Supabase response:", { resetError });
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <GlassCard className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-sm text-slate-300">
            We sent a reset link to <span className="text-white">{email}</span>.
          </p>
          <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300">
            Back to login
          </Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <GlassCard className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Reset Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none"
            placeholder="Email"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white/20 px-4 py-3 font-semibold hover:bg-white/30 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {error && <p className="text-center text-sm text-red-300">{error}</p>}

        <p className="text-center text-sm text-slate-400">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
