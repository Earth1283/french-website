import type { Page } from '@playwright/test';

export const FROZEN_TIME = new Date('2026-09-15T19:07:00');

const COMPLETED = [
  'pronunciation-1', 'pronunciation-2', 'pronunciation-3',
  'building-blocks-1', 'building-blocks-2', 'building-blocks-3',
  'emergency-1', 'emergency-2',
  'food-1',
  'medical-1',
];

export type Theme = 'light' | 'dark';

export async function seedLearner(page: Page, theme: Theme) {
  await page.clock.install({ time: FROZEN_TIME });
  await page.addInitScript(
    ({ completed, dark }) => {
      localStorage.setItem(
        'french-progress',
        JSON.stringify({
          version: 1,
          state: {
            completedLessons: completed,
            xp: 240,
            streak: 12,
            lastStudiedDate: '2026-09-15',
            earnedBadges: ['polyglot-apprentice'],
            darkMode: dark,
            unit12Mode: 'earned-reward',
            onboardingDone: true,
            bookmarkedLessons: [],
            srsData: {},
          },
        }),
      );
    },
    { completed: COMPLETED, dark: theme === 'dark' },
  );
}

export async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}
