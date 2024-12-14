import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AgentService } from '@/lib/services/agent';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: Request) {
  try {
    const { filters, searchId } = await request.json();
    console.log('API: Received search request with filters:', filters);

    if (!filters) {
      console.log('API: No filters provided');
      return NextResponse.json(
        { error: 'No search filters provided' },
        { status: 400 }
      );
    }

    // Build Supabase query
    let query = supabase
      .from('car_list')
      .select('*');
    
    console.log('API: Building query for car_list table');

    // Apply filters - only add non-empty filters
    const location = filters.location?.trim();
    const make = filters.make?.trim();
    const model = filters.model?.trim();

    if (location) {
      query = query.ilike('location', `%${location.toLowerCase()}%`);
      console.log('API: Added location filter:', location);
    }

    if (make) {
      query = query.ilike('make', `%${make.toLowerCase()}%`);
      console.log('API: Added make filter:', make);
    }

    if (model) {
      query = query.ilike('model', `%${model.toLowerCase()}%`);
      console.log('API: Added model filter:', model);
    }

    // Only add numeric filters if they are actual numbers
    if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
      query = query.gte('price', Number(filters.minPrice));
      console.log('API: Added min price filter:', filters.minPrice);
    }
    if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
      query = query.lte('price', Number(filters.maxPrice));
      console.log('API: Added max price filter:', filters.maxPrice);
    }

    if (filters.minYear && !isNaN(Number(filters.minYear))) {
      query = query.gte('year', Number(filters.minYear));
      console.log('API: Added min year filter:', filters.minYear);
    }
    if (filters.maxYear && !isNaN(Number(filters.maxYear))) {
      query = query.lte('year', Number(filters.maxYear));
      console.log('API: Added max year filter:', filters.maxYear);
    }

    // Execute query
    console.log('API: Executing Supabase query...');
    const { data: cars, error: queryError } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (queryError) {
      console.error('API: Database query error:', queryError);
      return NextResponse.json(
        { 
          error: queryError.message || 'Database query failed',
          details: queryError 
        },
        { status: 500 }
      );
    }

    console.log('API: Query successful, found', cars?.length || 0, 'results');

    let agentResponse = null;
    if (cars && cars.length > 0) {
      try {
        // Invoke agent service
        const agentService = AgentService.getInstance();
        agentResponse = await agentService.invoke(searchId, filters, cars);
        console.log('API: Agent response received');
      } catch (error) {
        console.error('API: Agent service error:', error);
        // Don't fail the whole request if agent fails
        agentResponse = { error: 'Failed to get AI insights' };
      }
    }

    if (!cars || cars.length === 0) {
      console.log('API: No results found');
      return NextResponse.json(
        { 
          message: 'No results found',
          results: [],
          searchId,
          agentResponse: null
        }
      );
    }

    const response = {
      type: 'car_listing',
      message: `Found ${cars.length} vehicles`,
      results: cars,
      searchId,
      agentResponse
    };

    console.log('API: Sending response with', cars.length, 'results');
    return NextResponse.json(response);

  } catch (error) {
    console.error('API: Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
