import { GlassCard } from "@/components/ui/GlassCard";
import { requireRole } from "@/lib/rbac/role-guard";
import { requirePermissionOrRedirect } from "@/lib/rbac/permission-guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export default async function SuperAdminPage() {
  await requireRole(["super_admin"]);

  await requirePermissionOrRedirect(PERMISSIONS.ROLES_MANAGE, "/player");

  return (
    <div className="space-y-4">
      <GlassCard>
        <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Full system control, role management, security configuration, and
          platform administration.
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-slate-300">System Control</h2>
          <p className="mt-2 text-3xl font-semibold">Active</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Role Management</h2>
          <p className="mt-2 text-3xl font-semibold">Enabled</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Security</h2>
          <p className="mt-2 text-3xl font-semibold">Protected</p>
        </GlassCard>
      </div>
    </div>
  );
}
