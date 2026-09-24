import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressState, Unit } from '../types';
import { UNITS, A1_UNIT_IDS } from '../data/units';
import { defaultCard, updateCard } from '../utils/srs';
import { buildReviewSession } from '../utils/reviewQueue';
import { computeNewStreak, todayString } from '../utils/streak';
import { useLearnerStore } from './learnerStore';

interface ProgressStore extends ProgressState {
  completeLesson: (lessonId: string, xpEarned: number) => void;
  earnBadge: (badgeId: string) => void;
  setDarkMode: (value: boolean) => void;
  setUnit12Mode: (mode: 'full-freedom' | 'earned-reward') => void;
  setOnboardingDone: () => void;
  setAccentColor: (color: string) => void;
  setAppleMode: (value: boolean) => void;
  setReducedGpu: (value: boolean) => void;
  addXP: (amount: number) => void;
  setXP: (value: number) => void;
  setStreak: (value: number) => void;
  resetProgress: () => void;
  resetOnboarding: () => void;
  toggleBookmark: (lessonId: string) => void;
  updateSRS: (key: string, correct: boolean) => void;
  getDueReviewCount: () => number;
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
  'certified-parisien': { id: 'certified-parisien', name: 'Certified Parisien', emoji: '🗼', description: 'Complete every Pre-A1 to A2 unit' },
  'bridge-builder': { id: 'bridge-builder', name: 'Bridge Builder', emoji: '🌉', description: 'Complete all A2→B1 bridge units' },
  'independent-user': { id: 'independent-user', name: 'Independent User', emoji: '🗣️', description: 'Complete all B1 units' },
  'confident-user': { id: 'confident-user', name: 'Confident User', emoji: '🎩', description: 'Complete all B2 units' },
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
      reducedGpu: false,
      bookmarkedLessons: [],
      srsData: {},

      completeLesson: (lessonId, xpEarned) => {
        const state = get();
        if (state.completedLessons.includes(lessonId)) return;

        const today = todayString();
        const newStreak = computeNewStreak(state.lastStudiedDate, state.streak);

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
        const completesTier = (inTier: (u: Unit) => boolean) =>
          UNITS.filter(inTier).every(u => completedUnitIds.includes(u.id));
        if (completesTier(u => !u.isBridge && !u.isB1 && !u.isB2)) addBadge('certified-parisien');
        if (completesTier(u => !!u.isBridge)) addBadge('bridge-builder');
        if (completesTier(u => !!u.isB1)) addBadge('independent-user');
        if (completesTier(u => !!u.isB2)) addBadge('confident-user');

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

      setReducedGpu: (value) => set({ reducedGpu: value }),

      addXP: (amount) => {
        const s = get();
        set({
          xp: s.xp + amount,
          streak: computeNewStreak(s.lastStudiedDate, s.streak),
          lastStudiedDate: todayString(),
        });
      },

      setXP: (value) => set({ xp: value }),

      setStreak: (value) => set({ streak: value }),

      resetOnboarding: () => set({ onboardingDone: false }),

      resetProgress: () => {
        useLearnerStore.getState().resetExerciseStats();
        set({
          completedLessons: [],
          xp: 0,
          streak: 0,
          lastStudiedDate: '',
          earnedBadges: [],
          srsData: {},
        });
      },

      toggleBookmark: (lessonId) => set(s => ({
        bookmarkedLessons: s.bookmarkedLessons.includes(lessonId)
          ? s.bookmarkedLessons.filter(id => id !== lessonId)
          : [...s.bookmarkedLessons, lessonId],
      })),

      updateSRS: (key, correct) => {
        const s = get();
        const existing = s.srsData[key] ?? defaultCard();
        set({ srsData: { ...s.srsData, [key]: updateCard(existing, correct) } });
      },

      getDueReviewCount: () => {
        const s = get();
        return buildReviewSession(s.completedLessons, s.srsData).items.length;
      },

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
