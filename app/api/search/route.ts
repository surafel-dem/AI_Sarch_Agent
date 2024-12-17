import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { AgentService } from '@/lib/services/agent';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-clerk-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filters, searchId } = await request.json();
    console.log('API: Received search request with filters:', filters);

    if (!filters) {
      console.log('API: No filters provided');
      return NextResponse.json(
        { error: 'No search filters provided' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabase();

    // Get user's UUID from clerk_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError?.code === 'PGRST116') {
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
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user', details: createError }, { status: 500 });
      }

      userData = newUser;
    } else if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'Database error', details: userError }, { status: 500 });
    }

    // Build Supabase query for cars
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
        // Don't fail the request, just log the error
      }
    }

    // Format response to match SearchResponse type
    return NextResponse.json({
      type: 'car_listing',
      message: cars && cars.length > 0 
        ? `Found ${cars.length} vehicles matching your criteria`
        : 'No results found',
      results: cars || [],
      searchId,
      agentResponse
    });
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
