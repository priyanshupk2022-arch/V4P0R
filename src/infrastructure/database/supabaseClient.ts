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
  accountId: string;
  cardId?: string;
  amountCents: bigint;
  currency?: string;
  merchantName: string;
  status: TransactionState;
}

export async function recordDoubleEntryLedger(
  input: DoubleEntryTransactionInput
): Promise<{ success: boolean; id: string }> {
  const client = getSupabaseClient();
  const timestamp = new Date().toISOString();
  const amountStr = input.amountCents.toString();

  const recordOp = async () => {
    try {
      const transactionInsert = await client.from('transactions').insert({
        id: input.transactionId,
        account_id: input.accountId,
        card_id: input.cardId,
        amount_cents: amountStr,
        currency: input.currency || 'USD',
        merchant_name: input.merchantName,
        status: input.status,
        created_at: timestamp,
      });
      if (transactionInsert.error) throw transactionInsert.error;

      // Insert DEBIT ledger entry
      const debitInsert = await client.from('ledger_entries').insert({
        id: `led_dr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        transaction_id: input.transactionId,
        account_id: input.accountId,
        entry_type: 'DEBIT',
        amount_cents: amountStr,
        created_at: timestamp,
      });
      if (debitInsert.error) throw debitInsert.error;

      // Insert CREDIT ledger entry
      const creditInsert = await client.from('ledger_entries').insert({
        id: `led_cr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        transaction_id: input.transactionId,
        account_id: 'acc_system_settlement',
        entry_type: 'CREDIT',
        amount_cents: amountStr,
        created_at: timestamp,
      });
      if (creditInsert.error) throw creditInsert.error;

      return { success: true, id: input.transactionId };
    } catch (error) {
      throw new Error('Ledger persistence failed', { cause: error });
    }
  };

  return recordOp();
}
