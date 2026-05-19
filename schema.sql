-- Fuel ERP System Database Schema
-- Includes Tables, RLS, Functions, and Triggers

-- 1. Create Enums 
CREATE TYPE user_role AS ENUM ('super_admin', 'company_admin', 'station_manager', 'station_employee', 'driver');
CREATE TYPE vehicle_type AS ENUM ('sedan', 'truck', 'bus', 'suv', 'van');
CREATE TYPE fuel_type AS ENUM ('petrol_91', 'petrol_95', 'diesel');
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'expired');

-- 2. Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    subscription_plan VARCHAR(50),
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'driver',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Fuel Stations
CREATE TABLE fuel_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_code VARCHAR(50) UNIQUE NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: Station Managers/Employees link to stations via an associative table or simply add station_id to users.
-- To keep it simple based on requirements, let's add `station_id` to users, so employees belong to a station.
ALTER TABLE users ADD COLUMN station_id UUID REFERENCES fuel_stations(id) ON DELETE CASCADE NULL;

-- 5. Drivers
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NULL, -- Link auth optionally
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    national_id VARCHAR(100),
    license_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL NULL,
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type vehicle_type,
    fuel_type fuel_type,
    monthly_fuel_limit NUMERIC(10, 2) DEFAULT 0.00,
    current_consumption NUMERIC(10, 2) DEFAULT 0.00,
    remaining_liters NUMERIC(10, 2) DEFAULT 0.00,
    qr_code VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Company Station Contracts
CREATE TABLE company_station_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    station_id UUID REFERENCES fuel_stations(id) ON DELETE CASCADE,
    contract_code VARCHAR(50) UNIQUE NOT NULL,
    monthly_limit NUMERIC(10, 2) DEFAULT 0.00,
    current_usage NUMERIC(10, 2) DEFAULT 0.00,
    remaining_balance NUMERIC(10, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (company_id, station_id)
);

-- 8. Fuel Orders
CREATE TABLE fuel_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    station_id UUID REFERENCES fuel_stations(id) ON DELETE SET NULL NULL,
    liters_requested NUMERIC(10, 2) NOT NULL,
    order_status order_status DEFAULT 'pending',
    qr_code VARCHAR(255) UNIQUE,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Fuel Transactions
CREATE TABLE fuel_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    station_id UUID REFERENCES fuel_stations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES fuel_orders(id) ON DELETE CASCADE NULL,
    liters NUMERIC(10, 2) NOT NULL,
    price_per_liter NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    remaining_after_transaction NUMERIC(10, 2),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    notes TEXT
);

