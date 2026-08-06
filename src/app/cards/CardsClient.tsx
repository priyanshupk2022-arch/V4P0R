"use client";

import { useState } from 'react';
import { VirtualCard } from '@/adapters/cards';
import { TelemetryPanel } from '@/components/ui/TelemetryPanel';

export default function CardsClient({ initialCards }: { initialCards: VirtualCard[] }) {
  const [cards, setCards] = useState<VirtualCard[]>(initialCards);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newMerchant, setNewMerchant] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newExpiry, setNewExpiry] = useState('');

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: VirtualCard = {
      id: `crd_${Math.random().toString(36).substr(2, 9)}`,
      panLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      merchant: newMerchant || 'NEW_VENDOR',
      amount: newAmount ? `$${newAmount}` : '$0.00',
      expiry: newExpiry || '2025-12-31',
      status: 'ACTIVE',
      passkey: 'Awaiting Setup'
    };
    setCards([newCard, ...cards]);
    setIsModalOpen(false);
    setNewMerchant('');
    setNewAmount('');
    setNewExpiry('');
  };

  const handleFreeze = (id: string) => {
    setCards(cards.map(card => {
      if (card.id === id) {
        return {
          ...card,
          status: card.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
        };
      }
      return card;
    }));
  };

  const handleUpdateLimit = (id: string) => {
    const newLimit = prompt('ENTER NEW DOLLAR LIMIT (e.g., $10,000.00):');
    if (newLimit) {
      setCards(cards.map(card => {
        if (card.id === id) {
          return { ...card, amount: newLimit };
        }
        return card;
      }));
    }
  };

  const getPasskeyStatusText = (status: string) => {
    if (status === 'Ready') return 'PK_AUTH: ENROLLED';
    if (status === 'Awaiting Setup') return 'PK_AUTH: PENDING';
    return 'PK_AUTH: UNSUPPORTED';
  };

  const getPasskeyColor = (status: string) => {
    if (status === 'Ready') return 'text-status-success';
    if (status === 'Awaiting Setup') return 'text-text-neutral';
    return 'text-accent-critical';
  };

  return (
    <div className="min-h-[100dvh] p-8 max-w-[1400px] mx-auto text-sm">
      <header className="mb-12 flex justify-between items-end border-b border-text-neutral/20 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-text-primary">PRAVA.CARDS</h1>
          <p className="text-text-neutral mt-2 text-xs">VIRTUAL ISSUANCE & ENFORCEMENT</p>
        </div>
        <button 
          className="bg-foreground text-black font-bold px-4 py-2 border border-foreground hover:bg-transparent hover:text-text-primary transition-none"
          onClick={() => setIsModalOpen(true)}
        >
          [+ ISSUE_V_CARD]
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <TelemetryPanel key={card.id} title={card.merchant} status={card.status === 'ACTIVE' ? 'ONLINE' : 'ALERT'} className="h-full">
            <div className="flex flex-col h-full gap-4 pt-2">
              <div className="flex justify-between items-end pb-4 border-b border-text-neutral/10">
                <div>
                  <div className="text-[10px] text-text-neutral/60 mb-1">PAN_LAST4</div>
                  <div className="text-xl text-text-primary font-bold tabular-nums">**** {card.panLast4}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-text-neutral/60 mb-1">MAX_CAP</div>
                  <div className="text-xl text-text-primary font-bold tabular-nums">{card.amount}</div>
                </div>
              </div>

              <div className="space-y-2 text-[10px] pb-4 border-b border-text-neutral/10">
                <div className="flex justify-between">
                  <span className="text-text-neutral/60">VALID_THRU</span>
                  <span className="text-text-neutral font-bold">{card.expiry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-neutral/60">CARD_ID</span>
                  <span className="text-text-neutral">{card.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-neutral/60">SEC_STATUS</span>
                  <span className={`${getPasskeyColor(card.passkey)} font-bold`}>{getPasskeyStatusText(card.passkey)}</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                <button 
                  className={`py-2 px-2 text-[10px] font-bold border transition-none ${card.status === 'ACTIVE' ? 'bg-surface-card border-text-neutral/20 text-accent-critical hover:border-accent-critical' : 'bg-status-error border-status-error text-white hover:bg-transparent hover:text-accent-critical-critical'}`}
                  onClick={() => handleFreeze(card.id)}
                >
                  {card.status === 'ACTIVE' ? '[ SUSPEND ]' : '[ RESTORE ]'}
                </button>
                <button 
                  className="py-2 px-2 text-[10px] font-bold border border-text-neutral/20 bg-surface-base text-text-neutral hover:border-text-neutral/20 hover:text-white transition-none"
                  onClick={() => handleUpdateLimit(card.id)}
                >
                  [ EDIT_CAP ]
                </button>
              </div>
            </div>
          </TelemetryPanel>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <TelemetryPanel title="ISSUE_NEW_CARD" className="w-full max-w-lg p-0">
            <form onSubmit={handleCreateCard} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-text-neutral mb-2">MERCHANT.WHITELIST</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-card border border-text-neutral/20 p-3 text-text-primary focus:outline-none focus:border-foreground" 
                    placeholder="E.G. AWS_US_EAST" 
                    value={newMerchant}
                    onChange={e => setNewMerchant(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-neutral mb-2">AUTH_LIMIT.USD</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-card border border-text-neutral/20 p-3 text-text-primary focus:outline-none focus:border-foreground tabular-nums" 
                    placeholder="5000.00" 
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-neutral mb-2">EXPIRATION.DATE</label>
                  <input 
                    type="date" 
                    className="w-full bg-surface-card border border-text-neutral/20 p-3 text-text-primary focus:outline-none focus:border-foreground" 
                    value={newExpiry}
                    onChange={e => setNewExpiry(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-8 pt-6 border-t border-text-neutral/20">
                <button 
                  type="button" 
                  className="flex-1 bg-transparent border border-text-neutral/20 text-text-neutral p-3 hover:text-white hover:border-text-neutral/20" 
                  onClick={() => setIsModalOpen(false)}
                >
                  [ CANCEL ]
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-status-success text-black font-bold p-3 border border-status-success hover:bg-transparent hover:text-status-success"
                >
                  [ COMMIT_ISSUE ]
                </button>
              </div>
            </form>
          </TelemetryPanel>
        </div>
      )}
    </div>
  );
}
