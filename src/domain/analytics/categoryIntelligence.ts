import { Subscription } from '../subscription/subscriptionManager';
import { CategoryTaxonomy, HumanRule, classifySubscriptionCategory } from '../category/categoryTaxonomy';

export interface CategoryAggregation {
    category: CategoryTaxonomy;
    vendorId: string;
    department?: string;
    ownerUid?: string;
    amountCents: bigint;
}

export interface DuplicateToolIndicator {
    category: CategoryTaxonomy;
    department: string;
    subscriptions: string[];
    vendors: string[];
}

export interface UnclassifiedQueueItem {
    subscriptionId: string;
    vendorId: string;
    amountCents: bigint;
}

export type ExtendedSubscription = Subscription & {
    vendorName: string;
    department?: string;
    aiSuggestion?: CategoryTaxonomy;
};

export function aggregateCategorySpend(
    subscriptions: ExtendedSubscription[],
    categoryRules: HumanRule[]
): CategoryAggregation[] {
    const results: CategoryAggregation[] = [];
    
    for (const sub of subscriptions) {
        const category = classifySubscriptionCategory(
            { vendorName: sub.vendorName, aiSuggestion: sub.aiSuggestion },
            categoryRules
        );
        
        let activeOwnerUid: string | undefined;
        if (sub.owners) {
            const activeOwner = sub.owners.find(o => !o.ended_date);
            activeOwnerUid = activeOwner?.employee_uid;
        }

        let annualizedAmountCents = sub.amount_cents;
        if (sub.billing_cadence === 'monthly') {
            annualizedAmountCents = sub.amount_cents * 12n;
        } else if (sub.billing_cadence === 'quarterly') {
            annualizedAmountCents = sub.amount_cents * 4n;
        }

        results.push({
            category,
            vendorId: sub.vendor_id,
            department: sub.department,
            ownerUid: activeOwnerUid,
            amountCents: annualizedAmountCents
        });
    }

    return results;
}

export function detectDuplicateTools(
    subscriptions: ExtendedSubscription[],
    categoryRules: HumanRule[] = []
): DuplicateToolIndicator[] {
    const grouped = new Map<string, ExtendedSubscription[]>();

    for (const sub of subscriptions) {
        const category = classifySubscriptionCategory(
            { vendorName: sub.vendorName, aiSuggestion: sub.aiSuggestion },
            categoryRules
        );

        if (!sub.department) continue;
        
        const key = `${category}|${sub.department}`;
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(sub);
    }

    const duplicates: DuplicateToolIndicator[] = [];

    for (const [key, subs] of grouped.entries()) {
        const uniqueVendors = new Set(subs.map(s => s.vendor_id));
        if (uniqueVendors.size > 1) {
            const [category, department] = key.split('|');
            duplicates.push({
                category: category as CategoryTaxonomy,
                department,
                subscriptions: subs.map(s => s.subscription_id),
                vendors: Array.from(uniqueVendors)
            });
        }
    }

    return duplicates;
}
