export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PolicyVerdict = 'ALLOW' | 'BLOCK' | 'REQUIRES_LINQ_APPROVAL' | 'ESCALATED';

export type ProviderState = 'LIVE' | 'SANDBOX' | 'PENDING' | 'UNAVAILABLE' | 'ERROR' | 'DEMO';

export type LinqMessageState = 'dispatching' | 'delivered' | 'pending' | 'approved' | 'rejected' | 'expired' | 'failed';

export type PravaPasskeyStatus = 'unsupported' | 'ready' | 'awaiting' | 'approved' | 'cancelled' | 'failed';
export type PravaCheckoutState = 'ready' | 'opening_merchant' | 'attempted' | 'expected_sandbox_decline' | 'completed' | 'timeout' | 'failed';
