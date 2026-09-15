# Bonjour Survival — Design Spec: *Guide de survie*

Status: **approved direction, pre-implementation** · Confirmed 2026-09-15
Mockups: `docs/mockups/` (served locally on port 9000 during review)

This document replaces the iOS-derived system in `src/styles/globals.css`. Where this spec and existing code disagree, this spec wins; where this spec is silent, ask before inventing.

---

## 1. Concept

You have been teleported to France. The app is your survival guide.

The visual language comes from two French sources, each with a fixed job:

| | Source | Job | Where |
|---|---|---|---|
| **Signs guide** | Paris enamel street plaques, métro line roundels, SNCF departure boards, tickets, postcards | Tell you *where you are* and *where to go next* | Navigation, unit lines, level tags, progress, clock, XP/streak, buttons, teacher tables |
| **The magazine teaches** | French editorial typography, the *cahier* (Seyès-ruled school notebook) | Teach you *French* | Lesson reader, flashcards, exercise prompts & options, phrasebook entries, phrase of the day |

**The one rule:** if it answers "where am I?", it looks like a sign. If it answers "what am I learning?", it looks like a page.

## 2. Principles

1. **Enamel is the brand.** Enamel blue fills the app bar, the tab bar, plaques and the "Vous êtes ici" marker. It is the colour people remember.
2. **Red is rare, so red means something.** At most **one** red-filled control per view (the primary action). Red *text* is reserved for French inside English text and for "Oh non !".
3. **Shape, not shadow.** Surfaces are flat. Objects are told apart by their form — plaque, ticket, board, postcard, cahier card — not by elevation. Shadows exist only on overlays.
4. **Caps only where a French sign would use them** — the wordmark and the postmark. No tracked-out uppercase eyebrow labels anywhere.
5. **Numbers mean sequence.** Line numbers and station order are real sequences. Nothing else gets numbered markers.
6. **One bold object per screen.** Landing: the board. Learn: the ticket. Unit: the line diagram. Lesson: the exercise. Everything around it stays quiet.
7. **Motion is mechanical and earned.** Signs don't bounce. Flip-digits for the few numbers that matter; springs only where your finger drags something.
8. **Write like a helpful sign.** Plain verbs, sentence case, no apology, never vague.

---

## 3. Brand

### 3.1 Name
**Bonjour Survival.** "Oh Non!" is retired as a product name (update `README.rst` title) and lives on as the UI interjection (§3.4).

### 3.2 Wordmark — the street plaque
Enamel-blue plaque, radius 6px, with an inset white frame line (1.5px, 3px in from the edge), set in Archivo at 75% width:

```
╭────────────────────╮
│ ┌────────────────┐ │
│ │    B O N J O U R    │ │   9px / 600 / tracking .22em
│ │    SURVIVAL    │ │   19px / 800 / tracking .03em
│ └────────────────┘ │
╰────────────────────╯
```

- Sizes: **header** (above), **large** (loading screen: 15px / 44px).
- On an enamel app bar the fill disappears into the bar and the white frame carries the shape — this is intended.
- Never recolour, never set in Newsreader, never add the flag.

### 3.3 App icon
White roundel, 6px enamel ring (at 64px), signal-red "!" in Archivo Black-weight condensed. Replace `public/favicon.svg`, `apple-touch-icon.png`, manifest icons, Tauri icons.

### 3.4 Voice — "Oh non !"
- Written with a narrow no-break space before the "!" (`Oh non !`), as French typography requires.
- Used on **learner surfaces only**: wrong answers, error states, empty states, 404.
- Never on correct answers, never on teacher pages (teachers get plain error text).
- It opens the message; the rest says what happened and what to do: "Oh non ! *That's the word for bread.* The bill is **l'addition**."

---

## 4. Colour

All values verified for WCAG 2.2 AA (ratios below). Tokens live on `:root` and are overridden under `.dark`.

