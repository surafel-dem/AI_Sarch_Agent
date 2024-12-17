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
      return NextResponse.json({ error: 'User not found', details: userError }, { status: 404 });
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', userData.id)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ error: 'Session not found', details: sessionError }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', params.sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages', details: messagesError }, { status: 500 });
    }

    return NextResponse.json(messages || []);
  } catch (error) {
    console.error('Error in GET /api/sessions/[sessionId]/messages:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
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
    const { role, content, metadata } = body;

    const supabase = createAdminSupabase();

    // Get user's UUID from clerk_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found', details: userError }, { status: 404 });
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', userData.id)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ error: 'Session not found', details: sessionError }, { status: 404 });
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: params.sessionId,
          role,
          content,
          metadata,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to create message', details: messageError }, { status: 500 });
    }

    // Update session's last_message
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ 
        last_message: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      // Don't return error since message was created successfully
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error in POST /api/sessions/[sessionId]/messages:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
