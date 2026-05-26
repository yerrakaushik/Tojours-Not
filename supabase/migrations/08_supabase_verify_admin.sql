-- =============================================================================
-- QUICK FIX: Verify admin profile exists and check RLS
-- Run this in Supabase SQL Editor
-- =============================================================================

-- 1. Check if the profile exists
SELECT id, email, role FROM public.profiles WHERE email = 'kaushikyerra11@gmail.com';

-- 2. Check auth.users for the user
SELECT id, email FROM auth.users WHERE email = 'kaushikyerra11@gmail.com';

-- 3. If profile is missing, create it from auth.users
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'kaushikyerra11@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 4. Verify the result
SELECT id, email, role, first_name, last_name FROM public.profiles WHERE email = 'kaushikyerra11@gmail.com';
