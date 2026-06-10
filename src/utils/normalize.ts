export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/['''`]/g, "'")
    .replace(/[?!.,;:«»""]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
