-- Location: supabase/migrations/20251220110000_escrow_module.sql
-- Schema Analysis: Adding escrow functionality to existing marketplace
-- Integration Type: NEW_MODULE - Adding complete escrow system
-- Dependencies: orders, payments, user_profiles, vendor_profiles

-- ============================================================================
-- 1. CUSTOM TYPES FOR ESCROW SYSTEM
-- ============================================================================

-- Escrow status for tracking escrow account lifecycle
DO $$ BEGIN
  CREATE TYPE public.escrow_status AS ENUM (
    'created',        -- Escrow account created but no funds deposited
    'funded',         -- Funds deposited and held in escrow
    'released',       -- Funds released to vendor
    'refunded',       -- Funds refunded to buyer
    'disputed',       -- Dispute initiated
    'resolved'        -- Dispute resolved
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Escrow transaction types
DO $$ BEGIN
  CREATE TYPE public.escrow_transaction_type AS ENUM (
    'deposit',        -- Funds moved into escrow
    'release',        -- Funds released to vendor
    'refund',         -- Funds refunded to buyer
    'dispute_hold',   -- Funds frozen due to dispute
    'dispute_release' -- Funds released after dispute resolution
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CORE ESCROW TABLES
-- ============================================================================

-- Escrow accounts table - tracks escrow accounts for each order
CREATE TABLE IF NOT EXISTS public.escrow_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'TZS' NOT NULL,
  status public.escrow_status DEFAULT 'created'::public.escrow_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  funded_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one escrow account per order
  UNIQUE(order_id)
);

-- Escrow transactions table - tracks all movements of funds in escrow
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_account_id UUID REFERENCES public.escrow_accounts(id) ON DELETE CASCADE NOT NULL,
  transaction_type public.escrow_transaction_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'TZS' NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL, -- Link to original payment
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Escrow releases table - tracks release requests and approvals
CREATE TABLE IF NOT EXISTS public.escrow_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_account_id UUID REFERENCES public.escrow_accounts(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL, -- Who requested the release
  approver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL, -- Who approved it (could be system or admin)
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'TZS' NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reason TEXT, -- Reason for release request
  notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Escrow accounts indexes
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_order_id ON public.escrow_accounts(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_buyer_id ON public.escrow_accounts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_vendor_id ON public.escrow_accounts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_status ON public.escrow_accounts(status);

-- Escrow transactions indexes
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_escrow_account_id ON public.escrow_transactions(escrow_account_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_transaction_type ON public.escrow_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_payment_id ON public.escrow_transactions(payment_id);

-- Escrow releases indexes
CREATE INDEX IF NOT EXISTS idx_escrow_releases_escrow_account_id ON public.escrow_releases(escrow_account_id);
CREATE INDEX IF NOT EXISTS idx_escrow_releases_requester_id ON public.escrow_releases(requester_id);
CREATE INDEX IF NOT EXISTS idx_escrow_releases_status ON public.escrow_releases(status);

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_releases ENABLE ROW LEVEL SECURITY;

-- Escrow accounts policies
CREATE POLICY "users_read_own_escrow_accounts"
ON public.escrow_accounts
FOR SELECT
TO authenticated
USING (
  buyer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.vendor_profiles vp 
    WHERE vp.id = escrow_accounts.vendor_id AND vp.user_id = auth.uid()
  ) OR
  public.is_admin_from_auth()
);

CREATE POLICY "admin_manage_escrow_accounts"
ON public.escrow_accounts
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Escrow transactions policies
CREATE POLICY "users_read_own_escrow_transactions"
ON public.escrow_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.escrow_accounts ea
    WHERE ea.id = escrow_transactions.escrow_account_id 
    AND (
      ea.buyer_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.vendor_profiles vp 
        WHERE vp.id = ea.vendor_id AND vp.user_id = auth.uid()
      )
    )
  ) OR
  public.is_admin_from_auth()
);

CREATE POLICY "admin_manage_escrow_transactions"
ON public.escrow_transactions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Escrow releases policies
CREATE POLICY "users_read_own_escrow_releases"
ON public.escrow_releases
FOR SELECT
TO authenticated
USING (
  requester_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.escrow_accounts ea
    JOIN public.vendor_profiles vp ON vp.id = ea.vendor_id
    WHERE ea.id = escrow_releases.escrow_account_id AND vp.user_id = auth.uid()
  ) OR
  public.is_admin_from_auth()
);

