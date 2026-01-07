export const getCropImage = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  
  // Grains
  if (lower.includes('wheat')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop';
  if (lower.includes('corn') || lower.includes('maize')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop';
  if (lower.includes('rice') || lower.includes('paddy')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop';
  if (lower.includes('barley')) return 'https://images.unsplash.com/photo-1563205764-67c293674646?w=400&h=400&fit=crop';
  
  // Cash Crops
  if (lower.includes('cotton')) return 'https://images.unsplash.com/photo-1593452243765-b169543e475e?w=400&h=400&fit=crop';
  if (lower.includes('sugarcane')) return 'https://images.unsplash.com/photo-1601625463687-25541fb72f62?w=400&h=400&fit=crop';
  if (lower.includes('coffee')) return 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&h=400&fit=crop';
  if (lower.includes('tea')) return 'https://images.unsplash.com/photo-1594631252845-d9b50e43606d?w=400&h=400&fit=crop';
  
  // Pulses & Legumes
  if (lower.includes('soyabean') || lower.includes('soybean')) return 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop';
  if (lower.includes('chickpea') || lower.includes('chana')) return 'https://images.unsplash.com/photo-1588613488219-4828695034c5?w=400&h=400&fit=crop';
  
  // Vegetables
  if (lower.includes('onion')) return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop';
  if (lower.includes('potato')) return 'https://images.unsplash.com/photo-1518977676605-dc56fe611136?w=400&h=400&fit=crop';
  if (lower.includes('tomato')) return 'https://images.unsplash.com/photo-1592921870789-04563d5503ce?w=400&h=400&fit=crop';
  
  // Oilseeds
  if (lower.includes('mustard')) return 'https://images.unsplash.com/photo-1507724732152-0cf754907a3c?w=400&h=400&fit=crop';
  if (lower.includes('groundnut') || lower.includes('peanut')) return 'https://images.unsplash.com/photo-1567492985871-6c23ce087095?w=400&h=400&fit=crop';
  
  return null;
};
