import { useState } from 'react';
import type { Sentence, Token } from '../types';
import { englishOrder, frenchOrder, groupOf } from '../sentence';
import { WordChip } from './WordChip';
import type { Lang } from './WordChip';

interface AlignedSentenceProps {
  sentence: Sentence;
  idPrefix: string;
  calm: boolean;
}

/** English row over French row; inspecting a word lights up its partner in the other row. */
export function AlignedSentence({ sentence, idPrefix, calm }: AlignedSentenceProps) {
  const [inspected, setInspected] = useState<Token | null>(null);
  const group = inspected ? groupOf(inspected) : null;

  const row = (lang: Lang, tokens: Token[]) => (
    <div className="flex items-center gap-3">
      <span className="w-7 flex-shrink-0 text-[0.7rem] font-bold uppercase tracking-wider text-muted">{lang}</span>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map(token => (
          <WordChip
            key={token.id}
            token={token}
            lang={lang}
            tooltipId={`${idPrefix}-${lang}-${token.id}`}
            linked={group !== null && groupOf(token) === group}
            calm={calm}
            onInspect={setInspected}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {row('en', englishOrder(sentence))}
      {row('fr', frenchOrder(sentence))}
    </div>
  );
}
