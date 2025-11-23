-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crops Table
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  current_price DECIMAL,
  price_change_24h DECIMAL,
  price_change_7d DECIMAL,
  unit TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price History Table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  price DECIMAL NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  region TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factors Table
CREATE TABLE IF NOT EXISTS factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  factor_type TEXT, -- weather, demand, supply, policy
  description TEXT,
  impact_score DECIMAL, -- positive or negative impact
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  url TEXT,
  image_url TEXT,
  source TEXT,
  published_date TIMESTAMP WITH TIME ZONE
);
