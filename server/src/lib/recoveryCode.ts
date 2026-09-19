import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcrypt';
import { generateCode } from './randomCode.js';

// 5 groups is ~100 bits of entropy since this is a password-reset secret,
// not a shareable classroom code.
export function generateRecoveryCode(): string {
  return generateCode(5);
}

const SHA256_PREFIX = 'sha256:';

// A recovery code carries far more entropy than any password, so a slow
// password hash buys nothing — a plain digest is enough and keeps
// registration and reset from paying for an extra bcrypt round.
export function hashRecoveryCode(code: string): string {
  return SHA256_PREFIX + createHash('sha256').update(code).digest('hex');
}

// Hashes issued before the switch to sha256 are still bcrypt; they stay
// valid until the code is used or regenerated, which replaces them.
export async function verifyRecoveryCode(code: string, stored: string): Promise<boolean> {
  if (!stored.startsWith(SHA256_PREFIX)) return bcrypt.compare(code, stored);
  const expected = Buffer.from(stored);
  const actual = Buffer.from(hashRecoveryCode(code));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
