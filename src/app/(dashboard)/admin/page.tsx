import { GlassCard } from "@/components/ui/GlassCard";

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
