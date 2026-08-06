import React from 'react';
import { Button } from './Button';
import { ShieldAlert } from 'lucide-react';

interface ExceptionRecoveryFlowProps {
  onOverrideRequest: () => void;
}

export function ExceptionRecoveryFlow({ onOverrideRequest }: ExceptionRecoveryFlowProps) {
  return (
    <div className="flex flex-col gap-4 p-5 border border-status-error/20 bg-status-error/5 rounded-md mt-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h4 className="text-status-error font-medium mb-1">Transaction Blocked</h4>
          <p className="text-sm text-text-primary">
            This transaction exceeds the permitted threshold for this vendor. Funds were not deducted.
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Button variant="override" onClick={onOverrideRequest}>
          Acknowledge & Request Exception
        </Button>
      </div>
    </div>
  );
}
