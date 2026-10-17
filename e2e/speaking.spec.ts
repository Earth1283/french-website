import { expect, test, type Page } from '@playwright/test';

async function fakeRecognition(page: Page) {
  await page.addInitScript(() => {
    const queue: string[] = [];
    (window as unknown as { hear: (s: string) => void }).hear = s => { queue.push(s); };

    class FakeRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      maxAlternatives = 1;
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        setTimeout(() => {
          const next = queue.shift() ?? '!no-speech';
          if (next.startsWith('!')) this.onerror?.({ error: next.slice(1) });
          else {
            const result = Object.assign([{ transcript: next }], { isFinal: true });
            this.onresult?.({ resultIndex: 0, results: [result] });
          }
          this.onend?.();
        }, 50);
      }
      stop() {}
      abort() { this.onend?.(); }
    }
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeRecognition;
  });
}

const hear = (page: Page, text: string) => page.evaluate(t => (window as unknown as { hear: (s: string) => void }).hear(t), text);

async function reachFirstTranslation(page: Page) {
  await page.goto('/#/unit/food/lesson/food-1');
  await page.getByRole('button', { name: 'Skip straight to practice' }).click();
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: /^\d Un café, s'il vous plaît$/ }).click();
}

test('a translation can be answered out loud, and a wrong one shows what was heard', async ({ page }) => {
  await fakeRecognition(page);
  await reachFirstTranslation(page);

  await hear(page, "l'addition s'il vous plait");
  await page.getByRole('button', { name: 'Say it in French' }).click();
  await expect(page.getByRole('button', { name: /^\d La carte, s'il vous plaît$/ })).toBeVisible();

  await page.getByRole('button', { name: /^\d La carte, s'il vous plaît$/ }).click();
  const field = page.getByRole('textbox');
  await field.fill('lait');
  await field.press('Enter');
  await field.fill('délicieux');
  await field.press('Enter');

  await hear(page, "un croissant s'il te plaît");
  await page.getByRole('button', { name: 'Say it in French' }).click();
  await expect(page.getByText('We heard')).toBeVisible();
  await expect(page.locator('s', { hasText: "un croissant s'il te plaît" })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText(/Second look/)).toBeVisible();
});

test('a blocked microphone explains itself and typing still works', async ({ page }) => {
  await fakeRecognition(page);
  await reachFirstTranslation(page);

  await hear(page, '!not-allowed');
  await page.getByRole('button', { name: 'Say it in French' }).click();
  await expect(page.getByText(/Microphone blocked/)).toBeVisible();

  const field = page.getByRole('textbox');
  await field.fill("L'addition, s'il vous plaît");
  await field.press('Enter');
  await expect(page.getByRole('button', { name: /^\d La carte, s'il vous plaît$/ })).toBeVisible();
});

test('no microphone button where the browser cannot listen', async ({ page }) => {
  await page.addInitScript(() => {
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
  });
  await reachFirstTranslation(page);
  await expect(page.getByRole('textbox')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Say it in French' })).toHaveCount(0);
});

test('Gemini voices need a key', async ({ page }) => {
  await page.goto('/#/settings');
  await expect(page.getByText('Speaking practice')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gemini', exact: true })).toBeDisabled();
  await expect(page.getByText('Add a Gemini API key above to use Gemini voices.')).toBeVisible();
});

test('Gemini voice is fetched once per phrase, then replayed from the cache', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('french-conversation', JSON.stringify({ state: { geminiApiKey: 'test-key', difficulty: 1 }, version: 0 }));
    localStorage.setItem('french-speech', JSON.stringify({ state: { micEnabled: true, voiceEngine: 'gemini', geminiVoice: 'Aoede', autoSpeakReplies: false }, version: 0 }));
    const played: string[] = [];
    (window as unknown as { played: string[] }).played = played;
    HTMLMediaElement.prototype.play = function () { played.push(this.src); return Promise.resolve(); };
  });

  const requests: { key: string | null; body: { model: string; input: { content: { text: string }[] }[]; generation_config: unknown } }[] = [];
  await page.route('https://generativelanguage.googleapis.com/v1beta/interactions', async route => {
    requests.push({ key: route.request().headers()['x-goog-api-key'] ?? null, body: route.request().postDataJSON() });
    const silence = Buffer.alloc(4800).toString('base64');
    await route.fulfill({ json: { steps: [{ type: 'model_output', content: [{ type: 'audio', data: silence }] }] } });
  });

  await page.goto('/#/phrasebook');
  const play = page.getByRole('button', { name: 'Play pronunciation' }).first();
  await play.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { played: string[] }).played.length)).toBe(1);
  await play.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { played: string[] }).played.length)).toBe(2);

  expect(requests).toHaveLength(1);
  expect(requests[0].key).toBe('test-key');
  expect(requests[0].body.model).toBe('gemini-3.8-flash-lite-tts');
  expect(requests[0].body.generation_config).toEqual({ speech_config: [{ voice: 'Aoede' }] });

  await page.reload();
  await page.getByRole('button', { name: 'Play pronunciation' }).first().click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { played: string[] }).played.length)).toBe(1);
  expect(requests).toHaveLength(1);
});
