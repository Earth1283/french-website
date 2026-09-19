import { expect, test } from '@playwright/test';

test('interactive lesson: morph a sentence, solve the check, reach flashcards', async ({ page }) => {
  await page.goto('/#/unit/building-blocks/lesson/building-blocks-4');
  await page.getByRole('button', { name: 'Explore Interactively' }).click();

  await expect(page.getByRole('heading', { name: 'Good news: it lines up' })).toBeVisible();
  await page.getByRole('button', { name: 'Make it French' }).click();
  await expect(page.getByText('Word by word')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Solve to continue' })).toBeDisabled();
  const pool = page.getByTestId('tile-pool');
  for (const word of ['Tu', 'aimes', 'le', 'chat']) {
    await pool.getByRole('button', { name: word, exact: true }).click();
  }
  await expect(page.getByText('Parfait')).toBeVisible();

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Colors come after the noun' })).toBeVisible();
});

test('interactive lesson: two misses unlock "Show me"', async ({ page }) => {
  await page.goto('/#/unit/building-blocks/lesson/building-blocks-4');
  await page.getByRole('button', { name: 'Explore Interactively' }).click();

  const pool = page.getByTestId('tile-pool');
  const answer = page.getByTestId('tile-answer');
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const word of ['chat', 'le', 'aimes', 'Tu']) {
      await pool.getByRole('button', { name: word, exact: true }).click();
    }
    await expect(page.getByText('Not quite')).toBeVisible();
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(answer.getByRole('button')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Show me' }).click();
  await expect(page.getByText('Parfait')).toBeVisible();
});

test('interactive lesson: controls keep working after changing scenes', async ({ page }) => {
  await page.goto('/#/unit/pronouns/lesson/pronouns-4');
  await page.getByRole('button', { name: 'Explore Interactively' }).click();
  for (const word of ['Tu', 'la', 'connais']) {
    await page.getByTestId('tile-pool').getByRole('button', { name: word, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByRole('tab', { name: 'She does not know it' }).click();
  await page.getByRole('button', { name: 'Make it French' }).click();
  await expect(page.getByRole('button', { name: 'Back to English' })).toBeVisible();

  await page.getByRole('button', { name: 'Prev' }).click();
  await page.getByRole('tab', { name: 'She calls me' }).click();
  await page.getByRole('button', { name: 'Make it French' }).click();
  await expect(page.getByRole('button', { name: 'Back to English' })).toBeVisible();
});
