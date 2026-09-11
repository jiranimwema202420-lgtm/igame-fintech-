import Link from "next/link";
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
