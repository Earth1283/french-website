import { motion } from 'framer-motion';
import { REVEAL } from '../../utils/motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  keyProp: string;
}

// Entrance only — waiting on an exit deadlocks rapid navigation.
export function PageTransition({ children, keyProp }: PageTransitionProps) {
  return (
    <motion.div key={keyProp} initial={REVEAL.initial} animate={REVEAL.animate} transition={REVEAL.transition}>
      {children}
    </motion.div>
  );
}
