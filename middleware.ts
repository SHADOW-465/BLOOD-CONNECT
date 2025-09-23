import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/login"];
const ONBOARDING_ROUTES = ["/blood-onboarding", "/profile/onboarding"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(url!, anon!, {
    cookies: {
      get: (name) => req.cookies.get(name)?.value,
      set: (name, value, options) =>
        res.cookies.set({ name, value, ...options }),
      remove: (name, options) =>
        res.cookies.set({ name, value: "", ...options }),
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  const { pathname } = req.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((path) =>
    pathname.startsWith(path)
  );
  const isOnboardingRoute = ONBOARDING_ROUTES.some((path) =>
    pathname.startsWith(path)
  );

  if (!user && !isPublicRoute && !isOnboardingRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, blood_type, rh")
      .eq("id", user.id)
      .single();

    const isProfileComplete = profile?.name && profile?.blood_type && profile?.rh;

    if (!isProfileComplete && !isOnboardingRoute && pathname !== "/api/profile") {
      return NextResponse.redirect(new URL("/profile/onboarding", req.url));
    }

    if (isProfileComplete && (isPublicRoute || isOnboardingRoute)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)).*)"],
}
