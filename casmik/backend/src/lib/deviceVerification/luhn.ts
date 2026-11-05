import crypto from 'crypto';

/**
 * Validates IMEI format and Luhn checksum.
 * An IMEI must be exactly 15 numeric digits and pass Luhn algorithm (mod 10).
 */
export function isValidLuhn(imei: string): boolean {
  if (!imei) return false;
  const clean = imei.trim().replace(/\D/g, '');
  if (clean.length !== 15) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(clean.charAt(i), 10);
    // Double every second digit starting from the second digit (0-indexed: index 1, 3, 5, 7, 9, 11, 13)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Calculates the Luhn check digit (15th digit) for a 14-digit IMEI prefix.
 */
export function calculateLuhnCheckDigit(prefix14: string): number {
  const clean = prefix14.trim().replace(/\D/g, '').slice(0, 14);
  if (clean.length !== 14) return 0;

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(clean.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Formats a 15-digit IMEI to the masked format requested:
 * 35******12345
 */
export function maskIMEI(imei: string): string {
  const clean = (imei || '').trim().replace(/\D/g, '');
  if (clean.length < 7) {
    return clean ? `${clean.slice(0, 2)}******` : '35******00000';
  }
  const first = clean.slice(0, 2);
  const last = clean.slice(-5);
  return `${first}******${last}`;
}

/**
 * Extracts Type Allocation Code (TAC) from a 15-digit IMEI (first 8 digits).
 */
export function extractTAC(imei: string): string {
  const clean = (imei || '').trim().replace(/\D/g, '');
  return clean.slice(0, 8);
}

/**
 * Generates unique verification ID: CAM-IMEI-XXXXXXXX
 */
export function generateVerificationId(): string {
  const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CAM-IMEI-${randomBytes}`;
}

/**
 * Generates unique, cryptographically secure session ID.
 */
export function generateSessionId(): string {
  return `ses_${crypto.randomBytes(16).toString('hex')}`;
}
