"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
      onClick={async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // Ignore sign-out errors and return to login.
        } finally {
          router.push("/login");
          router.refresh();
        }
      }}
    >
      Sign out
    </button>
  );
}
