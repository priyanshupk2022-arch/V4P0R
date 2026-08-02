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

export function verifyStandardWebhookSignature(
  rawBody: string | Buffer,
  webhookId: string,
  timestamp: string | number,
  signatureHeader: string,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;

  let secretKey: Buffer;
  if (secret.startsWith('whsec_')) {
    secretKey = Buffer.from(secret.substring(6), 'base64');
  } else {
    secretKey = Buffer.from(secret, 'utf-8');
  }

  const signedPayload = `${webhookId}.${timestamp}.${rawBody}`;

  const expectedHex = crypto.createHmac('sha256', secretKey).update(signedPayload).digest('hex');
  const expectedBase64 = crypto.createHmac('sha256', secretKey).update(signedPayload).digest('base64');

  const rawBodyHex = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
  const rawBodyBase64 = crypto.createHmac('sha256', secretKey).update(rawBody).digest('base64');

  const signatures = signatureHeader.trim().split(/\s+/);

  for (const sig of signatures) {
    let cleanSig = sig;
    if (sig.startsWith('v1,')) {
      cleanSig = sig.substring(3);
    }

    if (
      safeBufferCompare(cleanSig, expectedHex) ||
      safeBufferCompare(cleanSig, expectedBase64) ||
      safeBufferCompare(cleanSig, rawBodyHex) ||
      safeBufferCompare(cleanSig, rawBodyBase64)
    ) {
      return true;
    }
  }

  return verifyHmacSignature(rawBody, signatureHeader, secret);
}

function safeBufferCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function normalizeUnicodeInput(input: string): string {
  if (!input) return '';
  
  // Apply Unicode NFKD normalization & strip zero-width characters (\u200B-\u200D, \uFEFF)
  return input
    .normalize('NFKD')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

