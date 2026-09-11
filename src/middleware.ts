import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login"];
const staffPaths = ["/admin", "/compliance", "/analyst"];

const roleHome: Record<string, string> = {
  admin: "/admin",
  compliance: "/compliance",
  analyst: "/analyst",
  player: "/player"
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicPath = publicPaths.some(
    (item) => path === item || path.startsWith(item + "/")
  );

  if (!user) {
    if (isPublicPath) {
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);

    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "player";

  if (path === "/login" || path === "/") {
    return NextResponse.redirect(new URL(roleHome[role] ?? "/player", request.url));
  }

  const isStaffPath = staffPaths.some(
    (item) => path === item || path.startsWith(item + "/")
  );

  if (isStaffPath) {
    if (role === "admin") {
      return response;
    }

    const ownStaffPath = "/" + role;
    const isOwnStaffPath =
      path === ownStaffPath || path.startsWith(ownStaffPath + "/");

    if (!isOwnStaffPath) {
      return NextResponse.redirect(
        new URL(roleHome[role] ?? "/player", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"]
};
