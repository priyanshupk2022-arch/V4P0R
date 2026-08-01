export class InsufficientFundsError extends Error {
  constructor(message = "Insufficient funds") {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export function toCents(dollars: number): bigint {
  if (typeof dollars !== 'number' || isNaN(dollars)) {
    throw new Error("Invalid input: dollars must be a number");
  }
  
  // To avoid floating point precision issues, check if it has more than 2 decimal places.
  const dollarsStr = dollars.toString();
  const decimalIndex = dollarsStr.indexOf('.');
  if (decimalIndex !== -1 && dollarsStr.length - decimalIndex - 1 > 2) {
    throw new Error("Fractional cent loss: input has more than two decimal places");
  }

  // Safely convert by multiplying by 100 and rounding, then to BigInt
  const centsFloat = Math.round(dollars * 100);
  return BigInt(centsFloat);
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
