# Testing

State as of 2026-10-22:

| Suite | Command | Result | Needs |
|---|---|---|---|
| Frontend unit | `npm test` | **446 passed, 2 skipped**, about 2 s | `npm ci` first (root `node_modules` was absent) |
| Typecheck | `npx tsc -b` | clean | then revert `*.tsbuildinfo` |
| Server | `cd server && npm test` | **102 passed**, about 45 s | **Node 22**, see [classroom-server.md](classroom-server.md#node-version-use-22) |
| E2E | `npm run e2e` | not run in this audit | both dev servers, so Node 22 for the server |

**CI runs the typecheck and both unit suites** (`.github/workflows/deploy.yml`, `test` job, gating the deploy). It does not run Playwright e2e.

## What the frontend tests cover

`vitest.config.ts`: `environment: 'node'` and `include: ['src/**/*.test.ts']`. That means:

- **No component tests, no jsdom, no `.tsx` tests.** UI is only covered by Playwright.
- Most of the value is in **data integrity tests** that act as the content schema: `lessonContent.test.ts`, `lessonMeta.test.ts`, `deepLessons.test.ts`, `testItemBank.integrity.test.ts`, `exam.integrity.test.ts` and `interactive.test.ts`. See [content.md](content.md).
- Pure-logic tests cover `fuzzy`, `spokenAnswer`, `srs`, `irt`, `mastery`, `learningPath`, `speech`, `gemini` (parsing) and `geminiTts` (WAV/body shape).
- `import.meta.glob` works under vitest, so the Markdown chapters are really loaded in tests.

The node environment prints `ExperimentalWarning: localStorage is not available…`. That's harmless.

## E2E (Playwright)

- `playwright.config.ts` boots `npm run dev` (5173) **and** `npm run dev` in `server/` (https 8443), both with `reuseExistingServer: true`. Start them yourself under the right Node, and Playwright will reuse them.
- Specs: `lesson-loop`, `speaking`, `interactive` and `classroom`.
- `speaking.spec.ts` stubs `SpeechRecognition`, seeds stores via `localStorage.setItem`, and routes the Gemini interactions endpoint to a silent WAV. Copy this pattern and **never let e2e reach Google**.
- `lesson-loop.spec.ts` hardcodes `food-1`'s exercise order and option text. Editing that lesson breaks it.
- **Orphaned snapshots:** `e2e/visual/screens.spec.ts-snapshots/*.png` are committed, but `e2e/visual/screens.spec.ts` does not exist. Don't assume visual regression testing is active.

## Writing new tests

- Logic goes in `src/**/<name>.test.ts` next to the code, with Vitest globals imported explicitly (`import { describe, it, expect } from 'vitest'`).
- Content rules: extend the existing integrity test rather than adding a new file.
- Changing client answer matching or the rubric also means changing the server mirror and its tests.
