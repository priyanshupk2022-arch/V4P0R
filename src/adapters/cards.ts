export type CardStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'REVOKED';
export type PasskeyStatus = 'Ready' | 'Awaiting Setup' | 'Unsupported';

export interface VirtualCard {
  id: string;
  panLast4: string;
  merchant: string;
  amount: string;
  expiry: string;
  status: CardStatus;
  passkey: PasskeyStatus;
}

export async function getCardsAdapter(): Promise<VirtualCard[]> {
  return [
    {
      id: 'crd_1',
      panLast4: '4242',
      merchant: 'OpenAI API',
      amount: '$5,000.00',
      expiry: '2024-04-15',
      status: 'ACTIVE',
      passkey: 'Ready'
    },
    {
      id: 'crd_2',
      panLast4: '8812',
      merchant: 'AWS Hosting',
      amount: '$10,000.00',
      expiry: '2024-05-01',
      status: 'ACTIVE',
      passkey: 'Ready'
    },
    {
      id: 'crd_3',
      panLast4: '0034',
      merchant: 'Figma Enterprise',
      amount: '$1,200.00',
      expiry: '2023-11-20',
      status: 'EXPIRED',
      passkey: 'Unsupported'
    },
    {
      id: 'crd_4',
      panLast4: '5591',
      merchant: 'GitHub Copilot',
      amount: '$400.00',
      expiry: '2024-06-30',
      status: 'PENDING',
      passkey: 'Awaiting Setup'
    },
    {
      id: 'crd_5',
      panLast4: '7721',
      merchant: 'Vercel Pro',
      amount: '$1,500.00',
      expiry: '2024-01-10',
      status: 'REVOKED',
      passkey: 'Unsupported'
    },
    {
      id: 'crd_6',
      panLast4: '2289',
      merchant: 'Slack Plus',
      amount: '$3,400.00',
      expiry: '2024-08-15',
      status: 'ACTIVE',
      passkey: 'Ready'
    }
  ];
}
