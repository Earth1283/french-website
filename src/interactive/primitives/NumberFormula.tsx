import type { Role, Sentence, Token } from '../types';
import { frenchText } from '../sentence';
import { roleColor } from '../roles';
import { TooltipBubble, useTooltip } from './Tooltip';

interface NumberFormulaProps {
  sentence: Sentence;
  idPrefix: string;
}

function byRole(sentence: Sentence, role: Role): Token | undefined {
  return sentence.tokens.find(t => t.role === role);
}

function NumberSpan({ id, value, fr, color }: { id: string; value: number; fr: string; color: string }) {
  const { isOpen, anchorProps } = useTooltip(id);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        {...anchorProps}
        className="font-mono font-semibold cursor-help underline decoration-dotted underline-offset-4 focus-visible:outline-none"
        style={{ color, textDecorationColor: `color-mix(in srgb, ${color} 55%, transparent)` }}
      >
        {value}
      </button>
      <TooltipBubble id={id} open={isOpen}>
        <span className="font-semibold" style={{ color }}>{fr}</span>
      </TooltipBubble>
    </span>
  );
}

/** Renders the arithmetic behind a number (e.g. 4 × 20 + 10 = 90), each figure hoverable for its French word. */
export function NumberFormula({ sentence, idPrefix }: NumberFormulaProps) {
  const multiplier = byRole(sentence, 'multiplier');
  const base = byRole(sentence, 'base');
  const addend = byRole(sentence, 'addend');
  if (!base || base.value === undefined) return null;

  const total = (multiplier?.value ?? 1) * base.value + (addend?.value ?? 0);

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap" aria-label="Number breakdown">
      {multiplier && multiplier.value !== undefined && (
        <>
          <NumberSpan id={`${idPrefix}-mult`} value={multiplier.value} fr={multiplier.fr ?? ''} color={roleColor('multiplier')} />
          <span className="text-muted text-sm">×</span>
        </>
      )}
      <NumberSpan id={`${idPrefix}-base`} value={base.value} fr={base.fr ?? ''} color={roleColor('base')} />
      {addend && addend.value !== undefined && (
        <>
          <span className="text-muted text-sm">+</span>
          <NumberSpan id={`${idPrefix}-add`} value={addend.value} fr={addend.fr ?? ''} color={roleColor('addend')} />
        </>
      )}
      <span className="text-muted text-sm">=</span>
      <NumberSpan id={`${idPrefix}-total`} value={total} fr={frenchText(sentence)} color="var(--accent)" />
    </div>
  );
}
