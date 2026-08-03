import React from 'react';
import styles from './ui.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: 1 | 2 | 3;
  radius?: 'primary' | 'compact' | 'controls';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, surface = 1, radius = 'primary', className = '', ...props }, ref) => {
    let surfaceClass = '';
    if (surface === 2) surfaceClass = styles.cardSurface2;
    if (surface === 3) surfaceClass = styles.cardSurface3;

    let radiusClass = styles.cardRadiusPrimary;
    if (radius === 'compact') radiusClass = styles.cardRadiusCompact;
    if (radius === 'controls') radiusClass = styles.cardRadiusControls;

    return (
      <div
        ref={ref}
        className={`${styles.card} ${surfaceClass} ${radiusClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
