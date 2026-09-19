import { randomInt } from 'node:crypto';

// Deliberately excludes visually-confusable characters (0/O, 1/I/L) since
// these codes get read off a screen and typed by hand.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const GROUP_LENGTH = 4;

export function generateCode(groupCount: number): string {
  const groups: string[] = [];
  for (let g = 0; g < groupCount; g++) {
    let group = '';
    for (let i = 0; i < GROUP_LENGTH; i++) {
      group += ALPHABET[randomInt(ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join('-');
}
