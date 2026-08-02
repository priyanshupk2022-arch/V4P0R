import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as linqWebhookHandler } from '../../src/app/api/webhook/linq/route';
import { searchSensoKnowledgeBase } from '../../src/adapters/senso/search';
import { generateHmacSignature } from '../../src/infrastructure/security/hmacValidator';
import crypto from 'crypto';

const mockSeenEvents = new Map<string, any>();
vi.mock('../../src/infrastructure/database/supabaseClient', () => ({
  recordDoubleEntryLedger: vi.fn().mockResolvedValue({ success: true, id: 'tx_ledger_001' }),
  checkAndRecordWebhookEvent: vi.fn().mockImplementation(async (rec: any) => {
    if (mockSeenEvents.has(rec.eventId)) {
      return { isDuplicate: true, result: mockSeenEvents.get(rec.eventId) };
    }
    return { isDuplicate: false, result: undefined };
  }),
  updateWebhookEventResult: vi.fn().mockImplementation(async (provider: string, eventId: string, result: any) => {
    mockSeenEvents.set(eventId, { status: 'ignored', message: 'Duplicate webhook-id rejected' });
  }),
}));

vi.mock('../../src/adapters/prava/lockCard', () => ({
  lockVirtualCard: vi.fn().mockResolvedValue({ success: true, status: 'LOCKED' }),
}));

