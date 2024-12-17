import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getUserData } from '@/lib/user';
import { searchCars } from '@/lib/search';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filters, searchId, userId } = body;

    if (!filters || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    if (!supabase) {
      console.error('API: Failed to create Supabase client');
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    console.log('API: Starting parallel queries for search:', searchId);

    // Start both queries in parallel
    const [userResult, carsResult] = await Promise.all([
      getUserData(supabase, userId).catch(error => {
        console.error('API: User query error:', error);
        return { error: 'Failed to fetch user data' };
      }),
      searchCars(supabase, filters).catch(error => {
        console.error('API: Car search error:', error);
        return { error: 'Failed to search cars' };
      })
    ]);

    if (userResult.error) {
      return NextResponse.json({ error: userResult.error }, { status: 500 });
    }

    if (carsResult.error) {
      return NextResponse.json({ error: carsResult.error }, { status: 500 });
    }

    const cars = carsResult.cars || [];
    console.log('API: Query successful, found', cars.length, 'results');

    // Return car results immediately
    return NextResponse.json({
      message: cars.length > 0 
        ? `Found ${cars.length} matching vehicles` 
        : 'No results found',
      results: cars,
      searchId
    });

  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    );
  }
}
