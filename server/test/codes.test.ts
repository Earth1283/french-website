import { describe, expect, it } from 'vitest';
import { generateCode } from '../src/lib/randomCode.js';
import { generateJoinCode } from '../src/lib/joinCode.js';
import { generateRecoveryCode, hashRecoveryCode, verifyRecoveryCode } from '../src/lib/recoveryCode.js';

describe('generated codes', () => {
  it('uses the confusable-free alphabet in groups of four', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateCode(3)).toMatch(/^([ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-){2}[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
    }
  });

  it('gives join codes 2 groups and recovery codes 5', () => {
    expect(generateJoinCode().split('-')).toHaveLength(2);
    expect(generateRecoveryCode().split('-')).toHaveLength(5);
  });

  it('does not repeat across a large sample', () => {
    const seen = new Set(Array.from({ length: 2000 }, () => generateRecoveryCode()));
    expect(seen.size).toBe(2000);
  });
});

describe('recovery code hashing', () => {
  it('verifies the right code and rejects a wrong one', async () => {
    const code = generateRecoveryCode();
    const stored = hashRecoveryCode(code);
    expect(await verifyRecoveryCode(code, stored)).toBe(true);
    expect(await verifyRecoveryCode(generateRecoveryCode(), stored)).toBe(false);
  });
});
