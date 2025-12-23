-- Location: supabase/migrations/20251219103127_seller_tier_module.sql
-- Schema Analysis: Existing vendor_profiles, disputes, returns, reviews, payments tables
-- Integration Type: Addition - New seller tier/grading system
-- Dependencies: vendor_profiles (existing)

-- 1. Create seller tier enum type
DO $$ BEGIN
  CREATE TYPE public.seller_tier AS ENUM (
      'bronze',
      'silver', 
      'gold',
      'platinum',
      'diamond'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create seller grades table
CREATE TABLE IF NOT EXISTS public.seller_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    tier public.seller_tier NOT NULL DEFAULT 'bronze'::public.seller_tier,
    
    -- Performance metrics
    total_sales NUMERIC DEFAULT 0,
    dispute_rate NUMERIC DEFAULT 0,
    average_rating NUMERIC DEFAULT 0,
    return_rate NUMERIC DEFAULT 0,
    payment_compliance_rate NUMERIC DEFAULT 100,
    
    -- Tier progression
    current_points INTEGER DEFAULT 0,
    points_to_next_tier INTEGER DEFAULT 100,
    tier_achieved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Benefits unlocked
    benefits JSONB DEFAULT '[]'::JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(vendor_id)
);

-- 3. Create tier benefits table
CREATE TABLE IF NOT EXISTS public.tier_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier public.seller_tier NOT NULL,
    benefit_name TEXT NOT NULL,
    benefit_description TEXT NOT NULL,
    benefit_icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create tier requirements table  
CREATE TABLE IF NOT EXISTS public.tier_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier public.seller_tier NOT NULL,
    requirement_name TEXT NOT NULL,
    requirement_description TEXT NOT NULL,
    requirement_value NUMERIC NOT NULL,
    requirement_type TEXT NOT NULL, -- 'sales', 'rating', 'dispute_rate', etc
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create indexes
CREATE INDEX idx_seller_grades_vendor_id ON public.seller_grades(vendor_id);
CREATE INDEX idx_seller_grades_tier ON public.seller_grades(tier);
CREATE INDEX idx_tier_benefits_tier ON public.tier_benefits(tier);
CREATE INDEX idx_tier_requirements_tier ON public.tier_requirements(tier);

-- 6. Create function to calculate seller grade
CREATE OR REPLACE FUNCTION public.calculate_seller_grade(vendor_uuid UUID)
RETURNS public.seller_tier
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_dispute_rate NUMERIC;
    v_avg_rating NUMERIC;
    v_return_rate NUMERIC;
    v_payment_compliance NUMERIC;
    v_total_sales NUMERIC;
    v_calculated_tier public.seller_tier;
BEGIN
    -- Calculate dispute rate
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status IN ('reported', 'admin_reviewing'))::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 0
        END INTO v_dispute_rate
    FROM public.disputes
    WHERE vendor_id = vendor_uuid;
    
    -- Calculate average rating
    SELECT COALESCE(AVG(r.rating), 0) INTO v_avg_rating
    FROM public.reviews r
    JOIN public.products p ON r.product_id = p.id
    WHERE p.vendor_id = vendor_uuid AND r.is_approved = true;
    
    -- Calculate return rate
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status IN ('pending', 'approved'))::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 0
        END INTO v_return_rate
    FROM public.returns
    WHERE vendor_id = vendor_uuid;
    
    -- Calculate payment compliance rate
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE payment_status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 100
        END INTO v_payment_compliance
    FROM public.payments pay
    JOIN public.orders o ON pay.order_id = o.id
    WHERE o.vendor_id = vendor_uuid;
    
    -- Calculate total sales
    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_sales
    FROM public.orders
    WHERE vendor_id = vendor_uuid AND status = 'delivered';
    
    -- Determine tier based on metrics
    IF v_dispute_rate <= 1 AND v_avg_rating >= 4.8 AND v_return_rate <= 2 
       AND v_payment_compliance >= 98 AND v_total_sales >= 100000 THEN
        v_calculated_tier := 'diamond'::public.seller_tier;
    ELSIF v_dispute_rate <= 2 AND v_avg_rating >= 4.5 AND v_return_rate <= 5 
          AND v_payment_compliance >= 95 AND v_total_sales >= 50000 THEN
        v_calculated_tier := 'platinum'::public.seller_tier;
    ELSIF v_dispute_rate <= 5 AND v_avg_rating >= 4.0 AND v_return_rate <= 8 
          AND v_payment_compliance >= 90 AND v_total_sales >= 20000 THEN
        v_calculated_tier := 'gold'::public.seller_tier;
    ELSIF v_dispute_rate <= 8 AND v_avg_rating >= 3.5 AND v_return_rate <= 12 
          AND v_payment_compliance >= 85 AND v_total_sales >= 5000 THEN
        v_calculated_tier := 'silver'::public.seller_tier;
    ELSE
        v_calculated_tier := 'bronze'::public.seller_tier;
    END IF;
    
    RETURN v_calculated_tier;
