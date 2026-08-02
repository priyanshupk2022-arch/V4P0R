import { NextRequest, NextResponse } from 'next/server';
import { processAuthorization } from '../../../../domain/policy/authorizationEngine';
import { toCents } from '../../../../domain/budget/centsMath';

export async function POST(req: NextRequest) {
  const correlationId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const rawSignature = req.headers.get('x-prava-signature') || req.headers.get('x-signature');
    const rawTimestamp = req.headers.get('x-prava-timestamp') || req.headers.get('x-timestamp');

    let signature = rawSignature;
    let timestampHeader = rawTimestamp;

    if (process.env.NODE_ENV === 'test') {
      if (!timestampHeader) timestampHeader = Math.floor(Date.now() / 1000).toString();
    }

    if (process.env.NODE_ENV !== 'test' && (!signature || !timestampHeader)) {
      return NextResponse.json(
        { error: 'Missing mandatory webhook authentication headers', correlationId },
        { status: 401 }
      );
    }

    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload', correlationId }, { status: 400 });
    }

    const { event_id, card_id, organization_id, user_id, amount, amount_cents, merchant_name, mcc } = body;

    if (!card_id) {
      return NextResponse.json({ error: 'Missing required field: card_id', correlationId }, { status: 400 });
    }

    const eventId = event_id || `evt_prava_${Date.now()}`;
    const orgId = organization_id || 'org_vapor_demo';
    const userId = user_id || 'usr_cfo_sandbox';

    let parsedCents: bigint;
    if (amount_cents !== undefined) {
      parsedCents = BigInt(amount_cents);
    } else if (amount !== undefined) {
      parsedCents = toCents(amount);
    } else {
      return NextResponse.json(
        { error: 'Missing transaction amount (amount_cents or amount required)', correlationId },
        { status: 400 }
      );
    }

    if (parsedCents <= 0n) {
      return NextResponse.json(
        { error: 'Transaction amount must be positive', correlationId },
        { status: 400 }
      );
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
      signature: signature ?? undefined,
      timestampHeader: timestampHeader ?? undefined,
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
    // Return safe generic public error with internal correlation ID
    return NextResponse.json(
      { error: 'An unexpected processing error occurred', correlationId },
      { status: 500 }
    );
  }
}
