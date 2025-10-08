-- Create training_packs table
CREATE TABLE public.training_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.training_packs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view training packs (public data)
CREATE POLICY "Anyone can view training packs"
ON public.training_packs
FOR SELECT
USING (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_packs_updated_at
BEFORE UPDATE ON public.training_packs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_training_packs_difficulty ON public.training_packs(difficulty);
CREATE INDEX idx_training_packs_type ON public.training_packs(type);
CREATE INDEX idx_training_packs_created_at ON public.training_packs(created_at DESC);

-- Insert seed data
INSERT INTO public.training_packs (name, creator, code, difficulty, type, description) VALUES
('Ground Shots', 'Poquito', 'A503-264C-A7EB-D282', 'Beginner', 'Shooting', 'Master basic ground shots from various angles and distances'),
('Wall Shots', 'Poquito', '9F6D-4387-4C57-2E4B', 'Intermediate', 'Shooting', 'Practice shooting off the wall from different positions'),
('Aerial Shots', 'Wayprotein', '7E4D-2CB8-4F63-E821', 'Advanced', 'Aerial', 'Improve your aerial car control and shot accuracy'),
('Dribbling Basics', 'Virge', 'EA4D-3C73-2C90-5333', 'Beginner', 'Dribbling', 'Learn fundamental dribbling techniques'),
('Backboard Defense', 'Poquito', '5A65-4073-F71F-5D96', 'Intermediate', 'Defense', 'Practice defensive clears from the backboard'),
('Air Dribble Practice', 'Virge', '9D87-258C-3C05-6FA9', 'Advanced', 'Dribbling', 'Master air dribbling mechanics');