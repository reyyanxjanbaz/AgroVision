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
    current_price: 2145.50,
    price_change_24h: 2.5,
    price_change_7d: 5.2,
    unit: '₹/quintal'
  },
  {
    name: 'Rice',
    category: 'Grains',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    current_price: 3250.00,
    price_change_24h: -1.2,
    price_change_7d: 0.8,
    unit: '₹/quintal'
  },
  {
    name: 'Corn',
    category: 'Grains',
    image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    current_price: 1890.75,
    price_change_24h: 3.8,
    price_change_7d: 7.5,
    unit: '₹/quintal'
  },
  {
    name: 'Soybeans',
    category: 'Pulses',
    image_url: 'https://cdn.pixabay.com/photo/2016/09/19/20/09/soy-1681284_1280.jpg',
    current_price: 4520.00,
    price_change_24h: 1.5,
    price_change_7d: 3.2,
    unit: '₹/quintal'
  },
  {
    name: 'Cotton',
    category: 'Fiber',
    image_url: 'https://cdn.pixabay.com/photo/2014/03/26/17/55/cotton-298925_1280.jpg',
    current_price: 5680.00,
    price_change_24h: -2.1,
    price_change_7d: -4.5,
    unit: '₹/quintal'
  },
  {
    name: 'Sugarcane',
    category: 'Cash Crops',
    image_url: 'https://cdn.pixabay.com/photo/2016/10/25/12/26/sugar-cane-1768652_1280.jpg',
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
      region: ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)]
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

// Generate sample news
function generateNews(cropId, cropName) {
  const newsItems = [
    {
      title: `Record ${cropName} Production Expected`,
      summary: `Experts predict a bumper harvest for ${cropName} this season due to favorable weather conditions.`,
      source: 'AgriNews',
      url: 'https://example.com/news/1'
    },
    {
      title: `New Export Policy for ${cropName}`,
      summary: `Government announces new export incentives for ${cropName} farmers to boost international trade.`,
      source: 'FarmDaily',
      url: 'https://example.com/news/2'
    },
    {
      title: `Global ${cropName} Prices Surge`,
      summary: `International demand for ${cropName} pushes prices to a 5-year high.`,
      source: 'MarketWatch',
      url: 'https://example.com/news/3'
    }
  ];

  return newsItems.map(item => ({
    crop_id: cropId,
    ...item,
    image_url: `https://source.unsplash.com/400x300/?${cropName},farm`,
    published_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
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

    // Insert news
    console.log('Generating news...');
    for (const crop of insertedCrops) {
      const news = generateNews(crop.id, crop.name);
      const { error } = await supabase.from('news').insert(news);
      if (error) throw error;
      console.log(`  ✅ Generated ${news.length} news items for ${crop.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();