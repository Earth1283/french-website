import type { VocabItem } from '../types';

/**
 * Curated French proverbs & useful phrases for the ambient landing's
 * "phrase of the day" and the Focus-mode word-of-the-moment.
 * Shaped like {@link VocabItem} so it can reuse the same speak() TTS and
 * `.french-word` styling as flashcards / the phrasebook.
 */
export const PHRASES: VocabItem[] = [
  {
    french: 'Petit à petit, l’oiseau fait son nid.',
    english: 'Little by little, the bird builds its nest.',
    pronunciation: 'puh-tee ah puh-tee, lwah-zoh feh son nee',
    funnyNote: 'The patron saint proverb of language learners.',
  },
  {
    french: 'C’est la vie.',
    english: "That's life.",
    pronunciation: 'seh lah vee',
    funnyNote: 'The all-purpose Gallic shrug, in three syllables.',
  },
  {
    french: 'Qui vivra verra.',
    english: 'Whoever lives, shall see. (Time will tell.)',
    pronunciation: 'kee vee-vrah veh-rah',
  },
  {
    french: 'Vouloir, c’est pouvoir.',
    english: 'To want is to be able. (Where there’s a will, there’s a way.)',
    pronunciation: 'voo-lwahr, seh poo-vwahr',
  },
  {
    french: 'L’habit ne fait pas le moine.',
    english: 'The robe doesn’t make the monk. (Don’t judge a book by its cover.)',
    pronunciation: 'lah-bee nuh feh pah luh mwahn',
  },
  {
    french: 'Mieux vaut tard que jamais.',
    english: 'Better late than never.',
    pronunciation: 'myuh voh tahr kuh zhah-meh',
  },
  {
    french: 'Chaque chose en son temps.',
    english: 'Everything in its own time.',
    pronunciation: 'shahk shohz on son ton',
  },
  {
    french: 'Impossible n’est pas français.',
    english: '“Impossible” is not French.',
    pronunciation: 'an-poh-see-bluh neh pah fron-seh',
    funnyNote: 'Attributed to Napoleon. Very on brand.',
  },
  {
    french: 'Les petits ruisseaux font les grandes rivières.',
    english: 'Little streams make great rivers.',
    pronunciation: 'lay puh-tee rwee-soh fon lay grond ree-vyehr',
  },
  {
    french: 'Il faut tourner sa langue sept fois dans sa bouche.',
    english: 'Turn your tongue seven times in your mouth (think before speaking).',
    pronunciation: 'eel foh toor-nay sah long set fwah don sah boosh',
  },
  {
    french: 'Après la pluie, le beau temps.',
    english: 'After the rain, fine weather.',
    pronunciation: 'ah-preh lah plwee, luh boh ton',
  },
  {
    french: 'Rome ne s’est pas faite en un jour.',
    english: 'Rome wasn’t built in a day.',
    pronunciation: 'rohm nuh seh pah fet on uhn zhoor',
  },
  {
    french: 'Tout est bien qui finit bien.',
    english: 'All’s well that ends well.',
    pronunciation: 'too teh byan kee fee-nee byan',
  },
  {
    french: 'À cœur vaillant rien d’impossible.',
    english: 'For a valiant heart, nothing is impossible.',
    pronunciation: 'ah kuhr vah-yon ryan dan-poh-see-bluh',
  },
  {
    french: 'Bien faire et laisser dire.',
    english: 'Do well and let people talk.',
    pronunciation: 'byan fehr ay leh-say deer',
  },
  {
    french: 'Le temps, c’est de l’argent.',
    english: 'Time is money.',
    pronunciation: 'luh ton, seh duh lahr-zhon',
  },
  {
    french: 'La nuit porte conseil.',
    english: 'The night brings counsel. (Sleep on it.)',
    pronunciation: 'lah nwee port kon-say',
  },
  {
    french: 'Doucement le matin, pas trop vite le soir.',
    english: 'Gently in the morning, not too fast in the evening.',
    pronunciation: 'doos-mon luh mah-tan, pah troh veet luh swahr',
  },
  {
    french: 'On apprend de ses erreurs.',
    english: 'We learn from our mistakes.',
    pronunciation: 'on ah-pron duh say zeh-ruhr',
  },
  {
    french: 'Plus on est de fous, plus on rit.',
    english: 'The more, the merrier.',
    pronunciation: 'plooz on eh duh foo, plooz on ree',
  },
  {
    french: 'Le savoir est une arme.',
    english: 'Knowledge is a weapon.',
    pronunciation: 'luh sah-vwahr eh toon ahrm',
  },
  {
    french: 'Chacun voit midi à sa porte.',
    english: 'Everyone sees noon at their own door. (To each their own.)',
    pronunciation: 'shah-kuhn vwah mee-dee ah sah port',
  },
  {
    french: 'Qui n’avance pas recule.',
    english: 'Who doesn’t move forward, falls behind.',
    pronunciation: 'kee nah-vons pah ruh-kool',
  },
  {
    french: 'Bon courage !',
    english: 'Good luck / hang in there!',
    pronunciation: 'bon koo-rahzh',
    funnyNote: 'What a French friend says when you’re drowning in homework.',
  },
  {
    french: 'Petit pas après petit pas.',
    english: 'One small step after another.',
    pronunciation: 'puh-tee pah ah-preh puh-tee pah',
  },
  {
    french: 'La curiosité est un beau défaut.',
    english: 'Curiosity is a fine flaw.',
    pronunciation: 'lah koo-ree-oh-zee-tay eh tuhn boh day-foh',
  },
  {
    french: 'Qui cherche trouve.',
    english: 'Who seeks, finds.',
    pronunciation: 'kee shersh troov',
  },
  {
    french: 'L’appétit vient en mangeant.',
    english: 'Appetite comes with eating.',
    pronunciation: 'lah-pay-tee vyan on mon-zhon',
    funnyNote: 'Also true of learning — start, and you’ll want more.',
  },
  {
    french: 'Aide-toi, le ciel t’aidera.',
    english: 'Help yourself, and heaven will help you.',
    pronunciation: 'ehd-twah, luh syel teh-duh-rah',
  },
  {
    french: 'Un tiens vaut mieux que deux tu l’auras.',
    english: 'A bird in the hand is worth two in the bush.',
    pronunciation: 'uhn tyan voh myuh kuh duh too loh-rah',
  },
  {
    french: 'Le mieux est l’ennemi du bien.',
    english: 'Perfect is the enemy of good.',
    pronunciation: 'luh myuh eh leh-nuh-mee doo byan',
  },
  {
    french: 'Patience et longueur de temps font plus que force ni que rage.',
    english: 'Patience and time do more than force or rage.',
    pronunciation: 'pah-syons ay lon-guhr duh ton fon ploo kuh fors nee kuh rahzh',
  },
];

/** Whole days since the Unix epoch in the viewer's local timezone. */
function localDayNumber(date: Date): number {
  const ms = date.getTime() - date.getTimezoneOffset() * 60_000;
  return Math.floor(ms / 86_400_000);
}

/**
 * Deterministic "phrase of the day" — stable for a given calendar day,
 * advances once per day. Pass a date for testing; defaults to now.
 */
export function phraseOfDay(date: Date = new Date()): VocabItem {
  const idx = localDayNumber(date) % PHRASES.length;
  return PHRASES[idx];
}

/** A phrase chosen by an arbitrary rotating index (Focus word-of-the-moment). */
export function phraseByTick(tick: number): VocabItem {
  return PHRASES[((tick % PHRASES.length) + PHRASES.length) % PHRASES.length];
}
