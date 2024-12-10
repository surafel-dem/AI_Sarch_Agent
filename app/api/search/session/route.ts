import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get auth session
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get request body
    const sessionData = await request.json();

    // Create search session
    const { data, error } = await supabase
      .from('search_sessions')
      .insert([{
        ...sessionData,
        clerk_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating search session:', error);
      return new NextResponse('Failed to create search session', { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/search/session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
