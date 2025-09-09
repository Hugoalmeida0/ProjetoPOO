-- Remove price-related columns from mentor_profiles table
ALTER TABLE public.mentor_profiles DROP COLUMN IF EXISTS price_per_hour;