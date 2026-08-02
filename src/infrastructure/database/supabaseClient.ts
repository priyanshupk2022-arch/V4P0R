import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../lib/config';
import { TransactionState } from '../../domain/transaction/stateMachine';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('mock.') || key.startsWith('mock-')) {
    throw new Error('Supabase persistence is not configured');
  }

  clientInstance = createClient(url, key);
  return clientInstance;
}

export interface DoubleEntryTransactionInput {
  transactionId: string;
  organizationId?: string;
  accountId: string;
  cardId?: string;
  userId?: string;
  amountCents: bigint;
  currency?: string;
  merchantName: string;
  mcc?: string;
  status: TransactionState;
}

export interface WebhookEventRecord {
  provider: string;
  eventId: string;
  payloadHash: string;
  result?: any;
}

// In-Memory Fallback Idempotency Cache for test sandbox runs when Supabase is unconfigured
const inMemoryWebhookEvents = new Map<string, { result: any; processedAt: string }>();

export async function checkAndRecordWebhookEvent(
  record: WebhookEventRecord
): Promise<{ isDuplicate: boolean; result?: any }> {
  const eventKey = `${record.provider}:${record.eventId}`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('check_and_record_webhook_event', {
      p_provider: record.provider,
      p_event_id: record.eventId,
      p_payload_hash: record.payloadHash,
      p_result: record.result || null,
    });

    if (!error && data) {
      return {
        isDuplicate: Boolean(data.is_duplicate),
        result: data.result,
      };
    }
  } catch (err) {
    // Unconfigured DB fallback to in-memory store
  }

  if (inMemoryWebhookEvents.has(eventKey)) {
    const existing = inMemoryWebhookEvents.get(eventKey)!;
    return { isDuplicate: true, result: existing.result };
  }

  inMemoryWebhookEvents.set(eventKey, {
    result: record.result,
    processedAt: new Date().toISOString(),
  });

  return { isDuplicate: false, result: record.result };
}

export async function updateWebhookEventResult(
  provider: string,
  eventId: string,
  result: any
): Promise<void> {
  const eventKey = `${provider}:${eventId}`;
  const existing = inMemoryWebhookEvents.get(eventKey);
  if (existing) {
    existing.result = result;
  }

  try {
    const client = getSupabaseClient();
    await client
      .from('webhook_events')
      .update({ result })
      .eq('provider', provider)
      .eq('event_id', eventId);
  } catch (err) {
    // Ignore DB missing errors
  }
}

export async function recordDoubleEntryLedger(
  input: DoubleEntryTransactionInput
): Promise<{ success: boolean; id: string }> {
  const timestamp = new Date().toISOString();
  const amountStr = input.amountCents.toString();
  const orgId = input.organizationId || '00000000-0000-0000-0000-000000000000';

  try {
    const client = getSupabaseClient();

    // 1. Try atomic PostgreSQL RPC first
    const { data, error: rpcError } = await client.rpc('post_atomic_double_entry_transaction', {
      p_organization_id: orgId,
      p_transaction_id: input.transactionId,
      p_account_id: input.accountId,
      p_card_id: input.cardId || null,
      p_user_id: input.userId || '00000000-0000-0000-0000-000000000000',
      p_amount_cents: amountStr,
      p_currency: input.currency || 'USD',
      p_state: input.status,
      p_merchant_name: input.merchantName,
      p_mcc: input.mcc || null,
    });

    if (!rpcError && data?.success) {
      return { success: true, id: input.transactionId };
    }

    // 2. Fallback to client-side multi-table insert
    const transactionInsert = await client.from('transactions').insert({
      id: input.transactionId,
      organization_id: orgId,
      account_id: input.accountId,
      card_id: input.cardId,
      user_id: input.userId || '00000000-0000-0000-0000-000000000000',
      amount_cents: amountStr,
      currency: input.currency || 'USD',
      merchant_name: input.merchantName,
      state: input.status,
      created_at: timestamp,
    });
    if (transactionInsert.error) throw transactionInsert.error;

    // DEBIT entry
    const debitInsert = await client.from('ledger_entries').insert({
      id: `led_dr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: orgId,
      transaction_id: input.transactionId,
      account_id: input.accountId,
      entry_type: 'DEBIT',
      amount_cents: amountStr,
      description: `Debit: ${input.merchantName}`,
      created_at: timestamp,
    });
    if (debitInsert.error) throw debitInsert.error;

    // CREDIT entry
    const creditInsert = await client.from('ledger_entries').insert({
      id: `led_cr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: orgId,
      transaction_id: input.transactionId,
      account_id: null,
      entry_type: 'CREDIT',
      amount_cents: amountStr,
      description: `Credit settlement: ${input.merchantName}`,
      created_at: timestamp,
    });
    if (creditInsert.error) throw creditInsert.error;

    return { success: true, id: input.transactionId };
  } catch (error) {
    throw new Error('Ledger persistence failed', { cause: error });
  }
}
