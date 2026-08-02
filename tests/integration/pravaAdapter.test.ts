import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createVirtualCard } from '../../src/adapters/prava/createCard';
import { lockVirtualCard } from '../../src/adapters/prava/lockCard';
import {
  createPravaSession,
  getPravaPaymentResult,
  reportPravaStatus,
} from '../../src/adapters/prava/sessionClient';

describe('Prava Card Adapter & Session Client Contract Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Contract Guard (Card Issuance & Locking)', () => {
    it('rejects unsupported direct virtual-card issuance instead of fabricating a card', async () => {
      await expect(
        createVirtualCard({
          userId: 'usr_test_123',
          cardholderName: 'VAPOR Test User',
          limitCents: 5000n, // $50.00
        })
      ).rejects.toThrow('not an approved VAPOR Prava contract');
    });

    it('should throw an error if card limit is <= 0 cents', async () => {
      await expect(
        createVirtualCard({
          userId: 'usr_test_123',
          cardholderName: 'VAPOR Test User',
          limitCents: 0n,
        })
      ).rejects.toThrow('Card limit must be greater than zero');
    });

    it('rejects unsupported direct card locking instead of reporting success', async () => {
      await expect(lockVirtualCard('card_test_999')).rejects.toThrow(
        'not an approved VAPOR Prava contract'
      );
    });

    it('requires cardId parameter when calling lockVirtualCard', async () => {
      await expect(lockVirtualCard('')).rejects.toThrow('cardId is required');
    });
  });

  describe('Session Client API (POST /v1/sessions)', () => {
    it('creates a Prava checkout session with Bearer authorization and valid response payload', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            session_id: 'sess_prava_1001',
            session_token: 'tok_prava_sec_888',
            iframe_url: 'https://sandbox.api.prava.space/checkout/sess_prava_1001',
            order_id: 'ord_vapor_5001',
            expires_at: '2026-08-03T00:00:00Z',
            authorizeOnly: false,
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      const res = await createPravaSession({
        user_id: 'usr_cfo_01',
        user_email: 'cfo@vapor.dev',
        total_amount: '99.99',
        currency: 'USD',
        purchase_context: [
          {
            merchant_details: {
              name: 'Datadog Log Management',
              url: 'https://datadoghq.com',
              country_code_iso2: 'US',
            },
            product_details: [
              { description: 'Infrastructure Monitoring', unit_price: '99.99', quantity: 1 },
            ],
          },
        ],
        integration_type: 'full_checkout',
        callback_url: 'https://vapor.app/api/webhook/prava',
      });

      expect(res.session_id).toBe('sess_prava_1001');
      expect(res.session_token).toBe('tok_prava_sec_888');
      expect(res.iframe_url).toBe('https://sandbox.api.prava.space/checkout/sess_prava_1001');
      expect(res.order_id).toBe('ord_vapor_5001');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/v1/sessions');
      expect(init.method).toBe('POST');
      expect(init.headers['Authorization']).toMatch(/^Bearer sk_test_/);
    });

    it('throws error when session creation returns non-2xx status', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response('Bad Request', { status: 400 }))
      );

      await expect(
        createPravaSession({
          user_id: 'usr_fail',
          user_email: 'fail@vapor.dev',
          total_amount: '0.00',
          currency: 'USD',
          purchase_context: [],
        })
      ).rejects.toThrow('Prava session creation failed with HTTP 400');
    });

    it('throws contract mismatch error when response lacks mandatory fields', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ session_id: 'sess_invalid' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      );

      await expect(
        createPravaSession({
          user_id: 'usr_invalid',
          user_email: 'invalid@vapor.dev',
          total_amount: '10.00',
          currency: 'USD',
          purchase_context: [],
        })
      ).rejects.toThrow('Prava session response did not match the selected contract');
    });
  });

  describe('Payment Result Polling (GET /v1/sessions/{id}/payment-result)', () => {
    it('fetches session payment status and line item credentials', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            session_id: 'sess_prava_1001',
            order_id: 'ord_vapor_5001',
            status: 'completed',
            transactions: [
              {
                txn_id: 'txn_prava_9001',
                status: 'completed',
                line_items: [
                  {
                    txn_ref_id: 'ref_line_01',
                    merchant_name: 'Datadog',
                    total_amount: '99.99',
                    status: 'ISSUED',
                    token: '411111******1111',
                    dynamic_cvv: '888',
                    expiry_month: '12',
                    expiry_year: '2028',
                  },
                ],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      const result = await getPravaPaymentResult('sess_prava_1001');
      expect(result.session_id).toBe('sess_prava_1001');
      expect(result.status).toBe('completed');
      expect(result.transactions[0].line_items[0].txn_ref_id).toBe('ref_line_01');

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/v1/sessions/sess_prava_1001/payment-result');
      expect(init.headers['Authorization']).toMatch(/^Bearer sk_test_/);
    });

    it('throws error when payment result poll fails with HTTP error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response('Not Found', { status: 404 }))
      );

      await expect(getPravaPaymentResult('sess_missing')).rejects.toThrow(
        'Prava payment-result request failed with HTTP 404'
      );
    });
  });

  describe('Report Status (POST /v1/sessions/{id}/report-status)', () => {
    it('reports merchant checkout outcome and returns Visa confirmation', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 'confirmed',
            txn_ref_id: 'ref_line_01',
            txn_status: 'DECLINED',
            visa_confirmation: 'SUCCESS',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      const res = await reportPravaStatus('sess_prava_1001', {
        txn_ref_id: 'ref_line_01',
        txn_status: 'DECLINED',
        authorization_code: 'AUTH_DECLINED_EXPECTED',
        response_code: '51',
      });

      expect(res.status).toBe('confirmed');
      expect(res.txn_status).toBe('DECLINED');
      expect(res.visa_confirmation).toBe('SUCCESS');

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/v1/sessions/sess_prava_1001/report-status');
      expect(init.method).toBe('POST');
      expect(init.headers['Authorization']).toMatch(/^Bearer sk_test_/);
    });

    it('throws error when report-status request returns non-2xx status', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response('Server Error', { status: 500 }))
      );

      await expect(
        reportPravaStatus('sess_prava_1001', {
          txn_ref_id: 'ref_line_01',
          txn_status: 'APPROVED',
        })
      ).rejects.toThrow('Prava report-status request failed with HTTP 500');
    });
  });
});

