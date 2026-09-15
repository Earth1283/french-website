import { create } from 'zustand';

interface LearnSearchStore {
  open: boolean;
  query: string;
  toggle: () => void;
  setQuery: (query: string) => void;
}

export const useLearnSearch = create<LearnSearchStore>()(set => ({
  open: false,
  query: '',
  toggle: () => set(state => ({ open: !state.open, query: state.open ? '' : state.query })),
  setQuery: query => set({ query }),
}));
