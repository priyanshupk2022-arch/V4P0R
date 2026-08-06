import { describe, it, expect } from 'vitest';
import { 
    detectOrphanedSubscriptions, 
    resolveOrphanedSubscription,
    OrphanedResolutionAction
} from '../../src/domain/orphaned/orphanedSubscription';
import { Subscription } from '../../src/domain/subscription/subscriptionManager';
import { EmployeeIdentity } from '../../src/domain/employee/employeeIdentity';

describe('Orphaned Subscriptions', () => {
    describe('detectOrphanedSubscriptions', () => {
        it('validates detection of missing, inactive, or offboarded owners', () => {
            const subs: Subscription[] = [
                {
                    subscription_id: 'sub-missing',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    currency_iso: 'USD',
                    owners: []
                },
                {
                    subscription_id: 'sub-inactive',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    currency_iso: 'USD',
                    owners: [{ employee_uid: 'emp-inactive', owner_type: 'BUSINESS_OWNER', assigned_date: new Date() }]
                },
                {
                    subscription_id: 'sub-offboarded',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    currency_iso: 'USD',
                    owners: [{ employee_uid: 'emp-offboarded', owner_type: 'BUSINESS_OWNER', assigned_date: new Date() }]
                }
            ];

            const employees: EmployeeIdentity[] = [
                {
                    employee_uid: 'emp-inactive',
                    name: 'Inactive User',
                    role: 'Engineer',
                    manager_employee_uid: null,
                    cost_center_id: 'cc-1',
                    email: 'inactive@example.com',
                    department: 'Engineering',
                    status: 'archived'
                },
                {
                    employee_uid: 'emp-offboarded',
                    name: 'Offboarded User',
                    role: 'Sales',
                    manager_employee_uid: null,
                    cost_center_id: 'cc-2',
                    email: 'offboarded@example.com',
                    department: 'Sales',
                    status: 'offboarded'
                }
            ];

            const result = detectOrphanedSubscriptions(subs, employees);
            
            expect(result).toHaveLength(3);
            expect(result.find(r => r.subscriptionId === 'sub-missing')?.reason).toBe('MISSING_OWNER');
            expect(result.find(r => r.subscriptionId === 'sub-inactive')?.reason).toBe('INACTIVE_OWNER');
            expect(result.find(r => r.subscriptionId === 'sub-offboarded')?.reason).toBe('EMPLOYEE_OFFBOARDED');
        });

        it('validates identification of department/manager fallback and temporary finance owner assignment', () => {
            const subs: Subscription[] = [
                {
                    subscription_id: 'sub-manager-fallback',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    currency_iso: 'USD',
                    owners: [{ employee_uid: 'emp-offboarded', owner_type: 'BUSINESS_OWNER', assigned_date: new Date() }]
                },
                {
                    subscription_id: 'sub-missing',
                    vendor_id: 'v1',
                    status: 'active',
                    amount_cents: 1000n,
                    billing_cadence: 'monthly',
                    currency_iso: 'USD',
                    owners: []
                }
            ];

            const employees: EmployeeIdentity[] = [
                {
                    employee_uid: 'emp-offboarded',
                    name: 'Offboarded',
                    role: 'Sales',
                    cost_center_id: 'cc-2',
                    email: 'offboarded@example.com',
                    department: 'Sales',
                    status: 'offboarded',
                    manager_employee_uid: 'emp-manager'
                },
                {
                    employee_uid: 'emp-manager',
                    name: 'Manager',
                    role: 'Sales Manager',
                    manager_employee_uid: null,
                    cost_center_id: 'cc-2',
                    email: 'manager@example.com',
                    department: 'Sales',
                    status: 'active'
                },
                {
                    employee_uid: 'emp-finance',
                    name: 'Finance',
                    role: 'Finance',
                    manager_employee_uid: null,
                    cost_center_id: 'cc-3',
                    email: 'finance@example.com',
                    department: 'Finance',
                    status: 'active'
                }
            ];

            const result = detectOrphanedSubscriptions(subs, employees);
            
            const fallbackResult = result.find(r => r.subscriptionId === 'sub-manager-fallback');
            expect(fallbackResult?.fallbackOwnerUid).toBe('emp-manager');
            expect(fallbackResult?.financeOwnerUid).toBe('emp-finance');

            const missingResult = result.find(r => r.subscriptionId === 'sub-missing');
            expect(missingResult?.financeOwnerUid).toBe('emp-finance');
        });
    });

    describe('resolveOrphanedSubscription', () => {
        it('validates resolution actions preserving history and emitting audit events', () => {
            const actions: OrphanedResolutionAction[] = ['TRANSFER', 'RETAIN', 'CANCEL_REQUEST', 'INVESTIGATE'];
            
            for (const action of actions) {
                const result = resolveOrphanedSubscription({
                    orphaned: {
                        subscriptionId: 'sub-test',
                        reason: 'MISSING_OWNER',
                        detectedAt: new Date()
                    },
                    action,
                    correlationId: 'corr-123',
                    resolvedByUid: 'emp-admin',
                    newOwnerUid: action === 'TRANSFER' ? 'emp-new' : undefined
                });

                expect(result.subscriptionId).toBe('sub-test');
                expect(result.status).toBe(action === 'INVESTIGATE' ? 'pending' : 'resolved');
                expect(result.auditLog).toBeDefined();
                expect(result.auditLog.action).toBe(action);
                expect(result.auditLog.correlationId).toBe('corr-123');
                expect(result.auditLog.resolvedBy).toBe('emp-admin');
            }
        });
    });
});
