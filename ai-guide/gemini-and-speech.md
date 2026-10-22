# Gemini, TTS and speech

## Ground rules

- **Calls cost the owner real money.** Never send live requests from tests or exploratory scripts. Mock with Playwright `page.route` (as `e2e/speaking.spec.ts` does) or replay from a cache.
- The root `.env` holds `GEMINI_API_KEY` for the **demo recorder only**. It's not `VITE_`-prefixed, so it never reaches the bundle. Never print it, log it or commit it.
- The app is bring-your-own-key: the learner pastes a key in the UI, and the browser calls Google directly. There is no proxy.

## Where the key lives

`useConversationStore().geminiApiKey` (localStorage `french-conversation`) is the **only** key store, even though three features use it:

| Feature | File | Endpoint | Model | Key sent as |
|---|---|---|---|---|
| Conversation NPC | `src/lib/gemini.ts` `callGemini` | `v1beta/models/…:generateContent` | `gemini-3.1-flash-lite` (string literal) | `?key=` query param |
| DELF writing marking | `src/lib/gemini.ts` `evaluateWriting` | same | same literal, duplicated | `?key=` query param |
| Gemini voices (TTS) | `src/lib/geminiTts.ts` | `v1beta/interactions` | `TTS_MODEL = 'gemini-3.8-flash-lite-tts'` | `x-goog-api-key` header |

The two files use different auth styles and different API shapes. If you change a model, update **both** literals in `gemini.ts`. Better still, hoist them into a constant as part of that change.

## Response handling

- Both text calls use `responseMimeType: 'application/json'`.
- `evaluateWriting` treats model output as untrusted: `parseWritingEvaluation` clamps bands and **recomputes scores itself** from `data/exam/rubric.ts`. Keep it that way, and don't trust model-computed totals.
- `callGemini` does a bare `JSON.parse(text)` and returns it typed as `GeminiTurnResult` with no validation. A malformed reply throws into the page.
- The writing prompt tells the model to ignore instructions in the candidate's text. Keep that line if you edit the prompt.

## TTS pipeline (`speak()` in `src/utils/speech.ts`)

1. `speak(text, lang)` cancels anything playing and takes a request token. Stale clips that resolve late are dropped.
2. If the voice engine is `gemini`, a key exists and `lang` is French, it calls `geminiSpeech`. Otherwise it uses device `speechSynthesis` at rate 0.85.
3. `geminiSpeech` dedupes in-flight requests in memory, then checks Cache Storage `gemini-tts-v1` using the fake URL `https://tts.invalid/<model>/<voice>/<encoded text>`.
4. On a miss it calls the API, wraps the returned PCM in a WAV header (24 kHz mono 16-bit, `asWav`), and caches it **forever**.
5. **Any failure starts a 60 s cooldown** in which every Gemini request fails fast and falls back to the device voice. `previewGeminiVoice` (the Settings preview) clears the cooldown.

Consequences:

- Changing `TTS_MODEL` or the voice list invalidates the cache implicitly, because the model is part of the key. Changing `STYLE` does **not**, so old clips keep the old style.
- **DELF listening deliberately keeps device voices** (multi-speaker documents). Don't route it through `speak()`'s Gemini path.

## Speech recognition

- `src/hooks/useSpeechInput.ts` wraps the browser's `SpeechRecognition` (Chrome, Edge and Safari only). Other browsers fall back to typing.
- `src/utils/spokenAnswer.ts` grades what was *said*. It knows homophones (*parle/parles/parlent*) and normalizes numbers, prices and times the way recognizers spell them. Its tests are `src/utils/spokenAnswer.test.ts`. Grow those with any change.
- `src/utils/fuzzy.ts` (`checkAnswer`) grades typed answers as `correct | accent | typo | wrong`. It has an accent-minimal-pair list (`a/à`, `ou/où`…) where a missing accent is wrong, not a typo. **It is mirrored on the server**: see [classroom-server.md](classroom-server.md#mirrored-code).

## The demo recorder (`demo/`, git-ignored)

`demo/record.mjs` drives Playwright to render the marketing video into `video/`. `demo/gemini-cache.mjs` intercepts Gemini calls and replays `video/gemini-cache.json`, **keyed by call order, not content**. If you add, remove or reorder a Gemini call in the demo flow, every later reply shifts. Set `DEMO_OFFLINE=1` to stub misses instead of calling the API.
