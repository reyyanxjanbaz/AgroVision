-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    current_price DECIMAL(10, 2),
    price_change_24h DECIMAL(5, 2),
    price_change_7d DECIMAL(5, 2),
    unit TEXT
);

-- Price History Table
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    region TEXT,
    source TEXT
);

-- Factors Table
CREATE TABLE IF NOT EXISTS factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    factor_type TEXT CHECK (factor_type IN ('weather', 'supply', 'demand', 'policy')),
    description TEXT,
    impact_score DECIMAL(5, 2),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT,
    image_url TEXT,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT
);