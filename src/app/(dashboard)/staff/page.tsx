import { GlassCard } from "@/components/ui/GlassCard";
import { requireRole } from "@/lib/rbac/role-guard";
import { requirePermissionOrRedirect } from "@/lib/rbac/permission-guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export default async function StaffPage() {
  await requireRole(["super_admin", "admin", "manager", "staff"]);

  await requirePermissionOrRedirect(PERMISSIONS.ORDERS_VIEW, "/player");

  return (
    <div className="space-y-4">
      <GlassCard>
        <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Day-to-day operations, customer activity, wagers, orders, and assigned
          workflows.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-slate-300">Active Tasks</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Orders</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Wagers</h2>
          <p className="mt-2 text-3xl font-semibold">--</p>
        </GlassCard>
      </div>
    </div>
  );
}
