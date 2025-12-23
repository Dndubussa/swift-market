-- Location: supabase/migrations/20251219094503_returns_and_email_module.sql
-- Schema Analysis: Building upon existing orders, order_items, user_profiles, vendor_profiles
-- Integration Type: New returns module + Email notification enhancement
-- Dependencies: orders, order_items, user_profiles, vendor_profiles

-- 1. Create return reason and status types
DO $$ BEGIN
  CREATE TYPE public.return_reason AS ENUM (
      'defective',
      'wrong_item',
      'not_as_described',
      'damaged',
      'size_issue',
      'changed_mind',
      'quality_issue',
      'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.return_status AS ENUM (
      'pending',
      'approved',
      'rejected',
      'processing',
      'completed',
      'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.refund_status AS ENUM (
      'pending',
      'processing',
      'completed',
      'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create returns table
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    rma_number TEXT UNIQUE NOT NULL,
    return_reason public.return_reason NOT NULL,
    reason_details TEXT,
    status public.return_status DEFAULT 'pending'::public.return_status,
    refund_status public.refund_status DEFAULT 'pending'::public.refund_status,
    refund_amount DECIMAL(10, 2),
    refund_method TEXT,
    vendor_notes TEXT,
    rejection_reason TEXT,
    images TEXT[],
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create return items table (track which items are being returned)
CREATE TABLE IF NOT EXISTS public.return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    refund_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Essential indexes
CREATE INDEX idx_returns_order_id ON public.returns(order_id);
CREATE INDEX idx_returns_buyer_id ON public.returns(buyer_id);
CREATE INDEX idx_returns_vendor_id ON public.returns(vendor_id);
CREATE INDEX idx_returns_status ON public.returns(status);
CREATE INDEX idx_returns_rma_number ON public.returns(rma_number);
CREATE INDEX idx_return_items_return_id ON public.return_items(return_id);
CREATE INDEX idx_return_items_order_item_id ON public.return_items(order_item_id);

-- 5. RMA number generation function
CREATE OR REPLACE FUNCTION public.generate_rma_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_rma TEXT;
    rma_exists BOOLEAN;
BEGIN
    LOOP
        new_rma := 'RMA-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
        
        SELECT EXISTS (
            SELECT 1 FROM public.returns WHERE rma_number = new_rma
        ) INTO rma_exists;
        
        EXIT WHEN NOT rma_exists;
    END LOOP;
    
    RETURN new_rma;
END;
$$;

-- 6. Trigger to auto-generate RMA number
CREATE OR REPLACE FUNCTION public.set_rma_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.rma_number IS NULL OR NEW.rma_number = '' THEN
        NEW.rma_number := public.generate_rma_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_rma_number_trigger
BEFORE INSERT ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.set_rma_number();

-- 7. Update timestamp trigger
CREATE TRIGGER update_returns_updated_at
BEFORE UPDATE ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Enable RLS
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for returns table

-- Buyers can view their own returns
CREATE POLICY "buyers_view_own_returns"
ON public.returns
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid());

-- Buyers can create returns for their orders
CREATE POLICY "buyers_create_own_returns"
ON public.returns
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Vendors can view returns for their products
CREATE POLICY "vendors_view_own_returns"
ON public.returns
FOR SELECT
TO authenticated
USING (
    vendor_id IN (
        SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
    )
);

-- Vendors can update returns for their products
CREATE POLICY "vendors_update_own_returns"
ON public.returns
FOR UPDATE
TO authenticated
USING (
    vendor_id IN (
        SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    vendor_id IN (
        SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
    )
);

-- 10. RLS Policies for return_items table

-- Users can view return items for their returns
CREATE POLICY "users_view_return_items"
ON public.return_items
FOR SELECT
TO authenticated
USING (
    return_id IN (
        SELECT id FROM public.returns 
        WHERE buyer_id = auth.uid() 
        OR vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
    )
);

-- Buyers can create return items
CREATE POLICY "buyers_create_return_items"
ON public.return_items
FOR INSERT
TO authenticated
WITH CHECK (
    return_id IN (
        SELECT id FROM public.returns WHERE buyer_id = auth.uid()
    )
);

-- 11. Add new notification types for returns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'notification_type' AND e.enumlabel = 'return_requested'
    ) THEN
        ALTER TYPE public.notification_type ADD VALUE 'return_requested';
        ALTER TYPE public.notification_type ADD VALUE 'return_approved';
        ALTER TYPE public.notification_type ADD VALUE 'return_rejected';
        ALTER TYPE public.notification_type ADD VALUE 'refund_processed';
    END IF;
