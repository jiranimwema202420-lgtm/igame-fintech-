import { createClient } from "@/lib/supabase/server";
import type { Permission } from "./permissions";

export async function hasPermission(permission: Permission): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase.rpc("authorize", {
    requested_permission: permission,
  });

  if (error) {
    console.error("RBAC authorization error:", error);
    return false;
  }

  return data === true;
}

export async function requirePermission(permission: Permission): Promise<void> {
  const allowed = await hasPermission(permission);

  if (!allowed) {
    throw new Error("Forbidden");
  }
}
