import type { Mistake } from '../types/notebook';

/** Keep imported backups from introducing unusable entries or external source links. */
export function isMistake(value: unknown): value is Mistake {
  if (!value || typeof value !== 'object') return false;
  const m = value as Mistake;
  return ['lesson', 'conversation', 'writing', 'reading'].includes(m.source)
    && ['id', 'sourceTitle', 'prompt', 'original', 'corrected', 'explanation', 'firstSeen', 'lastSeen'].every(key => typeof (m as unknown as Record<string, unknown>)[key] === 'string')
    && !!m.id && typeof m.sourceHref === 'string' && /^\/(unit\/|exam\/|converse$)/.test(m.sourceHref)
    && typeof m.resolved === 'boolean' && typeof m.inReview === 'boolean'
    && [m.occurrences, m.practiceAttempts, m.practiceCorrect].every(n => Number.isFinite(n) && n >= 0)
    && (m.context === undefined || typeof m.context === 'string')
    && !!m.exercise && ['multiple-choice', 'fill-blank', 'translation'].includes(m.exercise.type)
    && (m.exercise.explanation === undefined || typeof m.exercise.explanation === 'string')
    && (m.exercise.hint === undefined || typeof m.exercise.hint === 'string')
    && typeof m.exercise.prompt === 'string' && typeof m.exercise.answer === 'string'
    && (m.exercise.type !== 'multiple-choice' || (Array.isArray(m.exercise.options) && m.exercise.options.every(o => typeof o === 'string') && m.exercise.options.includes(m.exercise.answer)));
}
