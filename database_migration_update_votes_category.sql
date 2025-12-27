-- Update votes category constraint to include ugly_sweater
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_category_check;
ALTER TABLE public.votes
  ADD CONSTRAINT votes_category_check
  CHECK (category IN ('princess', 'prince', 'ugly_sweater'));
