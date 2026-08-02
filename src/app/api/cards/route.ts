import { NextRequest, NextResponse } from 'next/server';
import { extractSessionFromHeaders } from '../../../infrastructure/auth/authMiddleware';
import { hasPermission } from '../../../domain/auth/rbac';
import { createVirtualCard } from '../../../adapters/prava/createCard';
import { toCents } from '../../../domain/budget/centsMath';

export async function GET(req: NextRequest) {
  const session = await extractSessionFromHeaders(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'view_ledger')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const sampleCards = [
    {
      cardId: 'card_aws_01',
      organizationId: session.organizationId,
      userId: session.userId,
      last4: '4242',
      status: 'ACTIVE',
      limitCents: (500000n).toString(),
      monthlyLimitCents: (5000000n).toString(),
      merchantWhitelist: ['5734', '5968'],
      createdAt: new Date().toISOString(),
    },
    {
      cardId: 'card_github_02',
      organizationId: session.organizationId,
      userId: session.userId,
      last4: '8888',
      status: 'ACTIVE',
      limitCents: (200000n).toString(),
      monthlyLimitCents: (1000000n).toString(),
      merchantWhitelist: ['5734'],
      createdAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    status: 'success',
    organizationId: session.organizationId,
    cards: sampleCards,
  });
}

export async function POST(req: NextRequest) {
  const session = await extractSessionFromHeaders(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'issue_card')) {
    return NextResponse.json(
      { error: `Forbidden: Role ${session.role} cannot issue virtual cards` },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { limitAmount, monthlyLimitAmount, cardholderName } = body;

    if (!limitAmount) {
      return NextResponse.json({ error: 'Missing required field: limitAmount' }, { status: 400 });
    }

    const limitCents = toCents(limitAmount);
    const monthlyCents = monthlyLimitAmount ? toCents(monthlyLimitAmount) : limitCents * 10n;

    const card = await createVirtualCard({
      userId: session.userId,
      cardholderName: cardholderName || 'Corporate Agent',
      limitCents: limitCents,
    });

    return NextResponse.json({
      status: 'success',
      cardId: card.cardId,
      organizationId: session.organizationId,
      last4: card.last4,
      limitCents: card.limitCents.toString(),
      monthlyLimitCents: monthlyCents.toString(),
      cardStatus: card.status,
      createdAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
