import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",              // Homepage
  "/discover",      // Discovery page
];

export default authMiddleware({
  publicRoutes,
  ignoredRoutes: [
    "/((?!api|trpc))(_next|.+\\.[\\w]+$)", // Ignore static files
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

    // Add auth header to all authenticated requests
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-clerk-user-id', auth.userId as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