CREATE POLICY "users_create_escrow_releases"
ON public.escrow_releases
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.escrow_accounts ea
    WHERE ea.id = escrow_releases.escrow_account_id 
    AND (
      ea.buyer_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.vendor_profiles vp 
        WHERE vp.id = ea.vendor_id AND vp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "admin_manage_escrow_releases"
ON public.escrow_releases
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- ============================================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Trigger for escrow accounts updated_at
CREATE TRIGGER update_escrow_accounts_updated_at
  BEFORE UPDATE ON public.escrow_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. EXTENSIONS TO EXISTING TABLES
-- ============================================================================

-- Add escrow_account_id to payments table for linking
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS escrow_account_id UUID REFERENCES public.escrow_accounts(id) ON DELETE SET NULL;

-- Add escrow_enabled flag to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS escrow_enabled BOOLEAN DEFAULT true;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_payments_escrow_account_id ON public.payments(escrow_account_id);
CREATE INDEX IF NOT EXISTS idx_orders_escrow_enabled ON public.orders(escrow_enabled);

-- ============================================================================
-- 7. FUNCTIONS FOR ESCROW OPERATIONS
-- ============================================================================

-- Function to create escrow account for an order
CREATE OR REPLACE FUNCTION public.create_escrow_account_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  escrow_id UUID;
BEGIN
  -- Only create escrow account for orders that should use escrow
  IF NEW.escrow_enabled = true THEN
    INSERT INTO public.escrow_accounts (
      order_id,
      buyer_id,
      vendor_id,
      amount,
      currency
    ) VALUES (
      NEW.id,
      NEW.buyer_id,
      NEW.vendor_id,
      NEW.total_amount,
      'TZS'
    ) RETURNING id INTO escrow_id;
    
    -- Create notification for buyer
    PERFORM public.create_notification(
      NEW.buyer_id,
      'order_created'::public.notification_type,
      'Order Created with Escrow Protection',
      'Your order ' || NEW.order_number || ' has been created. Payment will be held securely in escrow until delivery confirmation.',
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'escrow_id', escrow_id),
      '/order-tracking?orderId=' || NEW.id
    );
    
    -- Create notification for vendor
    PERFORM public.create_notification(
      (SELECT user_id FROM public.vendor_profiles WHERE id = NEW.vendor_id),
      'new_vendor_order'::public.notification_type,
      'New Order with Escrow Protection',
      'You have received a new order ' || NEW.order_number || '. Payment is secured in escrow until delivery confirmation.',
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'escrow_id', escrow_id),
      '/vendor-dashboard/orders/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to update order status when escrow status changes
CREATE OR REPLACE FUNCTION public.update_order_status_on_escrow_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update order status based on escrow status
  CASE NEW.status
    WHEN 'funded' THEN
      -- When escrow is funded, order moves to confirmed
      UPDATE public.orders 
      SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.order_id;
    WHEN 'released' THEN
      -- When escrow is released, order moves to completed
      UPDATE public.orders 
      SET status = 'delivered', updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.order_id;
    WHEN 'refunded' THEN
      -- When escrow is refunded, order moves to refunded
      UPDATE public.orders 
      SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.order_id;
    ELSE
      -- No status change for other escrow states
  END CASE;
  
  RETURN NEW;
END;
$$;

-- Trigger to create escrow account when order is created
DROP TRIGGER IF EXISTS create_escrow_account_trigger ON public.orders;
CREATE TRIGGER create_escrow_account_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_escrow_account_for_order();

-- Trigger to update order status when escrow status changes
DROP TRIGGER IF EXISTS update_order_status_on_escrow_change_trigger ON public.escrow_accounts;
CREATE TRIGGER update_order_status_on_escrow_change_trigger
  AFTER UPDATE OF status ON public.escrow_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_status_on_escrow_change();

-- ============================================================================
-- 8. MOCK DATA FOR TESTING
-- ============================================================================

DO $$
DECLARE
  existing_order_id UUID;
  existing_buyer_id UUID;
  existing_vendor_id UUID;
  escrow_account_id UUID;
BEGIN
  -- Get existing order, buyer, and vendor for testing
  SELECT o.id, o.buyer_id, o.vendor_id 
  INTO existing_order_id, existing_buyer_id, existing_vendor_id
  FROM public.orders o
  LIMIT 1;
  
  -- Only insert mock data if we have existing records
  IF existing_order_id IS NOT NULL THEN
    -- Create escrow account for the order
    INSERT INTO public.escrow_accounts (
      order_id,
      buyer_id,
      vendor_id,
      amount,
      currency,
      status,
      funded_at
    ) VALUES (
      existing_order_id,
      existing_buyer_id,
      existing_vendor_id,
      2510000.00,
      'TZS',
      'funded'::public.escrow_status,
      CURRENT_TIMESTAMP
    ) RETURNING id INTO escrow_account_id;
    
    -- Create escrow transaction
    INSERT INTO public.escrow_transactions (
      escrow_account_id,
      transaction_type,
      amount,
      currency,
      notes
    ) VALUES (
      escrow_account_id,
      'deposit'::public.escrow_transaction_type,
      2510000.00,
      'TZS',
      'Initial deposit for order payment'
    );
    
    RAISE NOTICE 'Mock escrow data created successfully';
  ELSE
    RAISE NOTICE 'No existing orders found for mock data';
  END IF;
END $$;