import { GlassCard } from "@/components/ui/GlassCard";

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
