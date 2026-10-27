# Build, deploy, PWA, desktop

## Deploy = push to `main`

`.github/workflows/deploy.yml` runs `npm ci && npm run build` on every push to `main` and force-pushes `dist/` to `gh-pages` (served at `https://earth1283.github.io/french-website/`). A `test` job (typecheck, frontend tests, server build and tests on Node 22) must pass first, and the same job runs on pull requests without deploying. There is no `npm run deploy` script.

`VITE_UNSPLASH_ACCESS_KEY` comes from a repo secret, and is optional because backdrops fall back to gradients. Any `VITE_*` var is baked into the public bundle, so never put a secret behind that prefix.

## The `/french-website/` base path

`vite.config.ts` sets `base: '/french-website/'` only for non-Tauri builds. But these files **hardcode** the prefix regardless:

| File | Hardcoded |
|---|---|
| `src/main.tsx` | `serviceWorker.register('/french-website/sw.js')` (skipped in dev and Tauri) |
| `public/sw.js` | precache URLs and the offline fallback `/french-website/index.html` |
| `public/manifest.json` | `start_url`, icons, screenshots |
| `index.html` | `<link rel="manifest">`, `apple-touch-icon` |

If the site ever moves (custom domain, different repo name), all of these need changing. Use `import.meta.env.BASE_URL` in TS where possible.

## PWA leftovers

- `manifest.json` references `icon-192.png`, `icon-512.png` and `og-image.png`, and `index.html` references `apple-touch-icon.png`. **None of these exist in `public/`**, so they 404. Only `favicon.svg` exists.
- `sw.js` is hand-written (no Workbox). It's network-first for navigations and cache-first for fingerprinted assets, and the cache name `bonjour-survival-v1` is never bumped. Assets are hashed, so this mostly works. If you change caching behaviour, bump the version suffix so old caches are purged.

## The boot screen

`index.html` contains an inline loading screen that:

1. Reads `localStorage['french-progress']` for dark mode and accent (see [state.md](state.md)).
2. Advances a progress bar by watching resource loads whose URLs contain `rolldown-runtime`, `react-vendor`, `motion`, `ui-` or `index-`. These must match Vite 8 / rolldown output and the `manualChunks` names in `vite.config.ts`. Rename a chunk and the bar stalls.
3. Waits for React to call `window.__bootReady()` (in `App.tsx`) to fade out.

## Vite config oddities

- `server.allowedHosts: ['mc5.leapmotorintl.com']` is the owner's remote dev host. Leave it alone.
- `strictPort: true` on 5173 exists because Tauri's dev webview points at that exact port. If 5173 is busy, `npm run dev` fails instead of moving.
- `manualChunks` splits react, motion, ui (lucide + zustand) and charts (recharts + d3).

## Committed build artefacts

`tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` are **tracked in git**. Any `tsc -b` or `npm run build` modifies them. Run `git checkout -- '*.tsbuildinfo'` before committing unless the owner asks otherwise. (Untracking them is a reasonable cleanup to propose.)

## Local-only directories (git-ignored, don't delete)

- `dist/` holds build output.
- `demo/` is the Playwright scripts that record the marketing video (`record.mjs`, `classroom.mjs`, `gemini-cache.mjs`, `timewarp.js`…).
- `video/` holds rendered MP4s, frames, the Gemini replay cache, and a seeded classroom DB (`video/classroom-data/`).
- `test-results/` is Playwright output.
- `.env` at the root contains `GEMINI_API_KEY` for `demo/`.

## Tauri desktop (`src-tauri/`)

This is a thin Rust shell that loads `dist/` in a webview. There is no app logic in Rust. Detection is `TAURI_ENV_PLATFORM` at build time (base path `/`) and `'__TAURI_INTERNALS__' in window` at runtime (no service worker). `.github/workflows/tauri-build.yml` builds installers for 5 targets on `v*.*.*` tags into a draft release. Builds are unsigned unless signing secrets are set.