END;
$func$;

-- 7. Create function to update seller grade
CREATE OR REPLACE FUNCTION public.update_seller_grade(vendor_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_new_tier public.seller_tier;
    v_dispute_rate NUMERIC;
    v_avg_rating NUMERIC;
    v_return_rate NUMERIC;
    v_payment_compliance NUMERIC;
    v_total_sales NUMERIC;
BEGIN
    -- Calculate new tier
    v_new_tier := public.calculate_seller_grade(vendor_uuid);
    
    -- Get metrics
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status IN ('reported', 'admin_reviewing'))::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 0
        END INTO v_dispute_rate
    FROM public.disputes WHERE vendor_id = vendor_uuid;
    
    SELECT COALESCE(AVG(r.rating), 0) INTO v_avg_rating
    FROM public.reviews r
    JOIN public.products p ON r.product_id = p.id
    WHERE p.vendor_id = vendor_uuid AND r.is_approved = true;
    
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status IN ('pending', 'approved'))::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 0
        END INTO v_return_rate
    FROM public.returns WHERE vendor_id = vendor_uuid;
    
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE payment_status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 100
        END INTO v_payment_compliance
    FROM public.payments pay
    JOIN public.orders o ON pay.order_id = o.id
    WHERE o.vendor_id = vendor_uuid;
    
    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_sales
    FROM public.orders WHERE vendor_id = vendor_uuid AND status = 'delivered';
    
    -- Update or insert grade record
    INSERT INTO public.seller_grades (
        vendor_id, tier, total_sales, dispute_rate, 
        average_rating, return_rate, payment_compliance_rate
    )
    VALUES (
        vendor_uuid, v_new_tier, v_total_sales, v_dispute_rate,
        v_avg_rating, v_return_rate, v_payment_compliance
    )
    ON CONFLICT (vendor_id) 
    DO UPDATE SET
        tier = v_new_tier,
        total_sales = v_total_sales,
        dispute_rate = v_dispute_rate,
        average_rating = v_avg_rating,
        return_rate = v_return_rate,
        payment_compliance_rate = v_payment_compliance,
        tier_achieved_at = CASE 
            WHEN public.seller_grades.tier != v_new_tier THEN CURRENT_TIMESTAMP 
            ELSE public.seller_grades.tier_achieved_at 
        END,
        updated_at = CURRENT_TIMESTAMP;
END;
$func$;

-- 8. Enable RLS
ALTER TABLE public.seller_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_requirements ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Public can view all tier benefits and requirements
CREATE POLICY "public_read_tier_benefits"
ON public.tier_benefits
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "public_read_tier_requirements"
ON public.tier_requirements
FOR SELECT
TO public
USING (true);

-- Vendors can view their own grades
CREATE POLICY "vendors_view_own_grades"
ON public.seller_grades
FOR SELECT
TO authenticated
USING (
    vendor_id IN (
        SELECT id FROM public.vendor_profiles
        WHERE user_id = auth.uid()
    )
);

-- Admins can manage all grades
CREATE POLICY "admin_manage_all_grades"
ON public.seller_grades
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 10. Trigger to update timestamp
CREATE TRIGGER update_seller_grades_updated_at
    BEFORE UPDATE ON public.seller_grades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Insert tier benefits data
