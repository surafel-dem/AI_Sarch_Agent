import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabase();

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

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', userData.id)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_memory')
      .select('*')
      .eq('session_id', params.sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Transform messages to include the message content from JSONB
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      session_id: msg.session_id,
      ...msg.message,
      created_at: msg.created_at
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Error in GET messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role, content, metadata } = body;

    const supabase = createServerSupabase();

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

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', userData.id)
      .single();

    if (sessionError || !session) {
      console.error('Error verifying session:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('chat_memory')
      .insert([{
        session_id: params.sessionId,
        message: {
          type: role,
          content,
          ...(metadata ? { metadata } : {})
        },
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Update session's updated_at timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.sessionId);

    // Transform the message to include the message content from JSONB
    const transformedMessage = {
      id: message.id,
      session_id: message.session_id,
      ...message.message,
      created_at: message.created_at
    };

    return NextResponse.json(transformedMessage);
  } catch (error) {
    console.error('Error in POST message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
