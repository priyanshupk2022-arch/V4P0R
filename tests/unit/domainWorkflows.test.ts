import { describe, it, expect } from 'vitest';
import { 
    executeNewPurchaseWorkflow,
    executeRecurringRenewalWorkflow,
    executeSpendAnomalyWorkflow,
    executeEmployeeOffboardingWorkflow,
    executeOwnershipTransferWorkflow,
    executeSubscriptionReviewWorkflow,
    executePaymentControlDecisionWorkflow
} from '../../src/domain/workflow/domainWorkflows';

describe('Domain Workflows', () => {
    it('validates correlation ID generation (corr_...) and audit event creation', () => {
        const payload = { test: true };
        
        const event = executeNewPurchaseWorkflow(payload);
        
        expect(event.correlationId).toMatch(/^corr_[a-z0-9]+_[a-z0-9]+$/);
        expect(event.workflowType).toBe('NEW_PURCHASE');
        expect(event.eventTimestamp).toBeDefined();
        expect(event.payload).toEqual(payload);
        expect(event.status).toBe('COMPLETED');
    });

    it('validates unified workflow engine execution for all types', () => {
        const payload = { data: 'test' };

        const newPurchase = executeNewPurchaseWorkflow(payload);
        expect(newPurchase.workflowType).toBe('NEW_PURCHASE');

        const recurringRenewal = executeRecurringRenewalWorkflow(payload);
        expect(recurringRenewal.workflowType).toBe('RECURRING_RENEWAL');

        const spendAnomaly = executeSpendAnomalyWorkflow(payload);
        expect(spendAnomaly.workflowType).toBe('SPEND_ANOMALY');

        const employeeOffboarding = executeEmployeeOffboardingWorkflow(payload);
        expect(employeeOffboarding.workflowType).toBe('EMPLOYEE_OFFBOARDING');

        const ownershipTransfer = executeOwnershipTransferWorkflow(payload);
        expect(ownershipTransfer.workflowType).toBe('OWNERSHIP_TRANSFER');

        const subscriptionReview = executeSubscriptionReviewWorkflow(payload);
        expect(subscriptionReview.workflowType).toBe('SUBSCRIPTION_REVIEW');

        const paymentControl = executePaymentControlDecisionWorkflow(payload);
        expect(paymentControl.workflowType).toBe('PAYMENT_CONTROL_DECISION');
    });
});