### 4.1 Light

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--paper` | `#F2EFE9` | Page ground | — |
| `--sheet` | `#FBFAF6` | Raised surfaces (tickets, cards, rows on hover) | — |
| `--inset` | `#E8E3D9` | Wells, tracks | — |
| `--rule` | `#CFC7B8` | Decorative dividers only | non-text |
| `--rule-strong` | `#5C6074` | Control boundaries (inputs, options, secondary buttons) | 5.4:1 on paper |
| `--ink` | `#16213E` | Primary text | 13.9 paper / 15.2 sheet |
| `--ink-2` | `#474D63` | Secondary text | 7.3 / 8.0 |
| `--ink-3` | `#5C6074` | Tertiary text, captions | 5.4 / 6.0 / 4.9 inset |
| `--enamel` | `#1E3F8A` | Wayfinding fill | white on it 9.8 |
| `--enamel-text` | `#1E3F8A` | Links, icons, focus rings on paper | 8.6 |
| `--on-enamel-2` | `#B9C8EC` | Inactive nav labels on enamel | 5.9 |
| `--signal` | `#B91D2A` | Primary action fill | white on it 6.4 |
| `--signal-text` | `#B91D2A` | French-in-English, "Oh non !", drop caps | 5.6 / 6.2 / 5.0 inset |
| `--amber` | `#E0A526` | XP & streak fill (always `#16213E` text on top) | ink on it 7.3 |
| `--amber-text` | `#855600` | XP values as text | 5.5 |
| `--go` | `#2A6649` | Correct / done | 5.9 |

**Usage ratio (per screen, roughly):** 70% paper/sheet · 20% ink · 7% enamel · ≤3% red · amber as small chips only.

### 4.2 Dark — "Paris at night"
Same roles, same meanings; values step brighter for contrast.

| Token | Hex | Contrast |
|---|---|---|
| `--paper` | `#0C1222` | — |
| `--sheet` | `#151C30` | — |
| `--inset` | `#0A0F1C` | — |
| `--rule` / `--rule-strong` | `#2A3354` / `#9094A4` | — / 6.2 |
| `--ink` / `--ink-2` / `--ink-3` | `#EEE7D8` / `#B8B2A6` / `#9094A4` | 15.2 / 8.9 / 6.2 |
| `--enamel` | `#22397A` | white on it 10.9 |
| `--enamel-text` | `#8FAAE6` | 8.1 |
| `--enamel-edge` | `#34509A` | 1px top/bottom edge so bars separate from the dark ground |
| `--signal` (fill) | `#B91D2A` | white on it 6.4 |
| `--signal-text` | `#FF7A80` | 7.4 |
| `--amber` / `--amber-text` | `#F2B33D` | 10.0 |
| `--go` | `#62C495` | 8.8 |

### 4.3 The departure board
Identical in both themes (it is an object, not a surface): `--board #10172B`, `--board-cell #1A2340`, `--board-rule #243056`, `--board-text #FFFFFF` (17.8), `--board-dim #9AA3BD` (7.1), `--board-amber #F2B33D` (9.6).

### 4.4 Forbidden
- Red as a line colour, a chart series, a decorative fill, or a second primary button.
- Enamel fill for anything that is not wayfinding.
- Colour as the only signal: correct/wrong always carry an icon **and** text.
- Raw hex or Tailwind palette classes (`bg-purple-100`, `text-slate-500`…) in components. Tokens only.

---

## 5. The line system (units)

Each unit is a **line**: a numbered roundel in a line colour. Colour tells you the **level** at a glance; the number tells you **which unit**. Emoji leave the interface (they remain inside lesson content only).

### 5.1 Colours

| Level | Token | Hex | White numeral |
|---|---|---|---|
| Getting started (Pre-A1) | `--line-start-a` / `-b` | `#1E7A4F` / `#44702A` | 5.3 / 5.8 |
| Core French (A1) | `--line-core-a` / `-b` / `-c` | `#1D5FA6` / `#0E6E8C` / `#157A74` | 6.5 / 5.8 / 5.2 |
| Going further (A1–A2) | `--line-further-a` / `-b` | `#9A6408` / `#A8521C` | 5.0 / 5.4 |
| Bonus | `--line-bonus-a` / `-b` / `-c` | `#6B3FA0` / `#A0327A` / `#7A3E9A` | 7.4 / 6.5 / 7.0 |

Shades alternate within a level so neighbouring lines never match. **Dark mode:** roundels gain a 2px `--ink` ring (`--roundel-ring`), because line colours sit below 3:1 against `#0C1222`.

### 5.2 Numbering
Lines are numbered **1–21 in the order Learn displays them** (grouped by level), not data-file order:

