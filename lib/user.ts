import { SupabaseClient } from '@supabase/supabase-js';

export async function getUserData(supabase: SupabaseClient, userId: string) {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (userError?.code === 'PGRST116') {
    // If user doesn't exist, create them
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ 
        clerk_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    return { data: newUser };
  }

  if (userError) {
    throw new Error(`Failed to fetch user: ${userError.message}`);
  }

  return { data: userData };
}