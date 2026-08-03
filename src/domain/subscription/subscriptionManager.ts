export type OwnerType = 'BUSINESS_OWNER' | 'TECHNICAL_OWNER' | 'FINANCE_OWNER' | 'ASSIGNED_USER';
export type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancellation_pending' | 'cancelled' | 'expired' | 'unknown';
export type BillingCadence = 'monthly' | 'annually' | 'quarterly' | 'usage_based';

export interface Vendor {
    vendor_id: string;
    name: string;
}

export interface SubscriptionOwner {
    employee_uid: string;
    owner_type: OwnerType;
    assigned_date: Date;
    ended_date?: Date;
}

export interface Subscription {
    subscription_id: string;
    vendor_id: string;
    status: SubscriptionStatus;
    billing_cadence: BillingCadence;
    amount_cents: bigint;
    currency_iso: string;
    owners: SubscriptionOwner[];
    next_renewal_date?: Date;
    cancellation_notice_days?: number;
}

export function calculateRenewalDates(subscription: Subscription, fromDate: Date = new Date()): Date | null {
    if (!subscription.next_renewal_date) return null;
    return subscription.next_renewal_date;
}

export function daysUntilCancellationNotice(subscription: Subscription, currentDate: Date = new Date()): number | null {
    if (!subscription.next_renewal_date || subscription.cancellation_notice_days == null) return null;
    
    const noticeDate = new Date(subscription.next_renewal_date.getTime());
    noticeDate.setDate(noticeDate.getDate() - subscription.cancellation_notice_days);
    
    const diffTime = noticeDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function transferSubscriptionOwnership(
    subscription: Subscription,
    ownerType: OwnerType,
    fromEmployeeUid: string,
    toEmployeeUid: string,
    transferDate: Date = new Date()
): Subscription {
    const updatedOwners = subscription.owners.map(owner => {
        if (owner.employee_uid === fromEmployeeUid && owner.owner_type === ownerType && !owner.ended_date) {
            return { ...owner, ended_date: transferDate };
        }
        return owner;
    });

    updatedOwners.push({
        employee_uid: toEmployeeUid,
        owner_type: ownerType,
        assigned_date: transferDate
    });

    return {
        ...subscription,
        owners: updatedOwners
    };
}
