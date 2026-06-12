import type { Lesson } from '../../types';

export const pronunciationLessons: Lesson[] = [
  {
    id: 'pronunciation-1',
    title: 'The Sounds That Will Haunt You',
    subtitle: 'French vowels, the dreaded R, and why "u" sounds like nothing in English.',
    xpReward: 20,
    vocab: [
      {
        french: 'le r',
        english: 'The French R',
        pronunciation: 'ʁ',
        funnyNote: 'Imagine gargling water very gently at the back of your throat. That\'s the French "r". It sounds nothing like the English R. Practice in private first.',
      },
      {
        french: 'tu / du / bu',
        english: 'The French "u" sound',
        pronunciation: 'y',
        funnyNote: 'Say "ee" with your lips in an O shape. This is one of the hardest sounds for English speakers. People will confuse "dessus" (above) and "dessous" (below) if you get it wrong.',
      },
      {
        french: 'eu / feu / deux',
        english: 'The "eu" sound',
        pronunciation: 'ø',
        funnyNote: 'Like "u" but a bit more open. "Deux" (two) sounds very different from "du" — a crucial distinction when ordering bread.',
      },
      {
        french: 'é / été / café',
        english: 'Closed "e" — sharp and bright',
        pronunciation: 'e',
        funnyNote: 'Pure, like the "ay" in "bay" but without the glide. This one is actually easy once you hear it.',
      },
      {
        french: 'è / être / mère',
        english: 'Open "e" — softer and lower',
        pronunciation: 'ɛ',
        funnyNote: 'Like the "e" in "bed". The circumflex (ê) and grave accent (è) both signal this sound.',
      },
      {
        french: 'on / bon / maison',
        english: 'The nasal "on"',
        pronunciation: 'ɔ̃',
        funnyNote: 'The classic French nasal. Air through the nose. "Bon" (good) is your first nasal victory.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'The French "r" is produced where?',
        answer: 'Back of the throat (uvula)',
        options: ['Tip of the tongue', 'Back of the throat (uvula)', 'Lips pressed together', 'Side of the mouth'],
      },
      {
        type: 'multiple-choice',
        prompt: 'The accent on "é" (as in "café") signals which sound?',
        answer: 'Closed "e", like "ay"',
        options: ['Silent letter', 'Closed "e", like "ay"', 'Nasal vowel', 'Open "e", like "bed"'],
      },
      {
        type: 'translation',
        prompt: 'Spell out "Good" in French — the word with the nasal "on" sound.',
        answer: 'Bon',
        hint: 'The nasal bɔ̃ sound',
      },
    ],
  },
  {
    id: 'pronunciation-2',
    title: 'Silent Letters: A French Tradition',
    subtitle: 'Half the letters you see are decorative. Here\'s which ones.',
    xpReward: 20,
    vocab: [
      {
        french: 'Paris / vous / ils',
        english: 'Silent final consonants',
        pronunciation: 'paʁi / vu / il',
        funnyNote: 'Most word-final consonants are silent in French. "Paris" = pah-ree, not pah-ris. "Vous" = voo. "Ils" = eel. The letters sit there looking decorative.',
      },
      {
        french: 'hôtel / heure / homme',
        english: 'H is always silent',
        pronunciation: 'otɛl / œʁ / ɔm',
        funnyNote: 'French H is completely silent, always. So you must elide: l\'hôtel, l\'heure, l\'homme. There\'s a so-called aspirate H (haricot, hibou) that still isn\'t pronounced — it just blocks elision.',
      },
      {
        french: 'vingt / doigt / temps',
        english: 'Tricky silent endings',
        pronunciation: 'vɛ̃ / dwa / tɑ̃',
        funnyNote: '"Vingt" (twenty) has a silent "gt". "Doigt" (finger) is just "dwa". "Temps" (time/weather) is "tɑ̃". French spelling is inherited from Latin; pronunciation moved on without it.',
      },
      {
        french: 'beaucoup / trop / pas',
        english: 'Adverbs with silent finals',
        pronunciation: 'boku / tʁo / pa',
        funnyNote: '"Beaucoup" = bo-koo. The P is silent. "Trop" = tro. Pronouncing the final P is the mark of a beginner. The French will wince.',
      },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'How is "Paris" actually pronounced by French speakers?',
        answer: 'pah-ree',
        options: ['pah-ris', 'pah-ree', 'pair-ee', 'pah-riz'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Which is true about the letter "h" in French?',
        answer: 'It is always silent',
        options: ['It is always aspirated', 'It is always silent', 'It sounds like English H sometimes', 'It only appears in loan words'],
      },
      {
        type: 'translation',
        prompt: 'How do you say "a lot" in French? (the P at the end is silent)',
        answer: 'beaucoup',
        hint: 'bo-koo',
      },
    ],
  },
  {
    id: 'pronunciation-3',
    title: 'Liaison & Elision: Words That Merge',
    subtitle: 'When silent consonants wake up, and vowels vanish. This is what makes French flow.',
    xpReward: 25,
    vocab: [
      {
        french: 'les enfants',
        english: 'The children',
        pronunciation: 'le zɑ̃fɑ̃',
        funnyNote: 'The "s" of "les" comes alive before a vowel: "lez-onfants". This is liaison. It makes French flow like music — or like a river, depending on your progress.',
      },
      {
        french: 'vous avez',
        english: 'You have',
        pronunciation: 'vu zave',
        funnyNote: '"Vous-avez" becomes "voo-zahvay". The Z-liaison is the most common. It happens with: nous, ils, elles, les, des, mes, tes, ses, ces.',
      },
      {
        french: 'un ami',
        english: 'A friend',
        pronunciation: 'œ̃ nami',
        funnyNote: '"Un ami" = "uhn-nami". The N sound carries over. Liaison is mandatory after articles (un, les, des) and pronouns (nous, vous, ils, elles).',
      },
      {
        french: 'la/le → l\'',
        english: 'Elision — the vowel drops',
        pronunciation: '',
        funnyNote: 'Before a vowel, "le" and "la" become "l\'". Le ami → l\'ami. La école → l\'école. The same happens with: je→j\', me→m\', te→t\', se→s\', de→d\', ne→n\', que→qu\'.',
      },
      {
        french: 'du / au / des / aux',
        english: 'Contracted articles',
        pronunciation: 'dy / o / de / o',
        funnyNote: '"de + le" → "du". "à + le" → "au". "de + les" → "des". "à + les" → "aux". You can\'t say "de le" or "à le" — the contraction is mandatory.',
      },
    ],
    exercises: [
      {
        type: 'translation',
        prompt: 'Say "the children" — where does the liaison go?',
        answer: 'les enfants',
        hint: 'The s in les links to the vowel: lez-onfants',
      },
      {
        type: 'multiple-choice',
        prompt: 'Which phrase shows correct elision?',
        answer: 'l\'école',
        options: ['le école', 'la école', 'l\'école', 'les école'],
      },
      {
        type: 'multiple-choice',
        prompt: '"de + le marché" contracts to?',
        answer: 'du marché',
        options: ['de le marché', 'du marché', 'del marché', 'des marché'],
      },
    ],
  },
];
