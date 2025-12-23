-- Location: supabase/migrations/20251219084016_auth_module.sql
-- Schema Analysis: FRESH_PROJECT - No existing schema
-- Integration Type: Complete auth module with role-based access
-- Dependencies: None (first migration)

-- 1. Create ENUMs with conditional checks to avoid duplicate type errors
DO $$ 
BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('buyer', 'vendor', 'admin');
    END IF;
    
    -- Create verification_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
    END IF;
END $$;

-- 2. Create user_profiles table (intermediary for PostgREST compatibility)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'buyer'::public.user_role NOT NULL,
    avatar_url TEXT,
    verification_status public.verification_status DEFAULT 'pending'::public.verification_status NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Create vendor_profiles table for vendor-specific data
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    business_address TEXT,
    business_phone TEXT,
    business_email TEXT,
    tax_id TEXT,
    bank_account_number TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Create phone_verification table
CREATE TABLE IF NOT EXISTS public.phone_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Create indexes (with IF NOT EXISTS checks)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON public.vendor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON public.phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone);

-- 6. Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        phone,
        role, 
        avatar_url,
        verification_status
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'buyer'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE((NEW.raw_user_meta_data->>'verification_status')::public.verification_status, 'pending'::public.verification_status)
    );
    RETURN NEW;
END;
$$;

-- 7. Create trigger for automatic profile creation (drop if exists first to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies (drop existing policies first to make script idempotent)

-- user_profiles policies (Pattern 1 - Core User Table)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
    ON public.user_profiles
    FOR ALL
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow public read for vendor and admin profiles (for marketplace display)
DROP POLICY IF EXISTS "public_read_vendor_admin_profiles" ON public.user_profiles;
CREATE POLICY "public_read_vendor_admin_profiles"
    ON public.user_profiles
    FOR SELECT
    TO public
    USING (role IN ('vendor', 'admin'));

-- vendor_profiles policies (Pattern 2 - Simple User Ownership)
DROP POLICY IF EXISTS "users_manage_own_vendor_profiles" ON public.vendor_profiles;
CREATE POLICY "users_manage_own_vendor_profiles"
    ON public.vendor_profiles
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow public read for verified vendors
DROP POLICY IF EXISTS "public_read_verified_vendor_profiles" ON public.vendor_profiles;
CREATE POLICY "public_read_verified_vendor_profiles"
    ON public.vendor_profiles
    FOR SELECT
    TO public
    USING (is_verified = true);

-- Admin full access to vendor profiles (Pattern 6A - Using auth.users metadata)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid()
        AND (au.raw_user_meta_data->>'role' = 'admin'
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
$$;

DROP POLICY IF EXISTS "admin_full_access_vendor_profiles" ON public.vendor_profiles;
CREATE POLICY "admin_full_access_vendor_profiles"
    ON public.vendor_profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin_from_auth())
    WITH CHECK (public.is_admin_from_auth());

-- phone_verifications policies (Pattern 2 - Simple User Ownership)
DROP POLICY IF EXISTS "users_manage_own_phone_verifications" ON public.phone_verifications;
CREATE POLICY "users_manage_own_phone_verifications"
    ON public.phone_verifications
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 10. Create update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 11. Apply update timestamp triggers (drop if exists first)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_vendor_profiles_updated_at ON public.vendor_profiles;
CREATE TRIGGER update_vendor_profiles_updated_at
    BEFORE UPDATE ON public.vendor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 12. Mock Data (with proper idempotent handling)
DO $$
DECLARE
    buyer_uuid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID;
    vendor_uuid UUID := 'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID;
    admin_uuid UUID := 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'::UUID;
BEGIN
    -- Delete existing mock users if they exist (cascade will handle related records)
    DELETE FROM auth.users WHERE email IN ('buyer@blinno.com', 'vendor@blinno.com', 'admin@blinno.com');
    
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (buyer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'buyer@blinno.com', crypt('Buyer@123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Buyer", "role": "buyer", "phone": "+255712345678"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, '+255712345678', '', '', null),
        (vendor_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'vendor@blinno.com', crypt('Vendor@123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sarah Vendor", "role": "vendor", "phone": "+255723456789"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, '+255723456789', '', '', null),
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@blinno.com', crypt('Admin@123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Michael Admin", "role": "admin", "phone": "+255734567890"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, '+255734567890', '', '', null);

    -- Create vendor profile for vendor user (trigger will handle user_profiles)
    INSERT INTO public.vendor_profiles (
        user_id,
        business_name,
        business_description,
        business_address,
        business_phone,
        business_email,
        is_verified
    ) VALUES
        (vendor_uuid,
         'TechGadgets Tanzania',
         'Leading supplier of electronics and gadgets in Tanzania',
         '123 Uhuru Street, Dar es Salaam',
         '+255723456789',
         'vendor@blinno.com',
         true);

    -- Create phone verification for buyer
    INSERT INTO public.phone_verifications (
        user_id,
        phone,
        verification_code,
        is_verified,
        expires_at
    ) VALUES
        (buyer_uuid,
         '+255712345678',
         '123456',
         true,
         now() + interval '1 day');
END $$;