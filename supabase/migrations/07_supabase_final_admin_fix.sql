-- =============================================================================
-- FINAL ADMIN ACCESS FIX - Run this in Supabase SQL Editor
-- =============================================================================
-- Root cause: Two overlapping SELECT policies on "profiles" both match for
-- admin users, causing duplicate rows. .maybeSingle() returns null for >1 row.
--
-- Fix approach:
--   1. Recreate is_admin() as a proper RPC-callable function
--   2. Merge the two SELECT policies into ONE that handles both cases
--   3. Verify admin user exists with correct role
-- =============================================================================

-- ─── STEP 1: Recreate is_admin() SECURITY DEFINER function ─────────────────
-- This function bypasses RLS entirely (runs as postgres) so it can always
-- read the profiles table to check if the current user is an admin.
-- It is callable via supabase.rpc('is_admin') from the frontend.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users (required for RPC calls)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ─── STEP 2: Fix the overlapping SELECT policies on profiles ────────────────
-- Problem: "Users can view own profile" AND "Admins can view all profiles"
-- both match for admin users, returning the same row twice.
-- Solution: Merge into a single SELECT policy using OR logic.

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
-- Also drop any legacy policy names
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow admins to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;

-- Single unified SELECT policy: you can see your own row, OR if you're admin you see all
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id          -- users always see their own row
    OR public.is_admin()     -- admins see all rows
  );

-- ─── STEP 3: Ensure INSERT/UPDATE policies exist and are correct ────────────
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;

-- Users can insert their own profile row
CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own_policy"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin_policy"
  ON profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── STEP 4: Ensure auth trigger creates profiles automatically ─────────────
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

-- ─── STEP 5: Verify admin user ─────────────────────────────────────────────
-- Set your user as admin (safe to re-run, idempotent)
UPDATE public.profiles SET role = 'admin' WHERE email = 'kaushikyerra11@gmail.com';

-- Verify it worked:
SELECT id, email, role FROM public.profiles WHERE email = 'kaushikyerra11@gmail.com';