INSERT INTO public.tier_benefits (tier, benefit_name, benefit_description, benefit_icon, display_order) VALUES
    -- Bronze tier
    ('bronze', 'Basic Listing', 'List up to 50 products', '📦', 1),
    ('bronze', 'Standard Support', 'Email support within 48 hours', '📧', 2),
    ('bronze', 'Basic Analytics', 'Access to basic sales reports', '📊', 3),
    
    -- Silver tier
    ('silver', 'Enhanced Listing', 'List up to 200 products', '📦', 1),
    ('silver', 'Priority Support', 'Email support within 24 hours', '⚡', 2),
    ('silver', 'Advanced Analytics', 'Detailed sales and customer insights', '📈', 3),
    ('silver', 'Featured Badge', 'Silver seller badge on listings', '🥈', 4),
    
    -- Gold tier
    ('gold', 'Premium Listing', 'List up to 500 products', '📦', 1),
    ('gold', 'Priority Support', 'Email and chat support within 12 hours', '⚡', 2),
    ('gold', 'Premium Analytics', 'Real-time analytics and custom reports', '📊', 3),
    ('gold', 'Featured Placement', 'Products appear in featured sections', '⭐', 4),
    ('gold', 'Gold Badge', 'Gold seller badge on listings', '🥇', 5),
    ('gold', 'Lower Fees', '5% reduction on platform fees', '💰', 6),
    
    -- Platinum tier
    ('platinum', 'Unlimited Listing', 'List unlimited products', '📦', 1),
    ('platinum', 'VIP Support', '24/7 priority support via all channels', '👑', 2),
    ('platinum', 'Premium Plus Analytics', 'AI-powered insights and predictions', '🤖', 3),
    ('platinum', 'Top Placement', 'Premium placement in search results', '🚀', 4),
    ('platinum', 'Platinum Badge', 'Platinum seller badge on listings', '💎', 5),
    ('platinum', 'Reduced Fees', '10% reduction on platform fees', '💰', 6),
    ('platinum', 'Marketing Tools', 'Access to promotional campaigns', '📣', 7),
    
    -- Diamond tier
    ('diamond', 'Unlimited Listing Plus', 'List unlimited products with priority', '📦', 1),
    ('diamond', 'Dedicated Account Manager', 'Personal account manager available 24/7', '🎯', 2),
    ('diamond', 'Advanced AI Analytics', 'Predictive analytics and market insights', '🤖', 3),
    ('diamond', 'Prime Placement', 'Guaranteed top placement across platform', '👑', 4),
    ('diamond', 'Diamond Badge', 'Exclusive diamond seller badge', '💎', 5),
    ('diamond', 'Minimum Fees', '15% reduction on platform fees', '💰', 6),
    ('diamond', 'Premium Marketing', 'Featured in all marketing campaigns', '📣', 7),
    ('diamond', 'Early Access', 'First access to new features', '🔓', 8);

-- 12. Insert tier requirements data
INSERT INTO public.tier_requirements (tier, requirement_name, requirement_description, requirement_value, requirement_type, display_order) VALUES
    -- Silver requirements
    ('silver', 'Total Sales', 'Achieve TZS 5,000,000 in total sales', 5000, 'sales', 1),
    ('silver', 'Customer Rating', 'Maintain 3.5+ star average rating', 3.5, 'rating', 2),
    ('silver', 'Dispute Rate', 'Keep dispute rate below 8%', 8, 'dispute_rate', 3),
    ('silver', 'Return Rate', 'Maintain return rate below 12%', 12, 'return_rate', 4),
    ('silver', 'Payment Compliance', 'Maintain 85%+ payment completion rate', 85, 'payment_compliance', 5),
    
    -- Gold requirements
    ('gold', 'Total Sales', 'Achieve TZS 20,000,000 in total sales', 20000, 'sales', 1),
    ('gold', 'Customer Rating', 'Maintain 4.0+ star average rating', 4.0, 'rating', 2),
    ('gold', 'Dispute Rate', 'Keep dispute rate below 5%', 5, 'dispute_rate', 3),
    ('gold', 'Return Rate', 'Maintain return rate below 8%', 8, 'return_rate', 4),
    ('gold', 'Payment Compliance', 'Maintain 90%+ payment completion rate', 90, 'payment_compliance', 5),
    
    -- Platinum requirements
    ('platinum', 'Total Sales', 'Achieve TZS 50,000,000 in total sales', 50000, 'sales', 1),
    ('platinum', 'Customer Rating', 'Maintain 4.5+ star average rating', 4.5, 'rating', 2),
    ('platinum', 'Dispute Rate', 'Keep dispute rate below 2%', 2, 'dispute_rate', 3),
    ('platinum', 'Return Rate', 'Maintain return rate below 5%', 5, 'return_rate', 4),
    ('platinum', 'Payment Compliance', 'Maintain 95%+ payment completion rate', 95, 'payment_compliance', 5),
    
    -- Diamond requirements
    ('diamond', 'Total Sales', 'Achieve TZS 100,000,000 in total sales', 100000, 'sales', 1),
    ('diamond', 'Customer Rating', 'Maintain 4.8+ star average rating', 4.8, 'rating', 2),
    ('diamond', 'Dispute Rate', 'Keep dispute rate below 1%', 1, 'dispute_rate', 3),
    ('diamond', 'Return Rate', 'Maintain return rate below 2%', 2, 'return_rate', 4),
    ('diamond', 'Payment Compliance', 'Maintain 98%+ payment completion rate', 98, 'payment_compliance', 5);