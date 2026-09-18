import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExerciseStat, LearnerProfile } from '../types';
import { exerciseKey } from '../utils/mastery';

interface LearnerStore {
  profile: LearnerProfile | null;
  personalizePromptDismissed: boolean;
  exerciseStats: Record<string, ExerciseStat>;
  setProfile: (profile: LearnerProfile) => void;
  clearProfile: () => void;
  dismissPersonalizePrompt: () => void;
  recordExercise: (lessonId: string, exerciseIndex: number, correct: boolean) => void;
  resetExerciseStats: () => void;
}

export const useLearnerStore = create<LearnerStore>()(
  persist(
    (set) => ({
      profile: null,
      personalizePromptDismissed: false,
      exerciseStats: {},

      setProfile: (profile) => set({ profile }),

      clearProfile: () => set({ profile: null }),

      dismissPersonalizePrompt: () => set({ personalizePromptDismissed: true }),

      recordExercise: (lessonId, exerciseIndex, correct) => set(s => {
        const key = exerciseKey(lessonId, exerciseIndex);
        const prev = s.exerciseStats[key] ?? { attempts: 0, correct: 0, lastCorrect: false };
        return {
          exerciseStats: {
            ...s.exerciseStats,
            [key]: {
              attempts: prev.attempts + 1,
              correct: prev.correct + (correct ? 1 : 0),
              lastCorrect: correct,
            },
          },
        };
      }),

      resetExerciseStats: () => set({ exerciseStats: {} }),
    }),
    { name: 'french-learner' }
  )
);
