/** Canonical form for comparing typed answers. Keeps accents, since they carry meaning in French. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[‘’`]/g, "'")
    .replace(/[?!.,;:«»“”"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}
