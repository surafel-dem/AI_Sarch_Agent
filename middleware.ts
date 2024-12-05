import { withClerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/discover", "/search", "/api/search"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

export default withClerkMiddleware((request: NextRequest) => {
  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // Handle other routes that need authentication
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
