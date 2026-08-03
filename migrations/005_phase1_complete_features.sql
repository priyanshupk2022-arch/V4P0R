-- 005_phase1_complete_features.sql

-- 1. renewal_events table
CREATE TABLE IF NOT EXISTS public.renewal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    renewal_date TIMESTAMPTZ NOT NULL,
    notice_deadline TIMESTAMPTZ NOT NULL,
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    window_bucket VARCHAR(20) NOT NULL CHECK (window_bucket IN ('7_DAYS', '30_DAYS', '60_DAYS', '90_DAYS', 'OVERDUE', 'UPCOMING')),
    decision_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (decision_status IN ('PENDING_REVIEW', 'RENEW', 'CANCEL', 'RENEGOTIATE', 'EXPIRED')),
    policy_status VARCHAR(30) NOT NULL DEFAULT 'IN_POLICY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. orphaned_subscriptions table
CREATE TABLE IF NOT EXISTS public.orphaned_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    previous_owner_uid VARCHAR(64) REFERENCES public.employees(employee_uid),
    fallback_owner_uid VARCHAR(64) REFERENCES public.employees(employee_uid),
    assigned_finance_owner_uid VARCHAR(64) REFERENCES public.employees(employee_uid),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('EMPLOYEE_OFFBOARDED', 'MISSING_OWNER', 'INACTIVE_OWNER')),
    status VARCHAR(30) NOT NULL DEFAULT 'DETECTED' CHECK (status IN ('DETECTED', 'JUSTIFICATION_REQUESTED', 'TRANSFERRED', 'RETAINED', 'CANCEL_REQUESTED', 'INVESTIGATING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. category_rules table
CREATE TABLE IF NOT EXISTS public.category_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_domain TEXT NOT NULL,
    target_category VARCHAR(50) NOT NULL,
    target_subcategory VARCHAR(50),
    human_reviewer_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row-Level Security (RLS) on all 3 tables
ALTER TABLE public.renewal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orphaned_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for organization_id tenant isolation
CREATE POLICY renewal_events_tenant_isolation ON public.renewal_events
    FOR ALL USING (organization_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY orphaned_subscriptions_tenant_isolation ON public.orphaned_subscriptions
    FOR ALL USING (organization_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY category_rules_tenant_isolation ON public.category_rules
    FOR ALL USING (organization_id = current_setting('app.current_tenant', true)::uuid);

-- Add indexes
CREATE INDEX idx_renewal_events_org ON public.renewal_events(organization_id);
CREATE INDEX idx_renewal_events_date ON public.renewal_events(renewal_date);
CREATE INDEX idx_orphaned_subs_org ON public.orphaned_subscriptions(organization_id);
CREATE INDEX idx_category_rules_org ON public.category_rules(organization_id);
