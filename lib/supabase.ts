import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { config } from './config'

const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

// Create Supabase client without auth
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: false, // Disable Supabase auth persistence
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)

export type User = Database['public']['Tables']['users']['Row']
