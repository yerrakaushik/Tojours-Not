-- =============================================================================
-- BLOOM & CHARM — FULL DATABASE SETUP (Single Script)
-- =============================================================================
-- Run this ONE script in Supabase SQL Editor. It creates everything from scratch.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cod BOOLEAN DEFAULT FALSE,
  icon TEXT,
  image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_options (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  points INTEGER DEFAULT 0,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT pincode_format CHECK (pincode IS NULL OR pincode ~ '^[1-9][0-9]{5}$')
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  coupon_id UUID REFERENCES coupons(id),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'Processing',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address JSONB,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL CHECK (status IN ('Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
  changed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Admin check (SECURITY DEFINER bypasses RLS — prevents circular recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Coupon usage increment
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET used_count = used_count + 1 WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- ENABLE RLS ON ALL TABLES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Products
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins insert products" ON products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update products" ON products FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete products" ON products FOR DELETE USING (public.is_admin());

-- Custom Options
CREATE POLICY "Public read custom_options" ON custom_options FOR SELECT USING (true);
CREATE POLICY "Admins insert custom_options" ON custom_options FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update custom_options" ON custom_options FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete custom_options" ON custom_options FOR DELETE USING (public.is_admin());

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update all profiles" ON profiles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Coupons
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admins insert coupons" ON coupons FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update coupons" ON coupons FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete coupons" ON coupons FOR DELETE USING (public.is_admin());

-- Orders
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update orders" ON orders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Order Items
CREATE POLICY "Users view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users insert order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins view all order items" ON order_items FOR SELECT USING (public.is_admin());

-- Order Status History
CREATE POLICY "Users view own status history" ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users insert status history" ON order_status_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins manage status history" ON order_status_history FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Site Content
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site_content" ON site_content FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Reviews
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Users insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all reviews" ON reviews FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update reviews" ON reviews FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete reviews" ON reviews FOR DELETE USING (public.is_admin());

-- Support Messages
CREATE POLICY "Public read support msgs" ON support_messages FOR SELECT USING (true);
CREATE POLICY "Users insert support msgs" ON support_messages FOR INSERT WITH CHECK (sender_type = 'user');
CREATE POLICY "Admins manage support msgs" ON support_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO products (name, category, price, cod, icon, image) VALUES
('Pastel Pink Rose', 'Bouquets', 24.00, false, '🌹', 'https://images.unsplash.com/photo-1562799102-87703936761d?w=500&q=80'),
('Golden Sunflower', 'Bouquets', 30.00, false, '🌻', 'https://images.unsplash.com/photo-1594327171714-56773e0df923?w=500&q=80'),
('Cute Cat Charm', 'Key chains', 12.00, true, '🐱', 'https://images.unsplash.com/photo-1584992357753-379d70900016?w=500&q=80'),
('Heart Lock Key', 'Key chains', 15.00, true, '🔐', 'https://images.unsplash.com/photo-1620336655643-77d8392be30d?w=500&q=80'),
('Satin Ribbon Bag', 'Bags', 45.00, false, '👜', 'https://images.unsplash.com/photo-1584917865445-6710a95753c5?w=500&q=80'),
('Velvet Mini Bag', 'Bags', 38.00, false, '👛', 'https://images.unsplash.com/photo-1566231328211-319c2e8b73b2?w=500&q=80'),
('Moonlight Lily', 'Bouquets', 28.00, false, '⚜️', 'https://images.unsplash.com/photo-1508777466873-e89977be7be7?w=500&q=80'),
('Starry Keychain', 'Key chains', 10.00, true, '⭐', 'https://images.unsplash.com/photo-1590439471-585960854637?w=500&q=80')
ON CONFLICT DO NOTHING;

INSERT INTO custom_options (type, name, price) VALUES
('flower', 'Pink Rose', 5.00),
('flower', 'White Lily', 6.00),
('flower', 'Blue Hydrangea', 8.00),
('flower', 'Yellow Tulip', 4.50),
('filler', 'Eucalyptus', 2.00),
('filler', 'Baby Breath', 3.00),
('filler', 'Dusty Miller', 2.50),
('paper', 'Kraft Paper', 0.00),
('paper', 'Pink Silk', 2.00),
('paper', 'Clear Celophane', 1.00),
('paper', 'Black Minimalist', 1.50)
ON CONFLICT DO NOTHING;

INSERT INTO payment_methods (name, is_active) VALUES
('Cash on Delivery', true),
('Online Payment', true)
ON CONFLICT DO NOTHING;

INSERT INTO site_content (key, value) VALUES
('hero.badge', 'New Collection: Spring Whispers ✨'),
('hero.headline1', 'Timeless Charms,'),
('hero.headline2', 'Eternal Blooms.'),
('hero.subtext', 'Experience the art of customized gifting. From artisanal bouquets to whimsical keychains, we knot your emotions into a beautiful memory.')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- SET ADMIN (backfill profile for existing auth user + set admin role)
-- ═══════════════════════════════════════════════════════════════════════════

-- First ensure the profile row exists for your user
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'kaushikyerra11@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
