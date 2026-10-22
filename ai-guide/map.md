# Map of the repo

## What it is

A French-learning SPA (React 18 + Vite 8 + Tailwind 4 + Zustand + Framer Motion) with:

- 32 units / 88 built-in lessons, from pre-A1 to B2
- An IRT-based adaptive placement test (1,184 items)
- DELF listening and writing practice (`/exam`)
- Gemini-powered conversation scenarios (16) and writing marking, bring-your-own-key
- An **optional** self-hosted teacher backend (`server/`) that the static site connects to
- A Tauri desktop wrapper (`src-tauri/`) that just loads `dist/`

There is no backend for the main app. Everything a learner does lives in their browser's localStorage.

## Commands

| Task | Command | Notes |
|---|---|---|
| Install | `npm ci` | Root `node_modules` may be missing on a fresh checkout |
| Dev | `npm run dev` | Port 5173 with `strictPort`: fails rather than picking another port |
| Unit tests | `npm test` | Vitest, node env, `src/**/*.test.ts` only |
| Typecheck | `npx tsc -b` | Rewrites the committed `*.tsbuildinfo`, so revert afterwards |
| Build | `npm run build` | `tsc -b && vite build`, `base=/french-website/` |
| E2E | `npm run e2e` | Starts **both** the frontend and the server, so it needs Node 22 (see [testing.md](testing.md)) |
| Server tests | `cd server && npm test` | Node 22 only, about 45 s |
| Desktop | `npm run tauri dev` | Needs a Rust toolchain |

## Layout

```
src/
  App.tsx              HashRouter, every route, lazy-loading + idle preload order, accent hover map
  pages/               One file per route; classroom/ and exam/ subfolders
  components/          Grouped by feature (lesson/, home/, exam/, classroom/, ambient/, ui/ ...)
  data/
    units.ts           THE unit list + level flags; imports every lessons/*.ts
    lessons/*.ts       Vocab + exercises per unit (one file per unit)
    lessonMeta.ts      CEFR / skills / prereqs / goal weights per lesson id
    testItems/*.ts     Hand-authored adaptive-test items (some topics aren't units)
    testItemBank.ts    Merges derived (from lesson exercises) + authored items
    scenarios.ts       Conversation scenarios
    exam/              DELF listening docs, writing tasks, rubric
  content/
    lessons/<unitSlug>/<lessonId>/0N-*.md   Reading chapters, loaded with import.meta.glob
    deepLessons.ts     The loader
  interactive/         Animated sentence-building walkthroughs (5 lessons), own registry
  stores/              Zustand + persist, one store per concern
  lib/                 gemini.ts (chat + writing marking), geminiTts.ts, progressBackup.ts
  utils/               fuzzy matching, SRS (SM-2), IRT, learning path, speech, mastery...
  services/            classroom.ts (API client), unsplash.ts
server/                Express 5 + better-sqlite3 + zod, a separate npm project
src-tauri/             Rust shell, no app logic
e2e/                   Playwright specs
demo/, video/          GIT-IGNORED demo-video pipeline. Exists locally; don't delete
```

## Routes

`HashRouter`, so every URL is `/#/...`. `/` (Landing) and `/focus` render **outside** the app chrome and page transitions (`AmbientRoutes`). Everything else goes through `AnimatedRoutes` with `<PageTransition>`.

When adding a route you must touch, in `App.tsx`: a `loadX` thunk, a `lazy()` wrapper, the `<Route>`, and optionally `IDLE_PRELOAD_ORDER`. Each page exports a **named** component (`export function Home`), not a default export; the lazy wrappers depend on this.

## Styling idiom

Tailwind classes plus CSS custom properties from `src/styles/globals.css` (`--bg`, `--accent`, `--text-primary`...), usually applied via inline `style={{ ... 'var(--x)' }}` (about 390 places). Dark mode is a `.dark` class on `<html>`; "Apple mode" is `.apple-mode`. There is no ESLint or Prettier config, so match the file you're in.
