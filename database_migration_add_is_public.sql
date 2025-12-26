-- Adds the visibility flag for tasks
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Optional: backfill existing rows to the default
UPDATE public.tasks SET is_public = COALESCE(is_public, false);
