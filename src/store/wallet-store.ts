import { create } from "zustand";
import type { Wager, UserProfile } from "@/types/wager";

type WalletState = {
  balance: number;
  wagers: Wager[];
  isLoading: boolean;
  isRealtimeConnected: boolean;
  
  // Actions
  setInitialData: (profile: UserProfile, wagers: Wager[]) => void;
  addWager: (wager: Wager) => void;
  updateWager: (wager: Wager) => void;
  deleteWager: (id: string) => void;
  updateBalance: (newBalance: number) => void;
  setRealtimeConnected: (status: boolean) => void;
};

export const useWalletStore = create<WalletState>()((set) => ({
  balance: 0,
  wagers: [],
  isLoading: true,
  isRealtimeConnected: false,

  setInitialData: (profile, wagers) =>
    set({
      balance: Number(profile.balance),
      wagers,
      isLoading: false,
    }),

  addWager: (wager) =>
    set((state) => ({
      wagers: [wager, ...state.wagers],
    })),

  updateWager: (wager) =>
    set((state) => ({
      wagers: state.wagers.map((w) => (w.id === wager.id ? wager : w)),
    })),

  deleteWager: (id) =>
    set((state) => ({
      wagers: state.wagers.filter((w) => w.id !== id),
    })),

  updateBalance: (newBalance) => set({ balance: Number(newBalance) }),
  setRealtimeConnected: (status) => set({ isRealtimeConnected: status }),
}));
