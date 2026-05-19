-- 1. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) DEFAULT 0.00,
    vehicle_limit INTEGER DEFAULT 0,
    driver_limit INTEGER DEFAULT 0,
    station_limit INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Subscription Requests Table
CREATE TABLE IF NOT EXISTS subscription_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    station_id UUID REFERENCES fuel_stations(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('company', 'station')),
    company_name VARCHAR(255),
    station_name VARCHAR(255),
    manager_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    logo_url TEXT,
    expected_vehicle_count INTEGER DEFAULT 0,
    expected_driver_count INTEGER DEFAULT 0,
    number_of_pumps INTEGER DEFAULT 0,
    fuel_types TEXT[],
    selected_plan VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_sub_req_status ON subscription_requests(status);
CREATE INDEX IF NOT EXISTS idx_sub_req_user_id ON subscription_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_req_company_id ON subscription_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_sub_req_station_id ON subscription_requests(station_id);

-- 3. Company Subscriptions Table
CREATE TABLE IF NOT EXISTS company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'suspended', 'trial', 'cancelled'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Station Subscriptions Table
CREATE TABLE IF NOT EXISTS station_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES fuel_stations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Subscription Plans: Everyone can SELECT active ones, Super Admin can ALL
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active plans') THEN
        CREATE POLICY "Anyone can view active plans" ON subscription_plans FOR SELECT USING (is_active = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access on subscription_plans') THEN
        CREATE POLICY "Super admin full access on subscription_plans" ON subscription_plans FOR ALL TO authenticated USING (public.role() = 'super_admin');
    END IF;
END $$;

-- Subscription Requests: 
-- Authenticated can INSERT for their own user_id
-- Super Admin can ALL
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own requests') THEN
        CREATE POLICY "Users can insert their own requests" ON subscription_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access on subscription_requests') THEN
        CREATE POLICY "Super admin full access on subscription_requests" ON subscription_requests FOR ALL TO authenticated USING (public.role() = 'super_admin');
    END IF;
END $$;

-- Company Subscriptions:
-- Company Admin can SELECT their own
-- Super Admin can ALL
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Company Admin view own subscription') THEN
        CREATE POLICY "Company Admin view own subscription" ON company_subscriptions FOR SELECT TO authenticated USING (company_id = public.company_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access on company_subscriptions') THEN
        CREATE POLICY "Super admin full access on company_subscriptions" ON company_subscriptions FOR ALL TO authenticated USING (public.role() = 'super_admin');
    END IF;
END $$;

-- Station Subscriptions:
-- Station Manager can SELECT their own
-- Super Admin can ALL
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Station Manager view own subscription') THEN
        CREATE POLICY "Station Manager view own subscription" ON station_subscriptions FOR SELECT TO authenticated USING (station_id = public.station_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access on station_subscriptions') THEN
        CREATE POLICY "Super admin full access on station_subscriptions" ON station_subscriptions FOR ALL TO authenticated USING (public.role() = 'super_admin');
    END IF;
END $$;

-- 7. Seed initial plans
INSERT INTO subscription_plans (name, description, price, vehicle_limit, driver_limit, station_limit, features)
SELECT 'Starter', 'مثالية للشركات الصغيرة والمحطات المستقلة', 0.00, 10, 10, 1, '["إدارة الطلبات الأساسية", "تقارير بسيطة", "تطبيق السائقين"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Starter');

INSERT INTO subscription_plans (name, description, price, vehicle_limit, driver_limit, station_limit, features)
SELECT 'Business', 'للشركات المتوسطة والمحطات المتعددة', 499.00, 50, 50, 5, '["إدارة متقدمة للأسطول", "تقارير تحليلية", "دعم فني 24/7", "إدارة المحفظة"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Business');

INSERT INTO subscription_plans (name, description, price, vehicle_limit, driver_limit, station_limit, features)
SELECT 'Enterprise', 'للمؤسسات الكبرى والشركات الوطنية', 1499.00, 9999, 9999, 99, '["تكامل مخصص", "تقارير مخصصة", "مدير حساب خاص", "أولوية في الدعم"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Enterprise');
