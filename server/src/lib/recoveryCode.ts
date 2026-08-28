// Same unambiguous alphabet as join codes, but 5 groups instead of 2 (~100
// bits of entropy) since this is a password-reset secret, not a shareable
// classroom code.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRecoveryCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < 5; g++) {
    let group = '';
    for (let i = 0; i < 4; i++) {
      group += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join('-');
}
