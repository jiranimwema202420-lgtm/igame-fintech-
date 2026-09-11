"use server";

import { createClient } from "@/lib/supabase/server";

export type AdminActionResult = {
  success?: boolean;
  error?: string;
};

export async function settleWager(
  wagerId: string,
  status: "won" | "lost" | "cancelled",
  payout: number
): Promise<AdminActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Double-check role on the server side
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized: Admin access required" };
  }

  const { error } = await supabase.rpc("settle_wager", {
    wager_id: wagerId,
    final_status: status,
    final_payout: payout,
  });

  if (error) return { error: error.message };
  return { success: true };
}
