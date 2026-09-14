import fs from "node:fs";

// 1. Auth Callback Route Handler (Official @supabase/ssr logic + Canonical Fix)
const callbackRoute = `import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/update-password";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Safe to ignore if called from middleware or server component edge cases
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // FORCE CANONICAL DOMAIN: Prevents redirecting to protected Vercel Preview URLs
      const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";
      return NextResponse.redirect(\`\${canonicalUrl}\${next}\`);
    }
  }

  // Redirect to an error page if code exchange fails or code is missing
  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app";
  return NextResponse.redirect(
    \`\${canonicalUrl}/login?error=Invalid%20or%20expired%20reset%20link\`
  );
}
`;

fs.mkdirSync("src/app/auth/callback", { recursive: true });
fs.writeFileSync("src/app/auth/callback/route.ts", callbackRoute);
console.log(
  "1. Auth Callback Route created with official @supabase/ssr logic.",
);

// 2. Update Password Page (With Confirmation Field and GlassCard UI)
const updatePasswordPage = `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(\`Error: \${error.message}\`);
      setIsError(true);
    } else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
      <GlassCard className="w-full max-w-md space-y-6">
        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4 w-full">
          <h2 className="text-2xl font-bold text-white text-center">Set New Password</h2>
          
          {message && (
            <p className={\`text-sm text-center \${isError ? "text-red-400" : "text-green-400"}\`}>
              {message}
            </p>
          )}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={6}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none text-white placeholder-slate-400"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none text-white placeholder-slate-400"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </GlassCard>
    </main>
  );
}
`;

fs.mkdirSync("src/app/update-password", { recursive: true });
fs.writeFileSync("src/app/update-password/page.tsx", updatePasswordPage);
console.log("2. Update Password page created with confirmation field.");

// 3. Ensure Forgot Password uses Canonical URL
const forgotPath = "src/app/forgot-password/page.tsx";
if (fs.existsSync(forgotPath)) {
  let content = fs.readFileSync(forgotPath, "utf8");
  if (
    content.includes("window.location.origin") &&
    !content.includes("igame-fintrack.vercel.app")
  ) {
    content = content.replace(
      /window\.location\.origin/g,
      '(process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintrack.vercel.app")',
    );
    fs.writeFileSync(forgotPath, content, "utf8");
    console.log(
      "3. Updated Forgot Password page to use canonical URL fallback.",
    );
  } else {
    console.log("3. Forgot Password page already uses canonical URL.");
  }
}

console.log("\n✅ Official Supabase PKCE Workflow Applied!");
