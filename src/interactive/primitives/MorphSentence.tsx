import { AnimatePresence } from 'framer-motion';
import type { Sentence } from '../types';
import { englishOrder, frenchOrder } from '../sentence';
import { WordChip } from './WordChip';

interface MorphSentenceProps {
  sentence: Sentence;
  french: boolean;
  idPrefix: string;
  calm: boolean;
}

/** One row of chips that glides from English order into French order. */
export function MorphSentence({ sentence, french, idPrefix, calm }: MorphSentenceProps) {
  const tokens = french ? frenchOrder(sentence) : englishOrder(sentence);
  const focus = new Set(french ? sentence.focus ?? [] : []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 min-h-[3rem]" aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        {tokens.map(token => (
          <WordChip
            key={token.id}
            token={token}
            lang={french ? 'fr' : 'en'}
            tooltipId={`${idPrefix}-morph-${token.id}`}
            spotlight={focus.has(token.id)}
            calm={calm}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
