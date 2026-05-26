-- =============================================================================
-- EMERGENCY RLS FIX — Run this in Supabase SQL Editor
-- =============================================================================
-- The profiles INSERT policy is blocking upserts. Fix:
-- 1. Allow service_role insert bypass (for triggers)
-- 2. Make sure authenticated users can insert/update their OWN profile

-- Drop all existing profile policies
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;

-- Recreate with proper permissions
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "Admins view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Also check if profile exists for the admin user
SELECT id, email, role FROM public.profiles LIMIT 10;

-- Force-create profile if it doesn't exist
-- (This runs as postgres so it bypasses RLS)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'kaushikyerra11@gmail.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role, first_name, last_name)
    VALUES (v_user_id, 'kaushikyerra11@gmail.com', 'admin', 'Kaushik', 'Yerra')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    RAISE NOTICE 'Admin profile created/updated for user %', v_user_id;
  ELSE
    RAISE NOTICE 'No auth user found with email kaushikyerra11@gmail.com';
  END IF;
END $$;

-- Verify
SELECT id, email, role, first_name FROM public.profiles WHERE email = 'kaushikyerra11@gmail.com';
