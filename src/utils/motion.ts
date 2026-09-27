export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = { tap: 0.12, fast: 0.16, base: 0.22, slow: 0.32 } as const;

export const BASE_TRANSITION = { duration: DURATION.base, ease: EASE_OUT } as const;
const EXIT_TRANSITION = { duration: DURATION.fast, ease: EASE_IN } as const;

export const TAP_TRANSITION = { duration: DURATION.tap, ease: EASE_OUT } as const;
export const NO_OVERSHOOT_SPRING = { type: 'spring', stiffness: 520, damping: 46 } as const;
export const REWARD_SPRING = { type: 'spring', stiffness: 380, damping: 22 } as const;
export const FILL_TRANSITION = { duration: DURATION.slow, ease: EASE_OUT } as const;

export const REVEAL = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: EXIT_TRANSITION },
  transition: BASE_TRANSITION,
} as const;

export const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: EXIT_TRANSITION },
  transition: { duration: DURATION.fast, ease: EASE_OUT },
} as const;

export const STEP_FORWARD = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16, transition: EXIT_TRANSITION },
  transition: BASE_TRANSITION,
} as const;

export const COLLAPSE = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: DURATION.base, ease: EASE_IN_OUT },
} as const;

export const ICON_SWAP = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: DURATION.fast, ease: EASE_OUT },
} as const;
