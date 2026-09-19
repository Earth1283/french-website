import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipState {
  openId: string | null;
  pinnedId: string | null;
  open: (id: string, pin?: boolean) => void;
  close: (id?: string) => void;
}

const TooltipContext = createContext<TooltipState | null>(null);

/** Keeps at most one tooltip open inside it; Esc or a tap elsewhere closes it. */
export function TooltipScope({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const state: TooltipState = {
    openId,
    pinnedId,
    open: (id, pin = false) => {
      setOpenId(id);
      setPinnedId(pin ? id : null);
    },
    close: (id) => {
      if (id && id !== openId) return;
      setOpenId(null);
      setPinnedId(null);
    },
  };

  useEffect(() => {
    if (!openId) return;
    const dismiss = () => { setOpenId(null); setPinnedId(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.(`[data-tooltip-anchor="${openId}"]`)) dismiss();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openId]);

  return <TooltipContext.Provider value={state}>{children}</TooltipContext.Provider>;
}

/** Hover or focus previews the tooltip; a click or tap pins it until tapped again. */
export function useTooltip(id: string) {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('useTooltip must be used inside <TooltipScope>');
  const isOpen = ctx.openId === id;
  const isPinned = ctx.pinnedId === id;

  return {
    isOpen,
    isPinned,
    anchorProps: {
      'data-tooltip-anchor': id,
      'aria-describedby': isOpen ? `${id}-tip` : undefined,
      onPointerEnter: (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && !ctx.pinnedId) ctx.open(id);
      },
      onPointerLeave: (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && !isPinned) ctx.close(id);
      },
      onFocus: () => { if (!isOpen) ctx.open(id); },
      onBlur: () => { if (!isPinned) ctx.close(id); },
      onClick: () => (isPinned ? ctx.close(id) : ctx.open(id, true)),
    },
  };
}

const EDGE_GAP = 8;

export function TooltipBubble({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const naturalLeft = rect.left - shift;
    const naturalRight = rect.right - shift;
    if (naturalLeft < EDGE_GAP) setShift(EDGE_GAP - naturalLeft);
    else if (naturalRight > window.innerWidth - EDGE_GAP) setShift(window.innerWidth - EDGE_GAP - naturalRight);
    else setShift(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={ref}
          className="absolute bottom-full left-1/2 z-30 pb-2 pointer-events-none"
          style={{ transform: `translateX(calc(-50% + ${shift}px))`, width: 'max-content', maxWidth: 240 }}
        >
          <motion.div
            id={`${id}-tip`}
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
            className="rounded-xl px-3 py-2 text-left text-xs leading-snug"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-3)',
            }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
