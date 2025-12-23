-- Location: supabase/migrations/20251219095907_reviews_analytics_and_disputes_module.sql
-- Schema Analysis: Existing reviews, orders, user_profiles, vendor_profiles tables
-- Integration Type: Extension + New Module
-- Dependencies: reviews, orders, user_profiles, vendor_profiles

-- 1. ENUMS for new module
DO $$ BEGIN
  CREATE TYPE public.dispute_status AS ENUM ('reported', 'vendor_responded', 'admin_reviewing', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.dispute_resolution AS ENUM ('refund', 'replacement', 'partial_compensation', 'no_action', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Extend notification_type enum with dispute-related values (separate transaction)
DO $$
BEGIN
    -- Add new enum values one by one, each in its own statement
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'notification_type' AND e.enumlabel = 'dispute_reported'
    ) THEN
        ALTER TYPE public.notification_type ADD VALUE 'dispute_reported';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'notification_type' AND e.enumlabel = 'dispute_vendor_response'
    ) THEN
        ALTER TYPE public.notification_type ADD VALUE 'dispute_vendor_response';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'notification_type' AND e.enumlabel = 'dispute_admin_resolved'
    ) THEN
        ALTER TYPE public.notification_type ADD VALUE 'dispute_admin_resolved';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'notification_type' AND e.enumlabel = 'dispute_status_change'
    ) THEN
        ALTER TYPE public.notification_type ADD VALUE 'dispute_status_change';
    END IF;
END $$;

-- 3. Extend existing reviews table with new columns
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS unhelpful_count INTEGER DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS vendor_response TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS vendor_responded_at TIMESTAMPTZ;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT false;

-- 4. Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    dispute_number TEXT NOT NULL UNIQUE,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    buyer_evidence JSONB DEFAULT '[]'::jsonb,
    vendor_response TEXT,
    vendor_evidence JSONB DEFAULT '[]'::jsonb,
    admin_notes TEXT,
    status public.dispute_status DEFAULT 'reported'::public.dispute_status NOT NULL,
    resolution_type public.dispute_resolution DEFAULT 'pending'::public.dispute_resolution,
    compensation_amount NUMERIC(10,2),
    refund_method TEXT,
    refund_status TEXT,
    reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vendor_responded_at TIMESTAMPTZ,
    admin_reviewed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Create dispute_messages table for threaded communication
CREATE TABLE IF NOT EXISTS public.dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer', 'vendor', 'admin')),
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Create review_votes table for tracking helpful/unhelpful votes
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(review_id, user_id)
);

-- 7. Create indexes (with IF NOT EXISTS to prevent errors on re-run)
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer_id ON public.disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_vendor_id ON public.disputes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_dispute_number ON public.disputes(dispute_number);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON public.dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_sender_id ON public.dispute_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);

-- 8. Functions for dispute number generation
CREATE OR REPLACE FUNCTION public.generate_dispute_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM public.disputes;
    new_number := 'DISP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN new_number;
END;
$$;

-- 9. Function to update review vote counts
CREATE OR REPLACE FUNCTION public.update_review_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'helpful' THEN
            UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
        ELSIF NEW.vote_type = 'unhelpful' THEN
            UPDATE public.reviews SET unhelpful_count = unhelpful_count + 1 WHERE id = NEW.review_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'helpful' THEN
            UPDATE public.reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
        ELSIF OLD.vote_type = 'unhelpful' THEN
            UPDATE public.reviews SET unhelpful_count = unhelpful_count - 1 WHERE id = OLD.review_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type = 'helpful' THEN
            UPDATE public.reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
        ELSIF OLD.vote_type = 'unhelpful' THEN
            UPDATE public.reviews SET unhelpful_count = unhelpful_count - 1 WHERE id = OLD.review_id;
        END IF;
        IF NEW.vote_type = 'helpful' THEN
            UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
        ELSIF NEW.vote_type = 'unhelpful' THEN
            UPDATE public.reviews SET unhelpful_count = unhelpful_count + 1 WHERE id = NEW.review_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- 10. Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for disputes
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'buyers_view_own_disputes'
    ) THEN
        CREATE POLICY "buyers_view_own_disputes"
        ON public.disputes
        FOR SELECT
        TO authenticated
        USING (buyer_id = auth.uid());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'vendors_view_own_disputes'
    ) THEN
        CREATE POLICY "vendors_view_own_disputes"
        ON public.disputes
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.vendor_profiles vp
                WHERE vp.id = disputes.vendor_id AND vp.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'buyers_create_disputes'
    ) THEN
        CREATE POLICY "buyers_create_disputes"
        ON public.disputes
        FOR INSERT
        TO authenticated
        WITH CHECK (buyer_id = auth.uid());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'vendors_update_disputes'
    ) THEN
        CREATE POLICY "vendors_update_disputes"
        ON public.disputes
        FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.vendor_profiles vp
                WHERE vp.id = disputes.vendor_id AND vp.user_id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.vendor_profiles vp
                WHERE vp.id = disputes.vendor_id AND vp.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'admin_manage_all_disputes'
    ) THEN
        CREATE POLICY "admin_manage_all_disputes"
        ON public.disputes
        FOR ALL
        TO authenticated
        USING (public.is_admin_from_auth())
        WITH CHECK (public.is_admin_from_auth());
    END IF;
