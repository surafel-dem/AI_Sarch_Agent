import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Initialize Supabase client with anon key for public operations
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SupabaseUser {
  id: string;
  clerk_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current user's Supabase data
 */
export async function getCurrentUserData(): Promise<SupabaseUser | null> {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUserData:', error);
    return null;
  }
}

/**
 * Get user data by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<SupabaseUser | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error) {
      console.error('Error fetching user by Clerk ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserByClerkId:', error);
    return null;
  }
}

/**
 * Get user data by email
 */
export async function getUserByEmail(email: string): Promise<SupabaseUser | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
}
