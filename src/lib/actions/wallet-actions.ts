"use server";

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
    return { error: parsed.error.issues[0]?.message ?? "Invalid amount" };
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
    return { error: parsed.error.issues[0]?.message ?? "Invalid amount" };
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
    return { error: parsed.error.issues[0]?.message ?? "Invalid amount" };
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
