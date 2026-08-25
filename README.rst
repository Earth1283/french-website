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
*   **Interactive Lessons:** Flashcards, multiple choice, and translation challenges that actually matter.
*   **Unit-Based Learning:** From A1 basics to "Unlocked: The Good Stuff" (slang).
*   **Spaced Repetition Review:** SM-2 algorithm schedules vocab reviews at the optimal moment — 1 day, then 3, then a week, then longer. A review banner on the home screen tells you when cards are due.
*   **Audio Pronunciation:** Tap any 🔊 button to hear French spoken aloud. Available on flashcards, phrasebook, and on answer reveals in exercises. Uses the Web Speech API — no API key, works offline.
*   **Lesson Bookmarks:** Save any lesson for later with the bookmark icon in the lesson header. Bookmarked lessons appear as quick-links on the home screen.
*   **Keyboard Shortcuts:** In lessons — ``←`` / ``→`` navigate flashcards, ``Space`` / ``F`` flips a card, ``1``–``4`` selects a multiple-choice option.
*   **Phrasebook:** Your digital survival kit for when your brain freezes.
*   **Conversation AI:** Practice real scenarios with a Gemini-powered NPC (bring your own API key).
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
