import type { Sentence, Token } from './types';

export function englishOrder(s: Sentence): Token[] {
  return resolve(s, s.en ?? s.tokens.filter(t => t.en).map(t => t.id));
}

export function frenchOrder(s: Sentence): Token[] {
  return resolve(s, s.fr ?? s.tokens.filter(t => t.fr).map(t => t.id));
}

export function englishText(s: Sentence): string {
  return englishOrder(s).map(t => t.en).join(' ');
}

export function groupOf(t: Token): string {
  return t.group ?? t.id;
}

function resolve(s: Sentence, ids: string[]): Token[] {
  const byId = new Map(s.tokens.map(t => [t.id, t]));
  return ids.map(id => {
    const token = byId.get(id);
    if (!token) throw new Error(`Unknown token id "${id}"`);
    return token;
  });
}
