# Car Search AI Authentication System Documentation

## 1. Architecture Overview

### 1.1 Technology Stack
- **Frontend**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Email Service**: Resend API
- **UI Components**: Radix UI, Tailwind CSS

### 1.2 Key Components
```
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts    # Auth callback handler
│   └── page.tsx            # Main application page
├── components/
│   └── nav-bar.tsx         # Authentication UI
├── lib/
│   └── supabase.ts         # Supabase client configuration
└── types/
    └── database.ts         # Database type definitions
```

## 2. Authentication Flow

### 2.1 Registration/Login Process
1. User enters email in the signup/login form
2. Magic link is sent via Supabase Auth
3. User clicks magic link in email
4. Redirected to `/auth/callback` route
5. Session is established
6. User profile is created automatically via database trigger

### 2.2 Code Implementation

#### Supabase Client Configuration (`lib/supabase.ts`)
```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : undefined
  }
})
```

#### Auth Callback Route (`app/auth/callback/route.ts`)
```typescript
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    // Handle session exchange
  }
}
```

## 3. Database Configuration

### 3.1 Users Table Schema
```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  total_conversations INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  avatar_url TEXT,
  message_count INTEGER DEFAULT 0,
  token_usage INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active'
);
```

### 3.2 Row Level Security (RLS) Policies
```sql
-- Select Policy
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Update Policy
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

### 3.3 Automatic Profile Creation
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 4. Environment Configuration

### 4.1 Local Development
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
RESEND_API_KEY=your_resend_api_key
```

### 4.2 Production Configuration
When deploying to production:

1. **Supabase Project Settings**:
   ```
   Authentication > URL Configuration:
   - Site URL: https://your-domain.com
   - Redirect URLs:
     https://your-domain.com/auth/callback
     https://your-domain.com
   ```

2. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   RESEND_API_KEY=your_production_resend_key
   ```

## 5. Security Considerations

### 5.1 Authentication Security
- PKCE flow enabled for secure token exchange
- Magic link authentication (passwordless)
- Session management with secure cookies
- No sensitive keys exposed to client

### 5.2 Database Security
- Row Level Security (RLS) enabled
- Proper permission grants
- Security definer functions
- Schema isolation

## 6. Deployment Checklist

### 6.1 Pre-deployment Steps
1. Update Supabase URL Configuration
   - Set production Site URL
   - Add production Redirect URLs
   - Verify email templates

2. Update Environment Variables
   - Set production Supabase URL
   - Update Supabase anon key
   - Configure production Resend API key

3. Database Verification
   - Verify RLS policies
   - Check trigger functions
   - Test user creation flow

### 6.2 Post-deployment Verification
1. Test authentication flow
2. Verify email delivery
3. Check user profile creation
4. Monitor error logs
5. Test session persistence

## 7. Monitoring and Maintenance

### 7.1 Key Metrics to Monitor
- Authentication success rate
- Email delivery rate
- Database operation errors
- Session management issues

### 7.2 Common Issues and Solutions
1. **Magic Link Errors**
   - Check email configuration
   - Verify redirect URLs
   - Check email templates

2. **Database Errors**
   - Verify RLS policies
   - Check trigger functions
   - Monitor connection pool

3. **Session Issues**
   - Clear browser cache/cookies
   - Check cookie settings
   - Verify PKCE flow

## 8. API Reference

### 8.1 Authentication Endpoints
```typescript
// Sign Up/In with Magic Link
supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})

// Sign Out
supabase.auth.signOut()

// Get Session
supabase.auth.getSession()
```

### 8.2 User Profile Operations
```typescript
// Get User Profile
supabase
  .from('users')
  .select('*')
  .single()

// Update Profile
supabase
  .from('users')
  .update({ field: value })
  .eq('id', user.id)
```
