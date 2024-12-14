import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SearchResponse } from '@/types/search';

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
    const { filters } = await request.json();

    // Build Supabase query
    let query = supabase
      .from('car_list')
      .select('*');

    // Apply filters
    if (filters.location?.trim()) {
      const location = filters.location.trim().toLowerCase();
      query = query.or(`location.ilike.%${location}%,county.ilike.%${location}%,city.ilike.%${location}%`);
    }

    if (filters.make?.trim()) {
      const make = filters.make.trim().toLowerCase();
      query = query.ilike('make', `%${make}%`);
    }

    if (filters.model?.trim()) {
      const model = filters.model.trim().toLowerCase();
      query = query.ilike('model', `%${model}%`);
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.minYear) {
      query = query.gte('year', filters.minYear);
    }
    if (filters.maxYear) {
      query = query.lte('year', filters.maxYear);
    }

    // Execute query
    const { data: cars, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to search cars' },
        { status: 500 }
      );
    }

    const response: SearchResponse = {
      type: 'car_listing',
      message: '',
      results: cars || []
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}
