import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(() => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) } });
});
import { captureCorrections, useNotebookStore } from './notebookStore';
import { useExamStore } from './examStore';
import { useConversationStore } from './conversationStore';
import { buildReviewSession } from '../utils/reviewQueue';
import { defaultCard, updateCard } from '../utils/srs';
import { todayString } from '../utils/streak';
import { isMistake } from '../utils/notebook';
import { READING_DOCS } from '../data/exam/reading';
import { buildEvaluation } from '../data/exam/rubric';
import type { MistakeInput } from '../types/notebook';

const entry: MistakeInput = { id: 'lesson:age:0', source: 'lesson', sourceTitle: 'Age', sourceHref: '/unit/identity/lesson/age', prompt: 'I am twenty.', original: 'Je suis vingt ans', corrected: "J’ai vingt ans", explanation: 'Age uses avoir.', exercise: { type: 'translation', prompt: 'I am twenty.', answer: "J’ai vingt ans" } };
const correction = { original: 'je suis vingt ans', corrected: "j’ai vingt ans", explanation: 'Use avoir.' };

beforeEach(() => { useNotebookStore.getState().reset(); useExamStore.getState().clearHistory(); useConversationStore.setState({ history: [] }); });

describe('mistakes notebook', () => {
  it('deduplicates repeated misses, preserves review state, and reopens resolved entries', () => {
    const store = useNotebookStore.getState();
    store.recordMistake(entry);
    store.setInReview(entry.id, true);
    store.recordPractice(entry.id, true);
    store.setResolved(entry.id, true);
    store.recordMistake({ ...entry, original: 'Je suis 20 ans' });
    const [saved] = useNotebookStore.getState().mistakes;
    expect(useNotebookStore.getState().mistakes).toHaveLength(1);
    expect(saved).toMatchObject({ occurrences: 2, resolved: false, inReview: true, practiceAttempts: 1, practiceCorrect: 1, original: 'Je suis 20 ans' });
    expect(isMistake(saved)).toBe(true);
    expect(isMistake({ ...saved, sourceHref: 'javascript:alert(1)' })).toBe(false);
  });

  it('captures conversation corrections and imports historical ones without double counting', () => {
    useConversationStore.getState().addRecord({ id: 'one', scenarioId: 'cafe', date: todayString(), exchanges: 1, missionComplete: false, debrief: { source: 'ai', summary: '', strengths: [], corrections: [correction], phrases: [] } });
    captureCorrections('conversation', 'cafe', [correction], true);
    expect(useNotebookStore.getState().mistakes).toHaveLength(1);
    expect(useNotebookStore.getState().mistakes[0]).toMatchObject({ source: 'conversation', occurrences: 1 });
  });

  it('captures writing feedback both when marked later and when a mock saves an evaluated text', () => {
    const evaluation = buildEvaluation('a1', 'ai', {}, 45, 40, { comments: {}, corrections: [correction] });
    const submission = { id: 'one', taskId: 'task', date: todayString(), text: 'essay', wordCount: 45, secondsSpent: 10, evaluation: null };
    useExamStore.getState().addWritingSubmission(submission);
    expect(useNotebookStore.getState().mistakes).toHaveLength(0);
    useExamStore.getState().setEvaluation('one', evaluation);
    useExamStore.getState().addWritingSubmission({ ...submission, id: 'two', evaluation });
    expect(useNotebookStore.getState().mistakes[0]).toMatchObject({ source: 'writing', occurrences: 2 });
  });

  it('records only missed reading answers, including passage context for later practice', () => {
    const doc = READING_DOCS[0];
    const answers = doc.questions.map(q => q.answer);
    answers[0] = 'wrong';
    useExamStore.getState().addReadingResult({ id: 'attempt', docId: doc.id, date: todayString(), mode: 'exam', correct: answers.length - 1, total: answers.length, answers });
    const mistakes = useNotebookStore.getState().mistakes;
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0]).toMatchObject({ source: 'reading', original: 'wrong', corrected: doc.questions[0].answer, context: doc.passage });
  });

  it('adds only opted-in, unresolved entries to spaced review even without completed lessons', () => {
    const store = useNotebookStore.getState();
    store.recordMistake(entry);
    expect(buildReviewSession([], {}).items).toHaveLength(0);
    store.setInReview(entry.id, true);
    const mistakes = useNotebookStore.getState().mistakes;
    const queue = buildReviewSession([], {}, todayString(), mistakes);
    expect(queue.items).toHaveLength(1);
    expect(queue.items[0]).toMatchObject({ mistakeId: entry.id, produce: true });
    const scheduled = { [queue.items[0].key]: updateCard(defaultCard(), true) };
    expect(buildReviewSession([], scheduled, todayString(), mistakes).items).toHaveLength(0);
    store.setResolved(entry.id, true);
    expect(buildReviewSession([], {}, todayString(), useNotebookStore.getState().mistakes).items).toHaveLength(0);
  });
});
