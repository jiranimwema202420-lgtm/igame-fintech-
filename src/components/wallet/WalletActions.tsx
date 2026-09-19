"use client";

import { useState } from "react";
import {
  depositFunds,
  withdrawFunds,
  placeBet,
} from "@/lib/actions/wallet-actions";

type ActionType = "deposit" | "withdraw" | "bet";

interface WalletActionsProps {
  balance?: number;
}

export function WalletActions({ balance }: WalletActionsProps) {
  const [action, setAction] = useState<ActionType>("deposit");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const quickAmounts = [10, 25, 50, 100];

  const targetAmount = Number(customAmount || amount);

  async function handleAction() {
    setMessage("");

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (targetAmount > 100000) {
      setMessage("Amount too large.");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (action === "deposit") {
        result = await depositFunds(targetAmount);
      } else if (action === "withdraw") {
        result = await withdrawFunds(targetAmount);
      } else {
        result = await placeBet(targetAmount);
      }

      if (result.error) {
        setMessage(result.error);
        return;
      }

      setMessage(
        action === "deposit"
          ? "Deposit successful."
          : action === "withdraw"
            ? "Withdrawal successful."
            : "Bet placed successfully.",
      );

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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAction("deposit")}
          className={action === "deposit" ? "font-semibold" : ""}
        >
          Deposit
        </button>

        <button
          type="button"
          onClick={() => setAction("withdraw")}
          className={action === "withdraw" ? "font-semibold" : ""}
        >
          Withdraw
        </button>

        <button
          type="button"
          onClick={() => setAction("bet")}
          className={action === "bet" ? "font-semibold" : ""}
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
          placeholder="Custom amount"
        />
      </div>

      <button type="button" onClick={handleAction} disabled={loading}>
        {loading
          ? "Processing..."
          : action === "deposit"
            ? "Deposit"
            : action === "withdraw"
              ? "Withdraw"
              : "Place Bet"}
      </button>

      {message && <p role="status">{message}</p>}

      {balance !== undefined && <p>Current balance: ${balance.toFixed(2)}</p>}
    </div>
  );
}
