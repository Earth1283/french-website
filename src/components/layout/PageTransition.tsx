import { motion } from 'framer-motion';
import { useNavigationType } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  keyProp: string;
}

export function PageTransition({ children, keyProp }: PageTransitionProps) {
  const navType = useNavigationType();
  // POP = back button; everything else (PUSH/REPLACE) = forward
  const x = navType === 'POP' ? -24 : 24;

  return (
    <motion.div
      key={keyProp}
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -x }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
