import { create } from "zustand";

type WalletState = {
  balance: number;
  currency: string;
  setBalance: (balance: number) => void;
};

export const useWalletStore = create<WalletState>()((set) => ({
  balance: 0,
  currency: "USD",
  setBalance: (balance) => set({ balance })
}));
