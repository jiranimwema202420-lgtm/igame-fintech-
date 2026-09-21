"use client";

import { useState } from "react";
import { placeBet } from "@/lib/actions/wallet-actions";

interface WalletActionsProps {
  balance?: number;
}

export function WalletActions({ balance }: WalletActionsProps) {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const quickAmounts = [10, 25, 50, 100];
  const targetAmount = Number(customAmount || amount);

  async function handlePlaceBet() {
    setMessage("");

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setMessage("Enter a valid bet amount.");
      return;
    }

    if (targetAmount > 100000) {
      setMessage("Amount too large.");
      return;
    }

    if (balance !== undefined && targetAmount > balance) {
      setMessage("Insufficient balance to place this bet.");
      return;
    }

    setLoading(true);

    try {
      const result = await placeBet(targetAmount);

      if (result.error) {
        setMessage(result.error);
        return;
      }

      setMessage("Bet placed successfully.");
      setAmount("");
      setCustomAmount("");
    } catch (error) {
      console.error("[WalletActions]", error);
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg px-3 py-2 text-sm font-medium text-slate-500"
          title="Deposit flow is not enabled yet"
        >
          Deposit
        </button>

        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg px-3 py-2 text-sm font-medium text-slate-500"
          title="Withdrawal flow is not enabled yet"
        >
          Withdraw
        </button>

        <button
          type="button"
          className="rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white"
        >
          Place Bet
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => {
              setAmount(String(quickAmount));
              setCustomAmount("");
            }}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              amount === String(quickAmount)
                ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            ${quickAmount}
          </button>
        ))}
      </div>

      <div>
        <input
          type="number"
          min="0"
          max="100000"
          step="0.01"
          value={customAmount}
          onChange={(event) => {
            setCustomAmount(event.target.value);
            setAmount("");
          }}
          placeholder="Bet amount"
          className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-300/50"
        />
      </div>

      <button
        type="button"
        onClick={handlePlaceBet}
        disabled={loading}
        className="w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Placing Bet..." : "Place Bet"}
      </button>

      {message && (
        <p
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
          role="status"
        >
          {message}
        </p>
      )}

      {balance !== undefined && (
        <p className="text-sm text-slate-300">
          Current balance: ${balance.toFixed(2)}
        </p>
      )}

      <p className="text-xs text-slate-500">
        Deposits and withdrawals will be available once the payment and
        withdrawal workflows are enabled.
      </p>
    </div>
  );
}
