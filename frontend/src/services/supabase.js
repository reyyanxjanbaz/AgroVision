import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
export const getCrops = async () => {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

export const getCropById = async (id) => {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const getPriceHistory = async (cropId, filters = {}) => {
  let query = supabase
    .from('price_history')
    .select('*')
    .eq('crop_id', cropId)
    .order('date', { ascending: true });
  
  if (filters.region && filters.region !== 'all') {
    query = query.eq('region', filters.region);
  }
  
  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};