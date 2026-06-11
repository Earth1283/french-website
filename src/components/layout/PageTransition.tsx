import { motion } from 'framer-motion';
import { useNavigationType } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  keyProp: string;
}

// iOS push/pop: forward navigations slide in from the right with a spring,
// back navigations from the left; the outgoing page recedes slightly.
export function PageTransition({ children, keyProp }: PageTransitionProps) {
  const navType = useNavigationType();
  const x = navType === 'POP' ? -32 : 32;

  return (
    <motion.div
      key={keyProp}
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -x / 2, scale: 0.99 }}
      transition={{ type: 'spring', damping: 26, stiffness: 280, mass: 0.9 }}
    >
      {children}
    </motion.div>
  );
}
