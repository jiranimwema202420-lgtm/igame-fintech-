"use client";

import { useEffect, useMemo } from "react";

import { WalletActions } from "@/components/wallet/WalletActions";
import { createClient } from "@/lib/supabase/client";
import { useWalletStore } from "@/store/wallet-store";
import type { UserProfile, Wager } from "@/types/wager";

type PlayerDashboardClientProps = {
  initialProfile: UserProfile;
  initialWagers: Wager[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statusStyles: Record<Wager["status"], string> = {
  pending: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  won: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  lost: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  cancelled: "border-slate-300/30 bg-slate-300/10 text-slate-100",
};

function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function PlayerDashboardClient({
  initialProfile,
  initialWagers,
}: PlayerDashboardClientProps) {
  const supabase = useMemo(() => createClient(), []);
  const {
    balance,
    wagers,
    isRealtimeConnected,
    setInitialData,
    addWager,
    updateWager,
    deleteWager,
    updateBalance,
    setRealtimeConnected,
  } = useWalletStore();

  useEffect(() => {
    setInitialData(initialProfile, initialWagers);
  }, [initialProfile, initialWagers, setInitialData]);

  useEffect(() => {
    const profileChannel = supabase
      .channel(`player-profile-${initialProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${initialProfile.id}`,
        },
        (payload) => {
          updateBalance(Number((payload.new as UserProfile).balance));
        },
      )
      .subscribe();

    const wagersChannel = supabase
      .channel(`player-wagers-${initialProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wagers",
          filter: `user_id=eq.${initialProfile.id}`,
        },
        (payload) => {
          addWager(payload.new as Wager);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wagers",
          filter: `user_id=eq.${initialProfile.id}`,
        },
        (payload) => {
          updateWager(payload.new as Wager);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "wagers",
          filter: `user_id=eq.${initialProfile.id}`,
        },
        (payload) => {
          deleteWager((payload.old as Wager).id);
        },
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(wagersChannel);
      setRealtimeConnected(false);
    };
  }, [
    addWager,
    deleteWager,
    initialProfile.id,
    setRealtimeConnected,
    supabase,
    updateBalance,
    updateWager,
  ]);

  const wagerStats = useMemo(() => {
    return wagers.reduce(
      (stats, wager) => {
        const amount = Number(wager.amount);
        const payout = Number(wager.payout);

        stats.totalStaked += amount;
        stats[wager.status] += 1;

        if (wager.status !== "pending") {
          stats.totalPayout += payout;
        }

        return stats;
      },
      {
        totalStaked: 0,
        totalPayout: 0,
        pending: 0,
        won: 0,
        lost: 0,
        cancelled: 0,
      },
    );
  }, [wagers]);

  return (
    <section className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Player Wallet
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Welcome back, {initialProfile.email}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage funds, place wagers, and watch account activity update in
              real time.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <span
              className={
                isRealtimeConnected ? "text-emerald-200" : "text-amber-200"
              }
            >
              {isRealtimeConnected ? "Realtime connected" : "Connecting"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-6 md:col-span-2">
          <h2 className="text-sm text-slate-300">Available Balance</h2>
          <p className="mt-2 text-4xl font-semibold">
            {formatCurrency(balance)}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Deposits, withdrawals, and wagers settle against this wallet.
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm text-slate-300">Open Wagers</h2>
          <p className="mt-2 text-3xl font-semibold">{wagerStats.pending}</p>
          <p className="mt-2 text-xs text-slate-400">
            Waiting for settlement.
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm text-slate-300">Net Winnings</h2>
          <p className="mt-2 text-3xl font-semibold">
            {formatCurrency(wagerStats.totalPayout - wagerStats.totalStaked)}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Across visible wager history.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Wallet Actions</h2>
          <p className="mt-2 text-sm text-slate-300">
            Use quick amounts or enter a custom value.
          </p>
          <div className="mt-5">
            <WalletActions balance={balance} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Wager History</h2>
              <p className="mt-1 text-sm text-slate-300">
                Recent player wagers and settlement outcomes.
              </p>
            </div>
            <p className="text-sm text-slate-400">{wagers.length} total</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            {wagers.length === 0 ? (
              <div className="bg-white/5 p-6 text-sm text-slate-300">
                No wagers yet. Place a bet to start your history.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {wagers.slice(0, 12).map((wager) => (
                  <div
                    key={wager.id}
                    className="grid gap-3 bg-white/5 p-4 text-sm md:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <div>
                      <p className="font-medium">
                        Wager {wager.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(wager.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Stake
                      </p>
                      <p className="mt-1 font-medium">
                        {formatCurrency(wager.amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Payout
                      </p>
                      <p className="mt-1 font-medium">
                      {wager.status === "pending" ? "\u2014" : formatCurrency(wager.payout)}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles[wager.status]}`}
                      >
                        {wager.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
