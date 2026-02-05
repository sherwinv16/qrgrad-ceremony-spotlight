-- Add explicit deny policy for anonymous users on profiles table
-- This provides defense-in-depth against accidental exposure through future policy changes
CREATE POLICY "Block anonymous access"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (false);