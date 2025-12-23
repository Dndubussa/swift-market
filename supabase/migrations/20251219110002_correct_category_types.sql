-- Correct category types to reflect that Books & Media is digital-only and Electronics is physical-only
-- This migration updates existing categories to match the correct classification

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