import { supabase } from './supabase'
import { auth } from '@clerk/nextjs'

export async function syncUserToSupabase() {
  const { userId } = auth()
  if (!userId) return null

  // Check if user exists in Supabase
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (existingUser) {
    return existingUser
  }

  // If user doesn't exist, create them
  const { data: newUser, error } = await supabase
    .from('users')
    .insert([
      {
        clerk_id: userId,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating user in Supabase:', error)
    return null
  }

  return newUser
}
