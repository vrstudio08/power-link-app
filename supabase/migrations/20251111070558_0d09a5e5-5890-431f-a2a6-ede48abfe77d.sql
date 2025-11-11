-- Update all existing users to 'both' role
UPDATE public.profiles SET role = 'both';

-- Update the handle_new_user function to always set role as 'both'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'both'
  );
  RETURN NEW;
END;
$$;