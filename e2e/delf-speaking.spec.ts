import { expect, test, type Page, type Request } from '@playwright/test';

// A fake microphone (Chromium's synthetic audio device) so MediaRecorder
// produces real audio, and instant speech synthesis so the examiner's lines
// don't hold the test up.
test.use({
  launchOptions: async ({ launchOptions }, use) => use({
    ...launchOptions,
    args: [...(launchOptions.args ?? []), '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  }),
});

async function instantSpeech(page: Page) {
  await page.addInitScript(() => {
    const synth = {
      speaking: false,
      speak(u: { onend?: () => void }) { setTimeout(() => u.onend?.(), 20); },
      cancel() {},
      getVoices: () => [],
      addEventListener() {},
      removeEventListener() {},
      onvoiceschanged: null,
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  });
}

async function withGeminiKey(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('french-conversation', JSON.stringify({ state: { geminiApiKey: 'test-key', difficulty: 1, history: [] }, version: 0 }));
  });
}

/** Answers every Gemini call with `reply` and records the requests. */
async function stubGemini(page: Page, reply: (body: string) => unknown) {
  const requests: Request[] = [];
  await page.route('https://generativelanguage.googleapis.com/**', async route => {
    requests.push(route.request());
    const body = route.request().postData() ?? '';
    await route.fulfill({
      json: { candidates: [{ content: { parts: [{ text: JSON.stringify(reply(body)) }] } }] },
    });
  });
  return requests;
}

async function recordPart(page: Page) {
  await page.getByRole('button', { name: /Start — the examiner speaks first|Start speaking|Start \d+ min preparation/ }).first().click();
  if (await page.getByRole('button', { name: 'I\'m ready' }).isVisible()) {
    await page.getByRole('button', { name: 'I\'m ready' }).click();
  }
  if (await page.getByRole('button', { name: 'Start recording' }).isVisible()) {
    await page.getByRole('button', { name: 'Start recording' }).click();
  }
  await expect(page.getByText('Recording', { exact: true })).toBeVisible();
  while (await page.getByRole('button', { name: /^Next/ }).isVisible()) {
    await page.getByRole('button', { name: /^Next/ }).click();
  }
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Finish this part' }).click();
}

const SPEAKING_REPLY = {
  transcripts: ['Je m\'appelle Ana.', 'Vous faites du sport ?', 'Je voudrais des pommes.'],
  bands: { task: 2, interaction: 2, lexicon: 2, morphosyntax: 2, phonology: 3 },
  comments: { phonology: 'Clear vowels.' },
  summary: 'A solid A1 performance.',
  corrections: [{ original: 'je suis 20 ans', corrected: 'j\'ai 20 ans', explanation: 'Age uses avoir.' }],
};

test('a speaking paper can be recorded part by part and self-marked', async ({ page }) => {
  await instantSpeech(page);
  await page.goto('/#/exam/speaking/a1-oral-quartier');
  await page.getByRole('button', { name: 'Begin' }).click();

  for (let part = 0; part < 3; part++) {
    await recordPart(page);
    await expect(page.getByText(/Your recording · 0:0\d/)).toBeVisible();
    await page.getByRole('button', { name: part < 2 ? 'Next part' : 'Finish and mark' }).click();
  }

  await expect(page.getByText('Mark yourself')).toBeVisible();
  await expect(page.locator('audio')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save my marks' }).click();
  await expect(page.getByText('Grille DELF A1 · oral')).toBeVisible();
  await expect(page.getByText('Too little to assess')).toBeVisible();
});

test('with a Gemini key the recordings are sent as WAV, with the key in a header', async ({ page }) => {
  await instantSpeech(page);
  await withGeminiKey(page);
  const requests = await stubGemini(page, () => SPEAKING_REPLY);
  await page.goto('/#/exam/speaking/a1-oral-quartier');
  await page.getByRole('radio', { name: 'Exam conditions' }).or(page.getByRole('tab', { name: 'Exam conditions' })).click();
  await page.getByRole('button', { name: 'Begin' }).click();

  for (let part = 0; part < 3; part++) await recordPart(page);

  await expect(page.getByText('Overall')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('A solid A1 performance.')).toBeVisible();
  await expect(page.getByText('j\'ai 20 ans')).toBeVisible();

  expect(requests).toHaveLength(1);
  const req = requests[0];
  expect(req.url()).not.toContain('key=');
  expect(req.headers()['x-goog-api-key']).toBe('test-key');
  const body = JSON.parse(req.postData()!);
  const audio = body.contents[0].parts.filter((p: { inline_data?: unknown }) => p.inline_data);
  expect(audio).toHaveLength(3);
  expect(audio[0].inline_data.mime_type).toBe('audio/wav');
  expect(atob(audio[0].inline_data.data.slice(0, 8)).startsWith('RIFF')).toBe(true);
});

test('a full mock exam produces a result out of 75, then 100 with a reading score', async ({ page }) => {
  test.setTimeout(90_000);
  await instantSpeech(page);
  await withGeminiKey(page);
  await stubGemini(page, body => body.includes('production écrite')
    ? { bands: { task: 2, coherence: 2, sociolinguistic: 2, lexicon: 2, morphosyntax: 2 }, summary: 'Bon texte.' }
    : SPEAKING_REPLY);
  await page.addInitScript(() => {
    localStorage.setItem('french-exam-prep', JSON.stringify({ state: { level: 'a1' }, version: 0 }));
  });

  await page.goto('/#/exam/mock');
  await page.getByRole('button', { name: /Start the DELF A1 mock/ }).click();

  while (await page.getByRole('button', { name: 'Next recording' }).isVisible()) {
    await page.getByRole('button', { name: 'Next recording' }).click();
  }
  await page.getByRole('button', { name: /Finish listening/ }).click();

  await page.getByRole('textbox').fill(Array.from({ length: 45 }, () => 'bonjour').join(' '));
  await page.getByRole('button', { name: /Hand in/ }).click();

  for (let part = 0; part < 3; part++) await recordPart(page);

  await expect(page.getByText('Résultats · DELF A1')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('/ 75')).toBeVisible();
  await expect(page.getByText(/On track if you score|Not a pass yet/)).toBeVisible();

  await page.getByLabel('Reading score (optional)').fill('20');
  await expect(page.getByText('/ 100')).toBeVisible();
  await expect(page.getByText(/Admis|Non admis/)).toBeVisible();
});

test('a scripted conversation ends with a debrief that is kept for later', async ({ page }) => {
  await instantSpeech(page);
  await page.goto('/#/converse');
  await page.getByRole('button', { name: /Un café, s'il vous plaît/ }).first().click();

  // A wrong reply first, then end early.
  await page.getByRole('button', { name: 'Oui, je veux du café.' }).click();
  await page.getByRole('button', { name: 'End and see your debrief' }).click();

  await expect(page.getByText('Debrief', { exact: true })).toBeVisible();
  await expect(page.getByText('A more natural reply')).toBeVisible();
  await expect(page.getByText('Phrases to keep')).toBeVisible();

  await page.getByRole('button', { name: 'New scenario' }).click();
  await expect(page.getByText('Recent debriefs')).toBeVisible();
  await page.getByRole('button', { name: /Un café, s'il vous plaît.*exchanges/ }).click();
  await expect(page.getByText('A more natural reply')).toBeVisible();
});

test('an AI conversation debrief comes from Gemini', async ({ page }) => {
  await instantSpeech(page);
  await withGeminiKey(page);
  await stubGemini(page, body => body.includes('reviewing a learner')
    ? { summary: 'Nicely done.', strengths: ['Polite greeting.'], corrections: [], phrases: [{ french: 'L\'addition, s\'il vous plaît.', english: 'The bill, please.' }] }
    : { npcResponse: 'Très bien, et avec ceci ?', playerFeedback: 'Good.', missionComplete: false });
  await page.goto('/#/converse');
  await page.getByRole('button', { name: /Un café, s'il vous plaît/ }).first().click();

  const field = page.getByRole('textbox');
  await field.fill('Bonjour, un café s\'il vous plaît');
  await field.press('Enter');
  await expect(page.getByText('Très bien, et avec ceci ?')).toBeVisible();

  await page.getByRole('button', { name: 'End and see your debrief' }).click();
  await expect(page.getByText('Nicely done.')).toBeVisible();
  await expect(page.getByText('Polite greeting.')).toBeVisible();
  await expect(page.getByText('The bill, please.')).toBeVisible();
});
