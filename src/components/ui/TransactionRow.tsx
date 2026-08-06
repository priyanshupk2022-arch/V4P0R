import React from 'react';
import { Badge, RiskLevel } from './Badge';

export interface Transaction {
  id: string;
  statusLevel: RiskLevel;
  statusLabel: string;
  rationale: string;
  merchant: string;
  requester: string;
  amount: number;
  age: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  onClick: (id: string) => void;
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(transaction.id);
    }
  };

  return (
    <tr 
      tabIndex={0}
      onClick={() => onClick(transaction.id)}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer hover:bg-surface-base transition-colors duration-fast border-b border-text-neutral/10 last:border-b-0 focus:outline-none focus:bg-surface-base focus:ring-2 focus:ring-inset focus:ring-text-neutral/30"
    >
      <td className="py-3 px-4 whitespace-nowrap">
        <Badge level={transaction.statusLevel} rationale={transaction.rationale} />
      </td>
      <td className="py-3 px-4 font-medium text-text-primary">
        {transaction.merchant}
      </td>
      <td className="py-3 px-4 text-text-neutral">
        {transaction.requester}
      </td>
      <td className="py-3 px-4 text-right tabular-nums text-text-primary font-medium">
        ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </td>
      <td className="py-3 px-4 text-text-neutral">
        {transaction.statusLabel}
      </td>
      <td className="py-3 px-4 text-text-neutral whitespace-nowrap text-right">
        {transaction.age}
      </td>
    </tr>
  );
}
