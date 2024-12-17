import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const headersList = headers();
    const userId = headersList.get('x-clerk-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminSupabase();

    // Get user's UUID from clerk_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get session and its messages
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        last_message,
        filters,
        messages:chat_messages(
          id,
          role,
          content,
          created_at,
          metadata
        )
      `)
      .eq('id', params.sessionId)
      .eq('user_id', userData.id)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in GET /api/sessions/[sessionId]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const headersList = headers();
    const userId = headersList.get('x-clerk-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, filters, last_message } = body;

    const supabase = createAdminSupabase();

    // Get user's UUID from clerk_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .update({
        title,
        filters,
        last_message,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.sessionId)
      .eq('user_id', userData.id)
      .select()
      .single();

    if (sessionError) {
      console.error('Error updating session:', sessionError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in PATCH /api/sessions/[sessionId]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
