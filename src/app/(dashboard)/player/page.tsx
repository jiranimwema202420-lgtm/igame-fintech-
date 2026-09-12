import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlayerDashboardClient } from "./PlayerDashboardClient";
import type { UserProfile, Wager } from "@/types/wager";

export default async function PlayerPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div style={{padding: "50px", color: "white", backgroundColor: "black", minHeight: "100vh", fontFamily: "monospace"}}>
        <h1 style={{color: "red", fontSize: "24px"}}>🛑 INFINITE LOOP BROKEN</h1>
        <p style={{fontSize: "18px", marginTop: "20px"}}>The Server Component thinks you are NOT logged in (user is null).</p>
        <p>But the Middleware thought you WERE logged in, causing the redirect loop.</p>
        <h3 style={{marginTop: "30px", color: "#aaa"}}>Supabase Error Details:</h3>
        <pre style={{color: "yellow", fontSize: "16px", whiteSpace: "pre-wrap"}}>{error?.message || "No error object returned. The session cookie is likely missing or corrupted."}</pre>
      </div>
    );
  }

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
