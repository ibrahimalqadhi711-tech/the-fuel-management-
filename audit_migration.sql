-- Audit Migration for ERP Ledger
-- Adds created_by and metadata columns to track transaction provenance

-- 1. Add columns to general_ledger
ALTER TABLE IF EXISTS general_ledger 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Add columns to fuel_transactions
ALTER TABLE IF EXISTS fuel_transactions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS idx_ledger_created_by ON general_ledger(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON fuel_transactions(created_by);

-- 4. Update existing records (Optional: mark as system if unknown)
-- UPDATE general_ledger SET created_by = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE created_by IS NULL;
