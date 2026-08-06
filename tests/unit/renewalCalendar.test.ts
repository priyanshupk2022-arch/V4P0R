import { describe, it, expect } from 'vitest';
import { calculateRenewalCalendar } from '../../src/domain/renewal/renewalCalendar';
import { Subscription } from '../../src/domain/subscription/subscriptionManager';

describe('calculateRenewalCalendar', () => {
    it('validates 7/30/60/90-day window bucketing', () => {
        const referenceDate = new Date('2026-08-03T12:00:00Z');
        const makeSub = (id: string, daysOffset: number, noticeDays?: number): Subscription => ({
            subscription_id: id,
            vendor_id: 'v1',
            status: 'active',
            amount_cents: 1000n,
            currency_iso: 'USD',
            owners: [],
            billing_cadence: 'monthly',
            next_renewal_date: new Date(referenceDate.getTime() + daysOffset * 24 * 60 * 60 * 1000),
            cancellation_notice_days: noticeDays,
        });

        const subs: Subscription[] = [
            makeSub('sub-7', 5),
            makeSub('sub-30', 25),
            makeSub('sub-60', 50),
            makeSub('sub-90', 85),
            makeSub('sub-upcoming', 100),
        ];

        const result = calculateRenewalCalendar(subs, referenceDate);
        expect(result.find(r => r.subscriptionId === 'sub-7')?.bucket).toBe('7_DAYS');
        expect(result.find(r => r.subscriptionId === 'sub-30')?.bucket).toBe('30_DAYS');
        expect(result.find(r => r.subscriptionId === 'sub-60')?.bucket).toBe('60_DAYS');
        expect(result.find(r => r.subscriptionId === 'sub-90')?.bucket).toBe('90_DAYS');
        expect(result.find(r => r.subscriptionId === 'sub-upcoming')?.bucket).toBe('UPCOMING');
    });

    it('validates notice deadline calculations', () => {
        const referenceDate = new Date('2026-08-03T12:00:00Z');
        const sub: Subscription = {
            subscription_id: 'sub-notice',
            vendor_id: 'v1',
            status: 'active',
            amount_cents: 1000n,
            currency_iso: 'USD',
            owners: [],
            billing_cadence: 'monthly',
            next_renewal_date: new Date('2026-08-13T12:00:00Z'), // 10 days away
            cancellation_notice_days: 3, // Notice deadline should be 2026-08-10T12:00:00Z
        };

        const result = calculateRenewalCalendar([sub], referenceDate);
        expect(result[0].noticeDeadline).toBe('2026-08-10T12:00:00.000Z');
    });

    it('validates overdue and unknown renewal state handling without fabricated savings/usage', () => {
        const referenceDate = new Date('2026-08-03T12:00:00Z');
        
        const overdueSub: Subscription = {
            subscription_id: 'sub-overdue',
            vendor_id: 'v1',
            status: 'active',
            amount_cents: 2000n,
            currency_iso: 'USD',
            owners: [],
            billing_cadence: 'monthly',
            next_renewal_date: new Date('2026-08-01T12:00:00Z'), // 2 days ago
        };

        const unknownSub: Subscription = {
            subscription_id: 'sub-unknown',
            vendor_id: 'v1',
            status: 'active',
            amount_cents: 3000n,
            currency_iso: 'USD',
            owners: [],
            billing_cadence: 'monthly',
            next_renewal_date: undefined, // unknown
        };

        const result = calculateRenewalCalendar([overdueSub, unknownSub], referenceDate);
        
        const overdueResult = result.find(r => r.subscriptionId === 'sub-overdue');
        expect(overdueResult?.bucket).toBe('OVERDUE');
        expect(overdueResult?.amountCents).toBe(2000n);

        const unknownResult = result.find(r => r.subscriptionId === 'sub-unknown');
        expect(unknownResult?.bucket).toBe('UPCOMING');
        expect(unknownResult?.amountCents).toBe(3000n);
        expect(unknownResult?.renewalDate).toBe('');
    });
});
