# Content: lessons, units, levels, test items

The content model grew in layers, and each layer added a new file rather than extending the old one. The vitest suite is the de facto schema, so **run `npm test` after any content change.**

## Anatomy of one lesson

Lesson `food-1` exists in all of these places:

| Where | What | Enforced by |
|---|---|---|
| `src/data/lessons/food.ts` | `Lesson` object: id, title, vocab, exercises, xpReward | `src/data/lessonContent.test.ts` |
| `src/data/lessonMeta.ts` | `LESSON_META['food-1']`: cefr, skills, prereqs, goalWeight | `src/data/lessonMeta.test.ts` |
| `src/content/lessons/food/food-1/01-…md` … `04-…md` | Four reading chapters | `src/content/deepLessons.test.ts`, `lessonContent.test.ts` |
| **or** `src/interactive/registry.ts` + `src/interactive/lessons/…` | Interactive walkthrough that *replaces* the reading chapters | Exempts the lesson from the chapter tests |
| Adaptive test bank (automatic) | Each exercise becomes item `lesson-food-1-<exerciseIndex>` | `src/data/testItemBank.integrity.test.ts` |

### Rules the tests enforce

- Lesson ids are globally unique, conventionally `<unitId>-<n>`.
- Every lesson has **at least 2** each of `multiple-choice`, `fill-blank` and `translation`.
- MC: `answer` is one of `options`, and the options are distinct.
- Fill-blank: the `prompt` contains `___`.
- `LESSON_META` keys must equal the set of lesson ids **exactly**: no missing and no extra entries. Prereqs must exist and must not form a cycle. Each lesson needs some `goalWeight` ≥ 2.
- Reading chapters: **exactly 4** files, each with a `# Title` over 10 characters and a body over **200 words** (over **300** for bridge/B1/B2 lessons).
- Bridge/B1/B2 lessons: ≥ 7 vocab, **exactly 6** exercises (2/2/2), typed answers ≤ 9 words with no `( ) / ·`.

### Traps

- **The content folder name is `unit.slug`, not the TS filename.** The grammar unit's slug is `grammar`, but its data file is `lessons/grammar-survival.ts`.
- **Chapter order comes from the filename sort.** Keep the `01-`…`04-` prefixes.
- **Derived test-item ids are index-based.** Reordering or inserting exercises shifts `lesson-<id>-<n>`. Saved adaptive-test history in `french-adaptive-test` then points at different questions. Append new exercises rather than inserting them.
- **SRS cards are index-based too.** The key is `${lessonId}::${vocabIndex}` (`vocabKey` in `utils/srs.ts`), persisted in `french-progress.srsData`. Inserting, deleting or reordering vocab moves learners' review history onto a different word. Append vocab at the end, and fix words in place.
- An exercise's `explanation` is what learners see after a miss. The product's whole pitch is "mistakes that teach", so always write one.
- Voice: `funnyNote` and the unit `funnyDescription` are meant to be wry and practical. Read a neighbouring lesson before writing a new one.

## Adding a whole unit

1. Create `src/data/lessons/<unit>.ts` exporting `<camelCase>Lessons`.
2. Import it in `src/data/units.ts` and add a `Unit` entry, **including level flags** (below).
3. Add `LESSON_META` entries for every lesson.
4. Add `src/content/lessons/<slug>/<lessonId>/` chapters (or register interactive lessons).
5. If it's A1 curriculum, add it to `A1_UNIT_IDS` (`units.ts`), which drives the `a1-certified` badge and `isA1Complete`.
6. If it should have a badge, edit the `completeLesson` logic in `src/stores/progressStore.ts` (badges are hardcoded by unit id).
7. The marketing copy in `index.html` ("21 units") is already wrong. Leave it or fix it, but don't trust it.

## Levels: the boolean soup

`Unit` has `isA1: boolean` and `isBeyondA1: boolean` as required fields, plus optional `isPreA1`, `isA1A2`, `isBridge`, `isB1` and `isB2`. They are not mutually exclusive by type, and each consumer reads them in its own order:

| Consumer | Logic |
|---|---|
| `pages/Home.tsx` (section grouping) | "Core French" = `isA1 && !isPreA1 && !isA1A2 && !isBeyondA1` |
| `data/unitDifficulty.ts` `getUnitCEFR` | `isBeyondA1` units fall through to `'a2'` |
| `data/unitDifficulty.ts` `baseDifficulty` | `isBeyondA1` = 1.3, which is *harder* than `isBridge` = 0.9 (a B1 band) |
| `components/home/UnitCard.tsx` | Badge text from `isPreA1` / `isA1` / `isA1A2` / `isBeyondA1` |
| `components/ui/LevelTag.tsx` | Only `isBridge` / `isB1` / `isB2` |
| `stores/progressStore.ts` badges | "Certified Parisien" = every unit that isn't bridge/B1/B2 |
| `data/lessonContent.test.ts` | "Advanced" = `isBridge || isB1 || isB2` |

There is **also** a per-lesson `cefr` in `LESSON_META`, which can disagree with the unit's flags. The learning path (`utils/learningPath.ts`) uses the per-lesson value, and the placement test uses the unit flags.

To place a new unit, **copy the flags from an existing unit at the same tier**:

| Tier (Home section) | Flags |
|---|---|
| Getting Started | `isPreA1: true, isA1: false, isBeyondA1: false` |
| Core French | `isA1: true, isBeyondA1: false` |
| Going Further | `isA1: false, isA1A2: true, isBeyondA1: false` |
| Bonus (hard A2) | `isA1: false, isBeyondA1: true` |
| A2→B1 | `isA1: false, isBeyondA1: false, isBridge: true` |
| B1 / B2 | `isA1: false, isBeyondA1: false, isB1: true` (or `isB2`) |

If you're tempted to refactor this into `tier: '…'`, that's a reasonable improvement, but it touches all of the files above plus the tests. Propose it before doing it.

## `unit12Mode`

`ProgressState.unit12Mode` and `isUnit12Unlocked()` gate the **slang** unit, which was once unit 12. It's unlocked by finishing 2 non-slang units or choosing `'full-freedom'` in Settings. The name is historical, so don't go looking for a twelfth unit.

## Adaptive-test items

- `ITEM_BANK` = derived items (534, one per lesson exercise, resolved live from lesson data) + authored items (`src/data/testItems/*.ts`, aggregated in `authoredTestItems.ts`).
- Authored items can use **topics that aren't units** (`b1-media`, `housing`, …). Each needs an entry in `SYNTHETIC_TOPIC_META` in `testItemBank.ts`, or the results UI shows a 📌 with the raw id.
- `a`/`b` are 2PL parameters; `c` (guessing floor) is computed for MC items as 1/numOptions. Don't hand-set it.

## Interactive lessons

`src/interactive/registry.ts` maps a lesson id to a lazy loader. Five exist: `building-blocks-4`, `pronouns-4`, `numbers-2`, `numbers-3` and `past-tenses-2`. A registered lesson skips the Markdown chapters entirely, so `building-blocks` has only 3 chapter folders for its 4 lessons. That is intentional.
