import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as checkoutSessionHandler } from '../../src/app/api/checkout/session/route';
import { POST as pravaWebhookHandler } from '../../src/app/api/webhook/prava/route';
import { POST as reconciliationHandler } from '../../src/app/api/reconciliation/route';
import { GET as healthHandler } from '../../src/app/api/health/route';
import { extractSessionFromHeaders } from '../../src/infrastructure/auth/authMiddleware';

vi.mock('../../src/infrastructure/auth/authMiddleware', () => ({
  extractSessionFromHeaders: vi.fn(),
}));

vi.mock('../../src/infrastructure/database/supabaseClient', () => ({
  recordDoubleEntryLedger: vi.fn().mockResolvedValue({ success: true, id: 'tx_ledger_mock_123' }),
}));

vi.mock('../../src/adapters/prava/createSession', () => ({
  createPravaSession: vi.fn().mockResolvedValue({
    session_id: 'sess_prava_mock_999',
    session_token: 'tok_mock_888',
    iframe_url: 'https://sandbox.api.prava.space/checkout/sess_prava_mock_999',
    order_id: 'ord_vapor_mock_777',
    expires_at: '2026-08-03T00:00:00Z',
  }),
}));

function createMockNextRequest(
  url: string,
  options: {
    method?: string;
    body?: object | string;
    headers?: Record<string, string>;
  } = {}
) {
  const bodyStr = typeof options.body === 'object' ? JSON.stringify(options.body) : options.body || '';
  const headersMap = new Map<string, string>();
  if (options.headers) {
    Object.entries(options.headers).forEach(([k, v]) => headersMap.set(k.toLowerCase(), v));
  }

  const reqUrl = new URL(url);

  return {
    nextUrl: reqUrl,
    url: reqUrl.toString(),
    method: options.method || 'POST',
    text: async () => bodyStr,
    json: async () => (typeof options.body === 'object' ? options.body : JSON.parse(bodyStr || '{}')),
    headers: {
      get: (name: string) => headersMap.get(name.toLowerCase()) || null,
    },
  } as any;
}

