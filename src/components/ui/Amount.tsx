import React from 'react';
import styles from './ui.module.css';

export interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number; // in cents
  currency?: string;
}

export const Amount = React.forwardRef<HTMLSpanElement, AmountProps>(
  ({ value, currency = '$', className = '', ...props }, ref) => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const dollars = Math.floor(absoluteValue / 100);
    const cents = (absoluteValue % 100).toString().padStart(2, '0');

    const formattedDollars = new Intl.NumberFormat('en-US').format(dollars);

    return (
      <span ref={ref} className={`${styles.amount} ${className}`} {...props}>
        {isNegative && '-'}
        {currency}
        {formattedDollars}
        <span className={styles.amountCents}>.{cents}</span>
      </span>
    );
  }
);
Amount.displayName = 'Amount';
