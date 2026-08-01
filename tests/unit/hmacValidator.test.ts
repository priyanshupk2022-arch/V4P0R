import { describe, it, expect } from 'vitest';
import { verifyHmacSignature } from '../../src/infrastructure/security/hmacValidator';
import crypto from 'crypto';

describe('verifyHmacSignature', () => {
  const secret = 'super-secret-key';
  const payload = JSON.stringify({ event: 'payment.success', id: 123 });
  
  const generateSignature = (data: string | Buffer, key: string) => {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  };

  const validSignature = generateSignature(payload, secret);

  it('should successfully verify a valid signature', () => {
    expect(verifyHmacSignature(payload, validSignature, secret)).toBe(true);
  });

  it('should reject a tampered payload', () => {
    const tamperedPayload = JSON.stringify({ event: 'payment.success', id: 999 });
    expect(verifyHmacSignature(tamperedPayload, validSignature, secret)).toBe(false);
  });

  it('should reject an invalid signature', () => {
    const invalidSignature = generateSignature(payload, 'wrong-secret');
    expect(verifyHmacSignature(payload, invalidSignature, secret)).toBe(false);
  });
  
  it('should return false if signature length is different', () => {
    expect(verifyHmacSignature(payload, 'short-sig', secret)).toBe(false);
  });
});
