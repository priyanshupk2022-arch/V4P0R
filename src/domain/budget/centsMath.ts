export class InsufficientFundsError extends Error {
  constructor(message = "Insufficient funds") {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export function toCents(dollars: number | string): bigint {
  if (typeof dollars === 'number') {
    if (isNaN(dollars)) {
      throw new Error("Invalid input: dollars must be a valid number");
    }
    dollars = dollars.toString();
  }

  if (typeof dollars !== 'string') {
    throw new Error("Invalid input: dollars must be a number or string");
  }

  const trimmed = dollars.trim();
  if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Invalid input: malformed numeric string");
  }

  const isNegative = trimmed.startsWith('-');
  const cleanStr = isNegative ? trimmed.slice(1) : trimmed;
  const parts = cleanStr.split('.');
  const whole = parts[0];
  const decimal = parts[1] || '';

  if (decimal.length > 2) {
    throw new Error("Fractional cent loss: input has more than two decimal places");
  }

  const paddedDecimal = decimal.padEnd(2, '0');
  const centsValue = BigInt(whole) * 100n + BigInt(paddedDecimal);

  return isNegative ? -centsValue : centsValue;
}

export function toDollars(cents: bigint): string {
  const isNegative = cents < 0n;
  const absCents = isNegative ? -cents : cents;
  const dollarsPart = absCents / 100n;
  const centsPart = absCents % 100n;
  const centsStr = centsPart.toString().padStart(2, '0');
  
  const sign = isNegative ? "-" : "";
  return `${sign}${dollarsPart}.${centsStr}`;
}

export function addCents(a: bigint, b: bigint): bigint {
  return a + b;
}

export function subCents(a: bigint, b: bigint): bigint {
  const result = a - b;
  if (result < 0n) {
    throw new InsufficientFundsError();
  }
  return result;
}

export function mulCentsBasisPoints(cents: bigint, basisPoints: bigint): bigint {
  // 1 basis point is 0.01%, so 10000 basis points is 100%
  return (cents * basisPoints) / 10000n;
}
