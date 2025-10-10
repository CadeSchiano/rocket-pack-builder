-- Enable insert policy for training packs
CREATE POLICY "Anyone can insert training packs"
ON public.training_packs
FOR INSERT
WITH CHECK (true);