import Link from "next/link";
import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/rbac/roles";

type NavItem = {
  href: string;
  label: string;
  roles: AppRole[];
};

const navItems: NavItem[] = [
  {
    href: "/super-admin",
    label: "Super Admin",
    roles: ["super_admin"],
  },
  {
    href: "/admin",
    label: "Admin",
    roles: ["super_admin", "admin"],
  },
  {
    href: "/manager",
    label: "Manager",
    roles: ["super_admin", "admin", "manager"],
  },
  {
    href: "/staff",
    label: "Staff",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    href: "/compliance",
    label: "Compliance",
    roles: ["super_admin", "admin", "compliance"],
  },
  {
    href: "/analyst",
    label: "Analyst",
    roles: ["super_admin", "admin", "manager", "analyst"],
  },
  {
    href: "/player",
    label: "Player",
    roles: ["player"],
  },
  {
    href: "/settings",
    label: "Settings",
    roles: ["super_admin", "admin"],
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: AppRole = "player";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role as AppRole;
    }
  }

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <GlassCard className="h-fit space-y-4">
          <div>
            <h1 className="text-lg font-semibold">Glass Ops</h1>
            <p className="text-sm text-slate-300">iGaming FinTech Dashboard</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Current Role
            </p>
            <p className="mt-1 text-sm font-medium capitalize">
              {role.replace("_", " ")}
            </p>
          </div>

          <nav className="space-y-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <SignOutButton />
        </GlassCard>

        <main className="min-w-0 space-y-4">{children}</main>
      </div>
    </div>
  );
}
