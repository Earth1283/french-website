import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mistake, MistakeInput, MistakeSource } from '../types/notebook';
import type { WritingCorrection } from '../types/exam';

interface NotebookStore {
  mistakes: Mistake[];
  historyImported: boolean;
  recordMistake: (input: MistakeInput) => void;
  setResolved: (id: string, resolved: boolean) => void;
  setInReview: (id: string, inReview: boolean) => void;
  recordPractice: (id: string, correct: boolean) => void;
  finishHistoryImport: () => void;
  reset: () => void;
}

export const useNotebookStore = create<NotebookStore>()(
  persist((set) => ({
    mistakes: [],
    historyImported: false,
    recordMistake: (input) => set(s => {
      const now = new Date().toISOString();
      const previous = s.mistakes.find(m => m.id === input.id);
      const entry: Mistake = previous
        ? { ...previous, ...input, lastSeen: now, occurrences: previous.occurrences + 1, resolved: false }
        : { ...input, firstSeen: now, lastSeen: now, occurrences: 1, resolved: false, inReview: false, practiceAttempts: 0, practiceCorrect: 0 };
      return { mistakes: [entry, ...s.mistakes.filter(m => m.id !== input.id)] };
    }),
    setResolved: (id, resolved) => set(s => ({ mistakes: s.mistakes.map(m => m.id === id ? { ...m, resolved } : m) })),
    setInReview: (id, inReview) => set(s => ({ mistakes: s.mistakes.map(m => m.id === id ? { ...m, inReview } : m) })),
    recordPractice: (id, correct) => set(s => ({ mistakes: s.mistakes.map(m => m.id === id
      ? { ...m, practiceAttempts: m.practiceAttempts + 1, practiceCorrect: m.practiceCorrect + (correct ? 1 : 0) }
      : m) })),
    finishHistoryImport: () => set({ historyImported: true }),
    reset: () => set({ mistakes: [], historyImported: true }),
  }), { name: 'french-notebook' }),
);

export function captureCorrections(
  source: Extract<MistakeSource, 'conversation' | 'writing'>,
  sourceId: string,
  corrections: WritingCorrection[] = [],
  onlyMissing = false,
) {
  for (const c of corrections) {
    if (!c.original.trim() || !c.corrected.trim() || c.original === c.corrected) continue;
    const id = `${source}:${sourceId}:${c.original}:${c.corrected}`;
    if (onlyMissing && useNotebookStore.getState().mistakes.some(m => m.id === id)) continue;
    useNotebookStore.getState().recordMistake({
      id,
      source,
      sourceTitle: source === 'writing' ? 'DELF writing' : 'Conversation',
      sourceHref: source === 'writing' ? `/exam/writing/${sourceId}` : '/converse',
      prompt: `Correct this French: ${c.original}`,
      original: c.original,
      corrected: c.corrected,
      explanation: c.explanation,
      exercise: { type: 'translation', prompt: `Correct this French: ${c.original}`, answer: c.corrected, explanation: c.explanation },
    });
  }
}
