import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(
  supabaseUrl!,
  supabaseKey!
);

export async function POST(request: Request) {
  console.log('Search log endpoint called');
  
  try {
    const searchData = await request.json();
    console.log('Received search data:', searchData);

    // Validate required fields
    if (!searchData.clerk_id) {
      console.error('Missing clerk_id in search data');
      return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 });
    }

    // Create log entry matching the exact table structure
    const logEntry = {
      clerk_id: searchData.clerk_id,
      filters: searchData.filters || {},
      results: searchData.results || [],
      results_count: searchData.results_count || 0,
      status: 'pending',
      session_id: searchData.session_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to insert log entry:', logEntry);

    const { data, error } = await supabase
      .from('search_logs')
      .insert([logEntry])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Log entry created successfully:', data);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Unexpected error in search log endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
