import { describe, it, expect } from 'vitest';
import { verifyHmacSignature, verifyTimestampTolerance, normalizeUnicodeInput } from '../../src/infrastructure/security/hmacValidator';
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

describe('verifyTimestampTolerance', () => {
  it('should accept a timestamp within the 300s window', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(verifyTimestampTolerance(now)).toBe(true);
    expect(verifyTimestampTolerance(now - 120)).toBe(true);
  });

  it('should reject a timestamp older than 300s', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(verifyTimestampTolerance(now - 400)).toBe(false);
  });
});

describe('normalizeUnicodeInput', () => {
  it('should strip zero-width spaces and normalize Unicode NFKD', () => {
    const obfuscated = 'A\u200BW\u200BS';
    expect(normalizeUnicodeInput(obfuscated)).toBe('AWS');
  });
});
