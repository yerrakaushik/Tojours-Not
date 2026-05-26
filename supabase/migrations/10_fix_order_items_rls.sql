-- =============================================================================
-- FIX: order_items & order_status_history INSERT RLS policies
-- =============================================================================
-- Error: "new row violates row-level security policy for table "order_items""
-- 
-- The INSERT policies may not exist on the live database.
-- This script safely drops and recreates them.
--
-- >>> COPY AND PASTE THIS INTO SUPABASE SQL EDITOR AND RUN IT <<<
-- =============================================================================

-- ─── Ensure is_admin() helper exists ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ─── FIX: order_items policies ──────────────────────────────────────────────
-- Drop ALL existing policies on order_items to start clean
DROP POLICY IF EXISTS "Users view own order items" ON order_items;
DROP POLICY IF EXISTS "Users insert order items" ON order_items;
DROP POLICY IF EXISTS "Admins view all order items" ON order_items;
DROP POLICY IF EXISTS "Users view own order items" ON order_items;
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

-- Users can INSERT order items for their own orders
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

-- ─── FIX: order_status_history policies ─────────────────────────────────────
DROP POLICY IF EXISTS "Users view own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Admins manage order status history" ON order_status_history;
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

-- Users can INSERT status history entries for their own orders
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

-- ─── FIX: Ensure orders has proper INSERT + UPDATE policies for users ───────
DROP POLICY IF EXISTS "Users view own orders" ON orders;
DROP POLICY IF EXISTS "Users create own orders" ON orders;
DROP POLICY IF EXISTS "Users update own orders" ON orders;

CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (for payment status after Razorpay callback)
CREATE POLICY "Users update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- DONE! Checkout should now work for both Online Payment and COD.
-- =============================================================================
