"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type SettingsActionResult = {
  success?: boolean;
  error?: string;
};

export async function updateEmail(newEmail: string): Promise<SettingsActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const emailSchema = z.string().email("Invalid email address");
  const parsed = emailSchema.safeParse(newEmail);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(newPassword: string): Promise<SettingsActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
  const parsed = passwordSchema.safeParse(newPassword);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };
  return { success: true };
}
