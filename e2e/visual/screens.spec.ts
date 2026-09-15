import { test } from '@playwright/test';
import { seedLearner, settle } from './fixtures';
import type { Theme } from './fixtures';

const SCREENS = [
  { name: 'landing', path: '/#/' },
  { name: 'learn', path: '/#/learn' },
  { name: 'unit', path: '/#/unit/food' },
  { name: 'lesson', path: '/#/unit/food/lesson/food-2' },
  { name: 'practice', path: '/#/practice' },
];

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
];

const THEMES: Theme[] = ['light', 'dark'];

for (const theme of THEMES) {
  for (const viewport of VIEWPORTS) {
    test.describe(`${theme} ${viewport.width}px`, () => {
      test.use({ viewport });

      for (const screen of SCREENS) {
        test(screen.name, async ({ page }, testInfo) => {
          await seedLearner(page, theme);
          await page.goto(screen.path);
          await settle(page);
          await page.screenshot({
            path: testInfo.outputPath(`${screen.name}-${theme}-${viewport.width}.png`),
            fullPage: true,
            animations: 'disabled',
          });
        });
      }
    });
  }
}
