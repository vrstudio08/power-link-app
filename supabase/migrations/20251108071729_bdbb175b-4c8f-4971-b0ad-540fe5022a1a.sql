-- Fix function search path security issue by recreating with proper settings
DROP TRIGGER IF EXISTS update_trip_shares_updated_at ON public.trip_shares;
DROP FUNCTION IF EXISTS public.update_trip_shares_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_trip_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_trip_shares_updated_at
BEFORE UPDATE ON public.trip_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_trip_shares_updated_at();