-- GlowGo Mumbai Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beauty profiles
CREATE TABLE beauty_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  skin_type TEXT,
  hair_type TEXT,
  beauty_goals TEXT[] DEFAULT '{}',
  preferred_styles TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  budget_range TEXT,
  preferred_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salon Metrics (auto-calculated)
CREATE TABLE salon_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE UNIQUE,
  total_services INTEGER DEFAULT 0,
  min_price DECIMAL(10,2) DEFAULT 0,
  max_price DECIMAL(10,2) DEFAULT 0,
  avg_price DECIMAL(10,2) DEFAULT 0,
  category_service_counts JSONB DEFAULT '{}',
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  revenue_total DECIMAL(12,2) DEFAULT 0,
  revenue_week DECIMAL(12,2) DEFAULT 0,
  revenue_month DECIMAL(12,2) DEFAULT 0,
  slot_capacity_week INTEGER DEFAULT 0,
  slot_booked_week INTEGER DEFAULT 0,
  slot_utilization_percent DECIMAL(5,2) DEFAULT 0,
  avg_response_time_minutes DECIMAL(8,2) DEFAULT 0,
  trust_score INTEGER DEFAULT 0,
  top_service_id UUID,
  top_service_name TEXT,
  top_category TEXT,
  popular_services JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Metrics (auto-calculated)
CREATE TABLE platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_users INTEGER DEFAULT 0,
  total_owners INTEGER DEFAULT 0,
  total_salons INTEGER DEFAULT 0,
  total_verified_salons INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(14,2) DEFAULT 0,
  revenue_this_month DECIMAL(14,2) DEFAULT 0,
  active_offers INTEGER DEFAULT 0,
  pending_approvals INTEGER DEFAULT 0,
  top_city TEXT,
  top_category TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: update salon metrics updated_at
CREATE OR REPLACE FUNCTION update_salon_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_salon_metrics_modtime
  BEFORE UPDATE ON salon_metrics
  FOR EACH ROW EXECUTE FUNCTION update_salon_metrics_timestamp();

-- Trigger: auto-update salon totals when booking changes
CREATE OR REPLACE FUNCTION recalculate_salon_bookings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE salons SET
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE salon_id = NEW.salon_id)
  WHERE id = NEW.salon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_salon_bookings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION recalculate_salon_bookings();

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  icon TEXT,
  service_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  state TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salons (enhanced)
CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  ai_description TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  area TEXT,
  city TEXT DEFAULT 'Mumbai',
  pincode TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  gender TEXT DEFAULT 'unisex' CHECK (gender IN ('women', 'men', 'unisex')),
  luxury_level TEXT DEFAULT 'mid' CHECK (luxury_level IN ('budget', 'mid', 'premium', 'luxury')),
  offers_home_service BOOLEAN DEFAULT false,
  home_service_radius_km INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  price_range TEXT,
  cover_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  logo_url TEXT,
  cover_url TEXT,
  amenities TEXT[] DEFAULT '{}',
  payment_modes TEXT[] DEFAULT '{}',
  cancellation_policy TEXT DEFAULT 'Free cancellation up to 24 hours before appointment.',
  hygiene_practices TEXT[] DEFAULT '{}',
  working_hours_json JSONB DEFAULT '{}',
  weekly_off TEXT[] DEFAULT '{}',
  staff_count INTEGER DEFAULT 1,
  categories_offered TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services (enhanced with auto final_price)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  ai_description TEXT DEFAULT '',
  category TEXT,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  final_price DECIMAL(10,2) GENERATED ALWAYS AS (price - (price * discount_percent / 100)) STORED,
  gender TEXT DEFAULT 'unisex' CHECK (gender IN ('women', 'men', 'unisex')),
  is_home_service BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on final_price for price range queries
CREATE INDEX idx_services_final_price ON services(final_price);

-- Availability slots (enhanced with capacity tracking)
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  capacity INTEGER DEFAULT 1,
  booked_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings (enhanced)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL DEFAULT CURRENT_TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  total_price DECIMAL(10,2),
  applied_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  service_mode TEXT DEFAULT 'salon' CHECK (service_mode IN ('salon', 'home')),
  address_text TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_reported BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, salon_id)
);

-- Offers (enhanced)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2) DEFAULT 0,
  coupon_code TEXT,
  valid_from DATE NOT NULL,
  valid_till DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  intent JSONB,
  context_used JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_salons_area ON salons(area);
CREATE INDEX idx_salons_city ON salons(city);
CREATE INDEX idx_salons_status ON salons(status);
CREATE INDEX idx_salons_gender ON salons(gender);
CREATE INDEX idx_salons_luxury_level ON salons(luxury_level);
CREATE INDEX idx_salons_rating ON salons(rating_avg DESC);
CREATE INDEX idx_salons_verified ON salons(verified);
CREATE INDEX idx_salons_owner ON salons(owner_id);
CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_salon ON bookings(salon_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_salon ON reviews(salon_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_availability_salon ON availability_slots(salon_id);
CREATE INDEX idx_availability_date ON availability_slots(slot_date);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_offers_salon ON offers(salon_id);
CREATE INDEX idx_offers_active ON offers(is_active);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_salon_metrics_salon ON salon_metrics(salon_id);
CREATE INDEX idx_salon_metrics_trust ON salon_metrics(trust_score DESC);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beauty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified - enhance in production)

-- Users: can read own profile
CREATE POLICY "Users read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Salons: public can read approved; owners can read own; admins can read all
CREATE POLICY "Salons public read approved" ON salons
  FOR SELECT USING (status IN ('approved', 'featured'));
CREATE POLICY "Salons owners read own" ON salons
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Salons admin all" ON salons
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Salons owner insert" ON salons
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Salons owner update" ON salons
  FOR UPDATE USING (auth.uid() = owner_id);

-- Services: public read active; owners manage own
CREATE POLICY "Services public read" ON services
  FOR SELECT USING (true);
CREATE POLICY "Services owner manage" ON services
  FOR ALL USING (EXISTS (
    SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid()
  ));

-- Bookings: users see own; owners see bookings for their salons; admins see all
CREATE POLICY "Bookings user own" ON bookings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Bookings salon owner" ON bookings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM salons WHERE salons.id = bookings.salon_id AND salons.owner_id = auth.uid()
  ));
CREATE POLICY "Bookings user create" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bookings admin all" ON bookings
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Reviews: public read; authenticated users create
CREATE POLICY "Reviews public read" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "Reviews user create" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites: user own
CREATE POLICY "Favorites user own" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Offers: public read active
CREATE POLICY "Offers public read" ON offers
  FOR SELECT USING (is_active = true);
CREATE POLICY "Offers owner manage" ON offers
  FOR ALL USING (EXISTS (
    SELECT 1 FROM salons WHERE salons.id = offers.salon_id AND salons.owner_id = auth.uid()
  ));

-- Availability: public read; owners manage
CREATE POLICY "Availability public read" ON availability_slots
  FOR SELECT USING (true);
CREATE POLICY "Availability owner manage" ON availability_slots
  FOR ALL USING (EXISTS (
    SELECT 1 FROM salons WHERE salons.id = availability_slots.salon_id AND salons.owner_id = auth.uid()
  ));

-- AI conversations: user own
CREATE POLICY "AI conversations user own" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Salon metrics: public read
CREATE POLICY "Salon metrics public read" ON salon_metrics
  FOR SELECT USING (true);

-- Platform metrics: admin only
CREATE POLICY "Platform metrics admin" ON platform_metrics
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
