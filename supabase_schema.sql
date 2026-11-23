-- InvestNest Database Schema (Supabase/PostgreSQL)

-- Properties table (SARFAESI auctions)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  bank TEXT NOT NULL,
  branch TEXT,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial', 'industrial', 'land', 'vehicle')),
  reserve_price BIGINT NOT NULL,
  market_value BIGINT,
  discount DECIMAL(5,2),
  auction_date TIMESTAMPTZ,
  emd BIGINT,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  source_url TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Extended details
  area_sqft INT,
  bedrooms INT,
  bathrooms INT,
  floor TEXT,
  total_floors INT,
  parking TEXT,
  amenities TEXT[] DEFAULT '{}',
  possession_status TEXT,
  construction_year INT,
  facing TEXT,
  furnishing TEXT
);

-- Full-text search index
CREATE INDEX properties_search_idx ON properties USING GIN (
  to_tsvector('english', title || ' ' || location || ' ' || city || ' ' || bank || ' ' || description)
);

-- Indexes for filters
CREATE INDEX properties_city_idx ON properties (city);
CREATE INDEX properties_type_idx ON properties (property_type);
CREATE INDEX properties_bank_idx ON properties (bank);
CREATE INDEX properties_price_idx ON properties (reserve_price);
CREATE INDEX properties_auction_idx ON properties (auction_date);
CREATE INDEX properties_status_idx ON properties (status);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Watchlist
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT,
  property_type TEXT,
  max_price BIGINT,
  min_discount DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Properties: public read
CREATE POLICY "Properties are publicly readable" ON properties FOR SELECT USING (true);

-- User profiles: users can read/update their own
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Watchlist: users can manage their own
CREATE POLICY "Users can read own watchlist" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- Alerts: users can manage their own
CREATE POLICY "Users can read own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON alerts FOR DELETE USING (auth.uid() = user_id);

-- Function to search properties
CREATE OR REPLACE FUNCTION search_properties(
  search_query TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  type_filter TEXT DEFAULT NULL,
  bank_filter TEXT DEFAULT NULL,
  min_price BIGINT DEFAULT NULL,
  max_price BIGINT DEFAULT NULL,
  min_discount DECIMAL DEFAULT NULL,
  sort_by TEXT DEFAULT 'auction_date',
  sort_order TEXT DEFAULT 'asc',
  page_num INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  bank TEXT,
  branch TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  property_type TEXT,
  reserve_price BIGINT,
  market_value BIGINT,
  discount DECIMAL(5,2),
  auction_date TIMESTAMPTZ,
  emd BIGINT,
  description TEXT,
  photos TEXT[],
  source_url TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  total BIGINT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total FROM properties p
  WHERE p.status = 'active'
    AND (search_query IS NULL OR to_tsvector('english', p.title || ' ' || p.location || ' ' || p.city || ' ' || p.bank || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_query))
    AND (city_filter IS NULL OR p.city = city_filter)
    AND (type_filter IS NULL OR p.property_type = type_filter)
    AND (bank_filter IS NULL OR p.bank = bank_filter)
    AND (min_price IS NULL OR p.reserve_price >= min_price)
    AND (max_price IS NULL OR p.reserve_price <= max_price)
    AND (min_discount IS NULL OR p.discount >= min_discount);

  RETURN QUERY
  SELECT p.id, p.title, p.bank, p.branch, p.location, p.city, p.state, p.property_type,
         p.reserve_price, p.market_value, p.discount, p.auction_date, p.emd, p.description,
         p.photos, p.source_url, p.status, p.created_at, total
  FROM properties p
  WHERE p.status = 'active'
    AND (search_query IS NULL OR to_tsvector('english', p.title || ' ' || p.location || ' ' || p.city || ' ' || p.bank || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_query))
    AND (city_filter IS NULL OR p.city = city_filter)
    AND (type_filter IS NULL OR p.property_type = type_filter)
    AND (bank_filter IS NULL OR p.bank = bank_filter)
    AND (min_price IS NULL OR p.reserve_price >= min_price)
    AND (max_price IS NULL OR p.reserve_price <= max_price)
    AND (min_discount IS NULL OR p.discount >= min_discount)
  ORDER BY
    CASE WHEN sort_by = 'auction_date' AND sort_order = 'asc' THEN p.auction_date END ASC,
    CASE WHEN sort_by = 'auction_date' AND sort_order = 'desc' THEN p.auction_date END DESC,
    CASE WHEN sort_by = 'price' AND sort_order = 'asc' THEN p.reserve_price END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'desc' THEN p.reserve_price END DESC,
    CASE WHEN sort_by = 'discount' AND sort_order = 'desc' THEN p.discount END DESC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
END;
$$ LANGUAGE plpgsql;