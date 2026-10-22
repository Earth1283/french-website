# Docs and names that lie

Trust the code over these.

## README.rst

- It's reStructuredText, not Markdown. Edit it with RST syntax (`.. code-block::`, double backticks).
- **"`npm run deploy`"**: no such script exists. Deploys happen through GitHub Actions on push to `main`.
- **Unit numbers** ("Unit 1" emergency, "Unit 4" money, "Unit 10" false friends, "Unit 11" grammar) are from an older ordering. There are now 32 units, and pronunciation and building-blocks come first.
- "Audio Pronunciation … Uses the Web Speech API — no API key, works offline" is still true for the device voice. The optional Gemini voices are described separately further down.

## index.html meta

The `og:description` and `twitter:description` say **"21 units"**. There are 32.

## Three product names

| Name | Used in |
|---|---|
| **Oh Non! Le French Website** | `README.rst`, `server/README.md` |
| **Bonjour Survival** | `index.html` `<title>`/OG tags, `manifest.json`, SW cache name, the demo video |
| **french-website** | repo, `package.json`, deploy path, localStorage prefix (`french-*`) |

The user-facing name is **Bonjour Survival**, which is what the demo video uses. Don't introduce a fourth name, and don't "unify" them without asking.

## Code comments

- `server/src/lib/rubric.ts` says "test/writing.test.ts checks the two stay in agreement". The file is `server/test/listening-writing.test.ts`.
- `unit12Mode` / `isUnit12Unlocked` mean "the slang unit", not unit #12 (see [content.md](content.md#unit12mode)).
- `src/data/unitDifficulty.ts` describes `isBeyondA1` units as "the harder end of A2", but seeds them at a difficulty above the B1-banded bridge units. The comment and the numbers disagree, so check with the owner before "fixing" either.

## Store and file names

- `conversationStore` holds the Gemini key for **all** AI features, not just conversation.
- `src/data/lessons/grammar-survival.ts` belongs to the unit with id and slug `grammar`.
- The `deepLessons` "reading chapters" are called "Full lesson" in the UI, "deep lesson" in code, and "explore" phase in `Lesson.tsx`.