| # | Unit id | Title | Level | Colour |
|---|---|---|---|---|
| 1 | `pronunciation` | Your Mouth Is Lying to You | Getting started | start-a |
| 2 | `building-blocks` | The Vocab You're Missing | Getting started | start-b |
| 3 | `emergency` | Oh Non, I'm in France | Core | core-a |
| 4 | `food` | Feed Me or I'll Cry | Core | core-b |
| 5 | `directions` | Where On Earth Am I? | Core | core-c |
| 6 | `numbers` | Money Talks (Poorly) | Core | core-a |
| 7 | `greetings` | Bonjour, Everyone | Core | core-b |
| 8 | `shopping` | Retail Therapy | Core | core-c |
| 9 | `accommodation` | A Bed, Please | Core | core-a |
| 10 | `medical` | I Am Dying (Probably) | Core | core-b |
| 11 | `smalltalk` | Weather & Vibes | Core | core-c |
| 12 | `grammar` | Grammar Survival Kit | Core | core-a |
| 13 | `identity` | Who Even Are You? | Going further | further-a |
| 14 | `weather` | The Forecast for Awkward Silence | Going further | further-b |
| 15 | `plans` | Actually Doing Things | Going further | further-a |
| 16 | `vie-francaise` | Vivre à la Française | Going further | further-b |
| 17 | `false-friends` | False Friends Will Betray You | Bonus | bonus-a |
| 18 | `slang` | Unlocked: The Good Stuff | Bonus | bonus-b |
| 19 | `trains` | The Train Will Leave Without You | Bonus | bonus-c |
| 20 | `culture` | How Not to Be That Tourist | Bonus | bonus-a |
| 21 | `cinema` | Culture Vulture | Bonus | bonus-b |

Implementation: a new `src/data/lines.ts` derives `{ number, colorToken, level }` from level grouping + `UNITS` order, so adding a unit renumbers automatically. `Unit.color`, `Unit.accentColor` and UI use of `Unit.emoji` are removed. The Settings label "Unit 12 Access (Slang & Swearing)" becomes **"Slang unit access"** (no number — the internal `unit12Mode` key stays, so no migration is needed).

### 5.3 Roundel
Circle, Archivo 800 at 88% width, numeral = 50% of diameter, tabular figures. Sizes: 24 (inline), 32 (rows), 56 (unit header), 72 (hero). Accessible name: "Line 4". Locked: `--inset` fill, `--ink-3` numeral, 1.5px `--rule-strong` ring, plus a lock icon and the word "Locked" beside it.

---

## 6. Typography

### 6.1 Families
Two variable families, both **OFL-1.1**, bundled with the app (no Google Fonts request, so the PWA and Tauri builds work offline).

| Family | Package | Axes used | Role |
|---|---|---|---|
| **Archivo** | `@fontsource-variable/archivo` → `wdth.css` | wght 100–900, **wdth 62–125** | Everything that is a sign: UI, nav, buttons, tables, board, plaques |
| **Newsreader** | `@fontsource-variable/newsreader` → `opsz.css`, `opsz-italic.css` | wght 200–800, **opsz 6–72**, italic | Everything that teaches: reader, French words, prompts, flashcards |

Verified in Chromium: both families support `font-variant-numeric: tabular-nums` (Archivo "1111" and "0000" render at identical widths only with it on), and Archivo's `font-stretch` 75%↔125% resolves to the width axis. French diacritics and « » are covered.

Removed: Playfair Display (and its Google Fonts `<link>` in `index.html`), the SF Pro system stack as the primary face.

### 6.2 Widths
- `--w-condensed: 75%` — plaques, board titles, status cells, flip digits
- `--w-semi: 88%` — page and section headings, nav labels, roundel numerals
- `100%` — body UI text
- `--w-expanded: 125%` — join codes only

### 6.3 Scale
Bringhurst's classic scale, in rem: **12 · 14 · 16 · 18 · 21 · 24 · 36 · 48 · 60 · 72** (`--t-12` … `--t-72`).

| Role | Family | Size / line-height | Weight | Width |
|---|---|---|---|---|
| Page title | Archivo | 36 / 1.08 | 700 | 88% |
| Section heading | Archivo | 24 / 1.15 | 650 | 88% |
| Title (row, card) | Archivo | 18 / 1.25 | 600 | 100% |
| Body UI | Archivo | 16 / 1.5 | 400 | 100% |
| Small / caption | Archivo | 14 / 1.4 | 400 | 100% |
| Micro (tags, tab labels, table headers) | Archivo | 12 / 1.2 | 600 | 100% or 88% |
| Reader display | Newsreader | 36 / 1.1 | 500 | opsz auto |
| Reader body | Newsreader | 18 / 1.7, max 64ch | 400 | opsz auto |
| Exercise option | Newsreader italic | 21 / 1.25 | 500 | — |
| Flashcard word | Newsreader italic | 48 / 1.05 | 500 | — |

Minimum text size anywhere: 12px.