-- 10. Company Wallets
CREATE TABLE company_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    total_balance NUMERIC(15, 2) DEFAULT 0.00,
    used_balance NUMERIC(15, 2) DEFAULT 0.00,
    remaining_balance NUMERIC(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. Station Accounts
CREATE TABLE station_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID UNIQUE REFERENCES fuel_stations(id) ON DELETE CASCADE,
    total_sales NUMERIC(15, 2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    pending_amount NUMERIC(15, 2) DEFAULT 0.00,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. General Ledger
CREATE TABLE general_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES fuel_transactions(id) ON DELETE SET NULL NULL,
    debit NUMERIC(15, 2) DEFAULT 0.00,
    credit NUMERIC(15, 2) DEFAULT 0.00,
    balance_after NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 13. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 14. Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NULL,
    report_type VARCHAR(100),
    generated_by UUID REFERENCES users(id),
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Triggers & Functions for Balance updates
CREATE OR REPLACE FUNCTION process_fuel_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct Vehicle limits
    UPDATE vehicles 
    SET current_consumption = current_consumption + NEW.liters,
        remaining_liters = remaining_liters - NEW.liters
    WHERE id = NEW.vehicle_id;

    -- Update Station Contract Limits (if applicable)
    UPDATE company_station_contracts
    SET current_usage = current_usage + (NEW.liters * NEW.price_per_liter),
        remaining_balance = remaining_balance - (NEW.liters * NEW.price_per_liter)
    WHERE company_id = NEW.company_id AND station_id = NEW.station_id;

    -- Update Company Wallet
    UPDATE company_wallets
    SET used_balance = used_balance + NEW.total_amount,
        remaining_balance = remaining_balance - NEW.total_amount,
        updated_at = NOW()
    WHERE company_id = NEW.company_id;

    -- Update Station Account
    UPDATE station_accounts
    SET total_sales = total_sales + NEW.total_amount,
        total_transactions = total_transactions + 1,
        pending_amount = pending_amount + NEW.total_amount,
        updated_at = NOW()
    WHERE station_id = NEW.station_id;

    -- Insert into General Ledger (Credit to Company)
    -- E.g. deduct total_amount from company balance
    INSERT INTO general_ledger (company_id, transaction_id, debit, credit, description)
    VALUES (NEW.company_id, NEW.id, NEW.total_amount, 0, 'Fuel Transaction ' || NEW.transaction_code);

    -- Update order status if there is an order
    IF NEW.order_id IS NOT NULL THEN
        UPDATE fuel_orders SET order_status = 'completed' WHERE id = NEW.order_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_fuel_transaction
AFTER INSERT ON fuel_transactions
FOR EACH ROW
EXECUTE FUNCTION process_fuel_transaction();


-- ENABLE RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_station_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 1. Helper function to check role
CREATE OR REPLACE FUNCTION public.role() RETURNS text AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.company_id() RETURNS uuid AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.station_id() RETURNS uuid AS $$
  SELECT station_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- 2. Policies
-- Super Admin Policy Generator
-- For every table, Super Admin can ALL
CREATE POLICY "super admin full access on companies"
ON public.companies
FOR ALL
TO authenticated
USING (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
    and u.role = 'super_admin'
  )
)
WITH CHECK (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
    and u.role = 'super_admin'
  )
);
CREATE POLICY "Super admin can do all on users" ON users FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on fuel_stations" ON fuel_stations FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on drivers" ON drivers FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on vehicles" ON vehicles FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on company_station_contracts" ON company_station_contracts FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on fuel_orders" ON fuel_orders FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on fuel_transactions" ON fuel_transactions FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on company_wallets" ON company_wallets FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on station_accounts" ON station_accounts FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on general_ledger" ON general_ledger FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on notifications" ON notifications FOR ALL TO authenticated USING (public.role() = 'super_admin');
CREATE POLICY "Super admin can do all on reports" ON reports FOR ALL TO authenticated USING (public.role() = 'super_admin');

-- Company Admin Policies (Isolations)
CREATE POLICY "Company Admin access own company" ON companies FOR SELECT TO authenticated USING (id = public.company_id());
CREATE POLICY "Company Admin access own users" ON users FOR ALL TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own drivers" ON drivers FOR ALL TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own vehicles" ON vehicles FOR ALL TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own contracts" ON company_station_contracts FOR SELECT TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own orders" ON fuel_orders FOR ALL TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own transactions" ON fuel_transactions FOR SELECT TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own wallet" ON company_wallets FOR SELECT TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own ledger" ON general_ledger FOR SELECT TO authenticated USING (company_id = public.company_id());
CREATE POLICY "Company Admin access own notifications" ON notifications FOR ALL TO authenticated USING (company_id = public.company_id());

-- Station Policies (Station Manager/Employee)
CREATE POLICY "Station users access own station" ON fuel_stations FOR SELECT TO authenticated USING (id = public.station_id());
CREATE POLICY "Station users access station accounts" ON station_accounts FOR SELECT TO authenticated USING (station_id = public.station_id());
CREATE POLICY "Station users view their contracts" ON company_station_contracts FOR SELECT TO authenticated USING (station_id = public.station_id());
CREATE POLICY "Station users view their orders" ON fuel_orders FOR SELECT TO authenticated USING (station_id = public.station_id());
CREATE POLICY "Station users insert/view own transactions" ON fuel_transactions FOR ALL TO authenticated USING (station_id = public.station_id());

-- For auth.users self-insertion
CREATE POLICY "Self insert user" ON users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Self view user" ON users FOR SELECT TO authenticated USING (id = auth.uid());

