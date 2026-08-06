import { describe, it, expect } from 'vitest';
import { 
    Subscription, 
    calculateRenewalDates, 
    daysUntilCancellationNotice, 
    transferSubscriptionOwnership 
} from '../../src/domain/subscription/subscriptionManager';

describe('Subscription Manager Engine', () => {
    const mockSubscription: Subscription = {
        subscription_id: 'sub_123',
        vendor_id: 'v_456',
        status: 'active',
        billing_cadence: 'monthly',
        amount_cents: 150000n, // $1500.00
        currency_iso: 'USD',
        owners: [
            {
                employee_uid: 'emp_owner1',
                owner_type: 'BUSINESS_OWNER',
                assigned_date: new Date('2026-01-01')
            }
        ],
        next_renewal_date: new Date('2026-09-01'),
        cancellation_notice_days: 30
    };

    it('handles integer minor units for monetary amounts', () => {
        expect(typeof mockSubscription.amount_cents).toBe('bigint');
        expect(mockSubscription.amount_cents).toBe(150000n);
    });

    it('calculates renewal date correctly', () => {
        const renewal = calculateRenewalDates(mockSubscription);
        expect(renewal).toEqual(new Date('2026-09-01'));
    });

    it('calculates days until cancellation notice deadline', () => {
        const currentDate = new Date('2026-08-01');
        const days = daysUntilCancellationNotice(mockSubscription, currentDate);
        // Notice date is 2026-09-01 - 30 days = 2026-08-02.
        // Difference from 2026-08-01 to 2026-08-02 is 1 day.
        expect(days).toBe(1);
    });

    it('returns null notice deadline if subscription has no renewal date', () => {
        const subNoRenewal: Subscription = {
            ...mockSubscription,
            next_renewal_date: undefined
        };
        expect(daysUntilCancellationNotice(subNoRenewal)).toBeNull();
    });

    it('transfers ownership and updates complete ownership history', () => {
        const transferDate = new Date('2026-08-03');
        const transferred = transferSubscriptionOwnership(
            mockSubscription,
            'BUSINESS_OWNER',
            'emp_owner1',
            'emp_owner2',
            transferDate
        );

        expect(transferred.owners).toHaveLength(2);
        expect(transferred.owners[0].ended_date).toEqual(transferDate);
        expect(transferred.owners[1].employee_uid).toBe('emp_owner2');
        expect(transferred.owners[1].assigned_date).toEqual(transferDate);
    });

    it('preserves inactive/ended owners in history', () => {
        const transferDate = new Date('2026-08-03');
        const transferred = transferSubscriptionOwnership(
            mockSubscription,
            'BUSINESS_OWNER',
            'emp_owner1',
            'emp_owner2',
            transferDate
        );
        const oldOwner = transferred.owners.find(o => o.employee_uid === 'emp_owner1');
        expect(oldOwner?.ended_date).toBeDefined();
    });
});
