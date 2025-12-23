-- Location: supabase/migrations/20251219085310_marketplace_module.sql
-- Schema Analysis: Existing tables - user_profiles, vendor_profiles, phone_verifications
-- Integration Type: NEW_MODULE - Adding complete marketplace functionality
-- Dependencies: user_profiles (existing), vendor_profiles (existing)

-- ============================================================================
-- 1. CUSTOM TYPES
-- ============================================================================

-- Order status for tracking real-time order updates
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment status for ClickPesa integration
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment method for ClickPesa (M-Pesa, Tigo Pesa, Card, Bank)
DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM (
    'mpesa',
    'tigo_pesa',
    'card',
    'bank_transfer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notification types for real-time updates
DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM (
    'order_created',
    'order_confirmed',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'payment_completed',
    'payment_failed',
    'review_received',
    'inventory_low',
    'inventory_out',
    'new_vendor_order'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CORE TABLES (NO FOREIGN KEYS)
-- ============================================================================

-- Categories table for product organization
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  is_digital_friendly BOOLEAN DEFAULT false,
  is_physical_friendly BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. DEPENDENT TABLES (WITH FOREIGN KEYS)
-- ============================================================================

-- Products table with inventory tracking for real-time updates
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= price),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  sku TEXT UNIQUE,
  weight DECIMAL(8, 2),
  dimensions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Orders table with status tracking for real-time updates
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
  tax_amount DECIMAL(10, 2) DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL,
  shipping_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payments table for ClickPesa integration
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  payment_method public.payment_method NOT NULL,
  payment_status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'TZS' NOT NULL,
  transaction_id TEXT UNIQUE,
  clickpesa_reference TEXT,
  phone_number TEXT,
  payment_details JSONB,
  error_message TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images JSONB,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, user_id, order_id)
);

-- Wishlists table
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Notifications table for real-time buyer/vendor notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- Categories indexes
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

-- Products indexes
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_stock_quantity ON public.products(stock_quantity);

-- Product images indexes
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);

-- Orders indexes
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Payments indexes
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_is_approved ON public.reviews(is_approved);

-- Wishlists indexes
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================================
-- 5. FUNCTIONS (BEFORE RLS POLICIES)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Function to update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
  total_reviews INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(rating), 0.0)::DECIMAL(3, 2),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM public.reviews
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND is_approved = true;

  UPDATE public.products
  SET 
    rating = avg_rating,
    review_count = total_reviews,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to check if user is vendor owner
CREATE OR REPLACE FUNCTION public.is_vendor_owner(vendor_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendor_profiles vp
    WHERE vp.id = vendor_uuid AND vp.user_id = auth.uid()
  )
$$;

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_order_number := 'ORD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = new_order_number) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_order_number;
END;
$$;

-- Function to create notification for user
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_type public.notification_type,
  notification_title TEXT,
  notification_message TEXT,
  notification_data JSONB DEFAULT NULL,
  notification_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    link
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_data,
    notification_link
  )
  RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$;

-- Function to handle order status change notifications
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type public.notification_type;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_type := 'order_confirmed'::public.notification_type;
        notification_title := 'Order Confirmed';
        notification_message := 'Your order ' || NEW.order_number || ' has been confirmed';
      WHEN 'shipped' THEN
        notification_type := 'order_shipped'::public.notification_type;
        notification_title := 'Order Shipped';
        notification_message := 'Your order ' || NEW.order_number || ' has been shipped';
      WHEN 'delivered' THEN
        notification_type := 'order_delivered'::public.notification_type;
        notification_title := 'Order Delivered';
        notification_message := 'Your order ' || NEW.order_number || ' has been delivered';
      WHEN 'cancelled' THEN
        notification_type := 'order_cancelled'::public.notification_type;
        notification_title := 'Order Cancelled';
        notification_message := 'Your order ' || NEW.order_number || ' has been cancelled';
      ELSE
        RETURN NEW;
    END CASE;

    PERFORM public.create_notification(
      NEW.buyer_id,
      notification_type,
      notification_title,
      notification_message,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number),
      '/order-tracking?orderId=' || NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Function to notify vendor of new order
CREATE OR REPLACE FUNCTION public.notify_vendor_new_order()
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
    PERFORM public.create_notification(
      vendor_user_id,
      'new_vendor_order'::public.notification_type,
      'New Order Received',
      'You have received a new order ' || NEW.order_number,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number),
      '/vendor-dashboard'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Function to check low inventory and notify
