import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { config } from './config'

const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

export type User = Database['public']['Tables']['users']['Row']
