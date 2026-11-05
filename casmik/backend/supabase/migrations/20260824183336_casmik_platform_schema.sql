-- Casmik Platform - Complete Database Schema
-- Migration: 20260824183336_casmik_platform_schema.sql

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM (
  'created', 'assigned', 'accepted', 'pickup_scheduled', 'picked_up',
  'inspection', 'inspection_completed', 'final_price', 'customer_accepted',
  'payment_processing', 'paid', 'completed', 'rejected', 'cancelled', 'rescheduled'
);

DROP TYPE IF EXISTS public.order_type CASCADE;
CREATE TYPE public.order_type AS ENUM ('sell', 'buy', 'exchange', 'repair');

DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'paid', 'failed');

DROP TYPE IF EXISTS public.partner_status CASCADE;
CREATE TYPE public.partner_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

DROP TYPE IF EXISTS public.agent_status CASCADE;
CREATE TYPE public.agent_status AS ENUM ('online', 'offline', 'on_trip');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'partner', 'delivery', 'customer');

DROP TYPE IF EXISTS public.ticket_status CASCADE;
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM ('order', 'partner', 'delivery', 'payment', 'system');

-- ─── CORE TABLES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role public.user_role DEFAULT 'customer'::public.user_role,
  avatar_url TEXT,
  city TEXT,
  pin_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image TEXT,
  alt TEXT,
  description TEXT,
  brand_count INTEGER DEFAULT 0,
  model_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo TEXT,
  alt TEXT,
  model_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.device_models (
  id TEXT PRIMARY KEY,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  image TEXT,
  alt TEXT,
  base_price INTEGER DEFAULT 0,
  storages TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  store_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  state TEXT,
  pin_codes TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  status public.partner_status DEFAULT 'pending'::public.partner_status,
  rating NUMERIC(3,1) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  pending_payout NUMERIC(12,2) DEFAULT 0,
  available_balance NUMERIC(12,2) DEFAULT 0,
  commission NUMERIC(5,2) DEFAULT 10,
  avatar TEXT,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.delivery_agents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  pin_codes TEXT[] DEFAULT '{}',
  status public.agent_status DEFAULT 'offline'::public.agent_status,
  rating NUMERIC(3,1) DEFAULT 0,
  today_pickups INTEGER DEFAULT 0,
  today_deliveries INTEGER DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  earnings NUMERIC(12,2) DEFAULT 0,
  vehicle TEXT,
  vehicle_number TEXT,
  avatar TEXT,
  is_approved BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_number TEXT NOT NULL UNIQUE,
  order_type public.order_type NOT NULL DEFAULT 'sell'::public.order_type,
  status public.order_status NOT NULL DEFAULT 'created'::public.order_status,
  customer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  pin_code TEXT,
  city TEXT,
  device_name TEXT NOT NULL,
  device_brand TEXT,
  device_model TEXT,
  device_storage TEXT,
  device_color TEXT,
  quoted_price NUMERIC(12,2) DEFAULT 0,
  final_price NUMERIC(12,2) DEFAULT 0,
  partner_id TEXT REFERENCES public.partners(id) ON DELETE SET NULL,
  partner_name TEXT,
  delivery_agent_id TEXT REFERENCES public.delivery_agents(id) ON DELETE SET NULL,
  delivery_agent_name TEXT,
  pickup_date TEXT,
  pickup_slot TEXT,
  payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
  inspection_score INTEGER,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type public.notification_type DEFAULT 'system'::public.notification_type,
  is_read BOOLEAN DEFAULT false,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'customer',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.ticket_status DEFAULT 'open'::public.ticket_status,
  priority TEXT DEFAULT 'medium',
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'customer',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'fixed',
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  applicable_on TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT REFERENCES public.partners(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payout_type TEXT NOT NULL DEFAULT 'bank_transfer',
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  bank_details JSONB DEFAULT '{}',
  notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inv_id TEXT NOT NULL UNIQUE,
  device_model_id TEXT REFERENCES public.device_models(id) ON DELETE SET NULL,
  device_name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  base_price NUMERIC(12,2) DEFAULT 0,
  stock_level INTEGER DEFAULT 0,
  alert_threshold INTEGER DEFAULT 5,
  location TEXT DEFAULT 'Main Warehouse',
  status TEXT DEFAULT 'good_stock',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel TEXT NOT NULL DEFAULT 'website',
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.repair_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_min NUMERIC(10,2) DEFAULT 0,
  price_max NUMERIC(10,2) DEFAULT 0,
  time_estimate TEXT,
  warranty TEXT,
  booking_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.refurbished_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'good',
  original_price NUMERIC(12,2) DEFAULT 0,
  selling_price NUMERIC(12,2) DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  battery_health INTEGER DEFAULT 80,
  inspection_score INTEGER DEFAULT 80,
  stock_count INTEGER DEFAULT 1,
  warranty TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON public.orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_agent_id ON public.orders(delivery_agent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_device_models_brand_id ON public.device_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_device_models_category_id ON public.device_models(category_id);

-- ─── FUNCTIONS ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ─── ENABLE RLS ───────────────────────────────────────────────────────────────

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refurbished_devices ENABLE ROW LEVEL SECURITY;

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "public_read_profiles" ON public.user_profiles;
CREATE POLICY "public_read_profiles" ON public.user_profiles
FOR SELECT TO public USING (true);

-- orders - public read for real-time tracking, authenticated write
DROP POLICY IF EXISTS "public_read_orders" ON public.orders;
CREATE POLICY "public_read_orders" ON public.orders
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_orders" ON public.orders;
CREATE POLICY "authenticated_manage_orders" ON public.orders
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- notifications
DROP POLICY IF EXISTS "users_own_notifications" ON public.notifications;
CREATE POLICY "users_own_notifications" ON public.notifications
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "public_read_notifications" ON public.notifications;
CREATE POLICY "public_read_notifications" ON public.notifications
FOR SELECT TO public USING (true);

-- support_tickets
DROP POLICY IF EXISTS "public_read_tickets" ON public.support_tickets;
CREATE POLICY "public_read_tickets" ON public.support_tickets
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_tickets" ON public.support_tickets;
CREATE POLICY "authenticated_manage_tickets" ON public.support_tickets
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ticket_replies
DROP POLICY IF EXISTS "public_read_replies" ON public.ticket_replies;
CREATE POLICY "public_read_replies" ON public.ticket_replies
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_replies" ON public.ticket_replies;
CREATE POLICY "authenticated_manage_replies" ON public.ticket_replies
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- partners
DROP POLICY IF EXISTS "public_read_partners" ON public.partners;
CREATE POLICY "public_read_partners" ON public.partners
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_partners" ON public.partners;
CREATE POLICY "authenticated_manage_partners" ON public.partners
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- delivery_agents
DROP POLICY IF EXISTS "public_read_agents" ON public.delivery_agents;
CREATE POLICY "public_read_agents" ON public.delivery_agents
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_agents" ON public.delivery_agents;
CREATE POLICY "authenticated_manage_agents" ON public.delivery_agents
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- categories, brands, device_models - public read
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_categories" ON public.categories;
CREATE POLICY "authenticated_manage_categories" ON public.categories
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_brands" ON public.brands;
CREATE POLICY "public_read_brands" ON public.brands
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_brands" ON public.brands;
CREATE POLICY "authenticated_manage_brands" ON public.brands
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_models" ON public.device_models;
CREATE POLICY "public_read_models" ON public.device_models
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_models" ON public.device_models;
CREATE POLICY "authenticated_manage_models" ON public.device_models
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- coupons
DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;
CREATE POLICY "public_read_coupons" ON public.coupons
FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_manage_coupons" ON public.coupons;
CREATE POLICY "authenticated_manage_coupons" ON public.coupons
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- payouts
DROP POLICY IF EXISTS "public_read_payouts" ON public.payouts;
CREATE POLICY "public_read_payouts" ON public.payouts
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_payouts" ON public.payouts;
CREATE POLICY "authenticated_manage_payouts" ON public.payouts
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- inventory
DROP POLICY IF EXISTS "public_read_inventory" ON public.inventory;
CREATE POLICY "public_read_inventory" ON public.inventory
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_inventory" ON public.inventory;
CREATE POLICY "authenticated_manage_inventory" ON public.inventory
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- cms_content
DROP POLICY IF EXISTS "public_read_cms" ON public.cms_content;
CREATE POLICY "public_read_cms" ON public.cms_content
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_cms" ON public.cms_content;
CREATE POLICY "authenticated_manage_cms" ON public.cms_content
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- repair_issues
DROP POLICY IF EXISTS "public_read_repair_issues" ON public.repair_issues;
CREATE POLICY "public_read_repair_issues" ON public.repair_issues
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_repair_issues" ON public.repair_issues;
CREATE POLICY "authenticated_manage_repair_issues" ON public.repair_issues
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- refurbished_devices
DROP POLICY IF EXISTS "public_read_refurbished" ON public.refurbished_devices;
CREATE POLICY "public_read_refurbished" ON public.refurbished_devices
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_refurbished" ON public.refurbished_devices;
CREATE POLICY "authenticated_manage_refurbished" ON public.refurbished_devices
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_agents_updated_at ON public.delivery_agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.delivery_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Seed categories
  INSERT INTO public.categories (id, name, slug, icon, image, alt, description, brand_count, model_count, active, sort_order) VALUES
    ('cat-smartphone', 'Smartphones', 'smartphones', '📱', 'https://img.rocket.new/generatedImages/rocket_gen_img_1a6bbc97c-1766486052960.png', 'Various smartphones', 'Sell, buy or exchange your smartphone', 15, 180, true, 1),
    ('cat-laptop', 'Laptops', 'laptops', '💻', 'https://img.rocket.new/generatedImages/rocket_gen_img_1fbe29315-1773056140933.png', 'Open laptop on desk', 'Get the best value for your laptop', 10, 95, true, 2),
    ('cat-tablet', 'Tablets', 'tablets', '📟', 'https://images.unsplash.com/photo-1688296526355-c25c44c97d3e', 'iPad tablet with Apple Pencil', 'Sell or buy certified refurbished tablets', 6, 42, true, 3),
    ('cat-smartwatch', 'Smartwatches', 'smartwatches', '⌚', 'https://img.rocket.new/generatedImages/rocket_gen_img_14071888e-1772305512168.png', 'Modern smartwatch', 'Trade in your smartwatch for instant cash', 5, 28, true, 4),
    ('cat-earbuds', 'Earbuds & Headphones', 'earbuds', '🎧', 'https://images.unsplash.com/photo-1606741965359-946075e4d550', 'Wireless earbuds in charging case', 'Get cash for your earbuds and headphones', 8, 35, true, 6)
  ON CONFLICT (id) DO NOTHING;

  -- Seed brands
  INSERT INTO public.brands (id, category_id, name, slug, logo, alt, model_count, active) VALUES
    ('brand-apple', 'cat-smartphone', 'Apple', 'apple', 'https://img.rocket.new/generatedImages/rocket_gen_img_17770e405-1787593576108.png', 'Apple logo', 24, true),
    ('brand-samsung', 'cat-smartphone', 'Samsung', 'samsung', 'https://img.rocket.new/generatedImages/rocket_gen_img_1f9249e7a-1787485872587.png', 'Samsung logo', 38, true),
    ('brand-oneplus', 'cat-smartphone', 'OnePlus', 'oneplus', 'https://img.rocket.new/generatedImages/rocket_gen_img_12b42f3b3-1773054280340.png', 'OnePlus logo', 16, true),
    ('brand-google', 'cat-smartphone', 'Google', 'google', 'https://img.rocket.new/generatedImages/rocket_gen_img_1f0bc1df9-1787485872354.png', 'Google logo', 8, true),
    ('brand-xiaomi', 'cat-smartphone', 'Xiaomi', 'xiaomi', 'https://img.rocket.new/generatedImages/rocket_gen_img_1877c99bb-1787485873555.png', 'Xiaomi logo', 22, true),
    ('brand-dell', 'cat-laptop', 'Dell', 'dell', 'https://img.rocket.new/generatedImages/rocket_gen_img_17c14fe97-1787485873667.png', 'Dell logo', 9, true),
    ('brand-apple-mac', 'cat-laptop', 'Apple MacBook', 'apple-macbook', 'https://img.rocket.new/generatedImages/rocket_gen_img_17f46a8f4-1787593576505.png', 'Apple MacBook logo', 8, true)
  ON CONFLICT (id) DO NOTHING;

  -- Seed partners
  INSERT INTO public.partners (id, name, store_name, phone, email, city, state, pin_codes, categories, status, rating, total_orders, completed_orders, total_earnings, pending_payout, available_balance, commission, avatar) VALUES
    ('partner-001', 'Rajesh Kumar', 'TechHub Store', '9876543210', 'rajesh@techhub.com', 'Bangalore', 'Karnataka', ARRAY['560034','560038','560095','560037','560066'], ARRAY['Smartphones','Laptops','Tablets'], 'active'::public.partner_status, 4.8, 342, 318, 485000, 28500, 45000, 12, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'),
    ('partner-002', 'Pradeep Sharma', 'MobileHub Store', '9765432109', 'pradeep@mobilehub.com', 'Mumbai', 'Maharashtra', ARRAY['400050','400076','400058','400001'], ARRAY['Smartphones','Earbuds','Smartwatches'], 'active'::public.partner_status, 4.6, 287, 265, 392000, 18200, 32000, 10, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80'),
    ('partner-003', 'Sunil Reddy', 'GadgetZone', '9654321098', 'sunil@gadgetzone.com', 'Hyderabad', 'Telangana', ARRAY['500033','500034','500001'], ARRAY['Smartphones','Gaming Consoles','Cameras'], 'active'::public.partner_status, 4.5, 198, 182, 265000, 12800, 22000, 11, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80'),
    ('partner-004', 'Anil Menon', 'iRepair Center', '9543210987', 'anil@irepair.com', 'Chennai', 'Tamil Nadu', ARRAY['600040','600017','600001'], ARRAY['Smartphones','Tablets','Laptops'], 'active'::public.partner_status, 4.7, 156, 148, 198000, 9500, 18000, 13, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=80'),
    ('partner-005', 'Vikash Singh', 'DigiWorld', '9432109876', 'vikash@digiworld.com', 'Delhi', 'Delhi', ARRAY['110070','110001','110020'], ARRAY['Smartphones','Laptops'], 'pending'::public.partner_status, 0, 0, 0, 0, 0, 0, 10, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80')
  ON CONFLICT (id) DO NOTHING;

  -- Seed delivery agents
  INSERT INTO public.delivery_agents (id, name, phone, email, city, pin_codes, status, rating, today_pickups, today_deliveries, total_deliveries, earnings, vehicle, vehicle_number, avatar, is_approved) VALUES
    ('delivery-001', 'Ravi Kumar', '9876543210', 'ravi@casmik.com', 'Bangalore', ARRAY['560034','560038','560095'], 'on_trip'::public.agent_status, 4.9, 3, 2, 892, 2850, 'Bike', 'KA01AB1234', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80', true),
    ('delivery-002', 'Suresh Nair', '9765432109', 'suresh@casmik.com', 'Mumbai', ARRAY['400050','400076','400058'], 'online'::public.agent_status, 4.7, 2, 3, 654, 2200, 'Bike', 'MH02CD5678', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80', true),
    ('delivery-003', 'Deepak Verma', '9654321098', 'deepak@casmik.com', 'Noida', ARRAY['201301','201309','122002'], 'online'::public.agent_status, 4.8, 4, 1, 445, 1850, 'Scooter', 'UP16EF9012', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80', true),
    ('delivery-004', 'Anand Pillai', '9543210987', 'anand@casmik.com', 'Chennai', ARRAY['600040','600017','600001'], 'offline'::public.agent_status, 4.6, 0, 0, 312, 0, 'Bike', 'TN09GH3456', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=80', true),
    ('delivery-005', 'Mohit Sharma', '9432109876', 'mohit@casmik.com', 'Hyderabad', ARRAY['500033','500034','500001'], 'online'::public.agent_status, 4.5, 1, 2, 228, 1200, 'Bike', 'TS10IJ7890', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80', true)
  ON CONFLICT (id) DO NOTHING;

  -- Seed orders
  INSERT INTO public.orders (id, order_number, order_type, status, customer_name, customer_phone, customer_email, customer_address, pin_code, city, device_name, device_brand, device_model, device_storage, device_color, quoted_price, final_price, partner_id, partner_name, delivery_agent_id, delivery_agent_name, pickup_date, pickup_slot, payment_status, inspection_score, notes) VALUES
    ('ord-001', 'CSM-2024-001', 'sell'::public.order_type, 'completed'::public.order_status, 'Rahul Sharma', '9876543210', 'rahul@email.com', '42 MG Road, Koramangala', '560034', 'Bangalore', 'iPhone 16 Pro Max 256GB', 'Apple', 'iPhone 16 Pro Max', '256GB', 'Black Titanium', 78000, 76500, 'partner-001', 'TechHub Store', 'delivery-001', 'Ravi Kumar', '2024-12-15', '10:00 AM - 12:00 PM', 'paid'::public.payment_status, 88, 'Device in excellent condition'),
    ('ord-002', 'CSM-2024-002', 'sell'::public.order_type, 'inspection'::public.order_status, 'Priya Patel', '9765432109', 'priya@email.com', '15 Bandra West, Near Station', '400050', 'Mumbai', 'Samsung Galaxy S24 Ultra 512GB', 'Samsung', 'Galaxy S24 Ultra', '512GB', 'Titanium Black', 65000, 0, 'partner-002', 'MobileHub Store', 'delivery-002', 'Suresh Nair', '2024-12-20', '2:00 PM - 4:00 PM', 'pending'::public.payment_status, null, ''),
    ('ord-003', 'CSM-2024-003', 'buy'::public.order_type, 'completed'::public.order_status, 'Amit Singh', '9654321098', 'amit@email.com', '8 Sector 18, Noida', '201301', 'Noida', 'iPhone 15 Pro 128GB', 'Apple', 'iPhone 15 Pro', '128GB', 'Natural Titanium', 58000, 58000, 'partner-001', 'TechHub Store', 'delivery-003', 'Deepak Verma', '2024-12-10', '11:00 AM - 1:00 PM', 'paid'::public.payment_status, 92, 'Refurbished device - Grade A'),
    ('ord-004', 'CSM-2024-004', 'exchange'::public.order_type, 'assigned'::public.order_status, 'Sneha Reddy', '9543210987', 'sneha@email.com', '22 Jubilee Hills, Road 36', '500033', 'Hyderabad', 'OnePlus 12 256GB to iPhone 16 256GB', 'OnePlus to Apple', 'OnePlus 12 to iPhone 16', '256GB', 'Silky Black to Ultramarine', 42000, 0, 'partner-003', 'GadgetZone', null, null, '2024-12-22', '9:00 AM - 11:00 AM', 'pending'::public.payment_status, null, 'Exchange order'),
    ('ord-005', 'CSM-2024-005', 'repair'::public.order_type, 'picked_up'::public.order_status, 'Vikram Joshi', '9432109876', 'vikram@email.com', '5 Anna Nagar, Block B', '600040', 'Chennai', 'iPhone 14 Pro - Screen Replacement', 'Apple', 'iPhone 14 Pro', '256GB', 'Space Black', 8500, 0, 'partner-004', 'iRepair Center', 'delivery-001', 'Ravi Kumar', '2024-12-20', '3:00 PM - 5:00 PM', 'pending'::public.payment_status, null, 'Screen cracked - needs replacement'),
    ('ord-006', 'CSM-2024-006', 'sell'::public.order_type, 'created'::public.order_status, 'Meera Krishnan', '9321098765', 'meera@email.com', '18 Indiranagar, 100ft Road', '560038', 'Bangalore', 'MacBook Pro 14" M3 512GB', 'Apple', 'MacBook Pro 14"', '512GB', 'Space Gray', 95000, 0, null, null, null, null, '2024-12-25', '10:00 AM - 12:00 PM', 'pending'::public.payment_status, null, ''),
    ('ord-007', 'CSM-2024-007', 'sell'::public.order_type, 'pickup_scheduled'::public.order_status, 'Arjun Mehta', '9210987654', 'arjun@email.com', '33 Powai, Hiranandani', '400076', 'Mumbai', 'Samsung Galaxy S23 Ultra 256GB', 'Samsung', 'Galaxy S23 Ultra', '256GB', 'Phantom Black', 52000, 0, 'partner-002', 'MobileHub Store', 'delivery-002', 'Suresh Nair', '2024-12-23', '1:00 PM - 3:00 PM', 'pending'::public.payment_status, null, ''),
    ('ord-008', 'CSM-2024-008', 'sell'::public.order_type, 'payment_processing'::public.order_status, 'Kavya Nair', '9109876543', 'kavya@email.com', '7 Whitefield, ITPL Road', '560066', 'Bangalore', 'Google Pixel 8 Pro 256GB', 'Google', 'Pixel 8 Pro', '256GB', 'Obsidian', 38000, 36500, 'partner-001', 'TechHub Store', 'delivery-003', 'Deepak Verma', '2024-12-18', '11:00 AM - 1:00 PM', 'processing'::public.payment_status, 85, 'Minor scratches on back panel'),
    ('ord-009', 'CSM-2024-009', 'buy'::public.order_type, 'completed'::public.order_status, 'Rohit Gupta', '9098765432', 'rohit@email.com', '12 DLF Phase 2, Gurgaon', '122002', 'Gurgaon', 'OnePlus 11 256GB', 'OnePlus', 'OnePlus 11', '256GB', 'Titan Black', 32000, 32000, 'partner-003', 'GadgetZone', 'delivery-001', 'Ravi Kumar', '2024-12-12', '2:00 PM - 4:00 PM', 'paid'::public.payment_status, 90, 'Refurbished - Grade B'),
    ('ord-010', 'CSM-2024-010', 'repair'::public.order_type, 'inspection'::public.order_status, 'Ananya Sharma', '8987654321', 'ananya@email.com', '25 Koramangala 5th Block', '560095', 'Bangalore', 'Samsung S22 - Battery Replacement', 'Samsung', 'Galaxy S22', '128GB', 'Phantom White', 3500, 0, 'partner-004', 'iRepair Center', 'delivery-002', 'Suresh Nair', '2024-12-20', '10:00 AM - 12:00 PM', 'pending'::public.payment_status, null, 'Battery draining fast'),
    ('ord-011', 'CSM-2024-011', 'sell'::public.order_type, 'accepted'::public.order_status, 'Kiran Rao', '8876543210', 'kiran@email.com', '9 Banjara Hills, Road 12', '500034', 'Hyderabad', 'Xiaomi 14 Ultra 512GB', 'Xiaomi', 'Xiaomi 14 Ultra', '512GB', 'Titanium Gray', 45000, 0, 'partner-003', 'GadgetZone', null, null, '2024-12-24', '9:00 AM - 11:00 AM', 'pending'::public.payment_status, null, ''),
    ('ord-012', 'CSM-2024-012', 'sell'::public.order_type, 'created'::public.order_status, 'Divya Menon', '8765432109', 'divya@email.com', '14 T Nagar, Chennai', '600017', 'Chennai', 'iPad Pro 12.9" M2 256GB', 'Apple', 'iPad Pro 12.9"', '256GB', 'Space Gray', 55000, 0, null, null, null, null, '2024-12-26', '11:00 AM - 1:00 PM', 'pending'::public.payment_status, null, '')
  ON CONFLICT (id) DO NOTHING;

  -- Seed coupons
  INSERT INTO public.coupons (code, title, description, discount_type, discount_value, min_order_value, max_uses, used_count, is_active, applicable_on) VALUES
    ('CASMIK100', 'Flat ₹100 Off', 'Get ₹100 off on your first sell order', 'fixed', 100, 1000, 500, 127, true, 'sell'),
    ('SELL10', '10% Extra on Sell', 'Get 10% extra value when you sell your device', 'percentage', 10, 5000, 200, 43, true, 'sell'),
    ('REPAIR200', '₹200 Off Repair', 'Save ₹200 on any repair service', 'fixed', 200, 500, 300, 89, true, 'repair'),
    ('WELCOME50', '₹50 Welcome Bonus', 'Welcome offer for new users', 'fixed', 50, 0, 1000, 312, true, 'all'),
    ('EXCHANGE15', '15% Extra on Exchange', 'Get 15% extra value on device exchange', 'percentage', 15, 10000, 100, 28, false, 'exchange')
  ON CONFLICT (code) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