CREATE OR REPLACE FUNCTION public.check_inventory_and_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vendor_user_id UUID;
  notification_type public.notification_type;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  SELECT user_id INTO vendor_user_id
  FROM public.vendor_profiles
  WHERE id = NEW.vendor_id;

  IF vendor_user_id IS NOT NULL THEN
    IF NEW.stock_quantity = 0 THEN
      notification_type := 'inventory_out'::public.notification_type;
      notification_title := 'Product Out of Stock';
      notification_message := 'Product ' || NEW.name || ' is out of stock';
    ELSIF NEW.stock_quantity <= NEW.low_stock_threshold AND 
          (OLD.stock_quantity IS NULL OR OLD.stock_quantity > NEW.low_stock_threshold) THEN
      notification_type := 'inventory_low'::public.notification_type;
      notification_title := 'Low Stock Alert';
      notification_message := 'Product ' || NEW.name || ' is running low on stock (' || NEW.stock_quantity || ' remaining)';
    ELSE
      RETURN NEW;
    END IF;

    PERFORM public.create_notification(
      vendor_user_id,
      notification_type,
      notification_title,
      notification_message,
      jsonb_build_object('product_id', NEW.id, 'stock_quantity', NEW.stock_quantity),
      '/vendor-store-management'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 6. ENABLE RLS
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

-- Categories policies (public read, admin write)
CREATE POLICY "public_read_categories"
ON public.categories
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_manage_categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Products policies (public read active, vendor manage own)
CREATE POLICY "public_read_active_products"
ON public.products
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "vendors_manage_own_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_vendor_owner(vendor_id))
WITH CHECK (public.is_vendor_owner(vendor_id));

CREATE POLICY "admin_manage_all_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Product images policies (public read, vendor manage via product)
CREATE POLICY "public_read_product_images"
ON public.product_images
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND p.is_active = true
  )
);

CREATE POLICY "vendors_manage_own_product_images"
ON public.product_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND public.is_vendor_owner(p.vendor_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND public.is_vendor_owner(p.vendor_id)
  )
);

-- Orders policies (buyer/vendor/admin access)
CREATE POLICY "buyers_read_own_orders"
ON public.orders
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid());

CREATE POLICY "vendors_read_own_orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles vp
    WHERE vp.id = orders.vendor_id AND vp.user_id = auth.uid()
  )
);

CREATE POLICY "buyers_create_orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "vendors_update_own_orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles vp
    WHERE vp.id = orders.vendor_id AND vp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles vp
    WHERE vp.id = orders.vendor_id AND vp.user_id = auth.uid()
  )
);

CREATE POLICY "admin_manage_all_orders"
ON public.orders
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Order items policies (access via order)
CREATE POLICY "users_read_own_order_items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id 
    AND (o.buyer_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.vendor_profiles vp WHERE vp.id = o.vendor_id AND vp.user_id = auth.uid()))
  )
);

CREATE POLICY "buyers_create_order_items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.buyer_id = auth.uid()
  )
);

-- Payments policies (access via order)
CREATE POLICY "users_read_own_payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id 
    AND (o.buyer_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.vendor_profiles vp WHERE vp.id = o.vendor_id AND vp.user_id = auth.uid()))
  )
);

CREATE POLICY "buyers_create_payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id AND o.buyer_id = auth.uid()
  )
);

CREATE POLICY "system_update_payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id AND o.buyer_id = auth.uid()
  )
);

-- Reviews policies (public read approved, users manage own)
CREATE POLICY "public_read_approved_reviews"
ON public.reviews
FOR SELECT
TO public
USING (is_approved = true);

CREATE POLICY "users_manage_own_reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_manage_all_reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Wishlists policies (users manage own)
CREATE POLICY "users_manage_own_wishlists"
ON public.wishlists
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Notifications policies (users read own)
CREATE POLICY "users_manage_own_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for product rating updates
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_rating();

-- Trigger for order status change notifications
CREATE TRIGGER notify_order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- Trigger for new order vendor notifications
CREATE TRIGGER notify_vendor_new_order_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vendor_new_order();

-- Trigger for inventory notifications
CREATE TRIGGER check_inventory_trigger
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_inventory_and_notify();

-- ============================================================================
-- 9. MOCK DATA
-- ============================================================================

DO $$
DECLARE
  electronics_cat_id UUID := gen_random_uuid();
  phones_cat_id UUID := gen_random_uuid();
  laptops_cat_id UUID := gen_random_uuid();
  fashion_cat_id UUID := gen_random_uuid();
  
  existing_vendor_id UUID;
  existing_vendor_user_id UUID;
  existing_buyer_id UUID;
  
  product1_id UUID := gen_random_uuid();
  product2_id UUID := gen_random_uuid();
  product3_id UUID := gen_random_uuid();
  
  order1_id UUID := gen_random_uuid();
  order2_id UUID := gen_random_uuid();
