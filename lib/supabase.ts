import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { config } from './config'

const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type User = Database['public']['Tables']['users']['Row']
