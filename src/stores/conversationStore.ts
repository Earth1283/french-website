import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConversationRecord, Difficulty } from '../types';

// Debriefs are small, but keep the list bounded.
const MAX_HISTORY = 100;

interface ConversationStore {
  geminiApiKey: string;
  difficulty: Difficulty;
  history: ConversationRecord[];
  setApiKey: (key: string) => void;
  setDifficulty: (d: Difficulty) => void;
  addRecord: (record: ConversationRecord) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      geminiApiKey: '',
      difficulty: 1,
      history: [],
      setApiKey: (key) => set({ geminiApiKey: key }),
      setDifficulty: (d) => set({ difficulty: d }),
      addRecord: (record) => set(s => ({ history: [...s.history, record].slice(-MAX_HISTORY) })),
    }),
    { name: 'french-conversation' }
  )
);
