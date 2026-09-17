import { GlassCard } from "@/components/ui/GlassCard";
import { requireRole } from "@/lib/rbac/role-guard";
import { requirePermissionOrRedirect } from "@/lib/rbac/permission-guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export default async function AdminPage() {
  // Only administrators and super administrators can access this page.
  await requireRole(["super_admin", "admin"]);

  // The user must also have permission to view users.
  await requirePermissionOrRedirect(PERMISSIONS.USERS_VIEW, "/player");

  return (
    <section className="space-y-6">
      <GlassCard>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-semibold">Admin Dashboard</h1>

          <p className="mt-2 text-slate-300">
            Role assignments, financial approvals, audits, and user management.
          </p>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm text-slate-300">Total Users</h2>

          <p className="mt-2 text-3xl font-semibold">--</p>

          <p className="mt-1 text-xs text-slate-400">
            User metrics will appear here.
          </p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Pending Approvals</h2>

          <p className="mt-2 text-3xl font-semibold">--</p>

          <p className="mt-1 text-xs text-slate-400">
            Approval metrics will appear here.
          </p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm text-slate-300">Audit Flags</h2>

          <p className="mt-2 text-3xl font-semibold">--</p>

          <p className="mt-1 text-xs text-slate-400">
            Audit metrics will appear here.
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold">User Management</h2>

          <p className="mt-2 text-sm text-slate-300">
            Manage authorized users, profiles, and role assignments.
          </p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold">Financial Operations</h2>

          <p className="mt-2 text-sm text-slate-300">
            Review financial activity, wager operations, approvals, and
            settlement workflows according to assigned permissions.
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
