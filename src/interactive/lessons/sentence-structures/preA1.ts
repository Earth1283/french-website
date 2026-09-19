import type { InteractiveLesson } from '../../types';

export const preA1SentenceStructures: InteractiveLesson = {
  lessonId: 'building-blocks-4',
  scenes: [
    {
      id: 'same-order',
      title: 'Good news: it lines up',
      idea: 'Who + does + what. For simple sentences like these, French keeps the English order word for word — only the words change.',
      sentences: [
        {
          tokens: [
            { id: 'je', role: 'subject', en: 'I', fr: 'Je', note: 'je = I. Only capitalized at the start of a sentence.' },
            { id: 'mange', role: 'verb', en: 'eat', fr: 'mange', note: 'manger → je mange.' },
            { id: 'une', role: 'article', en: 'an', fr: 'une', note: 'Pomme is feminine, so a / an becomes une.' },
            { id: 'pomme', role: 'noun', en: 'apple', fr: 'pomme' },
          ],
        },
        {
          tokens: [
            { id: 'elle', role: 'subject', en: 'She', fr: 'Elle' },
            { id: 'parle', role: 'verb', en: 'speaks', fr: 'parle', note: 'parler → elle parle. The -e ending is silent.' },
            { id: 'francais', role: 'noun', en: 'French', fr: 'français', note: 'Languages are not capitalized in French.' },
          ],
        },
        {
          tokens: [
            { id: 'nous', role: 'subject', en: 'We', fr: 'Nous' },
            { id: 'avons', role: 'verb', en: 'have', fr: 'avons', note: 'avoir → nous avons.' },
            { id: 'un', role: 'article', en: 'a', fr: 'un', note: 'Chien is masculine, so a becomes un.' },
            { id: 'chien', role: 'noun', en: 'dog', fr: 'chien' },
          ],
        },
      ],
      check: {
        tokens: [
          { id: 'tu', role: 'subject', en: 'You', fr: 'Tu' },
          { id: 'aimes', role: 'verb', en: 'like', fr: 'aimes' },
          { id: 'le', role: 'article', en: 'the', fr: 'le' },
          { id: 'chat', role: 'noun', en: 'cat', fr: 'chat' },
        ],
      },
    },
    {
      id: 'colors-after',
      title: 'Colors come after the noun',
      idea: 'English describes first, then names the thing. French names the thing first, then describes it: "a car red".',
      sentences: [
        {
          tokens: [
            { id: 'une', role: 'article', en: 'a', fr: 'une', note: 'Voiture is feminine → une.' },
            { id: 'voiture', role: 'noun', en: 'car', fr: 'voiture' },
            { id: 'rouge', role: 'adjective', en: 'red', fr: 'rouge', note: 'Colors follow the noun: voiture rouge, literally "car red".' },
          ],
          en: ['une', 'rouge', 'voiture'],
          focus: ['rouge'],
        },
        {
          tokens: [
            { id: 'un', role: 'article', en: 'a', fr: 'un' },
            { id: 'chat', role: 'noun', en: 'cat', fr: 'chat' },
            { id: 'noir', role: 'adjective', en: 'black', fr: 'noir', note: 'After the noun. With a feminine noun it gains an -e: une voiture noire.' },
          ],
          en: ['un', 'noir', 'chat'],
          focus: ['noir'],
        },
        {
          tokens: [
            { id: 'la', role: 'article', en: 'the', fr: 'la', note: 'Porte is feminine → la.' },
            { id: 'porte', role: 'noun', en: 'door', fr: 'porte' },
            { id: 'bleue', role: 'adjective', en: 'blue', fr: 'bleue', note: 'bleu + e, because porte is feminine. Adjectives agree with their noun.' },
          ],
          en: ['la', 'bleue', 'porte'],
          focus: ['bleue'],
        },
      ],
      check: {
        tokens: [
          { id: 'une', role: 'article', en: 'a', fr: 'une' },
          { id: 'pomme', role: 'noun', en: 'apple', fr: 'pomme' },
          { id: 'verte', role: 'adjective', en: 'green', fr: 'verte' },
        ],
        en: ['une', 'verte', 'pomme'],
      },
    },
    {
      id: 'negation-sandwich',
      title: 'Negation is a sandwich',
      idea: 'English slips "don\'t" in front of the verb. French wraps the verb instead: ne before it, pas after it.',
      sentences: [
        {
          tokens: [
            { id: 'je', role: 'subject', en: 'I', fr: 'Je' },
            { id: 'dont', role: 'negation', en: 'don\'t', group: 'neg', note: 'English needs the helper "do". French has no helper here — it just wraps the verb.' },
            { id: 'ne', role: 'negation', fr: 'ne', group: 'neg', note: 'ne sits right before the verb — the top slice of the sandwich.' },
            { id: 'mange', role: 'verb', en: 'eat', fr: 'mange' },
            { id: 'pas', role: 'negation', fr: 'pas', group: 'neg', note: 'pas closes the sandwich, right after the verb.' },
          ],
          focus: ['ne', 'pas'],
        },
        {
          tokens: [
            { id: 'il', role: 'subject', en: 'He', fr: 'Il' },
            { id: 'doesnt', role: 'negation', en: 'doesn\'t', group: 'neg', note: 'No French word for this "does" — it disappears.' },
            { id: 'ne', role: 'negation', fr: 'ne', group: 'neg' },
            { id: 'parle', role: 'verb', en: 'speak', fr: 'parle' },
            { id: 'pas', role: 'negation', fr: 'pas', group: 'neg' },
            { id: 'anglais', role: 'noun', en: 'English', fr: 'anglais', note: 'The rest of the sentence waits outside the sandwich.' },
          ],
          focus: ['ne', 'pas'],
        },
        {
          tokens: [
            { id: 'nous', role: 'subject', en: 'We', fr: 'Nous' },
            { id: 'ne', role: 'negation', fr: 'ne', group: 'neg', note: 'The only new word: ne in front of the verb.' },
            { id: 'sommes', role: 'verb', en: 'are', fr: 'sommes', note: 'être → nous sommes.' },
            { id: 'pas', role: 'negation', en: 'not', fr: 'pas', group: 'neg', note: 'With "to be", English already puts not after the verb — pas takes the same spot.' },
            { id: 'fatigues', role: 'adjective', en: 'tired', fr: 'fatigués', note: 'fatigué + s, because nous is plural.' },
          ],
          focus: ['ne'],
        },
      ],
      check: {
        tokens: [
          { id: 'tu', role: 'subject', en: 'You', fr: 'Tu' },
          { id: 'dont', role: 'negation', en: 'don\'t' },
          { id: 'ne', role: 'negation', fr: 'ne' },
          { id: 'danses', role: 'verb', en: 'dance', fr: 'danses' },
          { id: 'pas', role: 'negation', fr: 'pas' },
        ],
      },
    },
  ],
};
