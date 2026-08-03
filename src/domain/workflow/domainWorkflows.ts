export type WorkflowType = 
    | 'NEW_PURCHASE'
    | 'RECURRING_RENEWAL'
    | 'SPEND_ANOMALY'
    | 'EMPLOYEE_OFFBOARDING'
    | 'OWNERSHIP_TRANSFER'
    | 'SUBSCRIPTION_REVIEW'
    | 'PAYMENT_CONTROL_DECISION';

export interface WorkflowEvent {
    correlationId: string;
    workflowType: WorkflowType;
    eventTimestamp: string;
    payload: any;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
}

function generateCorrelationId(): string {
    return `corr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

function createAuditEvent(
    workflowType: WorkflowType,
    payload: any,
    status: 'COMPLETED' | 'FAILED' | 'PENDING' = 'COMPLETED'
): WorkflowEvent {
    return {
        correlationId: generateCorrelationId(),
        workflowType,
        eventTimestamp: new Date().toISOString(),
        payload,
        status
    };
}

export function executeNewPurchaseWorkflow(payload: any): WorkflowEvent {
    return createAuditEvent('NEW_PURCHASE', payload);
}

export function executeRecurringRenewalWorkflow(payload: any): WorkflowEvent {
    return createAuditEvent('RECURRING_RENEWAL', payload);
}

export function executeSpendAnomalyWorkflow(payload: any): WorkflowEvent {
    return createAuditEvent('SPEND_ANOMALY', payload);
}

export function executeEmployeeOffboardingWorkflow(payload: any): WorkflowEvent {
    return createAuditEvent('EMPLOYEE_OFFBOARDING', payload);
}

export function executeOwnershipTransferWorkflow(payload: any): WorkflowEvent {
    return createAuditEvent('OWNERSHIP_TRANSFER', payload);
}

export function executeSubscriptionReviewWorkflow(payload: any): WorkflowEvent {
    return createAuditEvent('SUBSCRIPTION_REVIEW', payload);
}

export function executePaymentControlDecisionWorkflow(payload: any): WorkflowEvent {
    return createAuditEvent('PAYMENT_CONTROL_DECISION', payload);
}
