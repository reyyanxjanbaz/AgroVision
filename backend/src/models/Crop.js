const supabase = require('../config/supabase');

class Crop {
  static async getAll(search) {
    let query = supabase
      .from('crops')
      .select('*')
      .order('name');
    
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Crop;