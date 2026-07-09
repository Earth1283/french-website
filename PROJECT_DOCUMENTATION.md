# French Website: A Love Letter to Chaos

## Overview

This is not a stuffy language learning app. This is **a deliberately unhinged French language learning platform** designed to teach practical, real-world French through personality, humor, and the kind of vocab that actually gets you through Paris without embarrassing yourself (or delighting the locals with your mistakes).

## The Unhinged Philosophy

The French learning experience in this app is built on a core principle: **French people are hilarious, language mistakes are hilarious, and learning should embrace the chaos instead of pretending everything is clinical and orderly.**

Evidence of this philosophy:
- Lessons are titled with personality: "You've earned this. Don't embarrass us." (Slang lesson)
- False cognate warnings: `"Préservatif" is not a preservative` with the note "Do not say 'Je suis blessé' thinking you're saying 'I'm blessed'. You're telling people you're hurt."
- Verlan (French backwards slang) is explained as: "Young French people reverse syllables for slang. It's wild. It's real."
- Every vocab item includes a `funnyNote` field for irreverent, sarcastic, or practical wisdom

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 18.3.1 with TypeScript 5.4.5
- **Build System**: Vite 8.0.0 with @tailwindcss/vite
- **Routing**: React Router DOM 6.23.1 with Hash-based routing
- **State Management**: Zustand 4.5.2 (lightweight, performant)
- **Animation**: Framer Motion 11.0.0 (full-screen transitions, ambient interactions)
- **UI Components**: Lucide React 0.400.0 (icons)
- **Testing**: Playwright 1.60.0 for E2E tests
- **Styling**: Tailwind CSS 4.0.0 with custom CSS variables for theming

### Core Features

#### Lesson System
- **Types of Exercises**: Multiple choice, translation, fill-in-blank, flashcards, conversation mode
- **Progress Tracking**: XP reward system, streak tracking, spaced repetition system (SRS)
- **Content Categories**:
  - Grammar fundamentals ("Building Blocks")
  - Practical survival ("Emergency", "Accommodation", "Medical")
  - Cultural ("Cinema", "Vie Française", "Culture")
  - Linguistic oddities ("False Friends", "Slang", "Verlan")
  - Conversational ("Food", "Shopping", "Trains", "Smalltalk")
  - Numbers, Greetings, Directions, Weather, Plans, Pronunciation

#### User Interface Layers
- **Navbar**: Top navigation with progress bar
- **BottomNav**: Mobile-first navigation menu
- **Ambient Pages**: Full-screen immersive experiences (Landing, Focus mode)
- **Modal System**: Onboarding and overlay interactions
- **Page Transitions**: iOS-style push/pop animations using Framer Motion

#### User Customization
- Dark mode toggle
- Accent color picker (6 colors: red, blue, purple, amber, pink, sky)
- Apple-mode rendering (device-specific polish)
- GPU-reduced mode (for lower-end devices)
- Idle preloading (warm next routes during inactivity)

#### Ambient Features
- **Pomodoro Timer**: Integrated focus session tracker
- **Ambient Clock**: Always-visible time display
- **Phrase of the Day**: Daily French phrase rotation
- **Greeting System**: Context-aware greeting based on time of day
- **Dynamic Backdrop**: Unsplash image integration for immersion

#### Data & Analytics
- **SRS (Spaced Repetition System)**: Intelligent review scheduling
- **Streak Tracking**: Gamification of consistent practice
- **Fuzzy Matching**: Lenient answer validation for user-submitted translations
- **Level Progression**: Multi-tier advancement system
- **Review System**: Dedicated view for revisiting previous lessons

### File Structure

```
src/
├── components/          # React UI components
│   ├── ambient/        # Full-screen immersive UI (clock, timer, phrases)
│   ├── lesson/         # Exercise types (multiple-choice, flashcard, etc)
│   ├── layout/         # Navigation, transitions, progress bar
│   ├── home/           # Home page specific components
│   ├── ui/             # Reusable UI primitives (Button, Modal, Badge)
│   └── ErrorBoundary.tsx
├── data/               # Lesson content & metadata
│   ├── lessons/        # 18 lesson modules (see below)
│   ├── units.ts        # Course structure & progression
│   ├── phrases.ts      # Phrase of the day pool
│   └── scenarios.ts    # Conversation scenarios
├── pages/              # Route-level components
├── stores/             # Zustand stores (progress, conversation)
├── services/           # External integrations (Unsplash)
├── utils/              # Helpers (SRS, speech, fuzzy matching)
├── types/              # TypeScript interfaces
├── hooks/              # Custom React hooks
└── styles/             # Global Tailwind + CSS vars
```

### Lesson Modules

The app includes **18 distinct lesson modules**, each with its own personality:

1. **greetings.ts** - Hello, goodbye, formal vs casual
2. **numbers.ts** - Counting, prices, dates
3. **building-blocks.ts** - Grammar fundamentals
4. **identity.ts** - "Who are you?" conversations
5. **food.ts** - Culinary vocab and ordering
6. **shopping.ts** - Market and store interactions
7. **accommodation.ts** - Hotel and rental scenarios
8. **directions.ts** - Navigation and map vocab
9. **trains.ts** - French rail system mastery
10. **medical.ts** - Health emergencies and symptoms
11. **emergency.ts** - Urgent phrases and safety
12. **weather.ts** - Climate and seasonal talk
13. **smalltalk.ts** - Casual conversation starters
14. **cinema.ts** - Film, entertainment, culture
15. **false-friends.ts** - The trapdoor cognates ("préservatif ≠ preservative")
16. **slang.ts** - Street French that textbooks hide
17. **verlan.ts** - Backwards syllable slang ("ouf" = "fou")
18. **grammar-survival.ts** - Tenses, genders, conjugation hacks
19. **pronunciation.ts** - Phonetic precision and accent
20. **culture.ts** - French social customs and "La Vie Française"

