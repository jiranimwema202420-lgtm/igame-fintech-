import { redirect } from "next/navigation";
import { hasPermission } from "./authorize";
import type { Permission } from "./permissions";

export async function requirePermissionOrRedirect(
  permission: Permission,
  redirectTo = "/player",
) {
  const allowed = await hasPermission(permission);

  if (!allowed) {
    redirect(redirectTo);
  }
}
