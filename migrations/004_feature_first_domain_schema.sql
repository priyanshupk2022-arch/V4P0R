-- 1. employees
CREATE TABLE public.employees (
    employee_uid VARCHAR(64) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    manager_employee_uid VARCHAR(64) REFERENCES public.employees(employee_uid),
    cost_center_id TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'leave', 'offboarding_scheduled', 'offboarded', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. vendors
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id),
    plan_name TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'paused', 'cancellation_pending', 'cancelled', 'expired', 'unknown')),
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    billing_cadence VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cadence IN ('MONTHLY', 'ANNUAL', 'USAGE_BASED', 'ONE_TIME')),
    start_date TIMESTAMPTZ NOT NULL,
    contract_end_date TIMESTAMPTZ,
    renewal_date TIMESTAMPTZ NOT NULL,
    cancellation_notice_date TIMESTAMPTZ,
    auto_renewal BOOLEAN NOT NULL DEFAULT TRUE,
    seat_count INT NOT NULL DEFAULT 1,
    active_seat_count INT NOT NULL DEFAULT 1,
    usage_evidence_timestamp TIMESTAMPTZ,
    source_system TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'unclassified',
    category_subcategory VARCHAR(50),
    category_source VARCHAR(20) NOT NULL DEFAULT 'MANUAL' CHECK (category_source IN ('MANUAL', 'RULE', 'SUGGESTED')),
    category_confidence NUMERIC(3,2) DEFAULT 1.00,
    category_reviewer_id TEXT,
    category_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. subscription_owners
CREATE TABLE public.subscription_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    employee_uid VARCHAR(64) NOT NULL REFERENCES public.employees(employee_uid) ON DELETE CASCADE,
    owner_type VARCHAR(30) NOT NULL CHECK (owner_type IN ('BUSINESS_OWNER', 'TECHNICAL_OWNER', 'FINANCE_OWNER', 'ASSIGNED_USER')),
    effective_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_end TIMESTAMPTZ,
    is_current BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_employees_org ON public.employees(organization_id);
CREATE INDEX idx_vendors_org ON public.vendors(organization_id);
CREATE INDEX idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX idx_subscription_owners_org ON public.subscription_owners(organization_id);
CREATE INDEX idx_sub_owners_emp ON public.subscription_owners(employee_uid);
CREATE INDEX idx_sub_owners_sub ON public.subscription_owners(subscription_id);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_owners ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (assuming a tenant isolation function or JWT claim `app.current_tenant` exists in actual Supabase context)
-- Depending on your specific auth setup, these might need adjustments (e.g. using auth.uid() and joining with user_roles)
CREATE POLICY "Tenant isolation for employees" ON public.employees
    USING (organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
    
CREATE POLICY "Tenant isolation for vendors" ON public.vendors
    USING (organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY "Tenant isolation for subscriptions" ON public.subscriptions
    USING (organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY "Tenant isolation for subscription_owners" ON public.subscription_owners
    USING (organization_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
