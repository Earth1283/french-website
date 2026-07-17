import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestResult } from '../types';

interface TestStore {
  history: TestResult[];
  addResult: (result: TestResult) => void;
  clearHistory: () => void;
  latestResult: () => TestResult | undefined;
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      history: [],

      addResult: (result) => {
        set(s => ({ history: [...s.history, result] }));
      },

      clearHistory: () => set({ history: [] }),

      latestResult: () => {
        const { history } = get();
        return history.length > 0 ? history[history.length - 1] : undefined;
      },
    }),
    {
      name: 'french-adaptive-test',
    }
  )
);
