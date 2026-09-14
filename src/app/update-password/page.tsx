"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`Error: ${error.message}`);
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
            <p className={`text-sm text-center ${isError ? "text-red-400" : "text-green-400"}`}>
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
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
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
