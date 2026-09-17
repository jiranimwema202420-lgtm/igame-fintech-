import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { AppRole } from "./roles";

export async function requireRole(allowedRoles: AppRole[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Role lookup error:", error);
    redirect("/login");
  }

  if (!profile?.role || !allowedRoles.includes(profile.role as AppRole)) {
    redirect("/player");
  }

  return {
    user,
    role: profile.role as AppRole,
  };
}
