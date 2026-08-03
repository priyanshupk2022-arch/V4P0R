import { Subscription, OwnerType } from '../subscription/subscriptionManager';
import { EmployeeIdentity } from '../employee/employeeIdentity';

export type OrphanedDetectionReason = 'EMPLOYEE_OFFBOARDED' | 'MISSING_OWNER' | 'INACTIVE_OWNER';
export type OrphanedResolutionAction = 'TRANSFER' | 'RETAIN' | 'CANCEL_REQUEST' | 'INVESTIGATE';

export interface OrphanedSubscription {
    subscriptionId: string;
    reason: OrphanedDetectionReason;
    detectedAt: Date;
    fallbackOwnerUid?: string;
    financeOwnerUid?: string;
}

export interface ResolveOrphanedParams {
    orphaned: OrphanedSubscription;
    action: OrphanedResolutionAction;
    newOwnerUid?: string;
    correlationId: string;
    resolvedByUid: string;
}

export interface OrphanedResolutionResult {
    subscriptionId: string;
    status: 'resolved' | 'pending';
    auditLog: {
        action: OrphanedResolutionAction;
        correlationId: string;
        timestamp: string;
        resolvedBy: string;
    };
}

export function detectOrphanedSubscriptions(
    subscriptions: Subscription[],
    employees: EmployeeIdentity[]
): OrphanedSubscription[] {
    const orphaned: OrphanedSubscription[] = [];
    const employeeMap = new Map(employees.map(e => [e.employee_uid, e]));

    const financeEmployees = employees.filter(e => e.department === 'Finance' && e.status === 'active');
    const defaultFinanceUid = financeEmployees.length > 0 ? financeEmployees[0].employee_uid : undefined;

    for (const sub of subscriptions) {
        if (!sub.owners || sub.owners.length === 0) {
            orphaned.push({
                subscriptionId: sub.subscription_id,
                reason: 'MISSING_OWNER',
                detectedAt: new Date(),
                financeOwnerUid: defaultFinanceUid
            });
            continue;
        }

        let isOrphaned = false;
        let reason: OrphanedDetectionReason = 'INACTIVE_OWNER';
        let fallbackUid: string | undefined;

        for (const owner of sub.owners) {
            if (owner.ended_date) continue;

            const emp = employeeMap.get(owner.employee_uid);
            if (!emp) {
                isOrphaned = true;
                reason = 'MISSING_OWNER';
            } else if (emp.status === 'offboarded' || emp.status === 'archived') {
                isOrphaned = true;
                reason = 'EMPLOYEE_OFFBOARDED';
                if (emp.manager_employee_uid && employeeMap.get(emp.manager_employee_uid)?.status === 'active') {
                    fallbackUid = emp.manager_employee_uid;
                }
            } else if (emp.status !== 'active') {
                isOrphaned = true;
                reason = 'INACTIVE_OWNER';
            }
        }

        if (isOrphaned) {
            orphaned.push({
                subscriptionId: sub.subscription_id,
                reason,
                detectedAt: new Date(),
                fallbackOwnerUid: fallbackUid,
                financeOwnerUid: defaultFinanceUid
            });
        }
    }

    return orphaned;
}

export function resolveOrphanedSubscription(params: ResolveOrphanedParams): OrphanedResolutionResult {
    return {
        subscriptionId: params.orphaned.subscriptionId,
        status: params.action === 'INVESTIGATE' ? 'pending' : 'resolved',
        auditLog: {
            action: params.action,
            correlationId: params.correlationId,
            timestamp: new Date().toISOString(),
            resolvedBy: params.resolvedByUid
        }
    };
}
