"use client";

import { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { depositFunds, withdrawFunds, placeBet } from "@/lib/actions/wallet-actions";
import { ArrowDownCircle, ArrowUpCircle, Zap, Loader2 } from "lucide-react";

export function WalletActions() {
  const [isPending, startTransition] = useTransition();
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAction = (action: "deposit" | "withdraw" | "bet", amount?: number) => {
    setMessage(null);
    const targetAmount = amount || parseFloat(customAmount);

    if (!targetAmount || isNaN(targetAmount) || targetAmount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }

    startTransition(async () => {
      let result;

      if (action === "deposit") {
        result = await depositFunds(targetAmount);
      } else if (action === "withdraw") {
        result = await withdrawFunds(targetAmount);
      } else {
        // Demo bet: 2x potential payout
        result = await placeBet(targetAmount, targetAmount * 2);
      }

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: action === "deposit" ? "Deposit successful" : action === "withdraw" ? "Withdrawal successful" : "Bet placed successfully",
        });
        setCustomAmount("");
      }
    });
  };

  return (
    <GlassCard className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <p className="text-sm text-slate-400">Atomic transactions with RLS protection.</p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[10, 50, 100, 500].map((amt) => (
          <button
            key={amt}
            onClick={() => setCustomAmount(String(amt))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              customAmount === String(amt)
                ? "border-blue-400/50 bg-blue-400/20 text-blue-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <input
        type="number"
        min="0"
        step="0.01"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        placeholder="Custom amount..."
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-white/40"
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleAction("deposit")}
          disabled={isPending}
          className="flex flex-col items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-4 text-sm font-medium text-green-300 transition-colors hover:bg-green-400/20 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowDownCircle className="h-5 w-5" />}
          Deposit
        </button>

        <button
          onClick={() => handleAction("withdraw")}
          disabled={isPending}
          className="flex flex-col items-center gap-2 rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-4 text-sm font-medium text-orange-300 transition-colors hover:bg-orange-400/20 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUpCircle className="h-5 w-5" />}
          Withdraw
        </button>

        <button
          onClick={() => handleAction("bet")}
          disabled={isPending}
          className="flex flex-col items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-4 py-4 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-400/20 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          Place Bet
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-400/10 text-green-300"
              : "bg-red-400/10 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </GlassCard>
  );
}
