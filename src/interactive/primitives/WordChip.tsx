import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Token } from '../types';
import { ROLES, roleColor } from '../roles';
import { TooltipBubble, useTooltip } from './Tooltip';

export type Lang = 'en' | 'fr';

interface WordChipProps {
  token: Token;
  lang: Lang;
  tooltipId: string;
  /** Spotlight: pulses once and keeps a ring. */
  spotlight?: boolean;
  /** Lit up because a linked word elsewhere is being inspected. */
  linked?: boolean;
  calm?: boolean;
  onInspect?: (token: Token | null) => void;
}

export const WordChip = forwardRef<HTMLSpanElement, WordChipProps>(function WordChip(
  { token, lang, tooltipId, spotlight, linked, calm, onInspect },
  ref,
) {
  const { isOpen, isPinned, anchorProps } = useTooltip(tooltipId);
  const color = roleColor(token.role);
  const text = lang === 'en' ? token.en : token.fr;
  const counterpart = lang === 'en' ? token.fr : token.en;
  const lit = spotlight || linked || isOpen;

  return (
    <motion.span
      ref={ref}
      layout={calm ? false : 'position'}
      initial={calm ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={calm ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="relative inline-flex"
    >
      <button
        type="button"
        {...anchorProps}
        onPointerEnter={(e) => { anchorProps.onPointerEnter(e); onInspect?.(token); }}
        onPointerLeave={(e) => { anchorProps.onPointerLeave(e); if (e.pointerType === 'mouse') onInspect?.(null); }}
        onFocus={() => { anchorProps.onFocus(); onInspect?.(token); }}
        onBlur={() => { anchorProps.onBlur(); onInspect?.(null); }}
        onClick={() => { anchorProps.onClick(); onInspect?.(isPinned ? null : token); }}
        className={`rounded-lg px-2.5 py-1 text-base sm:text-lg font-semibold cursor-help transition-[background-color,box-shadow] duration-150 focus-visible:outline-none ${spotlight && !calm ? 'role-pulse' : ''}`}
        style={{
          ['--pulse-color' as string]: color,
          color: 'var(--text-primary)',
          backgroundColor: `color-mix(in srgb, ${color} ${lit ? 24 : 11}%, var(--bg-card))`,
          border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
          borderBottom: `3px solid ${color}`,
          boxShadow: spotlight || isOpen ? `0 0 0 2.5px color-mix(in srgb, ${color} 45%, transparent)` : undefined,
        }}
      >
        {text}
      </button>
      <TooltipBubble id={tooltipId} open={isOpen}>
        <span className="block font-semibold text-[0.7rem] uppercase tracking-wider mb-0.5" style={{ color }}>
          {ROLES[token.role].label}
          <span className="normal-case tracking-normal font-medium" style={{ color: 'var(--text-muted)' }}>
            {' · '}
            {counterpart
              ? `${lang === 'en' ? 'FR' : 'EN'}: ${counterpart}`
              : lang === 'en' ? 'no French word' : 'no English word'}
          </span>
        </span>
        {token.note ?? ROLES[token.role].hint}
      </TooltipBubble>
    </motion.span>
  );
});
