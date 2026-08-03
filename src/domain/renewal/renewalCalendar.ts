import { Subscription } from '../subscription/subscriptionManager';

export type RenewalWindowBucket = '7_DAYS' | '30_DAYS' | '60_DAYS' | '90_DAYS' | 'OVERDUE' | 'UPCOMING';

export interface RenewalEntry {
    subscriptionId: string;
    subscriptionName?: string;
    renewalDate: string; // ISO string
    noticeDeadline?: string; // ISO string
    bucket: RenewalWindowBucket;
    amountCents: bigint;
}

export interface RenewalFilter {
    buckets?: RenewalWindowBucket[];
    departments?: string[];
    owners?: string[];
}

export function calculateRenewalCalendar(subscriptions: Subscription[], referenceDate: Date = new Date()): RenewalEntry[] {
    const referenceTime = referenceDate.getTime();
    const msPerDay = 1000 * 60 * 60 * 24;

    return subscriptions.map(sub => {
        if (!sub.next_renewal_date) {
            return {
                subscriptionId: sub.subscription_id,
                renewalDate: '',
                bucket: 'UPCOMING',
                amountCents: sub.amount_cents,
            };
        }

        const renewalTime = sub.next_renewal_date.getTime();
        const diffDays = Math.floor((renewalTime - referenceTime) / msPerDay);
        
        let bucket: RenewalWindowBucket = 'UPCOMING';
        if (diffDays < 0) {
            bucket = 'OVERDUE';
        } else if (diffDays <= 7) {
            bucket = '7_DAYS';
        } else if (diffDays <= 30) {
            bucket = '30_DAYS';
        } else if (diffDays <= 60) {
            bucket = '60_DAYS';
        } else if (diffDays <= 90) {
            bucket = '90_DAYS';
        }

        let noticeDeadline: string | undefined;
        if (sub.cancellation_notice_days !== undefined && sub.cancellation_notice_days !== null) {
             const deadlineDate = new Date(renewalTime - (sub.cancellation_notice_days * msPerDay));
             noticeDeadline = deadlineDate.toISOString();
        }

        return {
            subscriptionId: sub.subscription_id,
            renewalDate: sub.next_renewal_date.toISOString(),
            noticeDeadline,
            bucket,
            amountCents: sub.amount_cents,
        };
    });
}
