-- Location: supabase/migrations/20251219092754_support_ticketing_module.sql
-- Schema Analysis: Existing marketplace schema with user_profiles, orders, payments, notifications
-- Integration Type: NEW_MODULE - Adding support ticketing system
-- Dependencies: user_profiles, orders (existing tables)

-- 1. ENUMS AND TYPES
DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_category AS ENUM ('order_issue', 'payment_issue', 'product_issue', 'account_issue', 'technical_issue', 'general_inquiry');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.message_sender_type AS ENUM ('user', 'support_agent', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. CORE TABLES

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    category public.ticket_category NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status public.ticket_status DEFAULT 'open'::public.ticket_status,
    priority public.ticket_priority DEFAULT 'medium'::public.ticket_priority,
    assigned_agent_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_resolution_status CHECK (
        (status IN ('resolved', 'closed') AND resolved_at IS NOT NULL) OR
        (status NOT IN ('resolved', 'closed') AND resolved_at IS NULL)
    )
);

-- Ticket Messages Table
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    sender_type public.message_sender_type NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_internal_note BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Categories Table
CREATE TABLE IF NOT EXISTS public.faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Articles Table
CREATE TABLE IF NOT EXISTS public.faq_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_order_id ON public.support_tickets(order_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_assigned_agent ON public.support_tickets(assigned_agent_id);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_sender_id ON public.ticket_messages(sender_id);
CREATE INDEX idx_faq_articles_category_id ON public.faq_articles(category_id);
CREATE INDEX idx_faq_categories_active ON public.faq_categories(is_active);
CREATE INDEX idx_faq_articles_active ON public.faq_articles(is_active);

-- 4. FUNCTIONS (Before RLS Policies)

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $func$
DECLARE
    new_ticket_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM public.support_tickets;
    new_ticket_number := 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 5, '0');
    RETURN new_ticket_number;
END;
$func$;

-- Function to update ticket timestamps
CREATE OR REPLACE FUNCTION public.update_ticket_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    IF NEW.status = 'resolved'::public.ticket_status AND OLD.status != 'resolved'::public.ticket_status THEN
        NEW.resolved_at = CURRENT_TIMESTAMP;
    END IF;
    
    IF NEW.status = 'closed'::public.ticket_status AND OLD.status != 'closed'::public.ticket_status THEN
        NEW.closed_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$func$;

-- Function to auto-generate ticket number on insert
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number = public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$func$;

-- Function to create notification for new ticket message
CREATE OR REPLACE FUNCTION public.notify_new_ticket_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    ticket_user_id UUID;
    notification_message TEXT;
BEGIN
    SELECT user_id INTO ticket_user_id FROM public.support_tickets WHERE id = NEW.ticket_id;
    
    IF NEW.sender_type = 'support_agent'::public.message_sender_type THEN
        notification_message := 'You have a new response on your support ticket';
        
        INSERT INTO public.notifications (user_id, type, title, message, link)
        VALUES (
            ticket_user_id,
            'order_created'::public.notification_type,
            'Support Ticket Update',
            notification_message,
            '/support/tickets/' || NEW.ticket_id
        );
    END IF;
    
    RETURN NEW;
END;
$func$;

-- 5. ENABLE RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Support Tickets Policies
CREATE POLICY "users_view_own_support_tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_create_own_support_tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_support_tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin access for support tickets
CREATE POLICY "admin_full_access_support_tickets"
ON public.support_tickets
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Ticket Messages Policies
CREATE POLICY "users_view_own_ticket_messages"
ON public.ticket_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id = ticket_messages.ticket_id
        AND st.user_id = auth.uid()
    )
);

CREATE POLICY "users_create_ticket_messages"
ON public.ticket_messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id = ticket_messages.ticket_id
        AND st.user_id = auth.uid()
    )
);

-- Admin access for ticket messages
CREATE POLICY "admin_full_access_ticket_messages"
ON public.ticket_messages
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- FAQ Policies (Public Read)
CREATE POLICY "public_read_faq_categories"
ON public.faq_categories
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "public_read_faq_articles"
ON public.faq_articles
FOR SELECT
TO public
USING (is_active = true);

-- Admin access for FAQ management
CREATE POLICY "admin_full_access_faq_categories"
ON public.faq_categories
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_faq_articles"
ON public.faq_articles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 7. TRIGGERS
CREATE TRIGGER set_ticket_number_trigger
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_ticket_number();

