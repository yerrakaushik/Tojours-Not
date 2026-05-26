-- =============================================================================
-- FIX: Allow users to view their own pending reviews
-- =============================================================================
--
-- >>> COPY AND PASTE THIS INTO SUPABASE SQL EDITOR AND RUN IT <<<
-- =============================================================================

DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;

-- Anyone can read approved reviews OR their own pending reviews
CREATE POLICY "Public read approved reviews"
  ON public.reviews FOR SELECT
  USING (approved = true OR auth.uid() = user_id OR public.is_admin());
