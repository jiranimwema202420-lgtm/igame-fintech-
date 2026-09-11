import fs from "node:fs";
import path from "node:path";

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Created/Updated: " + filePath);
}

// 1. Settings Server Actions
writeFile(
  "src/lib/actions/settings-actions.ts",
  `"use server";

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
`,
);

// 2. Settings Page (Server Component)
writeFile(
  "src/app/(dashboard)/settings/page.tsx",
  `import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <ProfileSettingsForm
      userEmail={user.email || ""}
      userRole={profile?.role || "player"}
      memberSince={profile?.created_at || ""}
    />
  );
}
`,
);

// 3. Settings Form (Client Component)
writeFile(
  "src/components/settings/ProfileSettingsForm.tsx",
  `"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { updateEmail, updatePassword } from "@/lib/actions/settings-actions";
import { User, Shield, LogOut, Loader2, Mail, Lock } from "lucide-react";

interface Props {
  userEmail: string;
  userRole: string;
  memberSince: string;
}

export function ProfileSettingsForm({ userEmail, userRole, memberSince }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleEmailUpdate = () => {
    setEmailMessage(null);
    if (!newEmail) {
      setEmailMessage({ type: "error", text: "Please enter a new email address." });
      return;
    }

    startTransition(async () => {
      const result = await updateEmail(newEmail);
      if (result.error) {
        setEmailMessage({ type: "error", text: result.error });
      } else {
        setEmailMessage({ type: "success", text: "Email update initiated. Please check your inbox to confirm." });
        setNewEmail("");
      }
    });
  };

  const handlePasswordUpdate = () => {
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(newPassword);
      if (result.error) {
        setPasswordMessage({ type: "error", text: result.error });
      } else {
        setPasswordMessage({ type: "success", text: "Password updated successfully." });
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile Settings</h1>
        <p className="mt-1 text-slate-400">Manage your account information and security preferences.</p>
      </div>

      {/* Account Overview */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-3 text-slate-300">
          <User className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Account Overview</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Current Email</p>
            <p className="mt-1 font-medium">{userEmail}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Role</p>
            <p className="mt-1 font-medium capitalize">{userRole}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Member Since</p>
            <p className="mt-1 font-medium">{formatDate(memberSince)}</p>
          </div>
        </div>
      </GlassCard>

      {/* Security Settings */}
      <GlassCard className="space-y-6">
        <div className="flex items-center gap-3 text-slate-300">
          <Shield className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Security</h2>
        </div>

        {/* Update Email */}
        <div className="space-y-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Mail className="h-4 w-4" />
            Update Email Address
          </div>
          <div className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new.email@example.com"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-white/40"
            />
            <button
              onClick={handleEmailUpdate}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-semibold hover:bg-white/30 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </button>
          </div>
          {emailMessage && (
            <p className={\`text-sm \${emailMessage.type === "success" ? "text-green-400" : "text-red-400"}\`}>
              {emailMessage.text}
            </p>
          )}
        </div>

        {/* Update Password */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Lock className="h-4 w-4" />
            Update Password
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-white/40"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-white/40"
            />
          </div>
          <button
            onClick={handlePasswordUpdate}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-semibold hover:bg-white/30 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
          </button>
          {passwordMessage && (
            <p className={\`text-sm \${passwordMessage.type === "success" ? "text-green-400" : "text-red-400"}\`}>
              {passwordMessage.text}
            </p>
          )}
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="border-red-500/20 bg-red-500/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-red-300">Sign Out</h2>
            <p className="mt-1 text-sm text-slate-400">End your session on this device.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-semibold text-red-300 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
`,
);

// 4. Update Dashboard Layout to include Settings link
const layoutPath = path.join("src", "app", "(dashboard)", "layout.tsx");
let layoutContent = fs.readFileSync(layoutPath, "utf8");

// Add Settings to navItems
layoutContent = layoutContent.replace(
  '{ href: "/player", label: "Player" }',
  '{ href: "/player", label: "Player" },\n  { href: "/settings", label: "Settings" }',
);

fs.writeFileSync(layoutPath, layoutContent, "utf8");
console.log("Updated: src/app/(dashboard)/layout.tsx");

console.log("Profile Settings injection complete.");
