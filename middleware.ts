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
  async afterAuth(auth, req) {
    // Handle auth state
    if (auth.isPublicRoute) {
      // Don't do anything for public routes
      return NextResponse.next();
    }

    // If user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // If user is signed in and tries to access auth pages, redirect to home
    if (auth.userId && req.nextUrl.pathname.startsWith('/(auth)')) {
      const homeUrl = new URL('/', req.url);
      return NextResponse.redirect(homeUrl);
    }

    // If user is signed in and tries to access /dashboard, redirect to home
    if (auth.userId && req.nextUrl.pathname === '/dashboard') {
      const homeUrl = new URL('/', req.url);
      return NextResponse.redirect(homeUrl);
    }

    // If the user is signed in and we have their data
    if (auth.userId && auth.user) {
      try {
        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', auth.userId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking user in middleware:', fetchError);
        }

        // If user doesn't exist in Supabase, create them
        if (!existingUser) {
          const { error: createError } = await supabase
            .from('users')
            .insert({
              clerk_id: auth.userId,
              email: auth.user.emailAddresses[0]?.emailAddress,
              avatar_url: auth.user.imageUrl,
              subscription_tier: 'free',
              subscription_status: 'active',
              total_conversations: 0,
              total_searches: 0,
              message_count: 0,
              token_usage: 0
            });

          if (createError) {
            console.error('Error creating user in middleware:', createError);
          }
        }
      } catch (error) {
        console.error('Unexpected error in middleware:', error);
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
});

// Matcher configuration for Clerk middleware
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
