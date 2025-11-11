-- Allow drivers to delete their own bookings
CREATE POLICY "Drivers can delete own bookings" 
ON public.bookings 
FOR DELETE 
USING (auth.uid() = driver_id);