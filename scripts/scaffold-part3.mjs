import fs from "node:fs";
import path from "node:path";

const files = {
  "src/app/(dashboard)/admin/page.tsx": `import { GlassCard } from "@/components/ui/GlassCard";

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Role assignments, financial approvals, audits, and user management.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-slate-300">Total Users</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Pending Approvals</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Audit Flags</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>
      </div>
    </div>
  );
}
`,

  "src/app/(dashboard)/compliance/page.tsx": `import { GlassCard } from "@/components/ui/GlassCard";

export default function CompliancePage() {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h1 className="text-2xl font-semibold">Compliance Dashboard</h1>
        <p className="mt-2 text-slate-300">
          KYC validation, fraud flags, and responsible gaming risk limits.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-slate-300">KYC Queue</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Fraud Flags</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Risk Limits</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>
      </div>
    </div>
  );
}
`,

  "src/app/(dashboard)/analyst/page.tsx": `import { GlassCard } from "@/components/ui/GlassCard";

export default function AnalystPage() {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h1 className="text-2xl font-semibold">Analyst Dashboard</h1>
        <p className="mt-2 text-slate-300">
          GGR/NGR performance, retention metrics, and market odds analytics.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-slate-300">GGR</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">NGR</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Retention</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>
      </div>
    </div>
  );
}
`,

  "src/app/(dashboard)/player/page.tsx": `import { GlassCard } from "@/components/ui/GlassCard";

export default function PlayerPage() {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h1 className="text-2xl font-semibold">Player Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Personal wallet, bet history, deposits, and withdrawals.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-slate-300">Balance</h2>
          <p className="mt-2 text-3xl font-semibold">$0.00</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Open Wagers</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Pending Withdrawals</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold">Recent Wagers</h2>
        <p className="mt-2 text-sm text-slate-300">
          Wager history table will be rendered here.
        </p>
      </GlassCard>
    </div>
  );
}
`,

  "src/store/wallet-store.ts": `import { create } from "zustand";

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
`,

  ".github/workflows/ci.yml": `name: CI

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest

    env:
      NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anon

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
`,

  "supabase/migrations/0001_init.sql": `create extension if not exists pgcrypto;

CREATE TYPE app_role AS ENUM ('admin', 'compliance', 'analyst', 'player');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role app_role DEFAULT 'player'::app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins manage all profiles"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
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

CREATE POLICY "Players view own wagers"
  ON public.wagers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff view all wagers"
  ON public.wagers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'compliance', 'analyst')
    )
  );
`,

  "docs/bug-handling.md": `# Bug Handling Workflow

## Severity Levels

- Critical: auth bypass, funds error, data loss
- High: core flow broken
- Medium: feature impaired
- Low: visual defect

## Engineering Rules

1. Reproduce before fixing.
2. Add a failing test when possible.
3. Fix root cause.
4. Verify locally.
5. Verify in preview deployment.
6. Add regression coverage.
`,
};

for (const [filePath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created: ${filePath}`);
}

const css = `

/* Glassmorphism base */
:root {
  color-scheme: dark;
}

body {
  background:
    radial-gradient(circle at top left, rgb(59 130 246 / 0.22), transparent 32%),
    radial-gradient(circle at top right, rgb(168 85 247 / 0.20), transparent 30%),
    radial-gradient(circle at bottom left, rgb(16 185 129 / 0.16), transparent 28%),
    #020617;
  color: #e2e8f0;
  min-height: 100vh;
}

.glass {
  border: 1px solid rgb(255 255 255 / 0.16);
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 0.14),
    rgb(255 255 255 / 0.05)
  );
  backdrop-filter: blur(18px);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.04),
    0 20px 50px rgb(2 6 23 / 0.45);
}

.glass-strong {
  border: 1px solid rgb(255 255 255 / 0.22);
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 0.22),
    rgb(255 255 255 / 0.08)
  );
  backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.06),
    0 25px 70px rgb(2 6 23 / 0.55);
}
`;

fs.appendFileSync(path.join("src", "app", "globals.css"), css, "utf8");
console.log("Appended: src/app/globals.css");

console.log("Part 3 scaffold complete.");
