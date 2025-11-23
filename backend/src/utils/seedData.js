const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Sample crops to seed
const crops = [
  {
    name: 'Wheat',
    category: 'Grains',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    description: 'Staple grain crop used for food and feed',
    current_price: 2145.50,
    price_change_24h: 2.5,
    price_change_7d: 5.2,
    unit: '₹/quintal'
  },
  {
    name: 'Rice',
    category: 'Grains',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    description: 'Major cereal crop and primary food source',
    current_price: 3250.00,
    price_change_24h: -1.2,
    price_change_7d: 0.8,
    unit: '₹/quintal'
  },
  {
    name: 'Corn',
    category: 'Grains',
    image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    description: 'Versatile crop used for food, feed, and fuel',
    current_price: 1890.75,
    price_change_24h: 3.8,
    price_change_7d: 7.5,
    unit: '₹/quintal'
  },
  {
    name: 'Soybeans',
    category: 'Pulses',
    image_url: 'https://images.unsplash.com/photo-1589543965688-b7d1c0c2c1c9?w=400',
    description: 'Protein-rich legume used in various products',
    current_price: 4520.00,
    price_change_24h: 1.5,
    price_change_7d: 3.2,
    unit: '₹/quintal'
  },
  {
    name: 'Cotton',
    category: 'Fiber',
    image_url: 'https://images.unsplash.com/photo-1583829365719-45d20e2d55f7?w=400',
    description: 'Natural fiber crop for textile production',
    current_price: 5680.00,
    price_change_24h: -2.1,
    price_change_7d: -4.5,
    unit: '₹/quintal'
  },
  {
    name: 'Sugarcane',
    category: 'Cash Crops',
    image_url: 'https://images.unsplash.com/photo-1568392830939-0a8e5efe4e37?w=400',
    description: 'Major source of sugar production',
    current_price: 350.00,
    price_change_24h: 0.5,
    price_change_7d: 1.2,
    unit: '₹/ton'
  }
];

// Generate sample price history
function generatePriceHistory(basePrice, cropId, days = 365) {
  const history = [];
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Add some randomness
    const change = (Math.random() - 0.5) * 50;
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + change));

    history.push({
      crop_id: cropId,
      price: parseFloat(currentPrice.toFixed(2)),
      date: date.toISOString(),
      region: ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)],
      source: 'market_data'
    });
  }

  return history;
}

// Generate sample factors
function generateFactors(cropId) {
  const factorTypes = ['weather', 'demand', 'supply', 'policy'];
  const descriptions = {
    weather: 'Weather conditions affecting crop growth',
    demand: 'Market demand fluctuations',
    supply: 'Supply chain dynamics',
    policy: 'Government policy changes'
  };

  return factorTypes.map(type => ({
    crop_id: cropId,
    factor_type: type,
    description: descriptions[type],
    impact_score: parseFloat(((Math.random() - 0.5) * 20).toFixed(2)),
    date: new Date().toISOString()
  }));
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional - remove in production)
    console.log('Clearing existing data...');
    await supabase.from('price_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('factors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('news').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('crops').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert crops
    console.log('Inserting crops...');
    const { data: insertedCrops, error: cropsError } = await supabase
      .from('crops')
      .insert(crops)
      .select();

    if (cropsError) throw cropsError;
    console.log(`✅ Inserted ${insertedCrops.length} crops`);

    // Insert price history for each crop
    console.log('Generating price history...');
    for (const crop of insertedCrops) {
      const history = generatePriceHistory(crop.current_price, crop.id, 365);
      
      // Insert in batches
      const batchSize = 100;
      for (let i = 0; i < history.length; i += batchSize) {
        const batch = history.slice(i, i + batchSize);
        const { error } = await supabase.from('price_history').insert(batch);
        if (error) throw error;
      }
      
      console.log(`  ✅ Generated ${history.length} price records for ${crop.name}`);
    }

    // Insert factors
    console.log('Generating factors...');
    for (const crop of insertedCrops) {
      const factors = generateFactors(crop.id);
      const { error } = await supabase.from('factors').insert(factors);
      if (error) throw error;
      console.log(`  ✅ Generated ${factors.length} factors for ${crop.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();