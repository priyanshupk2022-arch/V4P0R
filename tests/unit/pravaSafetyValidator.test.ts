import { describe, it, expect } from 'vitest';
import {
  validateCustomerEmail,
  validateMerchantUrl,
  getDurableBrowserProfileId,
  isDeterministicPaymentError,
  validateCardFields,
  APPROVED_SANDBOX_TEST_CARDS,
  BANNED_TLDS,
} from '../../src/adapters/prava/pravaSafetyValidator';

describe('Prava Safety Contract Rules (13-Rule Addendum)', () => {
  describe('Rule 1: Customer Email Validation', () => {
    it('should pass for valid emails with real delegated TLDs', () => {
      expect(() => validateCustomerEmail('user@acme.com')).not.toThrow();
      expect(() => validateCustomerEmail('demo@example.com')).not.toThrow(); // .com is valid
      expect(() => validateCustomerEmail('cfo@organization.org')).not.toThrow();
    });

    it('should throw explicit error for banned TLDs (.local, .test, .demo, .invalid, etc.)', () => {
      expect(() => validateCustomerEmail('demo@acme.local')).toThrow(/INVALID_CUSTOMER_EMAIL_TLD/);
      expect(() => validateCustomerEmail('owner@sentinel.test')).toThrow(/INVALID_CUSTOMER_EMAIL_TLD/);
      expect(() => validateCustomerEmail('demo@macrostack.demo')).toThrow(/INVALID_CUSTOMER_EMAIL_TLD/);
      expect(() => validateCustomerEmail('dev@localhost')).toThrow(/INVALID_CUSTOMER_EMAIL_TLD/);
      expect(() => validateCustomerEmail('app@service.internal')).toThrow(/INVALID_CUSTOMER_EMAIL_TLD/);
    });
  });

  describe('Rule 2: Merchant URL Validation', () => {
    it('should pass for bare HTTPS origins with real delegated TLDs', () => {
      expect(() => validateMerchantUrl('https://www.acme.com')).not.toThrow();
      expect(() => validateMerchantUrl('https://github.com')).not.toThrow();
      expect(() => validateMerchantUrl('https://datadoghq.com')).not.toThrow();
    });

    it('should throw error for scheme typos, HTTP, subpaths, and banned TLDs', () => {
      expect(() => validateMerchantUrl('htttps://zara.com')).toThrow(/INVALID_MERCHANT_URL/);
      expect(() => validateMerchantUrl('www.acme.com')).toThrow(/INVALID_MERCHANT_URL/);
      expect(() => validateMerchantUrl('http://insecure.com')).toThrow(/INVALID_MERCHANT_URL_SCHEME/);
      expect(() => validateMerchantUrl('https://deathwishcoffee.com/products/grey-tumbler')).toThrow(/INVALID_MERCHANT_URL_PATH/);
      expect(() => validateMerchantUrl('https://www.airshop.demo')).toThrow(/INVALID_MERCHANT_URL_TLD/);
    });
  });

  describe('Rule 3 & 4: Sandbox Test Cards', () => {
    it('should provide multiple approved sandbox test cards with exact published expiry & CVV', () => {
      expect(APPROVED_SANDBOX_TEST_CARDS.length).toBeGreaterThanOrEqual(3);
      for (const card of APPROVED_SANDBOX_TEST_CARDS) {
        expect(card.cardId).toBeDefined();
        expect(card.panLast4.length).toBe(4);
        expect(card.expiryMonth.length).toBe(2);
        expect(card.expiryYear.length).toBe(4);
        expect(card.cvv.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Rule 5: Browser Profile ID Persistence', () => {
    it('should return a stable browser profile ID', () => {
      const id1 = getDurableBrowserProfileId();
      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
    });
  });

  describe('Rule 6: Deterministic Payment Error Detection', () => {
    it('should identify deterministic errors that must NOT be auto-retried', () => {
      expect(isDeterministicPaymentError('PASSKEY_REG_FAILED')).toBe(true);
      expect(isDeterministicPaymentError('MAXIMUM_BINDINGS_EXCEEDED')).toBe(true);
      expect(isDeterministicPaymentError('CARD_VERIFICATION_FAILED')).toBe(true);
      expect(isDeterministicPaymentError('UNSUPPORTED_BROWSER')).toBe(true);
      expect(isDeterministicPaymentError('Transient network timeout')).toBe(false);
    });
  });

  describe('Rule 12: Client-side Card Field Validation', () => {
    it('should validate cardholder name, PAN, expiry, and CVV', () => {
      expect(() => validateCardFields('John Doe', '4000000000002382', '12', '2028', '123')).not.toThrow();
      expect(() => validateCardFields('', '4000000000002382', '12', '2028', '123')).toThrow(/INVALID_CARDHOLDER_NAME/);
      expect(() => validateCardFields('John Doe', '123', '12', '2028', '123')).toThrow(/INVALID_PAN/);
      expect(() => validateCardFields('John Doe', '4000000000002382', '15', '2028', '123')).toThrow(/INVALID_EXPIRY_MONTH/);
      expect(() => validateCardFields('John Doe', '4000000000002382', '12', '2028', '12')).toThrow(/INVALID_CVV/);
    });
  });
});
