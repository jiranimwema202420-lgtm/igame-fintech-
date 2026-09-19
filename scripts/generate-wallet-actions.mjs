import fs from "node:fs";
import path from "node:path";

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Created/Updated: " + filePath);
}

// 1. Server Actions
writeFile(
  "src/lib/actions/wallet-actions.ts",
  `"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const amountSchema = z
  .number({
    message: "Amount must be a number",
  })
  .positive("Amount must be positive")
  .max(100000, "Amount too large");

export type ActionResult = {
  success?: boolean;
  error?: string;
};

export async function depositFunds(amount: number): Promise<ActionResult> {
  const parsed = amountSchema.safeParse(amount);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid amount",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.rpc("deposit_funds", {
    amount: parsed.data,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function withdrawFunds(amount: number): Promise<ActionResult> {
  const parsed = amountSchema.safeParse(amount);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid amount",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.rpc("withdraw_funds", {
    amount: parsed.data,
  });

  if (error) {
    if (error.message.includes("Insufficient balance")) {
      return { error: "Insufficient balance for withdrawal" };
    }

    return { error: error.message };
  }

  return { success: true };
}

export async function placeBet(amount: number): Promise<ActionResult> {
  const parsed = amountSchema.safeParse(amount);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid amount",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.rpc("place_bet", {
    bet_amount: parsed.data,
  });

  if (error) {
    if (error.message.includes("Insufficient balance")) {
      return { error: "Insufficient balance to place this bet" };
    }

    return { error: error.message };
  }

  return { success: true };
}
`,
);

// 2. Wallet Actions UI Component
writeFile(
  "src/components/wallet/WalletActions.tsx",
  `"use client";

import { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  depositFunds,
  withdrawFunds,
  placeBet,
} from "@/lib/actions/wallet-actions";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Zap,
  Loader2,
} from "lucide-react";

export function WalletActions() {
  const [isPending, startTransition] = useTransition();
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAction = (
    action: "deposit" | "withdraw" | "bet",
    amount?: number,
  ) => {
    setMessage(null);

    const targetAmount =
      amount !== undefined ? amount : parseFloat(customAmount);

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0 ||
      targetAmount > 100000
    ) {
      setMessage({
        type: "error",
        text:
          targetAmount > 100000
            ? "Amount too large"
            : "Please enter a valid amount",
      });
      return;
    }

    startTransition(async () => {
      let result;

      if (action === "deposit") {
        result = await depositFunds(targetAmount);
      } else if (action === "withdraw") {
        result = await withdrawFunds(targetAmount);
      } else {
        // Betting amount only.
        // The server/database determines the wager payout.
        result = await placeBet(targetAmount);
      }

      if (result.error) {
        setMessage({
          type: "error",
          text: result.error,
        });
      } else {
        setMessage({
          type: "success",
          text:
            action === "deposit"
              ? "Deposit successful"
              : action === "withdraw"
                ? "Withdrawal successful"
                : "Bet placed successfully",
        });

        setCustomAmount("");
      }
    });
  };

  return (
    <GlassCard className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <p className="text-sm text-slate-400">
          Atomic transactions with RLS protection.
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[10, 50, 100, 500].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setCustomAmount(String(amt))}
            disabled={isPending}
            className={\`rounded-lg border px-3 py-2 text-sm font-medium transition-colors \${
              customAmount === String(amt)
                ? "border-blue-400/50 bg-blue-400/20 text-blue-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }\`}
          >
            \${amt}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <input
        type="number"
        min="0"
        max="100000"
        step="0.01"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        placeholder="Custom amount..."
        disabled={isPending}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-white/40 disabled:opacity-50"
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleAction("deposit")}
          disabled={isPending}
          className="flex flex-col items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-4 text-sm font-medium text-green-300 transition-colors hover:bg-green-400/20 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowDownCircle className="h-5 w-5" />
          )}
          Deposit
        </button>

        <button
          type="button"
          onClick={() => handleAction("withdraw")}
          disabled={isPending}
          className="flex flex-col items-center gap-2 rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-4 text-sm font-medium text-orange-300 transition-colors hover:bg-orange-400/20 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUpCircle className="h-5 w-5" />
          )}
          Withdraw
        </button>

        <button
          type="button"
          onClick={() => handleAction("bet")}
          disabled={isPending}
          className="flex flex-col items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-4 py-4 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-400/20 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
          Place Bet
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          role="status"
          className={\`rounded-lg px-4 py-3 text-sm font-medium \${
            message.type === "success"
              ? "bg-green-400/10 text-green-300"
              : "bg-red-400/10 text-red-300"
          }\`}
        >
          {message.text}
        </div>
      )}
    </GlassCard>
  );
}
`,
);

// 3. Update Player Dashboard to include Wallet Actions
const playerClientPath = path.join(
  "src",
  "app",
  "(dashboard)",
  "player",
  "PlayerDashboardClient.tsx",
);

let playerContent = fs.readFileSync(playerClientPath, "utf8");

// Add import only if it does not already exist.
if (
  !playerContent.includes(
    'import { WalletActions } from "@/components/wallet/WalletActions";',
  )
) {
  playerContent = playerContent.replace(
    'import { Wallet, TrendingUp, Clock, Wifi, WifiOff } from "lucide-react";',
    'import { Wallet, TrendingUp, Clock, Wifi, WifiOff } from "lucide-react";\nimport { WalletActions } from "@/components/wallet/WalletActions";',
  );
}

// Add WalletActions only if it is not already present.
if (!playerContent.includes("<WalletActions />")) {
  playerContent = playerContent.replace(
    "{/* Wagers Table */}",
    `{/* Wallet Actions */}
      <WalletActions />

      {/* Wagers Table */}`,
  );
}

fs.writeFileSync(playerClientPath, playerContent, "utf8");

console.log(
  "Updated: src/app/(dashboard)/player/PlayerDashboardClient.tsx",
);

console.log("Wallet Actions injection complete.");
`,
);

console.log("Wallet actions generation complete.");