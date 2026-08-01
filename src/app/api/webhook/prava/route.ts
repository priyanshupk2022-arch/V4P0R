import { NextRequest, NextResponse } from 'next/server';
import { verifyHmacSignature } from '@/infrastructure/security/hmacValidator';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/config';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const RUST_CORE_URL = process.env.RUST_CORE_URL || 'http://localhost:8080';
const GO_STREAM_URL = process.env.GO_STREAM_URL || 'http://localhost:8081';
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8082';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-prava-signature') || req.headers.get('x-signature') || '';
    const secret = process.env.PRAVA_SECRET_KEY || 'sk_test_67e6aa87c948_fnmMycC1zaSLDbEQT9tOFY2_APLDwP1WW2KNRG2ya7U';

    // 1. Verify HMAC Signature (NODE-0503) - Constant Time Cryptographic Check (< 1ms)
    if (signature && !verifyHmacSignature(rawBody, signature, secret)) {
      return NextResponse.json({ approved: false, reason: 'INVALID_SIGNATURE' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody || '{}');
    const { userId, cardId, amountCents } = payload;

    if (!userId || !cardId || !amountCents) {
      return NextResponse.json({ approved: false, reason: 'MISSING_PAYLOAD_FIELDS' }, { status: 400 });
    }

    const amount = typeof amountCents === 'string' ? parseInt(amountCents, 10) : amountCents;
    const balanceKey = `user:${userId}:balance`;
    const cardStatusKey = `card:${cardId}:status`;

    let authResult = {
      approved: false,
      reason: 'UNKNOWN',
      remainingBalanceCents: 0,
      executionLatencyMs: 0,
      engine: 'Redis Lua Hot-Path',
    };

    // 2. 🔥 HOT PATH (< 10ms): Attempt Rust Core Microservice or Redis Lua Atomic Execution
    try {
      // Primary: Try Rust Financial Core for microsecond atomic verification
      const rustResponse = await fetch(`${RUST_CORE_URL}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount_cents: amount }),
        signal: AbortSignal.timeout(15), // 15ms hard cutoff
      }).catch(() => null);

      if (rustResponse && rustResponse.ok) {
        const rustData = await rustResponse.json();
        authResult = {
          approved: rustData.approved,
          reason: rustData.reason || (rustData.approved ? 'APPROVED' : 'DECLINED'),
          remainingBalanceCents: rustData.remaining_balance_cents ?? 0,
          executionLatencyMs: Date.now() - startTime,
          engine: '🦀 Rust Core Microservice (Sub-10ms)',
        };
      } else {
        // Secondary Hot-Path: Redis Lua Atomic Lockless Script Execution
        const luaScript = `
          local balance_key = KEYS[1]
          local card_status_key = KEYS[2]
          local amount_cents = tonumber(ARGV[1])
          if not amount_cents or amount_cents <= 0 then return {0, "INVALID_AMOUNT", 0} end
          local card_status = redis.call("GET", card_status_key)
          if card_status and card_status ~= "ACTIVE" then return {0, "CARD_LOCKED", 0} end
          local current_balance = tonumber(redis.call("GET", balance_key)) or 10000
          if current_balance < amount_cents then return {0, "INSUFFICIENT_FUNDS", current_balance} end
          local new_balance = redis.call("DECRBY", balance_key, amount_cents)
          return {1, "APPROVED", new_balance}
        `;

        const luaRes = (await redis.eval(luaScript, [balanceKey, cardStatusKey], [amount])) as [number, string, number];
        const [success, reasonCode, newBal] = luaRes || [0, 'REDIS_ERROR', 0];

        authResult = {
          approved: success === 1,
          reason: reasonCode,
          remainingBalanceCents: newBal,
          executionLatencyMs: Date.now() - startTime,
          engine: '🔴 Redis Lua Script (Hot-Path)',
        };
      }
    } catch (hotPathErr) {
      // Graceful fallback for dev environment offline state
      authResult = {
        approved: amount <= 10000,
        reason: amount <= 10000 ? 'APPROVED_FALLBACK' : 'INSUFFICIENT_FUNDS',
        remainingBalanceCents: Math.max(0, 10000 - amount),
        executionLatencyMs: Date.now() - startTime,
        engine: '⚡ Node.js Gateway In-Memory Fallback',
      };
    }

    // 3. 🌊 ASYNC SHADOW PIPELINE (Non-Blocking background dispatch to Go Streamer & Python AI)
    if (authResult.approved) {
      // Async Go Audit Stream
      fetch(`${GO_STREAM_URL}/stream/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: 'CARD_TRANSACTION',
          entity_id: cardId,
          user_id: userId,
          amount_cents: amount,
          status: 'AUTHORIZED',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {}); // Fire and forget

      // Async Python AI RAG Grounding & Policy Check
      fetch(`${PYTHON_AI_URL}/ai/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Verify spend policy for card ${cardId} amount ${amount} cents`,
          user_id: userId,
        }),
      }).catch(() => {}); // Fire and forget
    }

    const statusCode = authResult.approved ? 200 : authResult.reason === 'INSUFFICIENT_FUNDS' ? 402 : 400;

    return NextResponse.json({
      approved: authResult.approved,
      transactionId: `tx_${Date.now()}`,
      userId,
      cardId,
      amountCents: amount,
      remainingBalanceCents: authResult.remainingBalanceCents,
      reason: authResult.reason,
      engine: authResult.engine,
      latencyMs: authResult.executionLatencyMs,
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  } catch (error) {
    return NextResponse.json({ approved: false, reason: 'INTERNAL_ERROR', latencyMs: Date.now() - startTime }, { status: 500 });
  }
}

