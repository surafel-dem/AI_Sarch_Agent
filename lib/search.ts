import { SupabaseClient } from '@supabase/supabase-js';
import { CarSpecs } from '@/types/search';

export async function searchCars(supabase: SupabaseClient, filters: CarSpecs) {
  let query = supabase
    .from('car_list')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  console.log('API: Building car search query');

  // Apply numeric filters first
  if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
    query = query.gte('price', Number(filters.minPrice));
  }
  if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
    query = query.lte('price', Number(filters.maxPrice));
  }
  if (filters.minYear && !isNaN(Number(filters.minYear))) {
    query = query.gte('year', Number(filters.minYear));
  }
  if (filters.maxYear && !isNaN(Number(filters.maxYear))) {
    query = query.lte('year', Number(filters.maxYear));
  }

  // Apply text filters
  const location = filters.location?.trim().toLowerCase();
  const make = filters.make?.trim().toLowerCase();
  const model = filters.model?.trim().toLowerCase();

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  if (make) {
    query = query.ilike('make', `%${make}%`);
  }
  if (model) {
    query = query.ilike('model', `%${model}%`);
  }

  const { data: cars, error } = await query;

  if (error) {
    throw new Error(`Failed to search cars: ${error.message}`);
  }

  return { cars, error: null };
}