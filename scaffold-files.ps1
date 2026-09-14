$AppPath = Get-Location

function Save-File {
    param ([string]$Path, [string]$Content)
    $FullPath = Join-Path $AppPath $Path
    $Dir = Split-Path $FullPath -Parent
    if (!(Test-Path $Dir)) { New-Item -ItemType Directory -Force -Path $Dir | Out-Null }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($FullPath, $Content, $utf8NoBom)
    Write-Host "Created: $Path" -ForegroundColor DarkCyan
}

# 10. SignOutButton
Save-File -Path "src/components/SignOutButton.tsx" -Content @'
"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
'@

# 11. Root Layout
Save-File -Path "src/app/layout.tsx" -Content @'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iGaming FinTech Glass Dashboard",
  description: "Glassmorphism iGaming and FinTech dashboard with Supabase RBAC.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
'@

# 12. Landing Page
Save-File -Path "src/app/page.tsx" -Content @'
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">iGaming FinTech Glass Dashboard</h1>
          <p className="mt-2 text-slate-300">Role-based glassmorphism dashboard scaffold.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/login"><GlassCard><h2 className="text-lg font-semibold">Login</h2><p className="mt-2 text-sm text-slate-300">Authenticate with Supabase.</p></GlassCard></Link>
          <Link href="/admin"><GlassCard><h2 className="text-lg font-semibold">Admin</h2><p className="mt-2 text-sm text-slate-300">System administration.</p></GlassCard></Link>
          <Link href="/compliance"><GlassCard><h2 className="text-lg font-semibold">Compliance</h2><p className="mt-2 text-sm text-slate-300">Risk & AML workspace.</p></GlassCard></Link>
          <Link href="/player"><GlassCard><h2 className="text-lg font-semibold">Player</h2><p className="mt-2 text-sm text-slate-300">Wallet & wagers.</p></GlassCard></Link>
        </div>
      </div>
    </main>
  );
}
'@

# 13. Login Page
Save-File -Path "src/app/login/page.tsx" -Content @'
"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const userId = data.user?.id;
      let home = "/player";
      if (userId) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
        const role = profile?.role;
        if (role === "admin") home = "/admin";
        else if (role === "compliance") home = "/compliance";
        else if (role === "analyst") home = "/analyst";
      }
      router.push(home);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <GlassCard className="w-full max-w-md space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-slate-300">Use your Supabase Auth account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none backdrop-blur-xl placeholder:text-slate-400 focus:border-white/40" placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none backdrop-blur-xl placeholder:text-slate-400 focus:border-white/40" placeholder="********" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-white/20 px-4 py-3 font-semibold hover:bg-white/30 disabled:opacity-60 transition-colors">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </GlassCard>
    </main>
  );
}
'@

# 14. Dashboard Layout
Save-File -Path "src/app/(dashboard)/layout.tsx" -Content @'
import Link from "next/link";
import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignOutButton } from "@/components/SignOutButton";

const navItems = [
  { href: "/admin", label: "Admin" },
  { href: "/compliance", label: "Compliance" },
  { href: "/analyst", label: "Analyst" },
  { href: "/player", label: "Player" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <GlassCard className="h-fit space-y-4">
          <div>
            <h1 className="text-lg font-semibold">Glass Ops</h1>
            <p className="text-sm text-slate-300">iGaming FinTech Dashboard</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <SignOutButton />
        </GlassCard>
        <main className="min-w-0 space-y-4">{children}</main>
      </div>
    </div>
  );
}
'@

Write-Host "Part 2 files created!" -ForegroundColor Green