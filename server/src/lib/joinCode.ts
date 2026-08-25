// Deliberately excludes visually-confusable characters (0/O, 1/I/L) since
// this code gets read off a screen and typed by hand by students.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateJoinCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < 2; g++) {
    let group = '';
    for (let i = 0; i < 4; i++) {
      group += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join('-');
}
