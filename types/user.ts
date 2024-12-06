import { User } from "@clerk/nextjs/server";

export interface SupabaseUser {
  id: string;
  clerk_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedUser extends User {
  supabaseData?: SupabaseUser;
}

export interface UserProfile extends SupabaseUser {
  // Add any additional user profile fields here
  // These will be stored in Supabase
}