### 6.4 French text rules
- **French inside English** (running text, hints, explanations): Newsreader italic, `--signal-text`. In markdown, authors wrap the French in `*asterisks*` (the reader's `em` does the rest — unchanged from today).
- **French standing alone** as the subject (flashcard front, answer options, phrasebook headword, phrase of the day): Newsreader italic in `--ink`, at a larger size. Red would drown a screen of options.
- Pronunciation guides: Archivo 14–16, `--ink-3`, no slashes or italics.
- French punctuation in French strings: narrow no-break space (U+202F) before `! ? ; :` and inside « guillemets ».
- `lang="fr"` on every French span, so screen readers switch voice.

---

## 7. Space, density, shape

### 7.1 Adaptive density
Density follows the viewport, with a coarse-pointer override so touch Chromebooks keep full tap targets.

| Token | < 640px | ≥ 640px | ≥ 1024px |
|---|---|---|---|
| `--gutter` | 16 | 24 | 32 |
| `--row` (list row min-height) | 52 | 48 | 44 |
| `--stack` (between sections) | 24 | 32 | 40 |
| `--tap` (min control height) | 44 | 44 | 36 (44 if `pointer: coarse`) |

**Ledger (teacher tables)** is always compact: 42px rows, 14px text, 12px headers — at every width.

Spacing inside components uses a 4px grid (4, 8, 12, 16, 20, 24). Content max-width 1120px; reading measure 64ch.

### 7.2 Shape vocabulary
Radius has hierarchy; no pill buttons.

| Object | Radius | Form |
|---|---|---|
| Plaque (wordmark, "Vous êtes ici") | 6px | Enamel fill, optional inset frame |
| Control (button, input, option, key) | 8px | — |
| Sheet (generic surface, board) | 12px | 1px `--rule` border |
| Ticket | 14px | Two semicircular notches at the perforation, dashed perforation line |
| Postcard | 6px | Photo side + message side, stamp, postmark |
| Cahier card (flashcard) | 12px | Red margin line + faint blue Seyès ruling |
| Roundel, station dot | 50% | — |

### 7.3 Elevation
Flat. `--lift` (`0 10px 30px rgba(22,33,62,.18)`; dark `rgba(0,0,0,.5)`) is used **only** on modals, menus, toasts. `--shadow-1/2/3`, `.glass`, `.glass-card` and `backdrop-filter` are deleted.

---

## 8. Motion

| Token | Value |
|---|---|
| `--dur-1` | 120ms — hover, press |
| `--dur-2` | 180ms — page transitions, disclosure |
| `--dur-3` | 240ms — flip-digit |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |

**What moves:**
- **Page transitions** — going deeper (Learn → Unit → Lesson) slides 12px from the right with a fade over 180ms; going back reverses; switching tabs is a cut. `PageTransition` receives a direction from a route-depth map.
- **Flip-digits** — landing/focus clock, XP total when it changes, test score reveal. Each changed character flips once (240ms). Nothing else flips.
- **Flashcard** — keeps its drag + 3D flip; the only spring in the app.
- **Press** — `translateY(1px)` + fill darkens 14%. The global `whileTap={{ scale: 0.97 }}` pattern, `TAP_SPRING`, `.ios-press`, the nav "pop" spring and `layoutId` bubbles are removed.
- **Station progress** — when a lesson completes, the line segment to the next station draws in (240ms).

**What doesn't:** section entrances, staggered card reveals, hover lifts, badge pops. `prefers-reduced-motion: reduce` → all of the above become instant swaps, flip-digits included.

---

## 9. Iconography
- **Lucide** stays. Stroke 1.75 (2.2 inside amber chips), sizes 16 / 20 / 24, `currentColor`.
- Tab icons: Learn `map`, Practice `target`, Phrasebook `book-open`, Me `circle-user-round`, Class `graduation-cap`.
- **Emoji are content, not chrome.** Remove them from: unit tiles, nav chip (🔥/⚡ → `flame`/`zap`), lesson intro chips (📖/✏️), toasts (🎉), boot screen (🇫🇷). They may remain inside lesson text, scenario descriptions and funny notes.
- `FrenchFlag` component is removed from chrome.

---

## 10. Components

Each replaces something that exists today. The old CSS utilities in `globals.css` (`.card`, `.card-lift`, `.glass*`, `.ios-press`, `.inset-group`, `.inset-row`, `.btn-*`, `.xp-badge`, `.a1-tag`, `.chip`, `.ios-input`, `.seg-*`, `.section-label`) are deleted in phase 7.

| Component | Replaces | Anatomy & rules |
|---|---|---|
| **Button** (`ui/Button.tsx`) | `Button` + `.btn-*` classes | Variants: `primary` (signal fill, white), `secondary` (sheet, 1px `--rule-strong` inset border), `quiet` (enamel-text, underline on hover), `onEnamel` (for the app bar). Sizes `md` (min-height `--tap`) / `sm` (34px). Radius 8. Label: verb-first sentence case, no trailing arrow. One `primary` per view. |
| **Roundel** | emoji tile | §5.3 |
| **LevelTag** | `.a1-tag`, raw Tailwind badges | 9px square swatch in the level's `-a` line colour + Archivo 12/600 `--ink-2`. Labels: "Pre-A1", "A1", "A1–A2", "Bonus". No pill background. |
| **StatChip** | `.xp-badge`, streak chip | Amber fill, `#16213E` text, Archivo 14/700 tabular, radius 8, icon 16. "12-day streak", "240 XP". |
| **Wordmark** | Flag + text | §3.2 |
| **AppBar** (≥768px) | `Navbar` | Enamel, 60px, wordmark · 5 nav links (active = white label + 3px white underline) · end slot: StatChip, search (Learn only). Dark-mode toggle moves to Settings. No glass, no scroll-shadow. |
| **TabBar** (<768px) | `BottomNav` (both variants) | Enamel, full-width, 62px + safe area, 4–5 equal columns, icon 20 + label 12. Active = white + 3px top bar. No floating pill, no bubble. |
| **Ticket** | "Continue" glass card, "Up next" widget | Stub (roundel + "Line 4") · dashed perforation · body (lesson title, unit, lesson x of y, one primary button). Notches via CSS mask. |
| **LineRow** | `UnitCard` grid | Roundel · title + tagline · StationDots. Rows sit on paper separated by `--rule`, hover → sheet. Two columns ≥1024px. |
| **StationDots** | `ProgressBar` on unit cards | One dot per lesson joined by 2px line segments: done = filled line colour, next = thicker ring, todo = ring. |
| **LineDiagram** | Unit lesson `inset-group` | Vertical 6px line in the unit colour; station per lesson; travelled portion solid, remainder at 30%. Current station shows the **"Vous êtes ici / You are here"** plaque. |
| **TripProgress** | Lesson `ProgressBar` | 8px track in `--inset`, filled in the unit's line colour, divided into one tick per step. |
| **Board** | Ambient launcher, Practice list, student assignments | `--board` object, radius 12. Head (title + English gloss) and rows: glyph/roundel · destination + via · status (amber when "Now"). Whole row is the link. |
| **FlipClock** | `AmbientClock` | Condensed Archivo digits in `--board-cell` flaps with a split line; `aria-hidden` digits + a visually hidden plain time. French date below, English on hover/focus (kept from today). |
| **Postcard** | Full-bleed `Backdrop` | Unsplash photo side (attribution stays, per Unsplash guidelines) + message side: stamp, postmark with today's date (it overlaps the stamp's edge, never the phrase), phrase in Newsreader italic, English, pronunciation, audio button. Night window (1–4:30 AM) still swaps in the night-sky photo. Gradient placeholder when there is no key. |
| **OhNon** | Red-tinted feedback boxes | 4px `--signal-text` left bar on sheet; "Oh non !" (Newsreader italic 21) + message. |
| **Option** | `MultipleChoice` buttons | Key cap (1–4) · French in Newsreader italic · audio. Correct = 2px `--go` border + 6px left bar + check; wrong = same in signal + cross; others dim to 55%. |
| **KeyCap** | "Press 1–4" hint text | 26px, radius 5, bottom inset edge. |
| **CahierCard** | `FlashCard` faces | Sheet with red margin line at 40px and 32px Seyès ruling at 16% enamel; word in Newsreader italic 48. |
| **Field** | `.ios-input` | Sheet, 1px `--rule-strong`, radius 8, focus = 2px enamel-text outline. |
| **Tabs** | `.seg-control` | Underline tabs: 14/600, active = ink + 3px enamel-text underline. |
| **Ledger** | Teacher `inset-group` lists | Table; sticky 12/600 headers (sentence case) over a 1px `--rule-strong`; 42px rows; numbers right-aligned tabular; inline `Meter` (72×6, enamel-text) for scores; flag counts in signal-text. |
| **JoinTicket** | Join code card | Ticket with the code in Archivo 36/700 at 125% width, tracking .08em; Copy (secondary) and "New code" (quiet). Carries `data-testid="join-code"`. |
| **Bars** | `MissedQuestionsChart` styling | Single series in `--enamel-text` (never red), 12px bars, question text above each bar, % right-aligned tabular. Recharts axis/grid colours → `--ink-3` / `--rule`. |
| **Stamp** | `Badge` (Profile) | Earned badges become passport stamps (enamel outline, rotated −6°…6°); locked ones are dashed outlines. Not in the first mockup set. |

