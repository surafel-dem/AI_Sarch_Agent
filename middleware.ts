import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Public routes that don't require authentication
const publicRoutes = [
  "/",              // Homepage
  "/discover",      // Discovery page
  "/search",        // Search results
  "/api/search",    // Search API
  "/api/auth/webhook", // Webhook endpoint
];

export default authMiddleware({
  publicRoutes,
  ignoredRoutes: [
    "/((?!api|trpc))(_next|.+\\.[\\w]+$)", // Ignore static files
    "/api/search",                          // Public API endpoints
    "/search"                               // Public search page
  ],
  debug: true,
  afterAuth(auth, req) {
    // Handle auth state
    if (auth.isPublicRoute) {
      // Don't do anything for public routes
      return NextResponse.next();
    }

    // If user is not signed in and the route is private, redirect them to sign in
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
