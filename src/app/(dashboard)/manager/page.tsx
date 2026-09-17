import { requirePermissionOrRedirect } from "@/lib/rbac/permission-guard";
import { requireRole } from "@/lib/rbac/role-guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export default async function ManagerPage() {
  await requireRole(["super_admin", "admin", "manager"]);
  await requirePermissionOrRedirect(PERMISSIONS.REPORTS_VIEW, "/player");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Manager Dashboard</h2>
        <p className="text-sm text-slate-400">
          Operational overview for managers and authorized administrators.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Operations</p>
          <p className="mt-2 text-xl font-semibold">Management</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Reports</p>
          <p className="mt-2 text-xl font-semibold">Available</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Access Level</p>
          <p className="mt-2 text-xl font-semibold">Manager</p>
        </div>
      </div>
    </section>
  );
}
