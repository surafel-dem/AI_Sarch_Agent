
# Clerk_Supabase_Integration

Table of Contents
Overview
Architecture
Implementation Steps
Configuration
Key Components
Best Practices
Common Issues and Solutions
Overview
This document outlines the implementation of a robust authentication system using Clerk for authentication and Supabase for user data storage, based on the nextjs-starter-kit implementation.

Tech Stack
Next.js 13+ (App Router)
Clerk (Authentication)
Supabase (User Data)
TypeScript
Prisma (Optional - for complex data relationships)
Architecture
Authentication Flow
User signs up/in through Clerk
Clerk webhook triggers user creation/update in Supabase
User data synced between Clerk and Supabase
Protected routes managed through middleware
Data Flow
mermaid
CopyInsert
graph LR
    A[User] --> B[Clerk Auth]
    B --> C[Webhook]
    C --> D[Supabase User Table]
    D --> E[Application Data]
Implementation Steps
1. Environment Setup
env
CopyInsert
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Configuration
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
2. Authentication Wrapper
typescript
CopyInsert
// components/wrapper/auth-wrapper.tsx
const AuthWrapper = ({ children }: AuthWrapperProps) => {
  if (!config.auth.enabled) {
    return <>{children}</>;
  }
  return <ClerkProvider dynamic>{children}</ClerkProvider>;
};
3. Middleware Implementation
typescript
CopyInsert
// middleware.ts
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default function middleware(req: any) {
  return clerkMiddleware(async (auth, req) => {
    const resolvedAuth = await auth();
    
    if (!resolvedAuth.userId && isProtectedRoute(req)) {
      return resolvedAuth.redirectToSignIn();
    }
    return NextResponse.next();
  })(req);
}
4. Webhook Handler
typescript
CopyInsert
// app/api/auth/webhook/route.ts
export async function POST(req: Request) {
  // Verify webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const wh = new Webhook(WEBHOOK_SECRET);
  
  // Handle events
  switch (eventType) {
    case "user.created":
      await userCreate({
        email, first_name, last_name,
        profile_image_url, user_id
      });
      break;
    case "user.updated":
      await userUpdate({
        email, first_name, last_name,
        profile_image_url, user_id
      });
      break;
  }
}
5. User Data Management
typescript
CopyInsert
// utils/data/user/userCreate.ts
export const userCreate = async ({
  email, first_name, last_name,
  profile_image_url, user_id,
}: userCreateProps) => {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { cookies }
  );
  
  const { data, error } = await supabase
    .from("user")
    .insert([{
      email, first_name, last_name,
      profile_image_url, user_id,
    }])
    .select();
};
Configuration
1. Clerk Dashboard Setup
Create a Clerk application
Configure OAuth providers (if needed)
Set up webhook endpoints
Copy necessary API keys
2. Supabase Setup
Create a Supabase project
Set up the user table:
sql
CopyInsert
create table user (
  id serial primary key,
  created_time timestamp default now(),
  email text unique,
  first_name text,
  last_name text,
  profile_image_url text,
  user_id text unique,
  subscription text
);
Key Components
1. Route Protection
Middleware-based protection for /dashboard routes
Configurable auth enabling/disabling
Clean fallbacks for non-auth mode
2. Sign-up/Sign-in Pages
typescript
CopyInsert
// app/(auth)/sign-up/[[...sign-up]]/page.tsx
export default function SignUpPage() {
  return (
    <PageWrapper>
      <div className="flex min-w-screen justify-center my-[5rem]">
        <SignUp 
          fallbackRedirectUrl="/" 
          signInFallbackRedirectUrl="/dashboard" 
        />
      </div>
    </PageWrapper>
  );
}
3. User Data Sync
Webhook-based synchronization
Error handling and validation
Atomic operations
Best Practices
Security
Webhook signature verification
Environment variables for sensitive data
Server-side operations for database access
Error Handling
Graceful fallbacks
Proper error messages
Transaction rollbacks
Code Organization
Clear separation of concerns
Type safety with TypeScript
Modular components
Performance
Efficient database queries
Proper caching strategies
Optimized webhook handling
Common Issues and Solutions
Webhook Synchronization Issues
Implement retry logic
Add logging for debugging
Use transaction rollbacks
Auth State Management
Use Clerk's built-in hooks
Implement proper loading states
Handle edge cases
Database Consistency
Use unique constraints
Implement proper error handling
Add validation layers
This implementation provides a solid foundation for:

Secure user authentication
Reliable data synchronization
Scalable user management
Clean and maintainable code