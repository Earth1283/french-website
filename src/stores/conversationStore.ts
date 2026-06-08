import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '../types';

interface ConversationStore {
  geminiApiKey: string;
  difficulty: Difficulty;
  setApiKey: (key: string) => void;
  setDifficulty: (d: Difficulty) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      geminiApiKey: '',
      difficulty: 1,
      setApiKey: (key) => set({ geminiApiKey: key }),
      setDifficulty: (d) => set({ difficulty: d }),
    }),
    { name: 'french-conversation' }
  )
);