Focus ring everywhere: 2px `--enamel-text`, 2px offset; on enamel surfaces the ring is white; on the board it is `--board-amber`.

---

## 11. Navigation & information architecture

### 11.1 Tabs

| Tab | Route | Also active on | Contains |
|---|---|---|---|
| **Learn** | `/learn` | `/unit/*`, `/review` | Today, Revisit, the line network |
| **Practice** *(new hub)* | `/practice` | `/converse`, `/test`, `/focus` | Board of practice modes |
| **Phrasebook** | `/phrasebook` | — | — |
| **Me** | `/profile` | `/settings` | Stats, level, stamps, settings, "Join a class" |
| **Class** | `/classes` | `/classes/*` | Shown **only** when `useClassroomStore(s => s.role)` is non-null |

- Signed-out users reach a class via **Me → Join a class** (`/classes/connect`); after sign-in the Class tab appears.
- Dark mode toggle leaves the app bar for **Me → Settings**.
- Ambient routes (`/` landing, `/focus`) keep hiding the chrome, as today.

### 11.2 Settings removed
Accent colour presets, "Apple-ify", "Reduce GPU" (nothing heavy remains). See §14.2 for the store migration.

---

## 12. Screen blueprints

ASCII shows the phone layout unless marked. Mockup file in brackets.

