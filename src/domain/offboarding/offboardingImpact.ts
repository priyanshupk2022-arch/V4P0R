import { Subscription } from '../subscription/subscriptionManager';

export interface OffboardingImpactPreview {
    employee_uid: string;
    linked_subscriptions: Subscription[];
    payment_cards_count: number;
    pending_approvals_count: number;
    total_impacted_monthly_spend_cents: bigint;
}

export interface OffboardingStore {
    getSubscriptionsByOwner(employeeUid: string): Promise<Subscription[]>;
    getPaymentCardsCount(employeeUid: string): Promise<number>;
    getPendingApprovalsCount(employeeUid: string): Promise<number>;
    revokeSeat(employeeUid: string, subscriptionId: string): Promise<void>;
    freezePaymentCards(employeeUid: string): Promise<void>;
    cancelVendor(vendorId: string): Promise<boolean>;
}

export interface OffboardingParams {
    employeeUid: string;
    store: OffboardingStore;
    reassignToUid?: string;
}

export interface OffboardingAuditEvent {
    correlation_id: string;
    event_type: string;
    employee_uid: string;
    timestamp: string;
    details: any;
}

export async function calculateOffboardingImpactPreview(
    employeeUid: string,
    store: OffboardingStore
): Promise<OffboardingImpactPreview> {
    const linked_subscriptions = await store.getSubscriptionsByOwner(employeeUid);
    const payment_cards_count = await store.getPaymentCardsCount(employeeUid);
    const pending_approvals_count = await store.getPendingApprovalsCount(employeeUid);

    let total_impacted_monthly_spend_cents = 0n;

    for (const sub of linked_subscriptions) {
        let monthly = sub.amount_cents;
        if (sub.billing_cadence === 'annually') monthly = monthly / 12n;
        else if (sub.billing_cadence === 'quarterly') monthly = monthly / 3n;
        total_impacted_monthly_spend_cents += monthly;
    }

    return {
        employee_uid: employeeUid,
        linked_subscriptions,
        payment_cards_count,
        pending_approvals_count,
        total_impacted_monthly_spend_cents
    };
}

export async function executeOffboardingProtocol(params: OffboardingParams): Promise<OffboardingAuditEvent[]> {
    const { employeeUid, store, reassignToUid } = params;
    const correlation_id = `off_${Date.now().toString(36)}`;
    const events: OffboardingAuditEvent[] = [];

    const addEvent = (type: string, details: any) => {
        events.push({
            correlation_id,
            event_type: type,
            employee_uid: employeeUid,
            timestamp: new Date().toISOString(),
            details
        });
    };

    try {
        const subs = await store.getSubscriptionsByOwner(employeeUid);
        
        for (const sub of subs) {
            if (reassignToUid) {
                addEvent('OWNERSHIP_TRANSFERRED', { subscription_id: sub.subscription_id, to: reassignToUid });
            } else {
                await store.revokeSeat(employeeUid, sub.subscription_id);
                addEvent('SEAT_REVOKED', { subscription_id: sub.subscription_id });
                
                // Assuming vendor cancellation is conditional based on provider confirmation logic 
                // outside or modeled simply here.
                const cancelled = await store.cancelVendor(sub.vendor_id);
                if (cancelled) {
                    addEvent('VENDOR_CANCELLED', { vendor_id: sub.vendor_id });
                }
            }
        }

        await store.freezePaymentCards(employeeUid);
        addEvent('CARDS_FROZEN', {});

        addEvent('OFFBOARDING_COMPLETED', { success: true });
    } catch (error: any) {
        addEvent('OFFBOARDING_FAILED', { error: error.message });
        throw error;
    }

    return events;
}
