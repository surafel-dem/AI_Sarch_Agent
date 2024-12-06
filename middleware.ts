import { authMiddleware } from "@clerk/nextjs";

// Public routes that don't require authentication
const publicRoutes = [
  "/",              // Homepage
  "/discover",      // Discovery page
  "/search",        // Search results
  "/api/search",    // Search API
];

// Routes that should be completely ignored by Clerk
const ignoredRoutes = [
  "/api/auth/webhook",  // Clerk webhook
  "/_next",            // Next.js assets
  "/favicon.ico",      // Favicon
];

export default authMiddleware({
  publicRoutes,
  ignoredRoutes,
  debug: process.env.NODE_ENV === 'development',
  // Optional: Add afterAuth to sync with Supabase if needed
  afterAuth: async (auth, req, evt) => {
    // Handle after auth logic if needed
  },
});

// Matcher configuration for Clerk middleware
export const config = {
  matcher: [
    // Required for Next.js
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Match all API routes except ignored ones
    "/(api|trpc)(.*)",
  ],
};
