-- Add new columns to chargers table
ALTER TABLE public.chargers
ADD COLUMN IF NOT EXISTS power_source text,
ADD COLUMN IF NOT EXISTS charging_fee_type text DEFAULT 'per_hour',
ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS contact_number text;

-- Add new columns to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS vehicle_name text,
ADD COLUMN IF NOT EXISTS model_year integer,
ADD COLUMN IF NOT EXISTS range_km numeric,
ADD COLUMN IF NOT EXISTS ev_type text,
ADD COLUMN IF NOT EXISTS preferred_charger_power numeric,
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS vehicle_image text;

-- Create storage bucket for charger images
INSERT INTO storage.buckets (id, name, public)
VALUES ('charger-images', 'charger-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for charger images
CREATE POLICY "Anyone can view charger images"
ON storage.objects FOR SELECT
USING (bucket_id = 'charger-images');

CREATE POLICY "Authenticated users can upload charger images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'charger-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their charger images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'charger-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their charger images"
ON storage.objects FOR DELETE
USING (bucket_id = 'charger-images' AND auth.uid() IS NOT NULL);

-- RLS policies for vehicle images
CREATE POLICY "Users can view their vehicle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload vehicle images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their vehicle images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vehicle-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their vehicle images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-images' AND auth.uid()::text = (storage.foldername(name))[1]);