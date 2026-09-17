import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { requirePermissionOrRedirect } from "@/lib/rbac/permission-guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export default async function SettingsPage() {
  await requirePermissionOrRedirect(PERMISSIONS.SETTINGS_VIEW, "/player");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <ProfileSettingsForm
      userEmail={user.email || ""}
      userRole={profile?.role || "player"}
      memberSince={profile?.created_at || ""}
    />
  );
}
