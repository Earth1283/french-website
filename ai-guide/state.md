# State and storage

All learner state is client-side. Zustand stores use `persist`, so **every field you add or rename is a localStorage schema change** for real users.

## localStorage keys

| Key | Store | Holds | Versioned? |
|---|---|---|---|
| `french-progress` | `progressStore` | completed lessons, XP, streak/daysPracticed, badges, **theme**, accent, SRS cards, bookmarks | `version: 1` with `migrate` |
| `french-learner` | `learnerStore` | goals, target date, prior level, per-exercise stats | no |
| `french-conversation` | `conversationStore` | **Gemini API key** + chat difficulty | no |
| `french-speech` | `speechStore` | mic toggle, voice engine (`device`/`gemini`), Gemini voice | no |
| `french-classroom` | `classroomStore` | backend URL, **JWT**, role, profile, cert-trusted flag | no |
| `french-exam-prep` | `examStore` | DELF attempts/drafts | no |
| `french-adaptive-test` | `testStore` | placement-test history (references item ids) | no |
| `bonjour-backdrop:…` prefix | `services/unsplash.ts` | today's backdrop photo, older entries pruned | n/a |

Other browser storage:

- **Cache Storage `gemini-tts-v1`** holds generated TTS clips (see [gemini-and-speech.md](gemini-and-speech.md)).
- **Cache Storage `bonjour-survival-v1`** is the service worker's asset cache.

## Hidden coupling

- **`index.html` parses `french-progress` itself** (inline `<script>`, before React loads) and reads `state.darkMode` and `state.accentColor` to colour the boot screen. If you rename either field or the store key, the loading screen silently goes back to light/red.
- **`e2e/speaking.spec.ts` seeds stores with raw JSON** (`{ state: {...}, version: 0 }`). If you add a `version` to an unversioned store, update the seeds.
- **`src/lib/progressBackup.ts`** exports/imports progress as a file. Check it when changing `ProgressState`.
- **Accent colours**: presets live in `src/data/settingsConstants.ts` (`ACCENT_PRESETS`), and their hover shades in a hardcoded `ACCENT_HOVER` map in `App.tsx`. A new preset needs both, or it falls back to no hover change.

## Schema changes

1. Prefer **optional** fields with a fallback at the read site. `SRSCard.lapses` and `introduced` are examples: "absent on cards saved before this was tracked".
2. If you must reshape data, bump `version` and add a branch to `migrate`. Only `french-progress` has this so far. Adding it to another store means starting at `version: 1` and treating anything older as version 0.
3. Never rely on `resetProgress` as a migration strategy. Real people have months of SRS data.

## Store quirks

- `progressStore.ts` has an `import` statement **below** a `const` (`countDay`). It works because imports are hoisted. Don't "fix" it as part of an unrelated change.
- `streak` is still computed and stored, but the UI promotes `daysPracticed` ("No streak guilt"). Don't add UI that punishes a broken streak.
- `resetProgress` also reaches into `learnerStore` to clear exercise stats. Stores call each other through `getState()`, so beware circular imports.
- Selectors are used one field at a time (`useProgressStore(s => s.darkMode)`). Keep that pattern, because destructuring the whole store re-renders on every change.
