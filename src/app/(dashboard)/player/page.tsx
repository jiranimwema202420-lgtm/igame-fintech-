import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlayerDashboardClient } from "./PlayerDashboardClient";
import type { UserProfile, Wager } from "@/types/wager";

export default async function PlayerPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch initial data securely via Server Component + RLS
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: wagers } = await supabase
    .from("wagers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!profile) redirect("/login");

  return (
    <PlayerDashboardClient 
      initialProfile={profile as UserProfile} 
      initialWagers={(wagers as Wager[]) || []} 
    />
  );
}
