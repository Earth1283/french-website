# The classroom server (`server/`)

An optional, teacher-self-hosted backend: Express 5, better-sqlite3, zod, bcrypt and JWT. It is a **separate npm project** with its own `package.json`, lockfile, `tsconfig` and vitest config. The static site talks to whatever URL the teacher enters (`src/pages/classroom/Connect.tsx`).

Human docs: `server/README.md` (technical) and `server/SETUP.md` (for teachers).

## Node version: use 22

`better-sqlite3@11.10` is a native module. Its prebuilt or compiled binary targets **Node 22 (ABI 127)**. On Node 26 (this machine's default, via nvm) it fails both to load and to compile, because of removed V8 APIs such as `GetPrototype`.

```bash
# On this box:
PATH=/root/.nvm/versions/node/v22.22.1/bin:$PATH npm test        # from server/
PATH=/root/.nvm/versions/node/v22.22.1/bin:$PATH npm run dev
```

**Don't run `npm rebuild better-sqlite3` under Node 26.** It deletes `build/Release/better_sqlite3.node` first and then fails to compile, leaving the server broken for every Node version until you rebuild under 22. (This happened on 2026-10-22.)

The real fix is upgrading `better-sqlite3` to a release that supports Node 26. That's worth proposing, not doing silently.

## HTTPS is mandatory

The site runs on HTTPS (GitHub Pages) and browsers block mixed content, so the server **always** speaks HTTPS. With no `TLS_CERT_PATH`/`TLS_KEY_PATH`, `src/tls/bootstrap.ts` generates a self-signed cert into `data/certs/`. Users must visit the URL once and click through the warning, and the Connect page walks them through it (`certTrusted` in `classroomStore`). Local dev is `https://localhost:8443`.

## Data on disk

Everything lives in `server/data/` (git-ignored): the SQLite DB (WAL mode), `secret.key` (JWT signing key, auto-generated) and certs. **Reading lessons' page text is stored as Markdown files in `data/content-files/<id>/`, not in the DB** (`src/lib/contentFiles.ts`). DB rows and files must stay in sync, and content updates are written atomically for that reason.

## Migrations

These are numbered SQL files in `src/db/migrations/` (`001_init.sql` … `007_listening_writing.sql`), applied in order by `src/db/migrate.ts`. Add `008_…sql` and never edit a shipped one. `npm run build` copies the `.sql` files into `dist/` with a shell `cp`, so a migration that only exists in `src/` won't ship if someone builds differently.

## Mirrored code

The server **grades attempts itself** rather than trusting the client (commit `7822e8c`), so it carries copies of frontend logic:

| Server file | Mirrors | Agreement test |
|---|---|---|
| `server/src/lib/grading.ts` | `src/utils/normalize.ts` + `src/utils/fuzzy.ts` | `server/test/grading.test.ts` |
| `server/src/lib/rubric.ts` | `src/data/exam/rubric.ts` | `server/test/listening-writing.test.ts` (the code comment wrongly says `test/writing.test.ts`) |

These aren't imports, they're copy-paste. A change to answer matching or the DELF grid must land in **both** places in the same commit, with both test suites run.

## Types are hand-synced too

The server validates with zod schemas in `server/src/lib/validation.ts`. The client has **separately hand-written** interfaces in `src/types/classroom.ts`. Nothing checks that they agree. When you add a field or a content kind (`lesson | quiz | reading | listening | writing`), update both, plus the editor components in `src/components/classroom/`.

## Test harness quirks

- `server/test/setup.ts` sets `process.env` and **then dynamically imports** `src/app.js`, because `config.ts` reads env at import time. Static imports of app modules in a test file will read the wrong config.
- `fileParallelism: false`: all files share process env and run serially, which takes about 45 s (bcrypt).
- Imports use `.js` extensions on `.ts` files (NodeNext-style ESM). Keep that.
