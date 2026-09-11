import { GlassCard } from "@/components/ui/GlassCard";

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