END $$;

-- 12. Function to notify on return status change
CREATE OR REPLACE FUNCTION public.notify_return_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    notification_type_val public.notification_type;
    target_user_id UUID;
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        notification_title := 'Return Approved';
        notification_message := 'Your return request ' || NEW.rma_number || ' has been approved.';
        notification_type_val := 'return_approved'::public.notification_type;
        target_user_id := NEW.buyer_id;
        
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            target_user_id,
            notification_title,
            notification_message,
            notification_type_val,
            '/buyer-dashboard/returns/' || NEW.id
        );
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        notification_title := 'Return Rejected';
        notification_message := 'Your return request ' || NEW.rma_number || ' has been rejected.';
        notification_type_val := 'return_rejected'::public.notification_type;
        target_user_id := NEW.buyer_id;
        
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            target_user_id,
            notification_title,
            notification_message,
            notification_type_val,
            '/buyer-dashboard/returns/' || NEW.id
        );
    ELSIF NEW.refund_status = 'completed' AND OLD.refund_status != 'completed' THEN
        notification_title := 'Refund Processed';
        notification_message := 'Your refund for ' || NEW.rma_number || ' has been processed.';
        notification_type_val := 'refund_processed'::public.notification_type;
        target_user_id := NEW.buyer_id;
        
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            target_user_id,
            notification_title,
            notification_message,
            notification_type_val,
            '/buyer-dashboard/returns/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER notify_return_status_change_trigger
AFTER UPDATE ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.notify_return_status_change();

-- 13. Function to notify vendor on new return request
CREATE OR REPLACE FUNCTION public.notify_vendor_new_return()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    vendor_user_id UUID;
BEGIN
    SELECT user_id INTO vendor_user_id
    FROM public.vendor_profiles
    WHERE id = NEW.vendor_id;
    
    IF vendor_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            vendor_user_id,
            'New Return Request',
            'You have received a new return request ' || NEW.rma_number || '.',
            'return_requested'::public.notification_type,
            '/vendor-dashboard/returns/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER notify_vendor_new_return_trigger
AFTER INSERT ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.notify_vendor_new_return();

-- 14. Mock data for returns
DO $$
DECLARE
    buyer_id UUID;
    vendor_id UUID;
    selected_order_id UUID;
    order_item_id UUID;
    return1_id UUID := gen_random_uuid();
    return2_id UUID := gen_random_uuid();
BEGIN
    SELECT id INTO buyer_id FROM public.user_profiles WHERE role = 'buyer'::public.user_role LIMIT 1;
    SELECT id INTO vendor_id FROM public.vendor_profiles LIMIT 1;
    SELECT id INTO selected_order_id FROM public.orders WHERE status = 'delivered'::public.order_status LIMIT 1;
    
    -- Fixed: Renamed variable to 'selected_order_id' to avoid ambiguity with column 'order_id'
    SELECT oi.id INTO order_item_id 
    FROM public.order_items oi 
    WHERE oi.order_id = selected_order_id 
    LIMIT 1;
    
    IF buyer_id IS NOT NULL AND vendor_id IS NOT NULL AND selected_order_id IS NOT NULL AND order_item_id IS NOT NULL THEN
        INSERT INTO public.returns (
            id, order_id, buyer_id, vendor_id, rma_number, return_reason, 
            reason_details, status, refund_status, refund_amount, refund_method
        ) VALUES
        (
            return1_id, selected_order_id, buyer_id, vendor_id, 
            public.generate_rma_number(),
            'defective'::public.return_reason,
            'Product arrived damaged with visible cracks on the screen',
            'pending'::public.return_status,
            'pending'::public.refund_status,
            59.99,
            'original_payment'
        ),
        (
            return2_id, selected_order_id, buyer_id, vendor_id,
            public.generate_rma_number(),
            'wrong_item'::public.return_reason,
            'Received blue color instead of black as ordered',
            'approved'::public.return_status,
            'processing'::public.refund_status,
            39.99,
            'original_payment'
        );
        
        INSERT INTO public.return_items (return_id, order_item_id, quantity, refund_amount)
        VALUES
        (return1_id, order_item_id, 1, 59.99),
        (return2_id, order_item_id, 1, 39.99);
    END IF;
END $$;