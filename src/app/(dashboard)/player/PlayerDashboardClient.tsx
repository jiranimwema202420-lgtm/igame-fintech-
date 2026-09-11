"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWalletStore } from "@/store/wallet-store";
import { GlassCard } from "@/components/ui/GlassCard";
import type { UserProfile, Wager } from "@/types/wager";
import { Wallet, TrendingUp, Clock, Wifi, WifiOff } from "lucide-react";
import { WalletActions } from "@/components/wallet/WalletActions";

interface Props {
  initialProfile: UserProfile;
  initialWagers: Wager[];
}

export function PlayerDashboardClient({ initialProfile, initialWagers }: Props) {
  const { 
    balance, 
    wagers, 
    isLoading, 
    isRealtimeConnected,
    setInitialData, 
    addWager, 
    updateWager, 
    deleteWager, 
    updateBalance,
    setRealtimeConnected 
  } = useWalletStore();

  useEffect(() => {
    // 1. Hydrate Zustand store with Server Component data
    setInitialData(initialProfile, initialWagers);

    // 2. Setup Supabase Realtime
    const supabase = createClient();
    
    const wagersChannel = supabase
      .channel('public:wagers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wagers' }, (payload) => {
        addWager(payload.new as Wager);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wagers' }, (payload) => {
        updateWager(payload.new as Wager);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'wagers' }, (payload) => {
        deleteWager(payload.old.id);
      })
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    const profilesChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${initialProfile.id}`
      }, (payload) => {
        updateBalance(payload.new.balance);
      })
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(wagersChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [initialProfile, initialWagers, setInitialData, addWager, updateWager, deleteWager, updateBalance, setRealtimeConnected]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-green-400 bg-green-400/10';
      case 'lost': return 'text-red-400 bg-red-400/10';
      case 'cancelled': return 'text-slate-400 bg-slate-400/10';
      default: return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-white/5 border border-white/10" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/5 border border-white/10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Connection Status */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Player Dashboard</h1>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${isRealtimeConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isRealtimeConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isRealtimeConnected ? 'Live' : 'Reconnecting...'}
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="flex items-center gap-3 text-slate-300">
            <Wallet className="h-5 w-5" />
            <h2 className="text-sm font-medium">Available Balance</h2>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight">
            {formatCurrency(balance)}
          </p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-500/20 blur-2xl" />
          <div className="flex items-center gap-3 text-slate-300">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-sm font-medium">Open Wagers</h2>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight">
            {wagers.filter(w => w.status === 'pending').length}
          </p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl" />
          <div className="flex items-center gap-3 text-slate-300">
            <Clock className="h-5 w-5" />
            <h2 className="text-sm font-medium">Total Wagers</h2>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight">
            {wagers.length}
          </p>
        </GlassCard>
      </div>

      {/* Wallet Actions */}
      <WalletActions />

      {/* Wagers Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold">Recent Wagers</h2>
          <p className="mt-1 text-sm text-slate-400">Live feed of your betting history.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Potential Payout</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {wagers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No wagers found. Place your first bet to see live updates here.
                  </td>
                </tr>
              ) : (
                wagers.map((wager) => (
                  <tr key={wager.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {wager.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(Number(wager.amount))}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatCurrency(Number(wager.payout))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(wager.status)}`}>
                        {wager.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(wager.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
