import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { WebhookPayload, SearchResponse, SearchSession, SearchSessionStatus } from '@/types/search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateSessionStatus(
  sessionId: string, 
  status: SearchSessionStatus, 
  error?: string
) {
  const { error: updateError } = await supabase
    .from('search_sessions')
    .update({ 
      status,
      ...(error && { error_message: error })
    })
    .eq('session_id', sessionId);

  if (updateError) {
    console.error('Failed to update session status:', updateError);
  }
}

async function normalizeSearchParams(params: any) {
  // Create a stable representation of search parameters
  const normalized = {};
  const keys = Object.keys(params).sort();
  
  for (const key of keys) {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      normalized[key] = params[key];
    }
  }
  
  return normalized;
}

async function checkRecentDuplicateSearch(
  clerkId: string,
  searchParams: any
): Promise<string | null> {
  try {
    // Check for identical search in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    
    const { data: recentSearches, error } = await supabase
      .from('search_sessions')
      .select('session_id, search_params, status')
      .eq('clerk_id', clerkId)
      .in('status', ['completed', 'searching'])
      .gt('created_at', thirtySecondsAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking for duplicate searches:', error);
      return null;
    }

    if (!recentSearches?.length) {
      return null;
    }

    // Normalize current search parameters
    const normalizedCurrent = await normalizeSearchParams(searchParams);
    const currentParamsString = JSON.stringify(normalizedCurrent);

    // Look for a matching search
    for (const search of recentSearches) {
      const normalizedExisting = await normalizeSearchParams(search.search_params);
      if (JSON.stringify(normalizedExisting) === currentParamsString) {
        // If it's a completed search, return it immediately
        if (search.status === 'completed') {
          return search.session_id;
        }
        
        // If it's still searching, wait briefly for it to complete
        const { data: updatedSearch } = await supabase
          .from('search_sessions')
          .select('*')
          .eq('session_id', search.session_id)
          .single();
          
        if (updatedSearch?.status === 'completed') {
          return updatedSearch.session_id;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error in checkRecentDuplicateSearch:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Get auth session
    const session = auth();
    const body = await request.json();

    // Extract user ID from session or use temporary ID
    const userId = session.userId || body.userId;
    
    if (!userId) {
      console.error('No user ID provided in request:', { body });
      return new Response('No user ID provided', { status: 400 });
    }

    console.log('Processing search request:', { 
      userId,
      authenticated: !!session.userId,
      requestBody: body
    });

    // Check for recent duplicate search
    const duplicateSessionId = await checkRecentDuplicateSearch(userId, body.carSpecs);
    if (duplicateSessionId) {
      console.log('Found duplicate search, reusing results:', duplicateSessionId);
      const { data: existingSession } = await supabase
        .from('search_sessions')
        .select('*')
        .eq('session_id', duplicateSessionId)
        .single();

      if (existingSession?.results) {
        return NextResponse.json({
          type: 'car_listing',
          message: '',
          results: existingSession.results,
          sessionId: existingSession.session_id,
          reused: true
        });
      }
    }

    // Check for too many active sessions
    const { count } = await supabase
      .from('search_sessions')
      .select('*', { count: 'exact' })
      .eq('clerk_id', userId)
      .in('status', ['pending', 'searching', 'ai_processing'])
      .single();

    if (count >= 5) { // Maximum 5 active sessions per user
      return NextResponse.json(
        { error: 'Too many active searches. Please wait for some to complete.' },
        { status: 429 }
      );
    }

    // Create search session - Postgres will generate the UUID
    const { data: searchSession, error: sessionError } = await supabase
      .from('search_sessions')
      .insert({
        clerk_id: userId,
        search_params: body.carSpecs || {},
        status: 'pending'
        // No need to specify created_at, it has a default value
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to create search session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create search session' },
        { status: 500 }
      );
    }

    // Now we have the auto-generated session_id
    const sessionId = searchSession.session_id;

    // Update status to searching
    await updateSessionStatus(sessionId, 'searching');

    // Build Supabase query based on car specs
    let query = supabase
      .from('car_list')
      .select('*');

    const { carSpecs } = body;

    if (carSpecs) {
      // Add filters based on carSpecs
      if (carSpecs.make) {
        query = query.ilike('make', `%${carSpecs.make}%`);
      }
      if (carSpecs.model) {
        query = query.ilike('model', `%${carSpecs.model}%`);
      }
      if (carSpecs.year) {
        query = query.eq('year', carSpecs.year);
      }
      if (carSpecs.transmission) {
        query = query.eq('transmission', carSpecs.transmission);
      }
      if (carSpecs.minPrice) {
        query = query.gte('price', carSpecs.minPrice);
      }
      if (carSpecs.maxPrice) {
        query = query.lte('price', carSpecs.maxPrice);
      }
      if (carSpecs.location) {
        query = query.ilike('location', `%${carSpecs.location}%`);
      }
      if (carSpecs.keywords) {
        // Search in description using text search
        query = query.textSearch('description', carSpecs.keywords.join(' & '));
      }
    }

    // Execute query
    const { data: cars, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase query error:', error);
      await updateSessionStatus(sessionId, 'failed', error.message);
      return NextResponse.json(
        { error: 'Failed to search cars' },
        { status: 500 }
      );
    }

    // Update search session with results
    const { error: updateError } = await supabase
      .from('search_sessions')
      .update({ 
        results: cars,
        total_results: cars.length,
        status: 'completed'
      })
      .eq('session_id', sessionId);

    if (updateError) {
      console.error('Failed to update search results:', updateError);
    }

    // Format the response
    const formattedResponse: SearchResponse = {
      type: 'car_listing',
      message: '',
      results: cars
    };

    return NextResponse.json({
      ...formattedResponse,
      sessionId // Return the auto-generated session_id to the client
    });
  } catch (error) {
    console.error('Error in search:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}