### 12.1 Landing `/` and Focus `/focus` — [`landing.html`]
The bold object is the **departure board**.

```
┌ phone ─────────────────────────┐
│ [BONJOUR SURVIVAL]    Open app │
│┌ board ─────────────────────── ┐│
││   ▐1▌▐4▌ : ▐0▌▐7▌  (flip)     ││
││   mardi 15 septembre          ││
││ Bonsoir  Good evening         ││
││───────────────────────────────││
││ (4) Continue: Order politely  ││
││     Feed Me or I'll Cry …  NOW││
││ ◯  Phrasebook            Open ││
││ ◯  Practice          Last: A1 ││
││ ◯  Focus              25 min  ││
│└───────────────────────────────┘│
│┌ postcard ─────────────────────┐│
││ [photo]         [stamp]       ││
││ Petit à petit, l'oiseau…  🔊  ││
│└───────────────────────────────┘│
│  [flame 12-day streak] [zap 240]│
└────────────────────────────────┘
desktop ≥1024: board (left, 7/12) · postcard + stats (right, 5/12)
```
**Focus** reuses the board: the clock row, a *Pomodoro* row that counts down in flip-digits, and "Le mot du moment" as the postcard. Completion toast: "Bravo ! +5 XP" (no emoji).

### 12.2 Learn `/learn` — [`learn.html`]
The bold object is the **ticket**.

```
┌ phone ─────────────────────────┐
│▓ [BONJOUR SURVIVAL]  🔍 [240 XP]▓│  enamel app bar (tab bar at bottom)
│ Today                          │
│┌─stub─┬─ticket─────────────────┐│
││ (4)  ┊ Order politely         ││
││Line 4┊ Feed Me or I'll Cry    ││
││      ┊ Lesson 2 of 4          ││
││      ┊ [ Continue lesson ]    ││
│└──────┴────────────────────────┘│
│ ↻ 14 cards due        Review   │
│ Revisit                        │  only when non-empty
│  (10) Symptoms …   Needs practice│
│ Your lines                     │
│ ■ Getting started              │
│  (1) Your Mouth Is Lying… ●●●○ │
│  (2) The Vocab You're…    ●○○○ │
│ ■ Core French                  │
│  (3) Oh Non, I'm in France ●●●●│
│  …                             │
└────────────────────────────────┘
desktop ≥1024: Today + Revisit in a left column (5/12), line network in two columns right (7/12)
```
- New users (no completed lessons) replace Today with the only hero in the app: "You've been teleported to France." (Newsreader display, no accent word) and a single "Start line 1" button.
- Search is an icon in the app bar that reveals a field above the network (filters lines by title/tagline, as today).
- Removed: floating "Up next" widget, A1 banner as a separate block (its message moves into the Core French group heading), duplicate streak row, footer quip.

### 12.3 Unit detail `/unit/:slug` — [`unit.html`]
The bold object is the **line diagram**.