describe('Worker Lane 5: API Routes, Webhooks & Background Reconciliation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Checkout Session API (/api/checkout/session)', () => {
    it('returns 401 Unauthorized when auth session is missing', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue(null);

      const req = createMockNextRequest('https://vapor.app/api/checkout/session', {
        body: { totalAmount: '50.00', merchantName: 'AWS', merchantUrl: 'https://aws.amazon.com' },
      });
      const res = await checkoutSessionHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 403 Forbidden when user lacks approve_request permission', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue({
        userId: 'usr_employee_01',
        email: 'employee@vapor.dev',
        organizationId: 'org_demo',
        role: 'EMPLOYEE',
      });

      const req = createMockNextRequest('https://vapor.app/api/checkout/session', {
        body: { totalAmount: '50.00', merchantName: 'AWS', merchantUrl: 'https://aws.amazon.com' },
      });
      const res = await checkoutSessionHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('Forbidden');
    });

    it('returns 400 Bad Request when required parameters are missing', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue({
        userId: 'usr_admin_01',
        email: 'admin@vapor.dev',
        organizationId: 'org_demo',
        role: 'FINANCE_ADMIN',
      });

      const req = createMockNextRequest('https://vapor.app/api/checkout/session', {
        body: { totalAmount: '50.00' }, // missing merchantName & merchantUrl
      });
      const res = await checkoutSessionHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Missing required parameters');
    });

    it('returns 400 Bad Request when merchantUrl is not HTTPS', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue({
        userId: 'usr_admin_01',
        email: 'admin@vapor.dev',
        organizationId: 'org_demo',
        role: 'FINANCE_ADMIN',
      });

      const req = createMockNextRequest('https://vapor.app/api/checkout/session', {
        body: { totalAmount: '50.00', merchantName: 'Unsecure Store', merchantUrl: 'http://insecure.com' },
      });
      const res = await checkoutSessionHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('merchantUrl must use HTTPS');
    });

    it('returns 400 Bad Request when totalAmount is <= 0', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue({
        userId: 'usr_admin_01',
        email: 'admin@vapor.dev',
        organizationId: 'org_demo',
        role: 'FINANCE_ADMIN',
      });

      const req = createMockNextRequest('https://vapor.app/api/checkout/session', {
        body: { totalAmount: '0.00', merchantName: 'AWS', merchantUrl: 'https://aws.amazon.com' },
      });
      const res = await checkoutSessionHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid totalAmount');
    });

    it('successfully creates session and records INITIATED ledger entry for authorized role', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue({
        userId: 'usr_admin_01',
        email: 'admin@vapor.dev',
        organizationId: 'org_demo',
        role: 'FINANCE_ADMIN',
      });

      const req = createMockNextRequest('https://vapor.app/api/checkout/session', {
        body: { totalAmount: '120.50', merchantName: 'AWS', merchantUrl: 'https://aws.amazon.com' },
      });
      const res = await checkoutSessionHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('success');
      expect(json.sessionId).toBe('sess_prava_mock_999');
      expect(json.checkoutUrl).toBe('https://sandbox.api.prava.space/checkout/sess_prava_mock_999');
      expect(json.totalAmount).toBe('120.50');
      expect(json.currency).toBe('USD');
      expect(json.createdAt).toBeDefined();
    });
  });

  describe('2. Prava Webhook API (/api/webhook/prava)', () => {
    it('returns 400 Bad Request when card_id is missing', async () => {
      const req = createMockNextRequest('https://vapor.app/api/webhook/prava', {
        body: { amount: 25.0, merchant_name: 'AWS' },
      });
      const res = await pravaWebhookHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing required field: card_id');
    });

    it('returns AUTHORIZED and ledger confirmation for valid authorization request', async () => {
      const req = createMockNextRequest('https://vapor.app/api/webhook/prava', {
        body: {
          event_id: 'evt_prava_test_1001',
          card_id: 'card_demo_01',
          organization_id: 'org_demo',
          user_id: 'usr_cfo_01',
          amount_cents: 4500,
          merchant_name: 'AWS',
          mcc: '5734',
        },
      });
      const res = await pravaWebhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('AUTHORIZED');
      expect(json.approved).toBe(true);
      expect(json.transactionId).toBeDefined();
      expect(json.reason).toContain('Transaction authorized');
      expect(json.cardStatus).toBe('ACTIVE');
      expect(json.ledgerBalanced).toBe(true);
    });

    it('returns DECLINED when spend amount exceeds limits', async () => {
      const req = createMockNextRequest('https://vapor.app/api/webhook/prava', {
        body: {
          event_id: 'evt_prava_test_exceed',
          card_id: 'card_demo_01',
          organization_id: 'org_demo',
          user_id: 'usr_cfo_01',
          amount_cents: 99999999, // Exceeds budget limit
          merchant_name: 'AWS',
        },
      });
      const res = await pravaWebhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('DECLINED');
      expect(json.approved).toBe(false);
      expect(json.reason).toBeDefined();
    });
  });

  describe('3. Background Reconciliation API (/api/reconciliation)', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue(null);

      const req = createMockNextRequest('https://vapor.app/api/reconciliation', {});
      const res = await reconciliationHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 403 Forbidden for non-reconciliation roles (e.g., EMPLOYEE)', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue({
        userId: 'usr_emp_01',
        email: 'employee@vapor.dev',
        organizationId: 'org_demo',
        role: 'EMPLOYEE',
      });

      const req = createMockNextRequest('https://vapor.app/api/reconciliation', {});
      const res = await reconciliationHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('Forbidden');
    });

    it('returns 200 COMPLETED with run ID and zero discrepancy for OWNER/FINANCE_ADMIN role', async () => {
      vi.mocked(extractSessionFromHeaders).mockResolvedValue({
        userId: 'usr_admin_01',
        email: 'admin@vapor.dev',
        organizationId: 'org_demo',
        role: 'FINANCE_ADMIN',
      });

      const req = createMockNextRequest('https://vapor.app/api/reconciliation', {});
      const res = await reconciliationHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('COMPLETED');
      expect(json.reconciliationRunId).toMatch(/^rec_/);
      expect(json.organizationId).toBe('org_demo');
      expect(json.totalMatchedCount).toBe(42);
      expect(json.discrepancyCents).toBe('0');
      expect(json.message).toContain('zero discrepancies');
    });
  });

  describe('4. Liveness & Health API (/api/health)', () => {
    it('returns 200 OK with system metadata', async () => {
      const res = await healthHandler();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.system).toBe('VAPOR Backend Engine');
      expect(json.version).toBe('1.0.0');
    });
  });
});
