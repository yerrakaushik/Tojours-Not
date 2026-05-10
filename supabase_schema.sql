-- Create products table
CREATE TABLE products (
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

-- Seed products
INSERT INTO products (name, category, price, cod, icon, image) VALUES
('Pastel Pink Rose', 'Bouquets', 24.00, false, '🌹', 'https://images.unsplash.com/photo-1562799102-87703936761d?w=500&q=80'),
('Golden Sunflower', 'Bouquets', 30.00, false, '🌻', 'https://images.unsplash.com/photo-1594327171714-56773e0df923?w=500&q=80'),
('Cute Cat Charm', 'Key chains', 12.00, true, '🐱', 'https://images.unsplash.com/photo-1584992357753-379d70900016?w=500&q=80'),
('Heart Lock Key', 'Key chains', 15.00, true, '🔐', 'https://images.unsplash.com/photo-1620336655643-77d8392be30d?w=500&q=80'),
('Satin Ribbon Bag', 'Bags', 45.00, false, '👜', 'https://images.unsplash.com/photo-1584917865445-6710a95753c5?w=500&q=80'),
('Velvet Mini Bag', 'Bags', 38.00, false, '👛', 'https://images.unsplash.com/photo-1566231328211-319c2e8b73b2?w=500&q=80'),
('Moonlight Lily', 'Bouquets', 28.00, false, '⚜️', 'https://images.unsplash.com/photo-1508777466873-e89977be7be7?w=500&q=80'),
('Starry Keychain', 'Key chains', 10.00, true, '⭐', 'https://images.unsplash.com/photo-1590439471-585960854637?w=500&q=80');

-- Create custom_options table for the bouquet builder
CREATE TABLE custom_options (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type TEXT NOT NULL, -- 'flower', 'filler', 'paper'
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
('paper', 'Black Minimalist', 1.50);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  points INTEGER DEFAULT 0,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'Processing',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  icon TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_options" ON custom_options FOR SELECT USING (true);
CREATE POLICY "Allow users to view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow users to view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to view their own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Allow public to insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to insert order items" ON order_items FOR INSERT WITH CHECK (true);