END $$;

-- 12. RLS Policies for dispute_messages
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'dispute_messages' AND policyname = 'dispute_participants_view_messages'
    ) THEN
        CREATE POLICY "dispute_participants_view_messages"
        ON public.dispute_messages
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.disputes d
                WHERE d.id = dispute_messages.dispute_id
                AND (
                    d.buyer_id = auth.uid()
                    OR EXISTS (
                        SELECT 1 FROM public.vendor_profiles vp
                        WHERE vp.id = d.vendor_id AND vp.user_id = auth.uid()
                    )
                    OR public.is_admin_from_auth()
                )
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'dispute_messages' AND policyname = 'dispute_participants_create_messages'
    ) THEN
        CREATE POLICY "dispute_participants_create_messages"
        ON public.dispute_messages
        FOR INSERT
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.disputes d
                WHERE d.id = dispute_messages.dispute_id
                AND (
                    d.buyer_id = auth.uid()
                    OR EXISTS (
                        SELECT 1 FROM public.vendor_profiles vp
                        WHERE vp.id = d.vendor_id AND vp.user_id = auth.uid()
                    )
                    OR public.is_admin_from_auth()
                )
            )
        );
    END IF;
END $$;

-- 13. RLS Policies for review_votes
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'review_votes' AND policyname = 'users_manage_own_review_votes'
    ) THEN
        CREATE POLICY "users_manage_own_review_votes"
        ON public.review_votes
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'review_votes' AND policyname = 'public_view_review_votes'
    ) THEN
        CREATE POLICY "public_view_review_votes"
        ON public.review_votes
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;

-- 14. Triggers
-- Create function to set dispute number before insert
CREATE OR REPLACE FUNCTION public.set_dispute_number_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.dispute_number IS NULL THEN
        NEW.dispute_number := public.generate_dispute_number();
    END IF;
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_dispute_number'
    ) THEN
        CREATE TRIGGER set_dispute_number
        BEFORE INSERT ON public.disputes
        FOR EACH ROW
        EXECUTE FUNCTION public.set_dispute_number_before_insert();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_disputes_updated_at'
    ) THEN
        CREATE TRIGGER update_disputes_updated_at
        BEFORE UPDATE ON public.disputes
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_review_votes_trigger'
    ) THEN
        CREATE TRIGGER update_review_votes_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
        FOR EACH ROW
        EXECUTE FUNCTION public.update_review_vote_counts();
    END IF;
END $$;

-- 15. Create notification functions for disputes
CREATE OR REPLACE FUNCTION public.notify_vendor_new_dispute()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    vendor_user_id UUID;
BEGIN
    -- Get vendor's user_id
    SELECT user_id INTO vendor_user_id
    FROM public.vendor_profiles vp
    WHERE vp.id = NEW.vendor_id;

    -- Create notification for vendor using the newly added enum value
    INSERT INTO public.notifications (user_id, type, title, message, link, data)
    VALUES (
        vendor_user_id,
        'dispute_reported',
        'New Dispute Reported',
        'A customer has reported an issue with order ' || NEW.dispute_number,
        '/vendor-disputes/' || NEW.id,
        jsonb_build_object(
            'dispute_id', NEW.id,
            'dispute_number', NEW.dispute_number,
            'order_id', NEW.order_id
        )
    );

    RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.notify_dispute_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (user_id, type, title, message, link, data)
        VALUES (
            NEW.buyer_id,
            'dispute_status_change',
            'Dispute Status Updated',
            'Your dispute ' || NEW.dispute_number || ' status has been updated to ' || NEW.status,
            '/buyer-disputes/' || NEW.id,
            jsonb_build_object(
                'dispute_id', NEW.id,
                'dispute_number', NEW.dispute_number,
                'status', NEW.status
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'notify_vendor_new_dispute_trigger'
    ) THEN
        CREATE TRIGGER notify_vendor_new_dispute_trigger
        AFTER INSERT ON public.disputes
        FOR EACH ROW
        EXECUTE FUNCTION public.notify_vendor_new_dispute();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'notify_dispute_status_change_trigger'
    ) THEN
        CREATE TRIGGER notify_dispute_status_change_trigger
        AFTER UPDATE ON public.disputes
        FOR EACH ROW
        WHEN (OLD.status IS DISTINCT FROM NEW.status)
        EXECUTE FUNCTION public.notify_dispute_status_change();
    END IF;
END $$;