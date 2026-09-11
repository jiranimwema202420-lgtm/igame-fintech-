import fs from "node:fs";
import path from "node:path";

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Created: " + filePath);
}

const files = {
  ".vscode/settings.json": `{
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
`,

  ".vscode/extensions.json": `{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
`,

  "src/types/app.ts": `export type AppRole = "admin" | "compliance" | "analyst" | "player";
`,

  "src/lib/utils.ts": `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,

  "src/lib/supabase/client.ts": `import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(url, anonKey);
}
`,

  "src/lib/supabase/server.ts": `import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component.
          // This can be ignored if middleware refreshes sessions.
        }
      }
    }
  });
}
`,

  "src/middleware.ts": `import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login"];
const staffPaths = ["/admin", "/compliance", "/analyst"];

const roleHome: Record<string, string> = {
  admin: "/admin",
  compliance: "/compliance",
  analyst: "/analyst",
  player: "/player"
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicPath = publicPaths.some(
    (item) => path === item || path.startsWith(item + "/")
  );

  if (!user) {
    if (isPublicPath) {
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);

    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "player";

  if (path === "/login" || path === "/") {
    return NextResponse.redirect(new URL(roleHome[role] ?? "/player", request.url));
  }

  const isStaffPath = staffPaths.some(
    (item) => path === item || path.startsWith(item + "/")
  );

  if (isStaffPath) {
    if (role === "admin") {
      return response;
    }

    const ownStaffPath = "/" + role;
    const isOwnStaffPath =
      path === ownStaffPath || path.startsWith(ownStaffPath + "/");

    if (!isOwnStaffPath) {
      return NextResponse.redirect(
        new URL(roleHome[role] ?? "/player", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"]
};
`,

  "src/components/ui/GlassCard.tsx": `import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-2xl p-6", className)} {...props} />;
}
`,

  "src/components/SignOutButton.tsx": `"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
      onClick={async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // Ignore sign-out errors and return to login.
        } finally {
          router.push("/login");
          router.refresh();
        }
      }}
    >
      Sign out
    </button>
  );
}
`,

  "src/app/layout.tsx": `import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "iGaming FinTech Glass Dashboard",
  description: "Glassmorphism dashboard with Supabase RBAC."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
`,

  "src/app/page.tsx": `import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">
            iGaming FinTech Glass Dashboard
          </h1>
          <p className="mt-2 text-slate-300">
            Role-based glassmorphism dashboard scaffold.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/login">
            <GlassCard>
              <h2 className="text-lg font-semibold">Login</h2>
              <p className="mt-2 text-sm text-slate-300">
                Authenticate with Supabase.
              </p>
            </GlassCard>
          </Link>

          <Link href="/admin">
            <GlassCard>
              <h2 className="text-lg font-semibold">Admin</h2>
              <p className="mt-2 text-sm text-slate-300">
                System administration workspace.
              </p>
            </GlassCard>
          </Link>

          <Link href="/compliance">
            <GlassCard>
              <h2 className="text-lg font-semibold">Compliance</h2>
              <p className="mt-2 text-sm text-slate-300">
                Risk and AML workspace.
              </p>
            </GlassCard>
          </Link>

          <Link href="/player">
            <GlassCard>
              <h2 className="text-lg font-semibold">Player</h2>
              <p className="mt-2 text-sm text-slate-300">
                Wallet and wager workspace.
              </p>
            </GlassCard>
          </Link>
        </div>
      </div>
    </main>
  );
}
`,

  "src/app/login/page.tsx": `"use client";

import { useState, type FormEvent } from "react";
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

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password
        });

      if (signInError) {
        throw signInError;
      }

      const userId = data.user?.id;
      let home = "/player";

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        const role = profile?.role;

        if (role === "admin") {
          home = "/admin";
        } else if (role === "compliance") {
          home = "/compliance";
        } else if (role === "analyst") {
          home = "/analyst";
        }
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
          <p className="mt-2 text-sm text-slate-300">
            Use your Supabase Auth account.
          </p>
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-white/40"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white/20 px-4 py-3 font-semibold hover:bg-white/30 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </GlassCard>
    </main>
  );
}
`,

  "src/app/(dashboard)/layout.tsx": `import Link from "next/link";
import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignOutButton } from "@/components/SignOutButton";

const navItems = [
  { href: "/admin", label: "Admin" },
  { href: "/compliance", label: "Compliance" },
  { href: "/analyst", label: "Analyst" },
  { href: "/player", label: "Player" }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <GlassCard className="h-fit space-y-4">
          <div>
            <h1 className="text-lg font-semibold">Glass Ops</h1>
            <p className="text-sm text-slate-300">
              iGaming FinTech Dashboard
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
              >
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
`,

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
  setBalance: (balance) => set({ balance })
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
        run: npm run typecheck

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

  "docs/supabase-setup.md": `# Supabase Setup

1. Create a Supabase project.
2. Copy the Project URL and anon key into .env.local.
3. Run supabase/migrations/0001_init.sql in the Supabase SQL Editor.
4. Create an Auth user in Supabase.
5. Insert a profile row for that user.

Example profile insert:

insert into public.profiles (id, email, role)
values ('AUTH_USER_UUID', 'admin@example.com', 'admin');
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

  "tests/.gitkeep": ``,
};

for (const [filePath, content] of Object.entries(files)) {
  writeFile(filePath, content);
}

const envContent =
  "NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\n";

fs.writeFileSync(".env.example", envContent);
console.log("Created: .env.example");

if (!fs.existsSync(".env.local")) {
  fs.writeFileSync(".env.local", envContent);
  console.log("Created: .env.local");
} else {
  console.log("Skipped: .env.local already exists");
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

const globalsPath = path.join("src", "app", "globals.css");

if (fs.existsSync(globalsPath)) {
  const currentCss = fs.readFileSync(globalsPath, "utf8");

  if (!currentCss.includes("/* Glassmorphism base */")) {
    fs.appendFileSync(globalsPath, css, "utf8");
    console.log("Appended: src/app/globals.css");
  } else {
    console.log("Skipped: globals.css already has glass styles");
  }
} else {
  fs.writeFileSync(globalsPath, css, "utf8");
  console.log("Created: src/app/globals.css");
}

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.scripts = pkg.scripts || {};
pkg.scripts.typecheck = "tsc --noEmit";
pkg.scripts.check = "npm run lint && npm run typecheck && npm run build";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("Updated: package.json scripts");

console.log("Application scaffold complete.");
