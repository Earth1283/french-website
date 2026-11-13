import { expect, test } from '@playwright/test';
import { READING_DOCS } from '../src/data/exam/reading';

const doc = READING_DOCS[0];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('french-progress')) localStorage.setItem('french-progress', JSON.stringify({ state: { onboardingDone: true }, version: 1 }));
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak(u: { onend?: () => void }) { setTimeout(() => u.onend?.(), 10); }, cancel() {}, getVoices: () => [], addEventListener() {}, removeEventListener() {} } });
  });
});

test('a missed lesson answer can be practiced, resolved, and reopened in the notebook', async ({ page }) => {
  await page.goto('/#/unit/food/lesson/food-1');
  await page.getByRole('button', { name: 'Skip straight to practice' }).click();
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: /^\d Je voudrais un Starbucks$/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.goto('/#/notebook');
  const card = page.getByRole('article');
  await expect(card).toHaveCount(1);
  await expect(card.getByText('Je voudrais un Starbucks', { exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'Practice this' }).click();
  await page.getByRole('button', { name: /^\d Un café, s'il vous plaît$/ }).click();
  await expect(page.getByText('You recalled it.')).toBeVisible();
  await page.getByRole('button', { name: 'Mark resolved' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Resolved', exact: true }).click();
  await expect(page.getByText('Recalled 1 of 1 practice attempts')).toBeVisible();
  await page.getByRole('button', { name: 'Reopen', exact: true }).click();
  await page.getByRole('tab', { name: 'Active', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(1);
});

test('reading practice saves explained results and sends missed answers to review without completed lessons', async ({ page }) => {
  await page.goto(`/#/exam/reading/${doc.id}`);
  await page.getByRole('tab', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: 'Begin reading' }).click();
  for (let i = 0; i < doc.questions.length; i++) {
    const q = doc.questions[i];
    const answer = i === 0 ? q.options![0] : q.answer;
    if (q.options) await page.getByRole('radio', { name: `${String.fromCharCode(65 + q.options.indexOf(answer))} ${answer}`, exact: true }).click();
    else await page.getByLabel(`Answer to question ${i + 1}`).fill(answer);
  }
  await page.getByRole('button', { name: /Submit answers/ }).click();
  await expect(page.getByRole('status')).toContainText('4 / 5 correct');
  await expect(page.getByText(doc.questions[0].explanation!, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Review missed answers/ }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Add to review' }).click();
  await page.getByRole('link', { name: 'Open spaced review' }).click();
  await expect(page.getByText(doc.passage, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Tap to reveal/ }).click();
  await page.getByRole('button', { name: 'Knew it', exact: true }).click();
  await expect(page.getByText('Review done.')).toBeVisible();
  await page.goto(`/#/exam/reading/${doc.id}`);
  await page.getByRole('button', { name: /practice.*4\/5/ }).click();
  await expect(page.getByRole('status')).toContainText('4 / 5 correct');
});

test('reading exam time submits unanswered questions and retry starts a fresh timer', async ({ page }) => {
  await page.clock.install();
  await page.goto(`/#/exam/reading/${doc.id}`);
  await page.getByRole('button', { name: 'Begin reading' }).click();
  await expect(page.getByRole('timer')).toContainText('7:00');
  await page.clock.fastForward(7 * 60_000);
  await expect(page.getByRole('status')).toContainText('0 / 5 correct');
  await expect(page.getByRole('radio').first()).toBeDisabled();
  await page.getByRole('button', { name: 'Retry' }).click();
  await page.getByRole('button', { name: 'Begin reading' }).click();
  await expect(page.getByRole('timer')).toContainText('7:00');
});

test('mock reading retains answers and its clock across documents', async ({ page }) => {
  await page.clock.install();
  await page.goto('/#/exam/mock');
  await page.getByRole('button', { name: /Start the DELF A1 mock/ }).click();
  while (await page.getByRole('button', { name: 'Next recording' }).isVisible()) await page.getByRole('button', { name: 'Next recording' }).click();
  await page.getByRole('button', { name: /Finish listening/ }).click();
  await page.getByRole('radio', { name: 'B Samedi', exact: true }).click();
  await page.clock.fastForward(60_000);
  await page.getByRole('button', { name: 'Next document' }).click();
  await expect(page.getByRole('timer')).toContainText('29:00');
  await page.getByRole('button', { name: 'Previous document' }).click();
  await expect(page.getByRole('radio', { name: 'B Samedi', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('timer')).toContainText('29:00');
  await page.clock.fastForward(29 * 60_000);
  await expect(page.getByRole('button', { name: /Hand in/ })).toBeVisible();
});

test('exam hub offers reading at every level and both new pages fit a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/exam');
  for (const level of ['a1', 'a2', 'b1', 'b2']) {
    await page.getByRole('tab', { name: level.toUpperCase(), exact: true }).click();
    await expect(page.locator(`a[href*="/exam/reading/${level}-"]`)).toHaveCount(READING_DOCS.filter(d => d.level === level).length);
  }
  await page.locator('a[href*="/exam/reading/b2-"]').first().click();
  await page.getByRole('button', { name: 'Begin reading' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: /Submit answers/ }).click();
  await page.getByRole('link', { name: /Review missed answers/ }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByLabel('Search mistakes').fill('no-such-correction');
  await expect(page.getByText('No mistakes match this view.')).toBeVisible();
});

test('progress export and import preserve reading answers and notebook state', async ({ page }) => {
  await page.goto(`/#/exam/reading/${doc.id}`);
  await page.getByRole('button', { name: 'Begin reading' }).click();
  await page.getByRole('button', { name: /Submit answers/ }).click();
  await page.getByRole('link', { name: /Review missed answers/ }).click();
  await page.getByRole('button', { name: 'Add to review', exact: true }).first().click();
  await page.goto('/#/settings');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  await page.evaluate(() => { localStorage.removeItem('french-notebook'); localStorage.removeItem('french-exam-prep'); });
  await page.reload();
  await page.locator('input[type=file]').setInputFiles(path!);
  await expect(page.getByText('✓ Progress restored successfully.')).toBeVisible();
  await page.goto('/#/notebook');
  await expect(page.getByRole('article')).toHaveCount(doc.questions.length);
  await expect(page.getByRole('button', { name: 'Remove from review' })).toHaveCount(1);
  await page.goto(`/#/exam/reading/${doc.id}`);
  await expect(page.getByRole('button', { name: /exam.*0\/5/ })).toBeVisible();
});

test('existing conversation and writing corrections are brought into the notebook once', async ({ page }) => {
  await page.addInitScript(() => {
    const correction = { original: 'Je suis vingt ans', corrected: "J’ai vingt ans", explanation: 'Age uses avoir.' };
    localStorage.setItem('french-conversation', JSON.stringify({ state: { history: [{ id: 'old-conversation', scenarioId: 'cafe', debrief: { corrections: [correction] } }] }, version: 0 }));
    localStorage.setItem('french-exam-prep', JSON.stringify({ state: { writingSubmissions: [{ id: 'old-writing', taskId: 'a1-message', evaluation: { corrections: [correction] } }] }, version: 0 }));
  });
  await page.goto('/#/notebook');
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(2);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('french-notebook')!).state.mistakes.every((m: { occurrences: number }) => m.occurrences === 1))).toBe(true);
});

test('legacy mocks retain their optional reading score and older backups still restore', async ({ page }) => {
  await page.goto('/#/settings');
  const section = { score: 15, source: 'self' };
  const backup = { version: 4, completedLessons: [], examPrep: { level: 'a1', mockResults: [{ id: 'legacy', date: '2026-01-01', level: 'a1', listening: section, writing: section, speaking: section, reading: null, listeningDocIds: [], writingTaskIds: [], speakingTaskId: '' }] } };
  await page.locator('input[type=file]').setInputFiles({ name: 'old-progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByText('✓ Progress restored successfully.')).toBeVisible();
  await page.goto('/#/exam/mock');
  await page.getByRole('button', { name: /2026-01-01/ }).click();
  await expect(page.getByText('/ 75')).toBeVisible();
  await page.getByLabel('Reading score (optional)').fill('20');
  await expect(page.getByText('/ 100')).toBeVisible();
  await expect(page.getByText(/Admis —/)).toBeVisible();
});