BEGIN
  -- Get existing vendor and buyer from user_profiles
  SELECT vp.id, vp.user_id INTO existing_vendor_id, existing_vendor_user_id
  FROM public.vendor_profiles vp
  WHERE vp.is_verified = true
  LIMIT 1;

  SELECT id INTO existing_buyer_id
  FROM public.user_profiles
  WHERE role = 'buyer'::public.user_role
  LIMIT 1;

  IF existing_vendor_id IS NULL OR existing_buyer_id IS NULL THEN
    RAISE NOTICE 'No existing vendor or buyer found. Please create users first.';
    RETURN;
  END IF;

  -- Insert categories
  INSERT INTO public.categories (id, name, slug, description, is_active, display_order, is_digital_friendly, is_physical_friendly) VALUES
    (electronics_cat_id, 'Electronics', 'electronics', 'Electronic devices and accessories', true, 1, false, true),
    (fashion_cat_id, 'Fashion', 'fashion', 'Clothing and accessories', true, 2, false, true),
    ('12345678-1234-1234-1234-123456789012', 'Books & Media', 'books-media', 'Educational materials, books, music, and digital content', true, 3, true, false);

  INSERT INTO public.categories (id, name, slug, description, parent_id, is_active, display_order, is_digital_friendly, is_physical_friendly) VALUES
    (phones_cat_id, 'Phones', 'phones', 'Mobile phones and smartphones', electronics_cat_id, true, 1, false, true),
    (laptops_cat_id, 'Laptops', 'laptops', 'Laptop computers', electronics_cat_id, true, 2, false, true);

  -- Insert products
  INSERT INTO public.products (
    id, vendor_id, category_id, name, slug, description, price, compare_at_price,
    stock_quantity, low_stock_threshold, sku, is_active, is_featured
  ) VALUES
    (product1_id, existing_vendor_id, phones_cat_id, 'Samsung Galaxy S23', 'samsung-galaxy-s23',
     'Latest Samsung flagship phone with amazing camera', 2500000.00, 2800000.00,
     50, 10, 'SAMS23-001', true, true),
    (product2_id, existing_vendor_id, laptops_cat_id, 'MacBook Pro 14"', 'macbook-pro-14',
     'Powerful laptop for professionals', 4500000.00, 5000000.00,
     20, 5, 'MBP14-001', true, true),
    (product3_id, existing_vendor_id, fashion_cat_id, 'Classic T-Shirt', 'classic-tshirt',
     'Comfortable cotton t-shirt', 35000.00, NULL,
     100, 20, 'TSHIRT-001', true, false);

  -- Insert product images
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
    (product1_id, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'Samsung Galaxy S23 front view', true, 1),
    (product1_id, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'Samsung Galaxy S23 back view', false, 2),
    (product2_id, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'MacBook Pro 14 inch display', true, 1),
    (product3_id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'Classic white t-shirt', true, 1);

  -- Insert orders
  INSERT INTO public.orders (
    id, order_number, buyer_id, vendor_id, status, subtotal, shipping_cost,
    tax_amount, total_amount, shipping_address
  ) VALUES
    (order1_id, public.generate_order_number(), existing_buyer_id, existing_vendor_id,
     'confirmed'::public.order_status, 2500000.00, 10000.00, 0.00, 2510000.00,
     '{"name": "John Doe", "phone": "+255712345678", "address": "123 Main St", "city": "Dar es Salaam", "region": "Dar es Salaam", "postal_code": "12345"}'::jsonb),
    (order2_id, public.generate_order_number(), existing_buyer_id, existing_vendor_id,
     'pending'::public.order_status, 4500000.00, 15000.00, 0.00, 4515000.00,
     '{"name": "John Doe", "phone": "+255712345678", "address": "123 Main St", "city": "Dar es Salaam", "region": "Dar es Salaam", "postal_code": "12345"}'::jsonb);

  -- Insert order items
  INSERT INTO public.order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price) VALUES
    (order1_id, product1_id, 'Samsung Galaxy S23', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 1, 2500000.00, 2500000.00),
    (order2_id, product2_id, 'MacBook Pro 14"', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 1, 4500000.00, 4500000.00);

  -- Insert payments
  INSERT INTO public.payments (
    order_id, payment_method, payment_status, amount, currency, transaction_id, clickpesa_reference, phone_number
  ) VALUES
    (order1_id, 'mpesa'::public.payment_method, 'completed'::public.payment_status,
     2510000.00, 'TZS', 'TXN123456789', 'CLICK-REF-123', '+255712345678'),
    (order2_id, 'tigo_pesa'::public.payment_method, 'pending'::public.payment_status,
     4515000.00, 'TZS', NULL, NULL, '+255712345678');

  -- Insert reviews
  INSERT INTO public.reviews (product_id, user_id, rating, title, comment, is_verified_purchase) VALUES
    (product1_id, existing_buyer_id, 5, 'Excellent Phone!', 'This phone exceeded my expectations. Camera quality is amazing!', true),
    (product2_id, existing_buyer_id, 4, 'Great Laptop', 'Very fast and powerful. Battery life is good but could be better.', true);

  -- Insert wishlists
  INSERT INTO public.wishlists (user_id, product_id) VALUES
    (existing_buyer_id, product3_id);

  RAISE NOTICE 'Mock data created successfully for marketplace module';
END $$;