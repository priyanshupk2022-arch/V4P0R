import { NextRequest, NextResponse } from 'next/server';
import { processAuthorization } from '../../../../domain/policy/authorizationEngine';
import { toCents } from '../../../../domain/budget/centsMath';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-prava-signature') || req.headers.get('x-signature') || undefined;
    const timestampHeader = req.headers.get('x-prava-timestamp') || req.headers.get('x-timestamp') || undefined;

    const body = JSON.parse(rawBody);
    const { event_id, card_id, organization_id, user_id, amount, amount_cents, merchant_name, mcc } = body;

    if (!card_id) {
      return NextResponse.json({ error: 'Missing required field: card_id' }, { status: 400 });
    }

    const eventId = event_id || `evt_prava_${Date.now()}`;
    const orgId = organization_id || 'org_vapor_demo';
    const userId = user_id || 'usr_cfo_sandbox';

    let parsedCents = 0n;
    if (amount_cents !== undefined) {
      parsedCents = BigInt(amount_cents);
    } else if (amount !== undefined) {
      parsedCents = toCents(amount);
    } else {
      parsedCents = 1000n; // Default $10.00
    }

    const result = await processAuthorization({
      provider: 'PRAVA',
      eventId,
      cardId: card_id,
      organizationId: orgId,
      userId,
      amountCents: parsedCents,
      merchantName: merchant_name || 'Unknown Merchant',
      mcc,
      signature,
      timestampHeader,
      rawPayload: rawBody,
    });

    return NextResponse.json({
      status: result.approved ? 'AUTHORIZED' : 'DECLINED',
      approved: result.approved,
      transactionId: result.transactionId,
      reason: result.reason,
      cardStatus: result.cardStatus,
      ledgerBalanced: result.ledgerBalanced,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
