-- Update category types to reflect that Electronics and Books & Media are physical-only categories
-- This migration updates existing categories to match the new classification

-- Update Electronics category to be physical-only
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE slug = 'electronics';

-- Update Electronics subcategories to be physical-only
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE parent_id IN (SELECT id FROM public.categories WHERE slug = 'electronics');

-- Update Books & Media category to be physical-only
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE slug = 'books-media';

-- Update Books & Media subcategories to be physical-only
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE parent_id IN (SELECT id FROM public.categories WHERE slug = 'books-media');