```
 ‹ Learn
 (4)  Line 4 · A1
 Feed Me or I'll Cry
 Food, cafés & restaurants
 The croissant is your first friend… (Newsreader 18)
 ┃
 ● Order a coffee without panic      +20 XP
 ┃
 ◉ [Vous êtes ici  You are here]
 ┃ Order politely                    [Start]
 ┆
 ○ The bill, please                  +25 XP
```
Locked unit (slang before unlock): roundel locked, "Complete 2 lines to unlock this one." + "Back to Learn" (secondary).

### 12.4 Lesson `/unit/:slug/lesson/:id` — restyle only [`lesson.html`]
Structure and flow stay (intro → read → flashcards → exercises → complete). Lesson and reader screens hide the app bar and tab bar; the lesson bar's close button returns to the unit.
- Top bar: back chevron · TripProgress in the unit colour · "7 / 12" tabular · bookmark (quiet icon, filled enamel when saved).
- Exercise prompt: Archivo 21/600. Hints: Archivo 14 `--ink-3` with French in `.fr`.
- Options: §10 Option; KeyCaps replace "Press 1–4 to select".
- Wrong answer: OhNon callout with the correct answer + audio.
- Flashcards: CahierCard; "Card 3 of 8. Tap or swipe to flip." as caption.
- Lesson complete: roundel draws its next station; XP flips; one primary "Next lesson", one quiet "Back to Line 4".

### 12.5 Reader (deep lessons) — [`reader.html`]
Keeps `.prose-reading` behaviour, re-set in Newsreader: 18/1.7, 64ch, display title 36, drop cap in signal-text on page 1, `em` = French (signal italic), tables in Ledger style with the French column in Newsreader italic. Page indicator = StationDots in the unit colour; "6 min read" as a caption, not a chip.

### 12.6 Practice `/practice` (new) — [`practice.html`]
A board titled "Practice", rows: **Converse** ("Scripted scenarios" or "AI conversations on" when a Gemini key exists) · **Find your level** (last result, e.g. "Last: A1 upper") · **Focus** ("25 min"). Below the board, due reviews ("14 cards due", secondary "Review cards").

### 12.7 Teacher pages — remade, ledger style
Compact density always. Page titles are Archivo; no Newsreader except inside assignment content previews.

**Class detail `/classes/:id`** — [`class.html`], desktop ≥1024:
```
 ‹ Classes
 Period 2 French                          [Assign content]
┌ left 8/12 ─────────────────────────┐ ┌ right 4/12 ─────────┐
│ Roster  24 students                │ │ JoinTicket  K7Q-4MX │
│ Name        Email      Done  Avg   │ │ [Copy] New code     │
│ Amara K.    …          5/6  82% ▬  │ ├─────────────────────┤
│ …                                  │ │ Assignments         │
│                                    │ │ Greetings quiz  ⚑2  │
│                                    │ │ Café reading        │
└────────────────────────────────────┘ └─────────────────────┘
```
Phone: JoinTicket → Assignments → Roster (ledger scrolls horizontally inside its container). Per-student "Reset password" moves into a row action menu; Archive moves to a quiet button at the page end.

**Assignment results** — [`results.html`]: Bars "Most missed questions" (left 7/12) · "Flagged by students" ledger with Resolve buttons (right 5/12).

**Other teacher pages** (not mocked, follow the same parts): ClassesHome = ledger of classes with join codes; ContentLibrary = ledger with kind tags; ContentEditor = single 720px column of Fields with MarkdownField preview in reader style; Auth / Connect / AccountSettings = 480px centred sheet under a large wordmark. **StudentHome** = a Board of assignments with due status ("Due Fri" in amber, "Done" in dim).

### 12.8 Loading screen (`index.html#boot`) — [`boot.html`]
Paper ground (dark: `#0C1222`), large wordmark centred, beneath it a slim board strip whose status text changes with each chunk ("Loading the lines…", "Prêt !"). Progress track 3px, enamel. Reads `darkMode` from storage as today; **no longer reads `accentColor`**.

---

## 13. Accessibility checklist
- All text pairs in §4 meet AA; control boundaries use `--rule-strong` (≥3:1).
- Correct/wrong/done never rely on colour alone (icon + text).
- Roundels, station dots and trip progress expose text: "Line 4", "Lesson 2 of 4, current", `aria-valuenow`.
- FlipClock digits are `aria-hidden`; a sibling `sr-only` element holds the time and updates at most once a minute.
- `lang="fr"` on French; audio buttons labelled "Hear *phrase*".
- Tap targets ≥44px on touch (`pointer: coarse`), ≥36px with a fine pointer.
- Focus rings visible on every surface (§10).
- Reduced motion honoured (§8). No transparency effects remain, so `prefers-reduced-transparency` needs no handling.
- Tailwind's `dark:` variant currently follows the **OS** setting, not the app toggle (`globals.css` never declares `@custom-variant dark`), so today's `dark:bg-*` badges can mismatch the theme. Phase 1 adds `@custom-variant dark (&:where(.dark, .dark *));` and phase 7 removes the remaining raw `dark:` palette classes.

