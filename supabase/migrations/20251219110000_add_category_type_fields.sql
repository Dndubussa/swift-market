-- Add digital/physical friendly flags to categories table
-- This migration adds fields to distinguish between digital and physical product categories

-- Add columns to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_digital_friendly BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_physical_friendly BOOLEAN DEFAULT true;

-- Update existing categories with appropriate values
-- Digital-only categories
UPDATE public.categories 
SET is_digital_friendly = true, is_physical_friendly = false
WHERE slug IN ('digital-content', 'books-media');

-- Physical-only categories
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE slug IN ('electronics');

-- Physical-only categories
UPDATE public.categories 
SET is_digital_friendly = false, is_physical_friendly = true
WHERE slug IN ('fashion');