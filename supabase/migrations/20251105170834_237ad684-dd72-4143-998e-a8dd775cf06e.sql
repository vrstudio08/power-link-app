-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('owner', 'driver', 'both');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid', 'failed');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'driver',
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'driver')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create vehicles table (EVs)
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  company TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  battery_capacity DECIMAL NOT NULL,
  power_output DECIMAL,
  plate_number TEXT,
  bms_protocol TEXT,
  charging_preferences TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Vehicles policies
CREATE POLICY "Users can view own vehicles"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles FOR DELETE
  USING (auth.uid() = owner_id);

-- Create chargers table
CREATE TABLE public.chargers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  connector_type TEXT NOT NULL,
  power_output_kw DECIMAL NOT NULL,
  company TEXT,
  price_per_hour DECIMAL NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  address TEXT NOT NULL,
  parking_type TEXT,
  availability_start TIME,
  availability_end TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating_avg DECIMAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on chargers
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;

-- Chargers policies
CREATE POLICY "Anyone can view active chargers"
  ON public.chargers FOR SELECT
  USING (is_active = true OR auth.uid() = owner_id);

CREATE POLICY "Owners can insert chargers"
  ON public.chargers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own chargers"
  ON public.chargers FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own chargers"
  ON public.chargers FOR DELETE
  USING (auth.uid() = owner_id);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  amount_paid DECIMAL NOT NULL,
  payment_method TEXT,
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Drivers can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Owners can view bookings for their chargers"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chargers
      WHERE chargers.id = bookings.charger_id
      AND chargers.owner_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = driver_id);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Drivers can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = driver_id
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_id
      AND bookings.driver_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Function to update charger rating
CREATE OR REPLACE FUNCTION public.update_charger_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.chargers
  SET 
    rating_avg = (
      SELECT AVG(rating)::DECIMAL
      FROM public.reviews
      WHERE charger_id = NEW.charger_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE charger_id = NEW.charger_id
    )
  WHERE id = NEW.charger_id;
  RETURN NEW;
END;
$$;

-- Trigger to update ratings
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_charger_rating();