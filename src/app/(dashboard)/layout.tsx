import Link from "next/link";
import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignOutButton } from "@/components/SignOutButton";

const navItems = [
  { href: "/admin", label: "Admin" },
  { href: "/compliance", label: "Compliance" },
  { href: "/analyst", label: "Analyst" },
  { href: "/player", label: "Player" },
  { href: "/settings", label: "Settings" }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <GlassCard className="h-fit space-y-4">
          <div>
            <h1 className="text-lg font-semibold">Glass Ops</h1>
            <p className="text-sm text-slate-300">
              iGaming FinTech Dashboard
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
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
