import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const PUBLIC_ROUTES = ["/login"];
const ONBOARDING_ROUTES = ["/blood-onboarding", "/profile/onboarding"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = getSupabaseServerClient();

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
      .from("user_profiles")
      .select("blood_type, rh_factor")
      .eq("user_id", user.id)
      .single();

    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    const isProfileComplete = userData?.name && profile?.blood_type && profile?.rh_factor;

    if (!isProfileComplete && !isOnboardingRoute && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/blood-onboarding/profile", req.url));
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
