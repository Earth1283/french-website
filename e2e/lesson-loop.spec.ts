import { expect, test } from '@playwright/test';

test('a missed exercise pauses on its explanation and comes back before the lesson ends', async ({ page }) => {
  await page.goto('/#/unit/food/lesson/food-1');
  await page.getByRole('button', { name: 'Skip straight to practice' }).click();
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');

  await page.getByRole('button', { name: /^\d Je voudrais un Starbucks$/ }).click();
  await expect(page.getByText('Un café is an espresso in France', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  const field = page.getByRole('textbox');
  const answer = async (text: string) => {
    await field.fill(text);
    await field.press('Enter');
  };
  await answer("L'addition, s'il vous plaît");
  await page.getByRole('button', { name: /^\d La carte, s'il vous plaît$/ }).click();
  await answer('lait');
  await answer('délicieux');
  await answer("Un croissant, s'il vous plaît");

  await expect(page.getByText(/Second look · 1 of 1/)).toBeVisible();
  await page.getByRole('button', { name: /^\d Un café, s'il vous plaît$/ }).click();

  await expect(page.getByText('5 of 6 right first time')).toBeVisible();
  await expect(page.getByText('You can now say')).toBeVisible();
});
