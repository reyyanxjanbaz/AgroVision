const supabase = require('../config/supabase');

class PriceHistory {
  static async getByCropId(cropId, filters = {}) {
    let query = supabase
      .from('price_history')
      .select('*')
      .eq('crop_id', cropId)
      .order('date', { ascending: true });

    if (filters.region && filters.region !== 'all') {
      query = query.eq('region', filters.region);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

module.exports = PriceHistory;