const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function updatePriceHistory() {
  try {
    console.log('📊 Updating price history to include latest dates...');

    // Get all crops
    const { data: crops, error: cropsError } = await supabase
      .from('crops')
      .select('*');

    if (cropsError) throw cropsError;
    console.log(`Found ${crops.length} crops to update`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const crop of crops) {
      // Get the latest price record for this crop
      const { data: latestPrice, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .eq('crop_id', crop.id)
        .order('date', { ascending: false })
        .limit(1);

      if (priceError) throw priceError;

      if (!latestPrice || latestPrice.length === 0) {
        console.log(`  ⚠️ No price history found for ${crop.name}, generating full history...`);
        
        // Generate 90 days of history
        const history = [];
        let currentPrice = crop.current_price * 0.9;
        const basePrice = crop.current_price;
        
        for (let i = 90; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          const dailyChange = (Math.random() - 0.48) * (basePrice * 0.02);
          currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + dailyChange));
          
          history.push({
            crop_id: crop.id,
            price: parseFloat(currentPrice.toFixed(2)),
            date: date.toISOString().split('T')[0],
            region: ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)]
          });
        }

        const { error: insertError } = await supabase.from('price_history').insert(history);
        if (insertError) throw insertError;
        
        console.log(`  ✅ Generated ${history.length} price records for ${crop.name}`);
        continue;
      }

      const lastDate = new Date(latestPrice[0].date);
      lastDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 0) {
        console.log(`  ✅ ${crop.name} is already up to date`);
        continue;
      }

      console.log(`  📅 ${crop.name}: Adding ${daysDiff} days of price data (from ${latestPrice[0].date} to today)`);

      // Generate new price records
      const newPrices = [];
      let currentPrice = latestPrice[0].price;
      const basePrice = crop.current_price;

      for (let i = 1; i <= daysDiff; i++) {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + i);

        // Realistic daily price movement
        const dailyChange = (Math.random() - 0.48) * (basePrice * 0.015);
        currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + dailyChange));

        newPrices.push({
          crop_id: crop.id,
          price: parseFloat(currentPrice.toFixed(2)),
          date: date.toISOString().split('T')[0],
          region: ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)]
        });
      }

      // Insert new prices
      const { error: insertError } = await supabase.from('price_history').insert(newPrices);
      if (insertError) throw insertError;

      // Update crop's current price to the latest
      const { error: updateError } = await supabase
        .from('crops')
        .update({ 
          current_price: currentPrice,
          price_change_24h: parseFloat(((currentPrice - latestPrice[0].price) / latestPrice[0].price * 100).toFixed(2))
        })
        .eq('id', crop.id);

      if (updateError) throw updateError;

      console.log(`  ✅ Added ${newPrices.length} new price records for ${crop.name}`);
    }

    console.log('🎉 Price history update completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update error:', error);
    process.exit(1);
  }
}

updatePriceHistory();
