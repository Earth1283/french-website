import { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ALL_TABS, activeTab, routeDepth } from './navigation';

export type TransitionDirection = 'forward' | 'back' | 'cut';

const SHIFT_PX = 12;

const variants: Variants = {
  enter: (direction: TransitionDirection) =>
    direction === 'cut' ? { opacity: 1, x: 0 } : { opacity: 0, x: direction === 'forward' ? SHIFT_PX : -SHIFT_PX },
  center: { opacity: 1, x: 0 },
  exit: (direction: TransitionDirection) =>
    direction === 'cut'
      ? { opacity: 1, transition: { duration: 0 } }
      : { opacity: 0, x: direction === 'forward' ? -SHIFT_PX : SHIFT_PX },
};

const DirectionContext = createContext<TransitionDirection>('cut');

export const TransitionDirectionProvider = DirectionContext.Provider;

export function useTransitionDirection(pathname: string): TransitionDirection {
  const previous = useRef(pathname);
  const direction = useRef<TransitionDirection>('cut');

  if (previous.current !== pathname) {
    const fromTab = activeTab(ALL_TABS, previous.current);
    const toTab = activeTab(ALL_TABS, pathname);
    const depthChange = routeDepth(pathname) - routeDepth(previous.current);
    direction.current = fromTab !== toTab || depthChange === 0 ? 'cut' : depthChange > 0 ? 'forward' : 'back';
    previous.current = pathname;
  }

  return direction.current;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const direction = useContext(DirectionContext);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
