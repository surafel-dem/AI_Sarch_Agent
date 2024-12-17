import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  try {
    console.log('Sessions API: Starting request');
    const headersList = await headers();
    const userId = headersList.get('x-clerk-user-id');
    
    if (!userId) {
      console.log('Sessions API: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Sessions API: User ID:', userId);

    const supabase = createAdminSupabase();
    
    // Get or create user's UUID from clerk_id
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError?.code === 'PGRST116') { // Record not found error code
      console.log('Sessions API: User not found, creating new user');
      // If user doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ 
          clerk_id: userId,
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (createError) {
        console.error('Sessions API: Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user', details: createError }, { status: 500 });
      }

      userData = newUser;
    } else if (userError) {
      console.error('Sessions API: Error fetching user:', userError);
      return NextResponse.json({ error: 'Database error', details: userError }, { status: 500 });
    }
    console.log('Sessions API: Found user:', userData);

    // Get all sessions for the user
    console.log('Sessions API: Fetching sessions for user:', userData.id);
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        last_message
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Sessions API: Error fetching sessions:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch sessions', details: sessionsError }, { status: 500 });
    }

    console.log('Sessions API: Found sessions:', sessions?.length || 0);
    return NextResponse.json(sessions || []);
  } catch (error) {
    console.error('Sessions API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Sessions API: Starting request');
    const headersList = await headers();
    const userId = headersList.get('x-clerk-user-id');
    
    if (!userId) {
      console.log('Sessions API: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Sessions API: User ID:', userId);

    const body = await request.json();
    const { title, filters } = body;

    const supabase = createAdminSupabase();

    // Get or create user's UUID from clerk_id
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError?.code === 'PGRST116') { // Record not found error code
      console.log('Sessions API: User not found, creating new user');
      // If user doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ 
          clerk_id: userId,
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (createError) {
        console.error('Sessions API: Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user', details: createError }, { status: 500 });
      }

      userData = newUser;
    } else if (userError) {
      console.error('Sessions API: Error fetching user:', userError);
      return NextResponse.json({ error: 'Database error', details: userError }, { status: 500 });
    }
    console.log('Sessions API: Found user:', userData);

    // Create new session
    console.log('Sessions API: Creating new session for user:', userData.id);
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userData.id,
        title: title || 'New Chat',
        filters: filters || {}
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Sessions API: Error creating session:', sessionError);
      return NextResponse.json({ error: 'Failed to create session', details: sessionError }, { status: 500 });
    }

    console.log('Sessions API: Created session:', session);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Sessions API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
