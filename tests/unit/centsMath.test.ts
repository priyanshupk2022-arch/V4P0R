import { describe, it, expect } from 'vitest';
import { 
  toCents, 
  toDollars, 
  addCents, 
  subCents, 
  mulCentsBasisPoints,
  InsufficientFundsError 
} from '../../src/domain/budget/centsMath';

describe('centsMath', () => {
  describe('toCents', () => {
    it('converts dollar amounts to integer cents', () => {
      expect(toCents(10.50)).toBe(1050n);
      expect(toCents(0.99)).toBe(99n);
      expect(toCents(100)).toBe(10000n);
      expect(toCents("49.99")).toBe(4999n);
      expect(toCents("0.05")).toBe(5n);
    });

    it('throws error for inputs with more than two decimal places', () => {
      expect(() => toCents(10.501)).toThrow("Fractional cent loss");
      expect(() => toCents("10.501")).toThrow("Fractional cent loss");
    });
    
    it('throws error for NaN or malformed inputs', () => {
      expect(() => toCents(NaN)).toThrow("Invalid input");
      expect(() => toCents("abc")).toThrow("Invalid input");
    });
  });

  describe('toDollars', () => {
    it('formats integer cents to dollar string', () => {
      expect(toDollars(1050n)).toBe("10.50");
      expect(toDollars(99n)).toBe("0.99");
      expect(toDollars(0n)).toBe("0.00");
      expect(toDollars(10000n)).toBe("100.00");
      expect(toDollars(-1050n)).toBe("-10.50");
    });
  });

  describe('addCents', () => {
    it('adds two BigInt cent amounts correctly', () => {
      expect(addCents(100n, 200n)).toBe(300n);
      expect(addCents(100n, -50n)).toBe(50n);
    });
  });

  describe('subCents', () => {
    it('subtracts two BigInt cent amounts correctly', () => {
      expect(subCents(500n, 200n)).toBe(300n);
    });

    it('throws InsufficientFundsError if result is negative', () => {
      expect(() => subCents(200n, 500n)).toThrow(InsufficientFundsError);
    });
  });

  describe('mulCentsBasisPoints', () => {
    it('calculates percentage in basis points', () => {
      // 10000 cents ($100), 500 basis points (5%) -> 500 cents ($5)
      expect(mulCentsBasisPoints(10000n, 500n)).toBe(500n);
      
      // 5000 cents ($50), 200 basis points (2%) -> 100 cents ($1)
      expect(mulCentsBasisPoints(5000n, 200n)).toBe(100n);
    });
  });
});
