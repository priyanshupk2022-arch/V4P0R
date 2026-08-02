import crypto from 'crypto';

export function generateHmacSignature(payload: string | Buffer, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyHmacSignature(payload: string | Buffer, signature: string, secret: string): boolean {
  const digest = generateHmacSignature(payload, secret);
  
  // Convert strings to buffers for timingSafeEqual
  const signatureBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);
  
  // Check length first to prevent error in timingSafeEqual
  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

export function verifyTimestampTolerance(timestampHeader: string | number, maxAgeSeconds: number = 300): boolean {
  const requestTime = typeof timestampHeader === 'string' ? parseInt(timestampHeader, 10) : timestampHeader;
  if (isNaN(requestTime)) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  const diff = Math.abs(currentTime - requestTime);

  return diff <= maxAgeSeconds;
}

export function normalizeUnicodeInput(input: string): string {
  if (!input) return '';
  
  // Apply Unicode NFKD normalization & strip zero-width characters (\u200B-\u200D, \uFEFF)
  return input
    .normalize('NFKD')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}
