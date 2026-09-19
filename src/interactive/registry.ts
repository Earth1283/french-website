import type { InteractiveLesson } from './types';

const LOADERS: Record<string, () => Promise<InteractiveLesson>> = {
  'building-blocks-4': () => import('./lessons/sentence-structures/preA1').then(m => m.preA1SentenceStructures),
  'pronouns-4': () => import('./lessons/sentence-structures/a2').then(m => m.a2SentenceStructures),
};

export const INTERACTIVE_LESSON_IDS = Object.keys(LOADERS);

export function hasInteractive(lessonId: string): boolean {
  return lessonId in LOADERS;
}

export function loadInteractive(lessonId: string): Promise<InteractiveLesson> {
  const load = LOADERS[lessonId];
  if (!load) return Promise.reject(new Error(`No interactive lesson for "${lessonId}"`));
  return load();
}
