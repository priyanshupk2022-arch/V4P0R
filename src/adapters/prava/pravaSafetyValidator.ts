/**
 * Authoritative Prava Safety Contract Validator & Engine Rules
 * Enforces all 13 Prava Negative-Prompt Rules.
 */

export const BANNED_TLDS = [
  '.local',
  '.test',
  '.example',
  '.demo',
  '.invalid',
  '.localhost',
  '.internal',
  '.devices',
];

export interface ApprovedSandboxCard {
  cardId: string;
  brand: string;
  panLast4: string;
  maskedPan: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  description: string;
}

/**
 * Rule 3 & 4: Approved Sandbox Test Cards with redacted PAN/CVV.
 * Stored securely without exposing full raw numbers or security codes in source code.
 */
export const APPROVED_SANDBOX_TEST_CARDS: ApprovedSandboxCard[] = [
  {
    cardId: 'CARD-SANDBOX-01',
    brand: 'Visa',
    panLast4: '2382',
    maskedPan: '4000 **** **** 2382',
    expiryMonth: '12',
    expiryYear: '2028',
    cvv: '***',
    description: 'Primary Visa Sandbox Test Card',
  },
  {
    cardId: 'CARD-SANDBOX-02',
    brand: 'Mastercard',
    panLast4: '5401',
    maskedPan: '5500 **** **** 5401',
    expiryMonth: '10',
    expiryYear: '2027',
    cvv: '***',
    description: 'Secondary Mastercard Sandbox Test Card',
  },
  {
    cardId: 'CARD-SANDBOX-03',
    brand: 'Amex',
    panLast4: '3005',
    maskedPan: '3782 **** **** 3005',
    expiryMonth: '08',
    expiryYear: '2029',
    cvv: '****',
    description: 'Tertiary Amex Sandbox Test Card',
  },
];

/**
 * Rule 1: Customer email TLD validation.
 * Rejects non-routable / fake TLDs (.local, .test, .demo, etc.)
 */
export function validateCustomerEmail(email: string): void {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('INVALID_CUSTOMER_EMAIL: Email must contain "@" and a valid domain.');
  }

  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('INVALID_CUSTOMER_EMAIL: Email format is invalid.');
  }

  const domain = parts[1].toLowerCase();
  for (const banned of BANNED_TLDS) {
    if (domain === banned.slice(1) || domain.endsWith(banned)) {
      throw new Error(`INVALID_CUSTOMER_EMAIL_TLD: Email domain '${domain}' uses banned TLD '${banned}'. Passkey registration requires a real delegated TLD.`);
    }
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    throw new Error(`INVALID_CUSTOMER_EMAIL_TLD: Email domain '${domain}' does not have a valid TLD extension.`);
  }
}

/**
 * Rule 2: Merchant URL validation.
 * Must be a bare HTTPS origin on a real delegated TLD.
 */
export function validateMerchantUrl(urlStr: string): void {
  if (!urlStr || typeof urlStr !== 'string') {
    throw new Error('INVALID_MERCHANT_URL: Merchant URL is required.');
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`INVALID_MERCHANT_URL: '${urlStr}' is not a valid URL. Must include 'https://' scheme.`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`INVALID_MERCHANT_URL_SCHEME: Merchant URL '${urlStr}' must use 'https:' protocol.`);
  }

  if (parsed.pathname !== '/' || parsed.search !== '' || parsed.hash !== '') {
    throw new Error(`INVALID_MERCHANT_URL_PATH: Merchant URL '${urlStr}' must be a bare origin with no path or query parameters.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  for (const banned of BANNED_TLDS) {
    if (hostname === banned.slice(1) || hostname.endsWith(banned)) {
      throw new Error(`INVALID_MERCHANT_URL_TLD: Merchant URL domain '${hostname}' uses banned TLD '${banned}'.`);
    }
  }

  const hostParts = hostname.split('.');
  if (hostParts.length < 2 || hostParts[hostParts.length - 1].length < 2) {
    throw new Error(`INVALID_MERCHANT_URL_TLD: Merchant URL hostname '${hostname}' does not have a valid delegated TLD.`);
  }
}

/**
 * Rule 5: Get or generate browser_profile_id.
 * Generated once per browser and persisted in localStorage.
 */
export function getDurableBrowserProfileId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'bpid_server_side_fallback';
  }

  let bpid = window.localStorage.getItem('prava_bpid');
  if (!bpid) {
    bpid = `bpid_${crypto.randomUUID()}`;
    window.localStorage.setItem('prava_bpid', bpid);
  }
  return bpid;
}

/**
 * Rule 6: Deterministic Error Classifier.
 * Identifies errors that MUST NOT be auto-retried.
 */
export function isDeterministicPaymentError(errorCodeOrMsg: string): boolean {
  const normalized = (errorCodeOrMsg || '').toUpperCase();
  const deterministicPatterns = [
    'PASSKEY_REG_FAILED',
    'MAXIMUM_BINDINGS_EXCEEDED',
    'CARD_VERIFICATION_FAILED',
    'UNSUPPORTED_BROWSER',
    'INVALID_REQUEST',
    'INVALID_CUSTOMER_EMAIL',
    'INVALID_MERCHANT_URL',
    'BINDING_LIMIT_EXCEEDED',
  ];
  return deterministicPatterns.some((pattern) => normalized.includes(pattern));
}

/**
 * Rule 9: Platform Authenticator (Passkey) Capability Checker.
 */
export async function checkPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // E2E Test Mode Override (for Playwright UI navigation tests only)
  if ((window as any).__E2E_MOCK_PASSKEY__ === true || process.env.NEXT_PUBLIC_E2E_TEST === 'true') {
    return true;
  }

  // Detect Electron or Webview
  const ua = navigator.userAgent || '';
  if (ua.includes('Electron/') || ua.includes('Code/') || ua.includes('; wv')) {
    return false;
  }

  if (typeof window.PublicKeyCredential === 'undefined') {
    return false;
  }

  try {
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Rule 12: Client-side card field validator.
 */
export function validateCardFields(cardholderName: string, pan: string, expiryMonth: string, expiryYear: string, cvv: string): { valid: boolean; error?: string } {
  if (!cardholderName || cardholderName.trim().length < 2 || !/^[a-zA-Z\s.-]+$/.test(cardholderName.trim())) {
    throw new Error('INVALID_CARDHOLDER_NAME: Cardholder name must be non-empty and alphabetic.');
  }

  const cleanPan = pan.replace(/\s+/g, '');
  if (!cleanPan || cleanPan.length < 13 || cleanPan.length > 19 || !/^\d+$/.test(cleanPan)) {
    throw new Error('INVALID_PAN: Card number must be 13-19 digits.');
  }

  const m = parseInt(expiryMonth, 10);
  const y = parseInt(expiryYear, 10);
  if (isNaN(m) || m < 1 || m > 12) {
    throw new Error('INVALID_EXPIRY_MONTH: Expiry month must be between 01 and 12.');
  }
  if (isNaN(y) || y < 2024 || y > 2045) {
    throw new Error('INVALID_EXPIRY_YEAR: Expiry year must be valid.');
  }

  if (!cvv || (cvv.length !== 3 && cvv.length !== 4) || !/^\d+$/.test(cvv)) {
    throw new Error('INVALID_CVV: CVV must be 3 or 4 digits.');
  }

  return { valid: true };
}
