# AI collaborator guide

Read this before touching the repo. It covers what the code won't tell you: the
traps, the duplicated sources of truth, and the docs that no longer match reality.

Last verified against commit `48fe62d` (2026-10-22).

## The ten things most likely to bite you

1. **Pushing to `main` deploys.** `.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push. No tests run in CI. There is no `npm run deploy`, whatever the README says.
2. **One lesson is spread across 3–5 files, and its saved progress is keyed by array index.** Reordering vocab or exercises scrambles learners' SRS and test history. Vocab and exercises live in TS, reading chapters in Markdown, metadata in a separate map, and interactive walkthroughs in a fourth place. The vitest content tests enforce the shape, so run `npm test` after every content edit. See [content.md](content.md).
3. **CEFR level is a soup of booleans.** `isPreA1`, `isA1`, `isA1A2`, `isBeyondA1`, `isBridge`, `isB1`, `isB2`, read by at least five files that each interpret them slightly differently. See [content.md](content.md#levels-the-boolean-soup).
4. **The server needs Node 22.** `better-sqlite3@11` won't compile on Node 26 (this machine's default). **Never run `npm rebuild` under Node 26**: it deletes the working binary and then fails. See [classroom-server.md](classroom-server.md).
5. **`/french-website/` is hardcoded** in `sw.js`, `manifest.json`, `index.html` and `main.tsx`, even though `vite.config.ts` sets `base` conditionally. See [build-and-deploy.md](build-and-deploy.md).
6. **`index.html` reads Zustand's localStorage directly** to theme the boot screen, and matches Vite chunk names to drive its progress bar. Renaming a store field or a chunk breaks it silently. See [state.md](state.md).
7. **The Gemini key lives in `useConversationStore`**, even though DELF writing marking and TTS also use it. Model IDs are hardcoded string literals. Gemini calls cost the owner money, so never hit the real API in tests. See [gemini-and-speech.md](gemini-and-speech.md).
8. **Grading logic is copy-pasted between client and server** (`normalize`, fuzzy matching, the DELF rubric). Change one and you must change the other. See [classroom-server.md](classroom-server.md#mirrored-code).
9. **`tsc -b` rewrites committed files** (`tsconfig.app.tsbuildinfo`). Revert them before you commit.
10. **The product has three names**: "Oh Non!", "Bonjour Survival" and "french-website". See [stale-docs.md](stale-docs.md).

## Files in this guide

| File | Read it when |
|---|---|
| [map.md](map.md) | You're new. Layout, commands, routes, where things live |
| [content.md](content.md) | Adding or editing lessons, units, test items, or levels |
| [state.md](state.md) | Touching a Zustand store, localStorage, or persisted shapes |
| [gemini-and-speech.md](gemini-and-speech.md) | Anything AI, TTS, speech recognition, or the API key |
| [classroom-server.md](classroom-server.md) | Working in `server/` or `src/pages/classroom/` |
| [build-and-deploy.md](build-and-deploy.md) | Vite config, service worker, PWA, Tauri, CI |
| [testing.md](testing.md) | Running or writing tests, and what is actually covered |
| [stale-docs.md](stale-docs.md) | Before trusting the README or a code comment |

## House rules (from the owner)

- **Lead with one recommended answer.** The owner usually accepts sensible defaults wholesale, so don't present option menus.
- **No comment banners** (`// ─── Section ───`). Write self-documenting code and match the surrounding comment density. `src/lib/gemini.ts` has one banner; don't copy it.
- **Use shell tools (sed/awk/grep) for bulk mechanical edits** across the 88 lessons and 340 Markdown chapters.
- **Minimize paid API calls.** Cache or replay Gemini responses and rehearse offline.
- **Commit messages are short, lowercase and imperative**: `add say it in french, and use gemini voices for dictation`.
- **Tone is deliberately anti-Duolingo**: jokey unit titles, honest feedback, "No confetti", "No streak guilt". Don't add guilt mechanics, streak-loss warnings, or celebratory fluff.
