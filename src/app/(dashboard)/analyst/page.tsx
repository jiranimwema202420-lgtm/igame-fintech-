import { GlassCard } from "@/components/ui/GlassCard";

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
