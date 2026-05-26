-- =============================================================================
-- ADMIN ACCESS FIX - Run this in Supabase SQL Editor
-- =============================================================================
-- Root cause: RLS policies on "profiles" table use subqueries against "profiles"
-- itself, creating circular dependency. PostgreSQL RLS prevents a policy from
-- reading the same table it guards unless we use a SECURITY DEFINER function.
--
-- This script:
--   1. Creates a SECURITY DEFINER helper function to check admin role
--   2. Drops and recreates ALL admin policies using the helper
--   3. Fixes missing INSERT policies (order_items, order_status_history)
--   4. Ensures profiles RLS allows admin self-reads without recursion
-- =============================================================================

-- ─── STEP 1: Create a SECURITY DEFINER function to check admin role ─────────
-- This function bypasses RLS on the profiles table, breaking the circular dep.
-- SECURITY DEFINER = runs with the privileges of the function owner (postgres),
-- so it can always read the profiles table regardless of RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── STEP 2: Fix PROFILES table policies ────────────────────────────────────
-- Drop all existing profile policies to start clean
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow admins to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;

-- Users can always read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view ALL profiles (uses the SECURITY DEFINER function)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Admins can update ALL profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── STEP 3: Fix PRODUCTS policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "Allow admins to manage products" ON products;
-- Keep public read
DROP POLICY IF EXISTS "Allow public read access on products" ON products;
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Admins manage products"
  ON products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins update products"
  ON products FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete products"
  ON products FOR DELETE
  USING (public.is_admin());

-- ─── STEP 4: Fix CUSTOM_OPTIONS policies ────────────────────────────────────
DROP POLICY IF EXISTS "Allow admins to manage custom_options" ON custom_options;
DROP POLICY IF EXISTS "Allow public read access on custom_options" ON custom_options;

CREATE POLICY "Public can read custom_options"
  ON custom_options FOR SELECT USING (true);

CREATE POLICY "Admins manage custom_options"
  ON custom_options FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins update custom_options"
  ON custom_options FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete custom_options"
  ON custom_options FOR DELETE
  USING (public.is_admin());

-- ─── STEP 5: Fix COUPONS policies ──────────────────────────────────────────
DROP POLICY IF EXISTS "Allow admins to manage coupons" ON coupons;
DROP POLICY IF EXISTS "Allow public read access on coupons" ON coupons;

CREATE POLICY "Public can read coupons"
  ON coupons FOR SELECT USING (true);

CREATE POLICY "Admins manage coupons"
  ON coupons FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins update coupons"
  ON coupons FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete coupons"
  ON coupons FOR DELETE
  USING (public.is_admin());

-- ─── STEP 6: Fix ORDERS policies ───────────────────────────────────────────
DROP POLICY IF EXISTS "Allow admins to view all orders" ON orders;
DROP POLICY IF EXISTS "Allow admins to update orders" ON orders;
DROP POLICY IF EXISTS "Allow users to view their own orders" ON orders;
DROP POLICY IF EXISTS "Allow users to create their own orders" ON orders;

-- Users can view their own orders
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view ALL orders
CREATE POLICY "Admins view all orders"
  ON orders FOR SELECT
  USING (public.is_admin());

-- Admins can update ALL orders (for status changes)
CREATE POLICY "Admins update all orders"
  ON orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── STEP 7: Fix ORDER_ITEMS policies ──────────────────────────────────────
DROP POLICY IF EXISTS "Allow admins to view all order items" ON order_items;
DROP POLICY IF EXISTS "Allow users to view their own order items" ON order_items;

-- Users can view their own order items
CREATE POLICY "Users view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Users can INSERT order items (needed during checkout!)
CREATE POLICY "Users insert order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins view all order items"
  ON order_items FOR SELECT
  USING (public.is_admin());

-- ─── STEP 8: Fix ORDER_STATUS_HISTORY policies ─────────────────────────────
DROP POLICY IF EXISTS "Allow admins to manage order status history" ON order_status_history;
DROP POLICY IF EXISTS "Allow users to view their own order status history" ON order_status_history;

-- Users can view their own order status history
CREATE POLICY "Users view own order status history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Users can INSERT status history (initial "Processing" entry during checkout)
CREATE POLICY "Users insert order status history"
  ON order_status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can do everything with status history
CREATE POLICY "Admins manage order status history"
  ON order_status_history FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── STEP 9: Fix SITE_CONTENT policies ─────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read access on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow admins to manage site_content" ON site_content;

CREATE POLICY "Public can read site_content"
  ON site_content FOR SELECT USING (true);

CREATE POLICY "Admins manage site_content"
  ON site_content FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── STEP 10: Fix REVIEWS policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read access on approved reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admins to manage reviews" ON reviews;

-- Public can read approved reviews
CREATE POLICY "Public read approved reviews"
  ON reviews FOR SELECT
  USING (approved = true);

-- Authenticated users can submit reviews
CREATE POLICY "Users insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can see ALL reviews (including unapproved) and manage them
CREATE POLICY "Admins manage reviews"
  ON reviews FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins update reviews"
  ON reviews FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete reviews"
  ON reviews FOR DELETE
  USING (public.is_admin());

-- ─── STEP 11: Fix SUPPORT_MESSAGES policies ────────────────────────────────
DROP POLICY IF EXISTS "Allow users to view messages" ON support_messages;
DROP POLICY IF EXISTS "Allow users to insert messages" ON support_messages;
DROP POLICY IF EXISTS "Allow admins to manage messages" ON support_messages;
DROP POLICY IF EXISTS "Support Read Policy" ON support_messages;
DROP POLICY IF EXISTS "Support Insert Policy" ON support_messages;
DROP POLICY IF EXISTS "Admins manage messages" ON support_messages;

-- Everyone can read support messages (for chat functionality)
CREATE POLICY "Public read support messages"
  ON support_messages FOR SELECT USING (true);

-- Users can send messages
CREATE POLICY "Users insert support messages"
  ON support_messages FOR INSERT
  WITH CHECK (sender_type = 'user');

-- Admins can do everything with messages
CREATE POLICY "Admins manage support messages"
  ON support_messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── STEP 12: Ensure the auth trigger is correct ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
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

-- ─── STEP 13: Grant execute on helper function ─────────────────────────────
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- =============================================================================
-- IMPORTANT: After running this script, set your user as admin:
UPDATE public.profiles SET role = 'admin' WHERE email = 'kaushikyerra11@gmail.com';
-- =============================================================================
