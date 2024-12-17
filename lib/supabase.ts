import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Regular client for normal operations
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Server-side client for operations requiring service role
export const createServerSupabase = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Server client cannot be used in browser context');
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

// Admin client for user operations (only in server context)
export const createAdminSupabase = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used in browser context');
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY - falling back to anon key');
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

export type User = Database['public']['Tables']['users']['Row'];

/*
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'car_list';

-- Check sample data
SELECT DISTINCT make, model 
FROM car_list 
ORDER BY make, model;

-- Check data case sensitivity
SELECT make, COUNT(*) 
FROM car_list 
GROUP BY make 
ORDER BY make;
*/