---

## 14. Implementation

### 14.1 Token plumbing (Tailwind v4)
- Tokens live in `src/styles/tokens.css` (the mockups' `docs/mockups/assets/tokens.css` is the reference copy).
- `@theme inline` maps them to utilities so components write `bg-sheet text-ink border-rule` instead of `style={{ … 'var(--…)' }}` — this is how the ~328 inline style objects go away.
- Unit colour is passed as a CSS variable on the element (`style={{ '--line': 'var(--line-core-b)' }}`) — the single allowed inline style pattern.

### 14.2 Store migration (`src/stores/progressStore.ts`)
`persist` currently has no `version`. Add `version: 1` with a `migrate` that deletes `accentColor`, `appleMode` and `reducedGpu`, and remove those fields, setters and types (`ProgressState` in `src/types/index.ts`). Also:
- `App.tsx`: remove `ACCENT_HOVER`, the `--accent` setters and the `apple-mode` class toggle.
- `Settings.tsx`: remove the accent, Apple-ify and Reduce GPU controls; progress **import** must ignore an `accentColor` key in older export files (see `Settings.tsx:63` and `:96`).
- `index.html`: boot script stops reading `accentColor`; `theme-color` meta → `#1E3F8A`; remove the Playfair `<link>`; update `public/manifest.json` theme colour.
- `BottomNav.tsx`: remove the `reducedGpu` branch.

### 14.3 Phases
Each phase is its own PR off a `design/guide-de-survie` branch. **Gate for every phase:** `npm run build`, `npm test`, `npm run e2e` all green, plus the screenshot suite once it exists.

| # | Phase | Main files |
|---|---|---|
| 1 | **Foundations** — tokens, fonts, `@theme`, dark variant, primitives (Button, Roundel, LevelTag, StatChip, Field, Tabs, Ticket, Board, OhNon), store migration, `lines.ts`, screenshot test harness; move the e2e join-code locator (`e2e/classroom.spec.ts:36`, `span.font-mono`) to `getByTestId('join-code')` | `styles/*`, `components/ui/*`, `stores/progressStore.ts`, `data/lines.ts`, `e2e/*` |
| 2 | **Shell & navigation** — AppBar, TabBar, `/practice` route + hub, conditional Class tab, Me → Join a class, route-depth page transitions | `App.tsx`, `components/layout/*`, `pages/Practice.tsx` |
| 3 | **Learn & Unit** — Today ticket, Revisit, network, LineDiagram, locked state | `pages/Home.tsx`, `pages/UnitDetail.tsx`, `components/home/*` |
| 4 | **Landing, Focus, boot** — Board, FlipClock, Postcard, loading screen, wordmark & icons | `pages/Landing.tsx`, `pages/Focus.tsx`, `components/ambient/*`, `index.html`, `public/*`, `src-tauri/icons` |
| 5 | **Lessons restyle** — Option, KeyCap, CahierCard, TripProgress, OhNon, reader, lesson complete | `pages/Lesson.tsx`, `components/lesson/*`, `pages/Review.tsx` |
| 6 | **Teacher & student pages remake** — Ledger, JoinTicket, Bars, two-column layouts, StudentHome board | `pages/classroom/*`, `components/classroom/*` |
| 7 | **Cleanup** — delete old utilities and classes, remaining inline styles, `Unit.color/accentColor`, emoji in chrome, `FrenchFlag`, `utils/motion.ts` spring; Phrasebook, Profile (stamps), Settings, Conversation, AdaptiveTest restyled to the parts | everything left |

### 14.4 Screenshot tests
Add a Playwright project that captures Landing, Learn, Unit, Lesson (option + wrong state), Practice, Class detail and Results at 390×844 and 1280×800, in light and dark, with the clock frozen (`page.clock`) and fixed progress fixtures. Baselines are refreshed only in PRs that intend a visual change.

---

## 15. Validate in the mockups before phase 1
- Board legibility and row height at 390px; board contrast against the dark paper.
- Ticket notch mask in Safari (needs `-webkit-mask-composite`).
- Roundel ring in dark mode reads as intentional.
- Seyès ruling stays quiet enough behind a 48px word.
- Amber chips next to the enamel app bar.
