import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // The 'next' param tells us where to send the user after exchanging the code
  const next = searchParams.get("next") ?? "/player"; 

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Forward the user to the intended destination (e.g., /player or /update-password)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with a message
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
