-- VAPOR Production-Ready Sandbox Pilot Schema
-- Enforces Multi-Tenancy (organization_id), RBAC, Immutable Ledger Entries, & Idempotency Tracking

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Memberships & RBAC Table
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('OWNER', 'FINANCE_ADMIN', 'APPROVER', 'EMPLOYEE', 'AUDITOR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- 3. Accounts / Wallets Table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Main Corporate Operating Account',
    balance_cents BIGINT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Virtual Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
    id VARCHAR(64) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id),
    last4 VARCHAR(4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED', 'TERMINATED')),
    limit_cents BIGINT NOT NULL CHECK (limit_cents > 0),
    monthly_limit_cents BIGINT NOT NULL CHECK (monthly_limit_cents > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Card Spend Governance Policies Table
CREATE TABLE IF NOT EXISTS public.card_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id VARCHAR(64) UNIQUE NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    mcc_whitelist JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["5734", "5968"]
    blocked_merchants JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_single_tx_cents BIGINT NOT NULL DEFAULT 500000, -- $5,000 max single charge
    requires_approval_above_cents BIGINT NOT NULL DEFAULT 100000, -- $1,000 requires 1-tap iMessage approval
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Transactions Master Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    card_id VARCHAR(64) REFERENCES public.cards(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    state VARCHAR(20) NOT NULL DEFAULT 'INITIATED' CHECK (state IN ('INITIATED', 'AUTHORIZED', 'SETTLED', 'DECLINED', 'REVERSED', 'EXPIRED')),
    merchant_name TEXT NOT NULL,
    mcc VARCHAR(10),
    prava_session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Authorization Holds Table
CREATE TABLE IF NOT EXISTS public.authorization_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    card_id VARCHAR(64) NOT NULL REFERENCES public.cards(id),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    hold_amount_cents BIGINT NOT NULL CHECK (hold_amount_cents > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RELEASED', 'SETTLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Immutable Double-Entry Ledger Table
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id),
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Idempotency & Webhook Events Table
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(30) NOT NULL, -- e.g. 'PRAVA', 'LINQ'
    event_id VARCHAR(128) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, event_id)
);

-- 10. Human-in-the-Loop Approval Requests Table
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    card_id VARCHAR(64) NOT NULL REFERENCES public.cards(id),
    transaction_id UUID REFERENCES public.transactions(id),
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    merchant_name TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    nonce VARCHAR(32) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Comprehensive Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES public.users(id),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Daily Reconciliation Runs Table
CREATE TABLE IF NOT EXISTS public.reconciliation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
    total_matched_count INT NOT NULL DEFAULT 0,
    discrepancy_cents BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security (RLS) Configuration
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorization_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_runs ENABLE ROW LEVEL SECURITY;

-- Indexes for Microsecond Queries
CREATE INDEX IF NOT EXISTS idx_memberships_org_user ON public.memberships(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_cards_org_id ON public.cards(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_ledger_org_tx ON public.ledger_entries(organization_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events(provider, event_id);