CREATE TRIGGER update_ticket_timestamp_trigger
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_ticket_timestamp();

CREATE TRIGGER notify_new_ticket_message_trigger
AFTER INSERT ON public.ticket_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_ticket_message();

CREATE TRIGGER update_faq_categories_timestamp
BEFORE UPDATE ON public.faq_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_faq_articles_timestamp
BEFORE UPDATE ON public.faq_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 8. MOCK DATA
DO $$
DECLARE
    buyer_id UUID;
    vendor_id UUID;
    order_id UUID;
    ticket_id UUID;
    faq_category_general UUID := gen_random_uuid();
    faq_category_orders UUID := gen_random_uuid();
    faq_category_payments UUID := gen_random_uuid();
BEGIN
    -- Get existing user and order IDs
    SELECT id INTO buyer_id FROM public.user_profiles WHERE role = 'buyer'::public.user_role LIMIT 1;
    SELECT id INTO vendor_id FROM public.user_profiles WHERE role = 'vendor'::public.user_role LIMIT 1;
    SELECT id INTO order_id FROM public.orders LIMIT 1;
    
    -- Create FAQ Categories
    INSERT INTO public.faq_categories (id, name, description, display_order, is_active) VALUES
        (faq_category_general, 'General Questions', 'Common questions about our marketplace', 1, true),
        (faq_category_orders, 'Orders & Delivery', 'Questions about ordering and delivery process', 2, true),
        (faq_category_payments, 'Payments & Refunds', 'Payment methods and refund policies', 3, true);
    
    -- Create FAQ Articles
    INSERT INTO public.faq_articles (category_id, question, answer, display_order, is_active) VALUES
        (faq_category_general, 'How do I create an account?', 'Click on the Register button in the top right corner and fill in your details. You will receive a confirmation email to verify your account.', 1, true),
        (faq_category_general, 'Is my data secure?', 'Yes, we use industry-standard encryption and security measures to protect your personal information and transaction data.', 2, true),
        (faq_category_orders, 'How long does delivery take?', 'Delivery times vary by location and product. Typically, orders within Tanzania are delivered within 2-5 business days.', 1, true),
        (faq_category_orders, 'Can I track my order?', 'Yes, once your order is shipped, you will receive a tracking number via SMS and email to monitor your delivery status.', 2, true),
        (faq_category_orders, 'What if my order is damaged?', 'Please contact our support team within 48 hours of delivery with photos of the damage. We will arrange for a replacement or refund.', 3, true),
        (faq_category_payments, 'What payment methods do you accept?', 'We accept M-Pesa, Tigo Pesa, Visa/Mastercard, and bank transfers through ClickPesa payment gateway.', 1, true),
        (faq_category_payments, 'How do refunds work?', 'Refunds are processed within 5-7 business days after approval. The amount will be returned to your original payment method.', 2, true),
        (faq_category_payments, 'Is it safe to pay online?', 'Yes, all payments are processed through secure, encrypted channels via our trusted payment partner ClickPesa.', 3, true);
    
    IF buyer_id IS NOT NULL AND order_id IS NOT NULL THEN
        -- Create sample support tickets
        INSERT INTO public.support_tickets (id, user_id, order_id, category, subject, description, status, priority) VALUES
            (gen_random_uuid(), buyer_id, order_id, 'order_issue'::public.ticket_category, 'Order not received', 'I placed an order 5 days ago but have not received it yet. The tracking shows it was delivered but I did not receive anything.', 'open'::public.ticket_status, 'high'::public.ticket_priority),
            (gen_random_uuid(), buyer_id, NULL, 'payment_issue'::public.ticket_category, 'Payment deducted but order not confirmed', 'My M-Pesa payment was deducted but the order status still shows pending. Please help resolve this.', 'in_progress'::public.ticket_status, 'urgent'::public.ticket_priority)
        RETURNING id INTO ticket_id;
        
        -- Add sample ticket messages
        INSERT INTO public.ticket_messages (ticket_id, sender_id, sender_type, message) VALUES
            (ticket_id, buyer_id, 'user'::public.message_sender_type, 'I have checked with my neighbors but no one received the package. Can you please investigate?');
    END IF;
END $$;