describe('Partner Integration Verification Suite (Linq & Senso)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, LINQ_WEBHOOK_SECRET: 'test_linq_secret_key_123' };
  });

  describe('Linq Webhook Route', () => {
    const createMockRequest = (
      body: object,
      headers: Record<string, string>
    ) => {
      const bodyStr = JSON.stringify(body);
      return {
        text: async () => bodyStr,
        headers: {
          get: (key: string) => headers[key.toLowerCase()] || null,
        },
      } as any;
    };

    it('rejects requests missing required signature headers', async () => {
      const req = createMockRequest({ action: 'APPROVE' }, {});
      const res = await linqWebhookHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Missing required signed webhook fields');
    });

    it('rejects expired timestamp header (replay protection)', async () => {
      const staleTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const body = { card_id: 'card_123', user_id: 'usr_1', transaction_id: 'tx_1', action: 'APPROVE', amount: 50.0 };
      const bodyStr = JSON.stringify(body);
      const signature = generateHmacSignature(bodyStr, 'test_linq_secret_key_123');

      const req = createMockRequest(body, {
        'webhook-id': 'msg_stale_001',
        'webhook-timestamp': staleTimestamp.toString(),
        'webhook-signature': signature,
      });

      const res = await linqWebhookHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Expired or invalid timestamp header');
    });

    it('rejects invalid HMAC signature', async () => {
      const now = Math.floor(Date.now() / 1000).toString();
      const body = { card_id: 'card_123', user_id: 'usr_1', transaction_id: 'tx_1', action: 'APPROVE', amount: 50.0 };

      const req = createMockRequest(body, {
        'webhook-id': 'msg_invalid_sig',
        'webhook-timestamp': now,
        'webhook-signature': 'invalid_hmac_hex_signature',
      });

      const res = await linqWebhookHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Invalid HMAC signature');
    });

    it('successfully processes Standard Webhook HMAC signature for LIKE (APPROVE) Tapback reaction', async () => {
      const now = Math.floor(Date.now() / 1000).toString();
      const webhookId = 'msg_like_tapback_001';
      const secret = 'test_linq_secret_key_123';
      const body = {
        card_id: 'card_linq_01',
        user_id: 'usr_imessage_user',
        transaction_id: 'tx_imessage_001',
        reaction: 'like',
        amount_cents: 2500,
      };
      const rawBody = JSON.stringify(body);

      // Standard Webhooks format: v1,<base64_hmac(msg_id.timestamp.body)>
      const signedPayload = `${webhookId}.${now}.${rawBody}`;
      const hmacBase64 = crypto.createHmac('sha256', secret).update(signedPayload).digest('base64');
      const signatureHeader = `v1,${hmacBase64}`;

      const req = createMockRequest(body, {
        'webhook-id': webhookId,
        'webhook-timestamp': now,
        'webhook-signature': signatureHeader,
      });

      const res = await linqWebhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('success');
      expect(json.actionExecuted).toBe('APPROVE');
      expect(json.cardStatus).toBe('ACTIVE');
      expect(json.nextTransactionState).toBe('AUTHORIZED');
    });

    it('successfully processes DISLIKE (REJECT) reaction, locks virtual card and transitions transaction state', async () => {
      const now = Math.floor(Date.now() / 1000).toString();
      const webhookId = 'msg_dislike_tapback_002';
      const secret = 'test_linq_secret_key_123';
      const body = {
        card_id: 'card_linq_02',
        user_id: 'usr_imessage_user',
        transaction_id: 'tx_imessage_002',
        reaction: 'dislike',
        amount: '120.00',
      };
      const rawBody = JSON.stringify(body);

      const signature = generateHmacSignature(rawBody, secret);

      const req = createMockRequest(body, {
        'webhook-id': webhookId,
        'webhook-timestamp': now,
        'webhook-signature': signature,
      });

      const res = await linqWebhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('success');
      expect(json.actionExecuted).toBe('REJECT');
      expect(json.cardStatus).toBe('LOCKED');
      expect(json.nextTransactionState).toBe('DECLINED');
    });

    it('enforces replay protection on duplicate webhook-id', async () => {
      const now = Math.floor(Date.now() / 1000).toString();
      const webhookId = 'msg_duplicate_replay_003';
      const secret = 'test_linq_secret_key_123';
      const body = {
        card_id: 'card_linq_03',
        user_id: 'usr_imessage_user',
        transaction_id: 'tx_imessage_003',
        action: 'APPROVE',
        amount_cents: 1500,
      };
      const rawBody = JSON.stringify(body);
      const signature = generateHmacSignature(rawBody, secret);

      const req1 = createMockRequest(body, {
        'webhook-id': webhookId,
        'webhook-timestamp': now,
        'webhook-signature': signature,
      });
      const res1 = await linqWebhookHandler(req1);
      expect(res1.status).toBe(200);

      // Second request with identical webhookId
      const req2 = createMockRequest(body, {
        'webhook-id': webhookId,
        'webhook-timestamp': now,
        'webhook-signature': signature,
      });
      const res2 = await linqWebhookHandler(req2);
      expect(res2.status).toBe(200);
      const json2 = await res2.json();
      expect(json2.status).toBe('ignored');
      expect(json2.message).toContain('Duplicate webhook-id rejected');
    });
  });

  describe('Senso Knowledge Base Search Adapter', () => {
    it('queries Senso API when available and returns structured evidence', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          query: 'spend limits software tools',
          answer: 'Software purchases under $100 require auto-approval.',
          results: [
            {
              content_id: 'doc_senso_001',
              title: 'VAPOR Procurement Policy v1.2',
              chunk_text: 'Software tools under $100 are pre-approved.',
              score: 0.98,
              source_url: 'https://docs.senso.ai/vapor-policy',
            },
          ],
          total_results: 1,
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const response = await searchSensoKnowledgeBase('spend limits software tools', 3);
      expect(response.query).toBe('spend limits software tools');
      expect(response.results.length).toBe(1);
      expect(response.results[0].content_id).toBe('doc_senso_001');
      expect(response.results[0].score).toBe(0.98);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://apiv2.senso.ai/api/v1/org/search',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('provides grounded policy fallback when offline or without API key', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const response = await searchSensoKnowledgeBase('hardware procurement', 2);
      expect(response.results.length).toBeGreaterThan(0);
      expect(response.results[0].title).toContain('VAPOR Spend Policy');
      expect(response.results[0].score).toBe(0.96);
    });
  });
});
