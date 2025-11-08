-- Create trip_shares table for sharing location and ETA
CREATE TABLE public.trip_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  charger_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  current_latitude NUMERIC,
  current_longitude NUMERIC,
  destination_latitude NUMERIC NOT NULL,
  destination_longitude NUMERIC NOT NULL,
  eta_minutes INTEGER,
  distance_remaining_km NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own trip shares
CREATE POLICY "Users can create trip shares"
ON public.trip_shares
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trip shares
CREATE POLICY "Users can update own trip shares"
ON public.trip_shares
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Anyone can view active, non-expired trip shares (public viewing)
CREATE POLICY "Anyone can view active trip shares"
ON public.trip_shares
FOR SELECT
USING (is_active = true AND expires_at > now());

-- Policy: Users can delete their own trip shares
CREATE POLICY "Users can delete own trip shares"
ON public.trip_shares
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_trip_shares_token ON public.trip_shares(share_token);
CREATE INDEX idx_trip_shares_active ON public.trip_shares(is_active, expires_at);

-- Add foreign key constraint
ALTER TABLE public.trip_shares
ADD CONSTRAINT fk_trip_shares_charger
FOREIGN KEY (charger_id) REFERENCES public.chargers(id) ON DELETE CASCADE;

-- Enable realtime for trip_shares
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_shares;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_trip_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_trip_shares_updated_at
BEFORE UPDATE ON public.trip_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_trip_shares_updated_at();