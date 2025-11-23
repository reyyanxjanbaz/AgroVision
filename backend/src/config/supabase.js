const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

try {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_url')) {
    console.warn('⚠️  Supabase credentials missing or invalid. Database features will not work.');
    // Create a dummy object to prevent crash on startup, but methods will fail
    supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('DB not connected') })
            })
          }),
          order: () => Promise.resolve({ data: [], error: new Error('DB not connected') })
        })
      })
    };
  } else {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.error('Supabase initialization error:', error.message);
  supabase = { from: () => ({ select: () => Promise.resolve({ data: [], error }) }) };
}

module.exports = supabase;