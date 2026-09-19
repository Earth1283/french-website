import type { Role } from './types';

export const ROLES: Record<Role, { label: string; hint: string }> = {
  subject: { label: 'Subject', hint: 'Who is doing it.' },
  verb: { label: 'Verb', hint: 'The action, or a helper like avoir / être.' },
  object: { label: 'Object', hint: 'Who or what the action lands on.' },
  adjective: { label: 'Adjective', hint: 'Describes a noun.' },
  negation: { label: 'Negation', hint: 'Turns the sentence into a "not".' },
  adverb: { label: 'Adverb', hint: 'How, when or how often.' },
  noun: { label: 'Noun', hint: 'A thing, person or place.' },
  article: { label: 'Article', hint: 'a / an / the — matches the noun\'s gender.' },
};

export function roleColor(role: Role): string {
  return `var(--role-${role})`;
}
