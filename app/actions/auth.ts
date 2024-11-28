'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createUserRecord(userId: string, email: string) {
  try {
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: email,
          total_conversations: 0,
          total_searches: 0
        }
      ])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error creating user record:', error)
    return { success: false, error }
  }
}

export async function updateUserStats(userId: string, type: 'conversation' | 'search') {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        [type === 'conversation' ? 'total_conversations' : 'total_searches']: supabase.rpc('increment'),
        last_seen_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error updating user stats:', error)
    return { success: false, error }
  }
}
