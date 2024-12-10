import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { SearchResponse } from '@/types/search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

    // Create initial search session
    const searchSession = {
      clerk_id: userId,
      filters: body.carSpecs || {},
      status: 'searching'
    };

    // Insert the search session
    const { data: sessionData, error: sessionError } = await supabase
      .from('search_sessions')
      .insert([searchSession])
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating search session:', sessionError);
      // Continue with search even if session creation fails
    }

    // Build Supabase query based on car specs
    let query = supabase
      .from('car_list')
      .select('*');

    const { carSpecs } = body;

    if (carSpecs) {
      // Enhanced make/model search with fuzzy matching
      if (carSpecs.make || carSpecs.model) {
        const terms = [carSpecs.make, carSpecs.model]
          .filter(Boolean)
          .map(term => term.toLowerCase().trim());
        
        if (terms.length > 0) {
          const searchConditions = terms.map(term => 
            `make.ilike.%${term}%,model.ilike.%${term}%`
          ).join(',');
          query = query.or(searchConditions);
        }
      }

      // Enhanced year range handling
      if (carSpecs.minYear) {
        const minYear = parseInt(carSpecs.minYear);
        if (!isNaN(minYear)) {
          query = query.gte('year', minYear);
        }
      }
      if (carSpecs.maxYear) {
        const maxYear = parseInt(carSpecs.maxYear);
        if (!isNaN(maxYear)) {
          query = query.lte('year', maxYear);
        }
      }

      // Keep existing transmission filter
      if (carSpecs.transmission) {
        query = query.eq('transmission', carSpecs.transmission);
      }

      // Enhanced price range handling with validation
      if (carSpecs.minPrice) {
        const minPrice = parseFloat(carSpecs.minPrice);
        if (!isNaN(minPrice)) {
          query = query.gte('price', minPrice);
        }
      }
      if (carSpecs.maxPrice) {
        const maxPrice = parseFloat(carSpecs.maxPrice);
        if (!isNaN(maxPrice)) {
          query = query.lte('price', maxPrice);
        }
      }

      // Enhanced location search
      if (carSpecs.location) {
        const locationTerm = carSpecs.location.trim();
        if (locationTerm) {
          query = query.or(
            `location.ilike.%${locationTerm}%,county.ilike.%${locationTerm}%,city.ilike.%${locationTerm}%`
          );
        }
      }

      // Enhanced keyword search in description
      if (carSpecs.keywords) {
        const keywords = Array.isArray(carSpecs.keywords) ? carSpecs.keywords : [carSpecs.keywords];
        const searchTerms = keywords
          .filter(term => term && term.length > 2)
          .map(term => term.trim())
          .join(' & ');
        
        if (searchTerms) {
          query = query.textSearch('description', searchTerms, {
            config: 'english',
            type: 'plain'
          });
        }
      }

      // Add sorting options
      const sortBy = carSpecs.sortBy || 'newest';
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'year_new':
          query = query.order('year', { ascending: false });
          break;
        case 'year_old':
          query = query.order('year', { ascending: true });
          break;
        default:
          // Default sort by newest listings first
          query = query.order('created_at', { ascending: false });
      }
    }

    // Execute query with limit
    const { data: cars, error } = await query.limit(50);

    if (error) {
      console.error('Supabase query error:', error);
      
      // Update session status if session was created
      if (sessionData?.id) {
        await supabase
          .from('search_sessions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionData.id);
      }
      
      return NextResponse.json(
        { error: 'Failed to search cars' },
        { status: 500 }
      );
    }

    // Update search session with results if session was created
    if (sessionData?.id) {
      await supabase
        .from('search_sessions')
        .update({ 
          results: cars || [],
          results_count: cars?.length || 0,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.id);
    }

    // Format the response
    const formattedResponse: SearchResponse = {
      type: 'car_listing',
      message: '',
      results: cars,
      sessionId: sessionData?.id // Include session ID in response
    };

    return NextResponse.json(formattedResponse);
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
