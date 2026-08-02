-- VAPOR Corrective Migration 003: RLS Policies, Tenant Isolation, & Atomic Double-Entry Ledger RPC

-- 1. Ensure webhook_events schema has outcome result column for idempotent replay
ALTER TABLE public.webhook_events ADD COLUMN IF NOT EXISTS result JSONB;
ALTER TABLE public.webhook_events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 2. Comprehensive Row-Level Security (RLS) Policies for Multi-Tenancy
-- Helper function to check if current auth.uid() belongs to an organization
CREATE OR REPLACE FUNCTION public.current_user_has_org_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.memberships
        WHERE organization_id = org_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies per tenant table
DROP POLICY IF EXISTS tenant_isolation_organizations ON public.organizations;
CREATE POLICY tenant_isolation_organizations ON public.organizations
    FOR ALL USING (
        id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_memberships ON public.memberships;
CREATE POLICY tenant_isolation_memberships ON public.memberships
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_accounts ON public.accounts;
CREATE POLICY tenant_isolation_accounts ON public.accounts
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_cards ON public.cards;
CREATE POLICY tenant_isolation_cards ON public.cards
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_card_policies ON public.card_policies;
CREATE POLICY tenant_isolation_card_policies ON public.card_policies
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_transactions ON public.transactions;
CREATE POLICY tenant_isolation_transactions ON public.transactions
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_authorization_holds ON public.authorization_holds;
CREATE POLICY tenant_isolation_authorization_holds ON public.authorization_holds
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_ledger_entries ON public.ledger_entries;
CREATE POLICY tenant_isolation_ledger_entries ON public.ledger_entries
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_approval_requests ON public.approval_requests;
CREATE POLICY tenant_isolation_approval_requests ON public.approval_requests
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_audit_logs ON public.audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON public.audit_logs
    FOR ALL USING (
        organization_id IS NULL OR organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_isolation_reconciliation_runs ON public.reconciliation_runs;
CREATE POLICY tenant_isolation_reconciliation_runs ON public.reconciliation_runs
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    );

-- 3. Atomic Double-Entry Financial Posting Function
-- Enforces atomic commit of Transaction, Debit, & Credit entries in one PostgreSQL transaction
CREATE OR REPLACE FUNCTION public.post_atomic_double_entry_transaction(
    p_organization_id UUID,
    p_transaction_id UUID,
    p_account_id UUID,
    p_card_id VARCHAR(64),
    p_user_id UUID,
    p_amount_cents BIGINT,
    p_currency VARCHAR(3),
    p_state VARCHAR(20),
    p_merchant_name TEXT,
    p_mcc VARCHAR(10) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_debit_id UUID := gen_random_uuid();
    v_credit_id UUID := gen_random_uuid();
    v_settlement_account_id UUID;
BEGIN
    -- 1. Validate inputs
    IF p_amount_cents <= 0 THEN
        RAISE EXCEPTION 'Transaction amount must be positive integer cents';
    END IF;

    -- 2. Insert transaction record
    INSERT INTO public.transactions (
        id, organization_id, card_id, user_id, amount_cents, currency, state, merchant_name, mcc, created_at
    ) VALUES (
        p_transaction_id, p_organization_id, p_card_id, p_user_id, p_amount_cents, COALESCE(p_currency, 'USD'), p_state, p_merchant_name, p_mcc, NOW()
    );

    -- 3. Insert DEBIT ledger entry (Debit customer operating account)
    INSERT INTO public.ledger_entries (
        id, organization_id, transaction_id, account_id, entry_type, amount_cents, description, created_at
    ) VALUES (
        v_debit_id, p_organization_id, p_transaction_id, p_account_id, 'DEBIT', p_amount_cents, 'Merchant authorization debit: ' || p_merchant_name, NOW()
    );

    -- 4. Insert CREDIT ledger entry (Credit system settlement account - balanced entry)
    INSERT INTO public.ledger_entries (
        id, organization_id, transaction_id, account_id, entry_type, amount_cents, description, created_at
    ) VALUES (
        v_credit_id, p_organization_id, p_transaction_id, NULL, 'CREDIT', p_amount_cents, 'System settlement credit: ' || p_merchant_name, NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', p_transaction_id,
        'debit_entry_id', v_debit_id,
        'credit_entry_id', v_credit_id,
        'balanced', true
    );
EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Durable Webhook Event Idempotency Function
-- Atomically checks/inserts webhook events and returns prior outcome on replay
CREATE OR REPLACE FUNCTION public.check_and_record_webhook_event(
    p_provider VARCHAR(30),
    p_event_id VARCHAR(128),
    p_payload_hash VARCHAR(64),
    p_result JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_existing RECORD;
BEGIN
    SELECT * INTO v_existing FROM public.webhook_events
    WHERE provider = p_provider AND event_id = p_event_id;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'is_duplicate', true,
            'processed_at', v_existing.processed_at,
            'result', v_existing.result
        );
    END IF;

    INSERT INTO public.webhook_events (
        provider, event_id, payload_hash, result, processed_at
    ) VALUES (
        p_provider, p_event_id, p_payload_hash, p_result, NOW()
    );

    RETURN jsonb_build_object(
        'is_duplicate', false,
        'processed_at', NOW(),
        'result', p_result
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
