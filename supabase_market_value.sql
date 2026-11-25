-- Market Value Sources Table (for Zestimate audit trail)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS market_value_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,        -- 'City Average', 'Circle Rate', 'MagicBricks', '99acres'
    source_url TEXT,                  -- URL of comparable listing or data source
    listed_price BIGINT,              -- Price of comparable property
    price_per_sqft INT,               -- Price per sq ft
    area_sqft INT,                    -- Area of comparable property
    location TEXT,                    -- Location of comparable
    methodology TEXT,                 -- How the value was estimated
    estimated_value BIGINT,           -- Estimated market value for this property
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_market_value_property ON market_value_sources(property_id);

-- RLS
ALTER TABLE market_value_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read market values" ON market_value_sources;
CREATE POLICY "Public read market values" ON market_value_sources
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert market values" ON market_value_sources;
CREATE POLICY "Admin insert market values" ON market_value_sources
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Also add market_value_estimate column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS market_value_estimate BIGINT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS market_value_source TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deal_score INT;

-- Scrape logs table (if not already created)
CREATE TABLE IF NOT EXISTS scrape_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    total_fetched INT,
    new_properties INT,
    updated_properties INT,
    removed_properties INT,
    price_changes INT,
    duration_seconds INT
);