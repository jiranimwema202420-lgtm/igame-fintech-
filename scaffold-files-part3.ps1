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

# 15. Admin Page
Save-File -Path "src/app/(dashboard)/admin/page.tsx" -Content @'
import { GlassCard } from "@/components/ui/GlassCard";
export default function AdminPage() {
  return (
    <div className="space-y-4">
      <GlassCard><h1 className="text-2xl font-semibold">Admin Dashboard</h1><p className="mt-2 text-slate-300">Role assignments, financial approvals, audits, and user management.</p></GlassCard>
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard><h2 className="text-sm text-slate-300">Total Users</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">Pending Approvals</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">Audit Flags</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
      </div>
    </div>
  );
}
'@

# 16. Compliance Page
Save-File -Path "src/app/(dashboard)/compliance/page.tsx" -Content @'
import { GlassCard } from "@/components/ui/GlassCard";
export default function CompliancePage() {
  return (
    <div className="space-y-4">
      <GlassCard><h1 className="text-2xl font-semibold">Compliance Dashboard</h1><p className="mt-2 text-slate-300">KYC validation, fraud flags, and responsible gaming risk limits.</p></GlassCard>
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard><h2 className="text-sm text-slate-300">KYC Queue</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">Fraud Flags</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">Risk Limits</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
      </div>
    </div>
  );
}
'@

# 17. Analyst Page
Save-File -Path "src/app/(dashboard)/analyst/page.tsx" -Content @'
import { GlassCard } from "@/components/ui/GlassCard";
export default function AnalystPage() {
  return (
    <div className="space-y-4">
      <GlassCard><h1 className="text-2xl font-semibold">Analyst Dashboard</h1><p className="mt-2 text-slate-300">GGR/NGR performance, retention metrics, and market odds analytics.</p></GlassCard>
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard><h2 className="text-sm text-slate-300">GGR</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">NGR</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">Retention</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
      </div>
    </div>
  );
}
'@

# 18. Player Page
Save-File -Path "src/app/(dashboard)/player/page.tsx" -Content @'
import { GlassCard } from "@/components/ui/GlassCard";
export default function PlayerPage() {
  return (
    <div className="space-y-4">
      <GlassCard><h1 className="text-2xl font-semibold">Player Dashboard</h1><p className="mt-2 text-slate-300">Personal wallet, bet history, deposits, and withdrawals.</p></GlassCard>
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard><h2 className="text-sm text-slate-300">Balance</h2><p className="mt-2 text-3xl font-semibold">$0.00</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">Open Wagers</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
        <GlassCard><h2 className="text-sm text-slate-300">Pending Withdrawals</h2><p className="mt-2 text-3xl font-semibold">--</p></GlassCard>
      </div>
      <GlassCard><h2 className="text-lg font-semibold">Recent Wagers</h2><p className="mt-2 text-sm text-slate-300">Wager history table will be rendered here.</p></GlassCard>
    </div>
  );
}
'@

# 19. Zustand Store
Save-File -Path "src/store/wallet-store.ts" -Content @'
import { create } from "zustand";

type WalletState = {
  balance: number;
  currency: string;
  setBalance: (balance: number) => void;
};

export const useWalletStore = create<WalletState>()((set) => ({
  balance: 0,
  currency: "USD",
  setBalance: (balance) => set({ balance }),
}));
'@

# 20. GitHub Actions CI
Save-File -Path ".github/workflows/ci.yml" -Content @'
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
jobs:
  quality:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anon
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck || npx tsc --noEmit
      - run: npm run build
'@

# 21. Supabase Migration
Save-File -Path "supabase/migrations/0001_init.sql" -Content @'
create extension if not exists pgcrypto;
CREATE TYPE app_role AS ENUM ('admin', 'compliance', 'analyst', 'player');
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role app_role DEFAULT 'player'::app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins manage all profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE TABLE public.wagers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payout NUMERIC(12, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.wagers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players view own wagers" ON public.wagers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff view all wagers" ON public.wagers FOR SELECT USING (