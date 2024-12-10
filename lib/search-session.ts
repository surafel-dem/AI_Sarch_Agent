import { supabase } from './supabase';
import { CarSpecs } from '@/types/car';

interface SearchSessionData {
  clerk_id: string;
  filters: {
    original_filters: CarSpecs;
    applied_filters: Record<string, any>;
    query_timestamp: string;
    search_source: 'web' | 'chat' | 'api';
  };
  results: {
    count: number;
    cars: Array<{
      id: string;
      make: string;
      model: string | null;
      year: number | null;
      price: number | null;
      engine: number | null;
      location: string | null;
      seller: string | null;
      description: string | null;
      url: string | null;
      transmission: string | null;
      listing_status: string | null;
    }>;
  };
  results_count: number;
  status: 'completed' | 'no_results' | 'failed';
}

interface SearchAnalysis {
  currentSearch: {
    resultCount: number;
    topMakes: string[];
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
  };
  historicalPatterns: {
    averageResultCount: number;
    commonFilters: Record<string, any>;
    pricePreferences: {
      averagePrice: number;
      minPrice: number;
      maxPrice: number;
    };
  } | null;
}

export async function trackSearchSession(
  clerkId: string,
  searchParams: CarSpecs,
  appliedFilters: Record<string, any>,
  results: any[]
): Promise<{ data: any; error: any }> {
  console.log('Starting trackSearchSession with:', {
    clerkId,
    filtersCount: Object.keys(searchParams).length,
    resultsCount: results?.length
  });

  const sessionData: SearchSessionData = {
    clerk_id: clerkId,
    filters: {
      original_filters: searchParams,
      applied_filters: appliedFilters,
      query_timestamp: new Date().toISOString(),
      search_source: 'web'
    },
    results: {
      count: results?.length || 0,
      cars: results?.map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        engine: car.engine,
        location: car.location,
        seller: car.seller,
        description: car.description,
        url: car.url,
        transmission: car.transmission,
        listing_status: car.listing_status
      })) || []
    },
    results_count: results?.length || 0,
    status: results && results.length > 0 ? 'completed' : 'no_results'
  };

  console.log('Prepared session data:', {
    clerk_id: sessionData.clerk_id,
    filters_summary: {
      original: Object.keys(sessionData.filters.original_filters),
      applied: Object.keys(sessionData.filters.applied_filters)
    },
    results_count: sessionData.results_count
  });

  try {
    const { data, error } = await supabase
      .from('search_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { data: null, error };
    }

    console.log('Successfully inserted search session:', {
      id: data.id,
      clerk_id: data.clerk_id,
      status: data.status
    });

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in trackSearchSession:', error);
    return { data: null, error };
  }
}

export async function trackFailedSearch(
  clerkId: string,
  searchParams: CarSpecs,
  appliedFilters: Record<string, any>
): Promise<void> {
  const failedSessionData: SearchSessionData = {
    clerk_id: clerkId,
    filters: {
      original_filters: searchParams,
      applied_filters: appliedFilters,
      query_timestamp: new Date().toISOString(),
      search_source: 'web'
    },
    results: {
      count: 0,
      cars: []
    },
    results_count: 0,
    status: 'failed'
  };

  await supabase
    .from('search_sessions')
    .insert(failedSessionData);
}

export async function analyzeSearchResults(sessionId: string): Promise<SearchAnalysis | null> {
  try {
    // Get the current session data
    const { data: currentSession } = await supabase
      .from('search_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!currentSession) return null;

    // Get user's previous sessions
    const { data: previousSessions } = await supabase
      .from('search_sessions')
      .select('*')
      .eq('clerk_id', currentSession.clerk_id)
      .neq('id', sessionId)
      .order('created_at', { ascending: false })
      .limit(5);

    const analysis: SearchAnalysis = {
      currentSearch: {
        resultCount: currentSession.results_count,
        topMakes: getTopMakes(currentSession.results.cars),
        priceRange: getPriceRange(currentSession.results.cars)
      },
      historicalPatterns: previousSessions ? {
        averageResultCount: calculateAverageResults(previousSessions),
        commonFilters: findCommonFilters(previousSessions),
        pricePreferences: analyzePricePreferences(previousSessions)
      } : null
    };

    return analysis;
  } catch (error) {
    console.error('Error analyzing search results:', error);
    return null;
  }
}

// Helper functions for analysis
function getTopMakes(cars: any[]): string[] {
  const makes = cars.map(car => car.make);
  return [...new Set(makes)].slice(0, 3);
}

function getPriceRange(cars: any[]): { min: number; max: number; average: number } {
  const prices = cars.map(car => car.price).filter(Boolean);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: prices.reduce((a, b) => a + b, 0) / prices.length
  };
}

function calculateAverageResults(sessions: any[]): number {
  return sessions.reduce((acc, session) => acc + session.results_count, 0) / sessions.length;
}

function findCommonFilters(sessions: any[]): Record<string, any> {
  const filters = sessions.map(session => session.filters.applied_filters);
  const commonFilters: Record<string, any> = {};

  // Count occurrences of each filter
  filters.forEach(filter => {
    Object.entries(filter).forEach(([key, value]) => {
      if (!commonFilters[key]) {
        commonFilters[key] = {};
      }
      const valueStr = JSON.stringify(value);
      commonFilters[key][valueStr] = (commonFilters[key][valueStr] || 0) + 1;
    });
  });

  // Find most common value for each filter
  return Object.entries(commonFilters).reduce((acc, [key, values]) => {
    const mostCommon = Object.entries(values)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];
    acc[key] = JSON.parse(mostCommon[0]);
    return acc;
  }, {} as Record<string, any>);
}

function analyzePricePreferences(sessions: any[]): { averagePrice: number; minPrice: number; maxPrice: number } {
  const prices = sessions.flatMap(session => 
    session.results.cars.map((car: any) => car.price)
  ).filter(Boolean);
  
  return {
    averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices)
  };
}
