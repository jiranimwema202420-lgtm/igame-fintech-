import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlayerDashboardClient } from "./PlayerDashboardClient";
import type { UserProfile, Wager } from "@/types/wager";

export default async function PlayerPage() {
  console.log("[PLAYER PAGE ENTERED]");
  const supabase = await createClient();

  let user = null;
let error = null;

try {
  const result = await supabase.auth.getUser();
  user = result.data.user;
  error = result.error;

  console.log("[PLAYER GETUSER DIAGNOSTIC]", {
    hasUser: !!user,
    userId: user?.id ?? null,
    error: error?.message ?? null,
    errorCode: error?.code ?? null,
  });
} catch (err) {
  console.error("[PLAYER GETUSER EXCEPTION]", {
    message: err instanceof Error ? err.message : String(err),
  });
  throw err;
}
  
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
  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

console.log("[PLAYER PROFILE DIAGNOSTIC]", {
  userId: user.id,
  hasProfile: !!profile,
  profileError: profileError?.message ?? null,
  profileErrorCode: profileError?.code ?? null,
});

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
