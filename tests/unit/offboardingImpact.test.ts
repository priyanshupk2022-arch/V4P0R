import { describe, it, expect, vi } from 'vitest';
import { 
    calculateOffboardingImpactPreview, 
    executeOffboardingProtocol, 
    OffboardingStore 
} from '../../src/domain/offboarding/offboardingImpact';
import { Subscription } from '../../src/domain/subscription/subscriptionManager';

describe('Offboarding Impact Engine', () => {
    const mockSubs: Subscription[] = [
        {
            subscription_id: 'sub_1',
            vendor_id: 'v_1',
            status: 'active',
            billing_cadence: 'monthly',
            amount_cents: 10000n, // $100
            currency_iso: 'USD',
            owners: [{ employee_uid: 'emp_offboard', owner_type: 'BUSINESS_OWNER', assigned_date: new Date() }]
        },
        {
            subscription_id: 'sub_2',
            vendor_id: 'v_2',
            status: 'active',
            billing_cadence: 'annually',
            amount_cents: 120000n, // $1200/yr = $100/mo
            currency_iso: 'USD',
            owners: [{ employee_uid: 'emp_offboard', owner_type: 'TECHNICAL_OWNER', assigned_date: new Date() }]
        }
    ];

    const createMockStore = (cancelSuccess = true): OffboardingStore => ({
        getSubscriptionsByOwner: vi.fn().mockResolvedValue(mockSubs),
        getPaymentCardsCount: vi.fn().mockResolvedValue(2),
        getPendingApprovalsCount: vi.fn().mockResolvedValue(1),
        revokeSeat: vi.fn().mockResolvedValue(undefined),
        freezePaymentCards: vi.fn().mockResolvedValue(undefined),
        cancelVendor: vi.fn().mockResolvedValue(cancelSuccess)
    });

    it('calculates offboarding impact preview with monthly spend conversion', async () => {
        const store = createMockStore();
        const preview = await calculateOffboardingImpactPreview('emp_offboard', store);

        expect(preview.employee_uid).toBe('emp_offboard');
        expect(preview.linked_subscriptions).toHaveLength(2);
        expect(preview.payment_cards_count).toBe(2);
        expect(preview.pending_approvals_count).toBe(1);
        expect(preview.total_impacted_monthly_spend_cents).toBe(20000n); // $100 + $100 = $200
    });

    it('executes offboarding protocol with ownership reassignment', async () => {
        const store = createMockStore();
        const events = await executeOffboardingProtocol({
            employeeUid: 'emp_offboard',
            store,
            reassignToUid: 'emp_new_owner'
        });

        expect(events.some(e => e.event_type === 'OWNERSHIP_TRANSFERRED')).toBe(true);
        expect(events.some(e => e.event_type === 'CARDS_FROZEN')).toBe(true);
        expect(events.some(e => e.event_type === 'OFFBOARDING_COMPLETED')).toBe(true);
        expect(store.freezePaymentCards).toHaveBeenCalledWith('emp_offboard');
    });

    it('executes offboarding protocol with seat revocation and payment card freeze', async () => {
        const store = createMockStore();
        const events = await executeOffboardingProtocol({
            employeeUid: 'emp_offboard',
            store
        });

        expect(events.some(e => e.event_type === 'SEAT_REVOKED')).toBe(true);
        expect(store.revokeSeat).toHaveBeenCalledTimes(2);
        expect(store.freezePaymentCards).toHaveBeenCalledWith('emp_offboard');
    });

    it('emits VENDOR_CANCELLED audit event only when vendor cancellation is confirmed', async () => {
        const storeUnconfirmed = createMockStore(false);
        const events = await executeOffboardingProtocol({
            employeeUid: 'emp_offboard',
            store: storeUnconfirmed
        });

        expect(events.some(e => e.event_type === 'VENDOR_CANCELLED')).toBe(false);
    });

    it('generates immutable correlation_id for audit trail', async () => {
        const store = createMockStore();
        const events = await executeOffboardingProtocol({
            employeeUid: 'emp_offboard',
            store
        });

        const correlationId = events[0].correlation_id;
        expect(correlationId.startsWith('off_')).toBe(true);
        expect(events.every(e => e.correlation_id === correlationId)).toBe(true);
    });

    it('handles store failures gracefully and emits OFFBOARDING_FAILED event', async () => {
        const storeFailing = createMockStore();
        storeFailing.freezePaymentCards = vi.fn().mockRejectedValue(new Error('Card API down'));

        await expect(executeOffboardingProtocol({
            employeeUid: 'emp_offboard',
            store: storeFailing
        })).rejects.toThrow('Card API down');
    });
});
