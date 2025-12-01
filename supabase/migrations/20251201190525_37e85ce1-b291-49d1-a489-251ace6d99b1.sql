-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: users can view all profiles, but only update their own
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create admin emails table
CREATE TABLE public.admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails ae
    JOIN public.profiles p ON p.email = ae.email
    WHERE p.id = user_id
  );
$$;

-- Only admins can view admin emails
CREATE POLICY "Admins can view admin emails"
ON public.admin_emails FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add status to training_packs
CREATE TYPE pack_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.training_packs 
  ADD COLUMN status pack_status NOT NULL DEFAULT 'pending',
  ADD COLUMN submitted_by UUID REFERENCES public.profiles(id),
  ADD COLUMN reviewed_by UUID REFERENCES public.profiles(id),
  ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN rejection_reason TEXT;

-- Create index for faster queries
CREATE INDEX idx_training_packs_status ON public.training_packs(status);
CREATE INDEX idx_training_packs_submitted_by ON public.training_packs(submitted_by);

-- Update existing packs to approved status
UPDATE public.training_packs SET status = 'approved';

-- Drop old RLS policies
DROP POLICY IF EXISTS "Anyone can view training packs" ON public.training_packs;
DROP POLICY IF EXISTS "Anyone can insert training packs" ON public.training_packs;

-- New RLS policies for training_packs
CREATE POLICY "Anyone can view approved packs"
ON public.training_packs FOR SELECT
USING (status = 'approved' OR public.is_admin(auth.uid()) OR submitted_by = auth.uid());

CREATE POLICY "Authenticated users can insert packs"
ON public.training_packs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND submitted_by = auth.uid());

CREATE POLICY "Admins can update packs"
ON public.training_packs FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Create ratings table
CREATE TABLE public.pack_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.training_packs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pack_id, user_id)
);

ALTER TABLE public.pack_ratings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_pack_ratings_pack_id ON public.pack_ratings(pack_id);
CREATE INDEX idx_pack_ratings_user_id ON public.pack_ratings(user_id);

-- RLS for ratings
CREATE POLICY "Anyone can view ratings"
ON public.pack_ratings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert own ratings"
ON public.pack_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
ON public.pack_ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
ON public.pack_ratings FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for ratings updated_at
CREATE TRIGGER update_pack_ratings_updated_at
BEFORE UPDATE ON public.pack_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();