Each lesson module exports a `Lesson[]` array with:
- **id**: Unique identifier
- **title**: Catchy, personality-filled
- **subtitle**: Context-setting and tone
- **xpReward**: Experience points for completion
- **vocab**: Array of vocabulary items with:
  - `french`: The term
  - `english`: Translation
  - `pronunciation`: IPA or Anglicized guide
  - `funnyNote`: **The unhinged part** — sarcastic wisdom
  - `example` (optional): Real usage
  - `exampleTranslation` (optional): What it actually means
- **exercises**: Quiz-style challenges

### Notable "Unhinged" Patterns

#### False Friends Module Highlights
```typescript
// Préservatif is NOT preservative
"Do not say 'Je suis blessé' thinking you're saying 'I'm blessed'. 
You're telling people you're hurt."

// Librairie is NOT library
"Ask for directions to a 'librairie' expecting to borrow books 
and you'll end up buying them."

// Actuellement is NOT actually
"'Actuellement je travaille à Paris' = Currently I work in Paris. 
'En fait' is 'actually'."
```

#### Slang Module Highlights
```typescript
// Verlan (French backwards slang)
title: 'Verlan: French Backwards Slang'
subtitle: "Young French people reverse syllables for slang. It's wild. It's real."

// Ouf (crazy)
"'Fou' (crazy) backwards = 'ouf'. 'C'est ouf!' = That's crazy! 
Used constantly by under-40s."

// Chelou (sketchy)
"'Louche' (shady/sketchy) reversed = 'chelou'. 
'Il est chelou, ce mec' = That guy is sketchy."
```

## Performance Optimizations

### Route-Level Code Splitting
- Each page is lazy-loaded via `lazy()` wrapper
- Import thunks shared between lazy loading and idle preloader
- **IDLE_PRELOAD_ORDER**: Prioritizes likely-next destinations
  1. Home/Dashboard
  2. Unit detail pages
  3. Lessons
  4. Phrasebook
  5. Review queue
  6. Profile
  7. Conversation

### Render Optimization
- AnimatePresence `mode="wait"` prevents flickering transitions
- Ambient pages (Landing, Focus) rendered outside animation flow
- Full-bleed pages avoid layout shift during navigation
- Error boundary prevents entire app crash on component failure

### GPU Management
- `reducedGpu` flag lowers animation complexity
- Different padding strategies for mobile vs desktop
- Tailwind CSS 4.0.0 for minimal CSS footprint

## State Management (Zustand)

### progressStore
Tracks user progression state:
- `darkMode`: Theme preference
- `accentColor`: UI color accent (6 options)
- `appleMode`: iOS-specific rendering
- `reducedGpu`: Animation performance flag
- Lesson completion status
- XP and streak data
- Review queue management

### conversationStore
Manages real-time conversation state for practice mode

## Routing Map

```
/ ........................ Landing page (ambient, full-bleed)
/learn ..................... Home/Dashboard
/unit/:slug ................. Unit detail page
/unit/:slug/lesson/:lessonId  Individual lesson
/phrasebook ................. Searchable phrase database
/converse ................... Conversation practice
/profile .................... User progress & stats
/review ..................... SRS review queue
/settings ................... Preferences & customization
/focus ....................... Pomodoro focus mode (ambient, full-bleed)
```

## The "Unhinged" Makes It Work

### Why This Approach?
1. **Retention**: Humor sticks. Sarcasm is memorable.
2. **Real Preparation**: Slang and false friends are the gaps textbooks leave.
3. **Personality**: French culture is irreverent; the app mirrors it.
4. **Engagement**: Users return for laughs, not obligation.
5. **Accuracy**: The funnyNote warnings prevent the exact mistakes tourists make.

### Example Win
A learner encounters: `"Préservatif" (contraceptive, NOT preservative)`

Without humor: They internalize a definition.  
With the funnyNote: They *never forget* because the embarrassment is part of the learning.

## Cultural Specificity

The app doesn't teach "French for tourists." It teaches:
- **Verlan** — actual slang young Parisians use
- **La Vie Française** — French social conventions and unwritten rules
- **Cinema & Culture** — Why French people care about film
- **Emergency Scenarios** — Real-world survival phrases
- **False Friends** — The exact traps English speakers fall into

## Future Expansion Vectors

Based on the architecture:
- **Audio**: Speech synthesis + speech-to-text for pronunciation
- **Community**: User-submitted funny notes and alternate phrasing
- **Levels**: Spaced repetition fine-tuning for A1→B2 progression
- **Adaptive Difficulty**: AI-driven lesson sequencing
- **Conversation AI**: Claude-powered French conversation partner
- **Mobile App**: Electron/React Native wrapper for offline access

## Development Workflow

### Scripts
```bash
npm run dev      # Vite dev server on --host (accessible remotely)
npm run build    # TypeScript + Vite production build
npm run preview  # Local preview of production build
```

### Development Patterns
- TypeScript for type safety
- Tailwind CSS for rapid styling
- Zustand for simple, explicit state
- Framer Motion for polish
- Playwright for E2E testing

## License & Tone

This is a project built for *people who actually use language*, not for language learners who treat it as a chore. The tone is:
- **Irreverent but accurate**
- **Funny but functional**
- **Practical but playful**
- **Unhinged but effective**

The French app doesn't apologize for being weird because real French communication is weird. Embarrassment is the best teacher.

---

**Built with chaos, shipped with care, learned with laughter.**
