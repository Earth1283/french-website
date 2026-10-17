==============================
🥖 Oh Non! Le French Website
==============================

*Survival French for the Brave, the Hungry, and the Chronically Confused.*

------------------------------------------------------------------------

Welcome to **Oh Non!**, the only French learning platform that assumes you've just been teleported to the middle of Paris with nothing but a smartphone and a deep-seated fear of being judged by a waiter.

Why this app?
=============

Because most language apps spend three weeks teaching you how to say "The apple is red." In the real world, you don't need to know the color of the apple; you need to know how to:

*   **🚨 Survive an Emergency:** "Oh Non, I'm in France" (Unit 1).
*   **🥐 Secure a Croissant:** "Feed Me or I'll Cry" (Unit 2).
*   **💶 Avoid Bankruptcy:** €4.50 for an espresso? You need "Money Talks (Poorly)" (Unit 4).
*   **🪤 Dodge Betrayal:** "False Friends Will Betray You" (Unit 10).

Features
========

*   **Ambient Landing & Focus Mode:** The front door is a calm, full-bleed ambient screen — a giant live clock, a time-aware French greeting (*Bonjour* / *Bon après-midi* / *Bonsoir*), a *phrase du jour* with audio, and a glass launcher into the app. The date shows in French and morphs to English on hover. A dedicated **Focus mode** (``/#/focus``) adds a Pomodoro study timer with a rotating French *mot du moment*. Backdrops are fetched live from Unsplash — French scenes by day, a cosmic night sky in the small hours (1–4:30 AM) — and gracefully fall back to gradient skins when no key is set.
*   **Lessons That Explain Themselves:** Every lesson opens with four short reading chapters (or an interactive walkthrough) on the why: the grammar, the sound, the cultural trap. Then come flashcards, multiple choice, fill-in-the-blank and "say it in French" exercises.
*   **Mistakes That Teach:** A wrong answer doesn't flash red and vanish. You see what you wrote, the right answer with audio, and a one-line explanation of *why*, and the lesson waits until you continue. Anything you miss comes back once at the end of the lesson, so you finish by getting it right.
*   **An Honest Finish:** The end of a lesson shows how many you got right first time, every phrase you can now say (tap to hear it), and the explanations for your misses. No confetti.
*   **Unit-Based Learning:** From A1 basics to "Unlocked: The Good Stuff" (slang).
*   **Spaced Repetition Review:** SM-2 algorithm schedules vocab reviews at the optimal moment — 1 day, then 3, then a week, then longer. New cards ask what the French means; once you know a card, it flips and asks you to *produce* the French from the English, which is the direction you need when you're ordering. A review banner on the home screen tells you when cards are due.
*   **No Streak Guilt:** Progress counts the days you've practised in total. Miss a week and nothing resets.
*   **Audio Pronunciation:** Tap any 🔊 button to hear French spoken aloud. Available on flashcards, phrasebook, and on answer reveals in exercises. Uses the Web Speech API — no API key, works offline.
*   **Speaking Practice:** Answer "Say it in French" exercises and well-known review cards out loud — tap the 🎤 and say it. The grader knows French homophones (*parle* / *parles* / *parlent*) and reads numbers, prices and times the way recognisers write them, so you're marked on what you said, not how the engine spelled it. Conversation mode takes spoken replies and can read the other side aloud, and DELF transcripts have shadowing: replay a line, say it back, and see which words you dropped. Uses the browser's speech recognition (Chrome, Edge, Safari); everywhere else, typing works as before.
*   **Gemini Voices (optional):** With a Gemini key, switch the voice in Settings to one of Gemini's studio voices for more human-sounding French. Each phrase is generated once and kept on your device, so replays are free and work offline. DELF listening keeps device voices.
*   **Lesson Bookmarks:** Save any lesson for later with the bookmark icon in the lesson header. Bookmarked lessons appear as quick-links on the home screen.
*   **Keyboard Shortcuts:** In lessons — ``←`` / ``→`` navigate flashcards, ``Space`` / ``F`` flips a card, ``1``–``4`` selects a multiple-choice option.
*   **DELF Prep** (``/#/exam``): Listening and writing practice in the format of the DELF tout public papers, A1–B2. Listening documents (announcements, voicemails, dialogues, radio segments) are read aloud with a separate voice for each speaker. Exam mode gives the official number of plays; practice mode allows unlimited replays at slower speeds; after answering you get explanations and a transcript you can replay line by line. Writing tasks have the official word minimums, an optional timer, an accent keyboard, a checklist and a model answer. They are marked on the current DELF grid (five criteria, four bands each): by Gemini if you've added a key, or by you otherwise. All tasks are original material written to the official formats; the hub links to France Éducation International's free sample papers for the real thing.
*   **Phrasebook:** Your digital survival kit for when your brain freezes.
*   **Conversation AI:** Practice real scenarios with a Gemini-powered NPC (bring your own API key). The same key enables AI marking of DELF writing.
*   **Dark Mode & Accent Colours:** Six accent presets; preferences persist across sessions.
*   **Smooth Transitions:** Powered by Framer Motion, because learning a language is hard enough without jerky UI.
*   **Fast Loads:** Route-based code splitting + vendor chunk caching keeps the initial bundle small. A themed loading screen (matching your stored dark/accent preference) appears instantly before any JS runs.

The Tech Stack (The "Ingrédients")
==================================

*   **Vite & React 18:** The fast-moving base.
*   **TypeScript:** To prevent us from making *un petit* mistake.
*   **Tailwind CSS v4:** For that *ooh-la-la* aesthetic.
*   **Framer Motion:** Smooth animations for smooth brains.
*   **Zustand:** Keeping track of your progress so you don't have to.
*   **Lucide React:** Pretty icons for pretty people.
*   **Web Speech API:** Pronunciation audio — free, no key required.
*   **Tauri:** Rust-powered native shell for the desktop app builds.

Getting Started
===============

Want to run this locally? *D'accord!*

1.  **Clone it:** You know the drill.
2.  **Install dependencies:**
    .. code-block:: bash

        npm install

3.  **Run the dev server:**
    .. code-block:: bash

        npm run dev

4.  **Visit:** `http://localhost:5173` (unless your port is already busy being cool).

**Optional — live backdrops:** The ambient landing and focus screens look best with real
photos. Create a free `Unsplash developer app <https://unsplash.com/developers>`_ and drop the
access key into a ``.env.local`` file (git-ignored):

.. code-block:: bash

    VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key

Without it the app uses bundled gradient skins — nothing breaks, it just won't pull live
imagery. For the deployed site, add the same value as a repository secret named
``VITE_UNSPLASH_ACCESS_KEY`` (the deploy workflow already reads it).

Running Your Own Classroom
===========================

Teachers can self-host an optional backend to create custom lessons and
quizzes, and track student progress — the main site becomes a thin client
that connects to whichever server you point it at. No Docker, no external
database, just Node.js. See `server/SETUP.md <server/SETUP.md>`_ for a
full guided walkthrough, or `server/README.md <server/README.md>`_ for the
technical reference.

Deployment
==========

To ship this masterpiece to GitHub Pages:

.. code-block:: bash

    npm run deploy

*Bonne chance!* You're going to need it (especially for Unit 11: Grammar Survival Kit).

Desktop App (Tauri)
====================

The same frontend also ships as a native desktop app via `Tauri
<https://tauri.app>`_ — the ``src-tauri/`` Rust shell just loads the built
``dist/`` output in a system webview, so it behaves exactly like the web
app (same HashRouter, same optional self-hosted classroom server over
HTTP, same Web Speech API for pronunciation).

.. code-block:: bash

    npm run tauri dev     # run the desktop app in dev mode
    npm run tauri build   # build an installer for your current OS

**CI builds:** the ``Build Desktop App`` GitHub Actions workflow
(``.github/workflows/tauri-build.yml``) cross-builds installers for macOS
(Apple Silicon + Intel), Windows (x86-64), and Linux (amd64 + arm64) on
every ``v*.*.*`` tag push, or on demand via "Run workflow". Builds are
attached to a draft GitHub Release and also uploaded as workflow
artifacts.

Builds are unsigned by default — macOS shows an "unidentified developer"
prompt and Windows shows a SmartScreen warning, both bypassable by the
user. To enable signing, add these repository secrets and the workflow
picks them up automatically:

*   **macOS** (code signing + notarization): ``APPLE_CERTIFICATE``,
    ``APPLE_CERTIFICATE_PASSWORD``, ``APPLE_SIGNING_IDENTITY``,
    ``APPLE_ID``, ``APPLE_PASSWORD``, ``APPLE_TEAM_ID``,
    ``KEYCHAIN_PASSWORD``.
*   **Windows** (code signing): ``WINDOWS_CERTIFICATE`` (base64-encoded
    ``.pfx``), ``WINDOWS_CERTIFICATE_PASSWORD``.

See `Tauri's code signing docs <https://v2.tauri.app/distribute/sign/>`_
for how to obtain these.
