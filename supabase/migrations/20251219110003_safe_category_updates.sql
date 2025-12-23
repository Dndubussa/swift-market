-- Safe update of category types with conflict handling
-- This migration safely updates category classifications without causing conflicts

-- Add columns if they don't exist (for databases that might not have them yet)
DO $$ BEGIN
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_digital_friendly BOOLEAN DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_physical_friendly BOOLEAN DEFAULT true;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Update Books & Media category to be digital-only
UPDATE public.categories 
SET is_digital_friendly = true, is_physical_friendly = false
WHERE slug = 'books-media';

-- Update Books & Media subcategories to be digital-only
UPDATE public.categories 
SET is_digital_friendly = true, is_physical_friendly = false
WHERE parent_id IN (SELECT id FROM public.categories WHERE slug = 'books-media');

-- Ensure Electronics category remains physical-only
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE slug = 'electronics';

-- Ensure Electronics subcategories remain physical-only
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE parent_id IN (SELECT id FROM public.categories WHERE slug = 'electronics');