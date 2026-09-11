import fs from "node:fs";
import path from "node:path";

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Created/Updated: " + filePath);
}

// 1. Admin Server Actions
writeFile(
  "src/lib/actions/admin-actions.ts",
  `"use server";

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
`,
);

// 2. Admin Settlement Table (Client Component with Realtime)
writeFile(
  "src/components/admin/WagerSettlementTable.tsx",
  `"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { settleWager } from "@/lib/actions/admin-actions";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Wager } from "@/types/wager";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface Props {
  initialWagers: Wager[];
}

export function WagerSettlementTable({ initialWagers }: Props) {
  const [wagers, setWagers] = useState<Wager[]>(initialWagers);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to live wagers
    const channel = supabase
      .channel("admin:wagers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wagers" },
        (payload) => {
          setWagers((current) => [payload.new as Wager, ...current]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wagers" },
        (payload) => {
          setWagers((current) =>
            current.map((w) => (w.id === (payload.new as Wager).id ? (payload.new as Wager) : w))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSettle = (wagerId: string, status: "won" | "lost", payout: number) => {
    setActionId(wagerId);
    startTransition(async () => {
      const result = await settleWager(wagerId, status, payout);
      if (result.error) {
        alert(result.error);
      }
      setActionId(null);
    });
  };

  const pendingWagers = wagers.filter((w) => w.status === "pending");
  const settledWagers = wagers.filter((w) => w.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Settlements */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold">Pending Settlements</h2>
          <p className="mt-1 text-sm text-slate-400">
            Live feed of bets waiting for approval.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Wager ID</th>
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Potential Payout</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pendingWagers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No pending wagers.
                  </td>
                </tr>
              ) : (
                pendingWagers.map((wager) => (
                  <tr key={wager.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {wager.id.split("-")[0]}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {wager.user_id.split("-")[0]}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${Number(wager.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      ${Number(wager.payout).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(wager.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSettle(wager.id, "won", Number(wager.payout))}
                          disabled={isPending && actionId === wager.id}
                          className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/30 disabled:opacity-50"
                        >
                          {actionId === wager.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                          Win
                        </button>
                        <button
                          onClick={() => handleSettle(wager.id, "lost", 0)}
                          disabled={isPending && actionId === wager.id}
                          className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
                        >
                          {actionId === wager.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          Lose
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Recently Settled */}
      <GlassCard className="p-0 overflow-hidden opacity-70">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold">Recently Settled</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Wager ID</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Final Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {settledWagers.slice(0, 5).map((wager) => (
                <tr key={wager.id}>
                  <td className="px-6 py-4 font-mono text-xs text-slate-300">
                    {wager.id.split("-")[0]}
                  </td>
                  <td className="px-6 py-4">${Number(wager.amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={\`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize \${
                      wager.status === "won" ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                    }\`}>
                      {wager.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">${Number(wager.payout).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
`,
);

// 3. Update Admin Page (Server Component)
writeFile(
  "src/app/(dashboard)/admin/page.tsx",
  `import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WagerSettlementTable } from "@/components/admin/WagerSettlementTable";
import type { Wager } from "@/types/wager";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify Admin Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/player");
  }

  // Fetch initial wagers
  const { data: wagers } = await supabase
    .from("wagers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Control Center</h1>
        <p className="mt-1 text-slate-400">
          Manage live wagers and financial settlements.
        </p>
      </div>

      <WagerSettlementTable initialWagers={(wagers as Wager[]) || []} />
    </div>
  );
}
`,
);

console.log("Admin Settlement Engine injection complete.");
