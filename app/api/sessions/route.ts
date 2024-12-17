import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createServerSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('GET /api/sessions: Starting request');
    const { userId } = auth();
    
    if (!userId) {
      console.log('GET /api/sessions: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('GET /api/sessions: User ID:', userId);

    const supabase = createServerSupabase();
    if (!supabase) {
      console.error('GET /api/sessions: Failed to create Supabase client');
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    // Get or create user's UUID from clerk_id
    console.log('GET /api/sessions: Checking for existing user');
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError?.code === 'PGRST116') { // Record not found error code
      console.log('GET /api/sessions: User not found, creating new user');
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
        console.error('GET /api/sessions: Error creating user:', createError);
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: createError.message
        }, { status: 500 });
      }

      userData = newUser;
      console.log('GET /api/sessions: Created new user:', userData);
    } else if (userError) {
      console.error('GET /api/sessions: Error fetching user:', userError);
      return NextResponse.json({ 
        error: 'Database error',
        details: userError.message
      }, { status: 500 });
    }

    console.log('GET /api/sessions: Fetching sessions for user:', userData.id);
    // Get all sessions with their latest message
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        user_id
      `)
      .eq('user_id', userData.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.error('GET /api/sessions: Error fetching sessions:', sessionsError);
      return NextResponse.json({ 
        error: 'Failed to fetch sessions',
        details: sessionsError.message
      }, { status: 500 });
    }

    if (!sessions || sessions.length === 0) {
      console.log('GET /api/sessions: No sessions found for user');
      return NextResponse.json([]);
    }

    console.log('GET /api/sessions: Found sessions:', sessions.length);

    // Get latest message for each session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_memory')
      .select('*')
      .in('session_id', sessions.map(s => s.id))
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('GET /api/sessions: Error fetching messages:', messagesError);
      return NextResponse.json({ 
        error: 'Failed to fetch messages',
        details: messagesError.message
      }, { status: 500 });
    }

    // Group messages by session
    const messagesBySession = messages?.reduce((acc, message) => {
      if (!acc[message.session_id]) {
        acc[message.session_id] = message;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    // Combine sessions with their latest message
    const enrichedSessions = sessions.map(session => ({
      ...session,
      last_message: messagesBySession[session.id]?.message || null
    }));

    console.log('GET /api/sessions: Successfully processed sessions');
    return NextResponse.json(enrichedSessions);
  } catch (error) {
    console.error('GET /api/sessions: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/sessions: Starting request');
    const { userId } = auth();
    if (!userId) {
      console.log('POST /api/sessions: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('POST /api/sessions: User ID:', userId);

    const body = await request.json();
    const { title, filters } = body;

    const supabase = createServerSupabase();
    if (!supabase) {
      console.error('POST /api/sessions: Failed to create Supabase client');
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    // Get or create user's UUID from clerk_id
    console.log('POST /api/sessions: Checking for existing user');
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError?.code === 'PGRST116') {
      console.log('POST /api/sessions: User not found, creating new user');
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
        console.error('POST /api/sessions: Error creating user:', createError);
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: createError.message
        }, { status: 500 });
      }

      userData = newUser;
      console.log('POST /api/sessions: Created new user:', userData);
    } else if (userError) {
      console.error('POST /api/sessions: Error fetching user:', userError);
      return NextResponse.json({ 
        error: 'Database error',
        details: userError.message
      }, { status: 500 });
    }

    // Create new session
    console.log('POST /api/sessions: Creating new session');
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert([{
        user_id: userData.id,
        title: title || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (sessionError) {
      console.error('POST /api/sessions: Error creating session:', sessionError);
      return NextResponse.json({ 
        error: 'Failed to create session',
        details: sessionError.message
      }, { status: 500 });
    }

    // If we have filters, store them as the first message
    if (filters) {
      console.log('POST /api/sessions: Creating initial message with filters');
      const { error: messageError } = await supabase
        .from('chat_memory')
        .insert([{
          session_id: session.id,
          message: {
            type: 'system',
            content: 'Search started',
            filters
          },
          created_at: new Date().toISOString()
        }]);

      if (messageError) {
        console.error('POST /api/sessions: Error creating initial message:', messageError);
        // Don't fail the request, just log the error
      }
    }

    console.log('POST /api/sessions: Successfully created session');
    return NextResponse.json(session);
  } catch (error) {
    console.error('POST /api/sessions: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
