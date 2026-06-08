import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressState } from '../types';
import { UNITS, A1_UNIT_IDS } from '../data/units';

interface ProgressStore extends ProgressState {
  completeLesson: (lessonId: string, xpEarned: number) => void;
  earnBadge: (badgeId: string) => void;
  setDarkMode: (value: boolean) => void;
  setUnit12Mode: (mode: 'full-freedom' | 'earned-reward') => void;
  setOnboardingDone: () => void;
  setAccentColor: (color: string) => void;
  setAppleMode: (value: boolean) => void;
  setXP: (value: number) => void;
  setStreak: (value: number) => void;
  resetProgress: () => void;
  resetOnboarding: () => void;
  getLessonProgress: (unitSlug: string) => number;
  isUnit12Unlocked: () => boolean;
  isA1Complete: () => boolean;
  getCompletedUnits: () => number;
  getTotalXP: () => number;
}

const BADGES: Record<string, { id: string; name: string; emoji: string; description: string }> = {
  'croissant-rookie': { id: 'croissant-rookie', name: 'Croissant Rookie', emoji: '🥐', description: 'Complete the Food unit' },
  'direction-seeker': { id: 'direction-seeker', name: 'Direction Seeker', emoji: '🗺️', description: 'Complete the Directions unit' },
  'false-friend-spotter': { id: 'false-friend-spotter', name: 'False Friend Spotter', emoji: '🪤', description: 'Complete the False Friends unit' },
  'first-aid': { id: 'first-aid', name: 'First Aid', emoji: '🏥', description: 'Complete the Medical unit' },
  'polyglot-apprentice': { id: 'polyglot-apprentice', name: 'Polyglot Apprentice', emoji: '📚', description: 'Complete any 5 units' },
  'a1-certified': { id: 'a1-certified', name: 'A1 Certified', emoji: '🎓', description: 'Complete all A1 curriculum units' },
  'certified-parisien': { id: 'certified-parisien', name: 'Certified Parisien', emoji: '🗼', description: 'Complete all 12 units' },
};

export { BADGES };

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      xp: 0,
      streak: 0,
      lastStudiedDate: '',
      earnedBadges: [],
      darkMode: false,
      unit12Mode: null,
      onboardingDone: false,
      accentColor: '#E63946',
      appleMode: false,

      completeLesson: (lessonId, xpEarned) => {
        const state = get();
        if (state.completedLessons.includes(lessonId)) return;

        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = state.lastStudiedDate === yesterday ? state.streak + 1
          : state.lastStudiedDate === today ? state.streak
          : 1;

        const newCompleted = [...state.completedLessons, lessonId];
        const newXP = state.xp + xpEarned;

        const newBadges = [...state.earnedBadges];
        const addBadge = (id: string) => { if (!newBadges.includes(id)) newBadges.push(id); };

        // Check unit completion badges
        const completedUnitIds = UNITS.filter(u =>
          u.lessons.every(l => newCompleted.includes(l.id))
        ).map(u => u.id);

        if (completedUnitIds.includes('food')) addBadge('croissant-rookie');
        if (completedUnitIds.includes('directions')) addBadge('direction-seeker');
        if (completedUnitIds.includes('false-friends')) addBadge('false-friend-spotter');
        if (completedUnitIds.includes('medical')) addBadge('first-aid');
        if (completedUnitIds.length >= 5) addBadge('polyglot-apprentice');
        if (UNITS.length === completedUnitIds.length) addBadge('certified-parisien');

        const a1Done = A1_UNIT_IDS.every(uid => completedUnitIds.includes(uid));
        if (a1Done) addBadge('a1-certified');

        set({
          completedLessons: newCompleted,
          xp: newXP,
          streak: newStreak,
          lastStudiedDate: today,
          earnedBadges: newBadges,
        });
      },

      earnBadge: (badgeId) => {
        set(s => ({
          earnedBadges: s.earnedBadges.includes(badgeId) ? s.earnedBadges : [...s.earnedBadges, badgeId],
        }));
      },

      setDarkMode: (value) => set({ darkMode: value }),

      setUnit12Mode: (mode) => set({ unit12Mode: mode }),

      setOnboardingDone: () => set({ onboardingDone: true }),

      setAccentColor: (color) => set({ accentColor: color }),

      setAppleMode: (value) => set({ appleMode: value }),

      setXP: (value) => set({ xp: value }),

      setStreak: (value) => set({ streak: value }),

      resetOnboarding: () => set({ onboardingDone: false }),

      resetProgress: () => set({
        completedLessons: [],
        xp: 0,
        streak: 0,
        lastStudiedDate: '',
        earnedBadges: [],
      }),

      getLessonProgress: (unitSlug) => {
        const state = get();
        const unit = UNITS.find(u => u.slug === unitSlug);
        if (!unit) return 0;
        const done = unit.lessons.filter(l => state.completedLessons.includes(l.id)).length;
        return Math.round((done / unit.lessons.length) * 100);
      },

      isUnit12Unlocked: () => {
        const state = get();
        if (state.unit12Mode === 'full-freedom') return true;
        const completedUnits = UNITS.filter(u =>
          u.id !== 'slang' && u.lessons.every(l => state.completedLessons.includes(l.id))
        );
        return completedUnits.length >= 2;
      },

      isA1Complete: () => {
        const state = get();
        return A1_UNIT_IDS.every(uid => {
          const unit = UNITS.find(u => u.id === uid);
          return unit ? unit.lessons.every(l => state.completedLessons.includes(l.id)) : false;
        });
      },

      getCompletedUnits: () => {
        const state = get();
        return UNITS.filter(u => u.lessons.every(l => state.completedLessons.includes(l.id))).length;
      },

      getTotalXP: () => get().xp,
    }),
    {
      name: 'french-progress',
    }
  )
);
