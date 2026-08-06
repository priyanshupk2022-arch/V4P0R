import { describe, it, expect } from 'vitest';
import { 
    aggregateCategorySpend, 
    detectDuplicateTools,
    ExtendedSubscription
} from '../../src/domain/analytics/categoryIntelligence';
import { CategoryTaxonomy } from '../../src/domain/category/categoryTaxonomy';

describe('Category Intelligence', () => {
    describe('aggregateCategorySpend', () => {
        it('validates category spend aggregation by category, vendor, department, and owner', () => {
            const subs: ExtendedSubscription[] = [
                {
                    subscription_id: 'sub-1',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    department: 'Engineering',
                    vendorName: 'GitHub',
                    currency_iso: 'USD',
                    owners: [{ employee_uid: 'emp-1', owner_type: 'BUSINESS_OWNER', assigned_date: new Date() }]
                },
                {
                    subscription_id: 'sub-2',
                    vendor_id: 'v2',
                    status: 'active',
                    amount_cents: 10000n,
                    billing_cadence: 'annually',
                    department: 'Engineering',
                    vendorName: 'GitLab',
                    currency_iso: 'USD',
                    owners: []
                }
            ];

            const rules = [
                { pattern: /git/i, category: 'Engineering' as CategoryTaxonomy }
            ];

            const result = aggregateCategorySpend(subs, rules);
            
            expect(result).toHaveLength(2);
            
            const sub1 = result.find(r => r.vendorId === 'v1');
            expect(sub1?.category).toBe('Engineering');
            expect(sub1?.department).toBe('Engineering');
            expect(sub1?.ownerUid).toBe('emp-1');

            const sub2 = result.find(r => r.vendorId === 'v2');
            expect(sub2?.category).toBe('Engineering');
            expect(sub2?.department).toBe('Engineering');
            expect(sub2?.ownerUid).toBeUndefined();
        });

        it('validates annualized spend in integer cents (amount_cents)', () => {
            const subs: ExtendedSubscription[] = [
                {
                    subscription_id: 'sub-monthly',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    vendorName: 'Monthly Tool',
                    currency_iso: 'USD',
                    owners: []
                },
                {
                    subscription_id: 'sub-quarterly',
                    vendor_id: 'v2',
                    status: 'active',
                    amount_cents: 3000n,
                    billing_cadence: 'quarterly',
                    vendorName: 'Quarterly Tool',
                    currency_iso: 'USD',
                    owners: []
                },
                {
                    subscription_id: 'sub-yearly',
                    vendor_id: 'v3',
                    status: 'active',
                    amount_cents: 12000n,
                    billing_cadence: 'annually',
                    vendorName: 'Yearly Tool',
                    currency_iso: 'USD',
                    owners: []
                }
            ];

            const result = aggregateCategorySpend(subs, []);
            
            expect(result.find(r => r.vendorId === 'v1')?.amountCents).toBe(12000n); // 1000 * 12
            expect(result.find(r => r.vendorId === 'v2')?.amountCents).toBe(12000n); // 3000 * 4
            expect(result.find(r => r.vendorId === 'v3')?.amountCents).toBe(12000n); // 12000
        });
    });

    describe('detectDuplicateTools', () => {
        it('validates evidence-based duplicate tool detection (same category, same department, different vendors)', () => {
            const subs: ExtendedSubscription[] = [
                {
                    subscription_id: 'sub-1',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    department: 'Design',
                    vendorName: 'Figma',
                    currency_iso: 'USD',
                    owners: []
                },
                {
                    subscription_id: 'sub-2',
                    vendor_id: 'v2',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    department: 'Design',
                    vendorName: 'Sketch',
                    currency_iso: 'USD',
                    owners: []
                },
                {
                    subscription_id: 'sub-3',
                    vendor_id: 'v1', // Same vendor as sub-1
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    department: 'Design',
                    vendorName: 'Figma',
                    currency_iso: 'USD',
                    owners: []
                },
                {
                    subscription_id: 'sub-4',
                    vendor_id: 'v3',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    department: 'Engineering', // Different department
                    vendorName: 'Sketch',
                    currency_iso: 'USD',
                    owners: []
                }
            ];

            const rules = [
                { pattern: /figma|sketch/i, category: 'Design' as CategoryTaxonomy }
            ];

            const duplicates = detectDuplicateTools(subs, rules);
            
            // Only Design department should have duplicates (v1 and v2)
            expect(duplicates).toHaveLength(1);
            expect(duplicates[0].category).toBe('Design');
            expect(duplicates[0].department).toBe('Design');
            expect(duplicates[0].vendors).toContain('v1');
            expect(duplicates[0].vendors).toContain('v2');
            expect(duplicates[0].subscriptions).toContain('sub-1');
            expect(duplicates[0].subscriptions).toContain('sub-2');
            expect(duplicates[0].subscriptions).toContain('sub-3');
            expect(duplicates[0].subscriptions).not.toContain('sub-4');
        });
    });
});
